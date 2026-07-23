import type { DayDraft, StockAdventure } from './types';

export function applyStockAdventure(stock: StockAdventure): DayDraft {
  return {
    title: stock.title,
    message: stock.description,
  };
}

export const STOCK_ADVENTURES: StockAdventure[] = [
  { id: 'hot-cocoa', title: 'Hot Cocoa Night', description: 'Make hot cocoa together with marshmallows and whipped cream.', category: 'Cozy', tags: ['indoor', 'food'] },
  { id: 'tree-decorating', title: 'Decorate the Tree', description: 'Put on Christmas music and decorate the tree together.', category: 'Traditions', tags: ['indoor', 'family'] },
  { id: 'cookie-baking', title: 'Bake Cookies', description: 'Bake and decorate Christmas cookies — save some for Santa!', category: 'Food', tags: ['indoor', 'baking'] },
  { id: 'lights-walk', title: 'Neighborhood Lights Walk', description: 'Take an evening walk to see the Christmas lights in your neighborhood.', category: 'Outdoors', tags: ['outdoor', 'walk'] },
  { id: 'movie-night', title: 'Christmas Movie Night', description: 'Watch a classic Christmas movie with blankets and popcorn.', category: 'Cozy', tags: ['indoor', 'movie'] },
  { id: 'carol-sing', title: 'Carol Sing-Along', description: 'Sing your favorite Christmas carols together.', category: 'Music', tags: ['indoor', 'music'] },
  { id: 'gift-wrap', title: 'Gift Wrapping Party', description: 'Wrap presents together with festive paper and ribbons.', category: 'Traditions', tags: ['indoor', 'crafts'] },
  { id: 'snowman', title: 'Build a Snowman', description: 'If there is snow, build a snowman. If not, draw one together!', category: 'Outdoors', tags: ['outdoor', 'winter'] },
  { id: 'charity', title: 'Give Back', description: 'Donate toys, food, or time to a local charity this season.', category: 'Kindness', tags: ['community'] },
  { id: 'story-time', title: 'Christmas Story Time', description: 'Read a Christmas story or poem by the tree.', category: 'Cozy', tags: ['indoor', 'reading'] },
  { id: 'ornament-craft', title: 'Make Ornaments', description: 'Create homemade ornaments for the tree.', category: 'Crafts', tags: ['indoor', 'crafts'] },
  { id: 'breakfast', title: 'Festive Breakfast', description: 'Make a special Christmas breakfast — pancakes shaped like trees!', category: 'Food', tags: ['indoor', 'food'] },
  { id: 'photo-day', title: 'Holiday Photo Day', description: 'Take a festive family photo in matching pajamas.', category: 'Memories', tags: ['indoor', 'photo'] },
  { id: 'puzzle', title: 'Holiday Puzzle', description: 'Work on a Christmas-themed puzzle together.', category: 'Cozy', tags: ['indoor', 'game'] },
  { id: 'drive-lights', title: 'Drive to See Lights', description: 'Take a drive to see the best Christmas light displays.', category: 'Outdoors', tags: ['outdoor', 'drive'] },
  { id: 'thank-you', title: 'Write Thank-You Notes', description: 'Write thank-you cards for people who made your year special.', category: 'Kindness', tags: ['indoor', 'writing'] },
  { id: 'gingerbread', title: 'Gingerbread Houses', description: 'Build and decorate gingerbread houses.', category: 'Food', tags: ['indoor', 'baking'] },
  { id: 'snow-globe', title: 'DIY Snow Globes', description: 'Make simple snow globes with jars and glitter.', category: 'Crafts', tags: ['indoor', 'crafts'] },
  { id: 'dance-party', title: 'Holiday Dance Party', description: 'Put on festive music and have a living room dance party.', category: 'Fun', tags: ['indoor', 'music'] },
  { id: 'wish-list', title: 'Share Wishes', description: 'Each person shares one wish for the coming year.', category: 'Memories', tags: ['indoor', 'family'] },
  { id: 'reindeer-food', title: 'Reindeer Food', description: 'Mix oats and glitter for reindeer food to sprinkle outside.', category: 'Traditions', tags: ['outdoor', 'kids'] },
  { id: 'candlelight', title: 'Candlelight Dinner', description: 'Have a special candlelit dinner with festive place settings.', category: 'Cozy', tags: ['indoor', 'food'] },
  { id: 'memory-jar', title: 'Memory Jar', description: 'Write down favorite memories from the year and read them aloud.', category: 'Memories', tags: ['indoor', 'family'] },
  { id: 'stockings', title: 'Hang Stockings', description: 'Hang stockings and share what you hope to find inside.', category: 'Traditions', tags: ['indoor', 'family'] },
];

export function getStockAdventure(id: string): StockAdventure | undefined {
  return STOCK_ADVENTURES.find((s) => s.id === id);
}
