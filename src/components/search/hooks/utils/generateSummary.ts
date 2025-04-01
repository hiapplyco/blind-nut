
import { supabase } from "@/integrations/supabase/client";

export const generateSummary = async (content: string) => {
  if (!content?.trim()) {
    throw new Error('Content is required');
  }

  try {
    console.log('Generating summary for content...');
    const { data, error } = await supabase.functions.invoke('summarize-title', {
      body: { content }
    });

    if (error) {
      console.error('Error from summarize-title function:', error);
      throw error;
    }

    console.log('Summary generated successfully:', data);
    return {
      title: data?.title || 'Untitled Search',
      summary: data?.summary || ''
    };
  } catch (error) {
    console.error('Error generating summary:', error);
    // Return default values for testing/demo purposes when API fails
    return {
      title: 'Untitled Search',
      summary: 'No summary available'
    };
  }
};
