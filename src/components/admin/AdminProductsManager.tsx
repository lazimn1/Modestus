"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { createClient } from "@/utils/supabase/client";
import { Product } from "@/lib/products";
import { mapDbToProduct, mapProductToDb } from "@/lib/useProducts";
import ImageUploadWebP from "@/components/admin/ImageUploadWebP";
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  X,
  Check,
  AlertCircle,
  RefreshCw,
  Image as ImageIcon,
  Palette,
  Ruler,
} from "lucide-react";

interface AdminProductsManagerProps {
  initialProducts: Product[];
}

const STANDARD_SIZES = ["XS", "S", "M", "L", "XL", "XXL", "Free Size"];

export default function AdminProductsManager({ initialProducts }: AdminProductsManagerProps) {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [loading, setLoading] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [formState, setFormState] = useState<Partial<Product>>({});
  const [saving, setSaving] = useState<boolean>(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const [newImageUrl, setNewImageUrl] = useState<string>("");
  const [newColorName, setNewColorName] = useState<string>("");
  const [newColorHex, setNewColorHex] = useState<string>("#000000");
  const [newCustomSize, setNewCustomSize] = useState<string>("");

  const supabase = createClient();

  const refreshProducts = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.from("products").select("*").order("id", { ascending: true });
      if (data && !error) {
        setProducts(data.map(mapDbToProduct));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const filteredProducts = useMemo(
    () =>
      products.filter((product) => {
        const term = searchTerm.trim().toLowerCase();
        if (!term) return true;
        return [product.title, product.subtitle, product.slug]
          .filter(Boolean)
          .some((value) => value.toLowerCase().includes(term));
      }),
    [products, searchTerm]
  );

  const handleOpenCreate = () => {
    setFormState({
      title: "",
      subtitle: "",
      slug: "",
      price: 5000,
      originalPrice: undefined,
      badge: undefined,
      images: ["https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=900&q=80"],
      colors: [{ name: "Midnight Black", hex: "#0a0a0a" }],
      sizes: ["S", "M", "L"],
      description: "",
      fabric: "",
      sizeGuide: "",
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (product: Product) => {
    setFormState({ ...product });
    setIsModalOpen(true);
  };

  const handleTitleChange = (value: string) => {
    const slug = value
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
    setFormState((prev) => ({ ...prev, title: value, slug: prev.id ? prev.slug : slug }));
  };

  const handleSave = async () => {
    if (!formState.title || !formState.price) {
      showToast("Title and price are required.", "error");
      return;
    }

    setSaving(true);
    try {
      const payload = mapProductToDb({
        ...formState,
        slug:
          formState.slug && formState.slug.trim()
            ? formState.slug.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")
            : formState.title
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, "-")
                .replace(/(^-|-$)/g, ""),
        images:
          formState.images && formState.images.length > 0
            ? formState.images
            : ["https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=900&q=80"],
        colors:
          formState.colors && formState.colors.length > 0
            ? formState.colors
            : [{ name: "Standard Black", hex: "#0a0a0a" }],
        sizes:
          formState.sizes && formState.sizes.length > 0
            ? formState.sizes
            : ["S", "M", "L"],
        rating: formState.rating ?? 4.9,
        reviewCount: formState.reviewCount ?? 0,
        aspectClass: formState.aspectClass ?? "aspect-[3/4]",
      });

      if (formState.id) {
        const { error } = await supabase.from("products").update(payload).eq("id", formState.id);
        if (error) throw error;
        showToast("Product updated successfully.", "success");
      } else {
        const normalizedSlug = payload.slug;
        const { data: existing } = await supabase
          .from("products")
          .select("id")
          .eq("slug", normalizedSlug)
          .maybeSingle();

        if (existing) {
          payload.slug = `${normalizedSlug}-${Math.floor(1000 + Math.random() * 9000)}`;
        }

        const { error } = await supabase.from("products").insert([payload]);
        if (error) throw error;
        showToast("New product added to the catalog.", "success");
      }

      setIsModalOpen(false);
      await refreshProducts();
    } catch (error: any) {
      showToast(error?.message || "Unable to save product.", "error");
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number, title: string) => {
    if (!confirm(`Delete "${title}"? This action cannot be undone.`)) return;
    setDeletingId(id);
    try {
      const { error } = await supabase.from("products").delete().eq("id", id);
      if (error) throw error;
      showToast("Product removed.", "success");
      await refreshProducts();
    } catch (error: any) {
      showToast(error?.message || "Failed to delete product.", "error");
    } finally {
      setDeletingId(null);
    }
  };

  const addImage = () => {
    if (!newImageUrl.trim()) return;
    setFormState((prev) => ({ ...prev, images: [...(prev.images || []), newImageUrl.trim()] }));
    setNewImageUrl("");
  };

  const removeImage = (index: number) => {
    setFormState((prev) => ({
      ...prev,
      images: (prev.images || []).filter((_, i) => i !== index),
    }));
  };

  const addColor = () => {
    if (!newColorName.trim()) return;
    setFormState((prev) => ({
      ...prev,
      colors: [...(prev.colors || []), { name: newColorName.trim(), hex: newColorHex }],
    }));
    setNewColorName("");
  };

  const removeColor = (index: number) => {
    setFormState((prev) => ({
      ...prev,
      colors: (prev.colors || []).filter((_, i) => i !== index),
    }));
  };

  const toggleSize = (size: string) => {
    const currentSizes = formState.sizes || [];
    setFormState((prev) => ({
      ...prev,
      sizes: currentSizes.includes(size)
        ? currentSizes.filter((s) => s !== size)
        : [...currentSizes, size],
    }));
  };

  const addCustomSize = () => {
    if (!newCustomSize.trim()) return;
    setFormState((prev) => {
      const currentSizes = prev.sizes || [];
      if (currentSizes.includes(newCustomSize.trim())) return prev;
      return { ...prev, sizes: [...currentSizes, newCustomSize.trim()] };
    });
    setNewCustomSize("");
  };

  return (
    <div className="space-y-6 pb-16">
      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium shadow-xl transition ${
            toast.type === "success" ? "bg-emerald-50 text-emerald-900" : "bg-red-50 text-red-900"
          }`}
        >
          {toast.type === "success" ? <Check className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          {toast.message}
        </div>
      )}

      <div className="bg-white border border-stone-200 rounded-3xl p-6 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-stone-900">Product Catalog</h1>
            <p className="mt-2 text-sm text-stone-500 max-w-2xl">
              Manage your product listings, pricing, images and size details in one central place.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={refreshProducts}
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-xl border border-stone-200 bg-stone-50 px-4 py-2 text-sm font-medium text-stone-700 hover:bg-stone-100 transition disabled:opacity-60"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </button>
            <button
              type="button"
              onClick={handleOpenCreate}
              className="inline-flex items-center gap-2 rounded-xl bg-stone-900 px-5 py-2 text-sm font-semibold text-white hover:bg-stone-800 transition"
            >
              <Plus className="w-4 h-4" /> Add Product
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white border border-stone-200 rounded-3xl p-4 shadow-sm flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Search products by title, subtitle, or slug"
            className="w-full rounded-xl border border-stone-200 bg-stone-50 pl-10 pr-4 py-3 text-sm text-stone-900 focus:border-stone-400 focus:outline-none focus:ring-2 focus:ring-stone-200"
          />
        </div>
      </div>

      {filteredProducts.length === 0 ? (
        <div className="bg-white border border-stone-200 rounded-3xl p-10 text-center shadow-sm">
          <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-stone-100 flex items-center justify-center text-stone-400">
            <Search className="w-7 h-7" />
          </div>
          <h2 className="text-lg font-semibold text-stone-900">No products found</h2>
          <p className="mt-2 text-sm text-stone-500">Try a different search term or clear the filter to see all products.</p>
        </div>
      ) : (
        <div className="bg-white border border-stone-200 rounded-3xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-stone-200 text-left">
              <thead className="bg-stone-50">
                <tr>
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-stone-500">Product</th>
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-stone-500">Price</th>
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-stone-500">Badge</th>
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-stone-500">Sizes</th>
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-stone-500 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-200 bg-white">
                {filteredProducts.map((product) => (
                  <tr key={product.id} className="hover:bg-stone-50 transition-colors">
                    <td className="px-6 py-4 align-top">
                      <div className="flex items-start gap-3">
                        <div className="relative h-16 w-16 rounded-2xl bg-stone-100 overflow-hidden border border-stone-200">
                          {product.images && product.images.length > 0 ? (
                            <Image src={product.images[0]} alt={product.title} fill className="object-cover" />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-stone-400">
                              <ImageIcon className="w-5 h-5" />
                            </div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-stone-900">{product.title}</p>
                          <p className="text-xs text-stone-500 line-clamp-2">{product.subtitle}</p>
                          <p className="text-[11px] text-stone-400 mt-1">/{product.slug}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 align-top text-sm font-semibold text-stone-900">₹{product.price.toLocaleString()}</td>
                    <td className="px-6 py-4 align-top text-sm text-stone-600">{product.badge || "—"}</td>
                    <td className="px-6 py-4 align-top text-sm text-stone-600">
                      {(product.sizes || []).join(", ") || "—"}
                    </td>
                    <td className="px-6 py-4 align-top text-right text-sm font-medium">
                      <button
                        type="button"
                        onClick={() => handleOpenEdit(product)}
                        className="mr-2 inline-flex items-center justify-center rounded-lg border border-stone-200 bg-stone-50 px-3 py-2 text-stone-700 hover:bg-stone-100 transition"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(product.id, product.title)}
                        disabled={deletingId === product.id}
                        className="inline-flex items-center justify-center rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-red-600 hover:bg-red-100 transition disabled:opacity-60"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/40 p-4 backdrop-blur-sm">
          <div className="mx-auto w-full max-w-5xl overflow-hidden rounded-[28px] bg-white shadow-2xl">
            <div className="flex items-start justify-between gap-4 border-b border-stone-200 px-6 py-5 bg-stone-950 text-white">
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-stone-400">Product details</p>
                <h2 className="mt-2 text-2xl font-semibold">{formState.id ? "Edit Product" : "Add New Product"}</h2>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="rounded-full bg-white/10 p-2 text-stone-100 hover:bg-white/20 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-6 px-6 py-6 sm:px-8">
              <div className="grid gap-6 lg:grid-cols-2">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-stone-500 mb-2">Product Title *</label>
                  <input
                    type="text"
                    value={formState.title || ""}
                    onChange={(event) => handleTitleChange(event.target.value)}
                    placeholder="e.g. Midnight Abaya"
                    className="w-full rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm text-stone-900 focus:border-stone-400 focus:outline-none focus:ring-2 focus:ring-stone-200"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-stone-500 mb-2">Subtitle</label>
                  <input
                    type="text"
                    value={formState.subtitle || ""}
                    onChange={(event) => setFormState({ ...formState, subtitle: event.target.value })}
                    placeholder="e.g. Relaxed luxury silhouette"
                    className="w-full rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm text-stone-900 focus:border-stone-400 focus:outline-none focus:ring-2 focus:ring-stone-200"
                  />
                </div>
              </div>

              <div className="grid gap-6 lg:grid-cols-2">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-stone-500 mb-2">URL Slug</label>
                  <input
                    type="text"
                    value={formState.slug || ""}
                    onChange={(event) => setFormState({ ...formState, slug: event.target.value })}
                    placeholder="product-slug"
                    className="w-full rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm text-stone-900 focus:border-stone-400 focus:outline-none focus:ring-2 focus:ring-stone-200"
                  />
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-stone-500 mb-2">Price (₹) *</label>
                    <input
                      type="number"
                      value={formState.price ?? 0}
                      onChange={(event) => setFormState({ ...formState, price: Number(event.target.value) })}
                      min={0}
                      className="w-full rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm text-stone-900 focus:border-stone-400 focus:outline-none focus:ring-2 focus:ring-stone-200"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-stone-500 mb-2">Original Price</label>
                    <input
                      type="number"
                      value={formState.originalPrice ?? ""}
                      onChange={(event) =>
                        setFormState({
                          ...formState,
                          originalPrice: event.target.value ? Number(event.target.value) : undefined,
                        })
                      }
                      min={0}
                      className="w-full rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm text-stone-900 focus:border-stone-400 focus:outline-none focus:ring-2 focus:ring-stone-200"
                    />
                  </div>
                </div>
              </div>

              <div className="grid gap-6 lg:grid-cols-3">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-stone-500 mb-2">Badge</label>
                  <select
                    value={formState.badge || ""}
                    onChange={(event) => setFormState({ ...formState, badge: event.target.value || undefined })}
                    className="w-full rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm text-stone-900 focus:border-stone-400 focus:outline-none focus:ring-2 focus:ring-stone-200"
                  >
                    <option value="">No badge</option>
                    <option value="Bestseller">Bestseller</option>
                    <option value="New">New</option>
                    <option value="Limited">Limited</option>
                    <option value="Exclusive">Exclusive</option>
                  </select>
                </div>
                <div className="lg:col-span-2">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-stone-500 mb-2">Images</label>
                  <div className="space-y-3 rounded-3xl border border-stone-200 bg-stone-50 p-4">
                    <div className="grid grid-cols-2 gap-3">
                      {(formState.images || []).map((src, index) => (
                        <div key={index} className="relative overflow-hidden rounded-2xl border border-stone-200 bg-white">
                          <Image src={src} alt={`Image ${index + 1}`} width={240} height={220} className="h-28 w-full object-cover" />
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="absolute right-2 top-2 rounded-full bg-black/70 p-1.5 text-white hover:bg-black"
                            aria-label="Remove image"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-3">
                      <input
                        type="text"
                        value={newImageUrl}
                        onChange={(event) => setNewImageUrl(event.target.value)}
                        placeholder="Add image URL"
                        className="w-full rounded-2xl border border-stone-200 bg-white px-4 py-3 text-sm text-stone-900 focus:border-stone-400 focus:outline-none focus:ring-2 focus:ring-stone-200"
                      />
                      <button
                        type="button"
                        onClick={addImage}
                        className="inline-flex items-center justify-center rounded-2xl bg-stone-900 px-4 py-3 text-sm font-semibold text-white hover:bg-stone-800 transition"
                      >
                        Add Image
                      </button>
                    </div>
                    <div>
                      <ImageUploadWebP
                        onUpload={(url) => setFormState((prev) => ({ ...prev, images: [...(prev.images || []), url] }))}
                        multiple={true}
                        label="Upload image files"
                        buttonText="Upload images"
                        className="mt-2"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid gap-6 lg:grid-cols-2">
                <div className="rounded-3xl border border-stone-200 bg-stone-50 p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-stone-500">Colors</p>
                      <p className="text-sm text-stone-500">Add the product color variations below.</p>
                    </div>
                    <Palette className="h-5 w-5 text-stone-600" />
                  </div>

                  <div className="space-y-2 mb-4">
                    {(formState.colors || []).map((color, index) => (
                      <div key={index} className="flex items-center justify-between rounded-2xl bg-white px-3 py-2 border border-stone-200">
                        <div className="flex items-center gap-3">
                          <span className="h-5 w-5 rounded-full border border-stone-300" style={{ backgroundColor: color.hex }} />
                          <span className="text-sm text-stone-700">{color.name}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeColor(index)}
                          className="rounded-full p-1 text-stone-400 hover:text-red-600"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>

                  <div className="grid gap-3 sm:grid-cols-[auto_1fr_auto] items-center">
                    <input
                      type="color"
                      value={newColorHex}
                      onChange={(event) => setNewColorHex(event.target.value)}
                      className="h-12 w-full rounded-2xl border border-stone-200 bg-white p-0"
                    />
                    <input
                      type="text"
                      value={newColorName}
                      onChange={(event) => setNewColorName(event.target.value)}
                      placeholder="Color name"
                      className="w-full rounded-2xl border border-stone-200 bg-white px-4 py-3 text-sm text-stone-900 focus:border-stone-400 focus:outline-none focus:ring-2 focus:ring-stone-200"
                    />
                    <button
                      type="button"
                      onClick={addColor}
                      className="inline-flex items-center justify-center rounded-2xl bg-stone-900 px-4 py-3 text-sm font-semibold text-white hover:bg-stone-800 transition"
                    >
                      Add
                    </button>
                  </div>
                </div>

                <div className="rounded-3xl border border-stone-200 bg-stone-50 p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-stone-500">Sizes</p>
                      <p className="text-sm text-stone-500">Toggle available size tags.</p>
                    </div>
                    <Ruler className="h-5 w-5 text-stone-600" />
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {STANDARD_SIZES.map((size) => {
                      const selected = (formState.sizes || []).includes(size);
                      return (
                        <button
                          key={size}
                          type="button"
                          onClick={() => toggleSize(size)}
                          className={`rounded-2xl border px-4 py-2 text-sm transition ${
                            selected
                              ? "border-stone-900 bg-stone-900 text-white"
                              : "border-stone-200 bg-white text-stone-700 hover:border-stone-400"
                          }`}
                        >
                          {size}
                        </button>
                      );
                    })}
                  </div>
                  <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_auto]">
                    <input
                      type="text"
                      value={newCustomSize}
                      onChange={(event) => setNewCustomSize(event.target.value)}
                      placeholder="Custom size tag"
                      className="w-full rounded-2xl border border-stone-200 bg-white px-4 py-3 text-sm text-stone-900 focus:border-stone-400 focus:outline-none focus:ring-2 focus:ring-stone-200"
                    />
                    <button
                      type="button"
                      onClick={addCustomSize}
                      className="inline-flex items-center justify-center rounded-2xl bg-stone-900 px-4 py-3 text-sm font-semibold text-white hover:bg-stone-800 transition"
                    >
                      Add
                    </button>
                  </div>
                </div>
              </div>

              <div className="grid gap-6 lg:grid-cols-2">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-stone-500 mb-2">Description</label>
                  <textarea
                    rows={5}
                    value={formState.description || ""}
                    onChange={(event) => setFormState({ ...formState, description: event.target.value })}
                    placeholder="Write a rich product description."
                    className="w-full rounded-3xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm text-stone-900 focus:border-stone-400 focus:outline-none focus:ring-2 focus:ring-stone-200"
                  />
                </div>
                <div className="space-y-6">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-stone-500 mb-2">Fabric & Care</label>
                    <textarea
                      rows={3}
                      value={formState.fabric || ""}
                      onChange={(event) => setFormState({ ...formState, fabric: event.target.value })}
                      placeholder="Example: 100% Japanese crepe. Hand wash cold or dry clean."
                      className="w-full rounded-3xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm text-stone-900 focus:border-stone-400 focus:outline-none focus:ring-2 focus:ring-stone-200"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-stone-500 mb-2">Size Guide</label>
                    <textarea
                      rows={3}
                      value={formState.sizeGuide || ""}
                      onChange={(event) => setFormState({ ...formState, sizeGuide: event.target.value })}
                      placeholder="Example: Fits true to size. Length 57 inches."
                      className="w-full rounded-3xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm text-stone-900 focus:border-stone-400 focus:outline-none focus:ring-2 focus:ring-stone-200"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-3 border-t border-stone-200 bg-stone-50 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="rounded-2xl border border-stone-200 bg-white px-5 py-3 text-sm font-semibold text-stone-700 hover:bg-stone-100 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="inline-flex items-center justify-center rounded-2xl bg-stone-900 px-6 py-3 text-sm font-semibold text-white hover:bg-stone-800 transition disabled:opacity-60"
              >
                {saving && <RefreshCw className="mr-2 h-4 w-4 animate-spin" />}
                {formState.id ? "Save changes" : "Create product"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
