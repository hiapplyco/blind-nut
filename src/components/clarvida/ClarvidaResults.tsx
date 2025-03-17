
import { Button } from "@/components/ui/button";
import { CompensationAnalysisCard } from "./cards/CompensationAnalysisCard";
import { TimelineExpectationsCard } from "./cards/TimelineExpectationsCard";
import { CompanyDescriptionCard } from "./cards/CompanyDescriptionCard";
import { JobDescriptionEnhancerCard } from "./cards/JobDescriptionEnhancerCard";
import { NiceToHaveSkillsCard } from "./cards/NiceToHaveSkillsCard";
import { InterviewQuestionsCard } from "./cards/InterviewQuestionsCard";
import { BenefitsDescriptionCard } from "./cards/BenefitsDescriptionCard";
import { PreviousJobTitlesCard } from "./cards/PreviousJobTitlesCard";
import { BooleanSearchStringCard } from "./cards/BooleanSearchStringCard";
import { TalentLocationsCard } from "./cards/TalentLocationsCard";
import { JobAdSummaryCard } from "./cards/JobAdSummaryCard";
import { Search, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface ClarvidaResultsProps {
  data: any;
  onNewSearch: () => void;
  originalSearchText?: string;
}

export function ClarvidaResults({ data, onNewSearch, originalSearchText }: ClarvidaResultsProps) {
  const navigate = useNavigate();

  // Handle navigation to the sourcing page with search content
  const handleSearchCandidates = () => {
    if (originalSearchText) {
      navigate('/sourcing', { 
        state: { 
          content: originalSearchText, 
          autoRun: true 
        } 
      });
    }
  };

  // Add safety check for data
  if (!data) {
    return (
      <div className="space-y-8">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">Analysis Results</h2>
          <Button onClick={onNewSearch} variant="outline">New Analysis</Button>
        </div>
        
        <div className="text-center py-12">
          <p className="text-gray-500">No analysis data available. Please try a new search.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-bold">Analysis Results</h2>
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          {originalSearchText && (
            <Button 
              onClick={handleSearchCandidates} 
              className="flex items-center gap-2"
              variant="secondary"
            >
              <Search className="h-4 w-4" />
              Search Candidates
            </Button>
          )}
          <Button onClick={onNewSearch} variant="outline" className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            New Analysis
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {data?.compensation_analysis && (
          <CompensationAnalysisCard data={data.compensation_analysis} />
        )}
        
        {data?.timeline_expectations && (
          <TimelineExpectationsCard data={data.timeline_expectations} />
        )}
        
        {data?.company_description && (
          <CompanyDescriptionCard data={{ company_description: data.company_description }} />
        )}
        
        {data?.job_description_enhancer && (
          <JobDescriptionEnhancerCard data={data.job_description_enhancer} />
        )}
        
        {data?.nice_to_have_skills && (
          <NiceToHaveSkillsCard data={data.nice_to_have_skills} />
        )}
        
        {data?.interview_questions && Array.isArray(data.interview_questions) && data.interview_questions.length > 0 && (
          <InterviewQuestionsCard data={{ interview_questions: data.interview_questions }} />
        )}
        
        {data?.benefits_description && (
          <BenefitsDescriptionCard data={data.benefits_description} />
        )}
        
        {data?.previous_job_titles && Array.isArray(data.previous_job_titles) && (
          <PreviousJobTitlesCard data={data.previous_job_titles} />
        )}
        
        {data?.boolean_search_string && (
          <BooleanSearchStringCard data={data.boolean_search_string} />
        )}
        
        {data?.talent_locations && (
          <TalentLocationsCard data={data.talent_locations} />
        )}
        
        {data?.job_ad_summary && (
          <JobAdSummaryCard data={data.job_ad_summary} />
        )}
      </div>
    </div>
  );
}
