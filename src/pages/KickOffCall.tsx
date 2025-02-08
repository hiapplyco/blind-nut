
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { KickoffForm } from "@/components/kickoff-call/KickoffForm";
import { FileUploadSection } from "@/components/kickoff-call/FileUploadSection";
import { FileList } from "@/components/kickoff-call/FileList";

const KickOffCall = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [filePaths, setFilePaths] = useState<string[]>([]);
  const [uploadedFiles, setUploadedFiles] = useState<{ name: string; path: string }[]>([]);

  const handleFileUpload = (filePath: string, fileName: string, text: string) => {
    setUploadedFiles(prev => [...prev, { name: fileName, path: filePath }]);
    setFilePaths(prev => [...prev, filePath]);
  };

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
    setFilePaths(prev => prev.filter((_, i) => i !== index));
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

        <div className="space-y-6">
          <FileUploadSection 
            onFileUpload={handleFileUpload}
            isProcessing={isProcessing}
          />
          
          <FileList 
            files={uploadedFiles}
            onRemove={removeFile}
          />

          <KickoffForm 
            isProcessing={isProcessing}
            filePaths={filePaths}
          />
        </div>
      </Card>
    </div>
  );
};

export default KickOffCall;
