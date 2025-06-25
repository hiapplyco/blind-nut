/**
 * Chat domain types
 * Re-exports and aliases for chat-related database types
 */

import type { Database } from '@/integrations/supabase/types';

// Extract table types helper
type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row'];
type TablesInsert<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert'];
type TablesUpdate<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update'];

// Chat session types
export type ChatSession = Tables<'chat_sessions'>;
export type ChatSessionInsert = TablesInsert<'chat_sessions'>;
export type ChatSessionUpdate = TablesUpdate<'chat_sessions'>;

// Chat message types
export type ChatMessage = Tables<'chat_messages'>;
export type ChatMessageInsert = TablesInsert<'chat_messages'>;
export type ChatMessageUpdate = TablesUpdate<'chat_messages'>;

// Message types
export type Message = Tables<'messages'>;
export type MessageInsert = TablesInsert<'messages'>;
export type MessageUpdate = TablesUpdate<'messages'>;

// Enum types
export type MessageRole = 'user' | 'assistant' | 'system';
export type ChatSessionStatus = 'active' | 'archived' | 'deleted';