-- Create table for storing scraped data associated with projects
CREATE TABLE IF NOT EXISTS public.project_scraped_data (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  url text NOT NULL,
  summary text,
  raw_content text,
  context text, -- 'sourcing', 'job-posting', 'search', 'kickoff', 'general'
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX idx_project_scraped_data_project_id ON public.project_scraped_data(project_id);
CREATE INDEX idx_project_scraped_data_user_id ON public.project_scraped_data(user_id);
CREATE INDEX idx_project_scraped_data_created_at ON public.project_scraped_data(created_at DESC);

-- Enable RLS
ALTER TABLE public.project_scraped_data ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own scraped data" ON public.project_scraped_data
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own scraped data" ON public.project_scraped_data
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own scraped data" ON public.project_scraped_data
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own scraped data" ON public.project_scraped_data
  FOR DELETE USING (user_id = auth.uid());

-- Add updated_at trigger
CREATE TRIGGER update_project_scraped_data_updated_at
  BEFORE UPDATE ON public.project_scraped_data
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();