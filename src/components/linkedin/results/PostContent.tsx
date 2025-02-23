
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface PostContentProps {
  content: string;
}

const PostContent = ({ content }: PostContentProps) => {
  return (
    <div className="space-y-4">
      <div className="bg-muted p-4 rounded-lg">
        <p className="whitespace-pre-wrap">{content}</p>
      </div>
      <div className="flex gap-4">
        <Button 
          onClick={() => {
            navigator.clipboard.writeText(content);
            toast.success("Post copied to clipboard!");
          }}
        >
          Copy to Clipboard
        </Button>
      </div>
    </div>
  );
};

export default PostContent;
