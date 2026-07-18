# Modestus Project Prompt

**System Role:** You are an expert Frontend Engineer and Creative Director specializing in Next.js 15 (App Router), Tailwind CSS, Framer Motion, and high-performance headless e-commerce architectures. 

**Project Overview:**
Build a premium, ultra-modern e-commerce frontend for "Modestus", a luxury modest fashion brand. The brand ethos redefines modern modest wear with clean silhouettes, minimal aesthetics, and a youthful, trend-driven approach. 

**Design Philosophy & Motion System:**
The website must mimic a fluid, high-interaction layout system inspired by motion-heavy design tools. Avoid sudden jumps or raw state flips; every UI transition must be handled smoothly via Framer Motion's layout animations (`layoutId`).

Implement the following system requirements and exact mechanics:

## 1. VISUAL THEME & DESIGN SYSTEM STYLE GUIDE
- **Color Palette**: A luxury monochrome foundation with earthy undertones. 
  - **Backgrounds**: Off-white/Alabaster (`#F9F9F7`) for main canvases, Obsidian Black (`#111111`) for technical/interactive sections.
  - **Accents**: Subtle muted sand/beige (`#D5CDBD`) for secondary elements.
- **Textures**: Implement a crisp, low-opacity mesh-grid background texture on technical dark-mode components to mimic UI design software.
- **Typography**: Use a striking grotesque/geometric font (e.g., `Clash Display` or `Neue Haas Grotesk`) for oversized, bold headers. Pair this with a highly readable, elegant sans-serif (e.g., `Inter` or `SF Pro`) for body and UI copy.
- **Material Design**: Utilize subtle glassmorphism (`backdrop-blur-md`, low-opacity white/black borders) for floating navigation, sticky carts, and modal overlays.

## 2. MODERN INTERACTIVE MECHANICS & ACCESSIBILITY
- **Fluid Interactions**: Implement custom cursor tracking for interactive elements (e.g., a localized glow or magnetic pull on buttons). 
- **Tactile Feedback**: Ensure all buttons and clickable nodes have a subtle `whileTap={{ scale: 0.98 }}` response. 
- **Accessibility (a11y)**: Ensure all layout morphs and interactive nodes are fully keyboard navigable (`tabIndex={0}`) with clear `:focus-visible` ring states. Use appropriate `aria-labels` for screen readers on dynamic image swaps.

## 3. RESPONSIVE BEHAVIOR & FLUID GRIDS
- **Mobile-First Scaling**: Components must gracefully collapse into single-column layouts on mobile (`grid-cols-1 md:grid-cols-3`). 
- **Touch Optimization**: On mobile viewports, convert hover-based expansions (like the Masonry Grid) into tap-to-expand accordions or horizontal swipeable carousels. Ensure minimum touch targets of 44x44px for all UI nodes.
- **Viewport Units**: Use dynamic viewport heights (`dvh`) for the Hero section to prevent layout jumps on mobile browsers when URL bars collapse.

## 4. SEO CRITICALITY, PERFORMANCE & LAYOUT SECURITY
- **Next.js 15 Metadata API**: Implement the App Router Metadata API globally. Use `template` and `absolute` title formatting. Generate static Open Graph (OG) images (`opengraph-image.tsx`) and Twitter cards dynamically for product pages to ensure maximum shareability.
- **Semantic HTML**: Enforce strict semantic structure (`<header>`, `<main>`, `<section>`, `<article>`) across all components to ensure search engine parseability.
- **Next/Image Optimization**: Use `next/image` with the `priority` attribute for all hero and above-the-fold imagery to hit optimal LCP (Largest Contentful Paint) targets. 
- **CLS Prevention (Zero Layout Shift)**: Define intrinsic sizing using `aspect-ratio` on all product images and media containers before they render. Wrap Framer Motion image reveals in strictly sized container Frames with locked aspect ratios so the browser can allocate space immediately, preventing Cumulative Layout Shift (CLS) during transitions. 

## 5. HERO SECTION (Split-Typography Image Portal)
- **Layout**: A clean, off-white container canvas. Large bold typography split across a central media viewport: "MODE" on top, "STUS" on bottom.
- **Interaction**: The central media viewport contains an image array that rapidly loops through cinematic modest-wear editorial shots.
- **Transition on Scroll/Trigger**: The text smoothly tracking outwards or converging into a unified title ("Modestus"), while the central media container expands effortlessly into a 3-column split layout showing three full-bleed models stepping forward gracefully.

## 6. THE "INTERACTIVE LOOKBOOK" WIZARD
- **Layout**: Sleek, dark-mode technical canvas (Obsidian Black) with mesh-grid background texture.
- **Component**: An interactive "Modest Mix & Match Builder" using UI nodes representing "Hijab/Scarf", "Abaya/Outerwear", and "Inner Dress/Maxi".
- **Interaction**: Draw clean connecting lines or glowing borders between selected pieces. When clicked, the central model image morphs its layout smoothly to present the fully assembled look, accompanied by elegant, minimalist informational cards detailing fabric and pricing.

## 7. "FOUR CLICKS TO STYLE" STEP PROGRESSION
- **Component**: A horizontal multi-step selector (1. Explore Fabric, 2. Customize Fit, 3. Pair Hijab, 4. Add to Capsule).
- **Animation**: Use a horizontal dot-navigation workflow indicator. As steps change, content slides and scales into view using `<AnimatePresence>`. Highlight items with floating, neon-tinted selection borders and glowing glassmorphism active states.

## 8. MASONRY EXPANSION GRID ("Look Series" Creation)
- **Layout**: A dynamic product catalog section. 
- **Animation**: When a user hovers or interacts with a primary editorial image, it must seamlessly scale and expand into a detailed grid of 4-12 complementary clothing items. Use Framer Motion's `layoutId` attribute across components to animate the layout boundary box smoothly rather than destroying and rebuilding elements.

## 9. GLOBAL UX/UI REFINEMENTS
- **Smooth Scroll**: Wrap the entire application layout in a Lenis Smooth Scroll container for a luxurious, dampened inertia-scroll effect.
- **Technical Motion Constraints**: Keep durations tight (0.4s to 0.6s) with a premium ease curve like `[0.76, 0, 0.24, 1]` (custom cubic-bezier for luxury feel).
