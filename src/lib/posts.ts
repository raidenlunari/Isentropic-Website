import type { Topic } from "./taxonomy";

type Dated = { data: { date: Date } };
type Draftable = { data: { draft: boolean } };
type Topical = { data: { topics: readonly Topic[] } };

export function sortByDateDesc<T extends Dated>(items: T[]): T[] {
  return [...items].sort(
    (a, b) => b.data.date.getTime() - a.data.date.getTime(),
  );
}

export function sortByDateAsc<T extends Dated>(items: T[]): T[] {
  return [...items].sort(
    (a, b) => a.data.date.getTime() - b.data.date.getTime(),
  );
}

export function publishedPosts<T extends Draftable>(items: T[]): T[] {
  return items.filter((i) => !i.data.draft);
}

export function filterByTopic<T extends Topical>(items: T[], topic: Topic): T[] {
  return items.filter((i) => i.data.topics.includes(topic));
}

export function withYearMarkers<T extends Dated>(
  items: T[],
): Array<{ item: T; yearMarker: string | null }> {
  const seen = new Set<number>();
  return items.map((item) => {
    const year = item.data.date.getUTCFullYear();
    const yearMarker = seen.has(year) ? null : String(year);
    seen.add(year);
    return { item, yearMarker };
  });
}
