import rss from "@astrojs/rss";
import type { APIContext } from "astro";
import { getCollection } from "astro:content";
import { publishedPosts, sortByDateDesc } from "../lib/posts";
import { site } from "../data/site";

export async function GET(context: APIContext) {
  const posts = sortByDateDesc(publishedPosts(await getCollection("blog")));

  return rss({
    title: site.name,
    description: site.description,
    site: context.site!,
    items: posts.map((post) => ({
      title: post.data.title,
      pubDate: post.data.date,
      description: post.data.summary,
      link: `/blog/${post.id}/`,
    })),
  });
}
