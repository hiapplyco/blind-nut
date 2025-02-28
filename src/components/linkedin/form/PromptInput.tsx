
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

interface PromptInputProps {
  postContent: string;
  onChange: (value: string) => void;
}

const PromptInput = ({ postContent, onChange }: PromptInputProps) => {
  return (
    <div className="space-y-2">
      <Label htmlFor="post-content" className="text-base font-bold">What do you want to post about?</Label>
      <Textarea
        id="post-content"
        className="h-40 border-2 border-black"
        value={postContent}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Enter your post ideas here..."
        required
      />
      <p className="text-xs text-gray-500">
        Your content will be analyzed by 5 experts and a devil's advocate before crafting the final post
      </p>
    </div>
  );
};

export default PromptInput;
