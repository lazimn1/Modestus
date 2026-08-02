/* ─── Default Content (hardcoded fallbacks) ─── */


export const DEFAULTS: Record<string, any> = {
  hero: {
    tagline: "Fashion\nthat moves\nwith you.",
    images: ["/hero-1.webp", "/hero-2-cropped.webp", "/hero-3.webp"],
  },
  features_banner: {
    items: [
      { title: "FAST DELIVERY", desc: "Quick & wide delivery" },
      { title: "EASY RETURNS", desc: "Within 15 days" },
      { title: "QUALITY ASSURED", desc: "Best fashion, best quality" },
      { title: "SECURE PAYMENT", desc: "100% secure checkout" },
    ],
  },
  collections: {
    heading: "OUR COLLECTIONS",
    subtext:
      "Construct your silhouette. Select layers to preview the structural interplay of modest high fashion.",
    items: [
      { name: "Draped Silk", label: "HIJAB / SCARF", image: "/collection-1.webp" },
      { name: "Structured Noir", label: "ABAYA / OUTERWEAR", image: "/collection-2.webp" },
      { name: "Textured Linen", label: "INNER LAYER", image: "/collection-3.webp" },
      { name: "Modest Essentials", label: "ACCESSORY", image: "/collection-4.webp" },
    ],
  },
  categories: {
    items: [
      {
        title: "ABAYAS",
        description: "Elegant and modest daily wear.",
        linkText: "SHOP ABAYAS",
        linkUrl: "/abayas",
        imageUrl: "/images/category-1.webp",
      },
      {
        title: "HIJABS",
        description: "Premium quality for every style.",
        linkText: "SHOP HIJABS",
        linkUrl: "/hijabs",
        imageUrl: "/images/category-2.webp",
      },
      {
        title: "DRESSES",
        description: "Beautifully crafted modest dresses.",
        linkText: "SHOP DRESSES",
        linkUrl: "/dresses",
        imageUrl: "/images/category-3.webp",
      },
    ],
  },
  mission: {
    heading: "About Us",
    body: "We believe that modesty is not a limitation, but a canvas for architectural elegance. Every piece is constructed to empower the wearer, blending uncompromising coverage with high-fashion structural design.",
  },
  editorial: {
    heading: "Editorial",
    subtext:
      "A visual exploration of structure, drape, and modern modesty.",
    images: [
      "/gallery-img-1.webp",
      "/gallery-img-2.webp",
      "/gallery-img-3.webp",
      "/gallery-img-4.webp",
    ],
  },
  reviews: {
    heading: "What Our Community Says",
    subtitle: "LOVE LETTERS",
    items: [
      {
        quote:
          "Wore the Burgundy Festive Set to my sister's wedding and received so many compliments. The embroidery detail is exquisite. Worth every rupee.",
        initials: "RS",
        name: "Rhea S.",
        info: "Delhi · Burgundy Festive Set",
        avatarColor: "bg-rose-100 text-rose-900",
      },
      {
        quote:
          "Modestus truly understands fusion wear. It's elegant without being over the top. Perfect for work and weekends.",
        initials: "AK",
        name: "Aisha K.",
        info: "Mumbai · Classic Black Tunic",
        avatarColor: "bg-sky-100 text-sky-900",
      },
      {
        quote:
          "The quality of the fabric is unmatched. It feels luxurious and comfortable throughout the day. Highly recommended!",
        initials: "SM",
        name: "Sara M.",
        info: "Bangalore · Emerald Green Abaya",
        avatarColor: "bg-emerald-100 text-emerald-900",
      },
      {
        quote:
          "I've finally found a brand that caters to my style without compromising on modesty. Thank you Modestus!",
        initials: "FZ",
        name: "Fatima Z.",
        info: "Hyderabad · Floral Chiffon Hijab",
        avatarColor: "bg-amber-100 text-amber-900",
      },
      {
        quote:
          "The customer service was as amazing as the clothes. The fit was perfect right out of the box.",
        initials: "NK",
        name: "Nida K.",
        info: "Pune · Rose Silk Co-ord",
        avatarColor: "bg-indigo-100 text-indigo-900",
      },
    ],
  },
  footer: {
    description:
      "Join our community to receive exclusive updates on new collections and minimal modest fashion insights.",
    instagram: "#",
    twitter: "#",
  },
  about_page: {
    hero_heading: "THE MODESTUS\nETHOS",
    pillars: [
      {
        number: "01",
        title: "CRAFT",
        body: "We source only premium, durable fabrics that drape flawlessly, ensuring longevity and a luxurious tactile experience.",
      },
      {
        number: "02",
        title: "SILHOUETTE",
        body: "Our designs focus on structural interplay and layering, creating forms that are both commanding and profoundly elegant.",
      },
      {
        number: "03",
        title: "ESSENCE",
        body: "At our core, we maintain an uncompromising dedication to modesty, proving it is the ultimate form of sophistication.",
      },
    ],
    cta_heading: "Construct Your Signature",
  },
  contact_page: {
    heading: "CONNECT WITH MODESTUS",
    subheading: "Whether you require personalized styling advice, custom sizing guidance, or bespoke inquiries, our private client team is dedicated to assisting you.",
    email: "concierge@modestus.com",
    phone: "+1 (800) 555-MODEST",
    address: "123 Fashion Avenue, Suite 400, New York, NY 10012"
  }
};
