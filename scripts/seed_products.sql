-- ============================================================
-- Modestus Seed Data
-- Run this in the Supabase SQL Editor to populate products
-- ============================================================

TRUNCATE TABLE public.reviews CASCADE;
TRUNCATE TABLE public.products CASCADE;

INSERT INTO public.products (
      id, slug, title, subtitle, price, original_price, images, colors, sizes, badge, description, fabric, size_guide, rating, review_count, aspect_class
    ) VALUES (
      1,
      'midnight-abaya',
      'Midnight Abaya',
      'Relaxed Luxury Silhouette',
      8500,
      NULL,
      '["/images/hero-model.webp","/collection-1.webp"]',
      '[{"name":"Midnight Black","hex":"#0a0a0a"},{"name":"Charcoal","hex":"#4a4a4a"},{"name":"Midnight Navy","hex":"#1a2340"}]',
      '["XS","S","M","L","XL","XXL"]',
      'Bestseller',
      'A signature Modestus silhouette in the deepest midnight black. Cut from our signature Japanese crepe, this abaya flows effortlessly with a subtle A-line flare at the hem. The hidden button placket ensures a clean, uninterrupted front, while the relaxed sleeves are tailored to cover the wrist perfectly.',
      '100% Japanese Crepe. Fully lined with breathable satin. Hand wash cold or dry clean recommended. Do not tumble dry. Iron on low heat inside-out.',
      'Our abayas are designed with a relaxed fit. Size S fits a 36" bust, M fits 38", L fits 40", XL fits 42", XXL fits 44". Length is approximately 57 inches for all sizes. We recommend sizing up one size for a more generous fit.',
      4.9,
      128,
      'aspect-[3/4]'
    );
INSERT INTO public.reviews (
          id, product_id, author, location, rating, date, text, initials, avatar_color
        ) VALUES (
          1,
          1,
          'Fatima Z.',
          'Delhi',
          5,
          'July 12, 2026',
          'Absolutely stunning. The fabric is luxurious and the cut is impeccable. I wore this to a formal dinner and received endless compliments. Worth every rupee.',
          'FZ',
          'bg-amber-100 text-amber-900'
        );
INSERT INTO public.reviews (
          id, product_id, author, location, rating, date, text, initials, avatar_color
        ) VALUES (
          2,
          1,
          'Aisha K.',
          'Mumbai',
          5,
          'June 28, 2026',
          'The quality is unreal. It drapes so beautifully — not stiff at all. I sized up as suggested and the fit is perfect. Will be ordering more colours.',
          'AK',
          'bg-sky-100 text-sky-900'
        );
INSERT INTO public.reviews (
          id, product_id, author, location, rating, date, text, initials, avatar_color
        ) VALUES (
          3,
          1,
          'Sara M.',
          'Hyderabad',
          4,
          'June 15, 2026',
          'Beautiful piece, the lining is so comfortable for all-day wear. Delivery was a tiny bit delayed but the packaging was gorgeous. Worth the wait.',
          'SM',
          'bg-rose-100 text-rose-900'
        );

INSERT INTO public.products (
      id, slug, title, subtitle, price, original_price, images, colors, sizes, badge, description, fabric, size_guide, rating, review_count, aspect_class
    ) VALUES (
      2,
      'ivory-chiffon-set',
      'Ivory Chiffon Set',
      'Ethereal Two-Piece Co-ord',
      6200,
      NULL,
      '["/collection-2.webp","/gallery-img-1.webp"]',
      '[{"name":"Ivory","hex":"#f5f0e8"},{"name":"Blush","hex":"#e8c8c0"},{"name":"Sage","hex":"#b0c4b1"}]',
      '["XS","S","M","L","XL"]',
      'New',
      'Float through any occasion in this ethereal two-piece chiffon set. The oversized top features delicate pintuck detailing along the placket, while the wide-leg trousers create a perfectly balanced, elongating silhouette. Lightweight and breathable, ideal for both casual days and elegant evenings.',
      '100% Polyester Chiffon. Do not machine wash. Gentle hand wash in cold water. Dry flat in shade. Iron on very low heat.',
      'Co-ords are sold as a set. The top runs slightly oversized. Size S fits bust 34-36", M fits 37-39", L fits 40-42". Trouser inseam is 30 inches for all sizes. Length adjustable at waist with inner tie.',
      4.7,
      84,
      'aspect-[2/3]'
    );
INSERT INTO public.reviews (
          id, product_id, author, location, rating, date, text, initials, avatar_color
        ) VALUES (
          1,
          2,
          'Nida K.',
          'Pune',
          5,
          'July 5, 2026',
          'I wore this to an Eid gathering and it was perfect. So light and flowy. The ivory is a beautiful warm white, not harsh at all.',
          'NK',
          'bg-indigo-100 text-indigo-900'
        );
