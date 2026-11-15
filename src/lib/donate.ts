export const DONATE_HEADLINE = 'Buy me a Red Bull';

export const DONATE_BLURB =
  'This app is free. If it helped your family’s December, a small tip keeps the lights on (and the caffeine flowing).';

export const DONATE_PAYPAL_URL = 'https://paypal.me/Kengeph';

/** Public payment profile — same handle as PayPal.me/Kengeph */
export const DONATE_VENMO_URL = 'https://account.venmo.com/u/Kengeph';

export const DONATE_CASH_APP_URL = 'https://cash.app/$Kengeph';

export const DONATE_METHODS = [
  {
    id: 'paypal',
    name: 'PayPal',
    description: 'Works almost anywhere.',
    url: DONATE_PAYPAL_URL,
    cta: 'PayPal.me/Kengeph',
  },
  {
    id: 'venmo',
    name: 'Venmo',
    description: 'Easy if you already use Venmo.',
    url: DONATE_VENMO_URL,
    cta: '@Kengeph',
  },
  {
    id: 'cashapp',
    name: 'Cash App',
    description: 'Quick tips from your phone.',
    url: DONATE_CASH_APP_URL,
    cta: '$Kengeph',
  },
] as const;

/** Footer / settings short label */
export const DONATE_LABEL = DONATE_HEADLINE;
export const DONATE_PAGE_PATH = '/donate';