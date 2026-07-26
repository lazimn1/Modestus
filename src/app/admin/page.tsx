"use client";

import { useEffect, useState } from "react";
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
import { createClient } from "@/utils/supabase/client";
import { products as defaultProducts } from "@/lib/products";

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
  const [products, setProducts] = useState<any[]>(defaultProducts);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedPeriod, setSelectedPeriod] = useState<string>("4 Weeks");
  const supabase = createClient();

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [{ data: ordersData }, { data: productsData }] = await Promise.all([
          supabase.from("orders").select("*"),
          supabase.from("products").select("*"),
        ]);

        if (productsData && productsData.length > 0) {
          setProducts(productsData);
        }

        // Use strictly original order data from Supabase and browser checkout storage
        let foundOrders: any[] = [];
        if (ordersData && ordersData.length > 0) {
          foundOrders = ordersData;
        } else if (typeof window !== "undefined") {
          try {
            const localRaw = window.localStorage.getItem("modestus-orders");
            if (localRaw) {
              const parsed = JSON.parse(localRaw);
              if (Array.isArray(parsed) && parsed.length > 0) foundOrders = parsed;
            }
          } catch {
            // ignore local storage parse errors
          }
        }

        setOrders(foundOrders);
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [supabase]);

  // Strictly calculate live metrics from original data without any simulation or fallback
  const totalRevenue = orders.reduce((sum, ord) => {
    const amount =
      ord.total !== undefined && ord.total !== null
        ? Number(ord.total)
        : ord.subtotal !== undefined && ord.subtotal !== null
        ? Number(ord.subtotal)
        : 0;
    return sum + (isNaN(amount) ? 0 : amount);
  }, 0);

  const totalOrders = orders.length;
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

  // Strictly compute actual chronological sales buckets from original orders
  const getChartBuckets = () => {
    const now = new Date();
    if (selectedPeriod === "7 Days") {
      const days: { label: string; value: number }[] = [];
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

        days.push({ label, value: dayRevenue });
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
        return { label, value: monthRevenue };
      });
    } else if (selectedPeriod === "5 Years") {
      const currentYear = now.getFullYear();
      const years: { label: string; value: number }[] = [];
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
        years.push({ label: String(y), value: yearRevenue });
      }
      return years;
    } else {
      // 4 Weeks (default)
      const weeks: { label: string; value: number }[] = [];
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
        weeks.push({ label, value: weekRevenue });
      }
      return weeks;
    }
  };

  const chartBuckets = getChartBuckets();
  const maxBucketVal = Math.max(...chartBuckets.map((b) => b.value), 1000);

  // Dynamic Y-axis labels scaled to actual maximum revenue in active period
  const yAxisLabels = [
    `₹${Math.round(maxBucketVal).toLocaleString("en-IN")}`,
    `₹${Math.round(maxBucketVal * 0.75).toLocaleString("en-IN")}`,
    `₹${Math.round(maxBucketVal * 0.5).toLocaleString("en-IN")}`,
    `₹${Math.round(maxBucketVal * 0.25).toLocaleString("en-IN")}`,
    "₹0",
  ];

  // Generate smooth cubic Bezier SVG path strictly from original data buckets
  const generateSvgCurves = () => {
    const numPoints = chartBuckets.length;
    const pts = chartBuckets.map((b, idx) => {
      const x = numPoints > 1 ? (idx / (numPoints - 1)) * 800 : 400;
      const y = 220 - (b.value / maxBucketVal) * 180;
      return { x, y, value: b.value };
    });

    if (pts.length === 0) return { linePath: "", areaPath: "", peak: { x: 400, y: 220 } };

    let linePath = `M${pts[0].x},${pts[0].y}`;
    for (let i = 1; i < pts.length; i++) {
      const prev = pts[i - 1];
      const curr = pts[i];
      const dx = (curr.x - prev.x) * 0.35;
      linePath += ` C${prev.x + dx},${prev.y} ${curr.x - dx},${curr.y} ${curr.x},${curr.y}`;
    }

    const lastX = pts[pts.length - 1].x;
    const firstX = pts[0].x;
    const areaPath = `${linePath} L${lastX},240 L${firstX},240 Z`;

    // Find highest peak point in original data for dot highlight
    let peak = pts[0];
    for (const p of pts) {
      if (p.value > peak.value) peak = p;
    }

    return { linePath, areaPath, peak };
  };

  const { linePath, areaPath, peak } = generateSvgCurves();

  return (
    <div className="space-y-8 max-w-[1200px]">
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
                className={`group relative overflow-hidden rounded-xl bg-gradient-to-br ${action.gradient} p-5 text-white transition-transform duration-200 hover:scale-[1.02] hover:shadow-lg`}
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
                className={`px-3 sm:px-4 py-[6px] rounded-md text-[12px] font-medium transition-all duration-200 shrink-0 ${
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

        {/* Chart Placeholder */}
        <div className="relative h-[280px] flex items-end gap-1 px-2">
          {/* Y-axis labels */}
          <div className="absolute left-0 top-0 bottom-8 flex flex-col justify-between text-[11px] text-gray-400 w-14">
            {yAxisLabels.map((label, idx) => (
              <span key={idx}>{label}</span>
            ))}
          </div>

          {/* Chart area */}
          <div className="ml-16 flex-1 relative h-full">
            {/* Grid lines */}
            <div className="absolute inset-0 flex flex-col justify-between">
              {[0, 1, 2, 3, 4].map((i) => (
                <div key={i} className="border-b border-dashed border-gray-100 w-full" />
              ))}
            </div>

            {/* SVG Chart Line */}
            <svg
              viewBox="0 0 800 240"
              className="absolute inset-0 w-full h-full"
              preserveAspectRatio="none"
            >
              <defs>
                <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#6366f1" />
                  <stop offset="100%" stopColor="#4f46e5" />
                </linearGradient>
                <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#6366f1" stopOpacity="0.15" />
                  <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
                </linearGradient>
              </defs>
              <path
                d={linePath}
                fill="none"
                stroke="url(#lineGradient)"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path d={areaPath} fill="url(#areaGradient)" />
              {/* Dot highlight on peak */}
              <circle cx={peak.x} cy={peak.y} r="6" fill="white" stroke="#6366f1" strokeWidth="3" />
            </svg>

            {/* X-axis labels */}
            <div className="absolute bottom-0 left-0 right-0 flex justify-between translate-y-6 text-[11px] text-gray-400">
              {chartBuckets.map((bucket, idx) => (
                <span key={idx}>{bucket.label}</span>
              ))}
            </div>
          </div>
        </div>

        <p className="text-center text-[12px] text-gray-400 mt-10">
          {totalOrders > 0
            ? `Showing real-time sales trend across ${totalOrders} processed order${totalOrders > 1 ? "s" : ""}.`
            : "Sales data will appear here once orders begin processing."}
        </p>
      </div>
    </div>
  );
}
