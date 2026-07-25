"use client";

import { useState, useMemo, useEffect } from "react";
import Image from "next/image";
import { createClient } from "@/utils/supabase/client";
import { Product } from "@/lib/products";
import { mapDbToProduct, mapProductToDb } from "@/lib/useProducts";
import ImageUploadWebP from "@/components/admin/ImageUploadWebP";
import {
  Plus,
  Search,
  SlidersHorizontal,
  Edit2,
  Copy,
  Trash2,
  X,
  Check,
  AlertCircle,
  RefreshCw,
  Image as ImageIcon,
  Palette,
  Ruler,
  FileText,
  Sparkles,
  Eye,
  ArrowUpDown,
  LayoutGrid,
  List,
  ExternalLink,
} from "lucide-react";
import Link from "next/link";

interface AdminProductsManagerProps {
  initialProducts: Product[];
}

const QUICK_IMAGE_PRESETS = [
  "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=900&q=80",
  "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=900&q=80",
  "https://images.unsplash.com/photo-1509631179647-0177331693ae?w=900&q=80",
  "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=900&q=80",
  "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=900&q=80",
  "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=900&q=80",
];

const STANDARD_SIZES = ["XS", "S", "M", "L", "XL", "XXL", "Free Size"];

export default function AdminProductsManager({ initialProducts }: AdminProductsManagerProps) {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [loading, setLoading] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedBadge, setSelectedBadge] = useState<string>("All");
  const [sortBy, setSortBy] = useState<string>("id-asc");
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");

  // Modal / Drawer state
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<"core" | "media" | "specs">("core");
  const [formState, setFormState] = useState<Partial<Product>>({});
  const [saving, setSaving] = useState<boolean>(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Temporary input states for lists inside the modal
  const [newImageUrl, setNewImageUrl] = useState<string>("");
  const [newColorName, setNewColorName] = useState<string>("");
  const [newColorHex, setNewColorHex] = useState<string>("#000000");
  const [newCustomSize, setNewCustomSize] = useState<string>("");

  const supabase = createClient();

  // Refresh products from Supabase
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

  // Filter and sort
  const filteredProducts = useMemo(() => {
    return products
      .filter((p) => {
        const matchesSearch =
          p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.subtitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.slug.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesBadge =
          selectedBadge === "All"
            ? true
            : selectedBadge === "No Badge"
            ? !p.badge
            : p.badge === selectedBadge;
        return matchesSearch && matchesBadge;
      })
      .sort((a, b) => {
        if (sortBy === "price-asc") return a.price - b.price;
        if (sortBy === "price-desc") return b.price - a.price;
        if (sortBy === "title-asc") return a.title.localeCompare(b.title);
        if (sortBy === "newest") return b.id - a.id;
        return a.id - b.id;
      });
  }, [products, searchTerm, selectedBadge, sortBy]);

  // Open modal for new product
  const handleOpenCreate = () => {
    setFormState({
      title: "",
      subtitle: "",
      slug: "",
      price: 5000,
      images: [QUICK_IMAGE_PRESETS[0]],
      colors: [
        { name: "Midnight Black", hex: "#0a0a0a" },
        { name: "Charcoal", hex: "#4a4a4a" },
      ],
      sizes: ["S", "M", "L", "XL"],
      rating: 4.9,
      reviewCount: 12,
      aspectClass: "aspect-[3/4]",
      description: "Crafted from signature Japanese crepe, this piece offers an uninterrupted silhouette designed for effortless elegance and movement.",
      fabric: "100% Japanese Crepe. Fully lined with breathable satin. Hand wash cold or dry clean recommended.",
      sizeGuide: "Our garments are tailored for a relaxed, commanding fit. True to size with modest proportions.",
      badge: "New",
    });
    setActiveTab("core");
    setIsModalOpen(true);
  };

  // Open modal for editing existing product
  const handleOpenEdit = (product: Product) => {
    setFormState({ ...product });
    setActiveTab("core");
    setIsModalOpen(true);
  };

  // Auto-generate slug from title if creating new or slug is empty
  const handleTitleChange = (val: string) => {
    const isNew = !formState.id;
    const updates: Partial<Product> = { title: val };
    if (isNew || !formState.slug) {
      updates.slug = val
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
    }
    setFormState((prev) => ({ ...prev, ...updates }));
  };

  // Save (Create or Update)
  const handleSave = async () => {
    if (!formState.title || !formState.price) {
      showToast("Title and Price are required", "error");
      return;
    }
    setSaving(true);
    try {
      const dbPayload = mapProductToDb(formState);
      
      // Ensure slug is present
      if (!dbPayload.slug && dbPayload.title) {
        dbPayload.slug = dbPayload.title
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)/g, "") || `product-${Date.now()}`;
      }

      // Ensure images array is not empty
      if (!dbPayload.images || !Array.isArray(dbPayload.images) || dbPayload.images.length === 0) {
        dbPayload.images = ["https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=900&q=80"];
      }

      if (formState.id) {
        // Update
        const { error } = await supabase
          .from("products")
          .update(dbPayload)
          .eq("id", formState.id);
        if (error) throw error;
        showToast("Product updated successfully!");
      } else {
        // Create - prevent slug collision
        const { data: existing } = await supabase
          .from("products")
          .select("id")
          .eq("slug", dbPayload.slug)
          .maybeSingle();

        if (existing) {
          dbPayload.slug = `${dbPayload.slug}-${Math.floor(1000 + Math.random() * 9000)}`;
        }

        const { error } = await supabase.from("products").insert([dbPayload]);
        if (error) throw error;
        showToast("New product published to catalog!");
      }
      setIsModalOpen(false);
      await refreshProducts();
    } catch (err: any) {
      console.error("Failed to save product:", err);
      const errorMsg = err?.message || err?.details || err?.hint || (typeof err === "string" ? err : "Failed to save product");
      showToast(errorMsg, "error");
    } finally {
      setSaving(false);
    }
  };

  // Delete product
  const handleDelete = async (id: number, title: string) => {
    if (!confirm(`Are you sure you want to delete "${title}"? This cannot be undone.`)) return;
    setDeletingId(id);
    try {
      const { error } = await supabase.from("products").delete().eq("id", id);
      if (error) throw error;
      showToast(`Deleted "${title}"`);
      await refreshProducts();
    } catch (err: any) {
      showToast(err.message || "Failed to delete", "error");
    } finally {
      setDeletingId(null);
    }
  };

  // Duplicate product
  const handleDuplicate = async (product: Product) => {
    try {
      const clone = { ...product };
      delete (clone as any).id;
      clone.title = `${clone.title} (Copy)`;
      clone.slug = `${clone.slug}-copy-${Math.floor(Math.random() * 1000)}`;
      const dbPayload = mapProductToDb(clone);
      const { error } = await supabase.from("products").insert([dbPayload]);
      if (error) throw error;
      showToast(`Cloned "${product.title}"`);
      await refreshProducts();
    } catch (err: any) {
      showToast(err.message || "Failed to clone product", "error");
    }
  };

  // Image helpers
  const addImage = (url: string) => {
    if (!url) return;
    setFormState((prev) => ({ ...prev, images: [...(prev.images || []), url] }));
    setNewImageUrl("");
  };

  const removeImage = (index: number) => {
    setFormState((prev) => ({
      ...prev,
      images: (prev.images || []).filter((_, i) => i !== index),
    }));
  };

  // Color helpers
  const addColor = () => {
    if (!newColorName) return;
    setFormState((prev) => ({
      ...prev,
      colors: [...(prev.colors || []), { name: newColorName, hex: newColorHex }],
    }));
    setNewColorName("");
  };

  const removeColor = (index: number) => {
    setFormState((prev) => ({
      ...prev,
      colors: (prev.colors || []).filter((_, i) => i !== index),
    }));
  };

  // Size helpers
  const toggleSize = (size: string) => {
    const current = formState.sizes || [];
    const exists = current.includes(size);
    if (exists) {
      setFormState((prev) => ({ ...prev, sizes: current.filter((s) => s !== size) }));
    } else {
      setFormState((prev) => ({ ...prev, sizes: [...current, size] }));
    }
  };

  const addCustomSize = () => {
    if (!newCustomSize) return;
    if (!(formState.sizes || []).includes(newCustomSize)) {
      setFormState((prev) => ({ ...prev, sizes: [...(prev.sizes || []), newCustomSize] }));
    }
    setNewCustomSize("");
  };

  // Stats calculation
  const totalProducts = products.length;
  const avgPrice = Math.round(products.reduce((acc, p) => acc + p.price, 0) / (totalProducts || 1));
  const bestsellersCount = products.filter((p) => p.badge?.toLowerCase() === "bestseller").length;

  return (
    <div className="space-y-8 pb-16 font-sans">
      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-xl shadow-xl text-sm font-medium transition-all transform animate-in fade-in slide-in-from-bottom-5 ${
            toast.type === "success" ? "bg-black text-white" : "bg-red-600 text-white"
          }`}
        >
          {toast.type === "success" ? <Check className="w-4 h-4 text-emerald-400" /> : <AlertCircle className="w-4 h-4" />}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Header & Stats Banner */}
      <div className="bg-gradient-to-r from-stone-900 to-neutral-800 rounded-2xl p-6 sm:p-8 text-white shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-white/10 text-amber-300 text-[11px] font-semibold tracking-wider uppercase mb-3">
              <Sparkles className="w-3.5 h-3.5" /> Catalog Management
            </div>
            <h1 className="font-serif text-3xl sm:text-4xl font-normal tracking-tight text-stone-100">
              Product Storefront Hub
            </h1>
            <p className="text-stone-400 text-sm mt-1.5 max-w-xl">
              Create, modify, and style your luxury silhouettes in real time. Changes synchronize instantly across all customer touchpoints.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={refreshProducts}
              disabled={loading}
              className="p-3 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-colors flex items-center justify-center border border-white/10"
              title="Refresh Catalog"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            </button>
            <button
              onClick={handleOpenCreate}
              className="bg-amber-100 hover:bg-white text-stone-950 px-5 py-3 rounded-xl text-sm font-semibold flex items-center gap-2 shadow-md hover:shadow-xl transition-all transform hover:-translate-y-0.5"
            >
              <Plus className="w-4 h-4" />
              Add New Product
            </button>
          </div>
        </div>

        {/* Quick KPI Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8 pt-6 border-t border-white/10">
          <div>
            <p className="text-stone-400 text-xs font-medium uppercase tracking-wider">Total Silhouettes</p>
            <p className="text-2xl font-serif font-bold text-white mt-1">{totalProducts}</p>
          </div>
          <div>
            <p className="text-stone-400 text-xs font-medium uppercase tracking-wider">Active Catalog</p>
            <p className="text-2xl font-serif font-bold text-emerald-400 mt-1">{totalProducts}</p>
          </div>
          <div>
            <p className="text-stone-400 text-xs font-medium uppercase tracking-wider">Average Price</p>
            <p className="text-2xl font-serif font-bold text-amber-200 mt-1">₹{avgPrice.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-stone-400 text-xs font-medium uppercase tracking-wider">Bestsellers</p>
            <p className="text-2xl font-serif font-bold text-white mt-1">{bestsellersCount}</p>
          </div>
        </div>
      </div>

      {/* Filter and View Controls */}
      <div className="bg-white border border-stone-200 rounded-xl p-4 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
          <input
            type="text"
            placeholder="Search by title, subtitle, or slug..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-stone-50 border border-stone-200 rounded-lg text-sm text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-stone-900 focus:bg-white transition-all"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Filters & View Toggles */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Badge Filter */}
          <select
            value={selectedBadge}
            onChange={(e) => setSelectedBadge(e.target.value)}
            className="bg-stone-50 border border-stone-200 text-stone-700 text-xs font-medium rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-stone-900"
          >
            <option value="All">All Badges</option>
            <option value="Bestseller">Bestseller</option>
            <option value="New">New</option>
            <option value="Limited">Limited</option>
            <option value="Exclusive">Exclusive</option>
            <option value="No Badge">No Badge</option>
          </select>

          {/* Sort */}
          <div className="flex items-center gap-1.5 bg-stone-50 border border-stone-200 rounded-lg px-2.5 py-1.5">
            <ArrowUpDown className="w-3.5 h-3.5 text-stone-400" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-transparent text-stone-700 text-xs font-medium focus:outline-none"
            >
              <option value="id-asc">Sort by ID</option>
              <option value="newest">Newest First</option>
              <option value="title-asc">Title: A-Z</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
            </select>
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center bg-stone-100 p-1 rounded-lg border border-stone-200">
            <button
              onClick={() => setViewMode("table")}
              className={`p-1.5 rounded-md transition-all ${
                viewMode === "table" ? "bg-white text-stone-900 shadow-sm" : "text-stone-500 hover:text-stone-900"
              }`}
              title="Table View"
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode("grid")}
              className={`p-1.5 rounded-md transition-all ${
                viewMode === "grid" ? "bg-white text-stone-900 shadow-sm" : "text-stone-500 hover:text-stone-900"
              }`}
              title="Grid View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Product Content Display */}
      {filteredProducts.length === 0 ? (
        <div className="bg-white border border-stone-200 rounded-2xl p-12 text-center max-w-xl mx-auto my-8">
          <div className="w-16 h-16 bg-stone-100 rounded-full flex items-center justify-center mx-auto mb-4 text-stone-400">
            <Search className="w-8 h-8" />
          </div>
          <h3 className="font-serif text-xl font-normal text-stone-900 mb-1">No silhouettes found</h3>
          <p className="text-stone-500 text-sm mb-6">
            We couldn't find any products matching your current search or filter criteria.
          </p>
          <button
            onClick={() => {
              setSearchTerm("");
              setSelectedBadge("All");
            }}
            className="px-4 py-2 bg-stone-900 text-white rounded-lg text-xs font-semibold hover:bg-stone-800 transition-colors"
          >
            Reset Filters
          </button>
        </div>
      ) : viewMode === "table" ? (
        /* ─── TABLE VIEW ─── */
        <div className="bg-white border border-stone-200 rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-stone-200">
              <thead className="bg-stone-50">
                <tr>
                  <th scope="col" className="px-6 py-3.5 text-left text-[11px] font-bold text-stone-500 uppercase tracking-wider">
                    Product
                  </th>
                  <th scope="col" className="px-6 py-3.5 text-left text-[11px] font-bold text-stone-500 uppercase tracking-wider">
                    Price
                  </th>
                  <th scope="col" className="px-6 py-3.5 text-left text-[11px] font-bold text-stone-500 uppercase tracking-wider">
                    Colors & Sizes
                  </th>
                  <th scope="col" className="px-6 py-3.5 text-left text-[11px] font-bold text-stone-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3.5 text-right text-[11px] font-bold text-stone-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-200 bg-white">
                {filteredProducts.map((product) => (
                  <tr key={product.id} className="hover:bg-stone-50/70 transition-colors group">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-4">
                        <div className="h-14 w-11 flex-shrink-0 bg-stone-100 rounded-lg relative overflow-hidden border border-stone-200 shadow-sm">
                          {product.images && product.images.length > 0 ? (
                            <Image src={product.images[0]} alt={product.title} fill className="object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-stone-300">
                              <ImageIcon className="w-5 h-5" />
                            </div>
                          )}
                          {product.badge && (
                            <span className="absolute top-1 left-1 bg-black/80 text-white text-[8px] font-bold px-1.5 py-0.5 rounded backdrop-blur-sm uppercase">
                              {product.badge}
                            </span>
                          )}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-stone-900 group-hover:text-amber-800 transition-colors">
                              {product.title}
                            </span>
                            <Link
                              href={`/shop/${product.slug}`}
                              target="_blank"
                              className="text-stone-400 hover:text-stone-800 transition-colors opacity-0 group-hover:opacity-100"
                              title="View on Storefront"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </Link>
                          </div>
                          <div className="text-xs text-stone-500 mt-0.5 max-w-xs truncate">{product.subtitle}</div>
                          <div className="text-[10px] font-mono text-stone-400 mt-1">/{product.slug}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-bold text-stone-900">₹{product.price.toLocaleString()}</div>
                      {product.originalPrice && (
                        <div className="text-xs text-stone-400 line-through">₹{product.originalPrice.toLocaleString()}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-1.5 mb-1.5">
                        {product.colors.map((c, idx) => (
                          <div
                            key={idx}
                            className="w-3.5 h-3.5 rounded-full border border-stone-300 shadow-xs"
                            style={{ backgroundColor: c.hex }}
                            title={c.name}
                          />
                        ))}
                      </div>
                      <div className="flex flex-wrap gap-1 max-w-[160px]">
                        {product.sizes.map((s) => (
                          <span key={s} className="px-1.5 py-0.5 bg-stone-100 text-stone-700 rounded text-[10px] font-medium font-mono">
                            {s}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2.5 py-1 inline-flex text-[11px] font-semibold rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                        Active
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleOpenEdit(product)}
                          className="p-1.5 text-stone-600 hover:text-stone-950 hover:bg-stone-100 rounded-lg transition-colors"
                          title="Edit Product"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDuplicate(product)}
                          className="p-1.5 text-stone-600 hover:text-stone-950 hover:bg-stone-100 rounded-lg transition-colors"
                          title="Duplicate Silhoutte"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(product.id, product.title)}
                          disabled={deletingId === product.id}
                          className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete Product"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* ─── GRID VIEW ─── */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <div
              key={product.id}
              className="bg-white border border-stone-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col group"
            >
              <div className="relative aspect-[3/4] bg-stone-100 overflow-hidden">
                {product.images && product.images.length > 0 ? (
                  <Image
                    src={product.images[0]}
                    alt={product.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-stone-300">
                    <ImageIcon className="w-8 h-8" />
                  </div>
                )}
                {product.badge && (
                  <span className="absolute top-3 left-3 bg-stone-950/90 text-white text-[9px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider backdrop-blur-sm">
                    {product.badge}
                  </span>
                )}
                <div className="absolute top-3 right-3 flex flex-col gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Link
                    href={`/shop/${product.slug}`}
                    target="_blank"
                    className="p-2 bg-white/90 hover:bg-white text-stone-900 rounded-full shadow-md transition-colors"
                    title="View on Storefront"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>

              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="text-[10px] font-mono font-medium text-stone-400">ID: #{product.id}</span>
                    <span className="text-xs font-bold text-stone-900">₹{product.price.toLocaleString()}</span>
                  </div>
                  <h3 className="font-serif text-lg text-stone-900 font-normal leading-snug">{product.title}</h3>
                  <p className="text-xs text-stone-500 mt-1 line-clamp-1">{product.subtitle}</p>

                  <div className="flex items-center gap-1.5 mt-3 pt-3 border-t border-stone-100">
                    {product.colors.map((c, idx) => (
                      <div
                        key={idx}
                        className="w-3.5 h-3.5 rounded-full border border-stone-300 shadow-xs"
                        style={{ backgroundColor: c.hex }}
                        title={c.name}
                      />
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 mt-4 border-t border-stone-100">
                  <button
                    onClick={() => handleOpenEdit(product)}
                    className="flex-1 bg-stone-100 hover:bg-stone-900 hover:text-white text-stone-800 text-xs font-semibold py-2 rounded-lg transition-colors flex items-center justify-center gap-1.5"
                  >
                    <Edit2 className="w-3.5 h-3.5" /> Edit
                  </button>
                  <div className="flex items-center gap-1 ml-2">
                    <button
                      onClick={() => handleDuplicate(product)}
                      className="p-2 text-stone-500 hover:text-stone-900 hover:bg-stone-100 rounded-lg transition-colors"
                      title="Duplicate"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(product.id, product.title)}
                      disabled={deletingId === product.id}
                      className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ─── PRODUCT EDITOR MODAL / DRAWER ─── */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-4xl h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
            {/* Modal Header */}
            <div className="px-6 py-5 border-b border-stone-200 flex items-center justify-between bg-stone-900 text-white">
              <div>
                <span className="text-[10px] font-mono tracking-widest text-amber-300 uppercase font-bold">
                  {formState.id ? `Editing ID #${formState.id}` : "New Silhouette Creation"}
                </span>
                <h2 className="font-serif text-2xl font-normal text-white mt-0.5">
                  {formState.title || "Untitled Product"}
                </h2>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 rounded-full hover:bg-white/10 text-stone-400 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Modal Navigation Tabs */}
            <div className="flex border-b border-stone-200 bg-stone-50 px-6">
              <button
                onClick={() => setActiveTab("core")}
                className={`py-3.5 px-5 text-xs font-bold uppercase tracking-wider border-b-2 transition-all flex items-center gap-2 ${
                  activeTab === "core"
                    ? "border-stone-900 text-stone-900 bg-white"
                    : "border-transparent text-stone-500 hover:text-stone-800"
                }`}
              >
                <FileText className="w-4 h-4" /> 1. General & Pricing
              </button>
              <button
                onClick={() => setActiveTab("media")}
                className={`py-3.5 px-5 text-xs font-bold uppercase tracking-wider border-b-2 transition-all flex items-center gap-2 ${
                  activeTab === "media"
                    ? "border-stone-900 text-stone-900 bg-white"
                    : "border-transparent text-stone-500 hover:text-stone-800"
                }`}
              >
                <ImageIcon className="w-4 h-4" /> 2. Media & Colors
              </button>
              <button
                onClick={() => setActiveTab("specs")}
                className={`py-3.5 px-5 text-xs font-bold uppercase tracking-wider border-b-2 transition-all flex items-center gap-2 ${
                  activeTab === "specs"
                    ? "border-stone-900 text-stone-900 bg-white"
                    : "border-transparent text-stone-500 hover:text-stone-800"
                }`}
              >
                <Ruler className="w-4 h-4" /> 3. Specs & Care
              </button>
            </div>

            {/* Modal Form Content */}
            <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6">
              {activeTab === "core" && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 animate-in fade-in duration-200">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-2">
                      Product Title *
                    </label>
                    <input
                      type="text"
                      value={formState.title || ""}
                      onChange={(e) => handleTitleChange(e.target.value)}
                      placeholder="e.g. Midnight Abaya"
                      className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-stone-900 font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-stone-900"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-2">
                      Subtitle / Tagline
                    </label>
                    <input
                      type="text"
                      value={formState.subtitle || ""}
                      onChange={(e) => setFormState({ ...formState, subtitle: e.target.value })}
                      placeholder="e.g. Relaxed Luxury Silhouette"
                      className="w-full px-4 py-2 bg-stone-50 border border-stone-200 rounded-xl text-stone-900 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-stone-900"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-2">
                      URL Slug (Auto-generated from title)
                    </label>
                    <div className="flex items-center bg-stone-100 border border-stone-200 rounded-xl px-3 overflow-hidden">
                      <span className="text-stone-400 text-xs font-mono">/shop/</span>
                      <input
                        type="text"
                        value={formState.slug || ""}
                        onChange={(e) => setFormState({ ...formState, slug: e.target.value })}
                        className="w-full py-2 bg-transparent text-stone-800 text-xs font-mono focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-2">
                      Price (₹ INR) *
                    </label>
                    <input
                      type="number"
                      value={formState.price || 0}
                      onChange={(e) => setFormState({ ...formState, price: Number(e.target.value) })}
                      className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-stone-900 font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-stone-900"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-2">
                      Original Price (₹ INR - Optional discount)
                    </label>
                    <input
                      type="number"
                      value={formState.originalPrice || ""}
                      onChange={(e) =>
                        setFormState({ ...formState, originalPrice: e.target.value ? Number(e.target.value) : undefined })
                      }
                      placeholder="e.g. 10000"
                      className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-stone-900 font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-stone-900"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-2">
                      Badge Label (Optional)
                    </label>
                    <select
                      value={formState.badge || ""}
                      onChange={(e) => setFormState({ ...formState, badge: e.target.value || undefined })}
                      className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-stone-900 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-stone-900"
                    >
                      <option value="">No Badge</option>
                      <option value="Bestseller">Bestseller</option>
                      <option value="New">New</option>
                      <option value="Limited">Limited</option>
                      <option value="Exclusive">Exclusive</option>
                      <option value="Must Have">Must Have</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-2">
                      Card Aspect Ratio
                    </label>
                    <select
                      value={formState.aspectClass || "aspect-[3/4]"}
                      onChange={(e) => setFormState({ ...formState, aspectClass: e.target.value })}
                      className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-stone-900 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-stone-900"
                    >
                      <option value="aspect-[3/4]">Portrait (3:4 Standard)</option>
                      <option value="aspect-square">Square (1:1 Aspect)</option>
                      <option value="aspect-[4/3]">Landscape (4:3 Wide)</option>
                    </select>
                  </div>
                </div>
              )}

              {activeTab === "media" && (
                <div className="space-y-8 animate-in fade-in duration-200">
                  {/* Image Management */}
                  <div className="bg-stone-50 border border-stone-200 rounded-2xl p-6">
                    <h3 className="text-xs font-bold text-stone-900 uppercase tracking-wider mb-3 flex items-center gap-2">
                      <ImageIcon className="w-4 h-4 text-stone-600" /> Product Gallery Images
                    </h3>

                    {/* Current Images */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                      {(formState.images || []).map((img, idx) => (
                        <div key={idx} className="relative group aspect-[3/4] bg-stone-200 rounded-xl overflow-hidden border border-stone-300 shadow-sm">
                          <Image src={img} alt={`Preview ${idx + 1}`} fill className="object-cover" />
                          <button
                            onClick={() => removeImage(idx)}
                            className="absolute top-2 right-2 bg-red-600/90 hover:bg-red-600 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-md"
                            title="Remove Image"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                          <span className="absolute bottom-2 left-2 bg-black/60 text-white text-[9px] font-bold px-1.5 py-0.5 rounded backdrop-blur-xs">
                            #{idx + 1}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* WebP Auto-Converting Uploader */}
                    <ImageUploadWebP
                      onUpload={(url) => addImage(url)}
                      multiple={true}
                      label="Upload Gallery Photos (Auto-converts PNG, JPG, GIF to WebP)"
                      buttonText="Drop or Select Product Images"
                      className="mt-2"
                    />
                  </div>

                  {/* Colors Management */}
                  <div className="bg-stone-50 border border-stone-200 rounded-2xl p-6">
                    <h3 className="text-xs font-bold text-stone-900 uppercase tracking-wider mb-3 flex items-center gap-2">
                      <Palette className="w-4 h-4 text-stone-600" /> Color Variations
                    </h3>

                    <div className="flex flex-wrap gap-2 mb-6">
                      {(formState.colors || []).map((col, idx) => (
                        <div
                          key={idx}
                          className="flex items-center gap-2 bg-white border border-stone-300 rounded-full pl-2 pr-3 py-1 shadow-xs"
                        >
                          <span className="w-4 h-4 rounded-full border border-stone-300" style={{ backgroundColor: col.hex }} />
                          <span className="text-xs font-semibold text-stone-800">{col.name}</span>
                          <button
                            onClick={() => removeColor(idx)}
                            className="text-stone-400 hover:text-red-600 ml-1 transition-colors"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>

                    {/* Add Color Input */}
                    <div className="flex flex-wrap sm:flex-nowrap items-center gap-2">
                      <div className="flex items-center gap-2 bg-white border border-stone-300 rounded-xl px-3 py-1.5">
                        <input
                          type="color"
                          value={newColorHex}
                          onChange={(e) => setNewColorHex(e.target.value)}
                          className="w-6 h-6 border-0 bg-transparent cursor-pointer"
                        />
                        <input
                          type="text"
                          value={newColorHex}
                          onChange={(e) => setNewColorHex(e.target.value)}
                          className="w-20 text-xs font-mono text-stone-700 bg-transparent focus:outline-none uppercase"
                        />
                      </div>
                      <input
                        type="text"
                        value={newColorName}
                        onChange={(e) => setNewColorName(e.target.value)}
                        placeholder="Color name (e.g. Midnight Navy)"
                        className="flex-1 px-4 py-2 bg-white border border-stone-300 rounded-xl text-xs text-stone-800 focus:outline-none focus:ring-2 focus:ring-stone-900"
                      />
                      <button
                        onClick={addColor}
                        className="bg-stone-900 hover:bg-stone-800 text-white px-5 py-2 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5"
                      >
                        <Plus className="w-4 h-4" /> Add Color
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "specs" && (
                <div className="space-y-6 animate-in fade-in duration-200">
                  {/* Sizes */}
                  <div className="bg-stone-50 border border-stone-200 rounded-2xl p-6">
                    <label className="block text-xs font-bold text-stone-900 uppercase tracking-wider mb-3 flex items-center gap-2">
                      <Ruler className="w-4 h-4 text-stone-600" /> Available Sizes (Click to toggle)
                    </label>

                    <div className="flex flex-wrap gap-2 mb-4">
                      {STANDARD_SIZES.map((size) => {
                        const isSelected = (formState.sizes || []).includes(size);
                        return (
                          <button
                            key={size}
                            onClick={() => toggleSize(size)}
                            className={`px-4 py-2 rounded-xl text-xs font-bold font-mono transition-all border ${
                              isSelected
                                ? "bg-stone-900 text-white border-stone-900 shadow-sm"
                                : "bg-white text-stone-600 border-stone-200 hover:border-stone-400"
                            }`}
                          >
                            {size} {isSelected && "✓"}
                          </button>
                        );
                      })}
                    </div>

                    {/* Custom size input */}
                    <div className="flex gap-2 max-w-sm">
                      <input
                        type="text"
                        value={newCustomSize}
                        onChange={(e) => setNewCustomSize(e.target.value)}
                        placeholder="Custom size tag..."
                        className="flex-1 px-3 py-1.5 bg-white border border-stone-300 rounded-lg text-xs font-mono focus:outline-none"
                      />
                      <button
                        onClick={addCustomSize}
                        className="bg-stone-800 text-white px-3 py-1.5 rounded-lg text-xs font-semibold"
                      >
                        Add Tag
                      </button>
                    </div>
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-2">
                      Detailed Silhouette Description
                    </label>
                    <textarea
                      rows={4}
                      value={formState.description || ""}
                      onChange={(e) => setFormState({ ...formState, description: e.target.value })}
                      className="w-full p-4 bg-stone-50 border border-stone-200 rounded-xl text-stone-800 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-stone-900"
                      placeholder="Write a rich, luxurious description of the silhouette, tailoring, and drape..."
                    />
                  </div>

                  {/* Fabric */}
                  <div>
                    <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-2">
                      Fabric Composition & Care Instructions
                    </label>
                    <textarea
                      rows={3}
                      value={formState.fabric || ""}
                      onChange={(e) => setFormState({ ...formState, fabric: e.target.value })}
                      className="w-full p-4 bg-stone-50 border border-stone-200 rounded-xl text-stone-800 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-stone-900"
                      placeholder="e.g. 100% Japanese Crepe. Fully lined. Hand wash cold or dry clean recommended..."
                    />
                  </div>

                  {/* Size Guide */}
                  <div>
                    <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-2">
                      Size Guide & Fit Proportions
                    </label>
                    <textarea
                      rows={3}
                      value={formState.sizeGuide || ""}
                      onChange={(e) => setFormState({ ...formState, sizeGuide: e.target.value })}
                      className="w-full p-4 bg-stone-50 border border-stone-200 rounded-xl text-stone-800 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-stone-900"
                      placeholder="e.g. Relaxed fit. Size S fits 36 inch bust. Total length approx 57 inches..."
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-stone-200 bg-stone-50 flex items-center justify-between">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-6 py-2.5 rounded-xl border border-stone-300 text-stone-700 font-semibold text-xs hover:bg-stone-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-8 py-2.5 rounded-xl bg-stone-900 hover:bg-black text-white font-semibold text-xs shadow-md hover:shadow-xl transition-all flex items-center gap-2 disabled:opacity-50"
              >
                {saving && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                {formState.id ? "Update Silhouette" : "Publish to Catalog"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
