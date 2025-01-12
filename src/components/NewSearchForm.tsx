import { useState, useEffect } from "react";
import { SearchForm } from "./search/SearchForm";
import { ProcessAgent } from "./search/ProcessAgent";
import { ResultsGrid } from "./search/ResultsGrid";
import { toast } from "sonner";
import { ViewReportButton } from "./search/ViewReportButton";

interface NewSearchFormProps {
  userId: string;
}

const NewSearchForm = ({ userId }: NewSearchFormProps) => {
  const [currentJobId, setCurrentJobId] = useState<number | null>(null);
  const [isProcessingComplete, setIsProcessingComplete] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [showResults, setShowResults] = useState(false);

  const handleSearchSubmit = (text: string, jobId: number) => {
    setSearchText(text);
    setCurrentJobId(jobId);
    setIsProcessingComplete(false);
    setShowResults(false);
  };

  const handleViewReport = () => {
    setShowResults(true);
  };

  useEffect(() => {
    if (isProcessingComplete && !showResults) {
      toast("Analysis Complete", {
        description: (
          <div className="flex flex-col gap-4">
            <p>Your analysis report is ready to view</p>
            <ViewReportButton onClick={handleViewReport} />
          </div>
        ),
        duration: 0,
      });
    }
  }, [isProcessingComplete, showResults]);

  return (
    <div className="space-y-6">
      <SearchForm 
        userId={userId} 
        onJobCreated={(jobId, text) => handleSearchSubmit(text, jobId)}
        currentJobId={currentJobId}
        isProcessingComplete={isProcessingComplete}
        onViewReport={handleViewReport}
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
        showResults={showResults}
        onClose={() => setShowResults(false)}
      />
    </div>
  );
};

export default NewSearchForm;