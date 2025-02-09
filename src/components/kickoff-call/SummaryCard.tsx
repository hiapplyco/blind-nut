
import { Card } from "@/components/ui/card";
import { X } from "lucide-react";

interface SummaryCardProps {
  title: string;
  content: string;
  source: string;
  onRemove: () => void;
}

export const SummaryCard = ({ title, content, source, onRemove }: SummaryCardProps) => {
  return (
    <Card className="p-4 relative border-4 border-black bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
      <button
        onClick={onRemove}
        className="absolute top-2 right-2 p-1 hover:bg-gray-100 rounded-full transition-colors"
      >
        <X className="h-4 w-4" />
      </button>
      <div className="pr-6">
        <h3 className="font-bold text-lg mb-2">{title}</h3>
        <p className="text-sm text-gray-600 mb-2">{content}</p>
        <p className="text-xs text-gray-400">Source: {source}</p>
      </div>
    </Card>
  );
};
