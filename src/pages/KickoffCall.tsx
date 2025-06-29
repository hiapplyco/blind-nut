
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { KickoffForm } from "@/components/kickoff-call/KickoffForm";
import { FileUploadSection } from "@/components/kickoff-call/FileUploadSection";
import { FileList } from "@/components/kickoff-call/FileList";
import { SummaryCard } from "@/components/kickoff-call/SummaryCard";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { ProjectSelector } from "@/components/project/ProjectSelector";

interface Summary {
  id: string;
  title: string;
  content: string;
  source: string;
}

const KickOffCall = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [filePaths, setFilePaths] = useState<string[]>([]);
  const [uploadedFiles, setUploadedFiles] = useState<{ name: string; path: string }[]>([]);
  const [summaries, setSummaries] = useState<Summary[]>([]);
  const [title, setTitle] = useState("");

  const handleFileUpload = (filePath: string, fileName: string, text: string) => {
    setUploadedFiles(prev => [...prev, { name: fileName, path: filePath }]);
    setFilePaths(prev => [...prev, filePath]);
    
    // Add summary card for the uploaded file
    setSummaries(prev => [...prev, {
      id: filePath,
      title: fileName,
      content: text.length > 200 ? text.substring(0, 200) + "..." : text,
      source: `File: ${fileName}`
    }]);
    
    // Suggest a title if none is set
    if (!title.trim()) {
      const suggestedTitle = `Kickoff Call - ${fileName.split('.')[0]}`;
      setTitle(suggestedTitle);
      toast.info(`Title set to "${suggestedTitle}"`);
    }
  };

  const removeFile = (index: number) => {
    const removedFile = uploadedFiles[index];
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
    setFilePaths(prev => prev.filter((_, i) => i !== index));
    setSummaries(prev => prev.filter(s => s.id !== removedFile.path));
    
    toast.info(`Removed file: ${removedFile.name}`);
  };

  const removeSummary = (id: string) => {
    setSummaries(prev => prev.filter(s => s.id !== id));
    const fileIndex = uploadedFiles.findIndex(f => f.path === id);
    if (fileIndex !== -1) {
      removeFile(fileIndex);
    }
  };

  return (
    <div className="container max-w-4xl py-8 space-y-8">
      {/* Project selector */}
      <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
        <ProjectSelector 
          label="Select project for this kickoff call"
          placeholder="Choose a project (optional)"
          className="max-w-md"
        />
      </div>

      <Card className="p-6 border-4 border-black bg-[#FFFBF4] shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
        <h1 className="text-3xl font-bold mb-4 bg-gradient-to-r from-[#8B5CF6] via-[#9B87F5] to-[#A18472] bg-clip-text text-transparent">
          Recruiting Kick Off Call
        </h1>

        <div className="space-y-6">
          <div className="space-y-2">
            <label htmlFor="title" className="text-lg font-bold block">
              Title
            </label>
            <Input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter a title for this kickoff call"
              className="w-full p-4 border-4 border-black rounded bg-white 
                shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] font-medium focus:ring-0 focus:border-black
                transition-all duration-200 hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]
                hover:translate-x-[2px] hover:translate-y-[2px]"
            />
          </div>

          <FileUploadSection 
            onFileUpload={handleFileUpload}
            isProcessing={isProcessing}
          />
          
          <FileList 
            files={uploadedFiles}
            onRemove={removeFile}
          />

          {summaries.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold">Content Summaries</h2>
              <div className="grid gap-4">
                {summaries.map((summary) => (
                  <SummaryCard
                    key={summary.id}
                    title={summary.title}
                    content={summary.content}
                    source={summary.source}
                    onRemove={() => removeSummary(summary.id)}
                  />
                ))}
              </div>
            </div>
          )}

          <KickoffForm 
            isProcessing={isProcessing}
            filePaths={filePaths}
            title={title}
            onTitleChange={setTitle}
          />
        </div>
      </Card>
    </div>
  );
};

export default KickOffCall;
