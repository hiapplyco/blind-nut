
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import LinkedInPostForm from "@/components/linkedin/LinkedInPostForm";
import LinkedInPostResults from "@/components/linkedin/LinkedInPostResults";

const LinkedInPostGenerator = () => {
  const [generatedPost, setGeneratedPost] = useState("");
  const [analysis, setAnalysis] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isAnalysisOpen, setIsAnalysisOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("post");
  const [isScrapingUrl, setIsScrapingUrl] = useState(false);

  const handleSubmit = async (postContent: string, link: string, websiteContent: string) => {
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

  return (
    <div className="container py-8 space-y-8 max-w-2xl mx-auto">
      <div className="space-y-4">
        <h1 className="text-3xl font-bold">Create LinkedIn Post</h1>
        <p className="text-muted-foreground">
          Generate engaging content with expert analysis for your recruitment campaigns
        </p>
      </div>

      <LinkedInPostForm 
        onSubmit={handleSubmit}
        isLoading={isLoading}
        isScrapingUrl={isScrapingUrl}
      />

      {(generatedPost || analysis) && (
        <LinkedInPostResults 
          generatedPost={generatedPost}
          analysis={analysis}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          isAnalysisOpen={isAnalysisOpen}
          onAnalysisOpenChange={setIsAnalysisOpen}
        />
      )}
    </div>
  );
};

export default LinkedInPostGenerator;
