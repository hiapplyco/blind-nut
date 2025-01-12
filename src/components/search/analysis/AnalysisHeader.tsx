import { Bot, X } from "lucide-react";
import { ExportButton } from "../ExportButton";

interface AnalysisHeaderProps {
  onClose: () => void;
  onExport: () => void;
  isExporting: boolean;
}

export const AnalysisHeader = ({ onClose, onExport, isExporting }: AnalysisHeaderProps) => {
  return (
    <div className="flex justify-between items-center">
      <h2 className="text-2xl font-bold flex items-center gap-2">
        <Bot className="w-6 h-6 text-primary" />
        Analysis Results
      </h2>
      <div className="flex items-center gap-4">
        <ExportButton onClick={onExport} isLoading={isExporting} />
        <button
          onClick={onClose}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          aria-label="Close results"
        >
          <X className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
};