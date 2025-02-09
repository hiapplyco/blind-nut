
import { Terms } from "@/types/agent";
import ReactMarkdown from 'react-markdown';
import { Card } from "@/components/ui/card";
import { 
  RocketIcon, 
  TargetIcon, 
  GraduationCapIcon, 
  StarIcon, 
  TrendingUpIcon, 
  GiftIcon 
} from "lucide-react";

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
    <div className="p-8 max-w-5xl mx-auto space-y-8">
      <h1 className="text-4xl font-bold mb-8">Job Analysis Report</h1>
      
      <div className="grid gap-8">
        <Card className="p-6 space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <RocketIcon className="w-6 h-6 text-purple-500" />
            <h2 className="text-2xl font-semibold">Job Summary</h2>
          </div>
          <div className="prose max-w-none">
            <ReactMarkdown components={{
              p: ({children}) => <p className="text-gray-600">{children}</p>,
              strong: ({children}) => <span className="font-semibold text-gray-900">{children}</span>
            }}>
              {jobSummary}
            </ReactMarkdown>
          </div>
        </Card>

        <Card className="p-6 space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <TargetIcon className="w-6 h-6 text-blue-500" />
            <h2 className="text-2xl font-semibold">Enhanced Description</h2>
          </div>
          <div className="prose max-w-none">
            <ReactMarkdown components={{
              p: ({children}) => <p className="text-gray-600">{children}</p>,
              strong: ({children}) => <span className="font-semibold text-gray-900">{children}</span>
            }}>
              {enhancedDescription}
            </ReactMarkdown>
          </div>
        </Card>

        <Card className="p-6 space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUpIcon className="w-6 h-6 text-green-500" />
            <h2 className="text-2xl font-semibold">Compensation Analysis</h2>
          </div>
          <div className="prose max-w-none">
            <ReactMarkdown components={{
              p: ({children}) => <p className="text-gray-600">{children}</p>,
              strong: ({children}) => <span className="font-semibold text-gray-900">{children}</span>
            }}>
              {compensationAnalysis}
            </ReactMarkdown>
          </div>
        </Card>

        {terms && (
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-6">
              <StarIcon className="w-6 h-6 text-amber-500" />
              <h2 className="text-2xl font-semibold">Key Terms</h2>
            </div>
            
            <div className="grid gap-6">
              <div>
                <h3 className="text-lg font-medium mb-3 flex items-center gap-2">
                  <GraduationCapIcon className="w-5 h-5 text-purple-500" />
                  Skills & Technologies
                </h3>
                <div className="flex flex-wrap gap-2">
                  {terms.skills.map((skill, index) => (
                    <span 
                      key={index} 
                      className="px-3 py-1.5 bg-purple-50 text-purple-700 rounded-full text-sm font-medium"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium mb-3 flex items-center gap-2">
                  <GiftIcon className="w-5 h-5 text-blue-500" />
                  Job Titles
                </h3>
                <div className="flex flex-wrap gap-2">
                  {terms.titles.map((title, index) => (
                    <span 
                      key={index} 
                      className="px-3 py-1.5 bg-blue-50 text-blue-700 rounded-full text-sm font-medium"
                    >
                      {title}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium mb-3 flex items-center gap-2">
                  <TargetIcon className="w-5 h-5 text-green-500" />
                  Keywords
                </h3>
                <div className="flex flex-wrap gap-2">
                  {terms.keywords.map((keyword, index) => (
                    <span 
                      key={index} 
                      className="px-3 py-1.5 bg-green-50 text-green-700 rounded-full text-sm font-medium"
                    >
                      {keyword}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        )}

        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <TargetIcon className="w-6 h-6 text-indigo-500" />
            <h2 className="text-2xl font-semibold">Search String</h2>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg font-mono text-sm overflow-x-auto">
            {searchString}
          </div>
        </Card>
      </div>
    </div>
  );
};
