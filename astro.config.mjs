// @ts-check
import { defineConfig } from "astro/config";
import { rehypeHeadingIds, unified } from "@astrojs/markdown-remark";
import sitemap from "@astrojs/sitemap";
import { rehypeFocusableCode, rehypeWrapTables } from "./src/lib/rehype-wrap-tables";
import {
  rehypeNestEntryHeadings,
  rehypeNamespaceEntryHeadingIds,
} from "./src/lib/rehype-nest-entry-headings";

// https://astro.build/config
export default defineConfig({
  output: "static",
  site: "https://isentropic.tech",
  integrations: [sitemap()],
  markdown: {
    // The site has a single light palette (see the design spec: no dark
    // mode), so code blocks take Shiki's light theme rather than the
    // github-dark default, which sets a dark inline background on every
    // <pre> and would clash with prose.css's light scroll cues. Astro
    // passes this to the processor below; it is not a `unified()` option.
    shikiConfig: { theme: "github-light" },
    processor: unified({
      // `rehypeHeadingIds` is Astro's own heading-id plugin, listed here
      // explicitly so the plugin after it can see the ids it assigns.
      // Astro runs it again internally afterwards; that pass leaves any
      // heading that already carries a string id alone, so the namespaced
      // ids below are the ones that ship.
      rehypePlugins: [
        rehypeWrapTables,
        rehypeFocusableCode,
        rehypeNestEntryHeadings,
        rehypeHeadingIds,
        rehypeNamespaceEntryHeadingIds,
      ],
    }),
  },
});
