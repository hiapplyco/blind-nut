import { useState } from "react";
import { PenLine } from "lucide-react";
import { AgentWindow } from "./AgentWindow";
import { useAgentOutputs } from "@/stores/useAgentOutputs";

interface JobDescriptionEnhancerProps {
  jobId: number | null;
}

export const JobDescriptionEnhancer = ({ jobId }: JobDescriptionEnhancerProps) => {
  const [isVisible, setIsVisible] = useState(true);
  const { data: agentOutput, isLoading } = useAgentOutputs(jobId);

  if (!jobId) return null;

  return (
    <AgentWindow
      title="Enhanced Job Description"
      icon={<PenLine className="h-6 w-6" />}
      isVisible={isVisible}
      onClose={() => setIsVisible(false)}
      initialPosition={{ x: window.innerWidth - 400, y: 300 }}
    >
      {isLoading ? (
        <div className="space-y-4">
          <div className="h-4 bg-gray-200 rounded animate-pulse" />
          <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4" />
        </div>
      ) : (
        <div className="prose prose-sm">
          {agentOutput?.enhanced_description || "No enhanced job description available."}
        </div>
      )}
    </AgentWindow>
  );
};