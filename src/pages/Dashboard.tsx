import { 
  FileSearch, 
  Video, 
  UserCheck, 
  PhoneCall, 
  MessageSquare,
  PlusCircle,
  Briefcase,
  ArrowRight,
  Clock,
  Sparkles,
  Bot
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const navigate = useNavigate();

  const toolCards = [
    {
      title: "Search History & Projects",
      description: "View your search database, saved candidates, and manage recruitment projects",
      icon: Clock,
      path: "/search-history",
      gradient: "from-indigo-500 to-purple-600",
      badge: "Your Database",
      isPrimary: true
    },
    {
      title: "Sourcing Assistant",
      description: "Generate powerful boolean searches to find perfect candidates across LinkedIn and other platforms",
      icon: FileSearch,
      path: "/sourcing",
      gradient: "from-blue-500 to-cyan-500",
      badge: "Most Popular"
    },
    {
      title: "Post a Job",
      description: "Create compelling job postings with AI-powered optimization and market insights",
      icon: Briefcase,
      path: "/job-post",
      gradient: "from-red-500 to-pink-500"
    },
    {
      title: "Create LinkedIn Post",
      description: "Generate engaging recruitment content that attracts top talent to your opportunities",
      icon: PlusCircle,
      path: "/linkedin-post",
      gradient: "from-purple-500 to-violet-600"
    },
    {
      title: "Screening Room",
      description: "Conduct AI-assisted video interviews and get instant candidate evaluations",
      icon: Video,
      path: "/screening-room",
      gradient: "from-green-500 to-emerald-500"
    },
    {
      title: "Interview Prep",
      description: "Prepare role-specific interview questions and structured evaluation frameworks",
      icon: UserCheck,
      path: "/interview-prep",
      gradient: "from-yellow-500 to-orange-500"
    },
    {
      title: "Kickoff Call",
      description: "Transform hiring manager meetings into clear requirements and search strategies",
      icon: PhoneCall,
      path: "/kickoff-call",
      gradient: "from-orange-500 to-red-500"
    },
    {
      title: "Chat Assistant",
      description: "Your AI recruitment copilot for real-time guidance and task automation",
      icon: MessageSquare,
      path: "/chat",
      gradient: "from-pink-500 to-rose-500",
      badge: "AI Assistant"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Hero Section */}
        <div className="mb-8 md:mb-12 text-center px-4">
          <div className="flex justify-center mb-6">
            <img 
              src="https://kxghaajojntkqrmvsngn.supabase.co/storage/v1/object/public/logos/Apply2025logo.png"
              alt="Apply Logo"
              className="h-16 md:h-20 object-contain"
            />
          </div>
          <div className="max-w-4xl mx-auto space-y-4">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-gray-900 tracking-tight">
              The Agentic Approach to
              <span className="block bg-gradient-to-r from-[#8B5CF6] to-[#D946EF] bg-clip-text text-transparent">
                Talent Sourcing & Acquisition
              </span>
            </h1>
            <p className="text-lg sm:text-xl md:text-2xl text-gray-700 font-medium leading-relaxed">
              Apply revolutionizes recruitment with AI agents that handle the most critical challenge:
              <span className="block text-gray-900 font-semibold mt-2">
                Attracting and finding exceptional talent
              </span>
            </p>
            <div className="flex items-center justify-center gap-2 text-sm text-gray-600 mt-6">
              <Bot className="w-5 h-5 text-purple-600" />
              <span>Powered by specialized AI recruitment agents</span>
              <Sparkles className="w-5 h-5 text-purple-600" />
            </div>
          </div>
        </div>

        {/* Tools Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
          {toolCards.map((tool) => (
            <Card
              key={tool.path}
              className={`group relative overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 cursor-pointer bg-white ${
                tool.disabled ? 'opacity-60 cursor-not-allowed' : ''
              } ${
                tool.isPrimary ? 'md:col-span-2 lg:col-span-1' : ''
              }`}
              onClick={() => !tool.disabled && navigate(tool.path)}
            >
              {/* Gradient Background */}
              <div className={`absolute inset-0 bg-gradient-to-br ${tool.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />
              
              {/* Icon Background Circle */}
              <div className="absolute top-4 right-4 w-12 h-12 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <tool.icon className="h-6 w-6 text-gray-600 group-hover:text-gray-800 transition-colors duration-300" />
              </div>

              <CardHeader className="pb-6 pt-6 pr-16 sm:pr-20">
                <div className="flex items-start justify-between mb-3">
                  <CardTitle className="text-xl font-bold text-gray-900 group-hover:text-[#8B5CF6] transition-colors duration-300">
                    {tool.title}
                  </CardTitle>
                  {tool.badge && (
                    <Badge 
                      variant="secondary" 
                      className={`text-xs ${tool.isPrimary ? 'bg-purple-100 text-purple-700' : ''}`}
                    >
                      {tool.badge}
                    </Badge>
                  )}
                </div>
                <CardDescription className="text-gray-600 text-sm leading-relaxed mb-4">
                  {tool.description}
                </CardDescription>
                
                {/* Action Button */}
                <div className="flex items-center justify-between mt-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="p-0 h-auto text-[#8B5CF6] hover:text-[#9b87f5] font-medium group-hover:translate-x-1 transition-all duration-300 disabled:opacity-50"
                    disabled={tool.disabled}
                  >
                    {tool.disabled ? 'Coming Soon' : 'Open Tool'}
                    {!tool.disabled && <ArrowRight className="ml-2 h-4 w-4" />}
                  </Button>
                </div>
              </CardHeader>

              {/* Hover Border Effect */}
              <div className={`absolute inset-0 border-2 border-transparent group-hover:border-gradient-to-r group-hover:${tool.gradient} rounded-lg opacity-0 group-hover:opacity-20 transition-opacity duration-300`} />
            </Card>
          ))}
        </div>

        {/* Bottom CTA Section */}
        <div className="mt-12 sm:mt-16 text-center px-4">
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl shadow-lg p-6 sm:p-8 border border-purple-200">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Start Building Your Talent Pipeline Today
            </h2>
            <p className="text-gray-700 mb-6 max-w-2xl mx-auto text-lg">
              Join thousands of recruiters using Apply's agentic approach to find and attract top talent faster
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                onClick={() => navigate("/search-history")}
                variant="outline"
                className="border-[#8B5CF6] text-[#8B5CF6] hover:bg-[#8B5CF6] hover:text-white px-8 py-3 text-lg"
              >
                <Clock className="w-5 h-5 mr-2" />
                View Search History
              </Button>
              <Button 
                onClick={() => navigate("/sourcing")}
                className="bg-[#8B5CF6] hover:bg-[#9b87f5] text-white px-8 py-3 text-lg shadow-lg"
              >
                <Sparkles className="w-5 h-5 mr-2" />
                Start Sourcing Now
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;