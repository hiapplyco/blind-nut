
import { Dialog, DialogContent } from "@/components/ui/dialog";
import InterviewPrep from "@/pages/InterviewPrep";

interface InterviewPrepModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const InterviewPrepModal = ({ isOpen, onClose }: InterviewPrepModalProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl h-[90vh] overflow-y-auto">
        <InterviewPrep />
      </DialogContent>
    </Dialog>
  );
};

