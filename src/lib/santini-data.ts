export type Card = {
  id: string;
  number: string;
  player: string;
  country: string;
  position: string;
  group: string;
  rarity: "standard" | "bonus";
  accent: string;
  cardType?: "player" | "stadium";
  slot?: string;
  setId?: string;
  city?: string;
  caption?: string;
};

export type TeamGuide = {
  id: string;
  country: string;
  group: string;
  accent: string;
  region: string;
  coach: string;
  crestLabel: string;
  flagColors: string[];
  cards: Card[];
  formation: {
    goalkeeper: string;
    defense: string[];
    midfield: string[];
    attack: string[];
  };
};

export type AlbumSet = {
  id: string;
  name: string;
  packType: "core" | "special";
  released: boolean;
  description: string;
};

export type Stadium = {
  id: string;
  name: string;
  city: string;
  country: string;
  capacity: string;
  accent: string;
};

export type PromoCode = {
  code: string;
  packCount: number;
  createdBy: string;
  redeemedBy: string[];
};

export type TradeUser = {
  id: string;
  name: string;
  isAdmin: boolean;
  collection: Record<string, number>;
  packsOpened: number;
  packCredits: number;
  bonusCodes: string[];
  lastCodeRequestOn?: string | null;
};

export type TradeOffer = {
  id: string;
  offeredBy: string;
  offeredByName: string;
  offeredTo: string;
  offeredToName: string;
  offeredCardId: string;
  requestedCardId: string;
  status: "pending" | "accepted" | "rejected" | "cancelled";
};

type TeamSeed = {
  country: string;
  group: string;
  accent: string;
  region: string;
  coach: string;
  crestLabel: string;
  flagColors: string[];
  players: Array<{
    slug: string;
    player: string;
    position: string;
    slot: string;
  }>;
};

