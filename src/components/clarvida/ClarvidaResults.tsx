
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

interface ClarvidaResultsProps {
  data: any;
  onNewSearch: () => void;
}

export function ClarvidaResults({ data, onNewSearch }: ClarvidaResultsProps) {
  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Analysis Results</h2>
        <Button onClick={onNewSearch} variant="outline">New Analysis</Button>
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
        
        {data?.interview_questions && data.interview_questions.length > 0 && (
          <InterviewQuestionsCard data={{ interview_questions: data.interview_questions }} />
        )}
        
        {data?.benefits_description && (
          <BenefitsDescriptionCard data={data.benefits_description} />
        )}
        
        {data?.previous_job_titles && (
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
