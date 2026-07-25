"use client";

import { useState, useRef, DragEvent, ChangeEvent } from "react";
import { createClient } from "@/utils/supabase/client";
import { UploadCloud, CheckCircle2, AlertCircle, Loader2, Image as ImageIcon } from "lucide-react";

interface ImageUploadWebPProps {
  onUpload: (url: string) => void;
  label?: string;
  buttonText?: string;
  multiple?: boolean;
  className?: string;
}

export default function ImageUploadWebP({
  onUpload,
  label = "Upload Image (Auto-converts to WebP)",
  buttonText = "Select or Drag Image",
  multiple = false,
  className = "",
}: ImageUploadWebPProps) {
  const [uploading, setUploading] = useState(false);
  const [progressText, setProgressText] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const supabase = createClient();

  // Convert any image file to WebP Blob via Canvas
  const convertToWebP = (file: File): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement("canvas");
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext("2d");
          if (!ctx) {
            reject(new Error("Failed to initialize canvas context"));
            return;
          }
          ctx.drawImage(img, 0, 0);
          canvas.toBlob(
            (blob) => {
              if (blob) resolve(blob);
              else reject(new Error("Image to WebP conversion failed"));
            },
            "image/webp",
            0.88 // High quality WebP compression
          );
        };
        img.onerror = () => reject(new Error(`Failed to load image file: ${file.name}`));
        if (e.target?.result) {
          img.src = e.target.result as string;
        } else {
          reject(new Error("File reader empty"));
        }
      };
      reader.onerror = () => reject(new Error(`Failed to read file: ${file.name}`));
      reader.readAsDataURL(file);
    });
  };

  const processAndUploadFiles = async (files: FileList | File[]) => {
    const fileArray = Array.from(files).filter((f) => f.type.startsWith("image/"));
    if (fileArray.length === 0) {
      setError("Please select valid image files (PNG, JPG, JPEG, etc.)");
      return;
    }

    setUploading(true);
    setError(null);

    try {
      for (let i = 0; i < fileArray.length; i++) {
        const file = fileArray[i];
        setProgressText(`Converting ${file.name} to WebP... (${i + 1}/${fileArray.length})`);
        
        const webpBlob = await convertToWebP(file);
        
        setProgressText(`Uploading WebP to storage... (${i + 1}/${fileArray.length})`);
        const filename = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.webp`;

        const { error: uploadError } = await supabase.storage
          .from("media")
          .upload(filename, webpBlob, {
            contentType: "image/webp",
            cacheControl: "3600",
            upsert: false,
          });

        if (uploadError) {
          throw new Error(`Upload failed: ${uploadError.message}`);
        }

        const { data: publicUrlData } = supabase.storage.from("media").getPublicUrl(filename);
        if (publicUrlData?.publicUrl) {
          onUpload(publicUrlData.publicUrl);
        }
      }
      setProgressText("Upload complete! ✨");
      setTimeout(() => setProgressText(""), 2500);
    } catch (err: any) {
      console.error("Upload error:", err);
      setError(err.message || "Failed to process and upload image");
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processAndUploadFiles(e.target.files);
    }
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processAndUploadFiles(e.dataTransfer.files);
    }
  };

  return (
    <div className={`space-y-2 font-sans ${className}`}>
      {label && <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider">{label}</label>}

      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !uploading && fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-2 ${
          isDragging
            ? "border-stone-900 bg-stone-100/80 scale-[1.01]"
            : uploading
            ? "border-amber-500/50 bg-amber-50/30 cursor-not-allowed"
            : "border-stone-300 bg-stone-50 hover:bg-stone-100 hover:border-stone-400 shadow-2xs"
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple={multiple}
          onChange={handleFileChange}
          className="hidden"
          disabled={uploading}
        />

        {uploading ? (
          <div className="flex flex-col items-center py-2">
            <Loader2 className="w-8 h-8 text-amber-600 animate-spin mb-2" />
            <span className="text-xs font-bold text-stone-800">{progressText || "Processing Image..."}</span>
            <span className="text-[10px] text-stone-500 mt-1">Auto-converting to high-efficiency WebP format</span>
          </div>
        ) : (
          <>
            <div className="w-10 h-10 rounded-full bg-white shadow-xs border border-stone-200 flex items-center justify-center text-stone-700 mb-1">
              <UploadCloud className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-stone-900">{buttonText}</p>
              <p className="text-[10px] text-stone-500 mt-0.5">
                Drag & drop PNG, JPG, JPEG — automatically converted to .webp
              </p>
            </div>
          </>
        )}
      </div>

      {error && (
        <div className="flex items-center gap-1.5 text-red-600 text-xs font-medium bg-red-50 p-2.5 rounded-lg border border-red-200">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}
