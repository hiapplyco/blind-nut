import React, { useState } from 'react';
import { Link2 } from 'lucide-react';
import { URLScrapeModal } from './URLScrapeModal';
import { useProject } from '../../context/ProjectContext';
import { toast } from 'react-hot-toast';

interface URLScrapeButtonProps {
  onScrapedContent?: (content: { text: string; rawContent: string; url: string }) => void;
  className?: string;
  buttonText?: string;
  size?: 'sm' | 'md' | 'lg';
  context?: 'sourcing' | 'job-posting' | 'search' | 'kickoff' | 'general';
}

export function URLScrapeButton({
  onScrapedContent,
  className = '',
  buttonText = 'Import from URL',
  size = 'md',
  context = 'general'
}: URLScrapeButtonProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { selectedProject } = useProject();

  const handleScrapedContent = (content: { text: string; rawContent: string; url: string }) => {
    // If a callback is provided, use it
    if (onScrapedContent) {
      onScrapedContent(content);
    }
    
    // Show success message with project context if applicable
    if (selectedProject) {
      toast.success(`Content imported to project: ${selectedProject.name}`);
    } else {
      toast.success('Content imported successfully');
    }
    
    setIsModalOpen(false);
  };

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2',
    lg: 'px-6 py-3 text-lg'
  };

  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        className={`
          flex items-center gap-2 
          bg-gradient-to-r from-[#39FF14] to-[#00D4FF] 
          text-black font-semibold rounded-lg 
          hover:shadow-lg hover:shadow-[#39FF14]/20 
          transition-all duration-200 
          ${sizeClasses[size]}
          ${className}
        `}
      >
        <Link2 className={size === 'sm' ? 'w-4 h-4' : 'w-5 h-5'} />
        {buttonText}
      </button>

      <URLScrapeModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onScrapedContent={handleScrapedContent}
        context={context}
        projectId={selectedProject?.id}
      />
    </>
  );
}