-- Restrict coupon reads: remove broad authenticated SELECT; admins still have ALL access.
DROP POLICY IF EXISTS "Authenticated read coupons" ON public.coupons;

-- Harden user_roles: prevent any non-admin INSERT/UPDATE/DELETE via restrictive policy.
CREATE POLICY "Only admins can modify roles"
ON public.user_roles
AS RESTRICTIVE
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));