CREATE TABLE public.popup_settings (
  id text PRIMARY KEY DEFAULT 'singleton',
  config jsonb NOT NULL DEFAULT '{}'::jsonb,
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT popup_settings_singleton CHECK (id = 'singleton')
);

GRANT SELECT ON public.popup_settings TO anon, authenticated;
GRANT ALL ON public.popup_settings TO service_role;

ALTER TABLE public.popup_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read popup settings"
ON public.popup_settings FOR SELECT
TO anon, authenticated
USING (true);

CREATE POLICY "Admins manage popup settings"
ON public.popup_settings FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER popup_settings_updated_at
BEFORE UPDATE ON public.popup_settings
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

INSERT INTO public.popup_settings (id, config) VALUES ('singleton', '{
  "bundleUpgrade": {"enabled": true, "title": "Wait — get 2 Kits for ₹499", "subtitle": "Most customers complete 2 full resets. Save more upfront.", "primaryCta": "Upgrade To 2 Kits", "secondaryCta": "Continue With 1 Kit"},
  "exitIntent": {"enabled": true, "title": "Before You Go — Take 10% Off", "subtitle": "Your code expires soon.", "coupon": "STAY10", "timerSeconds": 600, "cta": "Claim My Discount", "inactivitySeconds": 20},
  "socialProof": {"enabled": true, "minIntervalSeconds": 30, "maxIntervalSeconds": 60, "messages": ["Priya from Bengaluru purchased a Starter Kit", "Arjun from Mumbai upgraded to 2 Kits", "Someone just used coupon SAVE50", "Meera from Delhi purchased a Starter Kit", "Aanya from Pune upgraded to 2 Kits", "Riya from Hyderabad purchased a Starter Kit"]},
  "lowStock": {"enabled": true, "delaySeconds": 15, "stockCount": 37, "message": "Only {count} Starter Kits Remaining"},
  "couponReward": {"enabled": true, "scrollPercent": 50, "title": "You unlocked a reward", "subtitle": "Pick one coupon. It applies automatically at checkout.", "coupons": [{"code": "SAVE50", "label": "₹50 off your kit"}, {"code": "SAVE75", "label": "₹75 off · 2 kits and up"}, {"code": "SAVE100", "label": "₹100 off · loyalty pick"}]}
}'::jsonb)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.coupons (code, discount_type, discount_value, active, max_uses, used_count)
VALUES
  ('STAY10', 'percentage', 10, true, NULL, 0),
  ('SAVE50', 'flat', 50, true, NULL, 0),
  ('SAVE75', 'flat', 75, true, NULL, 0),
  ('SAVE100', 'flat', 100, true, NULL, 0)
ON CONFLICT (code) DO NOTHING;