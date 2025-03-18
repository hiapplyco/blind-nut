
import { SearchResult } from "../../types";
import { toast } from "sonner";

/**
 * Extracts location information from a search result snippet
 */
export const extractLocationFromSnippet = (snippet: string): string | undefined => {
  const locationPatterns = [
    /Location: ([^\.]+)/i,
    /([^\.]+), (United States|Canada|UK|Australia|[A-Z][a-z]+ [A-Z][a-z]+)/,
    /(.*) Area/
  ];
  
  for (const pattern of locationPatterns) {
    const match = snippet.match(pattern);
    if (match && match[1]) {
      return match[1].trim();
    }
  }
  
  return undefined;
};

/**
 * Prepares search string for Google search, adding site:linkedin.com/in/ if needed
 */
export const prepareSearchString = (searchString: string, searchType: string): string => {
  let finalSearchString = searchString;
  if (searchType === "candidates" && !finalSearchString.includes("site:linkedin.com/in/")) {
    finalSearchString = `${finalSearchString} site:linkedin.com/in/`;
  }
  return finalSearchString;
};

/**
 * Exports search results to CSV file
 */
export const exportResultsToCSV = (results: SearchResult[]): void => {
  if (results.length === 0) {
    toast.error("No results to export");
    return;
  }

  const csvContent = [
    ["Title", "URL", "Location", "Description"],
    ...results.map(result => [
      result.title.replace(/"/g, '""'),
      result.link,
      result.location || "",
      result.snippet.replace(/"/g, '""')
    ])
  ]
    .map(row => row.map(cell => `"${cell}"`).join(","))
    .join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  link.setAttribute("href", url);
  link.setAttribute("download", `search-results-${new Date().toISOString().split('T')[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);

  toast.success("Search results exported successfully");
};

/**
 * Removes site:linkedin.com/in/ from search string for display purposes
 */
export const cleanSearchString = (searchString: string): string => {
  return searchString.replace(/\s*site:linkedin\.com\/in\/\s*/g, '');
};
