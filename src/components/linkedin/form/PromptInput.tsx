
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

interface PromptInputProps {
  postContent: string;
  onChange: (value: string) => void;
}

const PromptInput = ({ postContent, onChange }: PromptInputProps) => {
  return (
    <div className="space-y-2">
      <Label htmlFor="post-content">What do you want to post about?</Label>
      <Textarea
        id="post-content"
        className="h-40"
        value={postContent}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Enter your post ideas here..."
        required
      />
      <p className="text-xs text-muted-foreground">
        Your content will be analyzed by 5 experts and a devil's advocate before crafting the final post
      </p>
    </div>
  );
};

export default PromptInput;
