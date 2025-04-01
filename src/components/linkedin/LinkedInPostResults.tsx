
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
    <Card className="border-2 border-black bg-white shadow-[5px_5px_0px_0px_rgba(0,0,0,1)]">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-[#8B5CF6]">Generated Content</CardTitle>
        <CardDescription className="text-gray-600">
          View your generated LinkedIn post and expert analysis
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="post" value={activeTab} onValueChange={onTabChange} className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-[#F1F1F1] p-1 rounded-lg border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,0.8)]">
            <TabsTrigger 
              value="post"
              className="rounded-md data-[state=active]:bg-[#8B5CF6] data-[state=active]:text-white data-[state=active]:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all"
            >
              Final Post
            </TabsTrigger>
            <TabsTrigger 
              value="analysis"
              className="rounded-md data-[state=active]:bg-[#8B5CF6] data-[state=active]:text-white data-[state=active]:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all"
            >
              Expert Analysis
            </TabsTrigger>
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
