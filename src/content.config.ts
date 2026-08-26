import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";
import { TIERS, TOPICS } from "./lib/taxonomy";

const md = (dir: string) =>
  glob({ pattern: "**/[^_]*.md", base: `./src/content/${dir}` });

const blog = defineCollection({
  loader: md("blog"),
  schema: z.object({
    title: z.string().min(1),
    date: z.coerce.date(),
    summary: z.string().min(1),
    tier: z.enum(TIERS),
    topics: z.array(z.enum(TOPICS)).default([]),
    draft: z.boolean().default(false),
  }),
});

const board = defineCollection({
  loader: md("board"),
  schema: z.object({
    name: z.string().min(1),
    role: z.string().min(1),
    photo: z.string().min(1),
    alt: z.string().min(1),
    order: z.number().int(),
  }),
});

const events = defineCollection({
  loader: md("events"),
  schema: z.object({
    title: z.string().min(1),
    date: z.coerce.date(),
    location: z.string().min(1),
    summary: z.string().min(1),
  }),
});

const research = defineCollection({
  loader: md("research"),
  schema: z.object({
    title: z.string().min(1),
    date: z.coerce.date(),
    authors: z.array(z.string().min(1)).min(1),
    abstract: z.string().min(1),
    synopsis: z.string().min(1),
    manuscriptAvailable: z.boolean().default(true),
  }),
});

const products = defineCollection({
  loader: md("products"),
  schema: z.object({
    title: z.string().min(1),
    kind: z.enum(["hardware", "software"]),
    status: z.string().min(1),
    summary: z.string().min(1),
    links: z
      .array(z.object({ label: z.string().min(1), url: z.string().url() }))
      .default([]),
  }),
});

const roles = defineCollection({
  loader: md("roles"),
  schema: z.object({
    title: z.string().min(1),
    category: z.string().min(1),
    location: z.string().min(1),
    commitment: z.string().min(1),
    open: z.boolean().default(true),
    // `order` is sorted across every role in the collection first, and
    // categories are only formed afterward, in the order their first
    // (lowest-order) role appears in that global sort — see
    // groupRolesByCategory in src/lib/posts.ts. There is no separate
    // per-category ordering. Practically: giving one role in a category a
    // very low or very high `order` can move that role's whole category
    // section earlier or later on the Contribute page, not just reorder
    // that role within its own category. See CONTENT-GUIDE.md ("Task 8:
    // Open and close a volunteer role") for the plain-language version of
    // this warning.
    order: z.number().int().default(0),
  }),
});

export const collections = { blog, board, events, research, products, roles };
