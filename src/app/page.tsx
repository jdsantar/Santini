"use client";

import { FormEvent, type ReactNode, useEffect, useMemo, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import {
  ALBUM_SETS,
  HOST_STADIUMS,
  PACK_SIZE,
  PROMO_PACK_OPTIONS,
  SEED_USERS,
  STARTER_PACK_CREDITS,
  STADIUM_CARDS,
  TEAM_GUIDES,
  TOURNAMENT_CARDS,
  type Card,
  type PromoCode,
  type Stadium,
  type TeamGuide,
  type TradeOffer,
  type TradeUser,
} from "@/lib/santini-data";
import {
  createPromoCode,
  formatCopyLabel,
  formatCountLabel,
  getCollectionProgress,
  getDuplicateEntries,
  getOwnedCount,
  getPackAssistLabel,
  openRandomPack,
  redeemPromoCode,
  resolveTrade,
} from "@/lib/santini-logic";
import {
  createRemoteInvite,
  createRemotePromoCode,
  createRemoteTradeOffer,
  loadRemoteAlbumSnapshot,
  openRemotePack,
  redeemRemotePromoCode,
  respondToRemoteTradeOffer,
  signInCollector,
  signUpCollector,
  signOutCollector,
  validateInvite,
  type RemoteAlbumSnapshot,
} from "@/lib/santini-supabase";
import { getSupabaseBrowserClient, isSupabaseEnabled } from "@/lib/supabase-browser";

const STORAGE_KEY = "santini-album-state";
const LOCAL_ACCOUNTS_KEY = "santini-local-accounts";
const THEME_KEY = "santini-theme";

type DailyCodeRequest = {
  id: string;
  userId: string;
  userName: string;
  requestedOn: string;
  status: "pending" | "fulfilled";
  fulfilledCode?: string;
};

type AlbumState = {
  activeUserId: string;
  users: TradeUser[];
  promoCodes: PromoCode[];
  incomingOffers?: TradeOffer[];
  outgoingOffers?: TradeOffer[];
  dailyCodeRequests: DailyCodeRequest[];
  lastOpenedPack: {
    userId: string;
    cards: Card[];
    bonusCode?: string;
    source: string;
  } | null;
};

type LocalAuthAccount = {
  userId: string;
  email: string;
  username: string;
  displayName: string;
  passwordHash: string;
  isAdmin: boolean;
};

type Screen = "album" | "profile" | "settings";
type AlbumView = "stickers" | "formation";
type AuthMode = "signin" | "invite";
type ThemeId = "mexico-86" | "usa-94" | "korea-japan-02" | "south-africa-10" | "brazil-14" | "qatar-22" | "north-america-26";
const DEFAULT_THEME_ID: ThemeId = "north-america-26";

const defaultState: AlbumState = {
  activeUserId: SEED_USERS[1].id,
  users: SEED_USERS,
  promoCodes: [],
  dailyCodeRequests: [],
  lastOpenedPack: null,
};

const THEME_OPTIONS: Array<{
  id: ThemeId;
  label: string;
  background: string;
  paper: string;
  ink: string;
  accent: string;
  accent2: string;
}> = [
  {
    id: "mexico-86",
    label: "Mexico 86",
    background: "linear-gradient(180deg, #0f3d2d 0%, #082018 100%)",
    paper: "rgba(255, 248, 236, 0.95)",
    ink: "#1d241e",
    accent: "#d84b2a",
    accent2: "#2f8f53",
  },
  {
    id: "usa-94",
    label: "USA 94",
    background: "linear-gradient(180deg, #102552 0%, #09152d 100%)",
    paper: "rgba(247, 248, 255, 0.95)",
    ink: "#142033",
    accent: "#d4333f",
    accent2: "#2e67d1",
  },
  {
    id: "korea-japan-02",
    label: "Korea/Japan 02",
    background: "linear-gradient(180deg, #4c142d 0%, #1c0b12 100%)",
    paper: "rgba(255, 247, 250, 0.95)",
    ink: "#2a1c23",
    accent: "#e45166",
    accent2: "#c28d33",
  },
  {
    id: "south-africa-10",
    label: "South Africa 10",
    background: "linear-gradient(180deg, #4f2c0f 0%, #1b140b 100%)",
    paper: "rgba(255, 249, 239, 0.95)",
    ink: "#2a2018",
    accent: "#f18a1d",
    accent2: "#2f9c62",
  },
  {
    id: "brazil-14",
    label: "Brazil 14",
    background: "linear-gradient(180deg, #0e3f35 0%, #061b17 100%)",
    paper: "rgba(250, 252, 241, 0.95)",
    ink: "#1d2417",
    accent: "#ffd44d",
    accent2: "#19a86a",
  },
  {
    id: "qatar-22",
    label: "Qatar 22",
    background: "linear-gradient(180deg, #4a1630 0%, #14070d 100%)",
    paper: "rgba(255, 247, 250, 0.95)",
    ink: "#26141d",
    accent: "#b82b5e",
    accent2: "#d9a25f",
  },
  {
    id: "north-america-26",
    label: "2026",
    background: "linear-gradient(180deg, #0b1716 0%, #081010 100%)",
    paper: "rgba(255, 249, 242, 0.94)",
    ink: "#17211d",
    accent: "#ff7b3f",
    accent2: "#13b6a5",
  },
];

function normalizeAlbumState(input: Partial<AlbumState> | null | undefined): AlbumState {
  const users = (input?.users?.length ? input.users : defaultState.users).map((user, index) => {
    const fallback = defaultState.users[index] ?? defaultState.users[0];

    return {
      id: user?.id ?? fallback.id,
      name: user?.name ?? fallback.name,
      isAdmin: user?.isAdmin ?? fallback.isAdmin,
      collection: user?.collection ?? {},
      packsOpened: user?.packsOpened ?? 0,
      packCredits: user?.packCredits ?? STARTER_PACK_CREDITS,
      bonusCodes: user?.bonusCodes ?? [],
      lastCodeRequestOn: user?.lastCodeRequestOn ?? null,
    };
  });
  const activeUserId = input?.activeUserId ?? defaultState.activeUserId;

  return {
    activeUserId: users.some((user) => user.id === activeUserId) ? activeUserId : users[0]?.id ?? defaultState.activeUserId,
    users,
    promoCodes: input?.promoCodes ?? [],
    incomingOffers: input?.incomingOffers ?? [],
    outgoingOffers: input?.outgoingOffers ?? [],
    dailyCodeRequests: input?.dailyCodeRequests ?? [],
    lastOpenedPack: input?.lastOpenedPack ?? null,
  };
}

function createDefaultUserRecord(account: LocalAuthAccount): TradeUser {
  return {
    id: account.userId,
    name: account.displayName,
    isAdmin: account.isAdmin,
    collection: {},
    packsOpened: 0,
    packCredits: STARTER_PACK_CREDITS,
    bonusCodes: [],
    lastCodeRequestOn: null,
  };
}

function ensureCollectorState(state: AlbumState, account: LocalAuthAccount): AlbumState {
  const existing = state.users.find((user) => user.id === account.userId);

  if (existing) {
    return {
      ...state,
      activeUserId: account.userId,
      users: state.users.map((user) =>
        user.id === account.userId
          ? {
              ...user,
              name: user.name || account.displayName,
              isAdmin: account.isAdmin,
              packCredits: typeof user.packCredits === "number" ? user.packCredits : STARTER_PACK_CREDITS,
              bonusCodes: user.bonusCodes ?? [],
            }
          : user,
      ),
    };
  }

  return {
    ...state,
    activeUserId: account.userId,
    users: [...state.users, createDefaultUserRecord(account)],
  };
}

function BookIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="nav-icon">
      <path d="M5 4.5C5 3.67 5.67 3 6.5 3H18a1 1 0 0 1 1 1v14.5a2.5 2.5 0 0 0-2.5-2.5H7.5A2.5 2.5 0 0 0 5 18.5z" fill="currentColor" opacity="0.28" />
      <path d="M6.5 4h10.8v11.1h-9.8A3.4 3.4 0 0 0 6 15.45V4.5A.5.5 0 0 1 6.5 4Zm0 12.1h10A1.5 1.5 0 0 1 18 17.6V19H7.5A1.5 1.5 0 0 1 6 17.5a1.4 1.4 0 0 1 .5-1.4Z" fill="currentColor" />
    </svg>
  );
}

function PersonIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="nav-icon">
      <circle cx="12" cy="8" r="3.2" fill="currentColor" />
      <path d="M4.5 19.2c.55-3.1 3.32-5.2 7.5-5.2s6.95 2.1 7.5 5.2a.6.6 0 0 1-.6.8H5.1a.6.6 0 0 1-.6-.8Z" fill="currentColor" opacity="0.92" />
    </svg>
  );
}

function GearIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="nav-icon">
      <path d="m9.9 3.6.45 1.86a6.74 6.74 0 0 1 1.65 0l.45-1.86h2.1l.45 1.86c.57.17 1.1.4 1.6.68l1.6-1.03 1.48 1.48-1.03 1.6c.28.5.5 1.03.68 1.6l1.86.45v2.1l-1.86.45a6.7 6.7 0 0 1-.68 1.6l1.03 1.6-1.48 1.48-1.6-1.03a6.3 6.3 0 0 1-1.6.68l-.45 1.86h-2.1l-.45-1.86a6.74 6.74 0 0 1-1.65 0l-.45 1.86H9.9l-.45-1.86a6.3 6.3 0 0 1-1.6-.68l-1.6 1.03-1.48-1.48 1.03-1.6a6.7 6.7 0 0 1-.68-1.6l-1.86-.45v-2.1l1.86-.45c.17-.57.4-1.1.68-1.6l-1.03-1.6L6.25 4.1l1.6 1.03c.5-.28 1.03-.5 1.6-.68l.45-1.86zm2.1 5.4a3 3 0 1 0 0 6 3 3 0 0 0 0-6Z" fill="currentColor" />
    </svg>
  );
}

const DEFAULT_LOCAL_ACCOUNTS: LocalAuthAccount[] = [
  {
    userId: "admin-santini",
    email: "collector-admin@santini.local",
    username: "santini",
    displayName: "santini",
    passwordHash: "cb67af73d76be6860da786802fa9b6d57985805a852fc363794d780a494132db",
    isAdmin: true,
  },
  {
    userId: "jose",
    email: "collector-user@santini.local",
    username: "jose",
    displayName: "Jose",
    passwordHash: "8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92",
    isAdmin: false,
  },
];

function defaultEmailForUserId(userId: string) {
  if (userId === "admin-santini") {
    return "collector-admin@santini.local";
  }

  if (userId === "jose") {
    return "collector-user@santini.local";
  }

  return `${userId}@santini.local`;
}

function normalizeLocalAccounts(input: Partial<LocalAuthAccount>[] | null | undefined): LocalAuthAccount[] {
  if (!input?.length) {
    return DEFAULT_LOCAL_ACCOUNTS;
  }

  return input.map((account, index) => {
    const fallback = DEFAULT_LOCAL_ACCOUNTS[index] ?? DEFAULT_LOCAL_ACCOUNTS[0];
    const userId = account.userId ?? fallback.userId;

    return {
      userId,
      email: account.email ?? defaultEmailForUserId(userId),
      username: account.username ?? fallback.username,
      displayName: account.displayName ?? fallback.displayName,
      passwordHash: account.passwordHash ?? fallback.passwordHash,
      isAdmin: account.isAdmin ?? fallback.isAdmin,
    };
  });
}

