
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
    required_skills?: string[];
    qualifications?: string[];
    responsibilities?: string[];
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
