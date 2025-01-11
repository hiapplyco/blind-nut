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

  return (
    <div className="space-y-6">
      <SearchForm userId={userId} onJobCreated={setCurrentJobId} />
      
      {currentJobId && !isProcessingComplete && (
        <ProcessAgent
          content={searchText}
          jobId={currentJobId}
          onComplete={() => setIsProcessingComplete(true)}
        />
      )}

      <ResultsGrid jobId={currentJobId} />
    </div>
  );
};

export default NewSearchForm;