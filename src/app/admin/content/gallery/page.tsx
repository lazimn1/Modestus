"use client";

import ContentEditorShell, {
  FieldLabel,
  FieldInput,
  FieldTextarea,
} from "@/components/admin/ContentEditorShell";
import { Trash2 } from "lucide-react";
import ImageUploadWebP from "@/components/admin/ImageUploadWebP";

export default function GalleryEditor() {
  return (
    <ContentEditorShell
      contentKey="editorial"
      title="Editorial Gallery"
      description="Edit the gallery section heading, subtext, and editorial shots."
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
            <FieldLabel>Gallery Images</FieldLabel>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {data.images.map((img: string, i: number) => (
                <div key={i} className="relative group border border-stone-200 rounded-xl overflow-hidden bg-stone-50 h-36 shadow-xs">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={img} alt={`Gallery ${i + 1}`} className="w-full h-full object-cover" />
                  <button
                    onClick={() => {
                      const next = data.images.filter((_: string, j: number) => j !== i);
                      setData({ ...data, images: next });
                    }}
                    className="absolute top-2 right-2 p-1.5 bg-red-600/90 hover:bg-red-700 text-white rounded-lg shadow transition-all opacity-90 hover:opacity-100"
                    title="Remove image"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <div className="absolute bottom-1 left-1 bg-black/60 backdrop-blur-xs text-white text-[10px] font-bold px-2 py-0.5 rounded">
                    Shot #{i + 1}
                  </div>
                </div>
              ))}
            </div>

            <ImageUploadWebP
              onUpload={(url) => setData({ ...data, images: [...data.images, url] })}
              multiple={true}
              label="Upload Gallery Photos (Auto-converts PNG, JPG, etc. to WebP)"
              buttonText="Drop or Select Editorial Shots"
            />
          </div>
        </>
      )}
    </ContentEditorShell>
  );
}
