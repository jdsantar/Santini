# Run Santini

This file is the quick operational guide for running Santini locally and understanding the available auth modes.

## What This Project Is

Santini is a standalone Next.js 16 app that simulates a World Cup collectible album:

- invite-based collector accounts
- album pages by team
- five-card pack opening
- duplicate tracking
- trade offers
- promo codes and bonus pack rewards
- optional Supabase-backed shared multiplayer mode

## Requirements

- Node.js 20+ recommended
- `npm`

## Install

```bash
npm install
```

## Run In Local Demo Mode

Local demo mode is disabled by default unless you explicitly enable it.

1. Create `.env.local`
2. Add:

```bash
NEXT_PUBLIC_ENABLE_LOCAL_DEMO=true
```

3. Start the app:

```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000)

### Local Demo Credentials

- Username: `santini`
  Email: `collector-admin@santini.local`
  Password: `1036937369`
- Username: `jose`
  Email: `collector-user@santini.local`
  Password: `123456`

These accounts are intended only for local development/testing.

## Run In Shared Supabase Mode

1. Create a Supabase project
2. Copy [.env.example](/Users/jose.santa/projects/Santini/.env.example) to `.env.local`
3. Fill in:

```bash
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
NEXT_PUBLIC_ENABLE_LOCAL_DEMO=false
```

4. Run the SQL schema in [schema.sql](/Users/jose.santa/projects/Santini/supabase/schema.sql)
5. Start the app:

```bash
npm run dev
```

## Create Initial Shared Users

Use [bootstrap-users.mjs](/Users/jose.santa/projects/Santini/scripts/bootstrap-users.mjs) after Supabase is configured:

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

Then mark the trusted admin account in Supabase:

- set `profiles.is_admin = true`

## Useful Commands

```bash
npm run dev
npm run lint
npm run build
npm audit --omit=dev
```

## Important Environment Notes

- `NEXT_PUBLIC_ENABLE_LOCAL_DEMO=true` enables browser-only local demo auth
- if Supabase env vars are present, the app uses shared auth/data mode
- if neither Supabase nor local demo mode is enabled, login is blocked by design

## Security Notes

- promo codes are hashed in Supabase
- invite tokens are hashed in Supabase
- local demo mode should stay off in deployed environments
- Supabase schema changes must be reapplied when `supabase/schema.sql` changes

## Known Residual Risk

The main remaining hardening gap is abuse control at the API layer:

- Supabase RPCs do not yet have true rate limiting
- invite validation is reduced, but still internet-facing by design

For production, consider putting sensitive flows behind rate-limited edge functions or additional abuse protection.
