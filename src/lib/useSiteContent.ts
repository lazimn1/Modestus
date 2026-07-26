"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { DEFAULTS } from "@/lib/siteContent";

export function useSiteContent<T = any>(key: string): T {
  const [content, setContent] = useState<T>(DEFAULTS[key] as T);

  useEffect(() => {
    let mounted = true;
    const fetchContent = async () => {
      try {
        const supabase = createClient();
        const { data } = await supabase
          .from("site_content")
          .select("value")
          .eq("key", key)
          .maybeSingle();
        if (mounted && data?.value) {
          setContent(data.value as T);
        }
      } catch {
        // use default fallback
      }
    };
    fetchContent();
    return () => {
      mounted = false;
    };
  }, [key]);

  return content;
}
