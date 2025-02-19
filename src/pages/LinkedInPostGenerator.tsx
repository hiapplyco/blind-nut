
import { useState } from "react";
import { Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

const LinkedInPostGenerator = () => {
  const [postContent, setPostContent] = useState("");
  const [link, setLink] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [generatedPost, setGeneratedPost] = useState("");
  const [imageDescription, setImageDescription] = useState("");

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
          <form className="space-y-6">
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

                <Button type="submit">
                  Generate Post
                </Button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default LinkedInPostGenerator;
