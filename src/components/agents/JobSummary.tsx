import { useState, useEffect } from "react";
import { FileText } from "lucide-react";
import { AgentWindow } from "./AgentWindow";
import { supabase } from "@/integrations/supabase/client";

interface JobSummaryProps {
  content: string;
  shouldSummarize: boolean;
}

export const JobSummary = ({ content, shouldSummarize }: JobSummaryProps) => {
  const [isVisible, setIsVisible] = useState(true);
  const [summary, setSummary] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const summarizeJob = async () => {
      if (!content.trim() || !shouldSummarize) return;
      
      setIsLoading(true);
      try {
        const { data, error } = await supabase.functions.invoke('summarize-job', {
          body: { content }
        });

        if (error) throw error;
        setSummary(data?.summary || null);
      } catch (error) {
        console.error('Error summarizing job:', error);
      } finally {
        setIsLoading(false);
      }
    };

    summarizeJob();
  }, [content, shouldSummarize]);

  if (!content.trim() || !shouldSummarize) return null;

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
          {summary || "No job summary available."}
        </div>
      )}
    </AgentWindow>
  );
};