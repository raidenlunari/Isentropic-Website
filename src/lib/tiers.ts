import type { Tier } from "./taxonomy";

export function tierClass(tier: Tier): string {
  return `card card--${tier}`;
}

export function tickClass(tier: Tier): string {
  return `tick tick--${tier}`;
}
