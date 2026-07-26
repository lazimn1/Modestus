"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { ShoppingCart, Package, CreditCard, Plus, Trash2, CheckCircle2, RefreshCw } from "lucide-react";
import { formatINR, products } from "@/lib/products";

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const supabase = createClient();

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const { data } = await supabase
        .from("orders")
        .select("*")
        .order("placed_at", { ascending: false });

      let merged: any[] = data || [];

      // Merge with any orders saved in browser local storage from guest checkouts
      if (typeof window !== "undefined") {
        try {
          const localRaw = window.localStorage.getItem("modestus-orders");
          if (localRaw) {
            const parsed = JSON.parse(localRaw);
            if (Array.isArray(parsed)) {
              const dbIds = new Set(merged.map((o) => o.id));
              for (const localOrd of parsed) {
                if (!dbIds.has(localOrd.id)) {
                  merged.push(localOrd);
                }
              }
            }
          }
        } catch (e) {
          console.error("Local storage read error:", e);
        }
      }

      // Sort descending by date
      merged.sort((a, b) => {
        const tA = new Date(a.placed_at || a.created_at || 0).getTime();
        const tB = new Date(b.placed_at || b.created_at || 0).getTime();
        return tB - tA;
      });

      setOrders(merged);
    } catch (err) {
      console.error("Failed to fetch orders:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [supabase]);

  // Functional Status Update
  const handleStatusChange = async (orderId: number, newStatus: string) => {
    setUpdatingId(orderId);
    try {
      // Update in Supabase
      await supabase.from("orders").update({ status: newStatus }).eq("id", orderId);

      // Update in Local Storage
      if (typeof window !== "undefined") {
        try {
          const localRaw = window.localStorage.getItem("modestus-orders");
          if (localRaw) {
            const parsed = JSON.parse(localRaw);
            if (Array.isArray(parsed)) {
              const updated = parsed.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o));
              window.localStorage.setItem("modestus-orders", JSON.stringify(updated));
            }
          }
        } catch (e) {
          // ignore
        }
      }

      // Update local React state
      setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o)));
    } catch (err) {
      console.error("Error updating status:", err);
    } finally {
      setUpdatingId(null);
    }
  };

  // Functional Order Deletion
  const handleDeleteOrder = async (orderId: number) => {
    if (!confirm(`Are you sure you want to delete order #${orderId}?`)) return;
    try {
      await supabase.from("orders").delete().eq("id", orderId);

      if (typeof window !== "undefined") {
        try {
          const localRaw = window.localStorage.getItem("modestus-orders");
          if (localRaw) {
            const parsed = JSON.parse(localRaw);
            if (Array.isArray(parsed)) {
              const filtered = parsed.filter((o) => o.id !== orderId);
              window.localStorage.setItem("modestus-orders", JSON.stringify(filtered));
            }
          }
        } catch (e) {
          // ignore
        }
      }

      setOrders((prev) => prev.filter((o) => o.id !== orderId));
    } catch (err) {
      console.error("Error deleting order:", err);
    }
  };

  // Functional: Create a genuine test order if database is empty so admin can test workflows
  const handleAddTestOrder = async () => {
    const randomProd = products[Math.floor(Math.random() * products.length)] || products[0];
    const testId = Math.floor(1000 + Math.random() * 9000);
    const newOrder = {
      id: testId,
      items: [{ title: randomProd.title, price: randomProd.price, quantity: 1 }],
      subtotal: randomProd.price,
      shipping: 0,
      total: randomProd.price,
      payment_method: "cod",
      status: "Processing",
      placed_at: new Date().toISOString(),
    };

    try {
      await supabase.from("orders").insert(newOrder);

      if (typeof window !== "undefined") {
        try {
          const localRaw = window.localStorage.getItem("modestus-orders") || "[]";
          const parsed = JSON.parse(localRaw);
          if (Array.isArray(parsed)) {
            parsed.unshift(newOrder);
            window.localStorage.setItem("modestus-orders", JSON.stringify(parsed));
          }
        } catch (e) {
          // ignore
        }
      }

      setOrders((prev) => [newOrder, ...prev]);
    } catch (err) {
      console.error("Failed to add test order:", err);
      // Even if Supabase insert fails due to RLS, add to local state
      setOrders((prev) => [newOrder, ...prev]);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-7 h-7 border-3 border-gray-200 border-t-indigo-600 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-[1100px] space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-[22px] font-bold text-gray-900">Customer Orders</h1>
          <p className="text-sm text-gray-500 mt-1">
            Review, update fulfillment status, and manage customer checkout submissions.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleAddTestOrder}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg transition-colors shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Test Order
          </button>
          <button
            onClick={fetchOrders}
            className="p-2 bg-white border border-gray-200 rounded-lg text-gray-600 hover:text-gray-900 transition-colors shadow-sm"
            title="Refresh orders"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-sm text-gray-600 font-medium shadow-sm">
            <ShoppingCart className="w-4 h-4 text-indigo-600" />
            {orders.length} Total Orders
          </div>
        </div>
      </div>

      {orders.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-2xl p-12 text-center">
          <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-gray-800">No orders yet</h3>
          <p className="text-sm text-gray-500 mt-1 max-w-sm mx-auto">
            When customers complete checkout, their orders will appear here in real time. Click &quot;Add Test Order&quot; above to generate a sample transaction.
          </p>
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-[11px] font-bold uppercase tracking-wider text-gray-500">
                  <th className="py-3.5 px-6">Order ID</th>
                  <th className="py-3.5 px-6">Placed At</th>
                  <th className="py-3.5 px-6">Items</th>
                  <th className="py-3.5 px-6">Payment Method</th>
                  <th className="py-3.5 px-6">Total Amount</th>
                  <th className="py-3.5 px-6">Fulfillment Status</th>
                  <th className="py-3.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm text-gray-700">
                {orders.map((order) => {
                  const itemsCount = (order.items || []).reduce(
                    (sum: number, item: any) => sum + (item.quantity || 1),
                    0
                  );
                  return (
                    <tr key={order.id} className="hover:bg-gray-50/60 transition-colors">
                      <td className="py-4 px-6 font-mono font-semibold text-gray-900">
                        #{order.id}
                      </td>
                      <td className="py-4 px-6 text-gray-600 text-xs">
                        {order.placed_at || order.created_at
                          ? new Date(order.placed_at || order.created_at).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })
                          : "—"}
                      </td>
                      <td className="py-4 px-6">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-gray-100 text-gray-800 text-xs font-medium">
                          <Package className="w-3.5 h-3.5 text-gray-500" />
                          {itemsCount} {itemsCount === 1 ? "item" : "items"}
                        </span>
                      </td>
                      <td className="py-4 px-6 capitalize text-gray-600 text-xs">
                        <span className="inline-flex items-center gap-1.5">
                          <CreditCard className="w-3.5 h-3.5 text-gray-400" />
                          {order.payment_method === "cod"
                            ? "Cash on Delivery"
                            : order.payment_method || "Online"}
                        </span>
                      </td>
                      <td className="py-4 px-6 font-bold text-gray-900">
                        {formatINR(order.total || order.subtotal || 0)}
                      </td>
                      <td className="py-4 px-6">
                        <select
                          value={order.status || "Confirmed"}
                          onChange={(e) => handleStatusChange(order.id, e.target.value)}
                          disabled={updatingId === order.id}
                          className={`text-xs font-semibold px-3 py-1.5 rounded-lg border focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all ${
                            order.status === "Delivered"
                              ? "bg-green-50 text-green-700 border-green-200"
                              : order.status === "Shipped"
                              ? "bg-blue-50 text-blue-700 border-blue-200"
                              : order.status === "Cancelled"
                              ? "bg-red-50 text-red-700 border-red-200"
                              : "bg-amber-50 text-amber-700 border-amber-200"
                          }`}
                        >
                          <option value="Confirmed">Confirmed</option>
                          <option value="Processing">Processing</option>
                          <option value="Shipped">Shipped</option>
                          <option value="Delivered">Delivered</option>
                          <option value="Cancelled">Cancelled</option>
                        </select>
                      </td>
                      <td className="py-4 px-6 text-right">
                        <button
                          onClick={() => handleDeleteOrder(order.id)}
                          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete order"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
