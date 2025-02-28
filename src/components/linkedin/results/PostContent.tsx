
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Download } from "lucide-react";

interface PostContentProps {
  content: string;
}

const PostContent = ({ content }: PostContentProps) => {
  const handleDownload = () => {
    try {
      // Create a blob with the content
      const blob = new Blob([content], { type: "text/plain" });
      // Create a URL for the blob
      const url = URL.createObjectURL(blob);
      // Create a temporary anchor element
      const a = document.createElement("a");
      a.href = url;
      a.download = "linkedin-post.txt";
      // Trigger the download
      document.body.appendChild(a);
      a.click();
      // Clean up
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success("Post downloaded successfully!");
    } catch (error) {
      console.error("Error downloading file:", error);
      toast.error("Failed to download post");
    }
  };

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
        <Button 
          onClick={handleDownload}
          className="border-2 border-black"
          variant="outline"
        >
          <Download className="h-4 w-4 mr-2" />
          Download
        </Button>
      </div>
    </div>
  );
};

export default PostContent;
