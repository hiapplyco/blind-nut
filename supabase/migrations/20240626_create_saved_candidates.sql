-- Create saved_candidates table
CREATE TABLE IF NOT EXISTS public.saved_candidates (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  job_id BIGINT REFERENCES public.jobs(id) ON DELETE SET NULL,
  
  -- Basic Information
  name TEXT NOT NULL,
  linkedin_url TEXT,
  
  -- Professional Information
  job_title TEXT,
  company TEXT,
  location TEXT,
  seniority_level TEXT,
  
  -- Contact Information (from enrichment)
  work_email TEXT,
  personal_emails TEXT[], -- Array of personal emails
  mobile_phone TEXT,
  
  -- Additional Profile Data
  profile_summary TEXT,
  skills TEXT[], -- Array of skills
  profile_completeness INTEGER,
  
  -- Search Context
  search_string TEXT, -- The boolean search that found this candidate
  source TEXT DEFAULT 'linkedin', -- Where the candidate was found
  
  -- Metadata
  notes TEXT, -- User notes about the candidate
  tags TEXT[], -- User-defined tags
  status TEXT DEFAULT 'new', -- new, contacted, interviewing, rejected, hired
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Ensure unique candidates per user
  UNIQUE(user_id, linkedin_url)
);

-- Create indexes for better query performance
CREATE INDEX idx_saved_candidates_user_id ON public.saved_candidates(user_id);
CREATE INDEX idx_saved_candidates_job_id ON public.saved_candidates(job_id);
CREATE INDEX idx_saved_candidates_status ON public.saved_candidates(status);
CREATE INDEX idx_saved_candidates_created_at ON public.saved_candidates(created_at DESC);

-- Enable Row Level Security
ALTER TABLE public.saved_candidates ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own saved candidates" ON public.saved_candidates
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own saved candidates" ON public.saved_candidates
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own saved candidates" ON public.saved_candidates
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own saved candidates" ON public.saved_candidates
  FOR DELETE USING (auth.uid() = user_id);

-- Create a function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create a trigger to automatically update the updated_at column
CREATE TRIGGER update_saved_candidates_updated_at
  BEFORE UPDATE ON public.saved_candidates
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Add a comment to the table
COMMENT ON TABLE public.saved_candidates IS 'Stores candidate profiles saved by users during their searches';