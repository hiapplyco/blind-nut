
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { FileText, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const KickOffCall = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [textInput, setTextInput] = useState("");
  const [title, setTitle] = useState("");
  const [filePaths, setFilePaths] = useState<string[]>([]);
  const [uploadedFiles, setUploadedFiles] = useState<{ name: string; path: string }[]>([]);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    setIsProcessing(true);
    const acceptedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain'
    ];

    try {
      for (const file of Array.from(files)) {
        if (!acceptedTypes.includes(file.type)) {
          toast.error(`Invalid file type: ${file.name}. Only PDF, DOC, DOCX, and TXT files are accepted.`);
          continue;
        }

        if (file.size > 10 * 1024 * 1024) { // 10MB limit
          toast.error(`File too large: ${file.name}. Maximum size is 10MB.`);
          continue;
        }

        const formData = new FormData();
        formData.append('file', file);

        const { data, error } = await supabase.functions.invoke('parse-document', {
          body: formData,
        });

        if (error) {
          toast.error(`Failed to process ${file.name}: ${error.message}`);
          continue;
        }

        if (data?.text) {
          setTextInput(prev => prev + (prev ? '\n\n' : '') + data.text);
          setUploadedFiles(prev => [...prev, { name: file.name, path: data.filePath }]);
          setFilePaths(prev => [...prev, data.filePath]);
          toast.success(`Successfully processed ${file.name}`);
        }
      }
    } catch (error) {
      console.error('Error processing files:', error);
      toast.error("Failed to process files. Please try again.");
    } finally {
      setIsProcessing(false);
      if (event.target) event.target.value = '';
    }
  };

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
    setFilePaths(prev => prev.filter((_, i) => i !== index));
    toast.success("File removed");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!textInput.trim() || !title.trim()) {
      toast.error("Please enter both a title and content");
      return;
    }

    setIsProcessing(true);

    try {
      const { data: result, error: processingError } = await supabase.functions.invoke('process-kickoff-call', {
        body: {
          text: textInput,
          title,
          filePaths,
        },
      });

      if (processingError) throw processingError;

      toast.success("Successfully processed kickoff call information!");

      // Reset form
      setTextInput("");
      setTitle("");
      setFilePaths([]);
      setUploadedFiles([]);

      // Navigate to dashboard with the new call ID
      navigate(`/dashboard?callId=${result.id}`);

    } catch (error) {
      console.error('Error processing kickoff call:', error);
      toast.error("Failed to process kickoff call. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="container max-w-4xl py-8 space-y-8">
      <Card className="p-6 border-4 border-black bg-[#FFFBF4] shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
        <h1 className="text-3xl font-bold mb-4 bg-gradient-to-r from-[#8B5CF6] via-[#9B87F5] to-[#A18472] bg-clip-text text-transparent">
          Recruiting Kick Off Call
        </h1>
        <p className="text-gray-600 mb-6">
          Upload documents, paste text, or type directly to get AI-powered insights for your recruiting kickoff call.
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label htmlFor="title" className="text-lg font-bold block">
              Title
            </label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter a title for this kickoff call"
              className="w-full p-4 border-4 border-black rounded bg-white 
                shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] font-medium focus:ring-0 focus:border-black"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="content" className="text-lg font-bold block">
              Notes or Paste Content
            </label>
            <textarea
              id="content"
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              placeholder="Enter notes, requirements, or paste content here"
              className="w-full min-h-[200px] p-4 border-4 border-black rounded bg-white resize-none 
                shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] font-medium focus:ring-0 focus:border-black"
            />
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <input
                type="file"
                onChange={handleFileUpload}
                className="hidden"
                id="file-upload"
                multiple
                accept=".pdf,.doc,.docx,.txt"
              />
              <label
                htmlFor="file-upload"
                className="flex items-center gap-2 px-4 py-2 bg-white border-2 border-black rounded font-bold 
                  shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-0.5 hover:translate-x-0.5 
                  hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all cursor-pointer"
              >
                <FileText className="h-4 w-4" />
                Upload Files
              </label>
              <span className="text-sm text-gray-500">
                Accepts PDF, DOC, DOCX, TXT (max 10MB each)
              </span>
            </div>

            {uploadedFiles.length > 0 && (
              <div className="space-y-2">
                <h3 className="font-bold">Uploaded Files:</h3>
                <div className="space-y-2">
                  {uploadedFiles.map((file, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-2 bg-white border-2 border-black rounded"
                    >
                      <span>{file.name}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={() => removeFile(index)}
                        className="p-1 hover:bg-red-100"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <Button
            type="submit"
            className="w-full bg-[#8B5CF6] text-white py-4 rounded font-bold text-lg border-4 
              border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:translate-y-1 
              hover:translate-x-1 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all
              disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isProcessing || !textInput.trim() || !title.trim()}
          >
            {isProcessing ? 'Processing...' : 'Process Kickoff Call'}
          </Button>
        </form>
      </Card>
    </div>
  );
};

export default KickOffCall;
