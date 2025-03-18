
import { useState, useEffect } from "react";
import { SearchResult } from "../types";

/**
 * Hook for managing search result display options
 */
export const useSearchDisplay = (
  results: SearchResult[],
  initialSearchString?: string,
  searchTerm?: string,
  setSearchString?: (value: React.SetStateAction<string>) => void
) => {
  const [showResultsAs, setShowResultsAs] = useState<'cards' | 'list'>('cards');
  const [expandedCardId, setExpandedCardId] = useState<string | null>(null);
  
  // Formatted profiles for card display
  const formattedProfiles = results.map(result => ({
    id: result.link,
    name: result.name,
    title: result.jobTitle || '',
    location: result.location || '',
    profile_name: result.name,
    profile_title: result.jobTitle || '',
    profile_location: result.location || '',
    profile_url: result.profileUrl || result.link,
    snippet: result.snippet || ''  // Ensure snippet is included in formatted profiles
  }));

  // Initialize search string from props if available
  useEffect(() => {
    if (setSearchString) {
      if (initialSearchString && initialSearchString.trim() !== '') {
        setSearchString(initialSearchString);
      } else if (searchTerm && searchTerm.trim() !== '') {
        setSearchString(searchTerm);
      }
    }
  }, [initialSearchString, searchTerm, setSearchString]);

  // Toggle between cards and list view
  const toggleDisplayMode = () => {
    setShowResultsAs(prev => prev === 'cards' ? 'list' : 'cards');
  };

  // Toggle expanded card
  const toggleCardExpansion = (id: string) => {
    setExpandedCardId(prev => prev === id ? null : id);
  };

  return {
    showResultsAs,
    toggleDisplayMode,
    formattedProfiles,
    expandedCardId,
    toggleCardExpansion
  };
};
