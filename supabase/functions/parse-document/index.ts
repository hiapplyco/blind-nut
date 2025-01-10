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

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get file extension
    const fileName = (file as File).name.toLowerCase();
    const fileExt = fileName.split('.').pop();

    if (!['pdf', 'docx'].includes(fileExt ?? '')) {
      throw new Error('Unsupported file type. Only PDF and DOCX files are supported.');
    }

    // Upload to temporary storage
    const filePath = `${crypto.randomUUID()}.${fileExt}`;
    const { error: uploadError } = await supabase.storage
      .from('temp_uploads')
      .upload(filePath, file);

    if (uploadError) {
      throw uploadError;
    }

    // Get the file URL
    const { data: { publicUrl } } = supabase.storage
      .from('temp_uploads')
      .getPublicUrl(filePath);

    // Download and parse the file
    const response = await fetch(publicUrl);
    const buffer = await response.arrayBuffer();

    let extractedText = '';

    if (fileExt === 'pdf') {
      const pdfDoc = await PDFDocument.load(buffer);
      const pages = pdfDoc.getPages();
      extractedText = pages.map(page => page.getText()).join('\n');
    } else if (fileExt === 'docx') {
      // For DOCX files, we'll return the raw text content for now
      // In a production environment, you'd want to use a proper DOCX parser
      const decoder = new TextDecoder('utf-8');
      extractedText = decoder.decode(buffer);
    }

    // Clean up: Delete the temporary file
    await supabase.storage
      .from('temp_uploads')
      .remove([filePath]);

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