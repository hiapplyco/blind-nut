
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { InterviewSetupData } from '@/components/interview/InterviewSetupForm';
import { toast } from 'sonner';
import { useProjectContext } from '@/context/ProjectContext';

interface InterviewPlan {
  overview: string;
  estimatedDuration: string;
  keyAreas: string[];
  questions: Array<{
    category: string;
    question: string;
    followUp?: string[];
  }>;
  evaluationCriteria: string[];
}

export const useInterviewSetup = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState<number | null>(null);
  const [interviewPlan, setInterviewPlan] = useState<InterviewPlan | null>(null);
  const { selectedProjectId } = useProjectContext();

  const createInterviewSession = async (setupData: InterviewSetupData) => {
    setIsLoading(true);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('No authenticated user');
      }

      // Process uploaded files
      const uploadedFilesData = [];
      for (const file of setupData.uploadedFiles) {
        const fileData = {
          name: file.name,
          size: file.size,
          type: file.type,
          // In a real implementation, you'd upload to storage and store the URL
          content: await file.text() // For now, storing content directly
        };
        uploadedFilesData.push(fileData);
      }

      // Create interview session
      const { data: session, error: sessionError } = await supabase
        .from('interview_sessions')
        .insert({
          user_id: user.id,
          role_title: setupData.roleTitle,
          role_description: setupData.roleDescription,
          interview_framework: setupData.interviewFramework,
          custom_framework_prompt: setupData.customFrameworkPrompt,
          uploaded_files: uploadedFilesData,
          status: 'setup',
          project_id: selectedProjectId
        })
        .select()
        .single();

      if (sessionError) throw sessionError;

      setSessionId(session.id);

      // Generate interview plan
      const plan = await generateInterviewPlan(setupData);
      setInterviewPlan(plan);

      // Save the plan to database
      const { error: planError } = await supabase
        .from('interview_plans')
        .insert({
          session_id: session.id,
          plan_content: plan as any // Cast to any to satisfy Json type
        });

      if (planError) throw planError;

      toast.success('Interview session created successfully!');
      return session;

    } catch (error) {
      console.error('Error creating interview session:', error);
      toast.error('Failed to create interview session');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const generateInterviewPlan = async (setupData: InterviewSetupData): Promise<InterviewPlan> => {
    // This would typically call an AI service to generate the plan
    // For now, we'll create a structured plan based on the framework
    
    const frameworkTemplates = {
      star: {
        overview: 'This STAR method interview focuses on understanding the candidate\'s past experiences through specific examples of Situations, Tasks, Actions, and Results.',
        keyAreas: ['Problem Solving', 'Leadership', 'Communication', 'Achievement', 'Learning'],
        questions: [
          {
            category: 'Problem Solving',
            question: 'Tell me about a challenging situation you faced at work and how you handled it.',
            followUp: ['What was the specific task you needed to accomplish?', 'What actions did you take?', 'What was the outcome?']
          },
          {
            category: 'Leadership',
            question: 'Describe a time when you had to lead a team or project.',
            followUp: ['What was your approach to motivating the team?', 'How did you handle conflicts?', 'What results did you achieve?']
          }
        ]
      },
      behavioral: {
        overview: 'This behavioral interview explores the candidate\'s past behavior patterns to predict future performance in similar situations.',
        keyAreas: ['Teamwork', 'Adaptability', 'Decision Making', 'Communication', 'Work Ethics'],
        questions: [
          {
            category: 'Teamwork',
            question: 'How do you typically approach working with team members who have different working styles?',
            followUp: ['Can you give me a specific example?', 'What was the outcome?', 'What would you do differently?']
          },
          {
            category: 'Adaptability',
            question: 'Tell me about a time when you had to adapt to a significant change at work.',
            followUp: ['How did you initially react?', 'What steps did you take to adapt?', 'What did you learn from the experience?']
          }
        ]
      },
      competency: {
        overview: 'This competency-based interview evaluates the specific skills and abilities required for the role through targeted questions.',
        keyAreas: ['Technical Skills', 'Soft Skills', 'Role-Specific Competencies', 'Experience Level'],
        questions: [
          {
            category: 'Technical Skills',
            question: 'Walk me through your experience with the key technologies mentioned in the job description.',
            followUp: ['How would you rate your proficiency?', 'What projects have you used these in?', 'How do you stay updated?']
          },
          {
            category: 'Role-Specific',
            question: 'Based on the role requirements, what do you see as the biggest challenges in this position?',
            followUp: ['How would you approach these challenges?', 'What experience do you have with similar situations?']
          }
        ]
      }
    };

    const template = frameworkTemplates[setupData.interviewFramework as keyof typeof frameworkTemplates] || frameworkTemplates.behavioral;

    return {
      overview: template.overview,
      estimatedDuration: '45-60 minutes',
      keyAreas: template.keyAreas,
      questions: template.questions,
      evaluationCriteria: [
        'Relevance and specificity of examples provided',
        'Communication clarity and structure',
        'Alignment with role requirements',
        'Problem-solving approach and outcomes',
        'Cultural fit and team collaboration'
      ]
    };
  };

  return {
    createInterviewSession,
    isLoading,
    sessionId,
    interviewPlan
  };
};
