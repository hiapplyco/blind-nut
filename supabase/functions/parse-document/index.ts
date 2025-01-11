import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'
import { createWorker } from 'https://esm.sh/tesseract.js@4.1.1'

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

    // Get file details
    const fileName = (file as File).name
    const fileType = (file as File).type
    const arrayBuffer = await (file as File).arrayBuffer()

    // Create Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Generate unique file path
    const filePath = `${crypto.randomUUID()}-${fileName}`

    // Upload file to Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from('docs')
      .upload(filePath, arrayBuffer, {
        contentType: fileType,
        upsert: false
      })

    if (uploadError) {
      throw new Error(`Failed to upload file: ${uploadError.message}`)
    }

    console.log('File uploaded, starting OCR processing...')

    // Initialize Tesseract worker
    const worker = await createWorker()
    await worker.loadLanguage('eng')
    await worker.initialize('eng')

    // Convert array buffer to Uint8Array for processing
    const uint8Array = new Uint8Array(arrayBuffer)
    
    // Create base64 string for Tesseract
    const base64 = Array.from(uint8Array)
      .map(byte => String.fromCharCode(byte))
      .join('')
    const base64Data = btoa(base64)
    
    // Perform OCR using base64 data URL
    const { data: { text } } = await worker.recognize(
      `data:${fileType};base64,${base64Data}`
    )
    
    await worker.terminate()

    console.log('OCR processing completed, storing results...')

    // Store parsed document in database
    const { error: dbError } = await supabase
      .from('parsed_documents')
      .insert({
        user_id: userId,
        original_filename: fileName,
        parsed_text: text,
        file_path: filePath
      })

    if (dbError) {
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