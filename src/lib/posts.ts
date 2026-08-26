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

type Ordered = { data: { order: number } };

// Shared ascending sort for collections that carry an explicit `order`
// field (board members today). Non-mutating, like every other helper here:
// `getCollection()` hands back an array the caller does not own, and
// sorting it in place would reorder it for every other consumer in the
// same build.
export function sortByOrder<T extends Ordered>(items: T[]): T[] {
  return [...items].sort((a, b) => a.data.order - b.data.order);
}

export function publishedPosts<T extends Draftable>(items: T[]): T[] {
  return items.filter((i) => !i.data.draft);
}

export function filterByTopic<T extends Topical>(items: T[], topic: Topic): T[] {
  return items.filter((i) => i.data.topics.includes(topic));
}

const PRODUCT_KIND_ORDER = ["hardware", "software"] as const;
type Kinded = { data: { kind: (typeof PRODUCT_KIND_ORDER)[number] } };

// Groups product entries by kind for display purposes without an explicit
// GROUP BY: a stable sort on kind order (hardware, then software) yields
// the same visual grouping while keeping entries within a kind in their
// original relative order.
export function sortByKind<T extends Kinded>(items: T[]): T[] {
  return [...items].sort(
    (a, b) =>
      PRODUCT_KIND_ORDER.indexOf(a.data.kind) -
      PRODUCT_KIND_ORDER.indexOf(b.data.kind),
  );
}

type Openable = { data: { open: boolean } };

export function openRoles<T extends Openable>(items: T[]): T[] {
  return items.filter((i) => i.data.open);
}

type Categorized = { data: { category: string; order: number } };

// Groups role entries by category for display on the Contribute page,
// without an explicit GROUP BY: entries are first stably sorted by their
// declared `order` within the whole set, then bucketed by category in the
// order each category is first encountered. This keeps roles within a
// category in their intended display order while letting the page render
// one Disclosure per category.
export function groupRolesByCategory<T extends Categorized>(
  items: T[],
): Array<{ category: string; roles: T[] }> {
  const sorted = [...items].sort((a, b) => a.data.order - b.data.order);
  const order: string[] = [];
  const groups = new Map<string, T[]>();
  for (const item of sorted) {
    const { category } = item.data;
    const list = groups.get(category);
    if (list) {
      list.push(item);
    } else {
      groups.set(category, [item]);
      order.push(category);
    }
  }
  return order.map((category) => ({ category, roles: groups.get(category)! }));
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
