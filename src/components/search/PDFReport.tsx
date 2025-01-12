import { Terms } from "@/types/agent";

interface PDFReportProps {
  jobSummary: string;
  enhancedDescription: string;
  compensationAnalysis: string;
  terms: Terms | null;
  searchString: string;
}

export const PDFReport = ({ 
  jobSummary,
  enhancedDescription,
  compensationAnalysis,
  terms,
  searchString
}: PDFReportProps) => {
  return (
    <div className="p-8 space-y-8">
      <h1 className="text-3xl font-bold">Job Analysis Report</h1>
      
      <section className="space-y-4">
        <h2 className="text-2xl font-bold">Job Summary</h2>
        <div className="prose">{jobSummary}</div>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-bold">Enhanced Description</h2>
        <div className="prose">{enhancedDescription}</div>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-bold">Compensation Analysis</h2>
        <div className="prose">{compensationAnalysis}</div>
      </section>

      {terms && (
        <section className="space-y-4">
          <h2 className="text-2xl font-bold">Key Terms</h2>
          
          <div className="space-y-4">
            <div>
              <h3 className="text-xl font-semibold">Skills & Technologies</h3>
              <div className="flex flex-wrap gap-2">
                {terms.skills.map((skill, index) => (
                  <span key={index} className="px-2 py-1 bg-gray-100 rounded">
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-xl font-semibold">Job Titles</h3>
              <div className="flex flex-wrap gap-2">
                {terms.titles.map((title, index) => (
                  <span key={index} className="px-2 py-1 bg-gray-100 rounded">
                    {title}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-xl font-semibold">Keywords</h3>
              <div className="flex flex-wrap gap-2">
                {terms.keywords.map((keyword, index) => (
                  <span key={index} className="px-2 py-1 bg-gray-100 rounded">
                    {keyword}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      <section className="space-y-4">
        <h2 className="text-2xl font-bold">Search String</h2>
        <div className="p-4 bg-gray-100 rounded-lg font-mono text-sm overflow-x-auto">
          {searchString}
        </div>
      </section>
    </div>
  );
};