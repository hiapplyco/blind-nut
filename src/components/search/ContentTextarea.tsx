
import { Textarea } from "@/components/ui/textarea";
import { useEffect, useRef, useState } from "react";

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
  const [maxHeight, setMaxHeight] = useState<string>("90vh");
  
  // Set max height to 90% of viewport height
  useEffect(() => {
    const updateMaxHeight = () => {
      setMaxHeight(`${window.innerHeight * 0.9}px`);
    };
    
    // Initial calculation
    updateMaxHeight();
    
    // Recalculate on window resize
    window.addEventListener('resize', updateMaxHeight);
    return () => window.removeEventListener('resize', updateMaxHeight);
  }, []);

  // Auto-resize the textarea based on content, but with max height constraint
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      const scrollHeight = textareaRef.current.scrollHeight;
      textareaRef.current.style.height = `${scrollHeight}px`;
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
        className={`min-h-[200px] max-h-[${maxHeight}] overflow-y-auto border-4 ${borderClass} focus:ring-0 focus:border-[#8B5CF6] transition-all`}
        value={content}
        onChange={(e) => onChange(e.target.value)}
        onFocus={onFocus}
        onBlur={onBlur}
        style={{ maxHeight }}
      />
    </div>
  );
};
