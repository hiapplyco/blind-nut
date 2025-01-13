import { Progress } from "@/components/ui/progress";
import { Card } from "@/components/ui/card";
import { Squirrel } from "lucide-react";

interface ProcessingProgressProps {
  message: string;
  progress: number;
  isComplete?: boolean;
}

export const ProcessingProgress = ({ message, progress, isComplete }: ProcessingProgressProps) => {
  return (
    <Card className="p-6 border-4 border-black bg-[#FFFBF4] shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
      <div className="space-y-6">
        <div className="flex items-center space-x-2">
          <Squirrel className="w-6 h-6 text-purple-500 animate-bounce" />
          <h3 className="text-xl font-bold">Purple Squirrel Search</h3>
        </div>
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-purple-700">
                {message}
              </span>
              <span className="text-sm text-gray-500">
                {progress}%
              </span>
            </div>
            <Progress 
              value={progress} 
              className="h-2"
              indicatorClassName={
                isComplete ? 'bg-purple-500' :
                'bg-purple-400 transition-all duration-500'
              }
            />
          </div>
        </div>
      </div>
    </Card>
  );
};