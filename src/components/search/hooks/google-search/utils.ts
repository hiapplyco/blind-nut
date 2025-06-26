
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
  
  // Common location patterns in LinkedIn snippets
  const patterns = [
    // Pattern 1: "Location · Experience" (after last ·)
    /·\s*([^·]+?)\s*(?:·\s*\d+\+?\s*years?|·\s*\d+\s*connections?|$)/i,
    // Pattern 2: Common location formats with comma
    /\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*\s*,\s*[A-Z]{2})\b/,
    // Pattern 3: "Greater/Metro Area" patterns
    /\b((?:Greater\s+)?[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*\s+(?:Area|Metro|Metropolitan\s+Area))\b/i,
    // Pattern 4: International format "City, Country"
    /\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*\s*,\s*[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\b/,
    // Pattern 5: Bay Area special case
    /\b((?:San Francisco\s+)?Bay\s+Area)\b/i,
  ];
  
  // Clean snippet from common non-location elements
  let cleanSnippet = snippet
    .replace(/\d+\+?\s*years?\s+of\s+experience/gi, '')
    .replace(/\d+\s*connections?\s+on\s+LinkedIn/gi, '')
    .replace(/View\s+\w+['']s?\s+profile/gi, '');
  
  // Try each pattern
  for (const pattern of patterns) {
    const match = cleanSnippet.match(pattern);
    if (match && match[1]) {
      const location = match[1].trim();
      // Validate it's not just random text
      if (location.length > 3 && location.length < 50) {
        return location;
      }
    }
  }
  
  // Fallback: Look for text after the last · that looks like a location
  const parts = snippet.split('·');
  if (parts.length > 1) {
    const lastPart = parts[parts.length - 1].trim();
    // Check if it looks like a location (not too long, not a number)
    if (lastPart.length < 50 && !lastPart.match(/^\d+/) && !lastPart.includes('experience')) {
      // Remove trailing connection count if present
      return lastPart.replace(/\s*\d+\s*connections?.*$/i, '').trim();
    }
  }
  
  return '';
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
    'Snippet'
  ].join(',');
  
  // Convert results to CSV rows
  const csvRows = results.map(result => {
    return [
      `"${(result.name || '').replace(/"/g, '""')}"`,
      `"${(result.jobTitle || '').replace(/"/g, '""')}"`,
      `"${(result.location || '').replace(/"/g, '""')}"`,
      `"${result.profileUrl || result.link || ''}"`,
      `"${(result.snippet || '').replace(/"/g, '""')}"`
    ].join(',');
  });
  
  // Combine headers and rows
  const csvContent = [headers, ...csvRows].join('\n');
  
  // Create and download the CSV file
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8' });
  saveAs(blob, `linkedin-search-results-${date}.csv`);
  
  console.log(`Exported ${results.length} results to CSV`);
};
