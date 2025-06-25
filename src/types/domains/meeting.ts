/**
 * Meeting domain types
 * Re-exports and aliases for meeting/video-related database types
 */

import type { Database } from '@/integrations/supabase/types';

// Extract table types helper
type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row'];
type TablesInsert<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert'];
type TablesUpdate<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update'];

// Meeting types
export type Meeting = Tables<'meetings'>;
export type MeetingInsert = TablesInsert<'meetings'>;
export type MeetingUpdate = TablesUpdate<'meetings'>;

// Transcription types
export type DailyTranscription = Tables<'daily_transcriptions'>;
export type DailyTranscriptionInsert = TablesInsert<'daily_transcriptions'>;
export type DailyTranscriptionUpdate = TablesUpdate<'daily_transcriptions'>;

// Meeting analysis types
export type MeetingAnalysis = Tables<'meeting_analyses'>;
export type MeetingAnalysisInsert = TablesInsert<'meeting_analyses'>;
export type MeetingAnalysisUpdate = TablesUpdate<'meeting_analyses'>;

// Video analysis types
export type UserVideoAnalysis = Tables<'user_video_analyses'>;
export type UserVideoAnalysisInsert = TablesInsert<'user_video_analyses'>;
export type UserVideoAnalysisUpdate = TablesUpdate<'user_video_analyses'>;

// Kickoff types
export type KickoffCall = Tables<'kickoff_calls'>;
export type KickoffCallInsert = TablesInsert<'kickoff_calls'>;
export type KickoffCallUpdate = TablesUpdate<'kickoff_calls'>;

export type KickoffSummary = Tables<'kickoff_summaries'>;
export type KickoffSummaryInsert = TablesInsert<'kickoff_summaries'>;
export type KickoffSummaryUpdate = TablesUpdate<'kickoff_summaries'>;

// Enum types
export type MeetingStatus = 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
export type MeetingType = 'interview' | 'kickoff' | 'review' | 'general';