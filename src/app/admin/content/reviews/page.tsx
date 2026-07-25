"use client";

import ContentEditorShell, {
  FieldLabel,
  FieldInput,
  FieldTextarea,
} from "@/components/admin/ContentEditorShell";
import { Trash2, Plus } from "lucide-react";

export default function ReviewsEditor() {
  return (
    <ContentEditorShell
      contentKey="reviews"
      title="Customer Reviews"
      description="Add, edit, or delete customer testimonials shown on the homepage."
    >
      {({ data, setData }) => (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <FieldLabel>Section Subtitle</FieldLabel>
              <FieldInput
                value={data.subtitle}
                onChange={(v) => setData({ ...data, subtitle: v })}
                placeholder="LOVE LETTERS"
              />
            </div>
            <div>
              <FieldLabel>Section Heading</FieldLabel>
              <FieldInput
                value={data.heading}
                onChange={(v) => setData({ ...data, heading: v })}
                placeholder="What Our Community Says"
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
                    Review {i + 1}
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
                <div>
                  <FieldLabel>Quote</FieldLabel>
                  <FieldTextarea
                    value={item.quote}
                    onChange={(v) => {
                      const next = [...data.items];
                      next[i] = { ...next[i], quote: v };
                      setData({ ...data, items: next });
                    }}
                    rows={2}
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <FieldLabel>Customer Name</FieldLabel>
                    <FieldInput
                      value={item.name}
                      onChange={(v) => {
                        const next = [...data.items];
                        next[i] = { ...next[i], name: v };
                        setData({ ...data, items: next });
                      }}
                      placeholder="e.g. Rhea S."
                    />
                  </div>
                  <div>
                    <FieldLabel>Initials</FieldLabel>
                    <FieldInput
                      value={item.initials}
                      onChange={(v) => {
                        const next = [...data.items];
                        next[i] = { ...next[i], initials: v };
                        setData({ ...data, items: next });
                      }}
                      placeholder="e.g. RS"
                    />
                  </div>
                  <div>
                    <FieldLabel>Location & Product</FieldLabel>
                    <FieldInput
                      value={item.info}
                      onChange={(v) => {
                        const next = [...data.items];
                        next[i] = { ...next[i], info: v };
                        setData({ ...data, items: next });
                      }}
                      placeholder="Delhi · Burgundy Festive Set"
                    />
                  </div>
                </div>
                <div>
                  <FieldLabel>Avatar Tailwind Color Classes</FieldLabel>
                  <FieldInput
                    value={item.avatarColor}
                    onChange={(v) => {
                      const next = [...data.items];
                      next[i] = { ...next[i], avatarColor: v };
                      setData({ ...data, items: next });
                    }}
                    placeholder="bg-rose-100 text-rose-900"
                  />
                </div>
              </div>
            ))}
            <button
              onClick={() =>
                setData({
                  ...data,
                  items: [
                    ...data.items,
                    {
                      quote: "",
                      name: "",
                      initials: "",
                      info: "",
                      avatarColor: "bg-indigo-100 text-indigo-900",
                    },
                  ],
                })
              }
              className="flex items-center gap-2 text-sm text-indigo-600 font-medium hover:text-indigo-800 transition-colors"
            >
              <Plus className="w-4 h-4" /> Add Review
            </button>
          </div>
        </>
      )}
    </ContentEditorShell>
  );
}
