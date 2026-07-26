"use client";

import { createContext, useContext, useState, useEffect, useMemo, ReactNode } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import { isAdminEmail } from "@/lib/admin";

interface User {
  email: string;
  id: string;
  name?: string;
}

interface AuthContextType {
  user: User | null;
  isAdmin: boolean;
  isLoading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
  initialUser: User | null;
  initialIsAdmin: boolean;
}

export function AuthProvider({ children, initialUser, initialIsAdmin }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(initialUser);
  const [isAdmin, setIsAdmin] = useState<boolean>(initialIsAdmin);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        setUser({
          email: session.user.email ?? "",
          id: session.user.id,
          name: session.user.user_metadata?.full_name || session.user.user_metadata?.name || "",
        });
        
        setIsAdmin(isAdminEmail(session.user.email));
      } else {
        setUser(null);
        setIsAdmin(false);
      }
    });

    return () => subscription.unsubscribe();
  }, [supabase]);

  const signOut = async () => {
    setIsLoading(true);
    // Call the server to clear server cookies
    await fetch("/api/auth/signout", { method: "POST" });
    // Also clear local client session
    await supabase.auth.signOut();
    
    setUser(null);
    setIsAdmin(false);
    setIsLoading(false);
    
    // Redirect to home and refresh server layout
    router.push("/");
    router.refresh();
  };

  return (
    <AuthContext.Provider value={{ user, isAdmin, isLoading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

export function useOptionalAuth() {
  return useContext(AuthContext);
}
