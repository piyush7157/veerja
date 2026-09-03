CREATE SCHEMA IF NOT EXISTS private;
REVOKE ALL ON SCHEMA private FROM PUBLIC;
GRANT USAGE ON SCHEMA private TO authenticated;

CREATE OR REPLACE FUNCTION private.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;
REVOKE ALL ON FUNCTION private.has_role(uuid, public.app_role) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION private.has_role(uuid, public.app_role) TO authenticated;

DROP POLICY "Admins can view roles" ON public.user_roles;
DROP POLICY "Admins can create roles" ON public.user_roles;
DROP POLICY "Admins can update roles" ON public.user_roles;
DROP POLICY "Admins can delete roles" ON public.user_roles;
CREATE POLICY "Admins can view roles" ON public.user_roles FOR SELECT TO authenticated USING (private.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can create roles" ON public.user_roles FOR INSERT TO authenticated WITH CHECK (private.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update roles" ON public.user_roles FOR UPDATE TO authenticated USING (private.has_role(auth.uid(), 'admin')) WITH CHECK (private.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete roles" ON public.user_roles FOR DELETE TO authenticated USING (private.has_role(auth.uid(), 'admin'));

DROP POLICY "Public can view active products" ON public.products;
DROP POLICY "Admins can create products" ON public.products;
DROP POLICY "Admins can update products" ON public.products;
DROP POLICY "Admins can delete products" ON public.products;
CREATE POLICY "Public can view active products" ON public.products FOR SELECT TO anon, authenticated USING (is_active OR private.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can create products" ON public.products FOR INSERT TO authenticated WITH CHECK (private.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update products" ON public.products FOR UPDATE TO authenticated USING (private.has_role(auth.uid(), 'admin')) WITH CHECK (private.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete products" ON public.products FOR DELETE TO authenticated USING (private.has_role(auth.uid(), 'admin'));

DROP POLICY "Public can view active variants" ON public.product_variants;
DROP POLICY "Admins can create variants" ON public.product_variants;
DROP POLICY "Admins can update variants" ON public.product_variants;
DROP POLICY "Admins can delete variants" ON public.product_variants;
CREATE POLICY "Public can view active variants" ON public.product_variants FOR SELECT TO anon, authenticated USING (is_active OR private.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can create variants" ON public.product_variants FOR INSERT TO authenticated WITH CHECK (private.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update variants" ON public.product_variants FOR UPDATE TO authenticated USING (private.has_role(auth.uid(), 'admin')) WITH CHECK (private.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete variants" ON public.product_variants FOR DELETE TO authenticated USING (private.has_role(auth.uid(), 'admin'));

DROP POLICY "Admins manage customers" ON public.customers;
CREATE POLICY "Admins manage customers" ON public.customers FOR ALL TO authenticated USING (private.has_role(auth.uid(), 'admin')) WITH CHECK (private.has_role(auth.uid(), 'admin'));
DROP POLICY "Admins manage orders" ON public.orders;
CREATE POLICY "Admins manage orders" ON public.orders FOR ALL TO authenticated USING (private.has_role(auth.uid(), 'admin')) WITH CHECK (private.has_role(auth.uid(), 'admin'));
DROP POLICY "Admins manage order items" ON public.order_items;
CREATE POLICY "Admins manage order items" ON public.order_items FOR ALL TO authenticated USING (private.has_role(auth.uid(), 'admin')) WITH CHECK (private.has_role(auth.uid(), 'admin'));

DROP POLICY "Public can view approved reviews" ON public.reviews;
DROP POLICY "Admins can update reviews" ON public.reviews;
DROP POLICY "Admins can delete reviews" ON public.reviews;
CREATE POLICY "Public can view approved reviews" ON public.reviews FOR SELECT TO anon, authenticated USING (status = 'approved' OR private.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update reviews" ON public.reviews FOR UPDATE TO authenticated USING (private.has_role(auth.uid(), 'admin')) WITH CHECK (private.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete reviews" ON public.reviews FOR DELETE TO authenticated USING (private.has_role(auth.uid(), 'admin'));

DROP POLICY "Public can view published reels" ON public.reels;
DROP POLICY "Admins can create reels" ON public.reels;
DROP POLICY "Admins can update reels" ON public.reels;
DROP POLICY "Admins can delete reels" ON public.reels;
CREATE POLICY "Public can view published reels" ON public.reels FOR SELECT TO anon, authenticated USING (is_published OR private.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can create reels" ON public.reels FOR INSERT TO authenticated WITH CHECK (private.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update reels" ON public.reels FOR UPDATE TO authenticated USING (private.has_role(auth.uid(), 'admin')) WITH CHECK (private.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete reels" ON public.reels FOR DELETE TO authenticated USING (private.has_role(auth.uid(), 'admin'));

DROP POLICY "Admins manage messages" ON public.customer_messages;
CREATE POLICY "Admins manage messages" ON public.customer_messages FOR ALL TO authenticated USING (private.has_role(auth.uid(), 'admin')) WITH CHECK (private.has_role(auth.uid(), 'admin'));

REVOKE ALL ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon, authenticated;
DROP FUNCTION public.has_role(uuid, public.app_role);