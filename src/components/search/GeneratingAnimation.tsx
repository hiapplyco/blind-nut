import React from 'react';
import { Loader2, Sparkles, Brain, Search } from 'lucide-react';
import { cn } from '@/lib/utils';

interface GeneratingAnimationProps {
  isOpen: boolean;
  stage?: 'generating' | 'explaining' | 'searching';
  message?: string;
}

export const GeneratingAnimation: React.FC<GeneratingAnimationProps> = ({
  isOpen,
  stage = 'generating',
  message
}) => {
  if (!isOpen) return null;

  const getStageInfo = () => {
    switch (stage) {
      case 'generating':
        return {
          icon: <Brain className="h-12 w-12 text-purple-600" />,
          title: 'AI is thinking...',
          subtitle: message || 'Analyzing requirements and generating optimal boolean search',
          tips: [
            'Identifying key skills and technologies',
            'Finding job title variations',
            'Adding location and experience filters'
          ]
        };
      case 'explaining':
        return {
          icon: <Sparkles className="h-12 w-12 text-purple-600" />,
          title: 'Creating explanation...',
          subtitle: message || 'Breaking down your search strategy',
          tips: [
            'Explaining each search component',
            'Highlighting what will be included',
            'Providing optimization tips'
          ]
        };
      case 'searching':
        return {
          icon: <Search className="h-12 w-12 text-purple-600" />,
          title: 'Searching LinkedIn...',
          subtitle: message || 'Finding the best candidates for you',
          tips: [
            'Scanning LinkedIn profiles',
            'Matching against your criteria',
            'Organizing results by relevance'
          ]
        };
    }
  };

  const stageInfo = getStageInfo();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="relative max-w-md w-full mx-4">
        <div className="bg-white rounded-lg border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-8 transform animate-in zoom-in-95 duration-300">
          {/* Icon and Spinner */}
          <div className="relative flex justify-center mb-6">
            <div className="relative">
              {stageInfo.icon}
              <div className="absolute -inset-4">
                <Loader2 className="h-20 w-20 text-purple-300 animate-spin" />
              </div>
            </div>
          </div>

          {/* Title and Subtitle */}
          <div className="text-center mb-6">
            <h3 className="text-2xl font-bold text-gray-900 mb-2">{stageInfo.title}</h3>
            <p className="text-gray-600">{stageInfo.subtitle}</p>
          </div>

          {/* Progress Tips */}
          <div className="space-y-2">
            {stageInfo.tips.map((tip, index) => (
              <div
                key={index}
                className={cn(
                  "flex items-center gap-3 text-sm",
                  "opacity-0 animate-[fadeIn_0.6s_ease-in-out_forwards]"
                )}
                style={{ animationDelay: `${index * 300}ms` }}
              >
                <div className={cn(
                  "h-2 w-2 rounded-full bg-purple-600",
                  "animate-pulse"
                )} />
                <span className="text-gray-700">{tip}</span>
              </div>
            ))}
          </div>

          {/* Loading Bar */}
          <div className="mt-6 h-2 bg-gray-200 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-purple-600 to-purple-400 rounded-full animate-progress" />
          </div>
        </div>
      </div>
    </div>
  );
};