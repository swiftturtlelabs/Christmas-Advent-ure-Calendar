export interface UserProfile {
  uid: string;
  displayName: string;
  email: string;
  createdAt: string;
}

export interface Calendar {
  slug: string;
  ownerUid: string;
  title: string;
  year: number;
  lockMode: 'open' | 'date_locked';
  unlockPrompt?: string;
  unlockAnswerHash?: string;
  unlockAnswerSalt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DayContent {
  dayNumber: number;
  title: string;
  message: string;
  imageUrl?: string;
  sourceStockId?: string;
  token: string;
  updatedAt: string;
}

export interface DayLink {
  slug: string;
  dayNumber: number;
}

export interface StockAdventure {
  id: string;
  title: string;
  description: string;
  category: string;
  /** General topic tags (indoor, food, etc.). Not shown in the suggestions UI. */
  tags: string[];
  /**
   * Hidden day-affinity tags used only for ranking suggestions.
   * Prefer concrete day numbers ("1"…"24") and/or phases: early | mid | late | eve.
   */
  dayTags: string[];
}

export interface DayDraft {
  title: string;
  message: string;
  sourceStockId?: string;
}

export interface CalendarAdminConfig {
  unlockCode?: string;
}

export interface CalendarSettingsPatch {
  lockMode: Calendar['lockMode'];
  unlockPrompt?: string;
  unlockAnswer?: string;
}
