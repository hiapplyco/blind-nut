
import { supabase } from "@/integrations/supabase/client";

interface ErrorResponse {
  success: false;
  error: string;
}

interface CrawlStatusResponse {
  success: true;
  status: string;
  completed: number;
  total: number;
  creditsUsed: number;
  expiresAt: string;
  data: any[];
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
      const { data, error: functionError } = await supabase.functions.invoke('firecrawl-url', {
        body: { url }
      });

      if (functionError) {
        console.error('Error calling Firecrawl:', functionError);
        return { success: false, error: functionError.message };
      }

      console.log('Received response from firecrawl-url function:', data);

      if (!data || !data.success) {
        const errorMessage = data?.error || 'Failed to crawl website';
        console.error('Crawl failed:', errorMessage);
        return { success: false, error: errorMessage };
      }

      // Store the crawl summary
      const { error: summaryError } = await supabase
        .from('kickoff_summaries')
        .insert({
          content: data.text,
          source: `url:${url}`,
          user_id: session.user.id
        });

      if (summaryError) {
        console.error('Error storing summary:', summaryError);
      }

      return { success: true, data: data.text };
    } catch (error) {
      console.error('Error during crawl:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to connect to Firecrawl API' 
      };
    }
  }
}
