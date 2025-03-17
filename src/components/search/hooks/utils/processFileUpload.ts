
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export const processFileUpload = async (
  file: File,
  userId: string | null,
  setSearchText: (text: string) => void,
  setIsProcessing: (isProcessing: boolean) => void
) => {
  if (!file) return;

  if (!file.type.includes('pdf') && !file.type.includes('image')) {
    toast.error("Invalid file type. Please upload a PDF file or an image");
    return;
  }

  setIsProcessing(true);
  const formData = new FormData();
  formData.append('file', file);
  formData.append('userId', userId || '');

  try {
    const { data, error } = await supabase.functions.invoke('parse-document', {
      body: formData,
    });

    if (error) throw error;

    if (data?.text) {
      setSearchText(data.text);
      toast.success("File processed successfully. The content has been extracted and added to the input field.");
    }
  } catch (error) {
    console.error('Error processing file:', error);
    toast.error("Failed to process the file. Please try again.");
  } finally {
    setIsProcessing(false);
  }
};
