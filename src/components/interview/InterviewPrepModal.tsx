
import { Dialog, DialogContent } from "@/components/ui/dialog";
import InterviewPrep from "@/pages/InterviewPrep";

interface InterviewPrepModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const InterviewPrepModal = ({ isOpen, onClose }: InterviewPrepModalProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-5xl h-[90vh] p-0 overflow-hidden">
        <InterviewPrep />
      </DialogContent>
    </Dialog>
  );
};
