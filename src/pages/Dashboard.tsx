
import { 
  FileSearch, 
  Video, 
  UserCheck, 
  PhoneCall, 
  MessageSquare,
  PlusCircle,
  Briefcase
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const navigate = useNavigate();

  const toolCards = [
    {
      title: "Post a Job",
      description: "Create and analyze new job postings with AI assistance",
      icon: Briefcase,
      path: "/job-post",
      color: "bg-red-100"
    },
    {
      title: "Create LinkedIn Post",
      description: "Generate engaging content for your recruitment campaigns",
      icon: PlusCircle,
      path: "/linkedin-post",
      color: "bg-purple-100"
    },
    {
      title: "Sourcing Assistant",
      description: "AI-powered candidate sourcing and job description analysis",
      icon: FileSearch,
      path: "/sourcing",
      color: "bg-blue-100"
    },
    {
      title: "Screening Room",
      description: "Conduct and analyze candidate screening interviews",
      icon: Video,
      path: "/screening-room",
      color: "bg-green-100"
    },
    {
      title: "Interview Prep",
      description: "Prepare structured interviews and evaluation criteria",
      icon: UserCheck,
      path: "/interview-prep",
      color: "bg-yellow-100"
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

  // Function to get random rotation (slight tilt) for post-it note effect
  const getRandomRotation = () => {
    // Generate a random number between -2 and 2 for subtle rotation
    return `rotate-[${(Math.random() * 4 - 2).toFixed(1)}deg]`;
  };

  return (
    <div className="container py-8 space-y-8">
      {/* Hero Section */}
      <div className="space-y-4">
        <h1 className="text-4xl font-bold">Recruitment Intelligence Hub</h1>
        <p className="text-muted-foreground text-lg">
          Streamline your recruitment process with AI-powered tools and analytics
        </p>
      </div>

      {/* Tools Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {toolCards.map((tool, index) => {
          const rotationClass = getRandomRotation();
          
          return (
            <Card 
              key={tool.path}
              className={`group hover:-translate-y-1 hover:shadow-xl transition-all duration-300 ${tool.color} border-0 aspect-square 
                        shadow-[5px_5px_10px_rgba(0,0,0,0.3)] ${rotationClass} 
                        hover:rotate-0`}
              style={{
                transformOrigin: 'center center'
              }}
            >
              <CardHeader className="h-full flex flex-col">
                <CardTitle className="flex items-center gap-2 text-xl">
                  <tool.icon className="h-6 w-6" />
                  {tool.title}
                </CardTitle>
                <CardDescription className="flex-grow flex items-center text-base text-gray-700">
                  {tool.description}
                </CardDescription>
                <Button 
                  variant="ghost" 
                  className="w-full mt-auto group-hover:bg-white/50"
                  onClick={() => navigate(tool.path)}
                >
                  Open Tool
                </Button>
              </CardHeader>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default Dashboard;
