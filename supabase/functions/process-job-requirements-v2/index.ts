import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createRecruitmentOrchestrator } from "../_shared/orchestration/index.ts";
import { WorkflowTemplates } from "../_shared/orchestration/WorkflowDefinition.ts";
import { featureFlags } from "../_shared/config/deployment.config.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { content, searchType, companyName, userId, source } = await req.json();
    
    // Check feature flags
    const useNewSystem = featureFlags.isEnabled('USE_ENHANCED_AGENTS', userId);
    
    if (!useNewSystem) {
      // Fallback to old implementation
      const oldFunction = await import("../process-job-requirements/index.ts");
      return oldFunction.default(req);
    }
    
    // Use new orchestration system
    const orchestrator = createRecruitmentOrchestrator({
      googleApiKey: Deno.env.get('GEMINI_API_KEY')!,
      nymeriaApiKey: Deno.env.get('NYMERIA_API_KEY')
    });
    
    // Generate boolean search using the new agent
    const booleanResult = await orchestrator.runSingleAgent('BooleanSearchAgent', {
      requirements: content,
      complexity: searchType === 'deep' ? 'complex' : 'medium',
      platform: 'LinkedIn'
    });
    
    // If source is clarvida, run additional workflow
    if (source === 'clarvida') {
      const workflowResult = await orchestrator.runWorkflow(
        WorkflowTemplates.candidateSourcing,
        { requirements: content }
      );
      
      return new Response(
        JSON.stringify({
          success: true,
          searchString: booleanResult,
          workflowResults: workflowResult,
          usingNewSystem: true
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Store in database if needed
    if (userId) {
      const { supabaseClient } = await import("../_shared/supabase-client.ts");
      const { data: jobData, error: jobError } = await supabaseClient
        .from('jobs')
        .insert({
          user_id: userId,
          job_requirements: content,
          generated_search_string: booleanResult,
          source: source || 'default',
          search_type: searchType
        })
        .select()
        .single();
        
      if (jobError) throw jobError;
      
      return new Response(
        JSON.stringify({
          success: true,
          searchString: booleanResult,
          jobId: jobData.id,
          usingNewSystem: true
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    return new Response(
      JSON.stringify({
        success: true,
        searchString: booleanResult,
        usingNewSystem: true
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
    
  } catch (error) {
    console.error('Error in process-job-requirements-v2:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        usingNewSystem: true
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});