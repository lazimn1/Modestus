-- ============================================================
-- Modestus: Shopify → Supabase Migration Schema
-- Run this in the Supabase SQL Editor at:
-- https://supabase.com/dashboard/project/sdnapooffszzdwhkxpfb/sql/new
-- ============================================================

-- ─── PRODUCTS ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.products (
  id             SERIAL PRIMARY KEY,
  slug           TEXT NOT NULL UNIQUE,
  title          TEXT NOT NULL,
  subtitle       TEXT NOT NULL DEFAULT '',
  price          INTEGER NOT NULL,
  original_price INTEGER,
  images         TEXT[] NOT NULL DEFAULT '{}',
  colors         JSONB NOT NULL DEFAULT '[]',
  sizes          TEXT[] NOT NULL DEFAULT '{}',
  badge          TEXT,
  description    TEXT NOT NULL DEFAULT '',
  fabric         TEXT NOT NULL DEFAULT '',
  size_guide     TEXT NOT NULL DEFAULT '',
  rating         NUMERIC(3,1) NOT NULL DEFAULT 0,
  review_count   INTEGER NOT NULL DEFAULT 0,
  aspect_class   TEXT NOT NULL DEFAULT '',
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "products_public_select"
  ON public.products FOR SELECT USING (true);

GRANT SELECT ON public.products TO anon, authenticated;

-- ─── REVIEWS ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.reviews (
  id           SERIAL PRIMARY KEY,
  product_id   INTEGER NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  author       TEXT NOT NULL,
  location     TEXT NOT NULL DEFAULT '',
  rating       INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  date         TEXT NOT NULL,
  text         TEXT NOT NULL,
  initials     TEXT NOT NULL DEFAULT '',
  avatar_color TEXT NOT NULL DEFAULT '',
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "reviews_public_select"
  ON public.reviews FOR SELECT USING (true);

GRANT SELECT ON public.reviews TO anon, authenticated;

-- ─── ORDERS ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.orders (
  id               TEXT PRIMARY KEY,
  user_id          UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  items            JSONB NOT NULL DEFAULT '[]',
  subtotal         INTEGER NOT NULL DEFAULT 0,
  shipping         INTEGER NOT NULL DEFAULT 0,
  total            INTEGER NOT NULL DEFAULT 0,
  payment_method   TEXT NOT NULL DEFAULT 'cod',
  payment_status   TEXT NOT NULL DEFAULT 'pending',
  status           TEXT NOT NULL DEFAULT 'Confirmed',
  customer_name    TEXT NOT NULL DEFAULT '',
  email            TEXT NOT NULL DEFAULT '',
  phone            TEXT NOT NULL DEFAULT '',
  shipping_address JSONB NOT NULL DEFAULT '{}',
  placed_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "orders_user_select"
  ON public.orders FOR SELECT
  TO authenticated
  USING ((SELECT auth.uid()) = user_id);

CREATE POLICY "orders_user_insert"
  ON public.orders FOR INSERT
  TO authenticated
  WITH CHECK ((SELECT auth.uid()) = user_id);

GRANT SELECT, INSERT ON public.orders TO authenticated;

-- ─── WISHLISTS (upgrade existing) ────────────────────────────
-- Clear old Shopify-keyed wishlist data and add user_id UUID column
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'wishlists'
      AND column_name = 'customer_id' AND data_type = 'text'
  ) THEN
    DELETE FROM public.wishlists;
    ALTER TABLE public.wishlists DROP COLUMN customer_id;
    ALTER TABLE public.wishlists ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
  ELSIF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'wishlists'
      AND column_name = 'user_id'
  ) THEN
    ALTER TABLE public.wishlists ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;
END $$;

ALTER TABLE public.wishlists ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "wishlists_user_select" ON public.wishlists;
DROP POLICY IF EXISTS "wishlists_user_insert" ON public.wishlists;
DROP POLICY IF EXISTS "wishlists_user_delete" ON public.wishlists;

CREATE POLICY "wishlists_user_select"
  ON public.wishlists FOR SELECT
  TO authenticated
  USING ((SELECT auth.uid()) = user_id);

CREATE POLICY "wishlists_user_insert"
  ON public.wishlists FOR INSERT
  TO authenticated
  WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "wishlists_user_delete"
  ON public.wishlists FOR DELETE
  TO authenticated
  USING ((SELECT auth.uid()) = user_id);

GRANT SELECT, INSERT, DELETE ON public.wishlists TO authenticated;
