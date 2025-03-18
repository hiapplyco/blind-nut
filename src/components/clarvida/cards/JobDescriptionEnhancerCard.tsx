
import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Copy, Check, Edit, X } from "lucide-react";
import { toast } from "sonner";
import { RichTextJobEditor } from "./RichTextJobEditor";

interface JobDescriptionEnhancerCardProps {
  data: {
    optimization_tips: string[];
    revised_job_listing: string;
  };
}

export function JobDescriptionEnhancerCard({ data }: JobDescriptionEnhancerCardProps) {
  const [copied, setCopied] = useState(false);
  const [isEditing, setIsEditing] = useState(true); // Start in edit mode
  const [editedContent, setEditedContent] = useState(data.revised_job_listing);

  const handleCopy = () => {
    navigator.clipboard.writeText(editedContent);
    setCopied(true);
    toast.success("Job listing copied to clipboard");
    
    setTimeout(() => {
      setCopied(false);
    }, 2000);
  };

  const handleSaveEdit = (content: string) => {
    setEditedContent(content);
    setIsEditing(false);
    toast.success("Job listing updated");
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
  };

  const formatJobListing = (text: string) => {
    // This formats markdown-like text to HTML for display
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<li>$1</li>')
      .split('\n\n')
      .map((paragraph, i) => {
        // Convert bullet point lines into lists
        if (paragraph.includes('<li>')) {
          return `<ul class="list-disc pl-5 my-2">${paragraph}</ul>`;
        }
        return `<p class="mb-2">${paragraph}</p>`;
      })
      .join('');
  };

  return (
    <Card className="shadow-lg border-2 border-[#8B5CF6]/20 h-full">
      <CardHeader className="bg-gradient-to-r from-[#8B5CF6]/10 to-transparent">
        <CardTitle>Job Description Enhancer</CardTitle>
      </CardHeader>
      <CardContent className="pt-6 space-y-4">
        <div>
          <h4 className="font-semibold mb-2">Optimization Tips</h4>
          <ol className="list-decimal pl-5 text-sm space-y-1">
            {data.optimization_tips.map((tip, index) => (
              <li key={index}>{tip}</li>
            ))}
          </ol>
        </div>
        
        <div>
          <div className="flex justify-between items-center mb-2">
            <h4 className="font-semibold">Revised Job Listing</h4>
            <div className="flex gap-2">
              {isEditing ? (
                <>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleCancelEdit}
                    className="flex items-center gap-1"
                  >
                    <X className="h-4 w-4" />
                    Cancel
                  </Button>
                </>
              ) : (
                <>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleCopy}
                    className="flex items-center gap-1"
                  >
                    {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    {copied ? "Copied" : "Copy"}
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setIsEditing(true)}
                    className="flex items-center gap-1"
                  >
                    <Edit className="h-4 w-4" />
                    Edit
                  </Button>
                </>
              )}
            </div>
          </div>
          
          {isEditing ? (
            <RichTextJobEditor 
              initialContent={editedContent} 
              onSave={handleSaveEdit} 
              onCancel={handleCancelEdit}
            />
          ) : (
            <div 
              className="bg-gray-50 p-4 rounded-md text-sm prose prose-sm max-w-none"
              dangerouslySetInnerHTML={{ __html: formatJobListing(editedContent) }}
            />
          )}
        </div>
      </CardContent>
    </Card>
  );
}
