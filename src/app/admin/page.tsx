"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  IndianRupee,
  ClipboardList,
  TrendingUp,
  AlertCircle,
  MessageSquare,
  Package,
  ShoppingCart,
  Palette,
} from "lucide-react";
import { getAdminOrdersAction, getAdminProductsAction } from "@/app/actions/admin";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const quickActions = [
  {
    label: "Reviews",
    description: "Manage customer reviews and feedback",
    href: "/admin/reviews",
    icon: MessageSquare,
    gradient: "from-emerald-400 to-teal-500",
  },
  {
    label: "Products",
    description: "Add, edit or remove products",
    href: "/admin/products",
    icon: Package,
    gradient: "from-blue-400 to-indigo-500",
  },
  {
    label: "Orders",
    description: "View and manage customer orders",
    href: "/admin/orders",
    icon: ShoppingCart,
    gradient: "from-orange-400 to-red-500",
  },
  {
    label: "Site Content",
    description: "Collections, lookbook & banners",
    href: "/admin/content",
    icon: Palette,
    gradient: "from-pink-400 to-rose-500",
  },
];

export default function AdminDashboard() {
  const [orders, setOrders] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedPeriod, setSelectedPeriod] = useState<string>("7 Days");

  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    try {
      const [{ products: dbProducts }, { orders: dbOrders }] = await Promise.all([
        getAdminProductsAction(),
        getAdminOrdersAction(),
      ]);

      if (dbProducts) {
        setProducts(dbProducts);
      } else {
        setProducts([]);
      }

      setOrders(dbOrders || []);
    } catch (err) {
      console.error("Error fetching dashboard data:", err);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    queueMicrotask(() => {
      fetchDashboardData();
    });
  }, [fetchDashboardData]);

  useEffect(() => {
    const handleExternalUpdate = () => {
      fetchDashboardData();
    };

    if (typeof window !== "undefined") {
      window.addEventListener("storage", handleExternalUpdate);
      window.addEventListener("modestus-commerce-change", handleExternalUpdate);
    }

    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener("storage", handleExternalUpdate);
        window.removeEventListener("modestus-commerce-change", handleExternalUpdate);
      }
    };
  }, [fetchDashboardData]);

  // Strictly compute actual chronological sales buckets from original orders
  const getChartBuckets = () => {
    const now = new Date();
    if (selectedPeriod === "7 Days") {
      const days: { label: string; value: number; ordersCount: number }[] = [];
      for (let i = 6; i >= 0; i--) {
        const d = new Date(now);
        d.setDate(now.getDate() - i);
        const label = d.toLocaleDateString("en-US", { weekday: "short" });
        const dayStr = d.toISOString().split("T")[0];

        const dayOrders = orders.filter((ord) => {
          const ordDate = ord.placed_at || ord.created_at;
          return ordDate && ordDate.startsWith(dayStr);
        });

        const dayRevenue = dayOrders.reduce((sum, ord) => {
          const amt =
            ord.total !== undefined && ord.total !== null
              ? Number(ord.total)
              : ord.subtotal !== undefined && ord.subtotal !== null
              ? Number(ord.subtotal)
              : 0;
          return sum + (isNaN(amt) ? 0 : amt);
        }, 0);

        days.push({ label, value: dayRevenue, ordersCount: dayOrders.length });
      }
      return days;
    } else if (selectedPeriod === "12 Months") {
      const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      return months.map((label, idx) => {
        const monthOrders = orders.filter((ord) => {
          const ordDate = ord.placed_at || ord.created_at;
          return ordDate && new Date(ordDate).getMonth() === idx;
        });
        const monthRevenue = monthOrders.reduce((sum, ord) => {
          const amt =
            ord.total !== undefined && ord.total !== null
              ? Number(ord.total)
              : ord.subtotal !== undefined && ord.subtotal !== null
              ? Number(ord.subtotal)
              : 0;
          return sum + (isNaN(amt) ? 0 : amt);
        }, 0);
        return { label, value: monthRevenue, ordersCount: monthOrders.length };
      });
    } else if (selectedPeriod === "5 Years") {
      const currentYear = now.getFullYear();
      const years: { label: string; value: number; ordersCount: number }[] = [];
      for (let y = currentYear - 3; y <= currentYear; y++) {
        const yearOrders = orders.filter((ord) => {
          const ordDate = ord.placed_at || ord.created_at;
          return ordDate && new Date(ordDate).getFullYear() === y;
        });
        const yearRevenue = yearOrders.reduce((sum, ord) => {
          const amt =
            ord.total !== undefined && ord.total !== null
              ? Number(ord.total)
              : ord.subtotal !== undefined && ord.subtotal !== null
              ? Number(ord.subtotal)
              : 0;
          return sum + (isNaN(amt) ? 0 : amt);
        }, 0);
        years.push({ label: String(y), value: yearRevenue, ordersCount: yearOrders.length });
      }
      return years;
    } else {
      // 4 Weeks (default)
      const weeks: { label: string; value: number; ordersCount: number }[] = [];
      for (let i = 3; i >= 0; i--) {
        const label = `Week ${4 - i}`;
        const weekOrders = orders.filter((ord) => {
          const ordDate = ord.placed_at || ord.created_at;
          if (!ordDate) return false;
          const diffDays = Math.floor((now.getTime() - new Date(ordDate).getTime()) / (1000 * 3600 * 24));
          return diffDays >= i * 7 && diffDays < (i + 1) * 7;
        });
        const weekRevenue = weekOrders.reduce((sum, ord) => {
          const amt =
            ord.total !== undefined && ord.total !== null
              ? Number(ord.total)
              : ord.subtotal !== undefined && ord.subtotal !== null
              ? Number(ord.subtotal)
              : 0;
          return sum + (isNaN(amt) ? 0 : amt);
        }, 0);
        weeks.push({ label, value: weekRevenue, ordersCount: weekOrders.length });
      }
      return weeks;
    }
  };

  const chartBuckets = getChartBuckets();
  
  // Now strictly calculate live metrics from the active chart buckets to ensure 100% synchronization
  const totalRevenue = chartBuckets.reduce((sum, b) => sum + b.value, 0);
  const totalOrders = chartBuckets.reduce((sum, b) => sum + b.ordersCount, 0);
  const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

  const outOfStockItems = products.filter(
    (p) => p.in_stock === false || p.stock === 0 || p.quantity === 0
  ).length;

  const statCards = [
    {
      label: "Total Revenue",
      value: `₹${totalRevenue.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      icon: IndianRupee,
      iconBg: "bg-green-50",
      iconColor: "text-green-500",
    },
    {
      label: "Total Orders",
      value: `${totalOrders}`,
      icon: ClipboardList,
      iconBg: "bg-blue-50",
      iconColor: "text-blue-500",
    },
    {
      label: "Average Order Value",
      value: `₹${averageOrderValue.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      icon: TrendingUp,
      iconBg: "bg-emerald-50",
      iconColor: "text-emerald-500",
    },
    {
      label: "Out of Stock Items",
      value: `${outOfStockItems}`,
      icon: AlertCircle,
      iconBg: "bg-red-50",
      iconColor: "text-red-500",
    },
  ];




  return (
    <div className="space-y-8 max-w-300">
      {/* Page Title */}
      <h1 className="text-[26px] font-bold text-gray-900">Overview Dashboard</h1>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.label}
              className="bg-white rounded-xl border border-gray-100 p-5 flex items-center justify-between shadow-sm hover:shadow-md transition-shadow duration-200"
            >
              <div>
                <p className="text-[13px] text-gray-500 font-medium">{card.label}</p>
                <p className="text-[24px] font-bold text-gray-900 mt-1 leading-tight">
                  {loading ? "..." : card.value}
                </p>
              </div>
              <div className={`w-10 h-10 rounded-xl ${card.iconBg} flex items-center justify-center`}>
                <Icon className={`w-5 h-5 ${card.iconColor}`} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
        <h2 className="text-[18px] font-bold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <Link
                key={action.label}
                href={action.href}
                className={`group relative overflow-hidden rounded-xl bg-linear-to-br ${action.gradient} p-5 text-white transition-transform duration-200 hover:scale-[1.02] hover:shadow-lg`}
              >
                <Icon className="w-6 h-6 mb-3 opacity-90" />
                <p className="text-[14px] font-bold leading-tight">{action.label}</p>
                <p className="text-[12px] opacity-80 mt-1">{action.description}</p>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Sales Trend */}
      <div className="bg-white rounded-xl border border-gray-100 p-4 sm:p-6 shadow-sm overflow-hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-3">
          <h2 className="text-[18px] font-bold text-gray-900">Sales Trend</h2>
          <div className="flex flex-wrap bg-gray-50 rounded-lg p-1 border border-gray-100 max-w-full overflow-x-auto">
            {["7 Days", "4 Weeks", "12 Months", "5 Years"].map((period) => (
              <button
                key={period}
                onClick={() => setSelectedPeriod(period)}
                className={`px-3 sm:px-4 py-1.5 rounded-md text-[12px] font-medium transition-all duration-200 shrink-0 ${
                  selectedPeriod === period
                    ? "bg-white text-gray-900 shadow-sm border border-gray-200"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                {period}
              </button>
            ))}
          </div>
        </div>

        <div className="h-[340px] w-full mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartBuckets} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
              <XAxis 
                dataKey="label" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 12, fill: '#9ca3af' }} 
                dy={10} 
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 12, fill: '#9ca3af' }}
                tickFormatter={(val) => `₹${val.toLocaleString('en-IN')}`}
                dx={-10}
              />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="bg-[#1e1b4b] text-white p-3 rounded-xl shadow-lg border border-indigo-900/50">
                        <p className="text-xs font-semibold text-indigo-200 mb-1">{label}</p>
                        <p className="text-lg font-bold">
                          ₹{Number(payload[0].value).toLocaleString("en-IN")}
                        </p>
                        <p className="text-xs text-indigo-300 mt-1">
                          {payload[0].payload.ordersCount} order{payload[0].payload.ordersCount !== 1 ? "s" : ""}
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Area 
                type="monotone" 
                dataKey="value" 
                stroke="#6366f1" 
                strokeWidth={3}
                fillOpacity={1} 
                fill="url(#colorValue)" 
                activeDot={{ r: 6, strokeWidth: 0, fill: '#6366f1' }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <p className="text-center text-[12px] text-gray-400 mt-4">
          {totalOrders > 0
            ? `Showing accurate sales trend across ${totalOrders} recorded order${totalOrders > 1 ? "s" : ""}.`
            : "No sales recorded yet. Complete a checkout or add a test order from the Orders page to see the graph populate."}
        </p>
      </div>
    </div>
  );
}
