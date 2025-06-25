/**
 * Recruitment domain types
 * Re-exports and aliases for recruitment-related database types
 */

import type { Database } from '@/integrations/supabase/types';

// Extract table types helper
type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row'];
type TablesInsert<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert'];
type TablesUpdate<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update'];

// Job-related types
export type Job = Tables<'jobs'>;
export type JobInsert = TablesInsert<'jobs'>;
export type JobUpdate = TablesUpdate<'jobs'>;

// Application types
export type Application = Tables<'applications'>;
export type ApplicationInsert = TablesInsert<'applications'>;
export type ApplicationUpdate = TablesUpdate<'applications'>;

// Client types
export type Client = Tables<'clients'>;
export type ClientInsert = TablesInsert<'clients'>;
export type ClientUpdate = TablesUpdate<'clients'>;

// Agent output types
export type AgentOutput = Tables<'agent_outputs'>;
export type AgentOutputInsert = TablesInsert<'agent_outputs'>;
export type AgentOutputUpdate = TablesUpdate<'agent_outputs'>;

// Resume matching types
export type ResumeMatch = Tables<'resume_matches'>;
export type ResumeMatchInsert = TablesInsert<'resume_matches'>;
export type ResumeMatchUpdate = TablesUpdate<'resume_matches'>;

// Search types
export type SearchResult = Tables<'search_results'>;
export type SearchResultInsert = TablesInsert<'search_results'>;
export type SearchResultUpdate = TablesUpdate<'search_results'>;

export type SourcingSearch = Tables<'sourcing_searches'>;
export type SourcingSearchInsert = TablesInsert<'sourcing_searches'>;
export type SourcingSearchUpdate = TablesUpdate<'sourcing_searches'>;

// Enum types
export type JobStatus = 'draft' | 'published' | 'archived';
export type ApplicationStatus = 'new' | 'screening' | 'interview' | 'offer' | 'rejected' | 'withdrawn';