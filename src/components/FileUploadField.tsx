import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface FileUploadFieldProps {
  isDisabled: boolean;
  onFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const FileUploadField = ({ isDisabled, onFileUpload }: FileUploadFieldProps) => {
  return (
    <div className="space-y-2">
      <Label htmlFor="fileUpload">Upload Document</Label>
      <Input
        id="fileUpload"
        type="file"
        accept=".pdf,.docx"
        onChange={onFileUpload}
        disabled={isDisabled}
      />
    </div>
  );
};

export default FileUploadField;