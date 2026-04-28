import type { Session, SupabaseClient } from "@supabase/supabase-js";
import { BONUS_CARD, TOURNAMENT_CARDS, type Card, type TradeOffer, type TradeUser } from "@/lib/santini-data";

type SnapshotUserRow = {
  id: string;
  name: string;
  isAdmin: boolean;
  collection: Record<string, number>;
  packsOpened: number;
  packCredits: number;
};

type SnapshotResponse = {
  active_user_id: string;
  users: SnapshotUserRow[];
  incoming_offers: TradeOfferRow[];
  outgoing_offers: TradeOfferRow[];
};

type TradeOfferRow = {
  id: string;
  offeredBy: string;
  offeredByName: string;
  offeredTo: string;
  offeredToName: string;
  offeredCardId: string;
  requestedCardId: string;
  status: "pending" | "accepted" | "rejected" | "cancelled";
};

type OpenPackResponse = {
  cards: Card[];
  bonus_code: string | null;
};

type RpcPromoCode = {
  code: string;
  pack_count: number;
};

type InvitePreview = {
  email: string;
  expires_at: string;
};

type InviteResult = {
  email: string;
  invite_code: string;
  role: "collector" | "admin";
};

export type RemoteAlbumSnapshot = {
  activeUserId: string;
  users: TradeUser[];
  incomingOffers: TradeOffer[];
  outgoingOffers: TradeOffer[];
  session: Session;
};

function findCard(cardId: string) {
  return TOURNAMENT_CARDS.find((card) => card.id === cardId) ?? BONUS_CARD;
}

export async function loadRemoteAlbumSnapshot(
  supabase: SupabaseClient,
  session: Session,
): Promise<RemoteAlbumSnapshot> {
  const { data, error } = await supabase.rpc("get_album_snapshot");

  if (error) {
    throw new Error(error.message);
  }

  const snapshot = (data ?? {}) as SnapshotResponse;

  return {
    activeUserId: snapshot.active_user_id ?? session.user.id,
    users: (snapshot.users ?? []).map((user) => ({
      id: user.id,
      name: user.name,
      isAdmin: user.isAdmin,
      collection: user.collection ?? {},
      packsOpened: user.packsOpened,
      packCredits: user.packCredits,
      bonusCodes: [],
    })),
    incomingOffers: snapshot.incoming_offers ?? [],
    outgoingOffers: snapshot.outgoing_offers ?? [],
    session,
  };
}

export async function signUpCollector(
  supabase: SupabaseClient,
  email: string,
  password: string,
  displayName: string,
  inviteToken: string,
) {
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        display_name: displayName,
        invite_token: inviteToken.trim().toUpperCase(),
      },
    },
  });

  if (error) {
    throw new Error(error.message);
  }
}

export async function validateInvite(
  supabase: SupabaseClient,
  email: string,
  inviteToken: string,
) {
  const { data, error } = await supabase.rpc("validate_invite", {
    input_email: email.trim().toLowerCase(),
    input_token: inviteToken.trim().toUpperCase(),
  });

  if (error) {
    throw new Error(error.message);
  }

  return data as InvitePreview | null;
}

export async function createRemoteInvite(
  supabase: SupabaseClient,
  email: string,
  invitedName: string,
  role: "collector" | "admin",
) {
  const { data, error } = await supabase.rpc("create_invite", {
    input_email: email.trim().toLowerCase(),
    input_invited_name: invitedName.trim(),
    input_role: role,
  });

  if (error) {
    throw new Error(error.message);
  }

  return data as InviteResult | null;
}

export async function signInCollector(
  supabase: SupabaseClient,
  email: string,
  password: string,
) {
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    throw new Error(error.message);
  }
}

export async function signOutCollector(supabase: SupabaseClient) {
  const { error } = await supabase.auth.signOut();

  if (error) {
    throw new Error(error.message);
  }
}

export async function openRemotePack(supabase: SupabaseClient) {
  const { data, error } = await supabase.rpc("open_pack");

  if (error) {
    throw new Error(error.message);
  }

  const result = (data ?? {}) as OpenPackResponse;

  return {
    cards: (result.cards ?? []).map((card) => findCard(card.id)),
    bonusCode: result.bonus_code ?? undefined,
  };
}

export async function createRemotePromoCode(
  supabase: SupabaseClient,
  packCount: number,
) {
  const { data, error } = await supabase.rpc("create_promo_code", {
    input_pack_count: packCount,
  });

  if (error) {
    throw new Error(error.message);
  }

  return data as RpcPromoCode | null;
}

export async function redeemRemotePromoCode(
  supabase: SupabaseClient,
  code: string,
) {
  const { data, error } = await supabase.rpc("redeem_promo_code", {
    input_code: code.trim().toUpperCase(),
  });

  if (error) {
    throw new Error(error.message);
  }

  return data as RpcPromoCode | null;
}

export async function createRemoteTradeOffer(
  supabase: SupabaseClient,
  partnerId: string,
  offeredCardId: string,
  requestedCardId: string,
) {
  const { error } = await supabase.rpc("create_trade_offer", {
    input_partner_id: partnerId,
    input_offered_card_id: offeredCardId,
    input_requested_card_id: requestedCardId,
  });

  if (error) {
    throw new Error(error.message);
  }
}

export async function respondToRemoteTradeOffer(
  supabase: SupabaseClient,
  offerId: string,
  action: "accept" | "reject",
) {
  const { error } = await supabase.rpc("respond_trade_offer", {
    input_offer_id: offerId,
    input_action: action,
  });

  if (error) {
    throw new Error(error.message);
  }
}
