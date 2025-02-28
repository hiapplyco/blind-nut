
import { useState, useEffect } from "react";
import { Clock } from "lucide-react";

interface InterviewStatusProps {
  startTime: Date;
  isRecording: boolean;
}

export const InterviewStatus = ({ 
  startTime, 
  isRecording 
}: InterviewStatusProps) => {
  const [elapsedTime, setElapsedTime] = useState("00:00");
  
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      const diff = Math.floor((now.getTime() - startTime.getTime()) / 1000);
      
      const minutes = Math.floor(diff / 60).toString().padStart(2, '0');
      const seconds = (diff % 60).toString().padStart(2, '0');
      
      setElapsedTime(`${minutes}:${seconds}`);
    }, 1000);
    
    return () => clearInterval(timer);
  }, [startTime]);
  
  return (
    <div className="absolute top-20 left-4 bg-[#F8F5FF] p-3 rounded-lg shadow-md border border-[#7E69AB] z-30">
      <div className="flex items-center space-x-3">
        <div className="flex items-center">
          <Clock className="h-4 w-4 mr-2 text-[#9b87f5]" />
          <span className="text-sm font-medium">{elapsedTime}</span>
        </div>
        
        {isRecording && (
          <>
            <div className="h-4 w-[1px] bg-gray-300"></div>
            <div className="flex items-center">
              <span className="relative flex h-3 w-3 mr-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
              </span>
              <span className="text-sm font-medium text-red-600">Recording</span>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
