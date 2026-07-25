"use client";

import ContentEditorShell, {
  FieldLabel,
  FieldInput,
  FieldTextarea,
  ImagePreview,
} from "@/components/admin/ContentEditorShell";
import { Trash2, Plus } from "lucide-react";

export default function HeroEditor() {
  return (
    <ContentEditorShell
      contentKey="hero"
      title="Hero Section"
      description="Edit the hero slideshow images and tagline text."
    >
      {({ data, setData }) => (
        <>
          {/* Tagline */}
          <div>
            <FieldLabel>Tagline (use line breaks)</FieldLabel>
            <FieldTextarea
              value={data.tagline}
              onChange={(v) => setData({ ...data, tagline: v })}
              placeholder="Fashion\nthat moves\nwith you."
              rows={3}
            />
          </div>

          {/* Images */}
          <div>
            <FieldLabel>Slideshow Images</FieldLabel>
            <div className="space-y-3">
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
                      placeholder="Image URL"
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
          </div>
        </>
      )}
    </ContentEditorShell>
  );
}
