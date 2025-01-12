import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { generatePDF } from "@react-pdf/renderer";

interface ExportButtonProps {
  onClick: () => void;
}

export const ExportButton = ({ onClick }: ExportButtonProps) => {
  return (
    <Button
      onClick={onClick}
      variant="outline"
      className="gap-2 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all duration-200"
    >
      <Download className="h-4 w-4" />
      Export to PDF
    </Button>
  );
};