function todayKey() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function buildPlayerArt(card: Card) {
  if (card.cardType === "stadium") {
    return buildStadiumArt(card);
  }

  const seed = Array.from(card.id).reduce((total, char) => total + char.charCodeAt(0), 0);
  const skinTones = ["#f0c7a5", "#d8a27f", "#b97e5c", "#8d5a3b"];
  const hairTones = ["#201915", "#4a321f", "#6f4a2c", "#0f0f10"];
  const jerseyAccent = seed % 2 === 0 ? "rgba(255,255,255,0.22)" : "rgba(255,255,255,0.12)";
  const skin = skinTones[seed % skinTones.length];
  const hair = hairTones[seed % hairTones.length];
  const initials = card.player
    .split(" ")
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 280 360">
      <defs>
        <linearGradient id="g" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0%" stop-color="${card.accent}" />
          <stop offset="100%" stop-color="#10211b" />
        </linearGradient>
        <linearGradient id="shirt" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stop-color="${jerseyAccent}" />
          <stop offset="100%" stop-color="rgba(12,18,17,0.15)" />
        </linearGradient>
      </defs>
      <rect width="280" height="360" rx="28" fill="url(#g)" />
      <circle cx="72" cy="74" r="86" fill="rgba(255,255,255,0.08)" />
      <circle cx="222" cy="300" r="72" fill="rgba(255,255,255,0.08)" />
      <path d="M72 300c8-72 52-110 68-118 16 8 60 46 68 118" fill="url(#shirt)" />
      <path d="M96 284c8-42 28-66 44-76 16 10 36 34 44 76" fill="rgba(255,255,255,0.16)" />
      <ellipse cx="140" cy="126" rx="52" ry="60" fill="${skin}" />
      <path d="M88 120c4-38 26-60 52-60 26 0 48 22 52 60-10-18-32-28-52-28-20 0-42 10-52 28Z" fill="${hair}" />
      <path d="M92 112c8-28 28-42 48-42s40 14 48 42" fill="${hair}" />
      <ellipse cx="122" cy="128" rx="5" ry="6" fill="#1b1b1b" />
      <ellipse cx="158" cy="128" rx="5" ry="6" fill="#1b1b1b" />
      <path d="M127 150c7 6 19 6 26 0" fill="none" stroke="#8c4c38" stroke-width="4" stroke-linecap="round" />
      <path d="M140 166v24" stroke="${skin}" stroke-width="14" stroke-linecap="round" />
      <path d="M88 298c8-46 30-74 52-88 22 14 44 42 52 88" fill="rgba(9,17,16,0.16)" />
      <path d="M106 214h68" stroke="rgba(255,255,255,0.26)" stroke-width="8" stroke-linecap="round" />
      <text x="140" y="324" text-anchor="middle" font-size="62" font-family="Arial, sans-serif" font-weight="700" fill="rgba(255,255,255,0.92)">${initials}</text>
    </svg>
  `;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

function buildStadiumArt(card: Card) {
  const city = card.city ?? card.country;
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 280 360">
      <defs>
        <linearGradient id="sky" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stop-color="${card.accent}" />
          <stop offset="100%" stop-color="#13211d" />
        </linearGradient>
      </defs>
      <rect width="280" height="360" rx="28" fill="url(#sky)" />
      <rect y="252" width="280" height="108" fill="#163325" />
      <ellipse cx="140" cy="234" rx="92" ry="56" fill="rgba(255,255,255,0.18)" />
      <rect x="56" y="150" width="168" height="78" rx="22" fill="rgba(255,255,255,0.24)" />
      <rect x="72" y="162" width="136" height="54" rx="18" fill="rgba(19,33,29,0.22)" />
      <path d="M40 250h200" stroke="rgba(255,255,255,0.34)" stroke-width="8" stroke-linecap="round" />
      <path d="M58 272h164" stroke="rgba(255,255,255,0.18)" stroke-width="12" stroke-linecap="round" />
      <text x="140" y="70" text-anchor="middle" font-size="22" font-family="Arial, sans-serif" font-weight="700" fill="rgba(255,255,255,0.94)">${city}</text>
      <text x="140" y="96" text-anchor="middle" font-size="13" font-family="Arial, sans-serif" fill="rgba(255,255,255,0.8)">${card.player}</text>
    </svg>
  `;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

function buildFlagArt(country: string, colors: string[]) {
  const bandHeight = 220 / colors.length;
  const basicStripes = colors
    .map(
      (color, index) =>
        `<rect x="0" y="${index * bandHeight}" width="320" height="${bandHeight}" fill="${color}" />`,
    )
    .join("");

  const svgByCountry: Record<string, string> = {
    Argentina: `
      <rect width="320" height="220" rx="28" fill="#74c8ff" />
      <rect y="73.33" width="320" height="73.33" fill="#ffffff" />
      <circle cx="160" cy="110" r="18" fill="#f5c542" />
    `,
    Brazil: `
      <rect width="320" height="220" rx="28" fill="#009b3a" />
      <polygon points="160,34 270,110 160,186 50,110" fill="#ffdf00" />
      <circle cx="160" cy="110" r="42" fill="#002776" />
      <path d="M120 102c24-12 56-12 80 0" fill="none" stroke="#ffffff" stroke-width="10" stroke-linecap="round" />
    `,
    France: `
      <rect width="320" height="220" rx="28" fill="#ffffff" />
      <rect width="106.66" height="220" fill="#1f3fb7" />
      <rect x="213.33" width="106.66" height="220" fill="#ef4444" />
    `,
    England: `
      <rect width="320" height="220" rx="28" fill="#ffffff" />
      <rect x="132" width="56" height="220" fill="#d81f26" />
      <rect y="82" width="320" height="56" fill="#d81f26" />
    `,
    Spain: `
      <rect width="320" height="220" rx="28" fill="#c81e1e" />
      <rect y="55" width="320" height="110" fill="#ffdf00" />
    `,
    Germany: `
      <rect width="320" height="220" rx="28" fill="#111111" />
      <rect y="73.33" width="320" height="73.33" fill="#c81e1e" />
      <rect y="146.66" width="320" height="73.34" fill="#ffdf00" />
    `,
    Mexico: `
      <rect width="320" height="220" rx="28" fill="#ffffff" />
      <rect width="106.66" height="220" fill="#006341" />
      <rect x="213.33" width="106.66" height="220" fill="#ce1126" />
      <circle cx="160" cy="110" r="18" fill="#b58b53" />
      <path d="M160 93c10 0 18 8 18 18s-8 18-18 18-18-8-18-18 8-18 18-18Z" fill="none" stroke="#7b5a2f" stroke-width="3" />
      <path d="M148 108c7-10 17-10 24 0" fill="none" stroke="#2c7a4b" stroke-width="4" stroke-linecap="round" />
      <path d="M147 119c8 8 18 8 26 0" fill="none" stroke="#b11f2c" stroke-width="4" stroke-linecap="round" />
    `,
    "United States": `
      <rect width="320" height="220" rx="28" fill="#ffffff" />
      <g fill="#b91c1c">
        <rect y="0" width="320" height="16.92" />
        <rect y="33.84" width="320" height="16.92" />
        <rect y="67.68" width="320" height="16.92" />
        <rect y="101.52" width="320" height="16.92" />
        <rect y="135.36" width="320" height="16.92" />
        <rect y="169.2" width="320" height="16.92" />
        <rect y="203.04" width="320" height="16.96" />
      </g>
      <rect width="138" height="118" fill="#1d4ed8" />
      <g fill="#ffffff">
        <circle cx="24" cy="20" r="4" /><circle cx="52" cy="20" r="4" /><circle cx="80" cy="20" r="4" /><circle cx="108" cy="20" r="4" />
        <circle cx="38" cy="40" r="4" /><circle cx="66" cy="40" r="4" /><circle cx="94" cy="40" r="4" />
        <circle cx="24" cy="60" r="4" /><circle cx="52" cy="60" r="4" /><circle cx="80" cy="60" r="4" /><circle cx="108" cy="60" r="4" />
      </g>
    `,
    Canada: `
      <rect width="320" height="220" rx="28" fill="#ffffff" />
      <rect width="72" height="220" fill="#d32f2f" />
      <rect x="248" width="72" height="220" fill="#d32f2f" />
      <path d="M160 58 152 84l-20-8 9 22-22 4 18 12-14 20 23-8 5 26 9-23 9 23 5-26 23 8-14-20 18-12-22-4 9-22-20 8z" fill="#d32f2f" />
    `,
    Japan: `
      <rect width="320" height="220" rx="28" fill="#ffffff" />
      <circle cx="160" cy="110" r="48" fill="#d81f3f" />
    `,
    Morocco: `
      <rect width="320" height="220" rx="28" fill="#b91c1c" />
      <path d="M160 68 171 101h35l-28 20 11 33-29-20-29 20 11-33-28-20h35z" fill="none" stroke="#0f7a3d" stroke-width="8" stroke-linejoin="round" />
    `,
    "South Korea": `
      <rect width="320" height="220" rx="28" fill="#ffffff" />
      <path d="M160 72a38 38 0 0 1 0 76c-21 0-38-17-38-38 0-21 17-38 38-38Z" fill="#ef4444" />
      <path d="M160 148a38 38 0 0 1 0-76c21 0 38 17 38 38 0 21-17 38-38 38Z" fill="#1d4ed8" />
    `,
  };

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 220">
      <clipPath id="flagClip">
        <rect width="320" height="220" rx="28" />
      </clipPath>
      <g clip-path="url(#flagClip)">
        ${svgByCountry[country] ?? basicStripes}
      </g>
    </svg>
  `;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

function buildCrestArt(label: string, accent: string) {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 280">
      <defs>
        <linearGradient id="crest" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0%" stop-color="${accent}" />
          <stop offset="100%" stop-color="#0d1f1a" />
        </linearGradient>
      </defs>
      <path d="M120 18 202 54v78c0 56-33 96-82 128-49-32-82-72-82-128V54z" fill="url(#crest)" />
      <path d="M120 44 182 70v58c0 46-24 76-62 102-38-26-62-56-62-102V70z" fill="rgba(255,255,255,0.18)" />
      <text x="120" y="154" text-anchor="middle" font-size="42" font-family="Arial, sans-serif" font-weight="700" fill="#fff">${label}</text>
    </svg>
  `;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

function buildCoachArt(name: string, accent: string) {
  const initials = name
    .split(" ")
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 220">
      <defs>
        <linearGradient id="desk" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0%" stop-color="${accent}" />
          <stop offset="100%" stop-color="#0d1f1a" />
        </linearGradient>
      </defs>
      <rect width="320" height="220" rx="28" fill="url(#desk)" />
      <rect x="62" y="56" width="196" height="104" rx="18" fill="rgba(255,255,255,0.16)" />
      <text x="160" y="118" text-anchor="middle" font-size="52" font-family="Arial, sans-serif" font-weight="700" fill="#fff">${initials}</text>
      <path d="M84 178h152" stroke="rgba(255,255,255,0.6)" stroke-width="4" stroke-linecap="round" />
    </svg>
  `;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

async function sha256Hex(value: string) {
  const bytes = new TextEncoder().encode(value);
  const digest = await window.crypto.subtle.digest("SHA-256", bytes);

  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

function MagazineSticker({ card, ownedCount }: { card: Card; ownedCount: number }) {
  const owned = ownedCount > 0;

  return (
    <article className={owned ? "mag-sticker mag-sticker-owned" : "mag-sticker"}>
      <div className="mag-sticker-topline">
        <span>{card.number}</span>
        <span>{card.slot}</span>
      </div>
      <div
        className="mag-sticker-art"
        style={{
          backgroundImage: `url("${buildPlayerArt(card)}")`,
        }}
      />
      <div className="mag-sticker-copy">
        <strong>{card.player}</strong>
        <span>{card.cardType === "stadium" ? `${card.city}, ${card.country}` : card.position}</span>
      </div>
      <p className="mag-sticker-state">
        {owned ? `${formatCopyLabel(ownedCount)} owned` : "Missing"}
        {card.cardType === "stadium" && card.caption ? ` · ${card.caption}` : ""}
      </p>
    </article>
  );
}

function EditorialCard({
  title,
  subtitle,
  image,
}: {
  title: string;
  subtitle: string;
  image: string;
}) {
  return (
    <article className="editorial-card">
      <div className="editorial-art" style={{ backgroundImage: `url("${image}")` }} />
      <div className="editorial-copy">
        <p>{subtitle}</p>
        <strong>{title}</strong>
      </div>
    </article>
  );
}

function FormationBoard({
  team,
  collection,
}: {
  team: TeamGuide;
  collection: Record<string, number>;
}) {
  const slots = [
    ...team.formation.attack.map((id, index) => ({ id, x: 14 + index * 36, y: 18 })),
    ...team.formation.midfield.map((id, index) => ({ id, x: 14 + index * 36, y: 44 })),
    ...team.formation.defense.map((id, index) => ({ id, x: 14 + index * 36, y: 70 })),
    { id: team.formation.goalkeeper, x: 42, y: 86 },
  ];

  return (
    <div className="formation-pitch">
      {slots.map((slot) => {
        const card = team.cards.find((entry) => entry.id === slot.id);

        if (!card) {
          return null;
        }

        const owned = getOwnedCount(collection, card.id) > 0;

        return (
          <article
            key={card.id}
            className={owned ? "formation-card formation-card-owned" : "formation-card"}
            style={{
              left: `${slot.x}%`,
              top: `${slot.y}%`,
            }}
          >
            <span>{card.slot}</span>
            <strong>{card.player}</strong>
          </article>
        );
      })}
    </div>
  );
}

function PackRevealModal({
  pack,
  onClose,
}: {
  pack: AlbumState["lastOpenedPack"];
  onClose: () => void;
}) {
  const [phase, setPhase] = useState<"sealed" | "burst" | "cards">("sealed");

  useEffect(() => {
    if (!pack) {
      return;
    }

    const burstTimer = window.setTimeout(() => setPhase("burst"), 850);
    const cardsTimer = window.setTimeout(() => setPhase("cards"), 1500);

    return () => {
      window.clearTimeout(burstTimer);
      window.clearTimeout(cardsTimer);
    };
  }, [pack]);

  if (!pack) {
    return null;
  }

  return (
    <div className="pack-overlay" role="dialog" aria-modal="true">
      <div className="pack-modal">
        <div className="pack-modal-header">
          <div>
            <p className="section-kicker">Pack reveal</p>
            <h2>{phase === "cards" ? `You opened ${PACK_SIZE} new stickers` : "Opening booster pack"}</h2>
          </div>
          <button className="ghost-button" type="button" onClick={onClose}>
            Close
          </button>
        </div>
        {phase === "cards" ? (
          <div className="pack-reveal-grid">
            {pack.cards.map((card, index) => (
              <article
                key={`${card.id}-${index}`}
                className="reveal-sticker"
                style={{ animationDelay: `${index * 140}ms` }}
              >
                <div className="reveal-flag-wrap">
                  <div
                    className="reveal-flag"
                    style={{
                      backgroundImage: `url("${buildFlagArt(card.country, TEAM_GUIDES.find((team) => team.country === card.country)?.flagColors ?? ["#ffffff"])}")`,
                    }}
                  />
                </div>
                <div
                  className="reveal-art"
                  style={{
                    backgroundImage: `url("${buildPlayerArt(card)}")`,
                  }}
                />
                <strong>{card.player}</strong>
                <span>{card.country}</span>
                <span>{card.position}</span>
              </article>
            ))}
          </div>
        ) : (
          <div className="booster-stage">
            <div className={phase === "burst" ? "booster-pack booster-pack-burst" : "booster-pack"}>
              <div className="booster-pack-sigil">S</div>
              <span>Santini Pack</span>
            </div>
            <div className={phase === "burst" ? "booster-flare booster-flare-live" : "booster-flare"} />
          </div>
        )}
        {pack.bonusCode ? (
          <div className="bonus-callout">
            <p className="section-kicker">Bonus unlocked</p>
            <strong>{pack.bonusCode}</strong>
            <span>This bonus is not part of the album. Redeem it for one extra pack.</span>
          </div>
        ) : null}
      </div>
    </div>
  );
}

