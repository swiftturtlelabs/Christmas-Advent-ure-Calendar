import type { DayContent, DayDraft, StockAdventure } from './types';

export type DayPhase = 'early' | 'mid' | 'late' | 'eve';

export function applyStockAdventure(stock: StockAdventure): DayDraft {
  return {
    title: stock.title,
    message: stock.description,
    sourceStockId: stock.id,
  };
}

/** Advent phases for hidden dayTags ranking. */
export function getDayPhase(day: number): DayPhase {
  if (day >= 24) return 'eve';
  if (day <= 8) return 'early';
  if (day <= 16) return 'mid';
  return 'late';
}

export function scoreStockForDay(stock: StockAdventure, day: number): number {
  const tags = stock.dayTags ?? [];
  if (tags.includes(String(day))) return 100;

  let bestProximity = Infinity;
  for (const tag of tags) {
    const n = Number(tag);
    if (Number.isInteger(n) && n >= 1 && n <= 24) {
      bestProximity = Math.min(bestProximity, Math.abs(n - day));
    }
  }
  if (bestProximity <= 2) return 80 - bestProximity * 15;
  if (bestProximity <= 5) return 40 - bestProximity * 2;

  const phase = getDayPhase(day);
  if (tags.includes(phase)) return 30;

  return 0;
}

/** Stock ids already used on any filled day (by sourceStockId or matching title). */
export function collectUsedStockIds(
  days: DayContent[],
  stock: StockAdventure[] = STOCK_ADVENTURES,
): Set<string> {
  const used = new Set<string>();
  const byTitle = new Map(stock.map((s) => [s.title.toLowerCase(), s.id]));

  for (const day of days) {
    if (!day.message?.trim() && !day.title?.trim()) continue;
    if (day.sourceStockId) {
      used.add(day.sourceStockId);
      continue;
    }
    const match = byTitle.get(day.title.trim().toLowerCase());
    if (match) used.add(match);
  }

  return used;
}

/** Rank suggestions for a day: best affinity first; already-used items last. */
export function rankSuggestions(
  stock: StockAdventure[],
  day: number,
  usedIds: Set<string>,
): StockAdventure[] {
  return [...stock].sort((a, b) => {
    const aUsed = usedIds.has(a.id);
    const bUsed = usedIds.has(b.id);
    if (aUsed !== bUsed) return aUsed ? 1 : -1;

    const scoreDiff = scoreStockForDay(b, day) - scoreStockForDay(a, day);
    if (scoreDiff !== 0) return scoreDiff;

    return a.title.localeCompare(b.title);
  });
}

