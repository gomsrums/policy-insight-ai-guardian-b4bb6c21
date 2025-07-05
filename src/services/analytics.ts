
import { supabase } from "@/integrations/supabase/client";
import { nanoid } from "nanoid";

interface AnalyticsEvent {
  event_name: string;
  event_data?: Record<string, any>;
  page_url?: string;
  referrer?: string;
}

interface SessionData {
  device_type?: string;
  browser?: string;
  os?: string;
}

class AnalyticsService {
  private sessionId: string;
  private userId: string | null = null;

  constructor() {
    this.sessionId = nanoid();
    this.initializeSession();
  }

  private async initializeSession() {
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    this.userId = user?.id || null;

    // Listen for auth changes
    supabase.auth.onAuthStateChange((event, session) => {
      this.userId = session?.user?.id || null;
      
      if (event === 'SIGNED_IN') {
        this.trackEvent('user_signed_in');
        this.startSession();
      } else if (event === 'SIGNED_OUT') {
        this.trackEvent('user_signed_out');
        this.endSession();
      }
    });

    // Start session tracking
    if (this.userId) {
      this.startSession();
    }

    // Track page visibility changes
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') {
        this.updateLastActivity();
      }
    });

    // Track page unload
    window.addEventListener('beforeunload', () => {
      this.updateLastActivity();
    });
  }

  private getDeviceInfo(): SessionData {
    const userAgent = navigator.userAgent;
    
    const getDeviceType = () => {
      if (/tablet|ipad/i.test(userAgent)) return 'tablet';
      if (/mobile|phone|android|iphone/i.test(userAgent)) return 'mobile';
      return 'desktop';
    };

    const getBrowser = () => {
      if (userAgent.includes('Chrome')) return 'Chrome';
      if (userAgent.includes('Firefox')) return 'Firefox';
      if (userAgent.includes('Safari')) return 'Safari';
      if (userAgent.includes('Edge')) return 'Edge';
      return 'Unknown';
    };

    const getOS = () => {
      if (userAgent.includes('Windows')) return 'Windows';
      if (userAgent.includes('Mac')) return 'macOS';
      if (userAgent.includes('Linux')) return 'Linux';
      if (userAgent.includes('Android')) return 'Android';
      if (userAgent.includes('iOS')) return 'iOS';
      return 'Unknown';
    };

    return {
      device_type: getDeviceType(),
      browser: getBrowser(),
      os: getOS()
    };
  }

  async trackEvent(eventName: string, data?: Record<string, any>) {
    try {
      const eventData: AnalyticsEvent = {
        event_name: eventName,
        event_data: data,
        page_url: window.location.href,
        referrer: document.referrer || undefined
      };

      await supabase.from('analytics_events').insert({
        user_id: this.userId,
        session_id: this.sessionId,
        event_name: eventData.event_name,
        event_data: eventData.event_data,
        page_url: eventData.page_url,
        referrer: eventData.referrer,
        user_agent: navigator.userAgent,
        ip_address: null // This would be set server-side in a real implementation
      });

      console.log('Analytics event tracked:', eventName, data);
    } catch (error) {
      console.error('Failed to track analytics event:', error);
    }
  }

  private async startSession() {
    if (!this.userId) return;

    try {
      const deviceInfo = this.getDeviceInfo();
      
      await supabase.from('user_sessions').insert({
        user_id: this.userId,
        session_id: this.sessionId,
        ...deviceInfo
      });

      console.log('Session started:', this.sessionId);
    } catch (error) {
      console.error('Failed to start session:', error);
    }
  }

  private async endSession() {
    if (!this.userId) return;

    try {
      await supabase
        .from('user_sessions')
        .update({ ended_at: new Date().toISOString() })
        .eq('session_id', this.sessionId);

      console.log('Session ended:', this.sessionId);
    } catch (error) {
      console.error('Failed to end session:', error);
    }
  }

  private async updateLastActivity() {
    if (!this.userId) return;

    try {
      await supabase
        .from('user_sessions')
        .update({ last_activity: new Date().toISOString() })
        .eq('session_id', this.sessionId);
    } catch (error) {
      console.error('Failed to update last activity:', error);
    }
  }

  // Public methods for tracking specific events
  trackPageView(page: string) {
    this.trackEvent('page_view', { page });
  }

  trackDocumentUpload(documentType: string) {
    this.trackEvent('document_upload', { document_type: documentType });
  }

  trackAnalysisRequest(analysisType: string) {
    this.trackEvent('analysis_request', { analysis_type: analysisType });
  }

  trackChatMessage(messageLength: number) {
    this.trackEvent('chat_message', { message_length: messageLength });
  }

  trackFeatureUsage(feature: string, details?: Record<string, any>) {
    this.trackEvent('feature_usage', { feature, ...details });
  }
}

// Create singleton instance
export const analytics = new AnalyticsService();
