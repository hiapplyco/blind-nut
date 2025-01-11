import { useState } from "react";
import { FileText } from "lucide-react";
import { AgentWindow } from "./AgentWindow";
import { useAgentOutputs } from "@/stores/useAgentOutputs";

interface JobSummaryProps {
  jobId: number | null;
}

export const JobSummary = ({ jobId }: JobSummaryProps) => {
  const [isVisible, setIsVisible] = useState(true);
  const { data: agentOutput, isLoading } = useAgentOutputs(jobId);

  if (!jobId) return null;

  return (
    <AgentWindow
      title="Job Summary"
      icon={<FileText className="h-6 w-6" />}
      isVisible={isVisible}
      onClose={() => setIsVisible(false)}
      initialPosition={{ x: 50, y: 300 }}
    >
      {isLoading ? (
        <div className="space-y-4">
          <div className="h-4 bg-gray-200 rounded animate-pulse" />
          <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4" />
        </div>
      ) : (
        <div className="prose prose-sm">
          {agentOutput?.job_summary || "No job summary available."}
        </div>
      )}
    </AgentWindow>
  );
};