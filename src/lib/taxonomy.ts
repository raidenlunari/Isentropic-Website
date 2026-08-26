export const TIERS = ["major", "progress", "standard"] as const;
export const TOPICS = ["community", "research", "product"] as const;
export type Tier = (typeof TIERS)[number];
export type Topic = (typeof TOPICS)[number];
