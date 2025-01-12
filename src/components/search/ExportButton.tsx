import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ExportButtonProps {
  onClick: () => void;
  isLoading?: boolean;
}

export const ExportButton = ({ onClick, isLoading }: ExportButtonProps) => {
  return (
    <Button
      onClick={onClick}
      variant="outline"
      className="gap-2 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all duration-200"
      disabled={isLoading}
    >
      <Download className="h-4 w-4" />
      {isLoading ? 'Exporting...' : 'Export to PDF'}
    </Button>
  );
};