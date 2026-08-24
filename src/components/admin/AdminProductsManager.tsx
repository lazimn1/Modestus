"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { Product } from "@/lib/products";
import {
  getAdminProductsAction,
  createProductAction,
  updateProductAction,
  deleteProductAction,
} from "@/app/actions/admin";
import {
  Search,
  RefreshCw,
  Package,
  Image as ImageIcon,
  Plus,
  Pencil,
  Trash2,
  X,
  Check,
  AlertCircle,
} from "lucide-react";
import { formatINR } from "@/lib/products";

interface AdminProductsManagerProps {
  initialProducts: Product[];
}

// ─── Product Form (Add / Edit) ────────────────────────────────────────────────
function ProductForm({
  initial,
  onSave,
  onCancel,
}: {
  initial?: Partial<Product> | null;
  onSave: (data: Record<string, unknown>) => Promise<{ error?: string }>;
  onCancel: () => void;
}) {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Controlled fields
  const [title, setTitle] = useState(initial?.title ?? "");
  const [subtitle, setSubtitle] = useState(initial?.subtitle ?? "");
  const [price, setPrice] = useState(String(initial?.price ?? ""));
  const [originalPrice, setOriginalPrice] = useState(String(initial?.originalPrice ?? ""));
  const [badge, setBadge] = useState(initial?.badge ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [fabric, setFabric] = useState(initial?.fabric ?? "");
  const [sizeGuide, setSizeGuide] = useState(initial?.sizeGuide ?? "");
  // Sizes and colors as comma-separated strings for simplicity
  const [sizesRaw, setSizesRaw] = useState(
    (initial?.sizes ?? []).join(", ")
  );
  const [colorsRaw, setColorsRaw] = useState(
    (initial?.colors ?? []).map((c) => `${c.name}:${c.hex}`).join(", ")
  );
  const [imagesRaw, setImagesRaw] = useState(
    (initial?.images ?? []).join("\n")
  );

  const slugify = (s: string) =>
    s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!title.trim()) { setError("Title is required."); return; }
    if (!price || isNaN(Number(price))) { setError("A valid price is required."); return; }

    setSaving(true);
    const payload: Record<string, unknown> = {
      title: title.trim(),
      subtitle: subtitle.trim(),
      slug: slugify(title),
      price: Number(price),
      original_price: originalPrice ? Number(originalPrice) : null,
      badge: badge.trim() || null,
      description: description.trim(),
      fabric: fabric.trim(),
      size_guide: sizeGuide.trim(),
      sizes: sizesRaw.split(",").map((s) => s.trim()).filter(Boolean),
      colors: colorsRaw
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
        .map((s) => {
          const [name, hex] = s.split(":").map((p) => p.trim());
          return { name: name ?? s, hex: hex ?? "#000000" };
        }),
      images: imagesRaw.split("\n").map((s) => s.trim()).filter(Boolean),
      aspect_class: "aspect-[3/4]",
      rating: 0,
      review_count: 0,
    };

    const result = await onSave(payload);
    if (result?.error) {
      setError(result.error);
      setSaving(false);
    }
  };

  const inputCls =
    "w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all";
  const labelCls = "block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5";

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className={labelCls}>Title *</label>
          <input className={inputCls} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Midnight Abaya" />
        </div>
        <div>
          <label className={labelCls}>Subtitle</label>
          <input className={inputCls} value={subtitle} onChange={(e) => setSubtitle(e.target.value)} placeholder="e.g. Relaxed Luxury Silhouette" />
        </div>
        <div>
          <label className={labelCls}>Price (₹) *</label>
          <input className={inputCls} type="number" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="e.g. 8500" />
        </div>
        <div>
          <label className={labelCls}>Original Price (₹)</label>
          <input className={inputCls} type="number" value={originalPrice} onChange={(e) => setOriginalPrice(e.target.value)} placeholder="e.g. 10000 (optional)" />
        </div>
        <div>
          <label className={labelCls}>Badge</label>
          <input className={inputCls} value={badge} onChange={(e) => setBadge(e.target.value)} placeholder="e.g. Bestseller, New, Sale" />
        </div>
        <div>
          <label className={labelCls}>Sizes (comma-separated)</label>
          <input className={inputCls} value={sizesRaw} onChange={(e) => setSizesRaw(e.target.value)} placeholder="XS, S, M, L, XL, XXL" />
        </div>
      </div>

      <div>
        <label className={labelCls}>Colors (format: Name:#hex, comma-separated)</label>
        <input className={inputCls} value={colorsRaw} onChange={(e) => setColorsRaw(e.target.value)} placeholder="Midnight Black:#0a0a0a, Ivory:#f5f0e8" />
      </div>

      <div>
        <label className={labelCls}>Image URLs (one per line)</label>
        <textarea
          className={`${inputCls} resize-none`}
          rows={3}
          value={imagesRaw}
          onChange={(e) => setImagesRaw(e.target.value)}
          placeholder="/images/product.webp"
        />
      </div>

      <div>
        <label className={labelCls}>Description</label>
        <textarea className={`${inputCls} resize-none`} rows={3} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Product description..." />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className={labelCls}>Fabric & Care</label>
          <textarea className={`${inputCls} resize-none`} rows={2} value={fabric} onChange={(e) => setFabric(e.target.value)} placeholder="100% Japanese Crepe..." />
        </div>
        <div>
          <label className={labelCls}>Size Guide</label>
          <textarea className={`${inputCls} resize-none`} rows={2} value={sizeGuide} onChange={(e) => setSizeGuide(e.target.value)} placeholder="Size S fits 36&quot; bust..." />
        </div>
      </div>

      <div className="flex items-center gap-3 pt-2">
        <button
          type="submit"
          disabled={saving}
          className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white text-sm font-semibold rounded-xl transition-colors"
        >
          {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
          {saving ? "Saving…" : initial?.id ? "Save Changes" : "Create Product"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-5 py-2.5 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────
export default function AdminProductsManager({ initialProducts }: AdminProductsManagerProps) {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Form states
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const refreshProducts = async () => {
    setLoading(true);
    try {
      const { products: fetched, error } = await getAdminProductsAction();
      if (error) { showToast(error, "error"); return; }
      if (fetched) setProducts(fetched as unknown as Product[]);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (payload: Record<string, unknown>) => {
    const result = await createProductAction(payload);
    if (result.error) return { error: result.error };
    showToast("Product created successfully.");
    setShowAddForm(false);
    await refreshProducts();
    return {};
  };

  const handleUpdate = async (payload: Record<string, unknown>) => {
    if (!editingProduct) return { error: "No product selected." };
    const result = await updateProductAction(editingProduct.id, payload);
    if (result.error) return { error: result.error };
    showToast("Product updated successfully.");
    setEditingProduct(null);
    await refreshProducts();
    return {};
  };

  const handleDelete = async (id: number) => {
    setDeletingId(id);
    const result = await deleteProductAction(id);
    setDeletingId(null);
    if (result.error) { showToast(result.error, "error"); return; }
    showToast("Product deleted.");
    setProducts((prev) => prev.filter((p) => p.id !== id));
  };

  const filteredProducts = useMemo(
    () =>
      products.filter((product) => {
        const term = searchTerm.trim().toLowerCase();
        if (!term) return true;
        return [product.title, product.subtitle, product.slug]
          .filter(Boolean)
          .some((v) => v.toLowerCase().includes(term));
      }),
    [products, searchTerm]
  );

  // If a form is open, show it full-page
  if (showAddForm || editingProduct) {
    const isEdit = !!editingProduct;
    return (
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{isEdit ? "Edit Product" : "Add New Product"}</h1>
            <p className="text-sm text-gray-500 mt-1">{isEdit ? `Editing: ${editingProduct.title}` : "Fill in the details to add a new product to your store."}</p>
          </div>
          <button
            onClick={() => { setShowAddForm(false); setEditingProduct(null); }}
            className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
          <ProductForm
            initial={isEdit ? editingProduct : null}
            onSave={isEdit ? handleUpdate : handleCreate}
            onCancel={() => { setShowAddForm(false); setEditingProduct(null); }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toast && (
        <div className={`fixed right-5 bottom-5 z-50 flex items-center gap-2 rounded-2xl px-4 py-3 text-sm font-semibold shadow-2xl ${
          toast.type === "success" ? "bg-emerald-50 text-emerald-900" : "bg-red-50 text-red-900"
        }`}>
          {toast.type === "success" ? <Check className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          {toast.message}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-[22px] font-bold text-gray-900">Products</h1>
          <p className="text-sm text-gray-500 mt-1">
            {products.length} product{products.length !== 1 ? "s" : ""} in your store — add, edit or delete directly here.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={refreshProducts}
            disabled={loading}
            className="h-10 px-4 rounded-xl border border-gray-200 text-gray-600 text-xs font-semibold flex items-center gap-2 hover:bg-gray-50 transition-colors disabled:opacity-50 shadow-sm"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
          <button
            onClick={() => { setEditingProduct(null); setShowAddForm(true); }}
            className="h-10 px-5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold flex items-center gap-2 transition-colors shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Product
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search products…"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all shadow-sm"
        />
      </div>

      {/* Grid */}
      {filteredProducts.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-2xl p-16 text-center shadow-sm">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Package className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-base font-bold text-gray-800 mb-1">No products found</h3>
          <p className="text-sm text-gray-500 mb-6">
            {searchTerm ? "Try adjusting your search." : "Your store has no products yet."}
          </p>
          {!searchTerm && (
            <button
              onClick={() => setShowAddForm(true)}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white text-sm font-semibold rounded-xl hover:bg-indigo-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Your First Product
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filteredProducts.map((product) => (
            <div
              key={product.id}
              className="bg-white rounded-2xl border border-gray-200 overflow-hidden group hover:shadow-md transition-shadow"
            >
              {/* Image */}
              <div className="aspect-[4/5] relative bg-gray-100">
                {product.images[0] ? (
                  <Image
                    src={product.images[0]}
                    alt={product.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <ImageIcon className="w-8 h-8 text-gray-300" />
                  </div>
                )}
                {product.badge && (
                  <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest text-gray-800">
                    {product.badge}
                  </div>
                )}
                {/* Hover actions */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                  <button
                    onClick={() => { setShowAddForm(false); setEditingProduct(product); }}
                    className="flex items-center gap-1.5 px-4 py-2 bg-white text-gray-900 rounded-full text-xs font-bold hover:bg-gray-100 transition-colors"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(product.id)}
                    disabled={deletingId === product.id}
                    className="flex items-center gap-1.5 px-4 py-2 bg-red-500 text-white rounded-full text-xs font-bold hover:bg-red-600 transition-colors disabled:opacity-60"
                  >
                    {deletingId === product.id ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                    Delete
                  </button>
                </div>
              </div>

              {/* Info */}
              <div className="p-4">
                <div className="flex items-start justify-between gap-3 mb-1.5">
                  <div className="min-w-0">
                    <h3 className="font-bold text-gray-900 text-sm truncate">{product.title}</h3>
                    <p className="text-xs text-gray-500 truncate mt-0.5">{product.subtitle || "No subtitle"}</p>
                  </div>
                  <span className="font-bold text-gray-900 text-sm shrink-0">{formatINR(product.price)}</span>
                </div>
                <div className="flex flex-wrap gap-1.5 mt-2">
                  <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-[10px] font-medium rounded-md">
                    {product.sizes.length} sizes
                  </span>
                  <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-[10px] font-medium rounded-md">
                    {product.colors.length} colors
                  </span>
                  {product.images.length > 1 && (
                    <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-[10px] font-medium rounded-md">
                      {product.images.length} images
                    </span>
                  )}
                </div>
                {/* Quick action row */}
                <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-100">
                  <button
                    onClick={() => { setShowAddForm(false); setEditingProduct(product); }}
                    className="flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs font-semibold text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                    Edit
                  </button>
                  <div className="w-px h-4 bg-gray-200" />
                  <button
                    onClick={() => handleDelete(product.id)}
                    disabled={deletingId === product.id}
                    className="flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs font-semibold text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                  >
                    {deletingId === product.id ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
