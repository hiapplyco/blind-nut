
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface PostContentProps {
  content: string;
}

const PostContent = ({ content }: PostContentProps) => {
  return (
    <div className="space-y-4">
      <div className="bg-[#F1F0FB] p-4 rounded-lg border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,0.5)]">
        <p className="whitespace-pre-wrap">{content}</p>
      </div>
      <div className="flex gap-4">
        <Button 
          onClick={() => {
            navigator.clipboard.writeText(content);
            toast.success("Post copied to clipboard!");
          }}
          className="border-2 border-black"
        >
          Copy to Clipboard
        </Button>
      </div>
    </div>
  );
};

export default PostContent;
