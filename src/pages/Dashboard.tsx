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
import RollingGallery from "@/components/RollingGallery.jsx"; // Import the gallery with .jsx extension

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

  // Function to get random rotation (slight tilt) for post-it note effect - Not needed for gallery
  // const getRandomRotation = () => { ... };

  return (
    <div className="container py-8 space-y-8">
      {/* Hero Section */}
      <div className="space-y-4">
        <h1 className="text-4xl font-bold">Recruitment Intelligence Hub</h1>
        <p className="text-muted-foreground text-lg">
          Streamline your recruitment process with AI-powered tools and analytics
        </p>
      </div>

      {/* Tools Carousel (Stashed version) */}
      <div className="w-full"> {/* Container for the gallery */}
        <RollingGallery
          autoplay={true}
          pauseOnHover={true}
          images={toolCards.map((tool) => (
            // We pass the fully rendered Card component as an item
            <Card
              key={tool.path}
              // Adjusted classes for carousel context - remove aspect-square, maybe adjust hover
              className={`group transition-all ${tool.color} border-transparent w-[300px] h-[200px] flex flex-col`} // Example fixed size
            >
              <CardHeader className="flex-grow flex flex-col p-4"> {/* Adjust padding */}
                <CardTitle className="flex items-center gap-2 text-lg mb-2"> {/* Adjust text size/margin */}
                  <tool.icon className="h-5 w-5" /> {/* Adjust icon size */}
                  {tool.title}
                </CardTitle>
                <CardDescription className="flex-grow text-sm mb-3"> {/* Adjust text size/margin */}
                  {tool.description}
                </CardDescription>
                <Button
                  variant="secondary" // Changed variant to secondary for more definition
                  size="sm" // Smaller button
                  className="w-full mt-auto text-xs" // Removed group-hover effect
                  onClick={() => navigate(tool.path)}
                >
                  Open Tool
                </Button>
              </CardHeader>
            </Card>
          ))}
        />
      </div>
    </div>
  );
};

export default Dashboard;
