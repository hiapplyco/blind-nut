/**
 * Interview domain types
 * Re-exports and aliases for interview-related database types
 */

import type { Database } from '@/integrations/supabase/types';

// Extract table types helper
type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row'];
type TablesInsert<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert'];
type TablesUpdate<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update'];

// Interview session types
export type InterviewSession = Tables<'interview_sessions'>;
export type InterviewSessionInsert = TablesInsert<'interview_sessions'>;
export type InterviewSessionUpdate = TablesUpdate<'interview_sessions'>;

// Interview message types
export type InterviewMessage = Tables<'interview_messages'>;
export type InterviewMessageInsert = TablesInsert<'interview_messages'>;
export type InterviewMessageUpdate = TablesUpdate<'interview_messages'>;

// Interview framework types
export type InterviewFramework = Tables<'interview_frameworks'>;
export type InterviewFrameworkInsert = TablesInsert<'interview_frameworks'>;
export type InterviewFrameworkUpdate = TablesUpdate<'interview_frameworks'>;

// Interview plan types
export type InterviewPlan = Tables<'interview_plans'>;
export type InterviewPlanInsert = TablesInsert<'interview_plans'>;
export type InterviewPlanUpdate = TablesUpdate<'interview_plans'>;

// Enum types
export type InterviewStatus = 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
export type InterviewType = 'screening' | 'technical' | 'behavioral' | 'final';