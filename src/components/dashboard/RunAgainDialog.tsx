
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface RunAgainDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedJobContent: string;
  onSelectedJobContentChange: (content: string) => void;
  onConfirm: () => void;
  isProcessing: boolean;
}

export const RunAgainDialog = ({
  open,
  onOpenChange,
  selectedJobContent,
  onSelectedJobContentChange,
  onConfirm,
  isProcessing,
}: RunAgainDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>Review Search Content</DialogTitle>
          <DialogDescription>
            Review and edit the search content below before running the analysis again.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="content">Search Content</Label>
            <Textarea
              id="content"
              value={selectedJobContent}
              onChange={(e) => onSelectedJobContentChange(e.target.value)}
              rows={8}
              className="resize-none"
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button 
            onClick={onConfirm}
            disabled={!selectedJobContent.trim() || isProcessing}
          >
            Run Analysis
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
