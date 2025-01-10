import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { PDFDocument } from 'https://cdn.skypack.dev/pdf-lib';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const formData = await req.formData();
    const file = formData.get('file');

    if (!file) {
      throw new Error('No file uploaded');
    }

    // Get file extension
    const fileName = (file as File).name.toLowerCase();
    const fileExt = fileName.split('.').pop();

    if (!['pdf', 'docx'].includes(fileExt ?? '')) {
      throw new Error('Unsupported file type. Only PDF and DOCX files are supported.');
    }

    let extractedText = '';
    const arrayBuffer = await (file as File).arrayBuffer();

    if (fileExt === 'pdf') {
      try {
        const pdfDoc = await PDFDocument.load(arrayBuffer);
        const numPages = pdfDoc.getPageCount();
        extractedText = '';
        
        // Iterate through pages and extract text content
        for (let i = 0; i < numPages; i++) {
          const page = pdfDoc.getPage(i);
          // Since getText() is not available, we'll need to implement a different approach
          // For now, we'll add a placeholder message
          extractedText += `[PDF text extraction not supported yet for page ${i + 1}]\n`;
        }
        
        console.log('Successfully processed PDF with', numPages, 'pages');
      } catch (pdfError) {
        console.error('PDF parsing error:', pdfError);
        throw new Error(`Failed to parse PDF document: ${pdfError.message}`);
      }
    } else if (fileExt === 'docx') {
      // For DOCX files, we'll return the raw text content for now
      const decoder = new TextDecoder('utf-8');
      extractedText = decoder.decode(arrayBuffer);
    }

    return new Response(
      JSON.stringify({ text: extractedText }),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    );

  } catch (error) {
    console.error('Error processing file:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 400,
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    );
  }
});