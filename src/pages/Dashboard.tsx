
import { 
  FileSearch, 
  Video, 
  UserCheck, 
  PhoneCall, 
  MessageSquare,
  PlusCircle,
  Briefcase,
  ArrowRight
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
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
      gradient: "from-red-500 to-pink-500"
    },
    {
      title: "Create LinkedIn Post",
      description: "Generate engaging content for your recruitment campaigns",
      icon: PlusCircle,
      path: "/linkedin-post",
      gradient: "from-purple-500 to-violet-600"
    },
    {
      title: "Sourcing Assistant",
      description: "AI-powered candidate sourcing and job description analysis",
      icon: FileSearch,
      path: "/sourcing",
      gradient: "from-blue-500 to-cyan-500"
    },
    {
      title: "Screening Room",
      description: "Conduct and analyze candidate screening interviews",
      icon: Video,
      path: "/screening-room",
      gradient: "from-green-500 to-emerald-500"
    },
    {
      title: "Interview Prep",
      description: "Prepare structured interviews and evaluation criteria",
      icon: UserCheck,
      path: "/interview-prep",
      gradient: "from-yellow-500 to-orange-500"
    },
    {
      title: "Kickoff Call",
      description: "Generate meeting summaries and action items",
      icon: PhoneCall,
      path: "/kickoff-call",
      gradient: "from-orange-500 to-red-500"
    },
    {
      title: "Chat Assistant",
      description: "Get real-time help with recruitment tasks",
      icon: MessageSquare,
      path: "/chat",
      gradient: "from-pink-500 to-rose-500"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Hero Section */}
        <div className="mb-12 text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-4 bg-gradient-to-r from-[#8B5CF6] to-[#D946EF] bg-clip-text text-transparent">
            Recruitment Intelligence Hub
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Streamline your recruitment process with AI-powered tools and analytics
          </p>
        </div>

        {/* Tools Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {toolCards.map((tool) => (
            <Card
              key={tool.path}
              className="group relative overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 cursor-pointer bg-white"
              onClick={() => navigate(tool.path)}
            >
              {/* Gradient Background */}
              <div className={`absolute inset-0 bg-gradient-to-br ${tool.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />
              
              {/* Icon Background Circle */}
              <div className="absolute top-4 right-4 w-12 h-12 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <tool.icon className="h-6 w-6 text-gray-600 group-hover:text-gray-800 transition-colors duration-300" />
              </div>

              <CardHeader className="pb-6 pt-6 pr-20">
                <CardTitle className="text-xl font-bold text-gray-900 mb-3 group-hover:text-[#8B5CF6] transition-colors duration-300">
                  {tool.title}
                </CardTitle>
                <CardDescription className="text-gray-600 text-sm leading-relaxed mb-4">
                  {tool.description}
                </CardDescription>
                
                {/* Action Button */}
                <div className="flex items-center justify-between mt-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="p-0 h-auto text-[#8B5CF6] hover:text-[#9b87f5] font-medium group-hover:translate-x-1 transition-all duration-300"
                  >
                    Open Tool
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>

              {/* Hover Border Effect */}
              <div className={`absolute inset-0 border-2 border-transparent group-hover:border-gradient-to-r group-hover:${tool.gradient} rounded-lg opacity-0 group-hover:opacity-20 transition-opacity duration-300`} />
            </Card>
          ))}
        </div>

        {/* Bottom CTA Section */}
        <div className="mt-16 text-center">
          <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Ready to Transform Your Recruitment Process?
            </h2>
            <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
              Choose any tool above to get started with AI-powered recruitment solutions
            </p>
            <Button 
              onClick={() => navigate("/sourcing")}
              className="bg-[#8B5CF6] hover:bg-[#9b87f5] text-white px-8 py-3 text-lg"
            >
              Start with Sourcing Assistant
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
