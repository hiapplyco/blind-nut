
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createRecruitmentOrchestrator, WorkflowTemplates } from "../_shared/orchestration/index.ts";

serve(async (req) => {
  try {
    const { test_type = 'single', ...params } = await req.json();
    
    const orchestrator = createRecruitmentOrchestrator({
      googleApiKey: Deno.env.get('GOOGLE_API_KEY')!,
      nymeriaApiKey: Deno.env.get('NYMERIA_API_KEY'),
      debug: true
    });

    let result;

    switch (test_type) {
      case 'single':
        // Test single agent
        result = await orchestrator.runSingleAgent('BooleanSearchAgent', {
          requirements: params.requirements || 'Senior Software Engineer',
          complexity: params.complexity || 'medium',
          platform: 'LinkedIn'
        });
        break;

      case 'workflow':
        // Test workflow
        result = await orchestrator.runWorkflow(
          WorkflowTemplates.candidateSourcing,
          {
            requirements: params.requirements || 'Full Stack Developer in NYC'
          }
        );
        break;

      case 'parallel':
        // Test parallel execution
        result = await orchestrator.runParallelAgents([
          {
            agentName: 'TaskAgent',
            params: { task: 'List top skills for a DevOps engineer' }
          },
          {
            agentName: 'TaskAgent',
            params: { task: 'List top skills for a Data Scientist' }
          }
        ]);
        break;

      default:
        throw new Error('Invalid test_type. Use: single, workflow, or parallel');
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        test_type,
        result 
      }),
      { 
        headers: { "Content-Type": "application/json" },
        status: 200 
      }
    );

  } catch (error) {
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      { 
        headers: { "Content-Type": "application/json" },
        status: 500 
      }
    );
  }
});
