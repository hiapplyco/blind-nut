
import { memo } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { toast } from "sonner";

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
            <div className="bg-muted p-4 rounded-lg">
              <p className="whitespace-pre-wrap">{generatedPost}</p>
            </div>
            <div className="flex gap-4 mt-4">
              <Button 
                onClick={() => {
                  navigator.clipboard.writeText(generatedPost);
                  toast.success("Post copied to clipboard!");
                }}
              >
                Copy to Clipboard
              </Button>
            </div>
          </TabsContent>
          <TabsContent value="analysis" className="mt-4">
            {analysis ? (
              <div className="space-y-4">
                <div className="bg-muted p-4 rounded-lg">
                  <Collapsible open={isAnalysisOpen} onOpenChange={onAnalysisOpenChange}>
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="text-sm font-medium">Expert Analysis Details</h3>
                      <CollapsibleTrigger asChild>
                        <Button variant="ghost" size="sm">
                          {isAnalysisOpen ? (
                            <ChevronUp className="h-4 w-4" />
                          ) : (
                            <ChevronDown className="h-4 w-4" />
                          )}
                        </Button>
                      </CollapsibleTrigger>
                    </div>
                    <CollapsibleContent>
                      <pre className="whitespace-pre-wrap text-xs font-mono overflow-auto max-h-96">
                        {analysis}
                      </pre>
                    </CollapsibleContent>
                  </Collapsible>
                </div>
              </div>
            ) : (
              <div className="p-4 text-center text-muted-foreground">
                Analysis not available
              </div>
            )}
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
