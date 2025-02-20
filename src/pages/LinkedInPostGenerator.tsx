
import { useState } from "react";
import { Globe, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { FirecrawlService } from "@/utils/FirecrawlService";

const LinkedInPostGenerator = () => {
  const [postContent, setPostContent] = useState("");
  const [link, setLink] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [generatedPost, setGeneratedPost] = useState("");
  const [analysis, setAnalysis] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isAnalysisOpen, setIsAnalysisOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("post");
  const [isScrapingUrl, setIsScrapingUrl] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    let websiteContent = "";

    try {
      // If there's a link, try to scrape it first
      if (link) {
        setIsScrapingUrl(true);
        toast.info("Scraping website content...");
        
        const result = await FirecrawlService.crawlWebsite(link);
        
        if (!result.success) {
          throw new Error(result.error || "Failed to scrape website");
        }
        
        websiteContent = result.data?.text || "";
        toast.success("Website content scraped successfully!");
      }

      // Combine user input with scraped content if available
      const finalContent = websiteContent 
        ? `${postContent}\n\nWebsite Content:\n${websiteContent}`
        : postContent;

      const { data, error } = await supabase.functions.invoke('generate-linkedin-post', {
        body: {
          content: finalContent,
          link,
        },
      });

      if (error) throw error;
      
      setGeneratedPost(data.post);
      if (data.analysis) {
        setAnalysis(data.analysis);
      }
      toast.success("Post generated successfully!");
    } catch (error) {
      console.error("Error generating post:", error);
      toast.error(error instanceof Error ? error.message : "Failed to generate post. Please try again.");
    } finally {
      setIsLoading(false);
      setIsScrapingUrl(false);
    }
  };

  return (
    <div className="container py-8 space-y-8 max-w-2xl mx-auto">
      <div className="space-y-4">
        <h1 className="text-3xl font-bold">Create LinkedIn Post</h1>
        <p className="text-muted-foreground">
          Generate engaging content with expert analysis for your recruitment campaigns
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Create New Post</CardTitle>
          <CardDescription>
            Fill in the details below to generate your LinkedIn post with expert analysis
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="post-content">What do you want to post about?</Label>
              <Textarea
                id="post-content"
                className="h-40"
                value={postContent}
                onChange={(e) => setPostContent(e.target.value)}
                placeholder="Enter your post ideas here..."
                required
              />
              <p className="text-xs text-muted-foreground">
                Your content will be analyzed by 5 experts and a devil's advocate before crafting the final post
              </p>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex-1">
                <Input
                  id="linkInput"
                  type="url"
                  placeholder="Add a website URL to analyze (optional)"
                  value={link}
                  onChange={(e) => setLink(e.target.value)}
                />
              </div>

              <div className="flex gap-4">
                <Label className="cursor-pointer">
                  <input 
                    type="file" 
                    className="hidden" 
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        setFile(e.target.files[0]);
                      }
                    }} 
                  />
                  <Globe className="h-6 w-6 text-muted-foreground hover:text-foreground" />
                </Label>

                <Button type="submit" disabled={isLoading || isScrapingUrl}>
                  {isScrapingUrl ? "Scraping Website..." : isLoading ? "Analyzing & Generating..." : "Generate Post"}
                </Button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>

      {(generatedPost || analysis) && (
        <Card>
          <CardHeader>
            <CardTitle>Generated Content</CardTitle>
            <CardDescription>
              View your generated LinkedIn post and expert analysis
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="post" value={activeTab} onValueChange={setActiveTab} className="w-full">
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
                      <Collapsible open={isAnalysisOpen} onOpenChange={setIsAnalysisOpen}>
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
      )}
    </div>
  );
};

export default LinkedInPostGenerator;
