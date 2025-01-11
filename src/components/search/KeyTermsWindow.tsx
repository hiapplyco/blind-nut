import { Card } from "@/components/ui/card";
import { Tag, List, KeyRound } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface KeyTermsWindowProps {
  content: string;
  shouldExtract: boolean;
}

interface TermGroup {
  title: string;
  terms: string[];
  icon: React.ReactNode;
}

export const KeyTermsWindow = ({ content, shouldExtract }: KeyTermsWindowProps) => {
  const [terms, setTerms] = useState<TermGroup[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const extractTerms = async () => {
      if (!content.trim() || !shouldExtract) {
        return;
      }

      setIsLoading(true);
      try {
        const { data, error } = await supabase.functions.invoke('extract-nlp-terms', {
          body: { content }
        });

        if (error) throw error;

        if (data) {
          setTerms([
            {
              title: "Skills & Technologies",
              terms: data.skills || [],
              icon: <Tag className="h-5 w-5" />
            },
            {
              title: "Job Titles",
              terms: data.titles || [],
              icon: <KeyRound className="h-5 w-5" />
            },
            {
              title: "Keywords",
              terms: data.keywords || [],
              icon: <List className="h-5 w-5" />
            }
          ]);
        }
      } catch (error) {
        console.error('Error extracting terms:', error);
      } finally {
        setIsLoading(false);
      }
    };

    extractTerms();
  }, [content, shouldExtract]);

  if (!content.trim() || !shouldExtract) return null;

  return (
    <Card className="fixed right-8 top-32 w-80 p-6 border-4 border-black bg-[#FFFBF4] shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
      <h2 className="text-2xl font-bold mb-6 text-center">Extracted Terms</h2>
      
      {isLoading ? (
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
      )}
    </Card>
  );
};