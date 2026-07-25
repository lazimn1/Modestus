import Link from "next/link";
import {
  Image as ImageIcon,
  Type,
  LayoutGrid,
  Tag,
  Info,
  GalleryHorizontalEnd,
  Star,
  Footprints,
} from "lucide-react";

const sections = [
  {
    label: "Hero Section",
    description: "Slideshow images and tagline text",
    href: "/admin/content/hero",
    icon: ImageIcon,
    gradient: "from-violet-400 to-purple-600",
  },
  {
    label: "Features Banner",
    description: "Delivery, returns, quality & payment badges",
    href: "/admin/content/features",
    icon: Tag,
    gradient: "from-emerald-400 to-teal-600",
  },
  {
    label: "Collections",
    description: "Collection cards with images and labels",
    href: "/admin/content/collections",
    icon: LayoutGrid,
    gradient: "from-blue-400 to-indigo-600",
  },
  {
    label: "Categories",
    description: "Category strip with images and links",
    href: "/admin/content/categories",
    icon: Type,
    gradient: "from-amber-400 to-orange-600",
  },
  {
    label: "Mission & About",
    description: "About Us page content and pillars",
    href: "/admin/content/about",
    icon: Info,
    gradient: "from-cyan-400 to-blue-600",
  },
  {
    label: "Editorial Gallery",
    description: "Gallery images and heading text",
    href: "/admin/content/gallery",
    icon: GalleryHorizontalEnd,
    gradient: "from-pink-400 to-rose-600",
  },
  {
    label: "Reviews",
    description: "Customer testimonials on homepage",
    href: "/admin/content/reviews",
    icon: Star,
    gradient: "from-yellow-400 to-amber-600",
  },
  {
    label: "Footer",
    description: "Footer text and social media links",
    href: "/admin/content/footer",
    icon: Footprints,
    gradient: "from-gray-400 to-gray-600",
  },
];

export default function AdminContentHub() {
  return (
    <div className="max-w-[1000px] space-y-6">
      <div>
        <h1 className="text-[22px] font-bold text-gray-900">Site Content</h1>
        <p className="text-sm text-gray-500 mt-1">
          Manage every section of your storefront — texts, images, reviews, and more.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {sections.map((section) => {
          const Icon = section.icon;
          return (
            <Link
              key={section.label}
              href={section.href}
              className={`group relative overflow-hidden rounded-xl bg-gradient-to-br ${section.gradient} p-5 text-white transition-transform duration-200 hover:scale-[1.02] hover:shadow-lg`}
            >
              <Icon className="w-6 h-6 mb-3 opacity-90" />
              <p className="text-[14px] font-bold leading-tight">{section.label}</p>
              <p className="text-[12px] opacity-80 mt-1">{section.description}</p>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
