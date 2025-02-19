import { useState, useEffect } from "react";
import { Globe, Linkedin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const LinkedInPostGenerator = () => {
  const [postContent, setPostContent] = useState("");
  const [link, setLink] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [generatedPost, setGeneratedPost] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isPosting, setIsPosting] = useState(false);

  useEffect(() => {
    // Handle the OAuth redirect
    const handleAuthRedirect = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) {
        console.error("Auth redirect error:", error);
        toast.error("Authentication failed. Please try again.");
      } else if (session) {
        // Successfully authenticated
        toast.success("Successfully connected to LinkedIn!");
      }
    };

    handleAuthRedirect();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('generate-linkedin-post', {
        body: {
          content: postContent,
          link,
        },
      });

      if (error) throw error;
      
      setGeneratedPost(data.post);
      toast.success("Post generated successfully!");
    } catch (error) {
      console.error("Error generating post:", error);
      toast.error("Failed to generate post. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleShareOnLinkedIn = async () => {
    setIsPosting(true);
    
    try {
      console.log("Starting LinkedIn OAuth flow...");
      
      // Use a dedicated callback route for OAuth
      const { data: authData, error: authError } = await supabase.auth.signInWithOAuth({
        provider: 'linkedin_oidc',
        options: {
          redirectTo: `${window.location.origin}/linkedin-post`, // Return to current page
          scopes: 'w_member_social r_liteprofile r_emailaddress openid profile email',
          queryParams: {
            prompt: 'consent'
          }
        }
      });

      // Only show error if the OAuth popup was not opened successfully
      if (authError && !authData?.url) {
        console.error("LinkedIn OAuth error:", authError);
        throw new Error(`LinkedIn authorization failed: ${authError.message}`);
      }

      // Don't set isPosting to false here - let the redirect happen
      return;

    } catch (error: any) {
      console.error("LinkedIn integration error:", error);
      toast.error(error.message || "Failed to connect to LinkedIn. Please try again.");
      setIsPosting(false);
    }
  };

  return (
    <div className="container py-8 space-y-8 max-w-2xl mx-auto">
      <div className="space-y-4">
        <h1 className="text-3xl font-bold">Create LinkedIn Post</h1>
        <p className="text-muted-foreground">
          Generate engaging content for your recruitment campaigns
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Create New Post</CardTitle>
          <CardDescription>
            Fill in the details below to generate your LinkedIn post
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
            </div>

            <div className="flex items-center gap-4">
              <div className="flex-1">
                <Input
                  id="linkInput"
                  type="text"
                  placeholder="Add a link (optional)"
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

                <Button type="submit" disabled={isLoading}>
                  {isLoading ? "Generating..." : "Generate Post"}
                </Button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>

      {generatedPost && (
        <Card>
          <CardHeader>
            <CardTitle>Generated Post</CardTitle>
            <CardDescription>
              Here's your generated LinkedIn post
            </CardDescription>
          </CardHeader>
          <CardContent>
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
              <Button
                variant="outline"
                onClick={handleShareOnLinkedIn}
                disabled={isPosting}
              >
                <Linkedin className="mr-2 h-4 w-4" />
                {isPosting ? "Posting..." : "Share on LinkedIn"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default LinkedInPostGenerator;
