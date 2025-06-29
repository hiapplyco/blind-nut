import React, { useState } from 'react';
import { X, Link2, Loader2, FileText, CheckCircle2 } from 'lucide-react';
import { FirecrawlService } from '../../utils/FirecrawlService';
import { supabase } from '../../lib/supabase';
import { toast } from 'react-hot-toast';
import { useProject } from '../../context/ProjectContext';

interface URLScrapeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScrapedContent: (content: { text: string; rawContent: string; url: string }) => void;
  context?: string;
  projectId?: string;
}

export function URLScrapeModal({
  isOpen,
  onClose,
  onScrapedContent,
  context = 'general',
  projectId
}: URLScrapeModalProps) {
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [scrapedData, setScrapedData] = useState<{ text: string; rawContent: string } | null>(null);
  const { selectedProject } = useProject();
  
  // Use passed projectId or fall back to selected project
  const activeProjectId = projectId || selectedProject?.id;

  const handleScrape = async () => {
    if (!url) {
      toast.error('Please enter a URL');
      return;
    }

    try {
      setIsLoading(true);
      const result = await FirecrawlService.crawlWebsite(url);
      
      if (result.success && result.data) {
        setScrapedData({
          text: result.data.text,
          rawContent: result.data.rawContent
        });
        
        // Save to project if we have one
        if (activeProjectId) {
          await saveToProject(result.data.text, result.data.rawContent);
        }
        
        toast.success('Content scraped successfully!');
      } else {
        throw new Error(result.error || 'Failed to scrape content');
      }
    } catch (error) {
      console.error('Error scraping URL:', error);
      toast.error('Failed to scrape URL. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const saveToProject = async (text: string, rawContent: string) => {
    if (!activeProjectId) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Save scraped data to project metadata
      const { error } = await supabase
        .from('project_scraped_data')
        .insert({
          project_id: activeProjectId,
          user_id: user.id,
          url,
          summary: text,
          raw_content: rawContent,
          context,
          metadata: {
            scraped_at: new Date().toISOString(),
            source: 'url_scraper'
          }
        });

      if (error) {
        console.error('Error saving to project:', error);
        // Don't throw - we still want to use the scraped content
      }
    } catch (error) {
      console.error('Error in saveToProject:', error);
    }
  };

  const handleUseContent = () => {
    if (scrapedData) {
      onScrapedContent({
        text: scrapedData.text,
        rawContent: scrapedData.rawContent,
        url
      });
      handleClose();
    }
  };

  const handleClose = () => {
    setUrl('');
    setScrapedData(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-[#39FF14] to-[#00D4FF] rounded-lg flex items-center justify-center">
              <Link2 className="w-6 h-6 text-black" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-white">Import from URL</h2>
              {activeProjectId && selectedProject && (
                <p className="text-sm text-gray-400">
                  Saving to project: {selectedProject.name}
                </p>
              )}
            </div>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {!scrapedData ? (
            <>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Website URL
                  </label>
                  <div className="relative">
                    <input
                      type="url"
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      placeholder="https://example.com/job-posting"
                      className="w-full bg-gray-800 text-white rounded-lg px-4 py-3 pr-12 
                               focus:outline-none focus:ring-2 focus:ring-[#39FF14]/50"
                      onKeyDown={(e) => e.key === 'Enter' && handleScrape()}
                    />
                    <Link2 className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                  </div>
                  <p className="text-sm text-gray-400 mt-2">
                    Enter a URL to import content from any website
                  </p>
                </div>

                <button
                  onClick={handleScrape}
                  disabled={isLoading || !url}
                  className="w-full bg-gradient-to-r from-[#39FF14] to-[#00D4FF] 
                           text-black font-semibold py-3 rounded-lg
                           hover:shadow-lg hover:shadow-[#39FF14]/20 
                           transition-all duration-200 
                           disabled:opacity-50 disabled:cursor-not-allowed
                           flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Scraping content...
                    </>
                  ) : (
                    <>
                      <FileText className="w-5 h-5" />
                      Scrape Content
                    </>
                  )}
                </button>
              </div>
            </>
          ) : (
            <div className="space-y-4">
              <div className="bg-gray-800 rounded-lg p-4 border border-[#39FF14]/20">
                <div className="flex items-center gap-2 mb-3">
                  <CheckCircle2 className="w-5 h-5 text-[#39FF14]" />
                  <h3 className="text-lg font-semibold text-white">Content Scraped Successfully</h3>
                </div>
                
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-400 mb-1">URL:</p>
                    <p className="text-sm text-white truncate">{url}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-400 mb-1">Summary:</p>
                    <div className="bg-gray-900 rounded p-3 max-h-60 overflow-y-auto">
                      <p className="text-sm text-gray-300 whitespace-pre-wrap">
                        {scrapedData.text}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleUseContent}
                  className="flex-1 bg-gradient-to-r from-[#39FF14] to-[#00D4FF] 
                           text-black font-semibold py-3 rounded-lg
                           hover:shadow-lg hover:shadow-[#39FF14]/20 
                           transition-all duration-200"
                >
                  Use This Content
                </button>
                <button
                  onClick={() => setScrapedData(null)}
                  className="flex-1 bg-gray-800 text-white font-semibold py-3 rounded-lg
                           hover:bg-gray-700 transition-colors"
                >
                  Scrape Another URL
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}