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

const statCards = [
  {
    label: "Total Revenue",
    value: "₹0.00",
    icon: IndianRupee,
    iconBg: "bg-green-50",
    iconColor: "text-green-500",
  },
  {
    label: "Total Orders",
    value: "0",
    icon: ClipboardList,
    iconBg: "bg-blue-50",
    iconColor: "text-blue-500",
  },
  {
    label: "Average Order Value",
    value: "₹0.00",
    icon: TrendingUp,
    iconBg: "bg-emerald-50",
    iconColor: "text-emerald-500",
  },
  {
    label: "Out of Stock Items",
    value: "0",
    icon: AlertCircle,
    iconBg: "bg-red-50",
    iconColor: "text-red-500",
  },
];

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
                <p className="text-[24px] font-bold text-gray-900 mt-1 leading-tight">{card.value}</p>
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
            {["7 Days", "4 Weeks", "12 Months", "5 Years"].map((period, i) => (
              <button
                key={period}
                className={`px-3 sm:px-4 py-[6px] rounded-md text-[12px] font-medium transition-all duration-200 shrink-0 ${
                  i === 1
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
            <span>₹30000</span>
            <span>₹22500</span>
            <span>₹15000</span>
            <span>₹7500</span>
            <span>₹0</span>
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
                d="M0,200 C50,180 100,170 150,160 C200,150 250,90 300,70 C350,50 400,40 450,55 C500,70 550,100 600,120 C650,140 700,150 750,160 C780,170 800,180 800,190"
                fill="none"
                stroke="url(#lineGradient)"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M0,200 C50,180 100,170 150,160 C200,150 250,90 300,70 C350,50 400,40 450,55 C500,70 550,100 600,120 C650,140 700,150 750,160 C780,170 800,180 800,190 L800,240 L0,240 Z"
                fill="url(#areaGradient)"
              />
              {/* Dot highlight on peak */}
              <circle cx="450" cy="55" r="6" fill="white" stroke="#6366f1" strokeWidth="3" />
            </svg>

            {/* X-axis labels */}
            <div className="absolute bottom-0 left-0 right-0 flex justify-between translate-y-6 text-[11px] text-gray-400">
              <span>Week 1</span>
              <span>Week 2</span>
              <span>Week 3</span>
              <span>Week 4</span>
            </div>
          </div>
        </div>

        <p className="text-center text-[12px] text-gray-400 mt-10">
          Sales data will appear here once orders begin processing.
        </p>
      </div>
    </div>
  );
}
