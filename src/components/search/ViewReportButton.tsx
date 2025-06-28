
import { Button } from "@/components/ui/button";
import { FileText, MapPin, Calendar, DollarSign } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface AgentOutput {
  id: number;
  job_id: number;
  agent_type: string;
  output_data: any;
  created_at: string;
  updated_at: string;
  key_terms?: string;
  compensation_analysis?: string;
  enhanced_description?: string;
  job_summary?: string;
}

interface ViewReportButtonProps {
  agentOutput?: AgentOutput | null;
  searchString?: string;
  jobId?: number;
  onViewReport?: () => void;
}

export const ViewReportButton = ({ 
  agentOutput, 
  searchString, 
  jobId, 
  onViewReport 
}: ViewReportButtonProps) => {
  if (!agentOutput && !searchString) {
    return null;
  }

  const handleViewReport = () => {
    if (onViewReport) {
      onViewReport();
    } else if (jobId) {
      window.open(`/report/${jobId}`, '_blank');
    }
  };

  const renderAnalysisPreview = () => {
    if (!agentOutput?.output_data) return null;

    const data = agentOutput.output_data;
    
    return (
      <div className="mt-4 space-y-3">
        {data.compensation && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <DollarSign className="h-4 w-4" />
            <span>Compensation: {data.compensation}</span>
          </div>
        )}
        
        {data.location && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <MapPin className="h-4 w-4" />
            <span>Location: {data.location}</span>
          </div>
        )}
        
        {data.skills && Array.isArray(data.skills) && (
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-700">Key Skills:</p>
            <div className="flex flex-wrap gap-1">
              {data.skills.slice(0, 5).map((skill: string, index: number) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {skill}
                </Badge>
              ))}
            </div>
          </div>
        )}
        
        {data.experience_level && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Calendar className="h-4 w-4" />
            <span>Experience: {data.experience_level}</span>
          </div>
        )}

        {data.similar_titles && Array.isArray(data.similar_titles) && (
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-700">Similar Titles:</p>
            <div className="flex flex-wrap gap-1">
              {data.similar_titles.slice(0, 3).map((title: string, index: number) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {title}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {data.key_terms && Array.isArray(data.key_terms) && (
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-700">Key Terms:</p>
            <div className="flex flex-wrap gap-1">
              {data.key_terms.slice(0, 4).map((term: string, index: number) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {term}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-gray-600" />
          <h3 className="font-medium text-gray-900">Analysis Report</h3>
        </div>
        <Button 
          onClick={handleViewReport}
          variant="outline" 
          size="sm"
          className="gap-2"
        >
          <FileText className="h-4 w-4" />
          View Full Report
        </Button>
      </div>
      
      {renderAnalysisPreview()}
      
      {searchString && (
        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
          <p className="text-sm font-medium text-gray-700 mb-2">Generated Search String:</p>
          <p className="text-xs text-gray-600 font-mono bg-white p-2 rounded border">
            {searchString.length > 100 ? `${searchString.substring(0, 100)}...` : searchString}
          </p>
        </div>
      )}
    </div>
  );
};
