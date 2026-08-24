"use client";

import { useCallback, useEffect, useState, useMemo } from "react";
import {
  ShoppingCart,
  Package,
  CreditCard,
  RefreshCw,
  Search,
  Eye,
  X,
  User,
  MapPin,
  Calendar,
  Mail,
  Phone,
} from "lucide-react";
import { formatINR, products } from "@/lib/products";
import { getAdminOrdersAction, updateOrderStatusAction } from "@/app/actions/admin";

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("All");
  const [inspectOrder, setInspectOrder] = useState<any | null>(null);
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const { orders: data, error } = await getAdminOrdersAction();
      if (error) console.error("Failed to fetch orders:", error);
      setOrders(data ?? []);
    } catch (err) {
      console.error("Failed to fetch orders:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ message, type });
    window.setTimeout(() => setToast(null), 3500);
  };

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleStatusChange = async (orderId: string | number, newStatus: string) => {
    setUpdatingId(orderId);
    try {
      const { error } = await updateOrderStatusAction(String(orderId), newStatus);
      if (error) {
        showToast(error, "error");
        return;
      }
      // Optimistically update local state
      setOrders((prev) =>
        prev.map((o) => (String(o.id) === String(orderId) ? { ...o, status: newStatus } : o))
      );
      if (inspectOrder && String(inspectOrder.id) === String(orderId)) {
        setInspectOrder((prev: any) => ({ ...prev, status: newStatus }));
      }
      showToast("Order status updated successfully.", "success");
    } catch (err: any) {
      console.error("Error updating status:", err);
      showToast(err?.message || "Failed to update order status.", "error");
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const matchesStatus = selectedStatus === "All" || order.status === selectedStatus;
      if (!matchesStatus) return false;

      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      const idStr = String(order.id || "").toLowerCase();
      const customerStr = (order.customer_name || order.shipping_address?.fullName || order.user_id || "").toLowerCase();
      const itemsStr = (order.items || [])
        .map((i: any) => (i.title || i.name || "").toLowerCase())
        .join(" ");

      return idStr.includes(q) || customerStr.includes(q) || itemsStr.includes(q);
    });
  }, [orders, selectedStatus, searchQuery]);

  const getItemName = (item: any) => {
    if (item.title || item.name) return item.title || item.name;
    if (item.productId) {
      const found = products.find((p) => p.id === Number(item.productId));
      if (found) return found.title;
    }
    return "Luxury Silhouette";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-7 h-7 border-[3px] border-gray-200 border-t-indigo-600 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-[1200px] space-y-6">
      {toast && (
        <div
          className={`fixed right-5 bottom-5 z-50 rounded-2xl px-4 py-3 text-sm font-semibold shadow-2xl transition-all ${
            toast.type === "success" ? "bg-emerald-50 text-emerald-900" : "bg-red-50 text-red-900"
          }`}
        >
          {toast.message}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-[22px] font-bold text-gray-900">Customer Orders</h1>
          <p className="text-sm text-gray-500 mt-1">
            Review checkout submissions, inspect customer items, and update fulfillment status.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchOrders}
            className="p-2.5 bg-white border border-gray-200 rounded-lg text-gray-600 hover:text-gray-900 transition-colors shadow-sm flex items-center gap-2 text-xs font-semibold"
            title="Refresh orders"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Sync Orders
          </button>
          <div className="flex items-center gap-2 px-3.5 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 font-bold shadow-sm">
            <ShoppingCart className="w-4 h-4 text-indigo-600" />
            {orders.length} Total {orders.length === 1 ? "Order" : "Orders"}
          </div>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
        <div className="flex flex-wrap gap-1.5 overflow-x-auto">
          {["All", "Confirmed", "Processing", "Shipped", "Delivered", "Cancelled"].map((status) => {
            const count = status === "All" ? orders.length : orders.filter((o) => o.status === status).length;
            return (
              <button
                key={status}
                onClick={() => setSelectedStatus(status)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                  selectedStatus === status
                    ? "bg-gray-900 text-white shadow-sm"
                    : "bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-100"
                }`}
              >
                {status}
                <span
                  className={`px-1.5 py-0.5 rounded-full text-[10px] ${
                    selectedStatus === status ? "bg-white/20 text-white" : "bg-gray-200 text-gray-700"
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        <div className="relative min-w-[260px]">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search order ID, item, or customer..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs font-medium text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:bg-white transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs font-bold"
            >
              ×
            </button>
          )}
        </div>
      </div>

      {/* Orders Table */}
      {filteredOrders.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-2xl p-12 text-center shadow-sm">
          <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-gray-800">No matching orders found</h3>
          <p className="text-sm text-gray-500 mt-1 max-w-sm mx-auto">
            {orders.length === 0
              ? "When customers place checkouts on the storefront, their orders will populate here in real time."
              : "Try adjusting your search query or status filter to see other orders."}
          </p>
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-[11px] font-bold uppercase tracking-wider text-gray-500">
                  <th className="py-3.5 px-6">Order ID</th>
                  <th className="py-3.5 px-6">Customer & Date</th>
                  <th className="py-3.5 px-6">Items Purchased</th>
                  <th className="py-3.5 px-6">Payment</th>
                  <th className="py-3.5 px-6">Total Amount</th>
                  <th className="py-3.5 px-6">Status</th>
                  <th className="py-3.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm text-gray-700">
                {filteredOrders.map((order) => {
                  const itemsList = order.items || [];
                  const itemsCount = itemsList.reduce((sum: number, item: any) => sum + (item.quantity || 1), 0);
                  const firstItemName = itemsList[0] ? getItemName(itemsList[0]) : "Luxury Item";
                  const orderDate = order.placed_at || order.created_at;
                  const shippingAddr = order.shipping_address;
                  const customerName = order.customer_name || shippingAddr?.fullName || "Guest Customer";
                  const customerEmail = order.email || shippingAddr?.email;
                  const customerPhone = order.phone || shippingAddr?.phone;

                  return (
                    <tr key={order.id} className="hover:bg-gray-50/60 transition-colors">
                      <td className="py-4 px-6 font-mono font-bold text-gray-900 text-xs">
                        #{order.id}
                      </td>
                      <td className="py-4 px-6">
                        <div className="font-semibold text-gray-900 text-xs flex items-center gap-1.5">
                          <User className="w-3 h-3 text-gray-400 shrink-0" />
                          {customerName}
                        </div>
                        {customerEmail && (
                          <div className="text-[11px] text-gray-600 mt-0.5 flex items-center gap-1">
                            <Mail className="w-3 h-3 text-gray-400 shrink-0" />
                            {customerEmail}
                          </div>
                        )}
                        {customerPhone && (
                          <div className="text-[11px] text-gray-500 mt-0.5 flex items-center gap-1">
                            <Phone className="w-3 h-3 text-gray-400 shrink-0" />
                            {customerPhone}
                          </div>
                        )}
                        <div className="text-[11px] text-gray-400 mt-0.5 flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-gray-400 shrink-0" />
                          {orderDate
                            ? new Date(orderDate).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              })
                            : "Recent"}
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="text-xs font-medium text-gray-800 line-clamp-1 max-w-[220px]">
                          {firstItemName}
                        </div>
                        <div className="text-[11px] text-indigo-600 font-semibold mt-0.5">
                          {itemsCount} {itemsCount === 1 ? "item total" : "items total"}
                        </div>
                      </td>
                      <td className="py-4 px-6 capitalize text-gray-600 text-xs font-medium">
                        <span className="inline-flex items-center gap-1.5">
                          <CreditCard className="w-3.5 h-3.5 text-gray-400" />
                          {order.payment_method === "cod" ? "Cash on Delivery" : "Online Payment"}
                        </span>
                      </td>
                      <td className="py-4 px-6 font-bold text-gray-900 text-sm">
                        {formatINR(order.total || order.subtotal || 0)}
                      </td>
                      <td className="py-4 px-6">
                        <select
                          value={order.status || "Confirmed"}
                          onChange={(e) => handleStatusChange(order.id, e.target.value)}
                          disabled={updatingId === order.id}
                          className={`text-xs font-semibold px-3 py-1.5 rounded-lg border focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all disabled:opacity-60 ${
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
                          onClick={() => setInspectOrder(order)}
                          className="p-1.5 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                          title="Inspect Order Details"
                        >
                          <Eye className="w-4 h-4" />
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

      {/* Order Inspection Modal */}
      {inspectOrder && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-100 p-6 space-y-6">
            <div className="flex items-start justify-between border-b border-gray-100 pb-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded-full">
                  Order Inspection
                </span>
                <h3 className="text-xl font-bold text-gray-900 mt-1 font-mono">
                  #{inspectOrder.id}
                </h3>
              </div>
              <button
                onClick={() => setInspectOrder(null)}
                className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Customer & Shipping Summary */}
            <div className="bg-gray-50 rounded-xl p-4 space-y-3 border border-gray-100">
              <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-indigo-600" />
                Customer & Shipping Details
              </h4>
              <div className="text-xs space-y-2 text-gray-700">
                <div className="flex items-center gap-2 font-bold text-gray-900 text-sm">
                  <User className="w-4 h-4 text-indigo-600 shrink-0" />
                  {inspectOrder.customer_name || inspectOrder.shipping_address?.fullName || "Guest Customer"}
                </div>
                {(inspectOrder.email || inspectOrder.shipping_address?.email) && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <Mail className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                    {inspectOrder.email || inspectOrder.shipping_address?.email}
                  </div>
                )}
                {(inspectOrder.phone || inspectOrder.shipping_address?.phone) && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <Phone className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                    {inspectOrder.phone || inspectOrder.shipping_address?.phone}
                  </div>
                )}
                {inspectOrder.shipping_address ? (
                  <div className="pt-2 border-t border-gray-200/60 mt-2 text-gray-600 space-y-0.5">
                    <p className="font-semibold text-gray-800">Delivery Address:</p>
                    <p>{inspectOrder.shipping_address.streetAddress || inspectOrder.shipping_address.street}</p>
                    <p>
                      {inspectOrder.shipping_address.city},{" "}
                      {inspectOrder.shipping_address.state}{" "}
                      {inspectOrder.shipping_address.pincode || inspectOrder.shipping_address.zip}
                    </p>
                  </div>
                ) : (
                  <p className="text-gray-500 italic pt-1">Standard delivery address / COD checkout</p>
                )}
              </div>
            </div>

            {/* Items List */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 flex items-center gap-1.5">
                <Package className="w-3.5 h-3.5 text-indigo-600" />
                Purchased Silhouettes ({(inspectOrder.items || []).length})
              </h4>
              <div className="divide-y divide-gray-100 border border-gray-100 rounded-xl overflow-hidden">
                {(inspectOrder.items || []).map((item: any, idx: number) => (
                  <div key={idx} className="p-3 bg-white flex items-center justify-between text-xs">
                    <div className="space-y-0.5 pr-4">
                      <p className="font-bold text-gray-900">{getItemName(item)}</p>
                      <div className="flex items-center gap-2 text-[11px] text-gray-500">
                        {item.size && <span>Size: <strong className="text-gray-700">{item.size}</strong></span>}
                        {item.color && <span>Color: <strong className="text-gray-700">{item.color}</strong></span>}
                        <span>Qty: <strong className="text-gray-700">{item.quantity || 1}</strong></span>
                      </div>
                    </div>
                    <div className="font-bold text-gray-900 text-right shrink-0">
                      {formatINR((item.price || 0) * (item.quantity || 1))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Financial Summary */}
            <div className="border-t border-gray-100 pt-4 space-y-2 text-xs">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span>{formatINR(inspectOrder.subtotal || 0)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Shipping Fee</span>
                <span>{inspectOrder.shipping ? formatINR(inspectOrder.shipping) : "Free"}</span>
              </div>
              <div className="flex justify-between text-sm font-bold text-gray-900 pt-2 border-t border-gray-100">
                <span>Total Amount</span>
                <span className="text-indigo-600">{formatINR(inspectOrder.total || inspectOrder.subtotal || 0)}</span>
              </div>
            </div>

            {/* Status Selector in Modal */}
            <div className="bg-indigo-50/50 rounded-xl p-4 border border-indigo-100 flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-bold text-gray-900">Fulfillment Status</p>
                <p className="text-[11px] text-gray-500">Update order progress</p>
              </div>
              <select
                value={inspectOrder.status || "Confirmed"}
                onChange={(e) => handleStatusChange(inspectOrder.id, e.target.value)}
                disabled={updatingId === inspectOrder.id}
                className="text-xs font-bold px-3 py-2 rounded-lg border border-gray-200 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 disabled:opacity-60"
              >
                <option value="Confirmed">Confirmed</option>
                <option value="Processing">Processing</option>
                <option value="Shipped">Shipped</option>
                <option value="Delivered">Delivered</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
