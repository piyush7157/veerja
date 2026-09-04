CREATE POLICY "Admins can view product images"
ON storage.objects
FOR SELECT
TO authenticated
USING (bucket_id = 'product-images' AND private.has_role(auth.uid(), 'admin'::public.app_role));

CREATE POLICY "Admins can upload product images"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'product-images' AND private.has_role(auth.uid(), 'admin'::public.app_role));

CREATE POLICY "Admins can update product images"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'product-images' AND private.has_role(auth.uid(), 'admin'::public.app_role))
WITH CHECK (bucket_id = 'product-images' AND private.has_role(auth.uid(), 'admin'::public.app_role));

CREATE POLICY "Admins can delete product images"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'product-images' AND private.has_role(auth.uid(), 'admin'::public.app_role));

INSERT INTO public.reviews (customer_name, city, rating, review, status)
SELECT seed.customer_name, seed.city, seed.rating, seed.review, 'approved'::public.review_status
FROM (VALUES
  ('Ananya Sharma', 'Pune', 5, 'The aroma took me straight back to my grandmother''s kitchen. You can taste the difference in the very first spoon.'),
  ('Rohit Malhotra', 'Delhi', 5, 'Grainy texture, deep golden colour and zero heaviness. This is the real thing — we''ve switched completely.'),
  ('Meera Iyer', 'Chennai', 5, 'I use it for everything from pongal to dosa. Packaging is premium and delivery was quick and careful.'),
  ('Kabir Deshmukh', 'Nagpur', 5, 'Ordered the 1 litre jar for the family. Honest quality at a fair price — we finished it in three weeks!'),
  ('Sneha Patel', 'Ahmedabad', 5, 'My children love the taste and I love knowing exactly how it is made. Veerja Eats has earned our trust.')
) AS seed(customer_name, city, rating, review)
WHERE NOT EXISTS (
  SELECT 1 FROM public.reviews existing
  WHERE existing.customer_name = seed.customer_name
    AND existing.review = seed.review
);