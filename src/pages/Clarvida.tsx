
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { SearchForm } from "@/components/search/SearchForm";
import { useAuth } from "@/context/AuthContext";
import { ClarvidaHeader } from "@/components/clarvida/ClarvidaHeader";
import { ClarvidaResults } from "@/components/clarvida/ClarvidaResults";

const Clarvida = () => {
  const { session } = useAuth();
  const userId = session?.user?.id || null;
  const [isProcessingComplete, setIsProcessingComplete] = useState(false);
  const [currentJobId, setCurrentJobId] = useState<number | null>(null);
  const [analysisData, setAnalysisData] = useState<any>(null);
  
  const handleJobCreated = (jobId: number, searchText?: string, data?: any) => {
    setCurrentJobId(jobId);
    setAnalysisData(data);
    setIsProcessingComplete(true);
  };
  
  return (
    <div className="min-h-screen bg-[#F1F0FB] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <ClarvidaHeader />
        
        <div className="space-y-8 mt-8">
          {!isProcessingComplete ? (
            <SearchForm 
              userId={userId} 
              onJobCreated={handleJobCreated}
              currentJobId={currentJobId}
              isProcessingComplete={isProcessingComplete}
              source="clarvida"
              hideSearchTypeToggle={true}
              submitButtonText="Generate Report"
            />
          ) : (
            <ClarvidaResults 
              data={analysisData} 
              onNewSearch={() => setIsProcessingComplete(false)} 
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default Clarvida;
