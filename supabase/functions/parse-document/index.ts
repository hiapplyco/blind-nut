import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const formData = await req.formData()
    const file = formData.get('file')

    if (!file) {
      throw new Error('No file uploaded')
    }

    // Get file extension and validate file type
    const fileName = (file as File).name.toLowerCase()
    const fileExt = fileName.split('.').pop()

    if (fileExt !== 'pdf') {
      throw new Error('Invalid file type. Only PDF files are supported.')
    }

    // Convert file to text using TextDecoder
    const arrayBuffer = await (file as File).arrayBuffer()
    const uint8Array = new Uint8Array(arrayBuffer)
    const textDecoder = new TextDecoder('utf-8')
    const text = textDecoder.decode(uint8Array)

    console.log('Successfully processed file:', fileName)
    console.log('Extracted text length:', text.length)

    return new Response(
      JSON.stringify({ text }),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    )

  } catch (error) {
    console.error('Error processing file:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
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