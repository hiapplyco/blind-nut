
import React from 'react';
import { Loader2 } from 'lucide-react';

interface LoadMoreButtonProps {
  onClick: () => void;
  isLoading: boolean;
}

export const LoadMoreButton = ({ onClick, isLoading }: LoadMoreButtonProps) => {
  return (
    <div className="mt-6 flex justify-center">
      <button 
        onClick={onClick}
        className="px-4 py-2 bg-[#8B5CF6] text-white rounded-md hover:bg-[#7C3AED] transition-colors"
        disabled={isLoading}
      >
        {isLoading ? (
          <>
            <Loader2 className="inline w-4 h-4 mr-2 animate-spin" />
            Loading...
          </>
        ) : (
          'Load More Results'
        )}
      </button>
    </div>
  );
};
