# Veerja Eats Admin Panel

## Overview
Build a secure, responsive admin area that matches the storefront’s warm gold, cream, brown, and leaf-green visual system. The panel will manage day-to-day commerce and content from one dashboard.

## Admin access
- Add email/password authentication and a dedicated `/auth` sign-in screen.
- Protect `/admin` and every admin data operation with server-validated admin roles.
- Store roles in a separate `user_roles` table and use a security-definer role check to avoid privilege escalation.
- Add a safe first-admin bootstrap path. The supplied address (`piyushvarma@417`) is not a valid email, so role assignment will remain pending until a valid sign-in email is provided.
- Add sign-out and clear protected cached data on logout.

## Database and storefront integration
- Add persistent tables for products, product variants, orders, order items, customer profiles, reviews, reels, and customer messages.
- Apply least-privilege row-level access rules: public visitors can read active storefront content and submit checkout/review/message data where appropriate; only admins can read private customer data or manage records.
- Seed the current A2 Ghee and its three pack sizes so the existing storefront remains populated.
- Update checkout to create a real order and customer record instead of keeping orders only in browser memory.
- Load storefront product pricing/content from the database while keeping a resilient display fallback.

## Admin experience
- Responsive sidebar/top bar with sections for Dashboard, Orders, Products, Customers, Reviews, Reels, and Messages.
- Dashboard metrics for revenue, orders, customers, pending reviews, unread messages, and recent activity.
- Orders table with search, status filters, order details, and status updates.
- Product editor for names, descriptions, pack sizes, prices, stock, and availability.
- Customer list with contact details, order counts, spend totals, and order history.
- Review moderation with approve/reject actions.
- Reel management for title, media URL, caption, visibility, and ordering.
- Message inbox with unread/read and resolved states.
- Clear empty, loading, error, and confirmation states for every management view.

## Technical details
- Use TanStack file routes with the generated authenticated layout and a nested admin role gate.
- Use authenticated `createServerFn` handlers for every private read/write; verify `has_role(auth.uid(), 'admin')` server-side before privileged operations.
- Use TanStack Query for admin data fetching and invalidation after mutations.
- Keep route-specific title, description, Open Graph, and Twitter metadata.
- Resolve the reported stale `src/lib/utils.ts` diagnostic by verifying the current file and final type/build output; no unsafe type coercion will be added.

## Validation
- Verify type/build output is clean.
- Verify unauthenticated users are redirected to sign-in and non-admin users cannot call admin operations.
- Exercise order creation and admin status updates.
- Check the dashboard and primary tables at desktop and mobile widths.
