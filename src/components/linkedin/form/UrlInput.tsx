
import { Input } from "@/components/ui/input";
import { Globe } from "lucide-react";
import { Label } from "@/components/ui/label";

interface UrlInputProps {
  link: string;
  onLinkChange: (value: string) => void;
  onFileChange: (file: File | null) => void;
}

const UrlInput = ({ link, onLinkChange, onFileChange }: UrlInputProps) => {
  return (
    <div className="flex items-center gap-4">
      <div className="flex-1">
        <Input
          id="linkInput"
          type="url"
          placeholder="Add a website URL to analyze (optional)"
          value={link}
          onChange={(e) => onLinkChange(e.target.value)}
        />
      </div>
      <Label className="cursor-pointer">
        <input 
          type="file" 
          className="hidden" 
          onChange={(e) => {
            if (e.target.files && e.target.files[0]) {
              onFileChange(e.target.files[0]);
            }
          }} 
        />
        <Globe className="h-6 w-6 text-muted-foreground hover:text-foreground" />
      </Label>
    </div>
  );
};

export default UrlInput;
