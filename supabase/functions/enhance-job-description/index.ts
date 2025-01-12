import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { GoogleGenerativeAI } from "npm:@google/generative-ai";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { content } = await req.json();
    console.log('Enhancing job description:', content?.substring(0, 100) + '...');

    if (!content) {
      throw new Error('No content provided');
    }

    const genAI = new GoogleGenerativeAI(Deno.env.get('GEMINI_API_KEY') || '');
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    const prompt = `As an experienced Talent Acquisition specialist, enhance this job description using engaging markdown formatting with clear headers and emphasis on key points that will attract top talent. Create a comprehensive, well-structured description that highlights:

# 🚀 Enhanced Job Description

## 🏢 Company Impact & Culture
- **Mission & Vision:** *What makes this company unique and inspiring*
- **Company Culture:** *Key aspects of work environment and values*
- **Growth Trajectory:** *Company's market position and future vision*
- **Innovation Focus:** *How the company drives industry change*

## 💫 Role Overview & Impact
- **Position Impact:** *How this role contributes to company success*
- **Key Objectives:** *Clear definition of what success looks like*
- **Team Context:** *Where this role fits in the organization*
- **Strategic Value:** *How this role shapes company direction*

## 📋 Essential Qualifications
- **Technical Expertise:** *Must-have technical skills and tools*
- **Experience Level:** *Required years and type of background*
- **Industry Knowledge:** *Specific sector expertise needed*
- **Core Competencies:** *Critical technical requirements*
- **Soft Skills:** *Essential interpersonal abilities*

## 🌟 Preferred Qualifications
- **Advanced Skills:** *Nice-to-have technical expertise*
- **Additional Experience:** *Beneficial background areas*
- **Industry Insights:** *Valuable sector knowledge*
- **Leadership Abilities:** *Management or mentoring experience*
- **Certifications:** *Relevant professional certifications*

## 📈 Growth & Development
- **Career Progression:** *Clear advancement opportunities*
- **Professional Development:** *Learning and growth resources*
- **Mentorship:** *Available guidance and support systems*
- **Training Programs:** *Structured learning opportunities*
- **Innovation Opportunities:** *Chances to drive change*

## 🎯 Success Metrics & Expectations
- **First 90 Days:** *Initial objectives and milestones*
- **Key Responsibilities:** *Primary duties and projects*
- **Performance Indicators:** *How success will be measured*
- **Team Collaboration:** *Cross-functional partnerships*
- **Strategic Goals:** *Long-term objectives*

## 🤝 Work Environment & Culture
- **Team Structure:** *Immediate team composition*
- **Collaboration Style:** *How the team works together*
- **Work Arrangement:** *Remote/hybrid/office expectations*
- **Company Values:** *Core principles in action*
- **Innovation Culture:** *Approach to new ideas*

## 📊 Impact & Outcomes
- **Business Impact:** *How role affects company success*
- **Team Influence:** *Leadership and mentoring opportunities*
- **Growth Potential:** *Future role evolution*
- **Innovation Scope:** *Opportunities to drive change*
- **Success Metrics:** *Key performance indicators*

## 🌈 Diversity & Inclusion
- **Inclusive Culture:** *Commitment to diversity*
- **Equal Opportunity:** *Fair hiring practices*
- **Support Systems:** *Employee resource groups*
- **Accessibility:** *Accommodations and support*

## 🎁 Benefits & Perks Highlights
- **Health & Wellness:** *Comprehensive benefits*
- **Work-Life Balance:** *Flexible arrangements*
- **Professional Growth:** *Development opportunities*
- **Additional Perks:** *Unique company benefits*

## 🚀 Next Steps & Application
- **Application Process:** *How to apply*
- **Timeline:** *What to expect*
- **Contact Details:** *Who to reach out to*
- **Required Materials:** *What to submit*

Format the content to be:
- Engaging and scannable
- Clear and concise
- Action-oriented
- Value-focused
- Achievement-centered

Use:
- Bold for headers and key terms
- Italic for supporting details
- Bullet points for easy scanning
- Emojis for visual engagement
- Active voice and strong verbs

Highlight:
- Unique opportunities
- Growth potential
- Company culture
- Innovation focus
- Impact potential

Original job description: ${content}`;

    console.log('Using prompt for job description enhancement:', prompt);

    const result = await model.generateContent(prompt);
    const enhancedDescription = result.response.text();
    console.log('Enhanced description generated successfully');
    
    return new Response(
      JSON.stringify({ enhancedDescription }),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json'
        } 
      }
    );
  } catch (error) {
    console.error('Error in enhance-job-description:', error);
    
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: error.stack 
      }),
      { 
        status: 500,
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    );
  }
});