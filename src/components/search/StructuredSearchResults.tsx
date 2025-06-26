import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, MapPin, Briefcase, ExternalLink, ChevronLeft, ChevronRight, Mail } from 'lucide-react';
import { fetchSearchResults, processSearchResults } from './hooks/google-search/searchApi';
import { SearchResult } from './types';
import { toast } from 'sonner';
import { useProfileEnrichment } from './hooks/useProfileEnrichment';
import { ContactInfoModal } from './ContactInfoModal';
import { ErrorBoundary } from '@/components/ErrorBoundary';

export interface StructuredSearchResultsProps {
  searchString: string;
  jobId?: number;
  searchType?: string;
}

export const StructuredSearchResults: React.FC<StructuredSearchResultsProps> = ({
  searchString,
  jobId,
  searchType = 'candidates'
}) => {
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalResults, setTotalResults] = useState(0);
  const resultsPerPage = 10;

  // Contact info modal state
  const [selectedProfile, setSelectedProfile] = useState<{ url: string; name: string } | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Use the profile enrichment hook
  const { enrichProfile, enrichedData, isLoading: isEnriching } = useProfileEnrichment();

  useEffect(() => {
    if (searchString) {
      loadResults(1);
    }
  }, [searchString]);

  const loadResults = async (page: number) => {
    setIsLoading(true);
    try {
      const { data, error } = await fetchSearchResults(
        searchString,
        page,
        searchType,
        resultsPerPage
      );

      if (error) {
        console.error('Error fetching results:', error);
        toast.error('Failed to fetch search results');
        return;
      }

      if (data) {
        const processedResults = processSearchResults(data);
        setResults(processedResults);
        setTotalResults(parseInt(data.searchInformation?.totalResults || '0'));
        setCurrentPage(page);
      }
    } catch (error) {
      console.error('Error loading results:', error);
      toast.error('Failed to load search results');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      loadResults(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    const maxPages = Math.ceil(totalResults / resultsPerPage);
    if (currentPage < maxPages) {
      loadResults(currentPage + 1);
    }
  };

  const handleGetContactInfo = async (profileUrl: string, profileName: string) => {
    try {
      console.log('Getting contact info for:', profileUrl, profileName);
      
      // Set the selected profile and open modal
      setSelectedProfile({ url: profileUrl, name: profileName });
      setIsModalOpen(true);
      
      // Enrich the profile
      const result = await enrichProfile(profileUrl);
      console.log('Enrichment result:', result);
    } catch (error) {
      console.error('Error getting contact info:', error);
      toast.error('Failed to get contact information');
      setIsModalOpen(false);
    }
  };

  const extractProfileInfo = (result: SearchResult) => {
    // Extract clean name (remove LinkedIn suffix)
    const name = result.name || result.title?.replace(/\s*\|\s*LinkedIn.*$/i, '').trim() || 'Unknown';
    
    // Extract job title from snippet or title
    let jobTitle = result.jobTitle;
    if (!jobTitle && result.snippet) {
      // Try to extract from snippet (usually format: "Job Title at Company · Location")
      const match = result.snippet.match(/^([^·]+)·/);
      if (match) {
        jobTitle = match[1].trim();
      }
    }
    
    // Extract company from snippet
    let company = '';
    if (result.snippet) {
      const companyMatch = result.snippet.match(/at\s+([^·]+)·/);
      if (companyMatch) {
        company = companyMatch[1].trim();
      }
    }

    return { name, jobTitle, company };
  };

  if (isLoading && results.length === 0) {
    return (
      <Card className="p-8 border-2 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,0.25)]">
        <div className="flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin mr-2" />
          <span className="text-lg">Searching LinkedIn profiles...</span>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card className="p-4 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,0.25)]">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">
            LinkedIn Profile Results
          </h3>
          <span className="text-sm text-gray-600">
            {totalResults > 0 ? `${totalResults} results found` : 'No results'}
          </span>
        </div>

        {results.length === 0 && !isLoading ? (
          <div className="text-center py-8 text-gray-500">
            No profiles found. Try adjusting your search criteria.
          </div>
        ) : (
          <div className="space-y-3">
            {results.map((result, index) => {
              const { name, jobTitle, company } = extractProfileInfo(result);
              
              return (
                <div
                  key={`${result.link}-${index}`}
                  className="p-4 border border-gray-200 rounded-lg hover:border-black hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,0.15)] transition-all duration-200"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium text-lg text-blue-600 hover:underline">
                        <a
                          href={result.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1"
                        >
                          {name}
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </h4>
                      
                      {(jobTitle || company) && (
                        <div className="flex items-center gap-2 mt-1 text-sm text-gray-600">
                          <Briefcase className="w-4 h-4" />
                          <span>
                            {jobTitle}
                            {jobTitle && company && ' at '}
                            {company && <span className="font-medium">{company}</span>}
                          </span>
                        </div>
                      )}
                      
                      {result.location && (
                        <div className="flex items-center gap-2 mt-1 text-sm text-gray-600">
                          <MapPin className="w-4 h-4" />
                          <span>{result.location}</span>
                        </div>
                      )}
                      
                      {result.snippet && (
                        <p className="mt-2 text-sm text-gray-700 line-clamp-2">
                          {result.snippet}
                        </p>
                      )}
                      
                      {/* Get Contact Info Button */}
                      <div className="mt-3">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleGetContactInfo(result.link, name)}
                          className="border-purple-200 text-purple-700 hover:bg-purple-50 hover:border-purple-300 transition-all duration-200"
                        >
                          <Mail className="w-4 h-4 mr-2" />
                          Get Contact Info
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination Controls */}
        {totalResults > resultsPerPage && (
          <div className="flex items-center justify-between mt-6 pt-4 border-t">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePreviousPage}
              disabled={currentPage === 1 || isLoading}
              className="border-black hover:bg-gray-100"
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Previous
            </Button>
            
            <span className="text-sm text-gray-600">
              Page {currentPage} of {Math.ceil(totalResults / resultsPerPage)}
            </span>
            
            <Button
              variant="outline"
              size="sm"
              onClick={handleNextPage}
              disabled={currentPage >= Math.ceil(totalResults / resultsPerPage) || isLoading}
              className="border-black hover:bg-gray-100"
            >
              Next
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        )}
      </Card>

      {/* Contact Info Modal wrapped in ErrorBoundary */}
      <ErrorBoundary>
        <ContactInfoModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedProfile(null);
          }}
          profileData={enrichedData}
          isLoading={isEnriching}
          profileName={selectedProfile?.name || ''}
        />
      </ErrorBoundary>
    </div>
  );
};

export default StructuredSearchResults;