
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface FileListProps {
  files: { name: string; path: string }[];
  onRemove: (index: number) => void;
}

export const FileList = ({ files, onRemove }: FileListProps) => {
  if (files.length === 0) return null;

  return (
    <div className="space-y-2">
      <h3 className="font-bold">Uploaded Files:</h3>
      <div className="space-y-2">
        {files.map((file, index) => (
          <div
            key={index}
            className="flex items-center justify-between p-2 bg-white border-2 border-black rounded"
          >
            <span>{file.name}</span>
            <Button
              type="button"
              variant="ghost"
              onClick={() => onRemove(index)}
              className="p-1 hover:bg-red-100"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
};
