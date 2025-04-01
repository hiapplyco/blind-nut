
import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { SearchType } from "../types";
import { fetchSearchString } from "./utils/fetchSearchString";

export const useFormState = (
  currentJobId: number | null,
  handleSubmit: (e: any, text: string, type: SearchType, company: string) => Promise<string | null>
) => {
  const location = useLocation();
  const [searchText, setSearchText] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [searchType, setSearchType] = useState<SearchType>("candidates");
  const [searchString, setSearchString] = useState("");

  // Handle auto-run from location state
  useEffect(() => {
    const state = location.state as { content?: string; autoRun?: boolean } | null;
    if (state?.content && state?.autoRun) {
      setSearchText(state.content);
      // Clear the state to prevent re-running
      window.history.replaceState({}, document.title);
      // Trigger the search
      const submitEvent = new Event('submit') as any;
      handleSubmit(submitEvent, state.content, searchType, companyName);
    }
  }, [location.state, handleSubmit, searchType, companyName]);

  // Fetch search string when job is created
  useEffect(() => {
    const getSearchString = async () => {
      const searchStr = await fetchSearchString(currentJobId);
      if (searchStr) {
        setSearchString(searchStr);
      }
    };

    getSearchString();
  }, [currentJobId]);

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
