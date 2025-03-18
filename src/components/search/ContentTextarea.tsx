
import { Textarea } from "@/components/ui/textarea";
import { useEffect, useRef } from "react";

export interface ContentTextareaProps {
  content: string;
  onChange: (value: string) => void;
  placeholder?: string;
  onFocus?: () => void;
  onBlur?: () => void;
  isActive?: boolean;
}

export const ContentTextarea = ({ 
  content, 
  onChange, 
  placeholder = "Enter content here...",
  onFocus,
  onBlur,
  isActive = false
}: ContentTextareaProps) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize the textarea based on content
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [content]);

  const borderClass = isActive 
    ? "border-[#8B5CF6] shadow-[4px_4px_0px_0px_rgba(139,92,246,0.5)]" 
    : "border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,0.8)]";

  return (
    <div className="space-y-2">
      <Textarea
        ref={textareaRef}
        placeholder={placeholder}
        className={`min-h-[200px] border-4 ${borderClass} focus:ring-0 focus:border-[#8B5CF6] transition-all`}
        value={content}
        onChange={(e) => onChange(e.target.value)}
        onFocus={onFocus}
        onBlur={onBlur}
      />
    </div>
  );
};
