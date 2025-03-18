
import { useState, useEffect } from 'react';
import { SearchResult } from '../types';

export const useSearchDisplay = (
  results: SearchResult[],
  initialSearchString?: string,
  searchTerm?: string,
  setSearchString?: (value: string) => void
) => {
  const [showResultsAs, setShowResultsAs] = useState<'cards' | 'list'>('cards');
  
  // Update search string when props change
  useEffect(() => {
    if (initialSearchString && initialSearchString !== searchString && setSearchString) {
      console.log("🔍 [DEBUG] Setting search string from props:", initialSearchString);
      setSearchString(initialSearchString);
    } else if (searchTerm && !initialSearchString && !searchString && setSearchString) {
      console.log("🔍 [DEBUG] Setting search string from search term:", searchTerm);
      setSearchString(searchTerm);
    }
  }, [initialSearchString, searchTerm, setSearchString, searchString]);

  const toggleDisplayMode = () => {
    setShowResultsAs(prev => prev === 'cards' ? 'list' : 'cards');
  };
  
  // Format profile data for ProfilesList component
  const formattedProfiles = results.map(result => ({
    profile_name: result.name || result.title || "",
    profile_title: result.jobTitle || result.snippet || "",
    profile_location: result.location || "",
    profile_url: result.link || result.profileUrl || "",
    relevance_score: result.relevance_score || 75
  }));

  return {
    showResultsAs,
    toggleDisplayMode,
    formattedProfiles
  };
};
