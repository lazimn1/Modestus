"use client";

import ContentEditorShell, {
  FieldLabel,
  FieldInput,
  FieldTextarea,
} from "@/components/admin/ContentEditorShell";
import { Trash2, Plus } from "lucide-react";
import ImageUploadWebP from "@/components/admin/ImageUploadWebP";

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

          <div className="space-y-4 mt-6">
            {data.items.map((item: any, i: number) => (
              <div
                key={i}
                className="p-5 bg-stone-50 rounded-xl border border-stone-200 space-y-4 shadow-xs"
              >
                <div className="flex items-center justify-between">
                  <p className="text-xs font-bold text-stone-700 uppercase tracking-wider">
                    Collection Card #{i + 1}
                  </p>
                  <button
                    onClick={() => {
                      const next = data.items.filter((_: any, j: number) => j !== i);
                      setData({ ...data, items: next });
                    }}
                    className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                    <FieldLabel>Label / Subtitle</FieldLabel>
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
                  <FieldLabel>Collection Photo</FieldLabel>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
                    {item.image && (
                      <div className="h-28 w-full relative rounded-xl overflow-hidden border border-stone-300 shadow-xs bg-white">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={item.image} alt="Collection" className="w-full h-full object-cover" />
                      </div>
                    )}
                    <div className={item.image ? "sm:col-span-2" : "sm:col-span-3"}>
                      <ImageUploadWebP
                        onUpload={(url) => {
                          const next = [...data.items];
                          next[i] = { ...next[i], image: url };
                          setData({ ...data, items: next });
                        }}
                        label="Upload Collection Photo (Auto-converts to WebP)"
                        buttonText="Select Card Image"
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
            <button
              onClick={() =>
                setData({
                  ...data,
                  items: [...data.items, { name: "New Collection", label: "Explore", image: "" }],
                })
              }
              className="flex items-center gap-2 text-sm text-stone-900 bg-white border border-stone-300 px-4 py-2.5 rounded-xl font-semibold hover:bg-stone-50 transition-all shadow-xs"
            >
              <Plus className="w-4 h-4" /> Add Collection Card
            </button>
          </div>
        </>
      )}
    </ContentEditorShell>
  );
}
