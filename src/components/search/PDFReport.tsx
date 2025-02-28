
import { useState } from "react";
import { GoogleSearchWindow } from "./GoogleSearchWindow";
import { KeyTermsWindow } from "./KeyTermsWindow";
import { CaptureWindow } from "./CaptureWindow";
import { ViewReportButton } from "./ViewReportButton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAgentOutputs } from "@/stores/useAgentOutputs";
import { Badge } from "@/components/ui/badge";

interface PDFReportProps {
  jobSummary: string;
  enhancedDescription: string;
  compensationAnalysis: string;
  terms: Record<string, string[]>;
  searchString: string;
  jobId?: number;
}

export const PDFReport = ({
  jobSummary,
  enhancedDescription,
  compensationAnalysis,
  terms,
  searchString,
  jobId,
}: PDFReportProps) => {
  const [currentSearchQuery, setCurrentSearchQuery] = useState(searchString || "");

  // Update/create search query based on terms
  const handleKeyTermClick = (term: string, termType: string) => {
    let newQuery = `site:linkedin.com/in/ ${term}`;
    
    // For skills, we add them to the existing query
    if (termType === "skills" || termType === "core_skills") {
      // Check if we already have a search query
      if (currentSearchQuery && !currentSearchQuery.includes(term)) {
        newQuery = `${currentSearchQuery} ${term}`;
      }
    }
    
    setCurrentSearchQuery(newQuery);
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="search" className="w-full">
        <TabsList className="w-full mb-6 border-2 border-black h-auto">
          <TabsTrigger
            value="search"
            className="data-[state=active]:bg-black data-[state=active]:text-white text-lg px-4 py-2 h-auto"
          >
            Search Results
          </TabsTrigger>
          <TabsTrigger
            value="terms"
            className="data-[state=active]:bg-black data-[state=active]:text-white text-lg px-4 py-2 h-auto"
          >
            Key Terms
          </TabsTrigger>
          <TabsTrigger
            value="capture"
            className="data-[state=active]:bg-black data-[state=active]:text-white text-lg px-4 py-2 h-auto"
          >
            LinkedIn
          </TabsTrigger>
        </TabsList>

        <TabsContent value="search" className="mt-0">
          <GoogleSearchWindow searchString={currentSearchQuery} jobId={jobId} />
        </TabsContent>

        <TabsContent value="terms" className="mt-0">
          <KeyTermsWindow terms={terms} onKeyTermClick={handleKeyTermClick} />
        </TabsContent>

        <TabsContent value="capture" className="mt-0">
          <CaptureWindow />
        </TabsContent>
      </Tabs>

      <ViewReportButton
        jobSummary={jobSummary}
        enhancedDescription={enhancedDescription}
        compensationAnalysis={compensationAnalysis}
        terms={terms}
      />
    </div>
  );
};
