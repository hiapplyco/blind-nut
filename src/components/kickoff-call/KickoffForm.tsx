
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FirecrawlService } from "@/utils/FirecrawlService";
import { Loader } from "lucide-react";

interface KickoffFormProps {
  isProcessing: boolean;
  filePaths: string[];
  title: string;
  onTitleChange: (title: string) => void;
}

export const KickoffForm = ({ isProcessing, filePaths, title, onTitleChange }: KickoffFormProps) => {
  const navigate = useNavigate();
  const [textInput, setTextInput] = useState("");
  const [url, setUrl] = useState("");
  const [isCrawling, setIsCrawling] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCrawl = async () => {
    if (!url.trim()) {
      toast.error("Please enter a URL to crawl");
      return;
    }

    setIsCrawling(true);
    try {
      const result = await FirecrawlService.crawlWebsite(url);
      if (result.success && result.data) {
        setTextInput(prev => prev + (prev ? '\n\n' : '') + result.data);
        toast.success("Successfully crawled website content!");
        setUrl('');
      } else {
        toast.error(result.error || "Failed to crawl website");
      }
    } catch (error) {
      console.error('Error crawling website:', error);
      toast.error("Failed to crawl website");
    } finally {
      setIsCrawling(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!textInput.trim() || !title.trim()) {
      toast.error("Please enter both a title and content");
      return;
    }

    setIsSubmitting(true);
    try {
      const { data: result, error: processingError } = await supabase.functions.invoke('process-kickoff-call', {
        body: {
          text: textInput,
          title,
          filePaths,
        },
      });

      if (processingError) throw processingError;

      toast.success("Successfully processed kickoff call information!");
      navigate(`/chat?callId=${result.id}&mode=kickoff`);

    } catch (error) {
      console.error('Error processing kickoff call:', error);
      toast.error("Failed to process kickoff call. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <label htmlFor="url" className="text-lg font-bold block">
          Website URL (optional)
        </label>
        <div className="flex gap-2">
          <Input
            id="url"
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Enter a website URL to scrape content"
            className="flex-1 p-4 border-4 border-black rounded bg-white 
              shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] font-medium focus:ring-0 focus:border-black
              transition-all duration-200 hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]
              hover:translate-x-[2px] hover:translate-y-[2px]"
          />
          <Button
            type="button"
            onClick={handleCrawl}
            disabled={isCrawling || !url.trim()}
            className="bg-[#8B5CF6] text-white py-4 px-6 rounded font-bold text-lg border-4 
              border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-1 
              hover:translate-x-1 hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all
              disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap
              animate-in fade-in duration-200"
          >
            {isCrawling ? (
              <div className="flex items-center gap-2">
                <Loader className="h-4 w-4 animate-spin" />
                Crawling...
              </div>
            ) : (
              'Crawl URL'
            )}
          </Button>
        </div>
      </div>

      <div className="space-y-2">
        <label htmlFor="content" className="text-lg font-bold block">
          Notes or Paste Content
        </label>
        <textarea
          id="content"
          value={textInput}
          onChange={(e) => setTextInput(e.target.value)}
          placeholder="Enter notes, requirements, or paste content here"
          className="w-full min-h-[200px] p-4 border-4 border-black rounded bg-white resize-none 
            shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] font-medium focus:ring-0 focus:border-black
            transition-all duration-200 hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]
            hover:translate-x-[2px] hover:translate-y-[2px]"
        />
      </div>

      <Button
        type="submit"
        className="w-full bg-[#8B5CF6] text-white py-4 rounded font-bold text-lg border-4 
          border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:translate-y-1 
          hover:translate-x-1 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all
          disabled:opacity-50 disabled:cursor-not-allowed animate-in fade-in duration-200"
        disabled={isSubmitting || !textInput.trim() || !title.trim()}
      >
        {isSubmitting ? (
          <div className="flex items-center justify-center gap-2">
            <Loader className="h-4 w-4 animate-spin" />
            Processing...
          </div>
        ) : (
          'Process Kickoff Call'
        )}
      </Button>
    </form>
  );
};
