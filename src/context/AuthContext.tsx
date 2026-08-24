"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export interface Customer {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
}

interface AuthContextType {
  customer: Customer | null;
  isLoading: boolean;
  setCustomer: (c: Customer | null) => void;
  refreshCustomer: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({
  children,
  initialCustomer,
}: {
  children: ReactNode;
  initialCustomer: Customer | null;
}) {
  const [customer, setCustomer] = useState<Customer | null>(initialCustomer);
  const [isLoading, setIsLoading] = useState(false);

  const refreshCustomer = async () => {
    setIsLoading(true);
    try {
      const supabase = createSupabaseBrowserClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        const meta = user.user_metadata ?? {};
        setCustomer({
          id: user.id,
          email: user.email ?? "",
          firstName: meta.firstName ?? meta.first_name ?? "",
          lastName: meta.lastName ?? meta.last_name ?? "",
          phone: meta.phone ?? "",
        });
      } else {
        setCustomer(null);
      }
    } catch {
      setCustomer(null);
    } finally {
      setIsLoading(false);
    }
  };

  // Listen to Supabase auth state changes (login/logout from any tab)
  useEffect(() => {
    const supabase = createSupabaseBrowserClient();
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (session?.user) {
          const meta = session.user.user_metadata ?? {};
          setCustomer({
            id: session.user.id,
            email: session.user.email ?? "",
            firstName: meta.firstName ?? meta.first_name ?? "",
            lastName: meta.lastName ?? meta.last_name ?? "",
            phone: meta.phone ?? "",
          });
        } else {
          setCustomer(null);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ customer, isLoading, setCustomer, refreshCustomer }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}