INSERT INTO public.reviews (
          id, product_id, author, location, rating, date, text, initials, avatar_color
        ) VALUES (
          2,
          2,
          'Rhea S.',
          'Bangalore',
          4,
          'June 20, 2026',
          'Gorgeous set. The chiffon quality is premium. I wish there were more colours available — hoping for a burgundy version soon!',
          'RS',
          'bg-emerald-100 text-emerald-900'
        );

INSERT INTO public.products (
      id, slug, title, subtitle, price, original_price, images, colors, sizes, badge, description, fabric, size_guide, rating, review_count, aspect_class
    ) VALUES (
      3,
      'rose-silk-coord',
      'Rose Silk Co-ord',
      'Handcrafted Silk Blend Set',
      7800,
      9200,
      '["/collection-3.webp","/gallery-img-2.webp"]',
      '[{"name":"Dusty Rose","hex":"#c9a0a0"},{"name":"Mauve","hex":"#9b7d8e"},{"name":"Nude","hex":"#d4b8a0"}]',
      '["S","M","L","XL"]',
      'Sale',
      'Crafted from a premium silk-viscose blend that catches the light beautifully. The palazzo trousers and matching longline kurta create a seamless, polished look from morning meetings to evening dinners. The subtle sheen makes this a year-round wardrobe staple.',
      '70% Viscose, 30% Silk. Dry clean recommended. If hand washing, use cold water with gentle detergent. Do not wring. Hang to dry. Iron on low heat with pressing cloth.',
      'This set runs true to size. Kurta length is 44 inches. Palazzo has adjustable drawstring waist. Fits hip sizes up to 44" on XL. Chest: S=36", M=38", L=40", XL=42".',
      4.8,
      62,
      'aspect-[3/5]'
    );
INSERT INTO public.reviews (
          id, product_id, author, location, rating, date, text, initials, avatar_color
        ) VALUES (
          1,
          3,
          'Meera R.',
          'Chennai',
          5,
          'July 1, 2026',
          'The silk sheen is absolutely beautiful. Wore it to a wedding reception and felt like royalty. The colour in person is even more gorgeous than the photos.',
          'MR',
          'bg-rose-100 text-rose-900'
        );
INSERT INTO public.reviews (
          id, product_id, author, location, rating, date, text, initials, avatar_color
        ) VALUES (
          2,
          3,
          'Zara H.',
          'Lucknow',
          5,
          'June 10, 2026',
          'Best purchase this year. The fabric quality justifies the price completely. True to size. Already planning my next order.',
          'ZH',
          'bg-purple-100 text-purple-900'
        );

INSERT INTO public.products (
      id, slug, title, subtitle, price, original_price, images, colors, sizes, badge, description, fabric, size_guide, rating, review_count, aspect_class
    ) VALUES (
      4,
      'emerald-wrap-dress',
      'Emerald Wrap Dress',
      'Adjustable Wrap Silhouette',
      5500,
      NULL,
      '["/collection-4.webp","/gallery-img-3.webp"]',
      '[{"name":"Emerald","hex":"#2d6a4f"},{"name":"Forest","hex":"#1b4332"},{"name":"Sage","hex":"#74a57f"}]',
      '["XS","S","M","L","XL","XXL"]',
      NULL,
      'The wrap silhouette is universally flattering and endlessly versatile. Our Emerald Wrap Dress features a modesty-forward adjustable inner tie and an outer wrap belt, so you control the fit and coverage. The midi length falls beautifully below the knee with a subtle A-line sway.',
      '95% Polyester, 5% Elastane. Machine washable on delicate cycle. Wash inside out in cold water. Tumble dry low. Do not bleach.',
      'Wrap dresses are fully adjustable. One size fits most (XS–L). For XL and XXL, we recommend the plus-size variant available separately. Length is 42 inches from shoulder seam.',
      4.6,
      97,
      'aspect-[2/3]'
    );
INSERT INTO public.reviews (
          id, product_id, author, location, rating, date, text, initials, avatar_color
        ) VALUES (
          1,
          4,
          'Hana A.',
          'Kochi',
          5,
          'July 8, 2026',
          'Perfect for work. Modest, elegant, and comfortable. The wrap feature means I can adjust it exactly how I want. Will buy in every colour.',
          'HA',
          'bg-green-100 text-green-900'
        );
INSERT INTO public.reviews (
          id, product_id, author, location, rating, date, text, initials, avatar_color
        ) VALUES (
          2,
          4,
          'Layla M.',
          'Jaipur',
          4,
          'June 25, 2026',
          'Colour is even more vibrant in person. Great quality for the price. Runs slightly long on petite frames — might need to hem.',
          'LM',
          'bg-teal-100 text-teal-900'
        );

