
import { memo } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PostContent from "./results/PostContent";
import AnalysisContent from "./results/AnalysisContent";

interface LinkedInPostResultsProps {
  generatedPost: string;
  analysis: string;
  activeTab: string;
  onTabChange: (value: string) => void;
  isAnalysisOpen: boolean;
  onAnalysisOpenChange: (open: boolean) => void;
}

const LinkedInPostResults = memo(({
  generatedPost,
  analysis,
  activeTab,
  onTabChange,
  isAnalysisOpen,
  onAnalysisOpenChange
}: LinkedInPostResultsProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Generated Content</CardTitle>
        <CardDescription>
          View your generated LinkedIn post and expert analysis
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="post" value={activeTab} onValueChange={onTabChange} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="post">Final Post</TabsTrigger>
            <TabsTrigger value="analysis">Expert Analysis</TabsTrigger>
          </TabsList>
          <TabsContent value="post" className="mt-4">
            <PostContent content={generatedPost} />
          </TabsContent>
          <TabsContent value="analysis" className="mt-4">
            <AnalysisContent 
              analysis={analysis}
              isAnalysisOpen={isAnalysisOpen}
              onAnalysisOpenChange={onAnalysisOpenChange}
            />
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter className="text-xs text-muted-foreground">
        Generated using expert analysis and content synthesis
      </CardFooter>
    </Card>
  );
});

LinkedInPostResults.displayName = "LinkedInPostResults";

export default LinkedInPostResults;
