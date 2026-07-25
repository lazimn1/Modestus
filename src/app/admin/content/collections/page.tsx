"use client";

import ContentEditorShell, {
  FieldLabel,
  FieldInput,
  FieldTextarea,
  ImagePreview,
} from "@/components/admin/ContentEditorShell";
import { Trash2, Plus } from "lucide-react";

export default function CollectionsEditor() {
  return (
    <ContentEditorShell
      contentKey="collections"
      title="Collections"
      description="Edit the collection cards shown on the homepage."
    >
      {({ data, setData }) => (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <FieldLabel>Section Heading</FieldLabel>
              <FieldInput
                value={data.heading}
                onChange={(v) => setData({ ...data, heading: v })}
              />
            </div>
            <div>
              <FieldLabel>Subtext</FieldLabel>
              <FieldTextarea
                value={data.subtext}
                onChange={(v) => setData({ ...data, subtext: v })}
                rows={2}
              />
            </div>
          </div>

          <div className="space-y-4 mt-4">
            {data.items.map((item: any, i: number) => (
              <div
                key={i}
                className="p-4 bg-gray-50 rounded-xl border border-gray-100 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                    Card {i + 1}
                  </p>
                  <button
                    onClick={() => {
                      const next = data.items.filter((_: any, j: number) => j !== i);
                      setData({ ...data, items: next });
                    }}
                    className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <FieldLabel>Name</FieldLabel>
                    <FieldInput
                      value={item.name}
                      onChange={(v) => {
                        const next = [...data.items];
                        next[i] = { ...next[i], name: v };
                        setData({ ...data, items: next });
                      }}
                    />
                  </div>
                  <div>
                    <FieldLabel>Label</FieldLabel>
                    <FieldInput
                      value={item.label}
                      onChange={(v) => {
                        const next = [...data.items];
                        next[i] = { ...next[i], label: v };
                        setData({ ...data, items: next });
                      }}
                    />
                  </div>
                </div>
                <div>
                  <FieldLabel>Image URL</FieldLabel>
                  <FieldInput
                    value={item.image}
                    onChange={(v) => {
                      const next = [...data.items];
                      next[i] = { ...next[i], image: v };
                      setData({ ...data, items: next });
                    }}
                  />
                  <ImagePreview src={item.image} />
                </div>
              </div>
            ))}
            <button
              onClick={() =>
                setData({
                  ...data,
                  items: [...data.items, { name: "", label: "", image: "" }],
                })
              }
              className="flex items-center gap-2 text-sm text-indigo-600 font-medium hover:text-indigo-800 transition-colors"
            >
              <Plus className="w-4 h-4" /> Add Collection Card
            </button>
          </div>
        </>
      )}
    </ContentEditorShell>
  );
}
