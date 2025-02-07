
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

interface KickoffFormProps {
  isProcessing: boolean;
  filePaths: string[];
}

export const KickoffForm = ({ isProcessing, filePaths }: KickoffFormProps) => {
  const navigate = useNavigate();
  const [textInput, setTextInput] = useState("");
  const [title, setTitle] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!textInput.trim() || !title.trim()) {
      toast.error("Please enter both a title and content");
      return;
    }

    try {
      const { data: result, error: processingError } = await supabase.functions.invoke('process-kickoff-call', {
        body: {
          text: textInput,
          title,
          filePaths,
        },
      });

      if (processingError) throw processingError;

      toast.success("Successfully processed kickoff call information!");
      navigate(`/dashboard?callId=${result.id}`);

    } catch (error) {
      console.error('Error processing kickoff call:', error);
      toast.error("Failed to process kickoff call. Please try again.");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <label htmlFor="title" className="text-lg font-bold block">
          Title
        </label>
        <input
          id="title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Enter a title for this kickoff call"
          className="w-full p-4 border-4 border-black rounded bg-white 
            shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] font-medium focus:ring-0 focus:border-black"
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="content" className="text-lg font-bold block">
          Notes or Paste Content
        </label>
        <textarea
          id="content"
          value={textInput}
          onChange={(e) => setTextInput(e.target.value)}
          placeholder="Enter notes, requirements, or paste content here"
          className="w-full min-h-[200px] p-4 border-4 border-black rounded bg-white resize-none 
            shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] font-medium focus:ring-0 focus:border-black"
        />
      </div>

      <Button
        type="submit"
        className="w-full bg-[#8B5CF6] text-white py-4 rounded font-bold text-lg border-4 
          border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:translate-y-1 
          hover:translate-x-1 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all
          disabled:opacity-50 disabled:cursor-not-allowed"
        disabled={isProcessing || !textInput.trim() || !title.trim()}
      >
        {isProcessing ? 'Processing...' : 'Process Kickoff Call'}
      </Button>
    </form>
  );
};
