
export interface SearchFormHeaderProps {
  isProcessingComplete: boolean;
  currentJobId?: number | null;
  hasAgentOutput?: boolean;
  onViewReport?: () => void;
  showSourcingTips?: boolean;
}

export const SearchFormHeader = ({ 
  isProcessingComplete,
  currentJobId,
  hasAgentOutput,
  onViewReport,
  showSourcingTips = true
}: SearchFormHeaderProps) => {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold">Find Qualified Candidates</h2>
        <p className="text-gray-600">
          Paste a job description or requirements to generate a boolean search string and find matching candidates.
        </p>
      </div>
      
      {showSourcingTips && (
        <div className="p-4 bg-[#FEF7CD] rounded-lg border-2 border-black">
          <h3 className="text-sm font-bold mb-2">Sourcing Tips</h3>
          <ul className="space-y-1.5 text-sm">
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
        </div>
      )}
    </div>
  );
};
