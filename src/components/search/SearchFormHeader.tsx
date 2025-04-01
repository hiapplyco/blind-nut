
export interface SearchFormHeaderProps {
  isProcessingComplete: boolean;
  currentJobId?: number | null;
  hasAgentOutput?: boolean;
  onViewReport?: () => void;
}

export const SearchFormHeader = ({ 
  isProcessingComplete,
  currentJobId,
  hasAgentOutput,
  onViewReport
}: SearchFormHeaderProps) => {
  return (
    <div className="space-y-2">
      <h2 className="text-2xl font-bold">Find Qualified Candidates</h2>
      <p className="text-gray-600">
        Paste a job description or requirements to generate a boolean search string and find matching candidates.
      </p>
    </div>
  );
};
