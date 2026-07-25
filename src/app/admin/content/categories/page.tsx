"use client";

import ContentEditorShell, {
  FieldLabel,
  FieldInput,
  ImagePreview,
} from "@/components/admin/ContentEditorShell";
import { Trash2, Plus } from "lucide-react";

export default function CategoriesEditor() {
  return (
    <ContentEditorShell
      contentKey="categories"
      title="Categories"
      description="Edit the category strip cards shown on the homepage."
    >
      {({ data, setData }) => (
        <div className="space-y-4">
          {data.items.map((item: any, i: number) => (
            <div
              key={i}
              className="p-4 bg-gray-50 rounded-xl border border-gray-100 space-y-3"
            >
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                  Category {i + 1}
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
                    value={item.description}
                    onChange={(v) => {
                      const next = [...data.items];
                      next[i] = { ...next[i], description: v };
                      setData({ ...data, items: next });
                    }}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <FieldLabel>Button Text</FieldLabel>
                  <FieldInput
                    value={item.linkText}
                    onChange={(v) => {
                      const next = [...data.items];
                      next[i] = { ...next[i], linkText: v };
                      setData({ ...data, items: next });
                    }}
                  />
                </div>
                <div>
                  <FieldLabel>Link URL</FieldLabel>
                  <FieldInput
                    value={item.linkUrl}
                    onChange={(v) => {
                      const next = [...data.items];
                      next[i] = { ...next[i], linkUrl: v };
                      setData({ ...data, items: next });
                    }}
                  />
                </div>
              </div>
              <div>
                <FieldLabel>Image URL</FieldLabel>
                <FieldInput
                  value={item.imageUrl}
                  onChange={(v) => {
                    const next = [...data.items];
                    next[i] = { ...next[i], imageUrl: v };
                    setData({ ...data, items: next });
                  }}
                />
                <ImagePreview src={item.imageUrl} />
              </div>
            </div>
          ))}
          <button
            onClick={() =>
              setData({
                ...data,
                items: [
                  ...data.items,
                  { title: "", description: "", linkText: "", linkUrl: "", imageUrl: "" },
                ],
              })
            }
            className="flex items-center gap-2 text-sm text-indigo-600 font-medium hover:text-indigo-800 transition-colors"
          >
            <Plus className="w-4 h-4" /> Add Category
          </button>
        </div>
      )}
    </ContentEditorShell>
  );
}
