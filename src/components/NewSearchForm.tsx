import { useState } from "react";
import { SearchForm } from "./search/SearchForm";
import { ProcessAgent } from "./search/ProcessAgent";
import { ResultsGrid } from "./search/ResultsGrid";

interface NewSearchFormProps {
  userId: string;
}

const NewSearchForm = ({ userId }: NewSearchFormProps) => {
  const [currentJobId, setCurrentJobId] = useState<number | null>(null);
  const [isProcessingComplete, setIsProcessingComplete] = useState(false);
  const [searchText, setSearchText] = useState("");

  const handleSearchSubmit = (text: string, jobId: number) => {
    setSearchText(text);
    setCurrentJobId(jobId);
    setIsProcessingComplete(false); // Reset processing state when new search starts
  };

  return (
    <div className="space-y-6">
      <SearchForm 
        userId={userId} 
        onJobCreated={(jobId, text) => handleSearchSubmit(text, jobId)} 
      />
      
      {currentJobId && !isProcessingComplete && (
        <ProcessAgent
          content={searchText}
          jobId={currentJobId}
          onComplete={() => setIsProcessingComplete(true)}
        />
      )}

      <ResultsGrid 
        jobId={currentJobId} 
        isProcessingComplete={isProcessingComplete} 
      />
    </div>
  );
};

export default NewSearchForm;