
import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { JobPostingForm } from "@/components/jobs/JobPostingForm";
import LinkedInPostForm from "@/components/linkedin/LinkedInPostForm";
import LinkedInPostResults from "@/components/linkedin/LinkedInPostResults";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const ContentCreationPage = () => {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState(() => {
    // Check if the user was redirected from linkedin-post
    return location.state?.from === "/linkedin-post" ? "linkedin" : "job";
  });
  
  const [generatedPost, setGeneratedPost] = useState("");
  const [analysis, setAnalysis] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isAnalysisOpen, setIsAnalysisOpen] = useState(false);
  const [linkedInActiveTab, setLinkedInActiveTab] = useState("post");
  const [isScrapingUrl, setIsScrapingUrl] = useState(false);

  // If user was redirected from linkedin-post, set tab to linkedin
  useEffect(() => {
    if (location.pathname.includes("linkedin-post")) {
      setActiveTab("linkedin");
    }
  }, [location]);

  const handleLinkedInSubmit = async (postContent: string, link: string, websiteContent: string) => {
    setIsLoading(true);
    setIsScrapingUrl(true);

    try {
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

  const handleJobPostSuccess = () => {
    toast.success("Job posting created successfully!");
    setActiveTab("linkedin");
  };

  return (
    <div className="container py-8 space-y-8 mx-auto">
      <div className="space-y-4">
        <h1 className="text-3xl font-bold">Content Creation Hub</h1>
        <p className="text-muted-foreground">
          Create job postings and LinkedIn promotion posts for your recruitment campaigns
        </p>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-2 w-full max-w-md mx-auto mb-8">
          <TabsTrigger value="job">Job Posting</TabsTrigger>
          <TabsTrigger value="linkedin">LinkedIn Post</TabsTrigger>
        </TabsList>
        
        <TabsContent value="job" className="max-w-4xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>Create Job Posting</CardTitle>
              <CardDescription>
                Craft a detailed job posting that will be analyzed and optimized
              </CardDescription>
            </CardHeader>
            <CardContent>
              <JobPostingForm onSuccess={handleJobPostSuccess} />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="linkedin" className="max-w-2xl mx-auto">
          <LinkedInPostForm 
            onSubmit={handleLinkedInSubmit}
            isLoading={isLoading}
            isScrapingUrl={isScrapingUrl}
          />
          
          {(generatedPost || analysis) && (
            <div className="mt-8">
              <LinkedInPostResults 
                generatedPost={generatedPost}
                analysis={analysis}
                activeTab={linkedInActiveTab}
                onTabChange={setLinkedInActiveTab}
                isAnalysisOpen={isAnalysisOpen}
                onAnalysisOpenChange={setIsAnalysisOpen}
              />
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ContentCreationPage;
