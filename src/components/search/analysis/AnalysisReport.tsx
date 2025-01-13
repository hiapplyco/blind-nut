import { AgentOutput } from "@/types/agent";

interface AnalysisReportProps {
  agentOutput: AgentOutput;
}

export const AnalysisReport = ({ agentOutput }: AnalysisReportProps) => {
  const formatText = (text: string) => {
    return text?.split('\n').map((line, index) => (
      <p key={index} className="mb-2">{line}</p>
    ));
  };

  return (
    <div className="mt-8">
      <div className="p-6 border-4 border-black bg-[#FFFBF4] shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
        <h2 className="text-2xl font-bold mb-6">Analysis Report</h2>
        <div className="space-y-8">
          <section>
            <h3 className="text-xl font-semibold mb-4">Job Summary</h3>
            <div className="text-gray-800">{formatText(agentOutput.job_summary)}</div>
          </section>
          
          <section>
            <h3 className="text-xl font-semibold mb-4">Enhanced Description</h3>
            <div className="text-gray-800">{formatText(agentOutput.enhanced_description)}</div>
          </section>
          
          <section>
            <h3 className="text-xl font-semibold mb-4">Compensation Analysis</h3>
            <div className="text-gray-800">{formatText(agentOutput.compensation_analysis)}</div>
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
      </div>
    </div>
  );
};