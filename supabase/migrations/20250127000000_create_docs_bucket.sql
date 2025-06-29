-- Create docs storage bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('docs', 'docs', false, 52428800, -- 50MB limit
  ARRAY[
    'application/pdf', 
    'text/plain', 
    'image/png', 
    'image/jpeg', 
    'image/jpg',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document', -- .docx
    'application/msword', -- .doc
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', -- .xlsx
    'application/vnd.ms-excel' -- .xls
  ]::text[]
)
ON CONFLICT (id) DO NOTHING;

-- Create RLS policies for docs bucket
CREATE POLICY "Authenticated users can upload docs"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'docs');

CREATE POLICY "Users can view their own docs"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'docs' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own docs"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'docs' AND auth.uid()::text = (storage.foldername(name))[1]);