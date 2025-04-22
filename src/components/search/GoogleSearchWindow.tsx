
import React from 'react';

export interface GoogleSearchWindowProps {
  initialSearchString?: string;
  searchString?: string; // Add this to support both properties
  searchTerm?: string; // Add support for searchTerm
  jobId?: number;
}

export const GoogleSearchWindow: React.FC<GoogleSearchWindowProps> = ({ 
  initialSearchString, 
  searchString,
  searchTerm, // Add searchTerm parameter
  jobId 
}) => {
  // Use either searchString or initialSearchString (for backward compatibility)
  const effectiveSearchString = searchString || initialSearchString || '';
  
  // Encode the search string for use in the Google search URL
  const encodedSearchString = encodeURIComponent(effectiveSearchString);
  const googleSearchUrl = `https://www.google.com/search?q=${encodedSearchString}&igu=1`;
  
  return (
    <div className="border-2 border-black rounded-md overflow-hidden shadow-[4px_4px_0px_0px_rgba(0,0,0,0.25)]">
      <div className="bg-gray-100 p-2 border-b border-gray-300 flex items-center">
        <div className="flex space-x-1 mr-3">
          <div className="w-3 h-3 rounded-full bg-red-500"></div>
          <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
          <div className="w-3 h-3 rounded-full bg-green-500"></div>
        </div>
        <div className="bg-white rounded px-3 py-1 text-xs flex-1 truncate border border-gray-300">
          {effectiveSearchString || searchTerm || "Google Search"}
        </div>
      </div>
      <div className="h-[500px] bg-white">
        {effectiveSearchString ? (
          <iframe
            src={googleSearchUrl}
            className="w-full h-full border-0"
            title="Google Search Results"
          />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500">
            Enter a search query to see results
          </div>
        )}
      </div>
    </div>
  );
};

export default GoogleSearchWindow;
