
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface BrokerProfile {
  id: string;
  company_name: string;
  email: string;
}

interface BrokerAuthContextType {
  broker: BrokerProfile | null;
  signUp: (email: string, password: string, companyName: string) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  isAuthenticated: boolean;
  loading: boolean;
}

const BrokerAuthContext = createContext<BrokerAuthContextType | undefined>(undefined);

export const useBrokerAuth = () => {
  const context = useContext(BrokerAuthContext);
  if (context === undefined) {
    throw new Error('useBrokerAuth must be used within a BrokerAuthProvider');
  }
  return context;
};

interface BrokerAuthProviderProps {
  children: ReactNode;
}

export const BrokerAuthProvider = ({ children }: BrokerAuthProviderProps) => {
  const [broker, setBroker] = useState<BrokerProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkBrokerSession();
  }, []);

  const checkBrokerSession = async () => {
    const brokerData = localStorage.getItem('broker');
    if (brokerData) {
      setBroker(JSON.parse(brokerData));
    }
    setLoading(false);
  };

  const signUp = async (email: string, password: string, companyName: string) => {
    try {
      // Hash password (in production, use proper bcrypt)
      const passwordHash = btoa(password); // Simple base64 encoding for demo
      
      const { data, error } = await supabase
        .from('broker_companies')
        .insert([
          {
            email,
            password_hash: passwordHash,
            company_name: companyName
          }
        ])
        .select()
        .single();

      if (error) {
        return { error };
      }

      const brokerProfile = {
        id: data.id,
        company_name: data.company_name,
        email: data.email
      };

      setBroker(brokerProfile);
      localStorage.setItem('broker', JSON.stringify(brokerProfile));
      
      return { error: null };
    } catch (error) {
      return { error };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const passwordHash = btoa(password);
      
      const { data, error } = await supabase
        .from('broker_companies')
        .select('*')
        .eq('email', email)
        .eq('password_hash', passwordHash)
        .single();

      if (error || !data) {
        return { error: { message: 'Invalid email or password' } };
      }

      const brokerProfile = {
        id: data.id,
        company_name: data.company_name,
        email: data.email
      };

      setBroker(brokerProfile);
      localStorage.setItem('broker', JSON.stringify(brokerProfile));
      
      return { error: null };
    } catch (error) {
      return { error };
    }
  };

  const signOut = async () => {
    setBroker(null);
    localStorage.removeItem('broker');
  };

  const value = {
    broker,
    signUp,
    signIn,
    signOut,
    isAuthenticated: !!broker,
    loading,
  };

  return <BrokerAuthContext.Provider value={value}>{children}</BrokerAuthContext.Provider>;
};
