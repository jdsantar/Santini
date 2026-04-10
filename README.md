# Santini

Santini is a standalone Next.js web app for a World Cup-style digital album. It includes:

- collector accounts inside the app
- random five-card packs
- duplicate detection for trading
- one admin-capable account that can generate promo codes for packs
- a rare `bonus` card that appears every 20th pack and generates a special code
- a stadium showcase section for host venues
- optional Supabase auth and shared persistence for real multiplayer use

## Run locally

```bash
npm install
npm run dev
```

Then open [http://localhost:3000](http://localhost:3000).

## Modes

- Without Supabase env vars, Santini runs in local demo mode and stores state in `localStorage`.
- With Supabase env vars, Santini switches to shared mode with real auth, remote pack opening, shared promo codes, and multiplayer trading.

## Supabase setup

1. Create a Supabase project.
2. Copy [.env.example](/Users/jose.santa/projects/Santini/.env.example) to `.env.local`.
3. Fill in `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
4. Open the Supabase SQL editor and run [schema.sql](/Users/jose.santa/projects/Santini/supabase/schema.sql).
5. Start the app with `npm run dev`.

The schema creates:

- `profiles` for collector identities and admin status
- `user_cards` for owned copies
- `promo_codes` plus `promo_code_redemptions` for hashed admin and bonus rewards
- RPC functions for `open_pack`, `create_promo_code`, `redeem_promo_code`, and `trade_cards`

After signup, manually set `profiles.is_admin = true` in Supabase for the one trusted admin account you want to issue promo codes.

## Bootstrap the requested users

I added [bootstrap-users.mjs](/Users/jose.santa/projects/Santini/scripts/bootstrap-users.mjs) to create two initial Supabase Auth users:

- one admin-capable collector
- one regular collector

The script reads emails, passwords, and display names from environment variables so sensitive account identifiers do not need to live in the repository. Supabase will hash the passwords for you; they are not stored encrypted in this app.

Run it after setting your Supabase URL and service role key:

```bash
SUPABASE_URL=... \
SUPABASE_SERVICE_ROLE_KEY=... \
SANTINI_ADMIN_EMAIL=... \
SANTINI_ADMIN_PASSWORD=... \
SANTINI_ADMIN_NAME=... \
SANTINI_USER_EMAIL=... \
SANTINI_USER_PASSWORD=... \
SANTINI_USER_NAME=... \
npm run bootstrap:users
```

## Security notes

- Promo codes are now stored hashed in the database, not in plaintext.
- Shared mode no longer lists live redemption codes to all authenticated users.
- Admin access is not assigned automatically from an email address anymore.
- Code redemption is protected with a redemption table so the same user cannot gain credits twice from concurrent requests.
- Browser responses include basic security headers via [next.config.ts](/Users/jose.santa/projects/Santini/next.config.ts).

## Official docs used

- [Supabase Auth user management](https://supabase.com/docs/guides/auth/managing-user-data)
- [Supabase Row Level Security](https://supabase.com/docs/guides/database/postgres/row-level-security)
- [FIFA World Cup 2026 stadium capacities](https://gpcustomersupportfwc2026.tickets.fifa.com/hc/en-gb/articles/28784010437021-2-What-are-the-official-addresses-stadium-capacities-and-maps-of-the-FIFA-World-Cup-2026-stadiums)
- [Vercel pricing](https://vercel.com/pricing)
- [Supabase pricing](https://supabase.com/pricing)

## Free hosting path

The simplest no-cost stack for this project is:

- hosting: Vercel Hobby
- database/auth for real shared accounts and trades: Supabase Free Plan
- free public URL: the default `*.vercel.app` domain

That gives you free hosting and a free domain-like public URL without buying anything. If you later want a custom domain, Vercel also supports attaching one, but the domain itself is usually purchased separately.

## Notes

- The shared gameplay rules now live in Supabase SQL functions instead of only in the browser.
- This project still uses neutral card art placeholders. Replace them only with assets you are licensed to publish.

## FIFA image note

This starter uses neutral placeholder portraits in the card layout. That is intentional: official FIFA player images and tournament artwork are licensed assets, so you should only publish them if you have permission to use them. The card components are ready for licensed image URLs later.
