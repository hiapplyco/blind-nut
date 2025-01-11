import { useState } from "react";
import { DollarSign } from "lucide-react";
import { AgentWindow } from "./AgentWindow";
import { useAgentOutputs } from "@/stores/useAgentOutputs";

interface CompensationAnalysisProps {
  jobId: number | null;
}

export const CompensationAnalysis = ({ jobId }: CompensationAnalysisProps) => {
  const [isVisible, setIsVisible] = useState(true);
  const { data: agentOutput, isLoading } = useAgentOutputs(jobId);

  if (!jobId) return null;

  return (
    <AgentWindow
      title="Compensation Analysis"
      icon={<DollarSign className="h-6 w-6" />}
      isVisible={isVisible}
      onClose={() => setIsVisible(false)}
      initialPosition={{ x: 50, y: 100 }}
    >
      {isLoading ? (
        <div className="space-y-4">
          <div className="h-4 bg-gray-200 rounded animate-pulse" />
          <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4" />
        </div>
      ) : (
        <div className="prose prose-sm">
          {agentOutput?.compensation_analysis || "No compensation information found."}
        </div>
      )}
    </AgentWindow>
  );
};