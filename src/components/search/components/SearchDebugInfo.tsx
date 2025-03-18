
import React from 'react';

interface SearchDebugInfoProps {
  searchString: string;
  initialSearchString?: string;
  searchTerm?: string;
  isLoading: boolean;
  totalResults: number;
  resultsCount: number;
  error: Error | null;
}

export const SearchDebugInfo = ({
  searchString,
  initialSearchString,
  searchTerm,
  isLoading,
  totalResults,
  resultsCount,
  error
}: SearchDebugInfoProps) => {
  return (
    <div className="bg-blue-50 p-3 mb-2 border rounded text-xs font-mono">
      <div><strong>Debug:</strong> searchString: {searchString || "none"}</div>
      <div>initialSearchString: {initialSearchString || "none"}</div>
      <div>searchTerm: {searchTerm || "none"}</div>
      <div>isLoading: {isLoading ? "true" : "false"}</div>
      <div>totalResults: {totalResults}, resultsCount: {resultsCount}</div>
      {error && <div className="text-red-500">Error: {error.message}</div>}
    </div>
  );
};