function StadiumCard({ stadium }: { stadium: Stadium }) {
  return (
    <article className="stadium-card">
      <div className="stadium-dot" style={{ background: stadium.accent }} />
      <div>
        <strong>{stadium.name}</strong>
        <p>
          {stadium.city}, {stadium.country}
        </p>
      </div>
      <span>{stadium.capacity}</span>
    </article>
  );
}

function buildMascotArt(themeId: ThemeId) {
  const mascotMap: Record<ThemeId, { label: string; face: string; accent: string; accent2: string }> = {
    "mexico-86": { label: "Pique", face: "M86", accent: "#d84b2a", accent2: "#2f8f53" },
    "usa-94": { label: "Striker", face: "U94", accent: "#d4333f", accent2: "#2e67d1" },
    "korea-japan-02": { label: "The Spheriks", face: "02", accent: "#e45166", accent2: "#c28d33" },
    "south-africa-10": { label: "Zakumi", face: "10", accent: "#f18a1d", accent2: "#2f9c62" },
    "brazil-14": { label: "Fuleco", face: "14", accent: "#ffd44d", accent2: "#19a86a" },
    "qatar-22": { label: "Laeeb", face: "22", accent: "#b82b5e", accent2: "#d9a25f" },
    "north-america-26": { label: "2026 Spirit", face: "26", accent: "#ff7b3f", accent2: "#13b6a5" },
  };
  const mascot = mascotMap[themeId];
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 220 220">
      <defs>
        <linearGradient id="m" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0%" stop-color="${mascot.accent}" />
          <stop offset="100%" stop-color="${mascot.accent2}" />
        </linearGradient>
      </defs>
      <rect width="220" height="220" rx="46" fill="url(#m)" />
      <circle cx="110" cy="88" r="48" fill="rgba(255,255,255,0.28)" />
      <ellipse cx="92" cy="86" rx="8" ry="11" fill="#111" />
      <ellipse cx="128" cy="86" rx="8" ry="11" fill="#111" />
      <path d="M88 116c12 12 32 12 44 0" fill="none" stroke="#111" stroke-width="6" stroke-linecap="round" />
      <text x="110" y="182" text-anchor="middle" font-size="34" font-family="Arial, sans-serif" font-weight="700" fill="rgba(255,255,255,0.96)">${mascot.face}</text>
    </svg>
  `;

  return { image: `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`, label: mascot.label };
}

export default function Home() {
  const supabaseEnabled = isSupabaseEnabled();
  const teamPages = useMemo(() => TEAM_GUIDES, []);

  const [localState, setLocalState] = useState<AlbumState>(defaultState);
  const [remoteSnapshot, setRemoteSnapshot] = useState<RemoteAlbumSnapshot | null>(null);
  const [remoteLastOpenedPack, setRemoteLastOpenedPack] = useState<AlbumState["lastOpenedPack"]>(null);
  const [localAccounts, setLocalAccounts] = useState<LocalAuthAccount[]>(DEFAULT_LOCAL_ACCOUNTS);
  const [localSessionUserId, setLocalSessionUserId] = useState<string | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const [remoteLoading, setRemoteLoading] = useState(supabaseEnabled);
  const [screen, setScreen] = useState<Screen>("album");
  const [albumView, setAlbumView] = useState<AlbumView>("stickers");
  const [authMode, setAuthMode] = useState<AuthMode>("signin");
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  const [inviteDisplayName, setInviteDisplayName] = useState("");
  const [profileUsername, setProfileUsername] = useState("");
  const [profileDisplayName, setProfileDisplayName] = useState("");
  const [profilePassword, setProfilePassword] = useState("");
  const [latestSecureCode, setLatestSecureCode] = useState<string | null>(null);
  const [latestInviteCode, setLatestInviteCode] = useState<string | null>(null);
  const [redeemCodeValue, setRedeemCodeValue] = useState("");
  const [promoPackAmount, setPromoPackAmount] = useState(PROMO_PACK_OPTIONS[0]);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteName, setInviteName] = useState("");
  const [inviteRole, setInviteRole] = useState<"collector" | "admin">("collector");
  const [tradePartnerId, setTradePartnerId] = useState("");
  const [offeredCardId, setOfferedCardId] = useState("");
  const [requestedCardId, setRequestedCardId] = useState("");
  const [selectedTeamId, setSelectedTeamId] = useState(teamPages[0]?.id ?? "");
  const [notice, setNotice] = useState("Sign in with your invited email to open the album.");
  const [revealedPack, setRevealedPack] = useState<AlbumState["lastOpenedPack"]>(null);
  const [themeId, setThemeId] = useState<ThemeId>(DEFAULT_THEME_ID);

  useEffect(() => {
    if (supabaseEnabled) {
      setHydrated(true);
      return;
    }

    const storedState = window.localStorage.getItem(STORAGE_KEY);
    const storedAccounts = window.localStorage.getItem(LOCAL_ACCOUNTS_KEY);

    if (storedState) {
      try {
        setLocalState(normalizeAlbumState(JSON.parse(storedState) as Partial<AlbumState>));
      } catch {
        window.localStorage.removeItem(STORAGE_KEY);
      }
    }

    if (storedAccounts) {
      try {
        setLocalAccounts(normalizeLocalAccounts(JSON.parse(storedAccounts) as Partial<LocalAuthAccount>[]));
      } catch {
        window.localStorage.removeItem(LOCAL_ACCOUNTS_KEY);
      }
    }

    const storedTheme = window.localStorage.getItem(THEME_KEY) as ThemeId | null;

    if (storedTheme && THEME_OPTIONS.some((theme) => theme.id === storedTheme)) {
      setThemeId(storedTheme);
    } else {
      setThemeId(DEFAULT_THEME_ID);
    }

    setHydrated(true);
  }, [supabaseEnabled]);

  useEffect(() => {
    if (!hydrated || supabaseEnabled) {
      return;
    }

    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(localState));
    window.localStorage.setItem(LOCAL_ACCOUNTS_KEY, JSON.stringify(localAccounts));
    window.localStorage.setItem(THEME_KEY, themeId);
  }, [hydrated, localAccounts, localState, supabaseEnabled, themeId]);

  useEffect(() => {
    if (!supabaseEnabled) {
      return;
    }

    const client = getSupabaseBrowserClient();

    if (!client) {
      setRemoteLoading(false);
      return;
    }

    let active = true;

    client.auth.getSession().then(({ data, error }) => {
      if (!active) {
        return;
      }

      if (error) {
        setNotice(error.message);
      }

      setSession(data.session);
      setRemoteLoading(false);
    });

    const {
      data: { subscription },
    } = client.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, [supabaseEnabled]);

  useEffect(() => {
    if (!supabaseEnabled) {
      return;
    }

    const resolvedClient = getSupabaseBrowserClient();
    const activeSession = session;

    if (!resolvedClient || !activeSession) {
      setRemoteSnapshot(null);
      setRemoteLastOpenedPack(null);
      return;
    }

    const client = resolvedClient;
    const currentSession = activeSession;
    let active = true;

    async function refreshSnapshot() {
      setRemoteLoading(true);

      try {
        const snapshot = await loadRemoteAlbumSnapshot(client, currentSession);

        if (active) {
          setRemoteSnapshot(snapshot);
        }
      } catch (error) {
        if (active) {
          setNotice(error instanceof Error ? error.message : "Could not load the shared Santini album.");
        }
      } finally {
        if (active) {
          setRemoteLoading(false);
        }
      }
    }

    void refreshSnapshot();

    return () => {
      active = false;
    };
  }, [session, supabaseEnabled]);

  const albumState = supabaseEnabled
    ? remoteSnapshot
      ? {
          activeUserId: remoteSnapshot.activeUserId,
          users: remoteSnapshot.users,
          promoCodes: [],
          dailyCodeRequests: [],
          incomingOffers: remoteSnapshot.incomingOffers,
          outgoingOffers: remoteSnapshot.outgoingOffers,
          lastOpenedPack: remoteLastOpenedPack,
        }
      : null
    : localState;

  const activeUserId = supabaseEnabled ? session?.user.id ?? null : localSessionUserId;
  const activeUser = albumState?.users.find((user) => user.id === (activeUserId ?? albumState.activeUserId)) ?? null;

  useEffect(() => {
    if (!supabaseEnabled && activeUserId && localState.activeUserId !== activeUserId) {
      setLocalState((current) => ({ ...current, activeUserId }));
    }
  }, [activeUserId, localState.activeUserId, supabaseEnabled]);

  const currentLocalAccount = !supabaseEnabled && activeUser
    ? localAccounts.find((account) => account.userId === activeUser.id) ?? null
    : null;
  const sessionLocalAccount = !supabaseEnabled && localSessionUserId
    ? localAccounts.find((account) => account.userId === localSessionUserId) ?? null
    : null;

  useEffect(() => {
    if (currentLocalAccount) {
      setProfileUsername(currentLocalAccount.username);
      setProfileDisplayName(currentLocalAccount.displayName);
    }
  }, [currentLocalAccount]);

  useEffect(() => {
    if (supabaseEnabled || !sessionLocalAccount || activeUser) {
      return;
    }

    setLocalState((current) => ensureCollectorState(current, sessionLocalAccount));
  }, [activeUser, sessionLocalAccount, supabaseEnabled]);

  const collectionProgress = activeUser
    ? getCollectionProgress(activeUser.collection)
    : { owned: 0, total: TOURNAMENT_CARDS.length, percentage: 0 };
  const duplicates = activeUser ? getDuplicateEntries(activeUser.collection) : [];
  const availablePartners = activeUser
    ? albumState?.users.filter((user) => user.id !== activeUser.id) ?? []
    : [];
  const offerableCards = duplicates.map((entry) => entry.card);
  const selectedTradePartnerId = availablePartners.some((user) => user.id === tradePartnerId)
    ? tradePartnerId
    : (availablePartners[0]?.id ?? "");
  const selectedOfferedCardId = offerableCards.some((card) => card.id === offeredCardId)
    ? offeredCardId
    : (offerableCards[0]?.id ?? "");
  const partnerInventory =
    albumState?.users.find((user) => user.id === selectedTradePartnerId)?.collection ?? {};
  const requestableCards = TOURNAMENT_CARDS.filter(
    (card) => getOwnedCount(partnerInventory, card.id) > 1 && card.id !== selectedOfferedCardId,
  );
  const selectedRequestedCardId = requestableCards.some((card) => card.id === requestedCardId)
    ? requestedCardId
    : (requestableCards[0]?.id ?? "");
  const incomingOffers = supabaseEnabled ? remoteSnapshot?.incomingOffers ?? [] : [];
  const outgoingOffers = supabaseEnabled ? remoteSnapshot?.outgoingOffers ?? [] : [];
  const activeTeam = teamPages.find((page) => page.id === selectedTeamId) ?? teamPages[0] ?? null;
  const activeTeamIndex = activeTeam ? teamPages.findIndex((page) => page.id === activeTeam.id) : 0;
  const requiresAuth = supabaseEnabled ? !session : !localSessionUserId;
  const latestOpenedCards = albumState?.lastOpenedPack?.cards ?? [];
  const todaysRequest = activeUser && !supabaseEnabled
    ? localState.dailyCodeRequests.find(
        (request) => request.userId === activeUser.id && request.requestedOn === todayKey(),
      ) ?? null
    : null;
  const pendingCodeRequests = !supabaseEnabled
    ? localState.dailyCodeRequests.filter((request) => request.status === "pending")
    : [];
  const activeTheme = THEME_OPTIONS.find((theme) => theme.id === themeId) ?? THEME_OPTIONS[THEME_OPTIONS.length - 1];

  async function reloadRemoteSnapshot() {
    const resolvedClient = getSupabaseBrowserClient();
    const activeSession = session;

    if (!resolvedClient || !activeSession) {
      return;
    }

    const client = resolvedClient;
    const currentSession = activeSession;
    setRemoteLoading(true);

    try {
      const snapshot = await loadRemoteAlbumSnapshot(client, currentSession);
      setRemoteSnapshot(snapshot);
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Could not refresh the shared album.");
    } finally {
      setRemoteLoading(false);
    }
  }

  async function handleAuth(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (supabaseEnabled) {
      const client = getSupabaseBrowserClient();

      if (!client) {
        setNotice("Add your Supabase URL and anon key before using shared auth.");
        return;
      }

      try {
        if (authMode === "invite") {
          const invite = await validateInvite(client, authEmail.trim(), inviteCode.trim());

          await signUpCollector(
            client,
            invite?.email ?? authEmail.trim(),
            authPassword,
            inviteDisplayName.trim() || invite?.invited_name || authEmail.trim().split("@")[0],
            inviteCode.trim(),
          );
          setAuthMode("signin");
          setInviteCode("");
          setAuthPassword("");
          setThemeId(DEFAULT_THEME_ID);
          setNotice("Invitation accepted. Sign in once your account is confirmed.");
          return;
        }

        await signInCollector(client, authEmail.trim(), authPassword);
        setAuthPassword("");
        setThemeId(DEFAULT_THEME_ID);
        setNotice("Welcome to the Santini album.");
      } catch (error) {
        setNotice(error instanceof Error ? error.message : "Authentication failed.");
      }

      return;
    }

    const normalized = authEmail.trim().toLowerCase();
    const account = localAccounts.find(
      (entry) => (entry.email ?? defaultEmailForUserId(entry.userId)).toLowerCase() === normalized,
    );

    if (!account) {
      setNotice("This album is invite-only. Ask the admin to add your personal email first.");
      return;
    }

    const inputHash = await sha256Hex(authPassword);

    if (inputHash !== account.passwordHash) {
      setNotice("Incorrect password.");
      return;
    }

    setLocalSessionUserId(account.userId);
    setLocalState((current) => ensureCollectorState(current, account));
    setAuthPassword("");
    setThemeId(DEFAULT_THEME_ID);
    setNotice(`Welcome back, ${account.displayName}.`);
  }

  async function handleCreateInvite(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const client = getSupabaseBrowserClient();

    if (!client) {
      setNotice("Supabase is not configured.");
      return;
    }

    try {
      const result = await createRemoteInvite(client, inviteEmail, inviteName, inviteRole);
      setLatestInviteCode(result?.invite_code ?? null);
      setInviteEmail("");
      setInviteName("");
      setInviteRole("collector");
      setNotice(`Invite created for ${result?.email ?? "collector"}. Share the code securely.`);
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Could not create invite.");
    }
  }

  async function handleLocalProfileSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!currentLocalAccount || !activeUser) {
      return;
    }

    const nextUsername = profileUsername.trim().toLowerCase();
    const nextDisplayName = profileDisplayName.trim();

    if (!nextUsername || !nextDisplayName) {
      setNotice("Username and display name are required.");
      return;
    }

    if (
      localAccounts.some(
        (account) => account.userId !== currentLocalAccount.userId && account.username === nextUsername,
      )
    ) {
      setNotice("That username is already in use.");
      return;
    }

    const nextPasswordHash = profilePassword
      ? await sha256Hex(profilePassword)
      : currentLocalAccount.passwordHash;

    setLocalAccounts((current) =>
      current.map((account) =>
        account.userId === currentLocalAccount.userId
          ? {
              ...account,
              username: nextUsername,
              displayName: nextDisplayName,
              passwordHash: nextPasswordHash,
            }
          : account,
      ),
    );
    setLocalState((current) => ({
      ...current,
      users: current.users.map((user) =>
        user.id === activeUser.id ? { ...user, name: nextDisplayName } : user,
      ),
    }));
    setProfilePassword("");
    setNotice("Profile updated.");
  }

  async function handleSignOut() {
    if (!supabaseEnabled) {
      setLocalSessionUserId(null);
      setScreen("album");
      setNotice("Signed out.");
      return;
    }

    const client = getSupabaseBrowserClient();

    if (!client) {
      return;
    }

    try {
      await signOutCollector(client);
      setScreen("album");
      setNotice("Signed out.");
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Could not sign out.");
    }
  }

  const handleOpenPack = async () => {
    if (!activeUser) {
      return;
    }

    if (supabaseEnabled) {
      const client = getSupabaseBrowserClient();

      if (!client) {
        setNotice("Supabase is not configured.");
        return;
      }

      try {
        const result = await openRemotePack(client);
        const openedPack = {
          userId: activeUser.id,
          cards: result.cards,
          bonusCode: result.bonusCode,
          source: "pack",
        };

        setRemoteLastOpenedPack(openedPack);
        setRevealedPack(openedPack);
        await reloadRemoteSnapshot();
        setNotice(
          result.bonusCode
            ? `Bonus reward unlocked: ${result.bonusCode}`
            : `${activeUser.name} opened a new pack.`,
        );
        if (result.bonusCode) {
          setLatestSecureCode(result.bonusCode);
        }
      } catch (error) {
        setNotice(error instanceof Error ? error.message : "Could not open a shared pack.");
      }

      return;
    }

    if (activeUser.packCredits < 1) {
      setNotice("No unopened packs left.");
      return;
    }

    const { updatedUser, openedCards, bonusCode } = openRandomPack(activeUser);
    const generatedBonusCode = bonusCode
      ? {
          code: bonusCode,
          packCount: 1,
          createdBy: updatedUser.name,
          redeemedBy: [],
        }
      : null;
    const openedPack = {
      userId: updatedUser.id,
      cards: openedCards,
      bonusCode,
      source: "pack",
    };

    setLocalState((current) => ({
      ...current,
      users: current.users.map((user) => (user.id === updatedUser.id ? updatedUser : user)),
      promoCodes: generatedBonusCode ? [generatedBonusCode, ...current.promoCodes] : current.promoCodes,
      lastOpenedPack: openedPack,
    }));
    setRevealedPack(openedPack);
    if (bonusCode) {
      setLatestSecureCode(bonusCode);
    }
    setNotice(
      bonusCode
        ? `Bonus reward unlocked: ${bonusCode}`
        : `${updatedUser.name} opened a new pack.`,
    );
  };

  const handleGenerateCode = async () => {
    if (!activeUser?.isAdmin) {
      setNotice("Only the admin account can generate promo codes.");
      return;
    }

    if (supabaseEnabled) {
      const client = getSupabaseBrowserClient();

      if (!client) {
        return;
      }

      try {
        const result = await createRemotePromoCode(client, promoPackAmount);
        await reloadRemoteSnapshot();
        setLatestSecureCode(result?.code ?? null);
        setNotice(`New secure code created for ${formatCountLabel(result?.pack_count ?? promoPackAmount)}.`);
      } catch (error) {
        setNotice(error instanceof Error ? error.message : "Could not create the promo code.");
      }

      return;
    }

    const newCode = createPromoCode(activeUser.name, promoPackAmount);
    setLocalState((current) => ({
      ...current,
      promoCodes: [newCode, ...current.promoCodes],
    }));
    setLatestSecureCode(newCode.code);
    setNotice(`New secure code created for ${formatCountLabel(newCode.packCount)}.`);
  };

  const handleRedeemCode = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!activeUser) {
      return;
    }

    if (supabaseEnabled) {
      const client = getSupabaseBrowserClient();

      if (!client) {
        return;
      }

      try {
        const result = await redeemRemotePromoCode(client, redeemCodeValue);
        await reloadRemoteSnapshot();
        setRedeemCodeValue("");
        setNotice(`${activeUser.name} received ${formatCountLabel(result?.pack_count ?? 0)}.`);
      } catch (error) {
        setNotice(error instanceof Error ? error.message : "Could not redeem that code.");
      }

      return;
    }

    const result = redeemPromoCode(redeemCodeValue.trim(), localState.promoCodes, activeUser.id);

    if (!result.ok) {
      setNotice(result.message);
      return;
    }

    setLocalState((current) => ({
      ...current,
      promoCodes: result.codes,
      users: current.users.map((user) =>
        user.id === activeUser.id
          ? { ...user, packCredits: user.packCredits + (result.code?.packCount ?? 0) }
          : user,
      ),
    }));
    setRedeemCodeValue("");
    setNotice(`${activeUser.name} received ${formatCountLabel(result.code?.packCount ?? 0)}.`);
  };

  const handleTrade = async () => {
    if (!activeUser) {
      return;
    }

    const partner = albumState?.users.find((user) => user.id === selectedTradePartnerId);

    if (!partner || !selectedOfferedCardId || !selectedRequestedCardId) {
      setNotice("Choose a partner and trade cards.");
      return;
    }

    if (supabaseEnabled) {
      const client = getSupabaseBrowserClient();

      if (!client) {
        return;
      }

      try {
        await createRemoteTradeOffer(client, partner.id, selectedOfferedCardId, selectedRequestedCardId);
        await reloadRemoteSnapshot();
        setNotice(`Trade offer sent to ${partner.name}.`);
      } catch (error) {
        setNotice(error instanceof Error ? error.message : "Could not create that trade offer.");
      }

      return;
    }

    const tradeResult = resolveTrade(activeUser, partner, selectedOfferedCardId, selectedRequestedCardId);

    if (!tradeResult.ok) {
      setNotice(tradeResult.message);
      return;
    }

    setLocalState((current) => ({
      ...current,
      users: current.users.map((user) => {
        if (user.id === tradeResult.from?.id) {
          return tradeResult.from;
        }
        if (user.id === tradeResult.to?.id) {
          return tradeResult.to;
        }
        return user;
      }),
    }));
    setNotice(tradeResult.message);
  };

  const handleTradeOfferResponse = async (offerId: string, action: "accept" | "reject") => {
    const client = getSupabaseBrowserClient();

    if (!client) {
      return;
    }

    try {
      await respondToRemoteTradeOffer(client, offerId, action);
      await reloadRemoteSnapshot();
      setNotice(action === "accept" ? "Trade offer accepted." : "Trade offer rejected.");
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Could not update that trade offer.");
    }
  };

  function handleRequestDailyCode() {
    if (!activeUser || supabaseEnabled) {
      return;
    }

    const today = todayKey();

    if (todaysRequest) {
      setNotice("You already requested today's admin redemption code.");
      return;
    }

    setLocalState((current) => ({
      ...current,
      users: current.users.map((user) =>
        user.id === activeUser.id ? { ...user, lastCodeRequestOn: today } : user,
      ),
      dailyCodeRequests: [
        {
          id: `${activeUser.id}-${today}`,
          userId: activeUser.id,
          userName: activeUser.name,
          requestedOn: today,
          status: "pending",
        },
        ...current.dailyCodeRequests,
      ],
    }));
    setNotice("Daily code request sent to the admin.");
  }

  function handleFulfillDailyCode(requestId: string) {
    if (!activeUser?.isAdmin || supabaseEnabled) {
      return;
    }

    const newCode = createPromoCode(activeUser.name, 1);

    setLocalState((current) => ({
      ...current,
      promoCodes: [newCode, ...current.promoCodes],
      dailyCodeRequests: current.dailyCodeRequests.map((request) =>
        request.id === requestId
          ? {
              ...request,
              status: "fulfilled",
              fulfilledCode: newCode.code,
            }
          : request,
      ),
    }));
    setLatestSecureCode(newCode.code);
    setNotice("Daily redemption code generated.");
  }

  if (requiresAuth) {
    return (
      <main className="auth-shell">
        <section
          className="auth-card"
          style={{
            ["--theme-background" as string]: activeTheme.background,
            ["--theme-paper" as string]: activeTheme.paper,
            ["--theme-ink" as string]: activeTheme.ink,
            ["--theme-accent" as string]: activeTheme.accent,
            ["--theme-accent-2" as string]: activeTheme.accent2,
          }}
        >
          <div className="auth-editorial">
            <p className="section-kicker">Invite-only access</p>
            <h1>Santini opens only for invited collectors.</h1>
            <p>
              Sign in with the personal email that received the invitation. Every collector starts with{" "}
              {STARTER_PACK_CREDITS} unopened packs waiting inside the album.
            </p>
            <div className="auth-feature-list">
              <span>Private collector accounts</span>
              <span>Magazine-style team spreads</span>
              <span>Animated pack reveals</span>
            </div>
            {supabaseEnabled && remoteLoading ? <p className="auth-status">Checking your access...</p> : null}
          </div>

          <form className="auth-form" onSubmit={(event) => void handleAuth(event)}>
            <div className="auth-form-head">
              <p className="section-kicker">Collector login</p>
              <h2>{authMode === "invite" ? "Accept invitation" : "Enter the album"}</h2>
            </div>
            <div className="auth-switch">
              <button
                className={authMode === "signin" ? "nav-pill nav-pill-active" : "nav-pill"}
                type="button"
                onClick={() => setAuthMode("signin")}
              >
                Sign in
              </button>
              <button
                className={authMode === "invite" ? "nav-pill nav-pill-active" : "nav-pill"}
                type="button"
                onClick={() => setAuthMode("invite")}
              >
                Use invite
              </button>
            </div>
            <label className="field-label">
              Personal email
              <input
                className="field-input"
                type="email"
                value={authEmail}
                onChange={(event) => setAuthEmail(event.target.value)}
              />
            </label>
            {authMode === "invite" ? (
              <>
                <label className="field-label">
                  Invitation code
                  <input
                    className="field-input"
                    value={inviteCode}
                    onChange={(event) => setInviteCode(event.target.value.toUpperCase())}
                  />
                </label>
                <label className="field-label">
                  Display name
                  <input
                    className="field-input"
                    value={inviteDisplayName}
                    onChange={(event) => setInviteDisplayName(event.target.value)}
                  />
                </label>
              </>
            ) : null}
            <label className="field-label">
              Password
              <input
                className="field-input"
                type="password"
                value={authPassword}
                onChange={(event) => setAuthPassword(event.target.value)}
              />
            </label>
            <button className="primary-button" type="submit">
              {authMode === "invite" ? "Create invited account" : "Open album"}
            </button>
            <p className="auth-footnote">
              Account creation is handled by invitation. Public sign-up is disabled.
            </p>
            <p className="notice-line">{notice}</p>
          </form>
        </section>
      </main>
    );
  }

  return (
    <main
      className="magazine-shell"
      style={{
        ["--theme-background" as string]: activeTheme.background,
        ["--theme-paper" as string]: activeTheme.paper,
        ["--theme-ink" as string]: activeTheme.ink,
        ["--theme-accent" as string]: activeTheme.accent,
        ["--theme-accent-2" as string]: activeTheme.accent2,
      }}
    >
      <PackRevealModal
        key={revealedPack ? `${revealedPack.userId}-${revealedPack.cards.map((card) => card.id).join("-")}` : "closed"}
        pack={revealedPack}
        onClose={() => setRevealedPack(null)}
      />

      <header className="masthead">
        <div>
          <p className="section-kicker">Santini 2026</p>
          <h1>The Collector&apos;s Album</h1>
        </div>
        <nav className="screen-nav">
          {([
            ["album", <BookIcon key="book" />],
            ["profile", <PersonIcon key="person" />],
            ["settings", <GearIcon key="gear" />],
          ] as Array<[Screen, ReactNode]>).map(([item, icon]) => (
            <button
              key={item}
              className={screen === item ? "nav-pill nav-pill-active" : "nav-pill"}
              type="button"
              onClick={() => setScreen(item)}
              aria-label={item}
              title={item}
            >
              {icon}
            </button>
          ))}
        </nav>
      </header>

      {notice ? <p className="notice-line notice-line-top">{notice}</p> : null}

      {screen === "album" && activeTeam && activeUser ? (
        <section className="album-scene">
          <div className="album-toolbar">
            <div className="toolbar-group">
              <label className="field-label compact-field">
                Country
                <select
                  className="field-input"
                  value={activeTeam.id}
                  onChange={(event) => setSelectedTeamId(event.target.value)}
                >
                  {teamPages.map((team) => (
                    <option key={team.id} value={team.id}>
                      {team.country}
                    </option>
                  ))}
                </select>
              </label>
              <div className="atlas-strip">
                {teamPages.map((team) => (
                  <button
                    key={team.id}
                    className={team.id === activeTeam.id ? "atlas-dot atlas-dot-active" : "atlas-dot"}
                    style={{ ["--atlas-accent" as string]: team.accent }}
                    type="button"
                    onClick={() => setSelectedTeamId(team.id)}
                    aria-label={team.country}
                    title={team.country}
                  >
                    {team.country.slice(0, 2).toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            <div className="toolbar-group">
              <div className="toggle-cluster">
                <button
                  className={albumView === "stickers" ? "nav-pill nav-pill-active" : "nav-pill"}
                  type="button"
                  onClick={() => setAlbumView("stickers")}
                  aria-label="sticker page"
                  title="sticker page"
                >
                  G
                </button>
                <button
                  className={albumView === "formation" ? "nav-pill nav-pill-active" : "nav-pill"}
                  type="button"
                  onClick={() => setAlbumView("formation")}
                  aria-label="formation view"
                  title="formation view"
                >
                  F
                </button>
              </div>
              <button className="ghost-button" type="button" aria-label="previous country" title="previous country" disabled={activeTeamIndex <= 0} onClick={() => setSelectedTeamId(teamPages[Math.max(activeTeamIndex - 1, 0)]?.id ?? "")}>
                {"<"}
              </button>
              <button className="primary-button" type="button" onClick={() => void handleOpenPack()}>
                O
              </button>
              <button className="ghost-button" type="button" aria-label="next country" title="next country" disabled={activeTeamIndex >= teamPages.length - 1} onClick={() => setSelectedTeamId(teamPages[Math.min(activeTeamIndex + 1, teamPages.length - 1)]?.id ?? "")}>
                {">"}
              </button>
            </div>
          </div>

          <div className="album-status-strip">
            <span>{activeUser.name}</span>
            <span>{collectionProgress.owned}/{collectionProgress.total} collected</span>
            <span>{activeUser.packCredits} unopened packs</span>
            <span>{getPackAssistLabel(activeUser.collection)}</span>
          </div>

          <section className="magazine-spread">
            <article className="spread-page spread-page-left">
              <div className="spread-lead">
                <p className="section-kicker">{activeTeam.region}</p>
                <h2>{activeTeam.country}</h2>
                <p>
                  {activeTeam.group}. This chapter keeps the whole squad together on one spread, with editorial
                  markers for crest, flag, and technical direction.
                </p>
              </div>

              <div className="editorial-grid">
                <EditorialCard
                  title={activeTeam.country}
                  subtitle="National flag"
                  image={buildFlagArt(activeTeam.country, activeTeam.flagColors)}
                />
                <EditorialCard
                  title={activeTeam.crestLabel}
                  subtitle="Team emblem"
                  image={buildCrestArt(activeTeam.crestLabel, activeTeam.accent)}
                />
                <EditorialCard
                  title={activeTeam.coach}
                  subtitle="Head coach"
                  image={buildCoachArt(activeTeam.coach, activeTeam.accent)}
                />
              </div>

              <div className="editorial-note">
                <span className="editorial-note-dot" style={{ background: activeTeam.accent }} />
                <p>
                  The emblem, flag, and coach are shown as fixed team features, while packs focus on player stickers so
                  the core album can be completed within twenty packs or fewer.
                </p>
              </div>
            </article>

            <article className="spread-page spread-page-right">
              <div className="player-page-head">
                <div>
                  <p className="section-kicker">Squad page</p>
                  <h3>All players on one page</h3>
                </div>
                <span>{activeTeam.cards.filter((card) => getOwnedCount(activeUser.collection, card.id) > 0).length}/6 owned</span>
              </div>

              {albumView === "formation" ? (
                <FormationBoard team={activeTeam} collection={activeUser.collection} />
              ) : (
                <div className="sticker-sheet">
                  {activeTeam.cards.map((card) => (
                    <MagazineSticker
                      key={card.id}
                      card={card}
                      ownedCount={getOwnedCount(activeUser.collection, card.id)}
                    />
                  ))}
                </div>
              )}
            </article>
          </section>

          <section className="profile-panel album-specials-panel">
            <div className="panel-header">
              <div>
                <p className="section-kicker">Special chapter</p>
                <h2>Host stadium cards</h2>
              </div>
              <span>
                {STADIUM_CARDS.filter((card) => getOwnedCount(activeUser.collection, card.id) > 0).length}/{STADIUM_CARDS.length} owned
              </span>
            </div>
            <div className="stadium-album-grid">
              {STADIUM_CARDS.map((card) => (
                <MagazineSticker
                  key={card.id}
                  card={card}
                  ownedCount={getOwnedCount(activeUser.collection, card.id)}
                />
              ))}
            </div>
          </section>
        </section>
      ) : null}

      {screen === "profile" ? (
        <section className="profile-layout">
          <article className="profile-panel">
            <div className="panel-header">
              <div>
                <p className="section-kicker">Profile</p>
                <h2>Collector identity</h2>
              </div>
            </div>

            {supabaseEnabled ? (
              <div className="profile-summary">
                <p><strong>Name:</strong> {activeUser?.name}</p>
                <p><strong>Email:</strong> {session?.user.email}</p>
                <p><strong>Role:</strong> {activeUser?.isAdmin ? "Admin" : "Collector"}</p>
                <p className="muted-copy">Invitation-only access is managed in Supabase Auth for shared mode.</p>
                <button className="ghost-button" type="button" onClick={() => void handleSignOut()}>
                  Sign out
                </button>
              </div>
            ) : (
              <form className="profile-form" onSubmit={(event) => void handleLocalProfileSave(event)}>
                <label className="field-label">
                  Invited email
                  <input className="field-input" value={currentLocalAccount?.email ?? ""} disabled readOnly />
                </label>
                <label className="field-label">
                  Username
                  <input
                    className="field-input"
                    value={profileUsername}
                    onChange={(event) => setProfileUsername(event.target.value)}
                  />
                </label>
                <label className="field-label">
                  Display name
                  <input
                    className="field-input"
                    value={profileDisplayName}
                    onChange={(event) => setProfileDisplayName(event.target.value)}
                  />
                </label>
                <label className="field-label">
                  New password
                  <input
                    className="field-input"
                    type="password"
                    value={profilePassword}
                    onChange={(event) => setProfilePassword(event.target.value)}
                    placeholder="Leave empty to keep the current one"
                  />
                </label>
                <div className="profile-actions">
                  <button className="primary-button" type="submit">
                    Save profile
                  </button>
                  <button className="ghost-button" type="button" onClick={() => void handleSignOut()}>
                    Sign out
                  </button>
                </div>
              </form>
            )}
          </article>

          <article className="profile-panel">
            <div className="panel-header">
              <div>
                <p className="section-kicker">Collection</p>
                <h2>Collector status</h2>
              </div>
            </div>
            <div className="metric-stack">
              <div className="metric-card">
                <span>Completion</span>
                <strong>{collectionProgress.percentage}%</strong>
              </div>
              <div className="metric-card">
                <span>Packs opened</span>
                <strong>{activeUser?.packsOpened ?? 0}</strong>
              </div>
              <div className="metric-card">
                <span>Duplicates</span>
                <strong>{duplicates.length}</strong>
              </div>
            </div>
          </article>
        </section>
      ) : null}

      {screen === "settings" && activeUser ? (
        <section className="settings-layout">
          <article className="settings-panel">
            <div className="panel-header">
              <div>
                <p className="section-kicker">Theme</p>
                <h2>Album era</h2>
              </div>
            </div>
            <div className="theme-grid">
              {THEME_OPTIONS.map((theme) => (
                <button
                  key={theme.id}
                  className={theme.id === themeId ? "theme-card theme-card-active" : "theme-card"}
                  type="button"
                  onClick={() => setThemeId(theme.id)}
                >
                  <span
                    className="theme-preview"
                    style={{
                      background: `radial-gradient(circle at top, rgba(255,255,255,0.16), transparent 28%), linear-gradient(135deg, ${theme.accent}, ${theme.accent2})`,
                    }}
                  />
                  <span
                    className="theme-mascot"
                    style={{
                      backgroundImage: `url("${buildMascotArt(theme.id).image}")`,
                    }}
                  />
                  <strong>{theme.label}</strong>
                  <span className="theme-mascot-label">{buildMascotArt(theme.id).label}</span>
                </button>
              ))}
            </div>
          </article>

          <article className="settings-panel">
            <div className="panel-header">
              <div>
                <p className="section-kicker">Packs and codes</p>
                <h2>Access control</h2>
              </div>
            </div>

            <div className="settings-stack">
              <div className="inline-note">
                <strong>Starter packs</strong>
                <span>Every invited collector begins with {STARTER_PACK_CREDITS} unopened packs.</span>
              </div>

              {activeUser.isAdmin ? (
                <div className="settings-stack">
                  <label className="field-label compact-field">
                    Packs per code
                    <select
                      className="field-input"
                      value={promoPackAmount}
                      onChange={(event) => setPromoPackAmount(Number(event.target.value))}
                    >
                      {PROMO_PACK_OPTIONS.map((amount) => (
                        <option key={amount} value={amount}>
                          {amount} packs
                        </option>
                      ))}
                    </select>
                  </label>
                  <button className="primary-button" type="button" onClick={() => void handleGenerateCode()}>
                    Generate admin code
                  </button>
                  {supabaseEnabled ? (
                    <form className="invite-form" onSubmit={(event) => void handleCreateInvite(event)}>
                      <label className="field-label">
                        Invite email
                        <input
                          className="field-input"
                          type="email"
                          value={inviteEmail}
                          onChange={(event) => setInviteEmail(event.target.value)}
                        />
                      </label>
                      <label className="field-label">
                        Collector name
                        <input
                          className="field-input"
                          value={inviteName}
                          onChange={(event) => setInviteName(event.target.value)}
                        />
                      </label>
                      <label className="field-label compact-field">
                        Role
                        <select
                          className="field-input"
                          value={inviteRole}
                          onChange={(event) => setInviteRole(event.target.value as "collector" | "admin")}
                        >
                          <option value="collector">Collector</option>
                          <option value="admin">Admin</option>
                        </select>
                      </label>
                      <button className="ghost-button" type="submit">
                        Create invite
                      </button>
                    </form>
                  ) : null}
                </div>
              ) : (
                <div className="settings-stack">
                  <form className="inline-form" onSubmit={(event) => void handleRedeemCode(event)}>
                    <label className="field-label">
                      Redeem code
                      <input
                        className="field-input"
                        value={redeemCodeValue}
                        onChange={(event) => setRedeemCodeValue(event.target.value.toUpperCase())}
                      />
                    </label>
                    <button className="primary-button" type="submit">
                      Redeem
                    </button>
                  </form>
                  {!supabaseEnabled ? (
                    <button className="ghost-button" type="button" onClick={handleRequestDailyCode}>
                      {todaysRequest ? "Daily request already sent" : "Request today's admin code"}
                    </button>
                  ) : null}
                </div>
              )}

              {latestSecureCode ? (
                <div className="code-card">
                  <p className="section-kicker">Latest code</p>
                  <strong>{latestSecureCode}</strong>
                  <span>Bonus rewards and admin codes only unlock more packs. They never count as album stickers.</span>
                </div>
              ) : null}
              {latestInviteCode ? (
                <div className="code-card">
                  <p className="section-kicker">Latest invite</p>
                  <strong>{latestInviteCode}</strong>
                  <span>Share it privately with the invited email. The invite expires after 14 days and can only be used once.</span>
                </div>
              ) : null}

              {!supabaseEnabled && activeUser.isAdmin && pendingCodeRequests.length ? (
                <div className="request-list">
                  {pendingCodeRequests.map((request) => (
                    <article key={request.id} className="request-card">
                      <div>
                        <strong>{request.userName}</strong>
                        <p>Requested on {request.requestedOn}</p>
                      </div>
                      <button className="ghost-button" type="button" onClick={() => handleFulfillDailyCode(request.id)}>
                        Generate daily code
                      </button>
                    </article>
                  ))}
                </div>
              ) : null}
            </div>
          </article>

          <article className="settings-panel">
            <div className="panel-header">
              <div>
                <p className="section-kicker">Trading</p>
                <h2>Duplicate exchange</h2>
              </div>
            </div>
            {duplicates.length ? (
              <div className="settings-stack">
                <div className="trade-grid">
                  <label className="field-label">
                    Partner
                    <select className="field-input" value={selectedTradePartnerId} onChange={(event) => setTradePartnerId(event.target.value)}>
                      {availablePartners.map((user) => (
                        <option key={user.id} value={user.id}>
                          {user.name}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="field-label">
                    Your duplicate
                    <select className="field-input" value={selectedOfferedCardId} onChange={(event) => setOfferedCardId(event.target.value)}>
                      {offerableCards.map((card) => (
                        <option key={card.id} value={card.id}>
                          {card.player}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="field-label">
                    Requested card
                    <select className="field-input" value={selectedRequestedCardId} onChange={(event) => setRequestedCardId(event.target.value)}>
                      {requestableCards.map((card) => (
                        <option key={card.id} value={card.id}>
                          {card.player}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>
                <button className="primary-button" type="button" onClick={() => void handleTrade()}>
                  {supabaseEnabled ? "Send trade offer" : "Complete trade"}
                </button>
                <div className="duplicate-cloud">
                  {duplicates.map((entry) => (
                    <span key={entry.card.id}>{entry.card.player} x{entry.count}</span>
                  ))}
                </div>
              </div>
            ) : (
              <p className="muted-copy">Open more packs before trading.</p>
            )}

            {supabaseEnabled ? (
              <div className="offer-columns">
                <div>
                  <p className="section-kicker">Incoming</p>
                  {incomingOffers.length ? incomingOffers.map((offer) => {
                    const offeredCard = TOURNAMENT_CARDS.find((card) => card.id === offer.offeredCardId);
                    const requestedCard = TOURNAMENT_CARDS.find((card) => card.id === offer.requestedCardId);

                    return (
                      <article key={offer.id} className="offer-card">
                        <strong>{offer.offeredByName}</strong>
                        <p>{offeredCard?.player} for {requestedCard?.player}</p>
                        <div className="offer-actions">
                          <button className="primary-button" type="button" onClick={() => void handleTradeOfferResponse(offer.id, "accept")}>
                            Accept
                          </button>
                          <button className="ghost-button" type="button" onClick={() => void handleTradeOfferResponse(offer.id, "reject")}>
                            Reject
                          </button>
                        </div>
                      </article>
                    );
                  }) : <p className="muted-copy">No incoming offers.</p>}
                </div>
                <div>
                  <p className="section-kicker">Outgoing</p>
                  {outgoingOffers.length ? outgoingOffers.map((offer) => {
                    const offeredCard = TOURNAMENT_CARDS.find((card) => card.id === offer.offeredCardId);
                    const requestedCard = TOURNAMENT_CARDS.find((card) => card.id === offer.requestedCardId);

                    return (
                      <article key={offer.id} className="offer-card">
                        <strong>{offer.offeredToName}</strong>
                        <p>{offeredCard?.player} for {requestedCard?.player}</p>
                      </article>
                    );
                  }) : <p className="muted-copy">No outgoing offers.</p>}
                </div>
              </div>
            ) : null}
          </article>

          <article className="settings-panel">
            <div className="panel-header">
              <div>
                <p className="section-kicker">Future sets</p>
                <h2>Expansion-ready packs</h2>
              </div>
            </div>
            <div className="set-grid">
              {ALBUM_SETS.map((set) => (
                <article key={set.id} className={set.released ? "set-card" : "set-card set-card-muted"}>
                  <strong>{set.name}</strong>
                  <p>{set.description}</p>
                  <span>{set.released ? "Available now" : "Ready for future release"}</span>
                </article>
              ))}
            </div>
            {latestOpenedCards.length ? (
              <div className="recent-strip">
                {latestOpenedCards.map((card) => (
                  <span key={card.id}>{card.player}</span>
                ))}
              </div>
            ) : null}
          </article>

          <article className="settings-panel">
            <div className="panel-header">
              <div>
                <p className="section-kicker">Stadium guide</p>
                <h2>Venue index</h2>
              </div>
            </div>
            <div className="stadium-list">
              {HOST_STADIUMS.map((stadium) => (
                <StadiumCard key={stadium.id} stadium={stadium} />
              ))}
            </div>
          </article>
        </section>
      ) : null}
    </main>
  );
}
