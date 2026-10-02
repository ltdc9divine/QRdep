# QRDep

VietQR standee maker built with Next.js 14, TypeScript, and Tailwind CSS. Requires Node.js 20 or later.

## Run locally

```bash
npm install
npm run dev
```

Copy `.env.example` to `.env.local` and set `NEXT_PUBLIC_SITE_URL` to the public application URL. PayOS credentials are optional for local testing; the simulation payment remains available without them.

## Configure PayOS

Set these server-side environment variables in `.env.local` and in the production hosting environment:

```text
PAYOS_CLIENT_ID=
PAYOS_API_KEY=
PAYOS_CHECKSUM_KEY=
```

Register `https://your-domain.vn/api/webhook/payos` as the webhook URL in the PayOS merchant portal, replacing the host with the deployed application domain. The create-payment endpoint returns the PayOS checkout URL and QR payload. After checkout returns, QRDep verifies the order status directly with PayOS before unlocking the HD download; redirect query parameters alone are never trusted.

Without all three PayOS credentials, live checkout is disabled and the no-charge simulation remains available.

## Verify production build

```bash
npm run build
npm run start
```
