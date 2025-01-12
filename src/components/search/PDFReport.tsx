import { Terms } from "@/types/agent";
import ReactMarkdown from 'react-markdown';

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
    <div className="p-12 space-y-12">
      <h1 className="text-4xl font-bold mb-8">Job Analysis Report</h1>
      
      <section className="space-y-6">
        <h2 className="text-2xl font-bold mb-4">Job Summary</h2>
        <div className="prose max-w-none">
          <ReactMarkdown>{jobSummary}</ReactMarkdown>
        </div>
      </section>

      <section className="space-y-6">
        <h2 className="text-2xl font-bold mb-4">Enhanced Description</h2>
        <div className="prose max-w-none">
          <ReactMarkdown>{enhancedDescription}</ReactMarkdown>
        </div>
      </section>

      <section className="space-y-6">
        <h2 className="text-2xl font-bold mb-4">Compensation Analysis</h2>
        <div className="prose max-w-none">
          <ReactMarkdown>{compensationAnalysis}</ReactMarkdown>
        </div>
      </section>

      {terms && (
        <section className="space-y-6">
          <h2 className="text-2xl font-bold mb-4">Key Terms</h2>
          
          <div className="space-y-8">
            <div>
              <h3 className="text-xl font-semibold mb-3">Skills & Technologies</h3>
              <div className="flex flex-wrap gap-3">
                {terms.skills.map((skill, index) => (
                  <span key={index} className="px-3 py-2 bg-gray-100 rounded">
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-3">Job Titles</h3>
              <div className="flex flex-wrap gap-3">
                {terms.titles.map((title, index) => (
                  <span key={index} className="px-3 py-2 bg-gray-100 rounded">
                    {title}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-3">Keywords</h3>
              <div className="flex flex-wrap gap-3">
                {terms.keywords.map((keyword, index) => (
                  <span key={index} className="px-3 py-2 bg-gray-100 rounded">
                    {keyword}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      <section className="space-y-6">
        <h2 className="text-2xl font-bold mb-4">Search String</h2>
        <div className="p-6 bg-gray-100 rounded-lg font-mono text-sm overflow-x-auto">
          {searchString}
        </div>
      </section>
    </div>
  );
};