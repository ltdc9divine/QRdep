# QRDep

VietQR standee maker built with Next.js 14, TypeScript, and Tailwind CSS. Requires Node.js 20 or later.

## Run locally

```bash
npm install
npm run dev
```

Copy `.env.example` to `.env.local` and set `NEXT_PUBLIC_SITE_URL` to the public application URL. PayOS credentials are optional for local testing; simulation is enabled automatically outside production.

Run [`supabase/schema.sql`](supabase/schema.sql) in the Supabase SQL Editor before starting the app. It creates the `orders` table, enables RLS without public policies, and installs the atomic pending-order/rate-limit function. The API uses only the server-side `SUPABASE_SERVICE_ROLE_KEY`; never add that key to a `NEXT_PUBLIC_*` variable.

## Configure PayOS

Set these server-side environment variables in `.env.local` and in the production hosting environment:

```text
PAYOS_CLIENT_ID=
PAYOS_API_KEY=
PAYOS_CHECKSUM_KEY=
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
RATE_LIMIT_SALT=
```

Register `https://your-domain.vn/api/webhook/payos` as the webhook URL in the PayOS merchant portal, replacing the host with the deployed application domain. The create-payment endpoint stores a pending Supabase order before returning the PayOS checkout URL and QR payload. The signed PayOS webhook updates the order, and the browser return checks the token-protected Supabase order status before unlocking the HD download; redirect query parameters alone are never trusted.

Without PayOS and Supabase credentials, live checkout is disabled. In production, the no-charge simulation is disabled unless `PAYOS_SIMULATION_ENABLED=true` is explicitly set; never enable it on a public production deployment. The rate limit hashes IPs from trusted `x-real-ip`/`x-forwarded-for` proxy headers; configure the hosting proxy to overwrite these headers rather than forwarding client-supplied values.

## Go-live data requirement

Orders and payment status are stored in Supabase, and webhook updates are idempotent. The exported poster is still rendered client-side, so the unlock flag is not a hard authorization boundary against a technically capable user. For paid digital goods, move final image generation/download behind a server endpoint that requires a verified order entitlement. Add retention/cleanup for abandoned `PENDING` orders and production monitoring for webhook failures before go-live.

## Verify production build

```bash
npm run build
npm run start
```
