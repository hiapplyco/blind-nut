
import React from 'react';

interface SearchErrorStateProps {
  error: Error;
  onRetry: () => void;
}

export const SearchErrorState = ({ error, onRetry }: SearchErrorStateProps) => {
  return (
    <div className="bg-red-50 text-red-700 p-4 rounded-md border border-red-300">
      <h3 className="font-medium mb-2">Error finding profiles</h3>
      <p>{error.message}</p>
      <div className="mt-4">
        <button
          onClick={onRetry}
          className="px-3 py-1 bg-red-100 border border-red-300 rounded text-sm hover:bg-red-200"
        >
          Retry Search
        </button>
      </div>
    </div>
  );
};
