"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export interface ShopifyCustomer {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  defaultAddress?: {
    id: string;
    address1: string;
    address2?: string;
    city: string;
    province?: string;
    country: string;
    zip: string;
    phone?: string;
  };
  addresses?: {
    edges: {
      node: {
        id: string;
        address1: string;
        address2?: string;
        city: string;
        province?: string;
        country: string;
        zip: string;
        phone?: string;
      };
    }[];
  };
  orders?: {
    edges: {
      node: {
        id: string;
        name: string;
        processedAt: string;
        fulfillmentStatus: string;
        financialStatus: string;
        currentTotalPrice: { amount: string; currencyCode: string };
        lineItems: {
          edges: {
            node: {
              title: string;
              quantity: number;
              variant?: {
                image?: { url: string; altText?: string };
                price: { amount: string; currencyCode: string };
              };
            };
          }[];
        };
      };
    }[];
  };
}

interface AuthContextType {
  customer: ShopifyCustomer | null;
  isLoading: boolean;
  setCustomer: (c: ShopifyCustomer | null) => void;
  refreshCustomer: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({
  children,
  initialCustomer,
}: {
  children: ReactNode;
  initialCustomer: ShopifyCustomer | null;
}) {
  const [customer, setCustomer] = useState<ShopifyCustomer | null>(initialCustomer);
  const [isLoading, setIsLoading] = useState(false);

  const refreshCustomer = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/me");
      if (res.ok) {
        const data = await res.json();
        setCustomer(data.customer);
      } else {
        setCustomer(null);
      }
    } catch {
      setCustomer(null);
    } finally {
      setIsLoading(false);
    }
  };

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
