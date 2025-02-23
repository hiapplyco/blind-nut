
import { ArrowLeft, History } from "lucide-react";
import { Link } from "react-router-dom";

export const ScreeningHeader = () => {
  return (
    <header className="bg-[#F8F5FF] border-b border-[#7E69AB] p-4 flex justify-between items-center">
      <Link 
        to="/" 
        className="flex items-center text-[#4A2B1C] hover:text-[#9b87f5] transition-colors"
      >
        <ArrowLeft className="w-5 h-5 mr-2" />
        <span>Back to Search</span>
      </Link>
      <Link 
        to="/dashboard" 
        className="flex items-center text-[#4A2B1C] hover:text-[#9b87f5] transition-colors"
      >
        <History className="w-5 h-5 mr-2" />
        <span>View History</span>
      </Link>
    </header>
  );
};
