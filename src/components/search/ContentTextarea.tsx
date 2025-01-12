import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { InputActions } from "./InputActions";

interface ContentTextareaProps {
  searchText: string;
  isProcessing: boolean;
  onTextChange: (value: string) => void;
  onFileUpload: (event: React.ChangeEvent<HTMLInputElement>) => Promise<void>;
  onTextUpdate: (text: string) => void;
}

export const ContentTextarea = ({ 
  searchText, 
  isProcessing, 
  onTextChange,
  onFileUpload,
  onTextUpdate
}: ContentTextareaProps) => {
  if (isProcessing) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-[100px] w-full" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <Label htmlFor="searchText" className="text-xl font-bold">Content</Label>
        <InputActions
          onFileUpload={onFileUpload}
          isProcessing={isProcessing}
          onShowAccessDialog={() => {}}
          onTextUpdate={onTextUpdate}
        />
      </div>
      <textarea
        id="searchText"
        placeholder="Enter job requirements or paste resume content"
        value={searchText}
        onChange={(e) => onTextChange(e.target.value)}
        className="w-full min-h-[100px] p-4 border-4 border-black rounded bg-white resize-none 
          shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] font-medium focus:ring-0 focus:border-black"
      />
    </div>
  );
};