/**
 * User domain types
 * Re-exports and aliases for user-related database types
 */

import type { Database } from '@/integrations/supabase/types';

// Extract table types helper
type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row'];
type TablesInsert<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert'];
type TablesUpdate<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update'];

// User types
export type User = Tables<'users'>;
export type UserInsert = TablesInsert<'users'>;
export type UserUpdate = TablesUpdate<'users'>;

// Profile types
export type Profile = Tables<'profiles'>;
export type ProfileInsert = TablesInsert<'profiles'>;
export type ProfileUpdate = TablesUpdate<'profiles'>;

// Document types
export type ParsedDocument = Tables<'parsed_documents'>;
export type ParsedDocumentInsert = TablesInsert<'parsed_documents'>;
export type ParsedDocumentUpdate = TablesUpdate<'parsed_documents'>;

// Lead types
export type Lead = Tables<'leads'>;
export type LeadInsert = TablesInsert<'leads'>;
export type LeadUpdate = TablesUpdate<'leads'>;

export type LeadActivity = Tables<'lead_activities'>;
export type LeadActivityInsert = TablesInsert<'lead_activities'>;
export type LeadActivityUpdate = TablesUpdate<'lead_activities'>;

// Enum types
export type UserRole = 'admin' | 'recruiter' | 'hiring_manager' | 'candidate';
export type DocumentType = 'resume' | 'cover_letter' | 'portfolio' | 'other';