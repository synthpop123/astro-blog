import { defineConfig } from "astro/config";
import tailwind from "@astrojs/tailwind";
import react from "@astrojs/react";
import remarkToc from "remark-toc";
import remarkCollapse from "remark-collapse";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import sitemap from "@astrojs/sitemap";
import { SITE } from "./src/config";
import vercel from "@astrojs/vercel/serverless";

// https://astro.build/config
export default defineConfig({
  site: SITE.website,
  output: "server",
  adapter: vercel({
    webAnalytics: {
      enabled: true,
    },
  }),
  integrations: [
    tailwind({
      applyBaseStyles: false,
    }),
    react(),
    sitemap(),
  ],
  markdown: {
    remarkPlugins: [
      remarkMath,
      remarkToc,
      [
        remarkCollapse,
        {
          test: "Table of Contents",
        },
      ],
    ],
    rehypePlugins: [rehypeKatex],
    shikiConfig: {
      theme: "one-dark-pro",
      wrap: true,
    },
  },
  vite: {
    optimizeDeps: {
      exclude: ["@resvg/resvg-js"],
    },
  },
  scopedStyleStrategy: "where",
});
