"use client";

import ContentEditorShell, {
  FieldLabel,
  FieldInput,
  FieldTextarea,
} from "@/components/admin/ContentEditorShell";
import { Trash2, Plus } from "lucide-react";

export default function AboutEditor() {
  return (
    <ContentEditorShell
      contentKey="about_page"
      title="Mission & About Page"
      description="Edit the About Us page — hero heading, pillars, and call-to-action."
    >
      {({ data, setData }) => (
        <>
          {/* Hero Heading */}
          <div>
            <FieldLabel>Hero Heading (use \n for line break)</FieldLabel>
            <FieldTextarea
              value={data.hero_heading}
              onChange={(v) => setData({ ...data, hero_heading: v })}
              rows={2}
            />
          </div>

          {/* Mission text (also used on homepage) */}
          <ContentEditorShell
            contentKey="mission"
            title=""
            description=""
          >
            {() => null}
          </ContentEditorShell>

          {/* Pillars */}
          <div>
            <FieldLabel>Pillars</FieldLabel>
            <div className="space-y-4">
              {data.pillars.map((pillar: any, i: number) => (
                <div key={i} className="p-4 bg-gray-50 rounded-xl border border-gray-100 space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                      Pillar {i + 1}
                    </p>
                    <button
                      onClick={() => {
                        const next = data.pillars.filter((_: any, j: number) => j !== i);
                        setData({ ...data, pillars: next });
                      }}
                      className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <FieldLabel>Number</FieldLabel>
                      <FieldInput
                        value={pillar.number}
                        onChange={(v) => {
                          const next = [...data.pillars];
                          next[i] = { ...next[i], number: v };
                          setData({ ...data, pillars: next });
                        }}
                      />
                    </div>
                    <div>
                      <FieldLabel>Title</FieldLabel>
                      <FieldInput
                        value={pillar.title}
                        onChange={(v) => {
                          const next = [...data.pillars];
                          next[i] = { ...next[i], title: v };
                          setData({ ...data, pillars: next });
                        }}
                      />
                    </div>
                  </div>
                  <div>
                    <FieldLabel>Body</FieldLabel>
                    <FieldTextarea
                      value={pillar.body}
                      onChange={(v) => {
                        const next = [...data.pillars];
                        next[i] = { ...next[i], body: v };
                        setData({ ...data, pillars: next });
                      }}
                      rows={2}
                    />
                  </div>
                </div>
              ))}
              <button
                onClick={() =>
                  setData({
                    ...data,
                    pillars: [...data.pillars, { number: "", title: "", body: "" }],
                  })
                }
                className="flex items-center gap-2 text-sm text-indigo-600 font-medium hover:text-indigo-800 transition-colors"
              >
                <Plus className="w-4 h-4" /> Add Pillar
              </button>
            </div>
          </div>

          {/* CTA */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <FieldLabel>CTA Heading</FieldLabel>
              <FieldInput
                value={data.cta_heading}
                onChange={(v) => setData({ ...data, cta_heading: v })}
              />
            </div>
            <div>
              <FieldLabel>CTA Button Text</FieldLabel>
              <FieldInput
                value={data.cta_text}
                onChange={(v) => setData({ ...data, cta_text: v })}
              />
            </div>
          </div>
        </>
      )}
    </ContentEditorShell>
  );
}
