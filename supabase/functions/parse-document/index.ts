import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'
import { createWorker } from 'https://esm.sh/tesseract.js@4.1.1'
import { encode as base64Encode } from "https://deno.land/std@0.168.0/encoding/base64.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const formData = await req.formData()
    const file = formData.get('file')
    const userId = formData.get('userId')

    if (!file || !userId) {
      throw new Error('No file uploaded or missing user ID')
    }

    console.log('Processing file:', (file as File).name, 'of type:', (file as File).type)

    // Create Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Generate unique file path
    const filePath = `${crypto.randomUUID()}-${(file as File).name}`

    // Get file data as ArrayBuffer
    const arrayBuffer = await (file as File).arrayBuffer()

    // Upload file to Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from('docs')
      .upload(filePath, arrayBuffer, {
        contentType: (file as File).type,
        upsert: false
      })

    if (uploadError) {
      console.error('Upload error:', uploadError)
      throw new Error(`Failed to upload file: ${uploadError.message}`)
    }

    console.log('File uploaded, starting OCR processing...')

    // Initialize Tesseract worker
    const worker = await createWorker()
    await worker.loadLanguage('eng')
    await worker.initialize('eng')

    // Convert array buffer to base64
    const uint8Array = new Uint8Array(arrayBuffer)
    const base64Data = base64Encode(uint8Array)
    
    // Create data URL for Tesseract
    const dataUrl = `data:${(file as File).type};base64,${base64Data}`

    try {
      // Perform OCR
      const { data: { text } } = await worker.recognize(dataUrl)
      console.log('OCR completed successfully')
      
      await worker.terminate()

      // Store parsed document in database
      const { error: dbError } = await supabase
        .from('parsed_documents')
        .insert({
          user_id: userId,
          original_filename: (file as File).name,
          parsed_text: text,
          file_path: filePath
        })

      if (dbError) {
        console.error('Database error:', dbError)
        throw new Error(`Failed to store parsed document: ${dbError.message}`)
      }

      return new Response(
        JSON.stringify({ 
          success: true,
          text,
          filePath,
          message: 'Document processed successfully'
        }),
        { 
          headers: { 
            ...corsHeaders,
            'Content-Type': 'application/json'
          }
        }
      )
    } catch (ocrError) {
      console.error('OCR error:', ocrError)
      throw new Error(`OCR processing failed: ${ocrError.message}`)
    }

  } catch (error) {
    console.error('Error processing document:', error)
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message 
      }),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json'
        },
        status: 400
      }
    )
  }
})