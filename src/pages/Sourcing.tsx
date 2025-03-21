
import { lazy, Suspense, memo, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useAgentOutputs } from "@/stores/useAgentOutputs";
import { Card } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

// Lazy load components to improve initial page load
const NewSearchForm = lazy(() => import("@/components/NewSearchForm"));

const LoadingState = () => (
  <div className="h-96 flex items-center justify-center">
    <Loader2 className="h-8 w-8 animate-spin text-[#8B5CF6]" />
  </div>
);

const SourcingComponent = () => {
  const { session } = useAuth();
  const location = useLocation();
  const jobId = location.state?.jobId;
  const processedRequirements = location.state?.processedRequirements;
  const autoRun = location.state?.autoRun;
  
  // Pre-fetch agent outputs if we have a jobId
  const { data: agentOutput } = useAgentOutputs(jobId || 0);

  return (
    <div className="container max-w-4xl py-8 space-y-8">
      {/* Page header */}
      <div className="space-y-2">
        <h1 className="text-4xl font-bold text-[#8B5CF6]">Candidate Sourcing</h1>
        <p className="text-gray-600 text-lg">
          Find qualified candidates, research companies, or discover talent at specific organizations
        </p>
      </div>
      
      {/* Main content card */}
      <Card className="border-2 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,0.25)] bg-white p-6">
        <Suspense fallback={<LoadingState />}>
          <NewSearchForm 
            userId={session?.user?.id ?? null}
            initialRequirements={processedRequirements}
            initialJobId={jobId}
            autoRun={autoRun}
          />
        </Suspense>
      </Card>
      
      {/* Additional help card */}
      <Card className="p-6 border-2 border-black bg-[#FEF7CD] shadow-[6px_6px_0px_0px_rgba(0,0,0,0.25)]">
        <h3 className="text-lg font-bold mb-2">Sourcing Tips</h3>
        <ul className="space-y-2 text-sm">
          <li className="flex gap-2">
            <span className="font-bold">⚡</span>
            <span>Use specific keywords related to the skills and experience you're looking for</span>
          </li>
          <li className="flex gap-2">
            <span className="font-bold">⚡</span>
            <span>Include location if you're searching for candidates in a specific area</span>
          </li>
          <li className="flex gap-2">
            <span className="font-bold">⚡</span>
            <span>When searching for candidates at a company, try different variations of the company name</span>
          </li>
          <li className="flex gap-2">
            <span className="font-bold">⚡</span>
            <span>Use the "Get Contact Info" button to access candidate contact details</span>
          </li>
        </ul>
      </Card>
    </div>
  );
};

// Memo the component to prevent unnecessary re-renders
const Sourcing = memo(SourcingComponent);
export default Sourcing;
