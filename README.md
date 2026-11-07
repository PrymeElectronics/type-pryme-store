# Pryme Electronics store

Your own online store with a dashboard. Customers pay through Whop. Orders, clients and stock live in your dashboard at `/admin`.

## Go live (about 30 minutes, all from your phone or laptop)

### 1. Put the code on GitHub
1. Create a free account at github.com.
2. Tap **New repository**, name it `pryme-store`, keep it **Private**, create it.
3. Tap **uploading an existing file** and upload everything in this folder (unzip first). Commit.

### 2. Put it online with Vercel
1. Go to vercel.com and sign in with GitHub.
2. **Add New → Project**, pick `pryme-store`, tap **Deploy**. It will show a setup message for now, which is expected.
3. In the project, open **Storage → Create / Connect → Upstash (Redis)**, free plan, connect it to this project. This is where orders are saved.

### 3. Connect Whop
1. Use a separate Whop business for the store, so shop payments don't mix with your other Whop products.
2. Whop dashboard → **Developer** → create an **API key**. Give it these permissions:
   `checkout_configuration:create`, `checkout_configuration:basic:read`, `plan:create`, `access_pass:create`, `access_pass:update`, `payment:basic:read`.
3. Copy your business ID (starts with `biz_`) from your Whop dashboard settings or URL.
4. Whop → **Developer → Webhooks** → add `https://YOUR-SITE.vercel.app/api/webhooks/whop` and tick the `payment.succeeded` event. This marks orders as paid by itself.

### 4. Add your settings in Vercel
Project → **Settings → Environment Variables**. Add:

| Name | What to put |
|---|---|
| `WHOP_API_KEY` | Your Whop API key |
| `WHOP_COMPANY_ID` | Your `biz_...` ID |
| `WHOP_CURRENCY` | `zar` |
| `ADMIN_PASSWORD` | A strong password for your dashboard |
| `NEXT_PUBLIC_WHATSAPP` | Your number like `27821234567` |
| `NEXT_PUBLIC_SITE_URL` | `https://YOUR-SITE.vercel.app` |

Then **Deployments → ⋯ → Redeploy**.

### 5. Before you share the link
- Open `/admin`, go to **Products**, set your real **prices** and **stock**.
- Check every selling point against the box. Only keep what's true.
- Do a real test order with the cable (cheapest item), then refund it in Whop.

## Product photos
Take bright photos of your real stock on a plain background (square works best). In GitHub, open `public/products` and upload them with these exact names:
- `samsung-a07.jpg`
- `usb-c-iphone-cable.jpg`
- `vizco-floodlight.jpg`

Vercel updates the site by itself after each upload. Until then the store shows a clean icon instead.

## Links for TikTok ads
Send ads straight to the product, not the homepage:
- `/p/samsung-galaxy-a07`
- `/p/usb-c-to-iphone-cable`
- `/p/vizco-led-floodlight`

## Day to day
- New orders appear in `/admin → Orders`. Tap one to see the address and WhatsApp the client.
- Move the status along: Paid → Packed → Out for delivery → Delivered.
- If a payment ever doesn't show automatically, check Whop and set the order to **Paid** yourself. Stock comes off when an order is paid.
- Delivery fee, free-delivery amount and the promises on the page are in `lib/products.js`.
