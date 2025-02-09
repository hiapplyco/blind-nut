
import { Loader2 } from "lucide-react";

interface LoadingStatesProps {
  isGenerating: boolean;
  isLoading: boolean;
  hasMessages: boolean;
}

export const LoadingStates = ({ isGenerating, isLoading, hasMessages }: LoadingStatesProps) => {
  if (isGenerating) {
    return (
      <div className="flex items-center gap-2 p-4 bg-yellow-50 rounded-lg">
        <Loader2 className="h-5 w-5 animate-spin text-yellow-600" />
        <span className="text-yellow-700">Generating initial summary...</span>
      </div>
    );
  }

  if (isLoading && hasMessages) {
    return (
      <div className="flex items-center gap-2 p-4 bg-gray-50 rounded-lg">
        <Loader2 className="h-5 w-5 animate-spin text-gray-600" />
        <span className="text-gray-700">Thinking...</span>
      </div>
    );
  }

  return null;
};
