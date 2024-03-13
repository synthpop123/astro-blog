import { defineConfig } from "astro/config";
import tailwind from "@astrojs/tailwind";
import react from "@astrojs/react";
import remarkToc from "remark-toc";
import remarkCollapse from "remark-collapse";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import sitemap from "@astrojs/sitemap";
import { SITE } from "./src/config";

// https://astro.build/config
export default defineConfig({
  site: SITE.website,
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
      // https://shiki.style/themes
      theme: "material-theme",
      // 另外，也提供了多种主题
      // https://shiki.style/guide/dual-themes
      // themes: {
      //   light: 'github-light',
      //   dark: 'min-dark',
      // },
      // 添加自定义语言
      // https://shiki.style/languages
      // langs: [],
      // 启用自动换行，以防止水平滚动
      wrap: true,
      // 添加自定义转换器：https://shiki.style/guide/transformers
      // 查找常用转换器：https://shiki.style/packages/transformers
      // transformers: [],
    },
  },
  vite: {
    optimizeDeps: {
      exclude: ["@resvg/resvg-js"],
    },
  },
  scopedStyleStrategy: "where",
});
