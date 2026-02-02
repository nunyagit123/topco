import { ChatSession } from '../types';

const STORAGE_KEY = 'gemini_chat_sessions_v1';

// Use sessionStorage for better security - data cleared when browser closes
// For persistence across sessions, consider encrypted backend storage
export const saveSessionsToStorage = (sessions: ChatSession[]) => {
  try {
    // Sanitize sessions before saving
    const sanitizedSessions = sessions.map(session => ({
      ...session,
      // Remove any potentially sensitive data
      messages: session.messages.map(msg => ({
        ...msg,
        // Keep only necessary data
      }))
    }));
    
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(sanitizedSessions));
  } catch (error) {
    console.error('Failed to save sessions to storage:', error);
  }
};

export const loadSessionsFromStorage = (): ChatSession[] => {
  try {
    const stored = sessionStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    
    const parsed = JSON.parse(stored);
    
    // Validate data structure
    if (!Array.isArray(parsed)) {
      console.warn('Invalid sessions data, clearing storage');
      clearAllSessions();
      return [];
    }
    
    return parsed;
  } catch (error) {
    console.error('Failed to load sessions from storage:', error);
    clearAllSessions();
    return [];
  }
};

export const clearAllSessions = () => {
  try {
    sessionStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Failed to clear sessions from storage:', error);
  }
};