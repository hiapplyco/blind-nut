export interface Project {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  color: string;
  icon: string;
  candidates_count: number;
  created_at: string;
  updated_at: string;
  is_archived: boolean;
  metadata?: Record<string, any>;
}

export interface ProjectCandidate {
  id: string;
  project_id: string;
  candidate_id: string;
  added_at: string;
  added_by: string;
  notes?: string;
  tags?: string[];
}

export interface CreateProjectInput {
  name: string;
  description?: string;
  color?: string;
  icon?: string;
}

export interface UpdateProjectInput extends Partial<CreateProjectInput> {
  is_archived?: boolean;
}