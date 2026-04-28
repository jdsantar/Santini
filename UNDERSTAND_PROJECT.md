# Understand Santini

This file explains how Santini is organized, how the product works, and where to change things.

## Product Summary

Santini is a digital collectible album inspired by World Cup sticker books. A collector logs in, opens packs, fills team pages, tracks duplicates, and trades with other collectors.

Core product ideas:

- magazine-style album presentation
- one page flow centered on the album
- invite-only shared accounts
- pack-opening as the main gameplay loop
- duplicates power trading
- bonus rewards unlock extra packs instead of occupying album slots

## Main Code Areas

### App Shell

- [page.tsx](/Users/jose.santa/projects/Santini/src/app/page.tsx)
  This is the main client application. It contains:
  - auth screen
  - album screen
  - profile and settings views
  - pack reveal modal
  - local state flow
  - Supabase-mode interactions

- [globals.css](/Users/jose.santa/projects/Santini/src/app/globals.css)
  All visual styling lives here:
  - theme colors
  - album layout
  - responsive behavior
  - sticker cards
  - auth screen styling
  - pack animation styling

### Data Model

- [santini-data.ts](/Users/jose.santa/projects/Santini/src/lib/santini-data.ts)
  Static domain data:
  - teams
  - players
  - album sets
  - stadium cards
  - seeded users
  - pack constants
  - promo pack options

If you want to add new teams, new cards, or future foil/special sets, this is one of the main places to extend first.

### Local Gameplay Logic

- [santini-logic.ts](/Users/jose.santa/projects/Santini/src/lib/santini-logic.ts)
  Browser-side gameplay logic:
  - pack opening
  - duplicate detection
  - progress calculation
  - promo code handling
  - trade resolution for local mode

### Shared Multiplayer Logic

- [santini-supabase.ts](/Users/jose.santa/projects/Santini/src/lib/santini-supabase.ts)
  Frontend wrapper around Supabase:
  - sign in
  - invite validation
  - pack opening RPCs
  - promo code RPCs
  - trade offer RPCs
  - snapshot loading

- [supabase-browser.ts](/Users/jose.santa/projects/Santini/src/lib/supabase-browser.ts)
  Controls whether Supabase mode is active and builds the browser client.

### Database And Security

- [schema.sql](/Users/jose.santa/projects/Santini/supabase/schema.sql)
  This is the backend heart of shared mode:
  - table creation
  - RLS policies
  - invite flow
  - profile creation trigger
  - secure promo code redemption
  - pack opening RPC
  - trade offer RPCs

## Modes Of Operation

### 1. Local Demo Mode

Used for local testing only.

- enabled with `NEXT_PUBLIC_ENABLE_LOCAL_DEMO=true`
- stores state in browser `localStorage`
- uses built-in demo collectors
- does not require Supabase

### 2. Shared Supabase Mode

Used for real multiplayer behavior.

- enabled by setting Supabase URL and anon key
- uses Supabase Auth
- uses invite-based account creation
- stores album state in Postgres
- supports shared trades and shared promo code workflows

## Collector Flow

1. User signs in or accepts an invite
2. User receives starter packs
3. User opens packs
4. Album pages fill with collected cards
5. Duplicates become available for trades
6. Bonus rewards can unlock extra packs

## Pack Logic

The app is designed to feel collectible, but less punishing than fully random physical collation.

- packs contain 5 cards
- pack selection tries to help completion
- duplicates still appear
- bonus rewards are separate from album completion

## Theme System

The settings view includes World Cup-inspired themes such as:

- Mexico 86
- USA 94
- Korea/Japan 02
- South Africa 10
- Brazil 14
- Qatar 22
- 2026

Theme state is applied from the main page component and styled through CSS custom properties.

## Where To Change Common Things

### Add or edit cards

- update [santini-data.ts](/Users/jose.santa/projects/Santini/src/lib/santini-data.ts)

### Change pack behavior

- update [santini-logic.ts](/Users/jose.santa/projects/Santini/src/lib/santini-logic.ts)
- if shared mode must match, also update [schema.sql](/Users/jose.santa/projects/Santini/supabase/schema.sql)

### Change login or invite rules

- update [page.tsx](/Users/jose.santa/projects/Santini/src/app/page.tsx)
- update [santini-supabase.ts](/Users/jose.santa/projects/Santini/src/lib/santini-supabase.ts)
- update [schema.sql](/Users/jose.santa/projects/Santini/supabase/schema.sql)

### Change visuals

- layout/components: [page.tsx](/Users/jose.santa/projects/Santini/src/app/page.tsx)
- styling: [globals.css](/Users/jose.santa/projects/Santini/src/app/globals.css)

## Security Shape

Current protections include:

- invite-only shared signup
- hashed invite tokens
- hashed promo codes
- explicit admin role in profiles
- RLS policies
- restricted RPC grants
- tighter CSP in production

Residual caution:

- local demo mode should not be enabled in production
- Supabase RPC abuse/rate limiting is still a worthwhile future hardening step

## Good Next Improvements

- add true rate limiting for sensitive RPCs
- move sensitive flows to edge functions if needed
- split album UI into smaller components
- add tests for pack collation and invite flows
- add migrations instead of relying on a single evolving schema file
