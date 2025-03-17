
import { supabase } from "@/integrations/supabase/client";

export const generateSummary = async (content: string) => {
  if (!content?.trim()) {
    throw new Error('Content is required');
  }

  try {
    const { data, error } = await supabase.functions.invoke('summarize-title', {
      body: { content }
    });

    if (error) throw error;

    return {
      title: data?.title || 'Untitled Search',
      summary: data?.summary || ''
    };
  } catch (error) {
    console.error('Error generating summary:', error);
    throw error;
  }
};
