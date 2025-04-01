
import { memo } from "react";
import { Progress } from "@/components/ui/progress";

interface NavigationProgressProps {
  isNavigating: boolean;
  progress: number;
}

export const NavigationProgress = memo(function NavigationProgress({
  isNavigating,
  progress
}: NavigationProgressProps) {
  if (!isNavigating) return null;
  
  return (
    <div className="fixed top-0 left-0 w-full z-50">
      <Progress 
        value={progress} 
        className="h-1 rounded-none bg-transparent"
        indicatorClassName="bg-[#8B5CF6] transition-all duration-300 ease-in-out"
      />
    </div>
  );
});
