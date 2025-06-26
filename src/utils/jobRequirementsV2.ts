import { supabase } from "@/integrations/supabase/client";
import { SearchType } from "@/components/search/types";

interface ProcessJobResponse {
  success: boolean;
  searchString: string;
  jobId?: string;
  workflowResults?: any;
  usingNewSystem?: boolean;
  error?: string;
}

export const processJobRequirementsV2 = async (
  content: string,
  searchType: SearchType,
  companyName?: string,
  userId?: string | null,
  source?: 'default' | 'clarvida'
): Promise<ProcessJobResponse> => {
  try {
    console.log(`Processing job requirements V2 with searchType: ${searchType}, companyName: ${companyName}, source: ${source}`);
    
    // First try the new V2 endpoint
    try {
      const { data, error } = await supabase.functions.invoke('process-job-requirements-v2', {
        body: { 
          content, 
          searchType, 
          companyName, 
          userId, 
          source 
        }
      });

      if (!error && data?.usingNewSystem) {
        console.log('Successfully used new orchestration system');
        return data;
      }
    } catch (v2Error) {
      console.log('V2 endpoint not available, falling back to V1');
    }
    
    // Fallback to original endpoint
    const { data, error } = await supabase.functions.invoke('process-job-requirements', {
      body: { 
        content, 
        searchType, 
        companyName, 
        userId, 
        source 
      }
    });

    if (error) {
      console.error('Error from process-job-requirements:', error);
      throw error;
    }
    
    // Transform old response to match new format
    return {
      success: true,
      searchString: data.searchString || data.data?.searchString || '',
      jobId: data.jobId || data.data?.jobId,
      usingNewSystem: false
    };
    
  } catch (error) {
    console.error('Error processing job requirements:', error);
    return {
      success: false,
      searchString: '',
      error: error.message || 'Failed to process job requirements'
    };
  }
};

// Helper to check if new system is available
export const checkOrchestrationStatus = async (): Promise<boolean> => {
  try {
    const { data } = await supabase.functions.invoke('test-orchestration', {
      body: { test_type: 'health_check' }
    });
    return data?.orchestrationEnabled === true;
  } catch {
    return false;
  }
};