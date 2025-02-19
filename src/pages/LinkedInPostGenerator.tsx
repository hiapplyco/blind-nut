import { useState } from "react";
import { Globe, Paperclip, Image, Share2, Copy, Linkedin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

const LinkedInPostGenerator = () => {
  const [currentView, setCurrentView] = useState<"input" | "result">("input");
  const [postContent, setPostContent] = useState("");
  const [link, setLink] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [generatedPost, setGeneratedPost] = useState("");
  const [imageDescription, setImageDescription] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Generate analysis
      const analysisResponse = await fetch('/api/generate-linkedin-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: postContent })
      });
      
      if (!analysisResponse.ok) throw new Error('Analysis generation failed');
      const { analysis } = await analysisResponse.json();
      
      // Generate post
      const postResponse = await fetch('/api/generate-linkedin-post', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ analysis })
      });
      
      if (!postResponse.ok) throw new Error('Post generation failed');
      const { post } = await postResponse.json();
      
      // Generate image description
      const imageResponse = await fetch('/api/generate-linkedin-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ analysis })
      });
      
      if (!imageResponse.ok) throw new Error('Image description generation failed');
      const { imageDescription: description } = await imageResponse.json();
      
      setGeneratedPost(post);
      setImageDescription(description);
      setCurrentView("result");
    } catch (error) {
      console.error('Error generating content:', error);
      toast.error('Failed to generate content. Please try again.');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
  };

  const handleShare = () => {
    // This would integrate with LinkedIn's API
    toast.info("LinkedIn sharing coming soon!");
  };

  const InputView = () => (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="text-center">LinkedIn Post Generator</CardTitle>
        <CardDescription className="text-center">
          Create engaging LinkedIn posts with AI assistance
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
                type="text"
                placeholder="Add a link (optional)"
                value={link}
                onChange={(e) => setLink(e.target.value)}
              />
            </div>

            <div className="flex gap-4">
              <Label className="cursor-pointer">
                <input type="file" className="hidden" onChange={handleFileChange} />
                <Paperclip className="h-6 w-6 text-muted-foreground hover:text-foreground" />
              </Label>

              <Globe
                className="h-6 w-6 text-muted-foreground hover:text-foreground cursor-pointer"
                onClick={() => document.getElementById("linkInput")?.focus()}
              />

              <Button type="submit">
                Generate Post
              </Button>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  );

  const ResultView = () => (
    <div className="space-y-6 max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Generated Post</CardTitle>
          <CardDescription>Preview and share your LinkedIn post</CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {file && (
            <div className="rounded-lg overflow-hidden bg-muted border">
              <div className="w-full h-48 flex items-center justify-center">
                <Image className="h-12 w-12 text-muted-foreground" />
                <span className="ml-2 text-muted-foreground">Image Preview</span>
              </div>
            </div>
          )}

          <p className="whitespace-pre-line">{generatedPost}</p>

          {link && (
            <div className="mt-2 border rounded p-3 bg-muted flex items-start">
              <Globe className="h-5 w-5 text-muted-foreground mt-1 mr-2 flex-shrink-0" />
              <div>
                <p className="text-primary hover:underline truncate">{link}</p>
                <p className="text-muted-foreground text-sm mt-1 truncate">
                  linkedin.com
                </p>
              </div>
            </div>
          )}
        </CardContent>

        <CardFooter className="justify-end">
          <Button
            variant="outline"
            onClick={() => handleCopy(generatedPost)}
            className="flex items-center gap-2"
          >
            <Copy className="h-4 w-4" />
            Copy
          </Button>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Image Description</CardTitle>
          <CardDescription>Use this with image generation tools</CardDescription>
        </CardHeader>

        <CardContent>
          <div className="rounded-lg border p-3 bg-muted">
            <p className="text-sm">{imageDescription}</p>
          </div>
        </CardContent>

        <CardFooter className="justify-end">
          <Button
            variant="outline"
            onClick={() => handleCopy(imageDescription)}
            className="flex items-center gap-2"
          >
            <Copy className="h-4 w-4" />
            Copy
          </Button>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Share Options</CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          <Button
            className="w-full"
            onClick={handleShare}
          >
            <Share2 className="mr-2 h-5 w-5" />
            Share to LinkedIn
          </Button>

          <div className="flex justify-center">
            <Button
              variant="link"
              onClick={() => setCurrentView("input")}
              className="flex items-center"
            >
              ← Create another post
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="container py-12">
      {currentView === "input" ? <InputView /> : <ResultView />}
    </div>
  );
};

export default LinkedInPostGenerator;
