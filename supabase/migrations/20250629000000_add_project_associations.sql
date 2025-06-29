-- Add project_id to interview_sessions table
ALTER TABLE public.interview_sessions 
ADD COLUMN project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL;

-- Add project_id to kickoff_calls table
ALTER TABLE public.kickoff_calls 
ADD COLUMN project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL;

-- Add project_id to meetings table
ALTER TABLE public.meetings 
ADD COLUMN project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL;

-- Add project_id to chat_sessions table
ALTER TABLE public.chat_sessions 
ADD COLUMN project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL;

-- Add project_id to jobs table
ALTER TABLE public.jobs 
ADD COLUMN project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL;

-- Add project_id to agent_outputs table
ALTER TABLE public.agent_outputs 
ADD COLUMN project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL;

-- Create indexes for better performance
CREATE INDEX idx_interview_sessions_project_id ON public.interview_sessions(project_id);
CREATE INDEX idx_kickoff_calls_project_id ON public.kickoff_calls(project_id);
CREATE INDEX idx_meetings_project_id ON public.meetings(project_id);
CREATE INDEX idx_chat_sessions_project_id ON public.chat_sessions(project_id);
CREATE INDEX idx_jobs_project_id ON public.jobs(project_id);
CREATE INDEX idx_agent_outputs_project_id ON public.agent_outputs(project_id);

-- Update RLS policies to include project checks where appropriate
-- This ensures users can only see data in projects they own

-- Example: Update interview_sessions policy
CREATE OR REPLACE POLICY "Users can view own interview sessions" ON public.interview_sessions
    FOR SELECT USING (
        auth.uid() = user_id OR 
        (project_id IS NOT NULL AND EXISTS (
            SELECT 1 FROM public.projects 
            WHERE projects.id = interview_sessions.project_id 
            AND projects.user_id = auth.uid()
        ))
    );

-- Create a function to get all data associated with a project
CREATE OR REPLACE FUNCTION get_project_data(p_project_id UUID)
RETURNS TABLE (
    data_type TEXT,
    count BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 'candidates' as data_type, COUNT(*) as count
    FROM public.project_candidates
    WHERE project_id = p_project_id
    
    UNION ALL
    
    SELECT 'searches' as data_type, COUNT(*) as count
    FROM public.search_history
    WHERE project_id = p_project_id
    
    UNION ALL
    
    SELECT 'interviews' as data_type, COUNT(*) as count
    FROM public.interview_sessions
    WHERE project_id = p_project_id
    
    UNION ALL
    
    SELECT 'kickoff_calls' as data_type, COUNT(*) as count
    FROM public.kickoff_calls
    WHERE project_id = p_project_id
    
    UNION ALL
    
    SELECT 'meetings' as data_type, COUNT(*) as count
    FROM public.meetings
    WHERE project_id = p_project_id
    
    UNION ALL
    
    SELECT 'jobs' as data_type, COUNT(*) as count
    FROM public.jobs
    WHERE project_id = p_project_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;