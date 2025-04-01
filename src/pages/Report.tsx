
import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AnalysisResults } from "@/components/search/AnalysisResults";
import { Button } from "@/components/ui/button";
import { InterviewPrepModal } from "@/components/interview/InterviewPrepModal";
import { Video } from "lucide-react";

const Report = () => {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const [showInterviewPrep, setShowInterviewPrep] = useState(false);

  if (!jobId) {
    return null;
  }

  return (
    <div className="container max-w-4xl py-8">
      <div className="mb-6 flex justify-end">
        <Button 
          onClick={() => setShowInterviewPrep(true)}
          className="gap-2"
        >
          <Video className="h-4 w-4" />
          Practice Interview
        </Button>
      </div>

      <AnalysisResults 
        jobId={parseInt(jobId)} 
        onClose={() => navigate('/')} 
      />

      <InterviewPrepModal 
        isOpen={showInterviewPrep} 
        onClose={() => setShowInterviewPrep(false)} 
      />
    </div>
  );
};

export default Report;

