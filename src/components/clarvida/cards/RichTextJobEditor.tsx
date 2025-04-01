
import { useCallback, useEffect, useRef } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import Underline from "@tiptap/extension-underline";
import { Button } from "@/components/ui/button";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { 
  Bold, 
  Italic, 
  Underline as UnderlineIcon, 
  List, 
  ListOrdered, 
  Heading2, 
  Save, 
  X 
} from "lucide-react";
import { toast } from "sonner";

interface RichTextJobEditorProps {
  initialContent: string;
  onSave: (content: string) => void;
  onCancel: () => void;
}

export function RichTextJobEditor({ initialContent, onSave, onCancel }: RichTextJobEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);

  // Convert markdown-like syntax to HTML for the editor
  const prepareContent = useCallback((content: string) => {
    // Format markdown-style content to HTML
    let html = content
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\n\n/g, '</p><p>')
      .replace(/\*(.*?)(?:\n|$)/g, '<li>$1</li>');
    
    // Wrap in paragraphs if not already
    if (!html.startsWith('<p>')) {
      html = `<p>${html}</p>`;
    }
    
    // Convert bullet lists to proper HTML lists
    const parts = html.split('</p><p>');
    const processed = parts.map(part => {
      if (part.includes('<li>')) {
        return part.replace(/<li>(.*?)<\/li>/g, '<li>$1</li>');
      }
      return part;
    }).join('</p><p>');
    
    return processed;
  }, []);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Placeholder.configure({
        placeholder: 'Edit job description...',
      }),
    ],
    content: prepareContent(initialContent),
    editorProps: {
      attributes: {
        class: 'prose prose-sm max-w-none focus:outline-none min-h-[300px] p-4 border rounded-md bg-white',
      },
    },
  });

  useEffect(() => {
    if (editor && initialContent) {
      editor.commands.setContent(prepareContent(initialContent));
    }
  }, [editor, initialContent, prepareContent]);

  const handleSave = () => {
    if (editor) {
      // Convert from HTML back to a format similar to the input
      let content = editor.getHTML();
      
      // Clean up HTML for storage
      content = content
        .replace(/<p>/g, '')
        .replace(/<\/p>/g, '\n\n')
        .replace(/<strong>(.*?)<\/strong>/g, '**$1**')
        .replace(/<li>(.*?)<\/li>/g, '* $1\n')
        .replace(/<ul>|<\/ul>/g, '')
        .replace(/\n\n\n/g, '\n\n') // Remove triple line breaks
        .trim();
      
      onSave(content);
    }
  };

  const exportToPDF = async () => {
    if (!editor || !editorRef.current) return;

    try {
      toast.loading("Preparing PDF export...");

      // First save the content
      handleSave();

      // Temporarily modify the editor's styling for better PDF rendering
      const editorElement = editorRef.current;
      const originalClass = editorElement.className;
      editorElement.className = "prose max-w-none p-8 bg-white text-black";

      // Wait for the styling changes to take effect
      await new Promise(resolve => setTimeout(resolve, 100));

      // Generate PDF
      const canvas = await html2canvas(editorElement, {
        scale: 2,
        logging: false,
        useCORS: true,
        backgroundColor: "#ffffff"
      });

      // Restore original styling
      editorElement.className = originalClass;

      // Create PDF document
      const pdf = new jsPDF({
        format: 'a4',
        unit: 'mm',
      });

      // Calculate dimensions
      const imgWidth = 210; // A4 width in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      // Add title
      pdf.setFontSize(16);
      pdf.text("Job Description", 105, 15, { align: 'center' });
      
      // Add date
      pdf.setFontSize(10);
      pdf.text(`Generated on ${new Date().toLocaleDateString()}`, 105, 22, { align: 'center' });
      
      // Add content
      pdf.addImage(
        canvas.toDataURL('image/png'),
        'PNG',
        0,
        30,
        imgWidth,
        imgHeight
      );

      // Save the PDF
      pdf.save('job-description.pdf');
      toast.dismiss();
      toast.success("PDF exported successfully");
    } catch (error) {
      console.error("Error exporting PDF:", error);
      toast.dismiss();
      toast.error("Failed to export PDF");
    }
  };

  if (!editor) {
    return null;
  }

  return (
    <div className="space-y-2">
      <div className="bg-gray-50 border rounded-md p-1 flex flex-wrap gap-1">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={editor.isActive('bold') ? 'bg-gray-200' : ''}
        >
          <Bold className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={editor.isActive('italic') ? 'bg-gray-200' : ''}
        >
          <Italic className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          className={editor.isActive('underline') ? 'bg-gray-200' : ''}
        >
          <UnderlineIcon className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={editor.isActive('heading', { level: 2 }) ? 'bg-gray-200' : ''}
        >
          <Heading2 className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={editor.isActive('bulletList') ? 'bg-gray-200' : ''}
        >
          <List className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={editor.isActive('orderedList') ? 'bg-gray-200' : ''}
        >
          <ListOrdered className="h-4 w-4" />
        </Button>
      </div>
      
      <div ref={editorRef}>
        <EditorContent editor={editor} className="min-h-[200px]" />
      </div>
      
      <div className="flex justify-end gap-2 mt-4">
        <Button
          variant="outline"
          size="sm"
          onClick={onCancel}
          className="flex items-center gap-1"
        >
          <X className="h-4 w-4" />
          Cancel
        </Button>
        <Button
          variant="secondary"
          size="sm"
          onClick={exportToPDF}
          className="flex items-center gap-1"
        >
          <Save className="h-4 w-4" />
          Save as PDF
        </Button>
      </div>
    </div>
  );
}
