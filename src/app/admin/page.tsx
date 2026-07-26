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

        // Merge orders from Supabase with orders in browser checkout storage
        let merged: any[] = ordersData || [];
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
          } catch {
            // ignore local storage parse errors
          }
        }

        setOrders(merged);
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [supabase]);

  // Strictly calculate live metrics from genuine order records
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

        {/* Accurate SVG Chart — all elements share one coordinate system */}
        <div className="w-full overflow-x-auto">
          <svg
            viewBox="0 0 900 340"
            className="w-full min-w-[500px]"
            style={{ maxHeight: 360 }}
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

            {/* ---- Y-axis title ---- */}
            <text
              x="12"
              y="155"
              textAnchor="middle"
              fontSize="11"
              fill="#9ca3af"
              fontWeight="600"
              transform="rotate(-90, 12, 155)"
            >
              Revenue (₹)
            </text>

            {/* ---- Grid lines + Y-axis tick labels ---- */}
            {/* Chart plot area: x 100→850, y 30→270  (height 240) */}
            {[0, 0.25, 0.5, 0.75, 1].map((frac, idx) => {
              const y = 30 + frac * 240; // 30, 90, 150, 210, 270
              const val = Math.round(maxBucketVal * (1 - frac));
              return (
                <g key={idx}>
                  <line x1="100" y1={y} x2="850" y2={y} stroke="#f3f4f6" strokeWidth="1" strokeDasharray="6 4" />
                  <text x="90" y={y + 4} textAnchor="end" fontSize="11" fill="#9ca3af">
                    {`₹${val.toLocaleString("en-IN")}`}
                  </text>
                </g>
              );
            })}

            {/* ---- Data curve ---- */}
            {(() => {
              const plotLeft = 100;
              const plotRight = 850;
              const plotTop = 30;
              const plotBottom = 270;
              const plotW = plotRight - plotLeft;
              const plotH = plotBottom - plotTop;
              const n = chartBuckets.length;

              const pts = chartBuckets.map((b, i) => ({
                x: n > 1 ? plotLeft + (i / (n - 1)) * plotW : (plotLeft + plotRight) / 2,
                y: maxBucketVal > 0 ? plotBottom - (b.value / maxBucketVal) * plotH : plotBottom,
                value: b.value,
                label: b.label,
              }));

              // Build smooth cubic bezier path
              let linePath = "";
              if (pts.length > 0) {
                linePath = `M${pts[0].x},${pts[0].y}`;
                for (let i = 1; i < pts.length; i++) {
                  const prev = pts[i - 1];
                  const curr = pts[i];
                  const dx = (curr.x - prev.x) * 0.35;
                  linePath += ` C${prev.x + dx},${prev.y} ${curr.x - dx},${curr.y} ${curr.x},${curr.y}`;
                }
              }
              const areaPath = pts.length > 0
                ? `${linePath} L${pts[pts.length - 1].x},${plotBottom} L${pts[0].x},${plotBottom} Z`
                : "";

              // Find peak
              let peakPt = pts[0] || { x: 475, y: plotBottom, value: 0 };
              for (const p of pts) {
                if (p.value > peakPt.value) peakPt = p;
              }

              return (
                <>
                  {/* Area fill */}
                  {totalOrders > 0 && areaPath && <path d={areaPath} fill="url(#areaGradient)" />}

                  {/* Line */}
                  {linePath && (
                    <path
                      d={linePath}
                      fill="none"
                      stroke="url(#lineGradient)"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  )}

                  {/* Data point dots + hover tooltips */}
                  {pts.map((pt, i) => (
                    <g key={i} className="group" style={{ cursor: "default" }}>
                      {/* Invisible larger hit area */}
                      <circle cx={pt.x} cy={pt.y} r="16" fill="transparent" />
                      {/* Visible dot */}
                      <circle
                        cx={pt.x}
                        cy={pt.y}
                        r={pt === peakPt && totalOrders > 0 ? 6 : 4}
                        fill="white"
                        stroke="#6366f1"
                        strokeWidth={pt === peakPt && totalOrders > 0 ? 3 : 2}
                      />
                      {/* Tooltip background */}
                      <rect
                        x={pt.x - 52}
                        y={pt.y - 38}
                        width="104"
                        height="26"
                        rx="6"
                        fill="#1e1b4b"
                        opacity="0"
                        className="transition-opacity duration-150"
                        style={{ pointerEvents: "none" }}
                      >
                        <set attributeName="opacity" to="0.95" begin={`dot${i}.mouseenter`} end={`dot${i}.mouseleave`} />
                      </rect>
                      {/* Tooltip text */}
                      <text
                        x={pt.x}
                        y={pt.y - 21}
                        textAnchor="middle"
                        fontSize="11"
                        fontWeight="600"
                        fill="white"
                        opacity="0"
                        style={{ pointerEvents: "none" }}
                      >
                        <set attributeName="opacity" to="1" begin={`dot${i}.mouseenter`} end={`dot${i}.mouseleave`} />
                        {`₹${pt.value.toLocaleString("en-IN")}`}
                      </text>
                      {/* Invisible trigger circle with id for hover */}
                      <circle id={`dot${i}`} cx={pt.x} cy={pt.y} r="16" fill="transparent" style={{ cursor: "pointer" }} />
                    </g>
                  ))}
                </>
              );
            })()}

            {/* ---- X-axis tick labels ---- */}
            {chartBuckets.map((bucket, idx) => {
              const n = chartBuckets.length;
              const x = n > 1 ? 100 + (idx / (n - 1)) * 750 : 475;
              return (
                <text key={idx} x={x} y="295" textAnchor="middle" fontSize="11" fill="#9ca3af">
                  {bucket.label}
                </text>
              );
            })}

            {/* ---- X-axis title ---- */}
            <text x="475" y="320" textAnchor="middle" fontSize="11" fill="#9ca3af" fontWeight="600">
              {selectedPeriod === "7 Days"
                ? "Day of Week"
                : selectedPeriod === "4 Weeks"
                ? "Week"
                : selectedPeriod === "12 Months"
                ? "Month"
                : "Year"}
            </text>
          </svg>
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
