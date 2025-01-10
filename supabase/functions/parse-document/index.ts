import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { PDFDocument } from 'https://cdn.skypack.dev/pdf-lib';
import * as mammoth from 'https://esm.sh/mammoth@1.6.0';

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
      try {
        // Use mammoth to convert DOCX to text
        const result = await mammoth.extractRawText({ arrayBuffer: arrayBuffer });
        extractedText = result.value;
        
        // Log any warnings
        if (result.messages.length > 0) {
          console.log('Warnings during DOCX parsing:', result.messages);
        }
        
        console.log('Successfully processed DOCX document');
      } catch (docxError) {
        console.error('DOCX parsing error:', docxError);
        throw new Error(`Failed to parse DOCX document: ${docxError.message}`);
      }
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