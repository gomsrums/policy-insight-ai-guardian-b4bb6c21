import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';

interface TrialUsage {
  documentUpload: number;
  quickAnalysis: number;
  chatMessages: number;
  lastUsed: string;
}

const TRIAL_LIMITS = {
  documentUpload: 1,
  quickAnalysis: 1,
  chatMessages: 1,
} as const;

type FeatureType = keyof typeof TRIAL_LIMITS;

export const useTrialAccess = () => {
  const { isAuthenticated } = useAuth();
  const [usage, setUsage] = useState<TrialUsage>({
    documentUpload: 0,
    quickAnalysis: 0,
    chatMessages: 0,
    lastUsed: new Date().toISOString(),
  });

  // Load usage from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('trial_usage');
    if (stored) {
      try {
        const parsedUsage = JSON.parse(stored);
        // Reset usage if more than 24 hours old
        const lastUsed = new Date(parsedUsage.lastUsed);
        const now = new Date();
        const hoursSinceLastUsed = (now.getTime() - lastUsed.getTime()) / (1000 * 60 * 60);
        
        if (hoursSinceLastUsed > 24) {
          // Reset usage after 24 hours
          const resetUsage = {
            documentUpload: 0,
            quickAnalysis: 0,
            chatMessages: 0,
            lastUsed: now.toISOString(),
          };
          setUsage(resetUsage);
          localStorage.setItem('trial_usage', JSON.stringify(resetUsage));
        } else {
          setUsage(parsedUsage);
        }
      } catch {
        // If parsing fails, reset to default
        const defaultUsage = {
          documentUpload: 0,
          quickAnalysis: 0,
          chatMessages: 0,
          lastUsed: new Date().toISOString(),
        };
        setUsage(defaultUsage);
        localStorage.setItem('trial_usage', JSON.stringify(defaultUsage));
      }
    }
  }, []);

  // Save usage to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('trial_usage', JSON.stringify(usage));
  }, [usage]);

  const canUseFeature = (feature: FeatureType): boolean => {
    if (isAuthenticated) return true;
    return usage[feature] < TRIAL_LIMITS[feature];
  };

  const getRemainingUses = (feature: FeatureType): number => {
    if (isAuthenticated) return Infinity;
    return Math.max(0, TRIAL_LIMITS[feature] - usage[feature]);
  };

  const useFeature = (feature: FeatureType): boolean => {
    if (isAuthenticated) return true;
    
    if (canUseFeature(feature)) {
      setUsage(prev => ({
        ...prev,
        [feature]: prev[feature] + 1,
        lastUsed: new Date().toISOString(),
      }));
      return true;
    }
    return false;
  };

  const resetUsage = () => {
    const resetUsage = {
      documentUpload: 0,
      quickAnalysis: 0,
      chatMessages: 0,
      lastUsed: new Date().toISOString(),
    };
    setUsage(resetUsage);
    localStorage.setItem('trial_usage', JSON.stringify(resetUsage));
  };

  return {
    canUseFeature,
    getRemainingUses,
    useFeature,
    resetUsage,
    usage,
    isAuthenticated,
  };
};