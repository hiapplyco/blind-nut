import { useState, useEffect } from "react";
import { PenLine } from "lucide-react";
import { AgentWindow } from "./AgentWindow";
import { supabase } from "@/integrations/supabase/client";

interface JobDescriptionEnhancerProps {
  content: string;
  shouldEnhance: boolean;
}

export const JobDescriptionEnhancer = ({ content, shouldEnhance }: JobDescriptionEnhancerProps) => {
  const [isVisible, setIsVisible] = useState(true);
  const [enhancedJD, setEnhancedJD] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const enhanceJobDescription = async () => {
      if (!content.trim() || !shouldEnhance) return;
      
      setIsLoading(true);
      try {
        const { data, error } = await supabase.functions.invoke('enhance-job-description', {
          body: { content }
        });

        if (error) throw error;
        setEnhancedJD(data?.enhancedDescription || null);
      } catch (error) {
        console.error('Error enhancing job description:', error);
      } finally {
        setIsLoading(false);
      }
    };

    enhanceJobDescription();
  }, [content, shouldEnhance]);

  if (!content.trim() || !shouldEnhance) return null;

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
          {enhancedJD || "No enhanced job description available."}
        </div>
      )}
    </AgentWindow>
  );
};