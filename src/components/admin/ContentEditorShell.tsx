"use client";

import { useState, useEffect, ReactNode } from "react";
import { createClient } from "@/utils/supabase/client";
import { DEFAULTS } from "@/lib/siteContent";
import { Save, RotateCcw, Check, AlertCircle } from "lucide-react";

interface ContentEditorShellProps {
  contentKey: string;
  title: string;
  description: string;
  children: (props: {
    data: any;
    setData: (d: any) => void;
  }) => ReactNode;
}

export default function ContentEditorShell({
  contentKey,
  title,
  description,
  children,
}: ContentEditorShellProps) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const supabase = createClient();

  useEffect(() => {
    const load = async () => {
      const { data: row } = await supabase
        .from("site_content")
        .select("value")
        .eq("key", contentKey)
        .single();
      setData(row?.value ?? DEFAULTS[contentKey]);
      setLoading(false);
    };
    load();
  }, [contentKey, supabase]);

  const handleSave = async () => {
    setSaving(true);
    setToast(null);
    const { error } = await supabase
      .from("site_content")
      .upsert({ key: contentKey, value: data, updated_at: new Date().toISOString() });
    setSaving(false);
    if (error) {
      setToast({ type: "error", message: "Failed to save: " + error.message });
    } else {
      setToast({ type: "success", message: "Changes saved successfully!" });
    }
    setTimeout(() => setToast(null), 3000);
  };

  const handleReset = async () => {
    setData(DEFAULTS[contentKey]);
    await supabase.from("site_content").delete().eq("key", contentKey);
    setToast({ type: "success", message: "Reset to defaults." });
    setTimeout(() => setToast(null), 3000);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-7 h-7 border-3 border-gray-200 border-t-indigo-600 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-[900px] space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-[22px] font-bold text-gray-900">{title}</h1>
          <p className="text-sm text-gray-500 mt-1">{description}</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleReset}
            className="flex items-center gap-2 px-3.5 py-2 rounded-lg text-[13px] font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-[13px] font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 transition-colors shadow-sm"
          >
            <Save className="w-3.5 h-3.5" />
            {saving ? "Saving…" : "Save Changes"}
          </button>
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div
          className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium ${
            toast.type === "success"
              ? "bg-green-50 text-green-700 border border-green-200"
              : "bg-red-50 text-red-700 border border-red-200"
          }`}
        >
          {toast.type === "success" ? (
            <Check className="w-4 h-4" />
          ) : (
            <AlertCircle className="w-4 h-4" />
          )}
          {toast.message}
        </div>
      )}

      {/* Editor Content */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm space-y-6">
        {children({ data, setData })}
      </div>
    </div>
  );
}

/* ─── Reusable Field Components ─── */

export function FieldLabel({ children }: { children: ReactNode }) {
  return (
    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
      {children}
    </label>
  );
}

export function FieldInput({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all"
    />
  );
}

export function FieldTextarea({
  value,
  onChange,
  placeholder,
  rows = 3,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  rows?: number;
}) {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={rows}
      className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all resize-none"
    />
  );
}

export function ImagePreview({ src }: { src: string }) {
  if (!src) return null;
  return (
    <div className="mt-2 w-20 h-20 rounded-lg bg-gray-100 border border-gray-200 overflow-hidden relative">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt="Preview" className="w-full h-full object-cover" />
    </div>
  );
}
