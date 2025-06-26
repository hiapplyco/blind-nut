import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Info, Lightbulb, Target, X, RefreshCw, Minimize2, Maximize2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface BooleanComponent {
  part: string;
  purpose: string;
  example?: string;
}

interface BooleanExplanation {
  overview: string;
  components: BooleanComponent[];
  inclusions: string[];
  exclusions: string[];
  tips: string[];
}

interface BooleanExplanationProps {
  explanation: BooleanExplanation | null;
  isLoading: boolean;
  onSimpler: () => void;
  onMoreComplex: () => void;
  isRegenerating?: boolean;
  className?: string;
}

export const BooleanExplanation: React.FC<BooleanExplanationProps> = ({
  explanation,
  isLoading,
  onSimpler,
  onMoreComplex,
  isRegenerating = false,
  className
}) => {
  const [expandedSections, setExpandedSections] = useState({
    components: true,
    inclusions: true,
    exclusions: false,
    tips: false
  });

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  if (isLoading) {
    return (
      <div className={cn("p-6 bg-white rounded-lg border-2 border-gray-200", className)}>
        <div className="space-y-4 animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3"></div>
        </div>
      </div>
    );
  }

  if (!explanation) return null;

  return (
    <div className={cn("bg-white rounded-lg border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,0.25)]", className)}>
      {/* Header */}
      <div className="p-4 border-b-2 border-black bg-gradient-to-r from-purple-50 to-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-purple-600" />
            <h3 className="font-bold text-lg">Boolean Search Breakdown</h3>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={onSimpler}
              disabled={isRegenerating}
              size="sm"
              variant="outline"
              className="border-black hover:bg-purple-50"
            >
              <Minimize2 className="h-3 w-3 mr-1" />
              Simpler
            </Button>
            <Button
              onClick={onMoreComplex}
              disabled={isRegenerating}
              size="sm"
              variant="outline"
              className="border-black hover:bg-purple-50"
            >
              <Maximize2 className="h-3 w-3 mr-1" />
              More Complex
            </Button>
          </div>
        </div>
      </div>

      {/* Overview */}
      <div className="p-4 bg-purple-50">
        <p className="text-sm font-medium text-gray-800">{explanation.overview}</p>
      </div>

      {/* Components Section */}
      <div className="border-b border-gray-200">
        <button
          onClick={() => toggleSection('components')}
          className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center gap-2">
            <Target className="h-4 w-4 text-purple-600" />
            <span className="font-semibold">Search Components</span>
            <span className="text-xs text-gray-500">({explanation.components.length})</span>
          </div>
          {expandedSections.components ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </button>
        {expandedSections.components && (
          <div className="px-4 pb-4 space-y-3">
            {explanation.components.map((component, index) => (
              <div key={index} className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                <code className="text-sm font-mono text-purple-700 block mb-1">{component.part}</code>
                <p className="text-sm text-gray-700 mb-1">{component.purpose}</p>
                {component.example && (
                  <p className="text-xs text-gray-500 italic">Example: {component.example}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Inclusions Section */}
      <div className="border-b border-gray-200">
        <button
          onClick={() => toggleSection('inclusions')}
          className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 rounded-full bg-green-500" />
            <span className="font-semibold">Will Include</span>
          </div>
          {expandedSections.inclusions ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </button>
        {expandedSections.inclusions && (
          <div className="px-4 pb-4">
            <ul className="space-y-1">
              {explanation.inclusions.map((inclusion, index) => (
                <li key={index} className="flex items-start gap-2 text-sm text-gray-700">
                  <span className="text-green-500 mt-0.5">✓</span>
                  <span>{inclusion}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Exclusions Section */}
      <div className="border-b border-gray-200">
        <button
          onClick={() => toggleSection('exclusions')}
          className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center gap-2">
            <X className="h-4 w-4 text-red-500" />
            <span className="font-semibold">Will Exclude</span>
          </div>
          {expandedSections.exclusions ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </button>
        {expandedSections.exclusions && (
          <div className="px-4 pb-4">
            <ul className="space-y-1">
              {explanation.exclusions.map((exclusion, index) => (
                <li key={index} className="flex items-start gap-2 text-sm text-gray-700">
                  <span className="text-red-500 mt-0.5">✗</span>
                  <span>{exclusion}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Tips Section */}
      <div>
        <button
          onClick={() => toggleSection('tips')}
          className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center gap-2">
            <Info className="h-4 w-4 text-blue-500" />
            <span className="font-semibold">Pro Tips</span>
          </div>
          {expandedSections.tips ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </button>
        {expandedSections.tips && (
          <div className="px-4 pb-4">
            <ul className="space-y-1">
              {explanation.tips.map((tip, index) => (
                <li key={index} className="flex items-start gap-2 text-sm text-gray-700">
                  <span className="text-blue-500 mt-0.5">💡</span>
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};