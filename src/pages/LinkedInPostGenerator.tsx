
import { useState } from "react";
import { 
  Globe, 
  UserCheck, 
  MessageSquare, 
  Video, 
  PhoneCall,
  FileSearch,
  PlusCircle,
  ChevronRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

const LinkedInPostGenerator = () => {
  const navigate = useNavigate();
  const [currentView, setCurrentView] = useState<"input" | "result">("input");
  const [postContent, setPostContent] = useState("");
  const [link, setLink] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [generatedPost, setGeneratedPost] = useState("");
  const [imageDescription, setImageDescription] = useState("");

  const toolCards = [
    {
      title: "Sourcing Assistant",
      description: "AI-powered candidate sourcing and job description analysis",
      icon: FileSearch,
      path: "/sourcing",
      color: "bg-purple-100"
    },
    {
      title: "Screening Room",
      description: "Conduct and analyze candidate screening interviews",
      icon: Video,
      path: "/screening-room",
      color: "bg-blue-100"
    },
    {
      title: "Interview Prep",
      description: "Prepare structured interviews and evaluation criteria",
      icon: UserCheck,
      path: "/interview-prep",
      color: "bg-green-100"
    },
    {
      title: "Kickoff Call",
      description: "Generate meeting summaries and action items",
      icon: PhoneCall,
      path: "/kickoff-call",
      color: "bg-orange-100"
    },
    {
      title: "Chat Assistant",
      description: "Get real-time help with recruitment tasks",
      icon: MessageSquare,
      path: "/chat",
      color: "bg-pink-100"
    }
  ];

  return (
    <div className="container py-8 space-y-8">
      {/* Hero Section */}
      <div className="space-y-4">
        <h1 className="text-4xl font-bold">Recruitment Intelligence Hub</h1>
        <p className="text-muted-foreground text-lg">
          Streamline your recruitment process with AI-powered tools and analytics
        </p>
      </div>

      {/* New Post Card */}
      <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
        <CardHeader>
          <CardTitle className="text-2xl flex items-center gap-2">
            <PlusCircle className="h-6 w-6 text-purple-600" />
            Create New LinkedIn Post
          </CardTitle>
          <CardDescription>
            Generate engaging content for your recruitment campaigns
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button 
            size="lg" 
            className="w-full bg-purple-600 hover:bg-purple-700"
            onClick={() => setCurrentView("input")}
          >
            Start New Post
            <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
        </CardContent>
      </Card>

      {/* Tools Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {toolCards.map((tool) => (
          <Card 
            key={tool.path}
            className={`group hover:shadow-lg transition-all ${tool.color} border-transparent`}
          >
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <tool.icon className="h-6 w-6" />
                {tool.title}
              </CardTitle>
              <CardDescription>{tool.description}</CardDescription>
            </CardHeader>
            <CardFooter>
              <Button 
                variant="ghost" 
                className="w-full group-hover:bg-white/50"
                onClick={() => navigate(tool.path)}
              >
                Open Tool
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      {/* Post Generation Dialog */}
      {currentView === "input" && (
        <Card className="fixed inset-x-4 bottom-4 top-20 md:relative md:inset-auto max-w-2xl mx-auto overflow-auto">
          <CardHeader>
            <Button 
              variant="ghost" 
              className="absolute right-4 top-4"
              onClick={() => setCurrentView("result")}
            >
              Close
            </Button>
            <CardTitle>Create LinkedIn Post</CardTitle>
            <CardDescription>Generate an engaging post with AI assistance</CardDescription>
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
                    <input type="file" className="hidden" onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        setFile(e.target.files[0]);
                      }
                    }} />
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
      )}
    </div>
  );
};

export default LinkedInPostGenerator;
