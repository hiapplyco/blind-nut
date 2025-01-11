import { useState, useEffect } from "react";
import { DollarSign } from "lucide-react";
import { AgentWindow } from "./AgentWindow";
import { supabase } from "@/integrations/supabase/client";

interface CompensationAnalysisProps {
  content: string;
  shouldAnalyze: boolean;
}

export const CompensationAnalysis = ({ content, shouldAnalyze }: CompensationAnalysisProps) => {
  const [isVisible, setIsVisible] = useState(true);
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const analyzeCompensation = async () => {
      if (!content.trim() || !shouldAnalyze) return;
      
      setIsLoading(true);
      try {
        const { data, error } = await supabase.functions.invoke('analyze-compensation', {
          body: { content }
        });

        if (error) throw error;
        setAnalysis(data?.analysis || null);
      } catch (error) {
        console.error('Error analyzing compensation:', error);
      } finally {
        setIsLoading(false);
      }
    };

    analyzeCompensation();
  }, [content, shouldAnalyze]);

  if (!content.trim() || !shouldAnalyze) return null;

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
          {analysis || "No compensation information found."}
        </div>
      )}
    </AgentWindow>
  );
};