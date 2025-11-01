import { createContext, use, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Session, User } from '@supabase/supabase-js';

type AuthContextType = {
    user: User | null;
    isAuthenticated: boolean;
}

export const AuthContext = createContext<AuthContextType>({
    user: null,
    isAuthenticated: false,
});

export default function AuthProvider({ children }: { children: React.ReactNode;

 }) {
    const [session, setSession] = useState<Session | null>(null);
  //  const [isAuthenticated, setIsAuthenticated] = useState(false);

      useEffect(() => {
        const signInIfNeeded = async () => {
               const { data } = await supabase.auth.getSession();
               if (data.session) {
                   setSession(data.session);
               }
        
               if (!data.session) {
                    const { data } = await supabase.auth.signInAnonymously();
                    if (data.session) {
                        setSession(data.session);
                    }
               }
            }
            signInIfNeeded();
      }, []);

      const user = session?.user || null;
      const isAuthenticated = !!session;

      return (
          <AuthContext.Provider value={{ user: session?.user || null, isAuthenticated: !!session }}>
              {children}
          </AuthContext.Provider>
      );
}

export const useAuth = () => {
    return useContext(AuthContext);
}