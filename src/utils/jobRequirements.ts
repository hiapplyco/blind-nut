import { supabase } from "@/integrations/supabase/client";

export const processJobRequirements = async (content: string, searchType: "candidates" | "companies") => {
  try {
    const { data, error } = await supabase.functions.invoke('process-job-requirements', {
      body: { content, searchType }
    });

    if (error) throw error;

    // Open new tab with Google search
    const searchString = encodeURIComponent(data.searchString);
    window.open(`https://www.google.com/search?q=${searchString}`, '_blank');

    return data;
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
};

export const handleDocumentUpload = async (file: File) => {
  try {
    const formData = new FormData();
    formData.append('file', file);

    const { data, error } = await supabase.functions.invoke('parse-document', {
      body: formData
    });

    if (error) throw error;

    return data.text;
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
};