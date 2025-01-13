import { useState } from "react";
import { SearchForm } from "./search/SearchForm";
import { AgentProcessor } from "./search/AgentProcessor";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAgentOutputs } from "@/stores/useAgentOutputs";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "./ui/button";
import { FileText } from "lucide-react";

interface NewSearchFormProps {
  userId: string;
}

const NewSearchForm = ({ userId }: NewSearchFormProps) => {
  const navigate = useNavigate();
  const [currentJobId, setCurrentJobId] = useState<number | null>(null);
  const [isProcessingComplete, setIsProcessingComplete] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [isGeneratingAnalysis, setIsGeneratingAnalysis] = useState(false);
  const { data: agentOutput } = useAgentOutputs(currentJobId);

  const handleSearchSubmit = (text: string, jobId: number) => {
    console.log("Search submitted:", { text, jobId });
    setSearchText(text);
    setCurrentJobId(jobId);
    setIsProcessingComplete(false);
    setIsGeneratingAnalysis(false);
  };

  const handleProcessingComplete = () => {
    console.log("Processing complete");
    setIsProcessingComplete(true);
    toast.success("Analysis complete!");
  };

  const handleGenerateAnalysis = () => {
    setIsGeneratingAnalysis(true);
  };

  return (
    <div className="space-y-6">
      <SearchForm 
        userId={userId} 
        onJobCreated={(jobId, text) => handleSearchSubmit(text, jobId)}
        currentJobId={currentJobId}
        isProcessingComplete={isProcessingComplete}
      />
      
      {currentJobId && !isProcessingComplete && isGeneratingAnalysis && (
        <AgentProcessor
          content={searchText}
          jobId={currentJobId}
          onComplete={handleProcessingComplete}
        />
      )}

      {currentJobId && !isGeneratingAnalysis && (
        <div className="mt-8 flex justify-center">
          <Button
            onClick={handleGenerateAnalysis}
            className="border-4 border-black bg-[#8B5CF6] text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[2px] hover:translate-x-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all"
          >
            <FileText className="w-5 h-5 mr-2" />
            Generate Analysis Report
          </Button>
        </div>
      )}

      {currentJobId && isProcessingComplete && (
        <div className="mt-8">
          <div className="p-6 border-4 border-black bg-[#FFFBF4] shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
            <h2 className="text-2xl font-bold mb-6">Analysis Report</h2>
            {agentOutput && (
              <div className="prose max-w-none">
                <section className="mb-8">
                  <h3 className="text-xl font-semibold mb-4">Job Summary</h3>
                  <div className="whitespace-pre-wrap">{agentOutput.job_summary}</div>
                </section>
                
                <section className="mb-8">
                  <h3 className="text-xl font-semibold mb-4">Enhanced Description</h3>
                  <div className="whitespace-pre-wrap">{agentOutput.enhanced_description}</div>
                </section>
                
                <section className="mb-8">
                  <h3 className="text-xl font-semibold mb-4">Compensation Analysis</h3>
                  <div className="whitespace-pre-wrap">{agentOutput.compensation_analysis}</div>
                </section>

                {agentOutput.terms && (
                  <section>
                    <h3 className="text-xl font-semibold mb-4">Key Terms</h3>
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-medium mb-2">Skills & Technologies</h4>
                        <div className="flex flex-wrap gap-2">
                          {agentOutput.terms.skills.map((skill, index) => (
                            <span key={index} className="px-2 py-1 bg-purple-100 rounded-md text-sm">
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="font-medium mb-2">Job Titles</h4>
                        <div className="flex flex-wrap gap-2">
                          {agentOutput.terms.titles.map((title, index) => (
                            <span key={index} className="px-2 py-1 bg-blue-100 rounded-md text-sm">
                              {title}
                            </span>
                          ))}
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="font-medium mb-2">Keywords</h4>
                        <div className="flex flex-wrap gap-2">
                          {agentOutput.terms.keywords.map((keyword, index) => (
                            <span key={index} className="px-2 py-1 bg-green-100 rounded-md text-sm">
                              {keyword}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </section>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NewSearchForm;