export const STOCK_ADVENTURES: StockAdventure[] = [
  {
    id: 'hang-stockings',
    title: 'Hang Stockings',
    description: 'Hang the stockings and share one thing you hope to find inside.',
    category: 'Traditions',
    tags: ['indoor', 'family'],
    dayTags: ['early', '1', '2', '3'],
  },
  {
    id: 'tree-decorating',
    title: 'Decorate the Tree',
    description: 'Put on Christmas music and decorate the tree together — lights first, ornaments second.',
    category: 'Traditions',
    tags: ['indoor', 'family'],
    dayTags: ['early', '1', '2', '3', '4'],
  },
  {
    id: 'ornament-craft',
    title: 'Make Ornaments',
    description: 'Create homemade ornaments and hang your favorites on the tree.',
    category: 'Crafts',
    tags: ['indoor', 'crafts'],
    dayTags: ['early', '3', '4', '5'],
  },
  {
    id: 'paper-snowflakes',
    title: 'Paper Snowflakes',
    description: 'Cut paper snowflakes and tape a flurry in a window.',
    category: 'Crafts',
    tags: ['indoor', 'crafts', 'kids'],
    dayTags: ['early', '4', '5', '6'],
  },
  {
    id: 'letter-to-santa',
    title: 'Letter to Santa',
    description: 'Write (or draw) a letter to Santa and leave it somewhere special.',
    category: 'Traditions',
    tags: ['indoor', 'writing', 'kids'],
    dayTags: ['early', '5', '6', '7'],
  },
  {
    id: 'popcorn-garland',
    title: 'Popcorn Garland',
    description: 'Thread popcorn and cranberries into a classic garland for the tree.',
    category: 'Crafts',
    tags: ['indoor', 'crafts', 'food'],
    dayTags: ['early', '6', '7', '8'],
  },
  {
    id: 'hot-cocoa',
    title: 'Hot Cocoa Night',
    description: 'Make hot cocoa together with marshmallows, whipped cream, and a cozy movie queue.',
    category: 'Cozy',
    tags: ['indoor', 'food'],
    dayTags: ['early', 'mid', '7', '8', '9', '14'],
  },
  {
    id: 'story-time',
    title: 'Christmas Story Time',
    description: 'Read a Christmas story or poem by the tree — take turns with the voices.',
    category: 'Cozy',
    tags: ['indoor', 'reading'],
    dayTags: ['early', 'mid', '8', '9', '10'],
  },
  {
    id: 'movie-night',
    title: 'Christmas Movie Night',
    description: 'Watch a classic Christmas movie with blankets, popcorn, and dimmed lights.',
    category: 'Cozy',
    tags: ['indoor', 'movie'],
    dayTags: ['mid', '9', '10', '11', '15'],
  },
  {
    id: 'carol-sing',
    title: 'Carol Sing-Along',
    description: 'Sing your favorite Christmas carols together — silly verses encouraged.',
    category: 'Music',
    tags: ['indoor', 'music'],
    dayTags: ['mid', '10', '11', '12'],
  },
  {
    id: 'cookie-baking',
    title: 'Bake Cookies',
    description: 'Bake and decorate Christmas cookies — save a plate for Santa!',
    category: 'Food',
    tags: ['indoor', 'baking'],
    dayTags: ['mid', '11', '12', '13'],
  },
  {
    id: 'gingerbread',
    title: 'Gingerbread Houses',
    description: 'Build and decorate gingerbread houses (kits welcome — creativity required).',
    category: 'Food',
    tags: ['indoor', 'baking'],
    dayTags: ['mid', '12', '13', '14'],
  },
  {
    id: 'festive-breakfast',
    title: 'Festive Breakfast',
    description: 'Make a special Christmas breakfast — pancakes shaped like trees or stars!',
    category: 'Food',
    tags: ['indoor', 'food'],
    dayTags: ['mid', '13', '14', '15'],
  },
  {
    id: 'mug-decorating',
    title: 'Decorate Mugs',
    description: 'Paint or mark ceramic mugs for a homemade cocoa set.',
    category: 'Crafts',
    tags: ['indoor', 'crafts'],
    dayTags: ['mid', '14', '15'],
  },
  {
    id: 'lights-walk',
    title: 'Neighborhood Lights Walk',
    description: 'Take an evening walk to see the Christmas lights in your neighborhood.',
    category: 'Outdoors',
    tags: ['outdoor', 'walk'],
    dayTags: ['mid', '15', '16', '17'],
  },
  {
    id: 'drive-lights',
    title: 'Drive to See Lights',
    description: 'Take a drive to see the best Christmas light displays nearby.',
    category: 'Outdoors',
    tags: ['outdoor', 'drive'],
    dayTags: ['mid', 'late', '16', '17', '18'],
  },
  {
    id: 'snowman',
    title: 'Build a Snowman',
    description: 'If there is snow, build a snowman. If not, draw one together or build one from cotton!',
    category: 'Outdoors',
    tags: ['outdoor', 'winter'],
    dayTags: ['mid', '15', '16'],
  },
  {
    id: 'photo-day',
    title: 'Holiday Photo Day',
    description: 'Take a festive family photo — matching pajamas optional but encouraged.',
    category: 'Memories',
    tags: ['indoor', 'photo'],
    dayTags: ['mid', 'late', '16', '17'],
  },
  {
    id: 'scavenger-hunt',
    title: 'Holiday Scavenger Hunt',
    description: 'Hide festive clues around the house and race to the final prize.',
    category: 'Fun',
    tags: ['indoor', 'game', 'kids'],
    dayTags: ['mid', 'late', '17', '18'],
  },
  {
    id: 'puzzle',
    title: 'Holiday Puzzle',
    description: 'Work on a Christmas-themed puzzle together with snacks nearby.',
    category: 'Cozy',
    tags: ['indoor', 'game'],
    dayTags: ['late', '17', '18', '19'],
  },
  {
    id: 'gift-wrap',
    title: 'Gift Wrapping Party',
    description: 'Wrap presents together with festive paper, ribbons, and creative tags.',
    category: 'Traditions',
    tags: ['indoor', 'crafts'],
    dayTags: ['late', '18', '19', '20', '21'],
  },
  {
    id: 'thank-you',
    title: 'Write Thank-You Notes',
    description: 'Write thank-you cards for people who made your year special.',
    category: 'Kindness',
    tags: ['indoor', 'writing'],
    dayTags: ['late', '19', '20'],
  },
  {
    id: 'charity',
    title: 'Give Back',
    description: 'Donate toys, food, or time to a local charity this season.',
    category: 'Kindness',
    tags: ['community'],
    dayTags: ['late', '19', '20', '21'],
  },
  {
    id: 'snow-globe',
    title: 'DIY Snow Globes',
    description: 'Make simple snow globes with jars, figurines, and glitter.',
    category: 'Crafts',
    tags: ['indoor', 'crafts'],
    dayTags: ['late', '20', '21'],
  },
  {
    id: 'dance-party',
    title: 'Holiday Dance Party',
    description: 'Put on festive music and have a living-room dance party.',
    category: 'Fun',
    tags: ['indoor', 'music'],
    dayTags: ['late', '21', '22'],
  },
  {
    id: 'candlelight',
    title: 'Candlelight Dinner',
    description: 'Have a special candlelit dinner with festive place settings.',
    category: 'Cozy',
    tags: ['indoor', 'food'],
    dayTags: ['late', 'eve', '22', '23'],
  },
  {
    id: 'reindeer-food',
    title: 'Reindeer Food',
    description: 'Mix oats and glitter for reindeer food to sprinkle outside on Christmas Eve.',
    category: 'Traditions',
    tags: ['outdoor', 'kids'],
    dayTags: ['late', 'eve', '22', '23', '24'],
  },
  {
    id: 'christmas-market',
    title: 'Visit a Market',
    description: 'Visit a local Christmas market or festive shop stroll for treats and lights.',
    category: 'Outdoors',
    tags: ['outdoor', 'family'],
    dayTags: ['mid', 'late', '18', '19'],
  },
  {
    id: 'wish-list',
    title: 'Share Wishes',
    description: 'Each person shares one wish for the coming year — write them down to revisit next December.',
    category: 'Memories',
    tags: ['indoor', 'family'],
    dayTags: ['eve', '23', '24'],
  },
  {
    id: 'memory-jar',
    title: 'Memory Jar',
    description: 'Write down favorite memories from the year and read them aloud.',
    category: 'Memories',
    tags: ['indoor', 'family'],
    dayTags: ['eve', '23', '24'],
  },
  {
    id: 'pajamas-and-cocoa',
    title: 'Pajamas & Cocoa',
    description: 'Put on holiday pajamas early, make cocoa, and settle in for Christmas Eve.',
    category: 'Cozy',
    tags: ['indoor', 'food', 'family'],
    dayTags: ['eve', '24'],
  },
  {
    id: 'stockings',
    title: 'Stocking Stories',
    description: 'Hang or refill stockings and tell a short story about your favorite Christmas morning.',
    category: 'Traditions',
    tags: ['indoor', 'family'],
    dayTags: ['eve', '24'],
  },
];

export function getStockAdventure(id: string): StockAdventure | undefined {
  return STOCK_ADVENTURES.find((s) => s.id === id);
}
