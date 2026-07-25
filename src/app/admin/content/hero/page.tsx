"use client";

import ContentEditorShell, {
  FieldLabel,
  FieldTextarea,
} from "@/components/admin/ContentEditorShell";
import { Trash2 } from "lucide-react";
import ImageUploadWebP from "@/components/admin/ImageUploadWebP";

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
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              {data.images.map((img: string, i: number) => (
                <div key={i} className="relative group border border-stone-200 rounded-xl overflow-hidden bg-stone-50 h-32 shadow-xs">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={img} alt="Hero slide" className="w-full h-full object-cover" />
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
                    #{i + 1}
                  </div>
                </div>
              ))}
            </div>
            <ImageUploadWebP
              onUpload={(url) => setData({ ...data, images: [...data.images, url] })}
              multiple={true}
              label="Upload Slideshow Photos (Auto-converts PNG, JPG, etc. to WebP)"
              buttonText="Drop or Select Slideshow Images"
            />
          </div>
        </>
      )}
    </ContentEditorShell>
  );
}
