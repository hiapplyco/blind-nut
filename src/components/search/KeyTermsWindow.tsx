
import { Tag, List, KeyRound } from "lucide-react";
import { Terms } from "@/types/agent";
import { AgentWindow } from "../agents/AgentWindow";
import { useAgentOutputs } from "@/stores/useAgentOutputs";

interface KeyTermsWindowProps {
  terms?: Terms;
  jobId?: number;
  onKeyTermClick?: (term: string, termType: string) => void;
}

interface TermGroup {
  title: string;
  terms: string[];
  icon: React.ReactNode;
}

export const KeyTermsWindow = ({ terms: passedTerms, jobId, onKeyTermClick }: KeyTermsWindowProps) => {
  // If jobId is provided but no terms, fetch terms from agent outputs
  const { data: agentOutput } = useAgentOutputs(jobId);
  const terms = passedTerms || (agentOutput?.terms || { skills: [], titles: [], keywords: [] });

  const termGroups: TermGroup[] = [
    {
      title: "Skills & Technologies",
      terms: terms.skills || [],
      icon: <Tag className="h-5 w-5" />
    },
    {
      title: "Job Titles",
      terms: terms.titles || [],
      icon: <KeyRound className="h-5 w-5" />
    },
    {
      title: "Keywords",
      terms: terms.keywords || [],
      icon: <List className="h-5 w-5" />
    }
  ];

  const handleTermClick = (term: string, termType: string) => {
    if (onKeyTermClick) {
      onKeyTermClick(term, termType);
    }
  };

  return (
    <AgentWindow
      title="Extracted Terms"
      icon={<Tag className="h-6 w-6" />}
    >
      <div className="space-y-6">
        {termGroups.map((group, index) => (
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
                    shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] text-sm font-medium cursor-pointer"
                  onClick={() => handleTermClick(term, group.title.toLowerCase())}
                >
                  {term}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </AgentWindow>
  );
};