INSERT INTO public.products (
      id, slug, title, subtitle, price, original_price, images, colors, sizes, badge, description, fabric, size_guide, rating, review_count, aspect_class
    ) VALUES (
      5,
      'burgundy-festive-set',
      'Burgundy Festive Set',
      'Embroidered Occasion Wear',
      12000,
      NULL,
      '["/images/category-1.webp","/gallery-img-4.webp"]',
      '[{"name":"Burgundy","hex":"#800020"},{"name":"Deep Plum","hex":"#4a0030"},{"name":"Wine","hex":"#722f37"}]',
      '["XS","S","M","L","XL"]',
      'Limited',
      'Our most beloved festive offering. The Burgundy Festive Set features intricate hand-embroidered resham work on the yoke and cuffs, set against rich Banarasi tissue fabric. Each piece takes our artisans approximately 6 hours to complete, making this a true heirloom-quality garment.',
      'Outer: Banarasi Tissue. Inner lining: Pure Silk. Embroidery: Resham & Zari. Dry clean only. Store in the muslin bag provided. Do not fold embroidered sections.',
      'Festive sets are slightly slim-cut to complement formal wear. We recommend sizing up one size. Tunic length is 48 inches. Dupatta is 2.5m. Palazzo has elastic waist with side ties.',
      4.9,
      156,
      'aspect-[3/4]'
    );
INSERT INTO public.reviews (
          id, product_id, author, location, rating, date, text, initials, avatar_color
        ) VALUES (
          1,
          5,
          'Rhea S.',
          'Delhi',
          5,
          'July 10, 2026',
          'Wore this to my sister''s wedding and received so many compliments. The embroidery detail is exquisite. Worth every rupee and more.',
          'RS',
          'bg-rose-100 text-rose-900'
        );
INSERT INTO public.reviews (
          id, product_id, author, location, rating, date, text, initials, avatar_color
        ) VALUES (
          2,
          5,
          'Sana Q.',
          'Kolkata',
          5,
          'June 30, 2026',
          'I was a bit nervous ordering such an expensive piece online, but Modestus delivered beyond expectations. The packaging was stunning and the fabric is divine.',
          'SQ',
          'bg-amber-100 text-amber-900'
        );
INSERT INTO public.reviews (
          id, product_id, author, location, rating, date, text, initials, avatar_color
        ) VALUES (
          3,
          5,
          'Amira T.',
          'Ahmedabad',
          5,
          'June 18, 2026',
          'Absolute showstopper. The zari work catches the light so beautifully. Truly feels like a heirloom. Will treasure this for years.',
          'AT',
          'bg-red-100 text-red-900'
        );

INSERT INTO public.products (
      id, slug, title, subtitle, price, original_price, images, colors, sizes, badge, description, fabric, size_guide, rating, review_count, aspect_class
    ) VALUES (
      6,
      'classic-linen-tunic',
      'Classic Linen Tunic',
      'Everyday Minimal Essential',
      3800,
      NULL,
      '["/images/category-2.webp","/hero-1.webp"]',
      '[{"name":"Ecru","hex":"#f0e5c9"},{"name":"Stone","hex":"#b5a99a"},{"name":"Slate","hex":"#7a8a99"},{"name":"Black","hex":"#0a0a0a"}]',
      '["XS","S","M","L","XL","XXL"]',
      NULL,
      'The wardrobe essential you''ll reach for every single day. Our Classic Linen Tunic is cut slightly oversized for a relaxed, effortless fit. The longer-than-average hem length (below the hip) and three-quarter sleeves make it perfectly modest and incredibly versatile. Style with trousers, jeans, or our palazzo sets.',
      '100% Washed Linen. Machine washable at 30°C. Tumble dry low. Expect slight natural creasing — this is a characteristic of linen. Iron damp for a crisp finish.',
      'This tunic is designed to be worn loose. Size S fits bust up to 40", M up to 42", L up to 44", XL up to 46", XXL up to 48". Length from shoulder is 36 inches. Sleeve length is 20 inches.',
      4.5,
      203,
      'aspect-[4/5]'
    );
INSERT INTO public.reviews (
          id, product_id, author, location, rating, date, text, initials, avatar_color
        ) VALUES (
          1,
          6,
          'Priya V.',
          'Pune',
          5,
          'July 14, 2026',
          'Bought 3 colours. Absolutely my go-to top now. Perfect weight, washes beautifully, and the length is ideal for modest dressing.',
          'PV',
          'bg-yellow-100 text-yellow-900'
        );
INSERT INTO public.reviews (
          id, product_id, author, location, rating, date, text, initials, avatar_color
        ) VALUES (
          2,
          6,
          'Iqra B.',
          'Srinagar',
          4,
          'July 2, 2026',
          'Great quality linen. Wrinkles easily (as expected) but irons well. The fit is relaxed and comfortable. Great value.',
          'IB',
          'bg-blue-100 text-blue-900'
        );

