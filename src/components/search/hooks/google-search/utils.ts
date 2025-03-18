
import { saveAs } from "file-saver";
import { SearchResult } from "../../types";

/**
 * Cleans a search string by removing LinkedIn site restrictions
 */
export const cleanSearchString = (searchString: string): string => {
  return searchString
    .replace(/site:linkedin\.com\/in\//g, '')
    .replace(/\s+site:linkedin\.com\s*/g, ' ')
    .trim();
};

/**
 * Adds LinkedIn site restriction if not already present
 */
export const prepareSearchString = (searchString: string, searchType: string): string => {
  const cleanString = cleanSearchString(searchString);
  
  // If it's a candidate search and doesn't already have the LinkedIn site restriction, add it
  if ((searchType === 'candidates' || searchType === 'candidates-at-company') && 
      !searchString.includes('site:linkedin.com/in/')) {
    console.log("🔍 [CRITICAL] Adding site:linkedin.com/in/ to search string");
    return `${cleanString} site:linkedin.com/in/`;
  }
  
  // If it already includes the site restriction, return as is
  if (searchString.includes('site:linkedin.com/in/')) {
    console.log("🔍 [DEBUG] Search string already includes site:linkedin.com/in/");
    return searchString;
  }
  
  console.log("🔍 [DEBUG] Using search string as-is:", cleanString);
  return cleanString;
};

/**
 * Extracts location information from a snippet
 */
export const extractLocationFromSnippet = (snippet: string): string => {
  if (!snippet) return '';
  
  // Try to find location after a pipe symbol (common format in LinkedIn snippets)
  const pipeMatch = snippet.match(/\|\s*([^|]+?)(?:\s*\||$)/);
  if (pipeMatch && pipeMatch[1]) {
    return pipeMatch[1].trim();
  }
  
  // Try to match common location patterns (City, State/Country format)
  const locationMatch = snippet.match(/([A-Za-z\s]+,\s*[A-Za-z\s]+)/);
  return locationMatch ? locationMatch[1].trim() : '';
};

/**
 * Exports search results to CSV file
 */
export const exportResultsToCSV = (results: SearchResult[]): void => {
  if (!results || results.length === 0) return;

  // Format the current date for the filename
  const date = new Date().toISOString().split('T')[0];
  
  // Define CSV headers
  const headers = [
    'Name',
    'Title',
    'Location',
    'Profile URL',
    'Relevance Score'
  ].join(',');
  
  // Convert results to CSV rows
  const csvRows = results.map(result => {
    return [
      `"${result.name.replace(/"/g, '""')}"`,
      `"${result.jobTitle?.replace(/"/g, '""') || ''}"`,
      `"${result.location?.replace(/"/g, '""') || ''}"`,
      `"${result.profileUrl || result.link}"`,
      result.relevance_score || ''
    ].join(',');
  });
  
  // Combine headers and rows
  const csvContent = [headers, ...csvRows].join('\n');
  
  // Create and download the CSV file
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8' });
  saveAs(blob, `linkedin-search-results-${date}.csv`);
  
  console.log(`Exported ${results.length} results to CSV`);
};
