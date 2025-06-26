
export interface ResumeMatch {
  id: number;
  similarity_score: number;
  matching_keywords: string[] | undefined;
  matching_entities: string[] | undefined;
  created_at: string;
  parsed_resume: {
    skills?: string[];
    experience?: string[];
    education?: string[];
  } | null;
  parsed_job: {
    title?: string;
    requirements?: string[];
    skills?: string[];
  } | null;
}

export interface ResumeUploadResponse {
  success: boolean;
  message: string;
  matches?: ResumeMatch[];
}

export interface ResumeMatcherProps {
  jobId: number;
  userId: string;
}
