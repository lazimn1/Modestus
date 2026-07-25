"use client";

import ContentEditorShell, {
  FieldLabel,
  FieldInput,
  FieldTextarea,
  ImagePreview,
} from "@/components/admin/ContentEditorShell";
import { Trash2, Plus } from "lucide-react";

export default function GalleryEditor() {
  return (
    <ContentEditorShell
      contentKey="editorial"
      title="Editorial Gallery"
      description="Edit the gallery section heading, subtext, and image URLs."
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

          <div className="space-y-3 mt-4">
            <FieldLabel>Gallery Images (4 editorial shots)</FieldLabel>
            {data.images.map((img: string, i: number) => (
              <div key={i} className="flex items-start gap-3">
                <div className="flex-1">
                  <FieldInput
                    value={img}
                    onChange={(v) => {
                      const next = [...data.images];
                      next[i] = v;
                      setData({ ...data, images: next });
                    }}
                    placeholder={`Image URL ${i + 1}`}
                  />
                  <ImagePreview src={img} />
                </div>
                <button
                  onClick={() => {
                    const next = data.images.filter((_: string, j: number) => j !== i);
                    setData({ ...data, images: next });
                  }}
                  className="mt-2 p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
            <button
              onClick={() => setData({ ...data, images: [...data.images, ""] })}
              className="flex items-center gap-2 text-sm text-indigo-600 font-medium hover:text-indigo-800 transition-colors"
            >
              <Plus className="w-4 h-4" /> Add Image
            </button>
          </div>
        </>
      )}
    </ContentEditorShell>
  );
}
