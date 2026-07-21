export type Review = {
  id: number;
  author: string;
  location: string;
  rating: number;
  date: string;
  text: string;
  initials: string;
  avatarColor: string;
};

export type Product = {
  id: number;
  slug: string;
  title: string;
  subtitle: string;
  price: number;
  originalPrice?: number;
  images: string[];
  colors: { name: string; hex: string }[];
  sizes: string[];
  rating: number;
  reviewCount: number;
  description: string;
  fabric: string;
  sizeGuide: string;
  reviews: Review[];
  badge?: string;
  aspectClass: string; // for masonry variety
};

export const products: Product[] = [
  {
    id: 1,
    slug: "midnight-abaya",
    title: "Midnight Abaya",
    subtitle: "Relaxed Luxury Silhouette",
    price: 8500,
    images: [
      "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=900&q=80",
      "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=900&q=80",
    ],
    colors: [
      { name: "Midnight Black", hex: "#0a0a0a" },
      { name: "Charcoal", hex: "#4a4a4a" },
      { name: "Midnight Navy", hex: "#1a2340" },
    ],
    sizes: ["XS", "S", "M", "L", "XL", "XXL"],
    rating: 4.9,
    reviewCount: 128,
    badge: "Bestseller",
    aspectClass: "aspect-[3/4]",
    description:
      "A signature Modestus silhouette in the deepest midnight black. Cut from our signature Japanese crepe, this abaya flows effortlessly with a subtle A-line flare at the hem. The hidden button placket ensures a clean, uninterrupted front, while the relaxed sleeves are tailored to cover the wrist perfectly.",
    fabric:
      "100% Japanese Crepe. Fully lined with breathable satin. Hand wash cold or dry clean recommended. Do not tumble dry. Iron on low heat inside-out.",
    sizeGuide:
      "Our abayas are designed with a relaxed fit. Size S fits a 36\" bust, M fits 38\", L fits 40\", XL fits 42\", XXL fits 44\". Length is approximately 57 inches for all sizes. We recommend sizing up one size for a more generous fit.",
    reviews: [
      {
        id: 1,
        author: "Fatima Z.",
        location: "Delhi",
        rating: 5,
        date: "July 12, 2026",
        text: "Absolutely stunning. The fabric is luxurious and the cut is impeccable. I wore this to a formal dinner and received endless compliments. Worth every rupee.",
        initials: "FZ",
        avatarColor: "bg-amber-100 text-amber-900",
      },
      {
        id: 2,
        author: "Aisha K.",
        location: "Mumbai",
        rating: 5,
        date: "June 28, 2026",
        text: "The quality is unreal. It drapes so beautifully — not stiff at all. I sized up as suggested and the fit is perfect. Will be ordering more colours.",
        initials: "AK",
        avatarColor: "bg-sky-100 text-sky-900",
      },
      {
        id: 3,
        author: "Sara M.",
        location: "Hyderabad",
        rating: 4,
        date: "June 15, 2026",
        text: "Beautiful piece, the lining is so comfortable for all-day wear. Delivery was a tiny bit delayed but the packaging was gorgeous. Worth the wait.",
        initials: "SM",
        avatarColor: "bg-rose-100 text-rose-900",
      },
    ],
  },
  {
    id: 2,
    slug: "ivory-chiffon-set",
    title: "Ivory Chiffon Set",
    subtitle: "Ethereal Two-Piece Co-ord",
    price: 6200,
    images: [
      "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=900&q=80",
      "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=900&q=80",
    ],
    colors: [
      { name: "Ivory", hex: "#f5f0e8" },
      { name: "Blush", hex: "#e8c8c0" },
      { name: "Sage", hex: "#b0c4b1" },
    ],
    sizes: ["XS", "S", "M", "L", "XL"],
    rating: 4.7,
    reviewCount: 84,
    badge: "New",
    aspectClass: "aspect-[2/3]",
    description:
      "Float through any occasion in this ethereal two-piece chiffon set. The oversized top features delicate pintuck detailing along the placket, while the wide-leg trousers create a perfectly balanced, elongating silhouette. Lightweight and breathable, ideal for both casual days and elegant evenings.",
    fabric:
      "100% Polyester Chiffon. Do not machine wash. Gentle hand wash in cold water. Dry flat in shade. Iron on very low heat.",
    sizeGuide:
      "Co-ords are sold as a set. The top runs slightly oversized. Size S fits bust 34-36\", M fits 37-39\", L fits 40-42\". Trouser inseam is 30 inches for all sizes. Length adjustable at waist with inner tie.",
    reviews: [
      {
        id: 1,
        author: "Nida K.",
        location: "Pune",
        rating: 5,
        date: "July 5, 2026",
        text: "I wore this to an Eid gathering and it was perfect. So light and flowy. The ivory is a beautiful warm white, not harsh at all.",
        initials: "NK",
        avatarColor: "bg-indigo-100 text-indigo-900",
      },
      {
        id: 2,
        author: "Rhea S.",
        location: "Bangalore",
        rating: 4,
        date: "June 20, 2026",
        text: "Gorgeous set. The chiffon quality is premium. I wish there were more colours available — hoping for a burgundy version soon!",
        initials: "RS",
        avatarColor: "bg-emerald-100 text-emerald-900",
      },
    ],
  },
  {
    id: 3,
    slug: "rose-silk-coord",
    title: "Rose Silk Co-ord",
    subtitle: "Handcrafted Silk Blend Set",
    price: 7800,
    originalPrice: 9200,
    images: [
      "https://images.unsplash.com/photo-1581044777550-4cfa60707c03?w=900&q=80",
      "https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=900&q=80",
    ],
    colors: [
      { name: "Dusty Rose", hex: "#c9a0a0" },
      { name: "Mauve", hex: "#9b7d8e" },
      { name: "Nude", hex: "#d4b8a0" },
    ],
    sizes: ["S", "M", "L", "XL"],
    rating: 4.8,
    reviewCount: 62,
    badge: "Sale",
    aspectClass: "aspect-[3/5]",
    description:
      "Crafted from a premium silk-viscose blend that catches the light beautifully. The palazzo trousers and matching longline kurta create a seamless, polished look from morning meetings to evening dinners. The subtle sheen makes this a year-round wardrobe staple.",
    fabric:
      "70% Viscose, 30% Silk. Dry clean recommended. If hand washing, use cold water with gentle detergent. Do not wring. Hang to dry. Iron on low heat with pressing cloth.",
    sizeGuide:
      "This set runs true to size. Kurta length is 44 inches. Palazzo has adjustable drawstring waist. Fits hip sizes up to 44\" on XL. Chest: S=36\", M=38\", L=40\", XL=42\".",
    reviews: [
      {
        id: 1,
        author: "Meera R.",
        location: "Chennai",
        rating: 5,
        date: "July 1, 2026",
        text: "The silk sheen is absolutely beautiful. Wore it to a wedding reception and felt like royalty. The colour in person is even more gorgeous than the photos.",
        initials: "MR",
        avatarColor: "bg-rose-100 text-rose-900",
      },
      {
        id: 2,
        author: "Zara H.",
        location: "Lucknow",
        rating: 5,
        date: "June 10, 2026",
        text: "Best purchase this year. The fabric quality justifies the price completely. True to size. Already planning my next order.",
        initials: "ZH",
        avatarColor: "bg-purple-100 text-purple-900",
      },
    ],
  },
  {
    id: 4,
    slug: "emerald-wrap-dress",
    title: "Emerald Wrap Dress",
    subtitle: "Adjustable Wrap Silhouette",
    price: 5500,
    images: [
      "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=900&q=80",
      "https://images.unsplash.com/photo-1509631179647-0177331693ae?w=900&q=80",
    ],
    colors: [
      { name: "Emerald", hex: "#2d6a4f" },
      { name: "Forest", hex: "#1b4332" },
      { name: "Sage", hex: "#74a57f" },
    ],
    sizes: ["XS", "S", "M", "L", "XL", "XXL"],
    rating: 4.6,
    reviewCount: 97,
    aspectClass: "aspect-[2/3]",
    description:
      "The wrap silhouette is universally flattering and endlessly versatile. Our Emerald Wrap Dress features a modesty-forward adjustable inner tie and an outer wrap belt, so you control the fit and coverage. The midi length falls beautifully below the knee with a subtle A-line sway.",
    fabric:
      "95% Polyester, 5% Elastane. Machine washable on delicate cycle. Wash inside out in cold water. Tumble dry low. Do not bleach.",
    sizeGuide:
      "Wrap dresses are fully adjustable. One size fits most (XS–L). For XL and XXL, we recommend the plus-size variant available separately. Length is 42 inches from shoulder seam.",
    reviews: [
      {
        id: 1,
        author: "Hana A.",
        location: "Kochi",
        rating: 5,
        date: "July 8, 2026",
        text: "Perfect for work. Modest, elegant, and comfortable. The wrap feature means I can adjust it exactly how I want. Will buy in every colour.",
        initials: "HA",
        avatarColor: "bg-green-100 text-green-900",
      },
      {
        id: 2,
        author: "Layla M.",
        location: "Jaipur",
        rating: 4,
        date: "June 25, 2026",
        text: "Colour is even more vibrant in person. Great quality for the price. Runs slightly long on petite frames — might need to hem.",
        initials: "LM",
        avatarColor: "bg-teal-100 text-teal-900",
      },
    ],
  },
  {
    id: 5,
    slug: "burgundy-festive-set",
    title: "Burgundy Festive Set",
    subtitle: "Embroidered Occasion Wear",
    price: 12000,
    images: [
      "https://images.unsplash.com/photo-1601924994987-69e26d50dc26?w=900&q=80",
      "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=900&q=80",
    ],
    colors: [
      { name: "Burgundy", hex: "#800020" },
      { name: "Deep Plum", hex: "#4a0030" },
      { name: "Wine", hex: "#722f37" },
    ],
    sizes: ["XS", "S", "M", "L", "XL"],
    rating: 4.9,
    reviewCount: 156,
    badge: "Limited",
    aspectClass: "aspect-[3/4]",
    description:
      "Our most beloved festive offering. The Burgundy Festive Set features intricate hand-embroidered resham work on the yoke and cuffs, set against rich Banarasi tissue fabric. Each piece takes our artisans approximately 6 hours to complete, making this a true heirloom-quality garment.",
    fabric:
      "Outer: Banarasi Tissue. Inner lining: Pure Silk. Embroidery: Resham & Zari. Dry clean only. Store in the muslin bag provided. Do not fold embroidered sections.",
    sizeGuide:
      "Festive sets are slightly slim-cut to complement formal wear. We recommend sizing up one size. Tunic length is 48 inches. Dupatta is 2.5m. Palazzo has elastic waist with side ties.",
    reviews: [
      {
        id: 1,
        author: "Rhea S.",
        location: "Delhi",
        rating: 5,
        date: "July 10, 2026",
        text: "Wore this to my sister's wedding and received so many compliments. The embroidery detail is exquisite. Worth every rupee and more.",
        initials: "RS",
        avatarColor: "bg-rose-100 text-rose-900",
      },
      {
        id: 2,
        author: "Sana Q.",
        location: "Kolkata",
        rating: 5,
        date: "June 30, 2026",
        text: "I was a bit nervous ordering such an expensive piece online, but Modestus delivered beyond expectations. The packaging was stunning and the fabric is divine.",
        initials: "SQ",
        avatarColor: "bg-amber-100 text-amber-900",
      },
      {
        id: 3,
        author: "Amira T.",
        location: "Ahmedabad",
        rating: 5,
        date: "June 18, 2026",
        text: "Absolute showstopper. The zari work catches the light so beautifully. Truly feels like a heirloom. Will treasure this for years.",
        initials: "AT",
        avatarColor: "bg-red-100 text-red-900",
      },
    ],
  },
  {
    id: 6,
    slug: "classic-linen-tunic",
    title: "Classic Linen Tunic",
    subtitle: "Everyday Minimal Essential",
    price: 3800,
    images: [
      "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=900&q=80",
      "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=900&q=80",
    ],
    colors: [
      { name: "Ecru", hex: "#f0e5c9" },
      { name: "Stone", hex: "#b5a99a" },
      { name: "Slate", hex: "#7a8a99" },
      { name: "Black", hex: "#0a0a0a" },
    ],
    sizes: ["XS", "S", "M", "L", "XL", "XXL"],
    rating: 4.5,
    reviewCount: 203,
    aspectClass: "aspect-[4/5]",
    description:
      "The wardrobe essential you'll reach for every single day. Our Classic Linen Tunic is cut slightly oversized for a relaxed, effortless fit. The longer-than-average hem length (below the hip) and three-quarter sleeves make it perfectly modest and incredibly versatile. Style with trousers, jeans, or our palazzo sets.",
    fabric:
      "100% Washed Linen. Machine washable at 30°C. Tumble dry low. Expect slight natural creasing — this is a characteristic of linen. Iron damp for a crisp finish.",
    sizeGuide:
      "This tunic is designed to be worn loose. Size S fits bust up to 40\", M up to 42\", L up to 44\", XL up to 46\", XXL up to 48\". Length from shoulder is 36 inches. Sleeve length is 20 inches.",
    reviews: [
      {
        id: 1,
        author: "Priya V.",
        location: "Pune",
        rating: 5,
        date: "July 14, 2026",
        text: "Bought 3 colours. Absolutely my go-to top now. Perfect weight, washes beautifully, and the length is ideal for modest dressing.",
        initials: "PV",
        avatarColor: "bg-yellow-100 text-yellow-900",
      },
      {
        id: 2,
        author: "Iqra B.",
        location: "Srinagar",
        rating: 4,
        date: "July 2, 2026",
        text: "Great quality linen. Wrinkles easily (as expected) but irons well. The fit is relaxed and comfortable. Great value.",
        initials: "IB",
        avatarColor: "bg-blue-100 text-blue-900",
      },
    ],
  },
  {
    id: 7,
    slug: "pearl-hijab-set",
    title: "Pearl Hijab Collection",
    subtitle: "Premium Instant Hijab Set",
    price: 2200,
    images: [
      "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=900&q=80",
      "https://images.unsplash.com/photo-1581044777550-4cfa60707c03?w=900&q=80",
    ],
    colors: [
      { name: "Pearl White", hex: "#f8f4ef" },
      { name: "Champagne", hex: "#e8d8b8" },
      { name: "Dusty Pink", hex: "#d4a0a0" },
      { name: "Slate Grey", hex: "#8a9aaa" },
    ],
    sizes: ["One Size"],
    rating: 4.8,
    reviewCount: 312,
    badge: "Top Rated",
    aspectClass: "aspect-[2/3]",
    description:
      "Our bestselling instant hijab, now in a new pearl finish jersey. The pre-sewn shape ensures a perfect, fuss-free drape every single time. The premium jersey fabric sits beautifully without pins, maintains its shape throughout the day, and feels incredibly soft against the skin.",
    fabric:
      "95% Modal, 5% Elastane. Machine washable at 30°C. Tumble dry low. The fabric retains its shape wash after wash. No ironing required.",
    sizeGuide:
      "One size fits all. The opening circumference is approximately 56cm, suitable for head sizes 52–62cm. The fabric has natural stretch. Length from top of head to front edge: 70cm.",
    reviews: [
      {
        id: 1,
        author: "Maryam J.",
        location: "Mumbai",
        rating: 5,
        date: "July 15, 2026",
        text: "The best instant hijab I've ever worn. Stays in place all day without any pins. The pearl white colour is so elegant.",
        initials: "MJ",
        avatarColor: "bg-slate-100 text-slate-900",
      },
      {
        id: 2,
        author: "Dina F.",
        location: "Hyderabad",
        rating: 5,
        date: "July 9, 2026",
        text: "Bought as a gift for my sister and she loved it. Great quality and the packaging was beautiful. Will be ordering for myself too!",
        initials: "DF",
        avatarColor: "bg-pink-100 text-pink-900",
      },
    ],
  },
  {
    id: 8,
    slug: "sage-maxi-dress",
    title: "Sage Maxi Dress",
    subtitle: "Effortless Floor-Length Silhouette",
    price: 6800,
    images: [
      "https://images.unsplash.com/photo-1509631179647-0177331693ae?w=900&q=80",
      "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=900&q=80",
    ],
    colors: [
      { name: "Sage Green", hex: "#87a878" },
      { name: "Dusty Blue", hex: "#7a98b5" },
      { name: "Terracotta", hex: "#c47a5a" },
    ],
    sizes: ["XS", "S", "M", "L", "XL"],
    rating: 4.7,
    reviewCount: 74,
    aspectClass: "aspect-[3/4]",
    description:
      "Effortlessly elegant from morning to midnight. The Sage Maxi Dress features a gathered bodice with a relaxed, flowing skirt that moves beautifully with every step. The full-length silhouette and long sleeves with subtle button cuffs make it a complete modest outfit requiring no layering.",
    fabric:
      "100% TENCEL™ Lyocell. Machine wash cold, delicate cycle. Tumble dry low. Hang to finish drying. Iron on medium heat. TENCEL™ is sustainably sourced.",
    sizeGuide:
      "Dress runs true to size. Bodice length from shoulder to waist: 17\". Total length: 58\" from shoulder. Sleeves: 24\" from shoulder seam. The gathered waist fits S=28-30\", M=30-33\", L=33-36\".",
    reviews: [
      {
        id: 1,
        author: "Yasmin A.",
        location: "Chennai",
        rating: 5,
        date: "July 6, 2026",
        text: "The sage green colour is absolutely gorgeous. TENCEL fabric is so soft and breathable. Perfect for summer. Already have 3 compliments today!",
        initials: "YA",
        avatarColor: "bg-green-100 text-green-900",
      },
      {
        id: 2,
        author: "Rania K.",
        location: "Jaipur",
        rating: 4,
        date: "June 22, 2026",
        text: "Beautiful dress! Very comfortable and modest. The colour is a lovely muted sage that pairs well with everything. Wish it came in more colours.",
        initials: "RK",
        avatarColor: "bg-lime-100 text-lime-900",
      },
    ],
  },
];

export function getProductBySlug(slug: string): Product | undefined {
  return products.find((p) => p.slug === slug);
}

export function formatINR(price: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(price);
}
