# Product Images and Review Management

## What will change
- Restyle the Add Product area with a clearer cream, brown, gold, and leaf-green combination consistent with the storefront.
- Replace the product image URL field with a real image picker, upload progress/error feedback, preview, and uploaded image storage.
- Give admins complete review controls: edit customer name, city, star rating, review text, and publication status; also allow deletion.
- Load approved reviews on the main website so admin edits and approvals appear there automatically.
- Add the current storefront testimonials to the review collection so they are editable instead of remaining fixed in code.

## Access and safety
- Product images will use a public media bucket so storefront visitors can view them.
- Only authenticated administrators can upload, replace, or delete product images.
- The main website will only receive approved reviews; pending and rejected reviews remain private to administrators.

## Technical details
- Add storage access rules using the existing server-validated administrator role check.
- Upload selected image files from the admin product form and save the returned public URL with the product.
- Extend the existing admin mutation validation and handler for full review updates and deletion.
- Add a public read-only server function for approved reviews and connect it to the storefront route loader/query cache.
- Keep a graceful fallback to the existing testimonials if the public review request fails or no approved reviews exist.
- Verify the reported `src/lib/utils.ts` diagnostic against the current file, then run the focused type/build and browser checks.
