import { Card } from "@/components/ui/card";
import { Tag, List, KeyRound } from "lucide-react";
import { useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AgentWindow } from "../agents/AgentWindow";
import { useAgentOutputs } from "@/stores/useAgentOutputs";

interface KeyTermsWindowProps {
  jobId: number | null;
}

interface TermGroup {
  title: string;
  terms: string[];
  icon: React.ReactNode;
}

export const KeyTermsWindow = ({ jobId }: KeyTermsWindowProps) => {
  const [isVisible, setIsVisible] = useState(true);
  const { data: agentOutput, isLoading } = useAgentOutputs(jobId);

  if (!jobId) return null;

  const terms: TermGroup[] = agentOutput?.terms ? [
    {
      title: "Skills & Technologies",
      terms: agentOutput.terms.skills || [],
      icon: <Tag className="h-5 w-5" />
    },
    {
      title: "Job Titles",
      terms: agentOutput.terms.titles || [],
      icon: <KeyRound className="h-5 w-5" />
    },
    {
      title: "Keywords",
      terms: agentOutput.terms.keywords || [],
      icon: <List className="h-5 w-5" />
    }
  ] : [];

  const termsContent = isLoading ? (
    <div className="space-y-4">
      <div className="h-4 bg-gray-200 rounded animate-pulse" />
      <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4" />
      <div className="h-4 bg-gray-200 rounded animate-pulse w-1/2" />
    </div>
  ) : (
    <div className="space-y-6">
      {terms.map((group, index) => (
        <div key={index} className="space-y-2">
          <div className="flex items-center gap-2 font-bold text-lg">
            {group.icon}
            {group.title}
          </div>
          <div className="flex flex-wrap gap-2">
            {group.terms.map((term, termIndex) => (
              <span
                key={termIndex}
                className="px-2 py-1 bg-white border-2 border-black rounded 
                  shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] text-sm font-medium"
              >
                {term}
              </span>
            ))}
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <AgentWindow
      title="Extracted Terms"
      icon={<Tag className="h-6 w-6" />}
      isVisible={isVisible}
      onClose={() => setIsVisible(false)}
      initialPosition={{ x: window.innerWidth - 400, y: 100 }}
    >
      {termsContent}
    </AgentWindow>
  );
};