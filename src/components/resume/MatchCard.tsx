
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText } from "lucide-react";

interface MatchCardProps {
  match: {
    id: number;
    similarity_score: number;
    created_at: string;
    parsed_resume: {
      skills?: string[];
      experience?: string[];
      education?: string[];
    } | null;
    parsed_job: {
      required_skills?: string[];
      qualifications?: string[];
      responsibilities?: string[];
    } | null;
    matching_keywords?: string[];
    matching_entities?: string[];
  };
  onViewReport: (matchId: number) => void;
}

export const MatchCard = ({ match, onViewReport }: MatchCardProps) => {
  return (
    <Card key={match.id} className="p-4">
      <div className="space-y-2">
        <div className="flex justify-between items-start">
          <div>
            <span className="text-sm text-gray-600">Similarity Score:</span>
            <span className="ml-2 text-lg font-semibold">
              {match.similarity_score}%
            </span>
          </div>
          <span className="text-sm text-gray-500">
            {new Date(match.created_at).toLocaleDateString()}
          </span>
        </div>

        <div className="mt-3 p-4 bg-gray-50 rounded-lg text-sm text-gray-700">
          <p>Based on the analysis:</p>
          <ul className="list-disc ml-4 mt-2 space-y-1">
            {match.parsed_resume?.skills && (
              <li>Your resume shows expertise in {match.parsed_resume.skills.slice(0, 3).join(', ')}</li>
            )}
            {match.parsed_job?.required_skills && (
              <li>The job requires skills in {match.parsed_job.required_skills.slice(0, 3).join(', ')}</li>
            )}
            <li>The {match.similarity_score}% match indicates {
              match.similarity_score >= 80 ? 'a strong alignment' :
              match.similarity_score >= 60 ? 'a good alignment' :
              'some alignment'
            } between your qualifications and the job requirements</li>
          </ul>
        </div>

        <div className="flex justify-end mt-4">
          <Button
            onClick={() => onViewReport(match.id)}
            className="bg-purple-600 text-white hover:bg-purple-700"
          >
            <FileText className="w-4 h-4 mr-2" />
            View Full Report
          </Button>
        </div>

        {match.matching_keywords && match.matching_keywords.length > 0 && (
          <div>
            <span className="text-sm text-gray-600">Matching Keywords:</span>
            <div className="flex flex-wrap gap-2 mt-1">
              {match.matching_keywords.map((keyword) => (
                <span
                  key={keyword}
                  className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full"
                >
                  {keyword}
                </span>
              ))}
            </div>
          </div>
        )}

        {match.matching_entities && match.matching_entities.length > 0 && (
          <div>
            <span className="text-sm text-gray-600">Matching Entities:</span>
            <div className="flex flex-wrap gap-2 mt-1">
              {match.matching_entities.map((entity) => (
                <span
                  key={entity}
                  className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                >
                  {entity}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};
