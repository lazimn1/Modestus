"use client";

import ContentEditorShell, {
  FieldLabel,
  FieldInput,
} from "@/components/admin/ContentEditorShell";
import { Trash2, Plus } from "lucide-react";
import ImageUploadWebP from "@/components/admin/ImageUploadWebP";

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
              className="p-5 bg-stone-50 rounded-xl border border-stone-200 space-y-4 shadow-xs"
            >
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold text-stone-700 uppercase tracking-wider">
                  Category #{i + 1}
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                <FieldLabel>Category Photo</FieldLabel>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
                  {item.imageUrl && (
                    <div className="h-28 w-full relative rounded-xl overflow-hidden border border-stone-300 shadow-xs bg-white">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={item.imageUrl} alt="Category" className="w-full h-full object-cover" />
                    </div>
                  )}
                  <div className={item.imageUrl ? "sm:col-span-2" : "sm:col-span-3"}>
                    <ImageUploadWebP
                      onUpload={(url) => {
                        const next = [...data.items];
                        next[i] = { ...next[i], imageUrl: url };
                        setData({ ...data, items: next });
                      }}
                      label="Upload Category Photo (Auto-converts to WebP)"
                      buttonText="Select Category Image"
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
                items: [
                  ...data.items,
                  { title: "New Category", description: "Discover collection", linkText: "Shop Now", linkUrl: "/shop", imageUrl: "" },
                ],
              })
            }
            className="flex items-center gap-2 text-sm text-stone-900 bg-white border border-stone-300 px-4 py-2.5 rounded-xl font-semibold hover:bg-stone-50 transition-all shadow-xs"
          >
            <Plus className="w-4 h-4" /> Add Category
          </button>
        </div>
      )}
    </ContentEditorShell>
  );
}