INSERT INTO public.products (
      id, slug, title, subtitle, price, original_price, images, colors, sizes, badge, description, fabric, size_guide, rating, review_count, aspect_class
    ) VALUES (
      7,
      'pearl-hijab-set',
      'Pearl Hijab Collection',
      'Premium Instant Hijab Set',
      2200,
      NULL,
      '["/images/category-3.webp","/hero-2.webp"]',
      '[{"name":"Pearl White","hex":"#f8f4ef"},{"name":"Champagne","hex":"#e8d8b8"},{"name":"Dusty Pink","hex":"#d4a0a0"},{"name":"Slate Grey","hex":"#8a9aaa"}]',
      '["One Size"]',
      'Top Rated',
      'Our bestselling instant hijab, now in a new pearl finish jersey. The pre-sewn shape ensures a perfect, fuss-free drape every single time. The premium jersey fabric sits beautifully without pins, maintains its shape throughout the day, and feels incredibly soft against the skin.',
      '95% Modal, 5% Elastane. Machine washable at 30°C. Tumble dry low. The fabric retains its shape wash after wash. No ironing required.',
      'One size fits all. The opening circumference is approximately 56cm, suitable for head sizes 52–62cm. The fabric has natural stretch. Length from top of head to front edge: 70cm.',
      4.8,
      312,
      'aspect-[2/3]'
    );
INSERT INTO public.reviews (
          id, product_id, author, location, rating, date, text, initials, avatar_color
        ) VALUES (
          1,
          7,
          'Maryam J.',
          'Mumbai',
          5,
          'July 15, 2026',
          'The best instant hijab I''ve ever worn. Stays in place all day without any pins. The pearl white colour is so elegant.',
          'MJ',
          'bg-slate-100 text-slate-900'
        );
INSERT INTO public.reviews (
          id, product_id, author, location, rating, date, text, initials, avatar_color
        ) VALUES (
          2,
          7,
          'Dina F.',
          'Hyderabad',
          5,
          'July 9, 2026',
          'Bought as a gift for my sister and she loved it. Great quality and the packaging was beautiful. Will be ordering for myself too!',
          'DF',
          'bg-pink-100 text-pink-900'
        );

INSERT INTO public.products (
      id, slug, title, subtitle, price, original_price, images, colors, sizes, badge, description, fabric, size_guide, rating, review_count, aspect_class
    ) VALUES (
      8,
      'sage-maxi-dress',
      'Sage Maxi Dress',
      'Effortless Floor-Length Silhouette',
      6800,
      NULL,
      '["/images/promo-model.webp","/hero-3.webp"]',
      '[{"name":"Sage Green","hex":"#87a878"},{"name":"Dusty Blue","hex":"#7a98b5"},{"name":"Terracotta","hex":"#c47a5a"}]',
      '["XS","S","M","L","XL"]',
      NULL,
      'Effortlessly elegant from morning to midnight. The Sage Maxi Dress features a gathered bodice with a relaxed, flowing skirt that moves beautifully with every step. The full-length silhouette and long sleeves with subtle button cuffs make it a complete modest outfit requiring no layering.',
      '100% TENCEL™ Lyocell. Machine wash cold, delicate cycle. Tumble dry low. Hang to finish drying. Iron on medium heat. TENCEL™ is sustainably sourced.',
      'Dress runs true to size. Bodice length from shoulder to waist: 17". Total length: 58" from shoulder. Sleeves: 24" from shoulder seam. The gathered waist fits S=28-30", M=30-33", L=33-36".',
      4.7,
      74,
      'aspect-[3/4]'
    );
INSERT INTO public.reviews (
          id, product_id, author, location, rating, date, text, initials, avatar_color
        ) VALUES (
          1,
          8,
          'Yasmin A.',
          'Chennai',
          5,
          'July 6, 2026',
          'The sage green colour is absolutely gorgeous. TENCEL fabric is so soft and breathable. Perfect for summer. Already have 3 compliments today!',
          'YA',
          'bg-green-100 text-green-900'
        );
INSERT INTO public.reviews (
          id, product_id, author, location, rating, date, text, initials, avatar_color
        ) VALUES (
          2,
          8,
          'Rania K.',
          'Jaipur',
          4,
          'June 22, 2026',
          'Beautiful dress! Very comfortable and modest. The colour is a lovely muted sage that pairs well with everything. Wish it came in more colours.',
          'RK',
          'bg-lime-100 text-lime-900'
        );

SELECT setval(pg_get_serial_sequence('public.products', 'id'), (SELECT MAX(id) FROM public.products));
SELECT setval(pg_get_serial_sequence('public.reviews', 'id'), (SELECT MAX(id) FROM public.reviews));
