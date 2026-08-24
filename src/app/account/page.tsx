"use client";

import { useState, useTransition, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import {
  User, ShoppingBag, MapPin, Settings, LogOut,
  ChevronRight, Package, Loader2, Edit2, Trash2, Plus,
  CheckCircle2, AlertCircle
} from "lucide-react";
import { logoutAction, updateCustomerAction } from "@/app/actions/auth";
import { getOrdersAction } from "@/app/actions/orders";
import { formatINR } from "@/lib/products";

type Tab = "orders" | "addresses" | "profile";

function OrderStatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; class: string }> = {
    FULFILLED: { label: "Delivered", class: "bg-green-500/15 text-green-400 border-green-500/20" },
    PARTIALLY_FULFILLED: { label: "Partially Fulfilled", class: "bg-yellow-500/15 text-yellow-400 border-yellow-500/20" },
    UNFULFILLED: { label: "Processing", class: "bg-blue-500/15 text-blue-400 border-blue-500/20" },
    IN_PROGRESS: { label: "In Progress", class: "bg-blue-500/15 text-blue-400 border-blue-500/20" },
    ON_HOLD: { label: "On Hold", class: "bg-orange-500/15 text-orange-400 border-orange-500/20" },
    SCHEDULED: { label: "Scheduled", class: "bg-purple-500/15 text-purple-400 border-purple-500/20" },
  };
  const info = map[status] ?? { label: status, class: "bg-white/10 text-white/50 border-white/10" };
  return (
    <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full border ${info.class}`}>
      {info.label}
    </span>
  );
}

function AddressForm({
  initial,
  onSave,
  onCancel,
}: {
  initial?: any;
  onSave: (data: FormData) => Promise<void>;
  onCancel: () => void;
}) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    if (initial?.id) formData.set("id", initial.id);
    setError("");
    startTransition(async () => {
      try {
        await onSave(formData);
      } catch (err: any) {
        setError(err.message || "Failed to save address.");
      }
    });
  };

  const field = (name: string, label: string, placeholder: string, required = false, type = "text") => (
    <div>
      <label className="text-white/50 text-xs font-semibold uppercase tracking-wider block mb-1.5">
        {label}{required ? " *" : ""}
      </label>
      <input
        name={name}
        type={type}
        required={required}
        defaultValue={initial?.[name] ?? ""}
        placeholder={placeholder}
        className="w-full px-4 py-3 bg-white/[0.06] border border-white/[0.1] rounded-xl text-white text-sm placeholder-white/25 focus:outline-none focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/10 transition-all"
      />
    </div>
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-4 bg-white/[0.03] border border-white/[0.07] rounded-2xl p-5">
      {field("address1", "Street Address", "123 Main St", true)}
      {field("address2", "Apt / Suite", "Apt 4B")}
      <div className="grid grid-cols-2 gap-3">
        {field("city", "City", "London", true)}
        {field("zip", "Postal Code", "SW1A 1AA", true)}
      </div>
      <div className="grid grid-cols-2 gap-3">
        {field("province", "State / Province", "England")}
        {field("country", "Country", "United Kingdom", true)}
      </div>
      {field("phone", "Phone", "+44 7700 000000")}

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-red-400 text-sm flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {error}
        </div>
      )}

      <div className="flex gap-3 pt-1">
        <button
          type="submit"
          disabled={isPending}
          className="flex-1 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 text-white font-semibold text-sm py-3 rounded-xl flex items-center justify-center gap-2 transition-all"
        >
          {isPending ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</> : "Save Address"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-5 py-3 bg-white/[0.05] hover:bg-white/[0.1] text-white/60 font-medium text-sm rounded-xl transition-all border border-white/[0.08]"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

export default function AccountPage() {
  const router = useRouter();
  const { customer, isLoading, refreshCustomer } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>("orders");
  const [isSigningOut, startSignOut] = useTransition();
  const [profileSuccess, setProfileSuccess] = useState("");
  const [profileError, setProfileError] = useState("");
  const [isUpdatingProfile, startProfileUpdate] = useTransition();
  const [orders, setOrders] = useState<any[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(true);

  useEffect(() => {
    if (!customer) return;
    getOrdersAction().then(({ orders: data }) => {
      setOrders(data ?? []);
      setOrdersLoading(false);
    });
  }, [customer]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
      </div>
    );
  }

  if (!customer) {
    router.push("/login?redirect=/account");
    return null;
  }

  const handleSignOut = () => {
    startSignOut(async () => {
      await logoutAction();
      await refreshCustomer();
      router.push("/");
      router.refresh();
    });
  };

  const handleProfileSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setProfileError("");
    setProfileSuccess("");
    const formData = new FormData(e.currentTarget);

    startProfileUpdate(async () => {
      const result = await updateCustomerAction(null, formData);
      if (result.error) {
        setProfileError(result.error);
      } else if (result.success) {
        await refreshCustomer();
        setProfileSuccess("Profile updated successfully.");
        setTimeout(() => setProfileSuccess(""), 3000);
      }
    });
  };

  // Collect unique shipping addresses from past orders
  const addresses = Array.from(
    new Map(
      orders
        .filter((o) => o.shipping_address)
        .map((o) => [o.shipping_address.streetAddress + o.shipping_address.city, o.shipping_address])
    ).values()
  );

  const tabButton = (tab: Tab, icon: React.ReactNode, label: string) => (
    <button
      onClick={() => setActiveTab(tab)}
      className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
        activeTab === tab
          ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/20"
          : "text-white/50 hover:text-white hover:bg-white/[0.06]"
      }`}
    >
      {icon}
      <span className="hidden sm:inline">{label}</span>
    </button>
  );

  return (
    <div className="min-h-screen bg-[#0a0a0a] pt-24 pb-16 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xl font-bold shadow-lg shadow-indigo-500/20">
              {(customer.firstName?.[0] ?? customer.email[0]).toUpperCase()}
            </div>
            <div>
              <h1 className="text-white text-xl font-bold">
                {customer.firstName || customer.email.split("@")[0]}
                {customer.lastName ? ` ${customer.lastName}` : ""}
              </h1>
              <p className="text-white/40 text-sm">{customer.email}</p>
            </div>
          </div>
          <button
            onClick={handleSignOut}
            disabled={isSigningOut}
            className="flex items-center gap-2 px-4 py-2.5 text-white/40 hover:text-white hover:bg-white/[0.06] rounded-xl text-sm font-medium transition-all border border-white/[0.07]"
          >
            {isSigningOut ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogOut className="w-4 h-4" />}
            <span className="hidden sm:inline">Sign Out</span>
          </button>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-2 mb-6 bg-white/[0.03] border border-white/[0.07] rounded-2xl p-1.5">
          {tabButton("orders", <ShoppingBag className="w-4 h-4" />, "Orders")}
          {tabButton("addresses", <MapPin className="w-4 h-4" />, "Addresses")}
          {tabButton("profile", <Settings className="w-4 h-4" />, "Profile")}
        </div>

        {/* ── Orders Tab ── */}
        {activeTab === "orders" && (
          <div className="space-y-4">
            {ordersLoading ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="w-6 h-6 text-indigo-400 animate-spin" />
              </div>
            ) : orders.length === 0 ? (
              <div className="text-center py-20">
                <Package className="w-12 h-12 text-white/20 mx-auto mb-4" />
                <h3 className="text-white text-lg font-semibold mb-2">No orders yet</h3>
                <p className="text-white/40 text-sm mb-6">When you place an order, it will appear here.</p>
                <a
                  href="/shop"
                  className="inline-block bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm px-6 py-3 rounded-xl transition-all"
                >
                  Start Shopping
                </a>
              </div>
            ) : (
              orders.map((order) => {
                const date = new Date(order.placed_at).toLocaleDateString("en-GB", {
                  day: "numeric", month: "long", year: "numeric"
                });
                return (
                  <div key={order.id} className="bg-white/[0.03] border border-white/[0.07] rounded-2xl p-5 hover:border-white/[0.12] transition-all">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <div className="flex items-center gap-3 mb-1">
                          <p className="text-white font-bold font-mono">#{order.id}</p>
                          <OrderStatusBadge status={order.status} />
                        </div>
                        <p className="text-white/40 text-xs">{date}</p>
                      </div>
                      <p className="text-white font-bold">{formatINR(order.total)}</p>
                    </div>
                    <div className="space-y-2">
                      {(order.items || []).map((item: any, idx: number) => (
                        <div key={idx} className="flex items-center gap-3">
                          <div className="flex-1 min-w-0">
                            <p className="text-white/80 text-sm truncate">{item.title || item.name || `Item #${item.productId}`}</p>
                            <p className="text-white/40 text-xs">Qty: {item.quantity} {item.size ? `· ${item.size}` : ""} {item.color ? `· ${item.color}` : ""}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* ── Addresses Tab ── */}
        {activeTab === "addresses" && (
          <div className="space-y-4">
            <h2 className="text-white font-semibold mb-2">Shipping Addresses</h2>
            <p className="text-white/40 text-xs mb-4">Addresses used in your past orders appear here. You can set your delivery address at checkout.</p>
            {addresses.length === 0 ? (
              <div className="text-center py-16">
                <MapPin className="w-10 h-10 text-white/20 mx-auto mb-4" />
                <p className="text-white/40 text-sm">No saved addresses from past orders.</p>
              </div>
            ) : (
              addresses.map((addr: any, idx: number) => (
                <div key={idx} className="bg-white/[0.03] border border-white/[0.07] rounded-2xl p-5">
                  <p className="text-white font-semibold mb-1">{addr.fullName}</p>
                  <p className="text-white/60 text-sm">{addr.streetAddress}</p>
                  <p className="text-white/60 text-sm">{addr.city}{addr.state ? `, ${addr.state}` : ""} {addr.pincode}</p>
                  {addr.phone && <p className="text-white/40 text-sm mt-1">{addr.phone}</p>}
                </div>
              ))
            )}
          </div>
        )}

        {/* ── Profile Tab ── */}
        {activeTab === "profile" && (
          <div className="bg-white/[0.03] border border-white/[0.07] rounded-2xl p-6">
            <h2 className="text-white font-semibold mb-6">Personal Details</h2>
            <form onSubmit={handleProfileSubmit} className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="pFirstName" className="text-white/50 text-xs font-semibold uppercase tracking-wider block mb-1.5">First Name</label>
                  <input
                    id="pFirstName"
                    name="firstName"
                    type="text"
                    autoComplete="given-name"
                    defaultValue={customer.firstName ?? ""}
                    className="w-full px-4 py-3 bg-white/[0.06] border border-white/[0.1] rounded-xl text-white text-sm focus:outline-none focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/10 transition-all"
                  />
                </div>
                <div>
                  <label htmlFor="pLastName" className="text-white/50 text-xs font-semibold uppercase tracking-wider block mb-1.5">Last Name</label>
                  <input
                    id="pLastName"
                    name="lastName"
                    type="text"
                    autoComplete="family-name"
                    defaultValue={customer.lastName ?? ""}
                    className="w-full px-4 py-3 bg-white/[0.06] border border-white/[0.1] rounded-xl text-white text-sm focus:outline-none focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/10 transition-all"
                  />
                </div>
              </div>
              <div>
                <label className="text-white/50 text-xs font-semibold uppercase tracking-wider block mb-1.5">Email</label>
                <input
                  type="email"
                  value={customer.email}
                  disabled
                  className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.06] rounded-xl text-white/40 text-sm cursor-not-allowed"
                />
                <p className="text-white/30 text-xs mt-1.5">Email address cannot be changed here.</p>
              </div>


              {profileError && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-red-400 text-sm flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  {profileError}
                </div>
              )}
              {profileSuccess && (
                <div className="bg-green-500/10 border border-green-500/20 rounded-xl px-4 py-3 text-green-400 text-sm flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  {profileSuccess}
                </div>
              )}

              <button
                type="submit"
                disabled={isUpdatingProfile}
                className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 text-white font-semibold text-sm px-8 py-3 rounded-xl flex items-center gap-2 transition-all shadow-lg shadow-indigo-500/20"
              >
                {isUpdatingProfile ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</> : "Save Changes"}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
