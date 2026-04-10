import {
  MAX_COMPLETION_PACK_TARGET,
  PACK_SIZE,
  TOURNAMENT_CARDS,
  type Card,
  type PromoCode,
  type TradeUser,
} from "@/lib/santini-data";

type DuplicateEntry = {
  card: Card;
  count: number;
};

function cloneCollection(collection: Record<string, number>) {
  return { ...collection };
}

function createCode(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
}

function shuffle<T>(items: T[]) {
  const copy = [...items];

  for (let index = copy.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [copy[index], copy[randomIndex]] = [copy[randomIndex], copy[index]];
  }

  return copy;
}

export function getOwnedCount(collection: Record<string, number>, cardId: string) {
  return collection[cardId] ?? 0;
}

export function formatCountLabel(count: number) {
  if (count <= 0) {
    return "0 packs";
  }

  return `${count} ${count === 1 ? "pack" : "packs"}`;
}

export function formatCopyLabel(count: number) {
  if (count <= 0) {
    return "0 copies";
  }

  return `${count} ${count === 1 ? "copy" : "copies"}`;
}

export function getCollectionProgress(collection: Record<string, number>) {
  const owned = TOURNAMENT_CARDS.filter((card) => getOwnedCount(collection, card.id) > 0).length;
  const total = TOURNAMENT_CARDS.length;

  return {
    owned,
    total,
    percentage: Math.round((owned / total) * 100),
  };
}

export function getDuplicateEntries(collection: Record<string, number>): DuplicateEntry[] {
  return TOURNAMENT_CARDS.map((card) => ({
    card,
    count: getOwnedCount(collection, card.id),
  })).filter((entry) => entry.count > 1);
}

export function getMissingCards(collection: Record<string, number>) {
  return TOURNAMENT_CARDS.filter((card) => getOwnedCount(collection, card.id) === 0);
}

function choosePackCards(collection: Record<string, number>) {
  const missing = shuffle(getMissingCards(collection));
  const selected: Card[] = [];

  while (selected.length < PACK_SIZE && missing.length > 0) {
    const nextCard = missing.shift();

    if (nextCard) {
      selected.push(nextCard);
    }
  }

  if (selected.length < PACK_SIZE) {
    const existingIds = new Set(selected.map((card) => card.id));
    const fallbackPool = shuffle(TOURNAMENT_CARDS.filter((card) => !existingIds.has(card.id)));

    while (selected.length < PACK_SIZE && fallbackPool.length > 0) {
      const nextCard = fallbackPool.shift();

      if (nextCard) {
        selected.push(nextCard);
      }
    }
  }

  return shuffle(selected);
}

export function openRandomPack(user: TradeUser) {
  const cards = choosePackCards(user.collection);
  const nextPacksOpened = user.packsOpened + 1;
  const nextCollection = cloneCollection(user.collection);
  let bonusCode: string | undefined;

  cards.forEach((card) => {
    nextCollection[card.id] = getOwnedCount(nextCollection, card.id) + 1;
  });

  if (nextPacksOpened % 20 === 0) {
    bonusCode = createCode("BONUS");
  }

  return {
    updatedUser: {
      ...user,
      collection: nextCollection,
      packsOpened: nextPacksOpened,
      packCredits: user.packCredits - 1,
      bonusCodes: bonusCode ? [...user.bonusCodes, bonusCode] : user.bonusCodes,
    },
    openedCards: cards,
    bonusCode,
  };
}

export function getPackAssistLabel(collection: Record<string, number>) {
  const missingCount = getMissingCards(collection).length;

  if (missingCount === 0) {
    return "Core set complete. Open future special packs when they arrive.";
  }

  if (missingCount <= PACK_SIZE) {
    return "Next pack should finish the core album.";
  }

  return `Completion-friendly collation keeps the core set on pace for ${MAX_COMPLETION_PACK_TARGET} packs or fewer.`;
}

export function createPromoCode(createdBy: string, packCount: number): PromoCode {
  return {
    code: createCode("PACK"),
    packCount,
    createdBy,
    redeemedBy: [],
  };
}

export function redeemPromoCode(codeValue: string, codes: PromoCode[], userId: string) {
  const normalized = codeValue.trim().toUpperCase();
  const matchedCode = codes.find((code) => code.code === normalized);

  if (!matchedCode) {
    return {
      ok: false as const,
      message: "That code does not exist in this Santini demo.",
    };
  }

  if (matchedCode.redeemedBy.includes(userId)) {
    return {
      ok: false as const,
      message: "This collector already redeemed that code.",
    };
  }

  return {
    ok: true as const,
    code: matchedCode,
    codes: codes.map((code) =>
      code.code === matchedCode.code
        ? { ...code, redeemedBy: [...code.redeemedBy, userId] }
        : code,
    ),
  };
}

export function resolveTrade(
  from: TradeUser,
  to: TradeUser,
  offeredCardId: string,
  requestedCardId: string,
) {
  if (getOwnedCount(from.collection, offeredCardId) < 2) {
    return {
      ok: false as const,
      message: "You can only trade cards when you have duplicates.",
    };
  }

  if (getOwnedCount(to.collection, requestedCardId) < 1) {
    return {
      ok: false as const,
      message: "Your trade partner does not own the requested card.",
    };
  }

  if (getOwnedCount(to.collection, requestedCardId) < 2) {
    return {
      ok: false as const,
      message: "For this Santini demo, both sides trade only duplicates so nobody loses their only copy.",
    };
  }

  const fromCollection = cloneCollection(from.collection);
  const toCollection = cloneCollection(to.collection);

  fromCollection[offeredCardId] -= 1;
  toCollection[offeredCardId] = getOwnedCount(toCollection, offeredCardId) + 1;

  toCollection[requestedCardId] -= 1;
  fromCollection[requestedCardId] = getOwnedCount(fromCollection, requestedCardId) + 1;

  const offeredCard = TOURNAMENT_CARDS.find((card) => card.id === offeredCardId);
  const requestedCard = TOURNAMENT_CARDS.find((card) => card.id === requestedCardId);

  return {
    ok: true as const,
    from: {
      ...from,
      collection: fromCollection,
    },
    to: {
      ...to,
      collection: toCollection,
    },
    message: `${from.name} sent ${offeredCard?.player} and received ${requestedCard?.player}.`,
  };
}