const TEAM_SEEDS: TeamSeed[] = [
  {
    country: "Argentina",
    group: "Group A Favorites",
    accent: "#5ec2ff",
    region: "South America",
    coach: "Lionel Scaloni",
    crestLabel: "AFA",
    flagColors: ["#74c8ff", "#ffffff", "#74c8ff"],
    players: [
      { slug: "messi", player: "Lionel Messi", position: "Forward", slot: "CF" },
      { slug: "alvarez", player: "Julian Alvarez", position: "Forward", slot: "ST" },
      { slug: "mac-allister", player: "Alexis Mac Allister", position: "Midfielder", slot: "LM" },
      { slug: "enzo", player: "Enzo Fernandez", position: "Midfielder", slot: "CM" },
      { slug: "romero", player: "Cristian Romero", position: "Defender", slot: "CB" },
      { slug: "martinez", player: "Emiliano Martinez", position: "Goalkeeper", slot: "GK" },
    ],
  },
  {
    country: "Brazil",
    group: "South American Fire",
    accent: "#17b978",
    region: "South America",
    coach: "Dorival Junior",
    crestLabel: "CBF",
    flagColors: ["#009739", "#ffdf00", "#002776"],
    players: [
      { slug: "vinicius", player: "Vinicius Junior", position: "Winger", slot: "LW" },
      { slug: "rodrygo", player: "Rodrygo", position: "Forward", slot: "ST" },
      { slug: "raphinha", player: "Raphinha", position: "Winger", slot: "RW" },
      { slug: "guimaraes", player: "Bruno Guimaraes", position: "Midfielder", slot: "CM" },
      { slug: "militao", player: "Eder Militao", position: "Defender", slot: "CB" },
      { slug: "alisson", player: "Alisson Becker", position: "Goalkeeper", slot: "GK" },
    ],
  },
  {
    country: "France",
    group: "European Elite",
    accent: "#3958ff",
    region: "Europe",
    coach: "Didier Deschamps",
    crestLabel: "FFF",
    flagColors: ["#1f3fb7", "#ffffff", "#ef4444"],
    players: [
      { slug: "mbappe", player: "Kylian Mbappe", position: "Forward", slot: "CF" },
      { slug: "dembele", player: "Ousmane Dembele", position: "Winger", slot: "RW" },
      { slug: "camavinga", player: "Eduardo Camavinga", position: "Midfielder", slot: "LM" },
      { slug: "tchouameni", player: "Aurelien Tchouameni", position: "Midfielder", slot: "CM" },
      { slug: "saliba", player: "William Saliba", position: "Defender", slot: "CB" },
      { slug: "maignan", player: "Mike Maignan", position: "Goalkeeper", slot: "GK" },
    ],
  },
  {
    country: "England",
    group: "European Elite",
    accent: "#f97316",
    region: "Europe",
    coach: "Thomas Tuchel",
    crestLabel: "FA",
    flagColors: ["#ffffff", "#ef4444", "#ffffff"],
    players: [
      { slug: "bellingham", player: "Jude Bellingham", position: "Midfielder", slot: "CM" },
      { slug: "kane", player: "Harry Kane", position: "Forward", slot: "CF" },
      { slug: "saka", player: "Bukayo Saka", position: "Winger", slot: "RW" },
      { slug: "foden", player: "Phil Foden", position: "Attacking Mid", slot: "AM" },
      { slug: "stones", player: "John Stones", position: "Defender", slot: "CB" },
      { slug: "pickford", player: "Jordan Pickford", position: "Goalkeeper", slot: "GK" },
    ],
  },
  {
    country: "Spain",
    group: "Creative Core",
    accent: "#9333ea",
    region: "Europe",
    coach: "Luis de la Fuente",
    crestLabel: "RFEF",
    flagColors: ["#c81e1e", "#ffdf00", "#c81e1e"],
    players: [
      { slug: "yamal", player: "Lamine Yamal", position: "Winger", slot: "RW" },
      { slug: "pedri", player: "Pedri", position: "Midfielder", slot: "CM" },
      { slug: "gavi", player: "Gavi", position: "Midfielder", slot: "LM" },
      { slug: "olmo", player: "Dani Olmo", position: "Attacking Mid", slot: "AM" },
      { slug: "cucurella", player: "Marc Cucurella", position: "Defender", slot: "LB" },
      { slug: "simon", player: "Unai Simon", position: "Goalkeeper", slot: "GK" },
    ],
  },
  {
    country: "Germany",
    group: "Creative Core",
    accent: "#c084fc",
    region: "Europe",
    coach: "Julian Nagelsmann",
    crestLabel: "DFB",
    flagColors: ["#111111", "#c81e1e", "#ffdf00"],
    players: [
      { slug: "musiala", player: "Jamal Musiala", position: "Attacking Mid", slot: "AM" },
      { slug: "wirtz", player: "Florian Wirtz", position: "Attacking Mid", slot: "LM" },
      { slug: "havertz", player: "Kai Havertz", position: "Forward", slot: "ST" },
      { slug: "gundogan", player: "Ilkay Gundogan", position: "Midfielder", slot: "CM" },
      { slug: "rudiger", player: "Antonio Rudiger", position: "Defender", slot: "CB" },
      { slug: "ter-stegen", player: "Marc-Andre ter Stegen", position: "Goalkeeper", slot: "GK" },
    ],
  },
  {
    country: "Mexico",
    group: "Host Nation Watch",
    accent: "#16a34a",
    region: "North America",
    coach: "Javier Aguirre",
    crestLabel: "FMF",
    flagColors: ["#006341", "#ffffff", "#ce1126"],
    players: [
      { slug: "gimenez", player: "Santiago Gimenez", position: "Forward", slot: "ST" },
      { slug: "quinones", player: "Julian Quinones", position: "Forward", slot: "CF" },
      { slug: "alvarez", player: "Edson Alvarez", position: "Midfielder", slot: "CM" },
      { slug: "chavez", player: "Luis Chavez", position: "Midfielder", slot: "LM" },
      { slug: "montes", player: "Cesar Montes", position: "Defender", slot: "CB" },
      { slug: "malagon", player: "Luis Malagon", position: "Goalkeeper", slot: "GK" },
    ],
  },
  {
    country: "United States",
    group: "Host Nation Watch",
    accent: "#ef4444",
    region: "North America",
    coach: "Mauricio Pochettino",
    crestLabel: "USSF",
    flagColors: ["#b91c1c", "#ffffff", "#1d4ed8"],
    players: [
      { slug: "pulisic", player: "Christian Pulisic", position: "Winger", slot: "LW" },
      { slug: "balogun", player: "Folarin Balogun", position: "Forward", slot: "ST" },
      { slug: "mckennie", player: "Weston McKennie", position: "Midfielder", slot: "CM" },
      { slug: "reyna", player: "Giovanni Reyna", position: "Attacking Mid", slot: "AM" },
      { slug: "robinson", player: "Antonee Robinson", position: "Defender", slot: "LB" },
      { slug: "turner", player: "Matt Turner", position: "Goalkeeper", slot: "GK" },
    ],
  },
  {
    country: "Canada",
    group: "Host Nation Watch",
    accent: "#dc2626",
    region: "North America",
    coach: "Jesse Marsch",
    crestLabel: "CSA",
    flagColors: ["#d32f2f", "#ffffff", "#d32f2f"],
    players: [
      { slug: "davies", player: "Alphonso Davies", position: "Left Back", slot: "LB" },
      { slug: "david", player: "Jonathan David", position: "Forward", slot: "ST" },
      { slug: "buchanan", player: "Tajon Buchanan", position: "Winger", slot: "RW" },
      { slug: "eustaquio", player: "Stephen Eustaquio", position: "Midfielder", slot: "CM" },
      { slug: "bombito", player: "Moise Bombito", position: "Defender", slot: "CB" },
      { slug: "crepeau", player: "Maxime Crepeau", position: "Goalkeeper", slot: "GK" },
    ],
  },
  {
    country: "Japan",
    group: "Global Contenders",
    accent: "#06b6d4",
    region: "Asia",
    coach: "Hajime Moriyasu",
    crestLabel: "JFA",
    flagColors: ["#ffffff", "#e11d48", "#ffffff"],
    players: [
      { slug: "kubo", player: "Takefusa Kubo", position: "Winger", slot: "RW" },
      { slug: "mitoma", player: "Kaoru Mitoma", position: "Winger", slot: "LW" },
      { slug: "endo", player: "Wataru Endo", position: "Midfielder", slot: "CM" },
      { slug: "doan", player: "Ritsu Doan", position: "Forward", slot: "ST" },
      { slug: "tomiyasu", player: "Takehiro Tomiyasu", position: "Defender", slot: "CB" },
      { slug: "suzuki", player: "Zion Suzuki", position: "Goalkeeper", slot: "GK" },
    ],
  },
  {
    country: "Morocco",
    group: "Global Contenders",
    accent: "#eab308",
    region: "Africa",
    coach: "Walid Regragui",
    crestLabel: "FRMF",
    flagColors: ["#b91c1c", "#006233", "#b91c1c"],
    players: [
      { slug: "hakimi", player: "Achraf Hakimi", position: "Right Back", slot: "RB" },
      { slug: "ziyech", player: "Hakim Ziyech", position: "Winger", slot: "RW" },
      { slug: "ounahi", player: "Azzedine Ounahi", position: "Midfielder", slot: "CM" },
      { slug: "amrabat", player: "Sofyan Amrabat", position: "Midfielder", slot: "LM" },
      { slug: "aguerd", player: "Nayef Aguerd", position: "Defender", slot: "CB" },
      { slug: "bounou", player: "Yassine Bounou", position: "Goalkeeper", slot: "GK" },
    ],
  },
  {
    country: "South Korea",
    group: "Global Contenders",
    accent: "#0ea5e9",
    region: "Asia",
    coach: "Hong Myung-bo",
    crestLabel: "KFA",
    flagColors: ["#ffffff", "#ef4444", "#1d4ed8"],
    players: [
      { slug: "son", player: "Son Heung-min", position: "Forward", slot: "ST" },
      { slug: "lee", player: "Lee Kang-in", position: "Attacking Mid", slot: "AM" },
      { slug: "hwang", player: "Hwang Hee-chan", position: "Forward", slot: "CF" },
      { slug: "park", player: "Park Yong-woo", position: "Midfielder", slot: "CM" },
      { slug: "kim", player: "Kim Min-jae", position: "Defender", slot: "CB" },
      { slug: "jo", player: "Jo Hyeon-woo", position: "Goalkeeper", slot: "GK" },
    ],
  },
];

