
import { ChatMessage } from "@/lib/chatpdf-types";

interface ChatSession {
  messages: ChatMessage[];
  lastActivity: number;
  documentId: string;
}

class TemporaryChatStorage {
  private sessions: Map<string, ChatSession> = new Map();
  private readonly SESSION_TIMEOUT = 10 * 60 * 1000; // 10 minutes

  private generateSessionKey(userId: string | undefined, documentId: string): string {
    return `${userId || 'anonymous'}_${documentId}`;
  }

  private cleanExpiredSessions(): void {
    const now = Date.now();
    for (const [key, session] of this.sessions.entries()) {
      if (now - session.lastActivity > this.SESSION_TIMEOUT) {
        this.sessions.delete(key);
      }
    }
  }

  saveMessage(userId: string | undefined, documentId: string, message: ChatMessage): void {
    this.cleanExpiredSessions();
    
    const sessionKey = this.generateSessionKey(userId, documentId);
    const existingSession = this.sessions.get(sessionKey);
    
    if (existingSession) {
      existingSession.messages.push(message);
      existingSession.lastActivity = Date.now();
    } else {
      this.sessions.set(sessionKey, {
        messages: [message],
        lastActivity: Date.now(),
        documentId
      });
    }
  }

  getChatHistory(userId: string | undefined, documentId: string): ChatMessage[] {
    this.cleanExpiredSessions();
    
    const sessionKey = this.generateSessionKey(userId, documentId);
    const session = this.sessions.get(sessionKey);
    
    if (session) {
      session.lastActivity = Date.now(); // Update activity when accessing
      return [...session.messages]; // Return a copy
    }
    
    return [];
  }

  clearSession(userId: string | undefined, documentId: string): void {
    const sessionKey = this.generateSessionKey(userId, documentId);
    this.sessions.delete(sessionKey);
  }

  // Method to clear all expired sessions manually
  clearExpiredSessions(): void {
    this.cleanExpiredSessions();
  }
}

// Create a singleton instance
export const temporaryChatStorage = new TemporaryChatStorage();

// Set up periodic cleanup every 2 minutes
setInterval(() => {
  temporaryChatStorage.clearExpiredSessions();
}, 2 * 60 * 1000);
