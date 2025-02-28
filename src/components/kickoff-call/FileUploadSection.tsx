
import { Loader2, Upload } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { useState } from "react";

interface FileUploadSectionProps {
  onFileUpload: (filePath: string, fileName: string, text: string) => void;
  isProcessing: boolean;
}

export const FileUploadSection = ({ onFileUpload, isProcessing }: FileUploadSectionProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{fileName: string, status: string} | null>(null);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);

    const acceptedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain'
    ];

    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        throw new Error("Authentication required");
      }

      if (!session?.user?.id) {
        throw new Error("No authenticated user found");
      }

      for (const file of Array.from(files)) {
        if (!acceptedTypes.includes(file.type)) {
          toast.error(`Invalid file type: ${file.name}. Only PDF, DOC, DOCX, and TXT files are accepted.`);
          continue;
        }

        if (file.size > 10 * 1024 * 1024) {
          toast.error(`File too large: ${file.name}. Maximum size is 10MB.`);
          continue;
        }

        // Create a unique ID for this upload in the toast system
        const toastId = `upload-${Date.now()}-${file.name}`;
        
        // Show initial toast for file upload
        toast.loading(`Uploading ${file.name}...`, { id: toastId });
        
        setUploadProgress({
          fileName: file.name,
          status: "Uploading file..."
        });

        const formData = new FormData();
        formData.append('file', file);
        formData.append('userId', session.user.id);

        // Update progress status
        setUploadProgress({
          fileName: file.name,
          status: "Processing with Gemini..."
        });
        
        // Update toast to show processing status
        toast.loading(`Processing ${file.name} with Gemini...`, { id: toastId });
        
        const { data, error } = await supabase.functions.invoke('parse-document', {
          body: formData,
        });

        if (error) {
          toast.error(`Failed to process ${file.name}: ${error.message}`, { id: toastId });
          continue;
        }

        if (data?.text) {
          // Store the file summary
          const { error: summaryError } = await supabase
            .from('kickoff_summaries')
            .insert({
              content: data.text,
              source: `file:${file.name}`,
              user_id: session.user.id
            });

          if (summaryError) {
            console.error('Error storing summary:', summaryError);
            toast.error(`Failed to store summary for ${file.name}`, { id: toastId });
            continue;
          }

          onFileUpload(data.filePath, file.name, data.text);
          
          // Update toast to show success
          toast.success(`Successfully processed ${file.name}`, { 
            id: toastId,
            className: "animate-fade-in",
          });
        } else {
          toast.error(`No text content extracted from ${file.name}`, { id: toastId });
        }
      }
    } catch (error) {
      console.error('Error processing files:', error);
      toast.error("Failed to process files. Please try again.");
    } finally {
      setIsUploading(false);
      setUploadProgress(null);
      if (event.target) event.target.value = '';
    }
  };

  const showProcessing = isProcessing || isUploading;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <input
          type="file"
          onChange={handleFileUpload}
          className="hidden"
          id="file-upload"
          multiple
          accept=".pdf,.doc,.docx,.txt"
          disabled={showProcessing}
        />
        <label
          htmlFor="file-upload"
          className={cn(
            "flex items-center gap-2 px-4 py-2 bg-white border-2 border-black rounded font-bold",
            "shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-0.5 hover:translate-x-0.5",
            "hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all cursor-pointer",
            "animate-in fade-in duration-300",
            showProcessing && "opacity-50 cursor-not-allowed"
          )}
        >
          {showProcessing ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Upload className="h-4 w-4" />
          )}
          {showProcessing ? 'Processing...' : 'Upload Files'}
        </label>
        <span className="text-sm text-gray-500">
          {showProcessing ? (
            <div className="flex items-center gap-2">
              <span className="animate-pulse">Processing your files</span>
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
              </div>
            </div>
          ) : (
            'Accepts PDF, DOC, DOCX, TXT (max 10MB each)'
          )}
        </span>
      </div>

      {uploadProgress && (
        <div className="mt-2 p-3 border-2 border-blue-400 bg-blue-50 rounded-md">
          <div className="flex items-center gap-2">
            <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />
            <div>
              <p className="font-medium text-blue-700">{uploadProgress.fileName}</p>
              <p className="text-sm text-blue-600">{uploadProgress.status}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
