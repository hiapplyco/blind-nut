
import { format } from "date-fns";
import { Search, FileText, RotateCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ResumeMatcher } from "@/components/resume/ResumeMatcher";
import { type SearchCardData } from "./types";

interface SearchCardProps {
  search: SearchCardData;
  onDownloadReport: (jobId: number) => Promise<void>;
  onRunAgain: (jobId: number) => Promise<void>;
  isProcessing: boolean;
}

export const SearchCard = ({ 
  search, 
  onDownloadReport, 
  onRunAgain,
  isProcessing 
}: SearchCardProps) => {
  return (
    <Card key={search.id} className="p-6 hover:shadow-lg transition-shadow">
      <div className="space-y-4">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-gray-600">
              <Search className="h-4 w-4" />
              <span className="font-medium">
                {format(new Date(search.created_at), 'MMM d, yyyy')}
              </span>
            </div>
            
            <h2 className="text-lg font-semibold">
              {search.title || "Untitled Search"}
            </h2>
            
            {search.summary && (
              <p className="text-sm text-gray-600 line-clamp-2">
                {search.summary}
              </p>
            )}
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
              onClick={() => onDownloadReport(search.id)}
            >
              <FileText className="h-4 w-4" />
              Download Report
            </Button>

            <Button
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
              onClick={() => onRunAgain(search.id)}
              disabled={isProcessing}
            >
              <RotateCw className={`h-4 w-4 ${isProcessing ? 'animate-spin' : ''}`} />
              Run Again
            </Button>
          </div>
        </div>

        <div className="mt-6 space-y-4 border-t pt-4">
          <h3 className="text-lg font-semibold">Job Analysis Report</h3>
          <div className="space-y-6">
            {search.agent_outputs?.[0]?.job_summary && (
              <div>
                <h4 className="font-medium mb-2">Job Summary</h4>
                <p className="text-sm text-gray-600">
                  {search.agent_outputs[0].job_summary}
                </p>
              </div>
            )}
            
            <ResumeMatcher jobId={search.id} userId={search.user_id} />
          </div>
        </div>
      </div>
    </Card>
  );
};
