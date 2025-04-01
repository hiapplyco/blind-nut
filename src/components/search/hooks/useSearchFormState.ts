
import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { SearchType } from "../types";

/**
 * Hook for managing search form state
 */
export const useSearchFormState = (
  initialSearchText: string = ""
) => {
  const location = useLocation();
  const [searchText, setSearchText] = useState(initialSearchText);
  const [companyName, setCompanyName] = useState("");
  const [searchType, setSearchType] = useState<SearchType>("candidates");
  const [searchString, setSearchString] = useState("");

  // Handle content from location state
  useEffect(() => {
    const state = location.state as { content?: string; autoRun?: boolean } | null;
    if (state?.content) {
      setSearchText(state.content);
    }
  }, [location.state]);

  return {
    searchText,
    setSearchText,
    companyName,
    setCompanyName,
    searchType,
    setSearchType,
    searchString,
    setSearchString
  };
};
