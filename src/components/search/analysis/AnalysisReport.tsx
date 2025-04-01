import { AgentOutput } from "@/types/agent";
import ReactMarkdown from 'react-markdown';
import { useEffect } from 'react';
import { motion } from 'framer-motion'; // Import motion
import { Card } from '@/components/ui/card'; // Use Card for section structure

interface AnalysisReportProps {
  agentOutput: AgentOutput | null;
  isGeneratingAnalysis: boolean;
  isProcessingComplete: boolean;
  children?: React.ReactNode;
}

export const AnalysisReport = ({ 
  agentOutput, 
  isGeneratingAnalysis,
  isProcessingComplete,
  children 
}: AnalysisReportProps) => {
  useEffect(() => {
    console.log("AnalysisReport rendered:", { 
      hasAgentOutput: !!agentOutput,
      isGeneratingAnalysis,
      isProcessingComplete
    });
  }, [agentOutput, isGeneratingAnalysis, isProcessingComplete]);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        when: "beforeChildren", // Ensure container is visible before children animate
        staggerChildren: 0.15 // Stagger animation of child sections
      }
    }
  };

  const sectionVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
  };
  
  const tagVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.2 } }
  };

  return (
    <div className="mt-8">
      <div className="p-6 border-4 border-black bg-[#FFFBF4] shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
        <h2 className="text-2xl font-bold mb-6">Analysis Report</h2>
        
        {/* Show processing indicators or generate button */}
        {children}

        {/* Show report content when available */}
        {/* Animate the appearance of the report content */}
        {agentOutput && isProcessingComplete && (
          <motion.div
            className="space-y-6 mt-6" // Adjusted spacing
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {/* Section 1: Job Summary */}
            <motion.div variants={sectionVariants}>
              <Card className="p-4 border-2 border-black bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,0.8)]">
                <h3 className="text-lg font-semibold mb-2">Job Summary</h3>
                <div className="prose prose-sm max-w-none">
                  <ReactMarkdown>{agentOutput.job_summary || 'Not available.'}</ReactMarkdown>
                </div>
              </Card>
            </motion.div>
            
            {/* Section 2: Enhanced Description */}
            <motion.div variants={sectionVariants}>
               <Card className="p-4 border-2 border-black bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,0.8)]">
                <h3 className="text-lg font-semibold mb-2">Enhanced Description</h3>
                <div className="prose prose-sm max-w-none">
                  <ReactMarkdown>{agentOutput.enhanced_description || 'Not available.'}</ReactMarkdown>
                </div>
              </Card>
            </motion.div>
            
            {/* Section 3: Compensation Analysis */}
            <motion.div variants={sectionVariants}>
               <Card className="p-4 border-2 border-black bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,0.8)]">
                <h3 className="text-lg font-semibold mb-2">Compensation Analysis</h3>
                <div className="prose prose-sm max-w-none">
                  <ReactMarkdown>{agentOutput.compensation_analysis || 'Not available.'}</ReactMarkdown>
                </div>
              </Card>
            </motion.div>

            {/* Section 4: Key Terms */}
            {agentOutput.terms && (agentOutput.terms.skills?.length > 0 || agentOutput.terms.titles?.length > 0 || agentOutput.terms.keywords?.length > 0) && (
              <motion.div variants={sectionVariants}>
                 <Card className="p-4 border-2 border-black bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,0.8)]">
                  <h3 className="text-lg font-semibold mb-3">Key Terms</h3>
                  <div className="space-y-3">
                    {/* Skills */}
                    {agentOutput.terms.skills?.length > 0 && (
                      <div>
                        <h4 className="font-medium text-sm mb-1.5">Skills & Technologies</h4>
                        <motion.div
                          className="flex flex-wrap gap-1.5"
                          variants={{ visible: { transition: { staggerChildren: 0.05 } } }} // Stagger tags
                        >
                          {agentOutput.terms.skills.map((skill, index) => (
                            <motion.span
                              key={`skill-${index}`}
                              className="px-2.5 py-1 bg-purple-100 border border-purple-300 rounded-full text-xs font-medium shadow-sm"
                              variants={tagVariants}
                            >
                              {skill}
                            </motion.span>
                          ))}
                        </motion.div>
                      </div>
                    )}
                    
                    {/* Titles */}
                     {agentOutput.terms.titles?.length > 0 && (
                      <div>
                        <h4 className="font-medium text-sm mb-1.5">Job Titles</h4>
                        <motion.div
                          className="flex flex-wrap gap-1.5"
                          variants={{ visible: { transition: { staggerChildren: 0.05 } } }}
                        >
                          {agentOutput.terms.titles.map((title, index) => (
                            <motion.span
                              key={`title-${index}`}
                              className="px-2.5 py-1 bg-blue-100 border border-blue-300 rounded-full text-xs font-medium shadow-sm"
                              variants={tagVariants}
                            >
                              {title}
                            </motion.span>
                          ))}
                        </motion.div>
                      </div>
                     )}
                    
                    {/* Keywords */}
                    {agentOutput.terms.keywords?.length > 0 && (
                      <div>
                        <h4 className="font-medium text-sm mb-1.5">Keywords</h4>
                        <motion.div
                          className="flex flex-wrap gap-1.5"
                          variants={{ visible: { transition: { staggerChildren: 0.05 } } }}
                        >
                          {agentOutput.terms.keywords.map((keyword, index) => (
                            <motion.span
                              key={`keyword-${index}`}
                              className="px-2.5 py-1 bg-green-100 border border-green-300 rounded-full text-xs font-medium shadow-sm"
                              variants={tagVariants}
                            >
                              {keyword}
                            </motion.span>
                          ))}
                        </motion.div>
                      </div>
                    )}
                  </div>
                </Card>
              </motion.div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
};