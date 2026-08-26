// @ts-check
import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";

// https://astro.build/config
export default defineConfig({
  output: "static",
  site: "https://isentropicrobotics.org",
  integrations: [sitemap()],
  // The dev toolbar renders its own <h1> elements inside an open shadow
  // root (its "Astro", "Audit", and "Settings" panels). Playwright's
  // locators pierce open shadow roots by default, so those devtool-only
  // headings get counted alongside real page content in e2e assertions
  // like `page.locator("h1")`. Disabling the toolbar keeps the dev server's
  // DOM identical in shape to the production build it is meant to preview.
  devToolbar: {
    enabled: false,
  },
});
