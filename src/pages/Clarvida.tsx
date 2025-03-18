
import { useState, lazy, Suspense } from "react";
import { SearchForm } from "@/components/search/SearchForm";
import { useClarvidaAuth } from "@/context/ClarvidaAuthContext";
import { ClarvidaHeader } from "@/components/clarvida/ClarvidaHeader";
import { ClarvidaResults } from "@/components/clarvida/ClarvidaResults";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

// Lazy load components to improve initial page load
const GoogleSearchWindow = lazy(() => import("@/components/search/GoogleSearchWindow").then(module => ({ default: module.GoogleSearchWindow })));
const NewSearchForm = lazy(() => import("@/components/NewSearchForm"));

const LoadingState = () => (
  <div className="h-96 flex items-center justify-center">
    <Loader2 className="h-8 w-8 animate-spin text-[#8B5CF6]" />
  </div>
);

const Clarvida = () => {
  const { session, signOut } = useClarvidaAuth();
  const userId = session?.user?.id || null;
  const navigate = useNavigate();
  const [isProcessingComplete, setIsProcessingComplete] = useState(false);
  const [currentJobId, setCurrentJobId] = useState<number | null>(null);
  const [analysisData, setAnalysisData] = useState<any>(null);
  const [isError, setIsError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [showSourcing, setShowSourcing] = useState(false);
  const [searchString, setSearchString] = useState("");
  
  const handleJobCreated = (jobId: number, inputText: string, data?: any) => {
    console.log('Job created callback called with jobId:', jobId);
    setCurrentJobId(jobId);
    setSearchText(inputText);
    setIsLoading(false);
    
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
    setAnalysisData(null);
  };
  
  const handleSubmitStart = () => {
    setIsLoading(true);
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/clarvida/login");
  };
  
  const handleSearchCandidates = (booleanString: string) => {
    setSearchString(booleanString);
    setShowSourcing(true);
  };
  
  return (
    <div className="min-h-screen bg-[#F1F0FB] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center">
          <ClarvidaHeader />
          {userId && (
            <Button 
              variant="outline" 
              onClick={handleSignOut}
              className="text-sm"
            >
              Sign Out
            </Button>
          )}
        </div>
        
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
            <div>
              {isLoading && (
                <div className="text-center mb-6">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#8B5CF6] mb-2"></div>
                  <p className="text-gray-600">Generating your report...</p>
                </div>
              )}
              <SearchForm 
                userId={userId} 
                onJobCreated={handleJobCreated}
                currentJobId={currentJobId}
                isProcessingComplete={isProcessingComplete}
                source="clarvida"
                hideSearchTypeToggle={true}
                submitButtonText="Generate Report"
                onSubmitStart={handleSubmitStart}
              />
            </div>
          ) : (
            <div className="space-y-8">
              {analysisData && (
                <ClarvidaResults 
                  data={analysisData} 
                  originalSearchText={searchText}
                  onNewSearch={() => {
                    setIsProcessingComplete(false);
                    setAnalysisData(null);
                    setShowSourcing(false);
                  }}
                  onSearchCandidates={handleSearchCandidates}
                />
              )}
              
              {showSourcing && (
                <div className="mt-8">
                  <Card className="border-2 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,0.25)] bg-white p-6">
                    <h2 className="text-2xl font-bold text-[#8B5CF6] mb-6">Candidate Sourcing</h2>
                    <Suspense fallback={<LoadingState />}>
                      {searchString ? (
                        <GoogleSearchWindow 
                          searchString={searchString} 
                          jobId={currentJobId} 
                        />
                      ) : (
                        <NewSearchForm 
                          userId={userId}
                          initialJobId={currentJobId}
                        />
                      )}
                    </Suspense>
                  </Card>
                  
                  {/* Additional help card */}
                  <Card className="p-6 mt-6 border-2 border-black bg-[#FEF7CD] shadow-[6px_6px_0px_0px_rgba(0,0,0,0.25)]">
                    <h3 className="text-lg font-bold mb-2">Sourcing Tips</h3>
                    <ul className="space-y-2 text-sm">
                      <li className="flex gap-2">
                        <span className="font-bold">⚡</span>
                        <span>Use specific keywords related to the skills and experience you're looking for</span>
                      </li>
                      <li className="flex gap-2">
                        <span className="font-bold">⚡</span>
                        <span>Include location if you're searching for candidates in a specific area</span>
                      </li>
                      <li className="flex gap-2">
                        <span className="font-bold">⚡</span>
                        <span>When searching for candidates at a company, try different variations of the company name</span>
                      </li>
                      <li className="flex gap-2">
                        <span className="font-bold">⚡</span>
                        <span>Use the "Get Contact Info" button to access candidate contact details</span>
                      </li>
                    </ul>
                  </Card>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Clarvida;
