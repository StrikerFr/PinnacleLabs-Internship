-- Make user_id nullable for guest orders
ALTER TABLE public.orders ALTER COLUMN user_id DROP NOT NULL;

-- Make user_id nullable for guest coupon usage
ALTER TABLE public.coupon_usage ALTER COLUMN user_id DROP NOT NULL;
