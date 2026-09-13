"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";

export default function LocalTime({ 
  dateStr, 
  formatStr = "MMM d, yyyy • h:mm a" 
}: { 
  dateStr: string; 
  formatStr?: string;
}) {
  const [formatted, setFormatted] = useState<string>("");

  useEffect(() => {
    try {
      setFormatted(format(new Date(dateStr), formatStr));
    } catch (e) {
      setFormatted("Invalid Date");
    }
  }, [dateStr, formatStr]);

  if (!formatted) {
    // Show a skeleton or hidden placeholder until hydration is done to avoid mismatch warnings
    return <span className="opacity-0">Loading...</span>;
  }

  return <span>{formatted}</span>;
}
