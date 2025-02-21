
import { supabase } from "@/integrations/supabase/client";

interface ErrorResponse {
  success: false;
  error: string;
}

interface CrawlStatusResponse {
  success: true;
  text: string;
  rawContent?: string;
}

type CrawlResponse = CrawlStatusResponse | ErrorResponse;

export class FirecrawlService {
  static async crawlWebsite(url: string): Promise<{ success: boolean; error?: string; data?: any }> {
    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !session) {
        console.error('Authentication error:', sessionError);
        return { success: false, error: 'Authentication required' };
      }

      console.log('Making request to firecrawl-url function with URL:', url);
      const { data: response, error: functionError } = await supabase.functions.invoke<CrawlResponse>('firecrawl-url', {
        body: { url }
      });

      if (functionError) {
        console.error('Error calling Firecrawl:', functionError);
        return { success: false, error: functionError.message };
      }

      console.log('Received response from firecrawl-url function:', response);

      if (!response) {
        return { success: false, error: 'No response received from server' };
      }

      // Type guard to handle the error case
      if ('error' in response && !response.success) {
        return { success: false, error: response.error };
      }

      // Store the crawl summary
      const { error: summaryError } = await supabase
        .from('kickoff_summaries')
        .insert({
          content: response.text,
          source: `url:${url}`,
          user_id: session.user.id
        });

      if (summaryError) {
        console.error('Error storing summary:', summaryError);
      }

      return { 
        success: true, 
        data: { 
          text: response.text,
          rawContent: response.rawContent 
        } 
      };
    } catch (error) {
      console.error('Error during crawl:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to connect to Firecrawl API' 
      };
    }
  }
}
