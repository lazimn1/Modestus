"use client";

import { useState, useEffect } from "react";
import { DEFAULTS } from "@/lib/siteContent";

export function useSiteContent<T = any>(key: string): T {
  const [content] = useState<T>(DEFAULTS[key] as T);

  useEffect(() => {
    // Supabase removed — always use local defaults
  }, [key]);

  return content;
}
