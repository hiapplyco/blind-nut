import { useParams, useNavigate } from 'react-router-dom';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Bold from '@tiptap/extension-bold';
import Italic from '@tiptap/extension-italic';
import Underline from '@tiptap/extension-underline';
import Heading from '@tiptap/extension-heading';
import BulletList from '@tiptap/extension-bullet-list';
import OrderedList from '@tiptap/extension-ordered-list';
import { Button } from "@/components/ui/button";
import { ArrowLeft, Bold as BoldIcon, Italic as ItalicIcon, Underline as UnderlineIcon, 
         Heading1, Heading2, List, ListOrdered } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { useEffect } from 'react';

export function JobEditorPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: job, isLoading, error } = useQuery({
    queryKey: ['job', id],
    queryFn: async () => {
      console.log("Fetching job data for ID:", id);
      const { data, error } = await supabase
        .from('jobs')
        .select('*')
        .eq('id', Number(id))
        .single();

      if (error) {
        console.error("Error fetching job:", error);
        throw error;
      }
      
      console.log("Job data received:", data);
      return data;
    },
  });

  const editor = useEditor({
    extensions: [
      StarterKit,
      Bold,
      Italic,
      Underline,
      Heading,
      BulletList,
      OrderedList,
    ],
    content: '',
    editable: true,
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none min-h-[500px] p-4',
      },
    },
  });

  // Update editor content when job data is loaded
  useEffect(() => {
    if (editor && job?.analysis) {
      const analysisContent = formatAnalysisContent(job.analysis);
      editor.commands.setContent(analysisContent);
    }
  }, [editor, job]);

  const MenuBar = () => {
    if (!editor) {
      return null;
    }

    return (
      <div className="border-b p-2 flex flex-wrap gap-2">
        <Button
          variant="outline"
          size="icon"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={editor.isActive('bold') ? 'bg-slate-200' : ''}
        >
          <BoldIcon className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={editor.isActive('italic') ? 'bg-slate-200' : ''}
        >
          <ItalicIcon className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          className={editor.isActive('underline') ? 'bg-slate-200' : ''}
        >
          <UnderlineIcon className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          className={editor.isActive('heading', { level: 1 }) ? 'bg-slate-200' : ''}
        >
          <Heading1 className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={editor.isActive('heading', { level: 2 }) ? 'bg-slate-200' : ''}
        >
          <Heading2 className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={editor.isActive('bulletList') ? 'bg-slate-200' : ''}
        >
          <List className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={editor.isActive('orderedList') ? 'bg-slate-200' : ''}
        >
          <ListOrdered className="h-4 w-4" />
        </Button>
      </div>
    );
  };

  const formatAnalysisContent = (analysis: any) => {
    try {
      let content = '';
      const data = typeof analysis === 'string' ? JSON.parse(analysis) : analysis;

      // Format extracted data
      content += '<h1>Job Details</h1>\n';
      const { extractedData } = data;
      content += `<h2>${extractedData.title || 'Job Title'}</h2>\n`;
      content += `<p><strong>Location:</strong> ${extractedData.location}</p>\n`;
      content += `<p><strong>Job Type:</strong> ${extractedData.jobType}</p>\n`;
      content += `<p><strong>Experience Level:</strong> ${extractedData.experienceLevel}</p>\n`;
      
      // Salary Range
      if (extractedData.salaryRange) {
        content += `<p><strong>Salary Range:</strong> $${extractedData.salaryRange.min.toLocaleString()} - $${extractedData.salaryRange.max.toLocaleString()}</p>\n`;
      }

      // Skills
      if (extractedData.skills && extractedData.skills.length > 0) {
        content += '<h3>Required Skills</h3>\n<ul>\n';
        extractedData.skills.forEach(skill => {
          content += `<li>${skill}</li>\n`;
        });
        content += '</ul>\n';
      }

      // Analysis sections
      const { analysis: jobAnalysis } = data;
      
      content += '<h2>Market Analysis</h2>\n';
      content += `<p>${jobAnalysis.marketInsights}</p>\n`;

      content += '<h2>Compensation Analysis</h2>\n';
      content += `<p>${jobAnalysis.compensationAnalysis}</p>\n`;

      content += '<h2>Skills Evaluation</h2>\n';
      content += `<p>${jobAnalysis.skillsEvaluation}</p>\n`;

      if (jobAnalysis.recommendations && jobAnalysis.recommendations.length > 0) {
        content += '<h2>Recommendations</h2>\n<ul>\n';
        jobAnalysis.recommendations.forEach(rec => {
          content += `<li>${rec}</li>\n`;
        });
        content += '</ul>\n';
      }

      return content;
    } catch (error) {
      console.error('Error formatting analysis:', error);
      return '<p>Error formatting analysis data</p>';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error) {
    toast({
      title: "Error",
      description: "Failed to load job analysis",
      variant: "destructive",
    });
    return (
      <div className="flex items-center justify-center min-h-screen text-red-500">
        Error loading job analysis
      </div>
    );
  }

  if (!job) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        No job found
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="flex items-center mb-6">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => navigate(-1)}
          className="mr-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <h1 className="text-3xl font-bold">
          Job Analysis
        </h1>
      </div>

      <div className="prose max-w-none">
        <div className="border rounded-lg bg-white shadow-sm">
          <MenuBar />
          <div className="p-4">
            <EditorContent editor={editor} />
          </div>
        </div>
      </div>
    </div>
  );
}
