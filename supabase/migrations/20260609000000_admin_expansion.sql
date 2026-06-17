-- Admin redesign: coupon min_order_value, refunded order status,
-- store_settings singleton, product_overrides table.

ALTER TABLE public.coupons
  ADD COLUMN IF NOT EXISTS min_order_value numeric NOT NULL DEFAULT 0;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum e
    JOIN pg_type t ON t.oid = e.enumtypid
    WHERE t.typname = 'order_status' AND e.enumlabel = 'refunded'
  ) THEN
    ALTER TYPE public.order_status ADD VALUE 'refunded';
  END IF;
END$$;

CREATE TABLE IF NOT EXISTS public.store_settings (
  id text PRIMARY KEY DEFAULT 'singleton',
  store_name text NOT NULL DEFAULT 'VedaGlow',
  logo_url text,
  support_email text NOT NULL DEFAULT 'hello@vedaglow.in',
  shipping_charge numeric NOT NULL DEFAULT 0,
  cod_enabled boolean NOT NULL DEFAULT true,
  razorpay_key_id text,
  social_instagram text,
  social_facebook text,
  social_youtube text,
  social_twitter text,
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.store_settings TO anon, authenticated;
GRANT ALL ON public.store_settings TO service_role;
ALTER TABLE public.store_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can read store settings" ON public.store_settings;
CREATE POLICY "Anyone can read store settings" ON public.store_settings
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins manage store settings" ON public.store_settings;
CREATE POLICY "Admins manage store settings" ON public.store_settings
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

INSERT INTO public.store_settings (id) VALUES ('singleton')
  ON CONFLICT (id) DO NOTHING;

CREATE TABLE IF NOT EXISTS public.product_overrides (
  sku text PRIMARY KEY,
  name text,
  description text,
  price numeric,
  mrp numeric,
  stock integer NOT NULL DEFAULT 0,
  visible boolean NOT NULL DEFAULT true,
  enabled boolean NOT NULL DEFAULT true,
  image_url text,
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.product_overrides TO anon, authenticated;
GRANT ALL ON public.product_overrides TO service_role;
ALTER TABLE public.product_overrides ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can read product overrides" ON public.product_overrides;
CREATE POLICY "Anyone can read product overrides" ON public.product_overrides
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins manage product overrides" ON public.product_overrides;
CREATE POLICY "Admins manage product overrides" ON public.product_overrides
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