export const ALBUM_SETS: AlbumSet[] = [
  {
    id: "core-2026",
    name: "Santini Core 2026",
    packType: "core",
    released: true,
    description: "The main road to complete the album with every national team player sticker.",
  },
  {
    id: "foil-future",
    name: "Foil Encore",
    packType: "special",
    released: false,
    description: "Reserved for future foil, legends, or special-event stickers that extend the collection.",
  },
];

export const TEAM_GUIDES: TeamGuide[] = TEAM_SEEDS.map((team, teamIndex) => {
  const cards = team.players.map((player, playerIndex) => ({
    id: `${team.country.toLowerCase().replaceAll(" ", "-")}-${player.slug}`,
    number: `${String(teamIndex * 6 + playerIndex + 1).padStart(3, "0")}`,
    player: player.player,
    country: team.country,
    position: player.position,
    group: team.group,
    rarity: "standard" as const,
    accent: team.accent,
    cardType: "player" as const,
    slot: player.slot,
    setId: "core-2026",
  }));

  return {
    id: team.country.toLowerCase().replaceAll(" ", "-"),
    country: team.country,
    group: team.group,
    accent: team.accent,
    region: team.region,
    coach: team.coach,
    crestLabel: team.crestLabel,
    flagColors: team.flagColors,
    cards,
    formation: {
      goalkeeper: cards.find((card) => card.slot === "GK")?.id ?? cards[cards.length - 1].id,
      defense: cards.filter((card) => ["LB", "CB", "RB"].includes(card.slot ?? "")).map((card) => card.id),
      midfield: cards.filter((card) => ["LM", "CM", "AM"].includes(card.slot ?? "")).map((card) => card.id),
      attack: cards.filter((card) => ["LW", "RW", "CF", "ST"].includes(card.slot ?? "")).map((card) => card.id),
    },
  };
});

