
import { Button } from "@/components/ui/button";
import { ArrowLeft, Linkedin, Search, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface JobEditorHeaderProps {
  onSourceCandidates: () => void;
  onCreateLinkedInPost: () => void;
  isSourceLoading: boolean;
  isPostLoading: boolean;
}

export function JobEditorHeader({ 
  onSourceCandidates, 
  onCreateLinkedInPost, 
  isSourceLoading, 
  isPostLoading 
}: JobEditorHeaderProps) {
  const navigate = useNavigate();

  return (
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => navigate(-1)}
          className="mr-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <h1 className="text-3xl font-bold">
          Job Analysis
        </h1>
      </div>
      <div className="flex gap-2">
        <Button
          onClick={onSourceCandidates}
          variant="outline"
          className="gap-2"
          disabled={isSourceLoading}
        >
          {isSourceLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Search className="h-4 w-4" />
          )}
          {isSourceLoading ? "Sourcing..." : "Source Candidates"}
        </Button>
        <Button
          onClick={onCreateLinkedInPost}
          variant="outline"
          className="gap-2"
          disabled={isPostLoading}
        >
          {isPostLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Linkedin className="h-4 w-4" />
          )}
          {isPostLoading ? "Creating..." : "Create LinkedIn Post"}
        </Button>
      </div>
    </div>
  );
}

