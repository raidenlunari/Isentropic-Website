// @ts-check
import { defineConfig } from "astro/config";
import { unified } from "@astrojs/markdown-remark";
import sitemap from "@astrojs/sitemap";
import { rehypeWrapTables } from "./src/lib/rehype-wrap-tables";

// https://astro.build/config
export default defineConfig({
  output: "static",
  site: "https://isentropic.tech",
  integrations: [sitemap()],
  markdown: {
    processor: unified({
      rehypePlugins: [rehypeWrapTables],
    }),
  },
});