export const BONUS_CARD: Card = {
  id: "bonus-santini",
  number: "B-20",
  player: "Bonus Pack Ticket",
  country: "Santini",
  position: "Special Reward",
  group: "Rare Bonus",
  rarity: "bonus",
  accent: "#f59e0b",
};

export const HOST_STADIUMS: Stadium[] = [
  { id: "nynj", name: "New York New Jersey Stadium", city: "East Rutherford", country: "United States", capacity: "78,576 capacity", accent: "#1d4ed8" },
  { id: "mexico-city", name: "Mexico City Stadium", city: "Mexico City", country: "Mexico", capacity: "72,766 capacity", accent: "#15803d" },
  { id: "bc-place", name: "BC Place Vancouver", city: "Vancouver", country: "Canada", capacity: "48,821 capacity", accent: "#b91c1c" },
  { id: "los-angeles", name: "Los Angeles Stadium", city: "Inglewood", country: "United States", capacity: "69,650 capacity", accent: "#2563eb" },
];

export const STADIUM_CARDS: Card[] = HOST_STADIUMS.map((stadium, index) => ({
  id: `stadium-${stadium.id}`,
  number: `S${String(index + 1).padStart(2, "0")}`,
  player: stadium.name,
  country: stadium.country,
  position: "Stadium",
  group: "Host Stadiums",
  rarity: "standard" as const,
  accent: stadium.accent,
  cardType: "stadium" as const,
  city: stadium.city,
  caption: stadium.capacity,
  setId: "core-2026",
}));

export const TOURNAMENT_CARDS: Card[] = [...TEAM_GUIDES.flatMap((team) => team.cards), ...STADIUM_CARDS];

export const PROMO_PACK_OPTIONS = [1, 3, 5];
export const STARTER_PACK_CREDITS = 5;
export const PACK_SIZE = 5;
export const MAX_COMPLETION_PACK_TARGET = 20;

function seededCollection(cardIds: string[]) {
  return cardIds.reduce<Record<string, number>>((accumulator, cardId) => {
    accumulator[cardId] = (accumulator[cardId] ?? 0) + 1;
    return accumulator;
  }, {});
}

export const SEED_USERS: TradeUser[] = [
  {
    id: "admin-santini",
    name: "santini",
    isAdmin: true,
    collection: seededCollection([]),
    packsOpened: 0,
    packCredits: STARTER_PACK_CREDITS,
    bonusCodes: [],
    lastCodeRequestOn: null,
  },
  {
    id: "jose",
    name: "Jose",
    isAdmin: false,
    collection: seededCollection([]),
    packsOpened: 0,
    packCredits: STARTER_PACK_CREDITS,
    bonusCodes: [],
    lastCodeRequestOn: null,
  },
];
