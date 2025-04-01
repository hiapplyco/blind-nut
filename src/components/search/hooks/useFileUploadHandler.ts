
import { useCallback } from "react";
import { processFileUpload } from "./utils/processFileUpload";

/**
 * Hook for handling file uploads in search form
 */
export const useFileUploadHandler = (
  userId: string | null,
  setSearchText: (text: string) => void,
  setIsProcessing: (isProcessing: boolean) => void
) => {
  const handleFileUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      await processFileUpload(file, userId, setSearchText, setIsProcessing);
    }
  }, [userId, setSearchText, setIsProcessing]);

  return handleFileUpload;
};
