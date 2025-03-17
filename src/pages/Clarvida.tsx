
import { useState } from "react";
import { SearchForm } from "@/components/search/SearchForm";
import { useAuth } from "@/context/AuthContext";
import { ClarvidaHeader } from "@/components/clarvida/ClarvidaHeader";
import { ClarvidaResults } from "@/components/clarvida/ClarvidaResults";
import { toast } from "sonner";

const Clarvida = () => {
  const { session } = useAuth();
  const userId = session?.user?.id || null;
  const [isProcessingComplete, setIsProcessingComplete] = useState(false);
  const [currentJobId, setCurrentJobId] = useState<number | null>(null);
  const [analysisData, setAnalysisData] = useState<any>(null);
  const [isError, setIsError] = useState(false);
  
  const handleJobCreated = (jobId: number, searchText?: string, data?: any) => {
    console.log('Job created callback called with jobId:', jobId);
    setCurrentJobId(jobId);
    
    if (data) {
      console.log('Setting analysis data:', data);
      setAnalysisData(data);
      setIsProcessingComplete(true);
      setIsError(false);
      toast.success("Analysis complete!");
    } else {
      console.error('No data received in handleJobCreated');
      setIsError(true);
      toast.error("Failed to generate report. Please try again.");
      setIsProcessingComplete(false);
    }
  };
  
  const handleRetry = () => {
    setIsError(false);
    setIsProcessingComplete(false);
  };
  
  return (
    <div className="min-h-screen bg-[#F1F0FB] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <ClarvidaHeader />
        
        <div className="space-y-8 mt-8">
          {isError ? (
            <div className="text-center p-8">
              <h3 className="text-xl font-bold text-red-600 mb-4">Failed to generate report</h3>
              <p className="mb-6">There was an error processing your request. This could be due to an issue with the AI service or your input.</p>
              <button 
                onClick={handleRetry}
                className="bg-[#8B5CF6] text-white px-6 py-3 rounded-md font-medium hover:bg-[#7c4ef3] transition-colors"
              >
                Try Again
              </button>
            </div>
          ) : !isProcessingComplete ? (
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
