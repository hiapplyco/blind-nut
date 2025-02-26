
import React, { useEffect } from 'react';
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
import { ArrowLeft } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { Dashboard } from '../dashboard/Dashboard';
import { EditorToolbar } from './editor/EditorToolbar';
import { formatAnalysisContent, formatJobData } from './utils/formatAnalysis';
import { DEFAULT_CARD_CONFIGS } from './constants/cardConfigs';

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

  useEffect(() => {
    if (editor && job?.analysis) {
      const analysisContent = formatAnalysisContent(job.analysis);
      editor.commands.setContent(analysisContent);
    }
  }, [editor, job]);

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

  const formattedData = formatJobData(job.analysis);

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

      {formattedData && (
        <div className="mb-8">
          <Dashboard data={formattedData} configs={DEFAULT_CARD_CONFIGS} />
        </div>
      )}

      <div className="prose max-w-none">
        <div className="border rounded-lg bg-white shadow-sm">
          <EditorToolbar editor={editor} />
          <div className="p-4">
            <EditorContent editor={editor} />
          </div>
        </div>
      </div>
    </div>
  );
}
