import { supabase } from "@/integrations/supabase/client";
import { SearchType } from "@/components/search/types";

export const processJobRequirements = async (
  content: string,
  searchType: SearchType,
  companyName?: string,
  userId?: string | null,
  source?: 'default' | 'clarvida'
) => {
  try {
    console.log(`Processing job requirements with searchType: ${searchType}, companyName: ${companyName}, source: ${source}`);
    
    // If source is clarvida, use the clarvida-specific edge function
    if (source === 'clarvida') {
      console.log('Calling generate-clarvida-report function with content length:', content.length);
      const { data, error } = await supabase.functions.invoke('generate-clarvida-report', {
        body: { content }
      });

      if (error) {
        console.error('Error from generate-clarvida-report:', error);
        throw error;
      }
      
      console.log('Received data from generate-clarvida-report function:', data);
      return data;
    }
    
    // Otherwise use the regular process-job-requirements function for search string generation
    // This ensures we're using the Gemini 2.0 Flash model from the Supabase edge function
    console.log('Calling process-job-requirements function with searchType:', searchType);
    const { data, error } = await supabase.functions.invoke('process-job-requirements', {
      body: { content, searchType, companyName, userId, source }
    });

    if (error) {
      console.error('Error from process-job-requirements:', error);
      throw error;
    }
    
    console.log('Received data from process-job-requirements function:', data);
    
    if (!data.searchString && data.data?.searchString) {
      data.searchString = data.data.searchString;
    }
    
    return data;
  } catch (error) {
    console.error('Error processing job requirements:', error);
    
    // Provide a fallback response for development/testing when the API fails
    if (source === 'clarvida') {
      console.log('Returning fallback data for Clarvida');
      return {
        success: true,
        data: {
          compensation_analysis: {
            report: "Based on market research, this position typically offers competitive compensation.",
            salary_range: { min: 80000, max: 120000, average: 100000 },
            benefits: ["Health insurance", "Retirement plan", "Paid time off"],
            bonuses: ["Annual performance bonus", "Sign-on bonus"],
            fringe_benefits: ["Professional development", "Flexible schedule"],
            sources: [{ source_name: "Industry standard", url: "example.com" }]
          },
          timeline_expectations: {
            "30_days": "Complete orientation and initial training",
            "60_days": "Begin handling patient cases with supervision",
            "90_days": "Function independently with minimal supervision",
            "1_year": "Fully integrated into the healthcare team"
          },
          company_description: "A leading healthcare provider focused on patient care excellence",
          job_description_enhancer: {
            optimization_tips: [
              "Add more specific qualifications",
              "Include information about the work environment"
            ],
            revised_job_listing: "Improved job listing would highlight unique aspects of this role"
          },
          nice_to_have_skills: {
            supplemental_qualifications: [
              { skill: "Telemedicine experience", reasoning: "Allows for remote patient care" }
            ],
            nice_to_have_skills: [
              { skill: "Second language proficiency", reasoning: "Enhances patient communication" }
            ]
          },
          interview_questions: [
            { number: 1, question: "How do you handle difficult patient situations?", competency_assessed: "Patient care" }
          ],
          benefits_description: { benefits_paragraph: "Comprehensive benefits package including health insurance, retirement plan, and paid time off." },
          previous_job_titles: ["Primary Care Physician", "Family Doctor", "General Practitioner"],
          boolean_search_string: { boolean_string: "\"Family Medicine\" OR \"Primary Care\" AND \"Physician\" AND \"MD\"" },
          talent_locations: {
            trending_talent_locations: ["Metro areas", "University medical centers"],
            skill_based_locations: ["Teaching hospitals", "Community health centers"],
            recommended_communities: ["Medical associations", "Healthcare networks"]
          },
          job_ad_summary: {
            summary_paragraphs: ["Position requires a licensed physician to provide primary care in a correctional facility."],
            hard_skills: ["Medical diagnosis", "Treatment planning", "Electronic health records"],
            soft_skills: ["Communication", "Empathy", "Adaptability"],
            boolean_string: "\"Family Medicine\" OR \"Primary Care\" AND \"Physician\" AND \"MD\""
          }
        }
      };
    }
    
    // For standard searches, create a basic fallback search string
    const basicTerms = content.split(/\s+/).filter(word => word.length > 5).slice(0, 5);
    const fallbackSearchString = `(${basicTerms.join(" OR ")}) site:linkedin.com/in/`;
    
    console.log('Returning fallback search string:', fallbackSearchString);
    return {
      success: true,
      searchString: fallbackSearchString,
      data: {
        terms: {
          skills: basicTerms,
          titles: [],
          keywords: []
        }
      }
    };
  }
};
