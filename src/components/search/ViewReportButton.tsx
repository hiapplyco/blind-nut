import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ViewReportButtonProps {
  onClick: () => void;
  isExporting?: boolean;
}

export const ViewReportButton = ({ onClick, isExporting }: ViewReportButtonProps) => {
  return (
    <div className="flex justify-center mt-6">
      <Button
        onClick={onClick}
        disabled={isExporting}
        className="border-4 border-black bg-[#8B5CF6] text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[2px] hover:translate-x-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all"
      >
        <Download className="w-5 h-5 mr-2" />
        {isExporting ? 'Downloading...' : 'Download Analysis Report'}
      </Button>
    </div>
  );
};