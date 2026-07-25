"use client";

import ContentEditorShell, {
  FieldLabel,
  FieldInput,
} from "@/components/admin/ContentEditorShell";

export default function FeaturesEditor() {
  return (
    <ContentEditorShell
      contentKey="features_banner"
      title="Features Banner"
      description="Edit the 4 feature badges shown below the hero (delivery, returns, quality, payment)."
    >
      {({ data, setData }) => (
        <div className="space-y-6">
          {data.items.map((item: any, i: number) => (
            <div key={i} className="p-4 bg-gray-50 rounded-xl border border-gray-100 space-y-3">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                Feature {i + 1}
              </p>
              <div>
                <FieldLabel>Title</FieldLabel>
                <FieldInput
                  value={item.title}
                  onChange={(v) => {
                    const next = [...data.items];
                    next[i] = { ...next[i], title: v };
                    setData({ ...data, items: next });
                  }}
                />
              </div>
              <div>
                <FieldLabel>Description</FieldLabel>
                <FieldInput
                  value={item.desc}
                  onChange={(v) => {
                    const next = [...data.items];
                    next[i] = { ...next[i], desc: v };
                    setData({ ...data, items: next });
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </ContentEditorShell>
  );
}
