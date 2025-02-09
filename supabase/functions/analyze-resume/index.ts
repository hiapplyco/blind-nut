
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'
import { GoogleGenerativeAI } from "npm:@google/generative-ai"

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
    const jobId = formData.get('jobId')
    const userId = formData.get('userId')

    if (!file || !jobId || !userId) {
      throw new Error('Missing required fields')
    }

    // Initialize Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Get job description
    const { data: jobData, error: jobError } = await supabase
      .from('jobs')
      .select('content')
      .eq('id', jobId)
      .single()

    if (jobError) throw jobError
    if (!jobData?.content) throw new Error('Job description not found')

    // Upload file to storage
    const fileExt = (file as File).name.split('.').pop()
    const filePath = `${userId}/${crypto.randomUUID()}.${fileExt}`

    const { error: uploadError } = await supabase.storage
      .from('resumes')
      .upload(filePath, file as File)

    if (uploadError) throw uploadError

    // Initialize Gemini
    const genAI = new GoogleGenerativeAI(Deno.env.get('GEMINI_API_KEY') || '')
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" })

    // Convert resume to text
    const arrayBuffer = await (file as File).arrayBuffer()
    const resumeText = new TextDecoder().decode(arrayBuffer)

    // Analyze with Gemini
    const prompt = `You are a resume analyzer. Compare this resume against the job description and return a JSON object (do not include markdown backticks) with the following fields:
    - similarityScore (0-100)
    - parsedResume (extracted skills, experience, education)
    - parsedJob (required skills, qualifications, responsibilities)
    - matchingKeywords (array of matching terms)
    - matchingEntities (array of matching company names, technologies, etc.)

    Job Description:
    ${jobData.content}

    Resume:
    ${resumeText}

    Return ONLY the JSON object, no other text.
    `

    const result = await model.generateContent(prompt)
    const responseText = result.response.text()
    
    // Remove any markdown formatting if present
    const cleanJson = responseText.replace(/```json\n?|\n?```/g, '').trim()
    
    console.log('Cleaned JSON:', cleanJson)
    
    try {
      const analysis = JSON.parse(cleanJson)

      return new Response(
        JSON.stringify({
          filePath,
          resumeText,
          ...analysis
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    } catch (parseError) {
      console.error('Error parsing JSON:', parseError)
      console.error('Raw response:', responseText)
      throw new Error('Failed to parse analysis results')
    }

  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})
