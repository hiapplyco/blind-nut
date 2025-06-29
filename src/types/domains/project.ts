// Temporary type definitions for projects functionality
// TODO: Remove this file after regenerating Supabase types

export type ProjectsTable = {
  Row: {
    id: string;
    user_id: string;
    name: string;
    description: string | null;
    color: string;
    icon: string;
    created_at: string;
    updated_at: string;
    candidates_count: number;
    is_archived: boolean;
    metadata: Record<string, any>;
  };
  Insert: {
    id?: string;
    user_id: string;
    name: string;
    description?: string | null;
    color?: string;
    icon?: string;
    created_at?: string;
    updated_at?: string;
    candidates_count?: number;
    is_archived?: boolean;
    metadata?: Record<string, any>;
  };
  Update: {
    id?: string;
    user_id?: string;
    name?: string;
    description?: string | null;
    color?: string;
    icon?: string;
    created_at?: string;
    updated_at?: string;
    candidates_count?: number;
    is_archived?: boolean;
    metadata?: Record<string, any>;
  };
};

export type SearchHistoryTable = {
  Row: {
    id: string;
    user_id: string;
    search_query: string;
    boolean_query: string | null;
    platform: string;
    results_count: number;
    search_params: Record<string, any>;
    created_at: string;
    is_favorite: boolean;
    tags: string[];
    project_id: string | null;
  };
  Insert: {
    id?: string;
    user_id: string;
    search_query: string;
    boolean_query?: string | null;
    platform?: string;
    results_count?: number;
    search_params?: Record<string, any>;
    created_at?: string;
    is_favorite?: boolean;
    tags?: string[];
    project_id?: string | null;
  };
  Update: {
    id?: string;
    user_id?: string;
    search_query?: string;
    boolean_query?: string | null;
    platform?: string;
    results_count?: number;
    search_params?: Record<string, any>;
    created_at?: string;
    is_favorite?: boolean;
    tags?: string[];
    project_id?: string | null;
  };
};

export type ProjectCandidatesTable = {
  Row: {
    id: string;
    project_id: string;
    candidate_id: string;
    added_at: string;
    added_by: string;
    notes: string | null;
    tags: string[];
  };
  Insert: {
    id?: string;
    project_id: string;
    candidate_id: string;
    added_at?: string;
    added_by: string;
    notes?: string | null;
    tags?: string[];
  };
  Update: {
    id?: string;
    project_id?: string;
    candidate_id?: string;
    added_at?: string;
    added_by?: string;
    notes?: string | null;
    tags?: string[];
  };
};