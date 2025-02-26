
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Bold from '@tiptap/extension-bold';
import Italic from '@tiptap/extension-italic';
import Underline from '@tiptap/extension-underline';
import Heading from '@tiptap/extension-heading';
import BulletList from '@tiptap/extension-bullet-list';
import OrderedList from '@tiptap/extension-ordered-list';
import { EditorToolbar } from './EditorToolbar';
import { useEffect } from 'react';
import { formatAnalysisContent } from '../utils/formatAnalysis';

interface JobEditorContentProps {
  initialContent?: any;
}

export function JobEditorContent({ initialContent }: JobEditorContentProps) {
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
    if (editor && initialContent?.analysis) {
      const analysisContent = formatAnalysisContent(initialContent.analysis);
      editor.commands.setContent(analysisContent);
    }
  }, [editor, initialContent]);

  return (
    <div className="prose max-w-none">
      <div className="border rounded-lg bg-white shadow-sm">
        <EditorToolbar editor={editor} />
        <div className="p-4">
          <EditorContent editor={editor} />
        </div>
      </div>
    </div>
  );
}

