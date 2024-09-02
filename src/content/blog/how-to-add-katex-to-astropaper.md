---
author: lkw123
pubDatetime: 2024-02-23T20:00:00+08:00
modDatetime: 2024-07-30
title: 为 AstroPaper 主题添加 KaTeX 支持
slug: how-to-add-katex-to-astropaper
featured: false
draft: false
tags:
  - Blog
  - Astro
description: How to add KaTeX to AstroPaper theme
---

[AstroPaper](https://github.com/satnaing/astro-paper/) 主题并不支持 KaTeX，因此我们需要手动添加 KaTeX 支持。

## Table of contents

## 安装相关依赖项

首先，我们通过个人喜好的包管理器安装以下依赖项：

- `remark-math`：用于解析 Markdown 中的数学公式；
- `rehype-katex`：用于将数学公式渲染为 HTML。

```bash
pnpm add remark-math rehype-katex
```

## 修改博客 astro.config.mjs

在 `astro.config.mjs` 中新增 `remark-math` 和 `rehype-katex` 的引入：

```javascript
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
```

并在配置文件中的 markdown 部分添加相关定义，相关文档参见 [Astro Configuration Reference](https://docs.astro.build/en/reference/configuration-reference/)：

```javascript
export default defineConfig({
  ...
  markdown: {
    remarkPlugins: [
      remarkMath,
      ...
    ],
    rehypePlugins: [[rehypeKatex, { strict: false }]],
    ...
  },
});
```

PS：KaTeX 的这个套件的 `strict` 参数的预设值为 `warn`，也就是在进行转换的过程中，如果遇到汉字等不符合规范的字符，则会发出警告。

将 `strict` 参数设置为 `false`，可以消除这些警告。

## 添加 KaTeX 样式表引入

为引入 KaTeX 的 stylesheet，需在 `src/layouts/Layout.astro` 中在 Header 部分添加：

```html
<!-- KaTeX -->
<link
  rel="stylesheet"
  href="https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/katex.min.css"
  integrity="sha384-nB0miv6/jRmo5UMMR1wu3Gz6NLsoTkbqJghGIsx//Rlm+ZU03BU6SQNC66uf4l5+"
  crossorigin="anonymous"
/>
```

## 更改暗色主题相关 CSS

然而，根据 [issue #150](https://github.com/satnaing/astro-paper/issues/150) 中的讨论，AstroPaper 主题的暗色模式下 KaTeX 渲染效果不佳，会出现如下图所示的情形：

![AstroPaper 主题暗色模式下 KaTeX 渲染效果](@assets/images/astropaper-katex-dark-mode.jpg)

因此，我们需要手动在 `src/layouts/PostDetails.astro` 中新增相关 CSS 的处理：

```css
/* Fix the dim color of KaTeX in dark mode */
.prose {
  color: var(--color-text-base);
}
```

至此，AstroPaper 博客主题已支持 KaTeX 渲染。

## 可选：给博文新增 KaTeX Frontmatter 开关

经过以上的步骤，KaTeX 的 JavaScript 静态文件会全局引入，出现在几乎所有页面的 Header 中，这意味着打开博客的任意一篇文章都会加载 KaTeX 的相关资源，这显然是可以进一步优化的。

我们可以通过在博文的 Frontmatter 中新增 `katex` 开关，来控制是否加载 KaTeX 的相关资源：

1. 在 `src/content/config.ts` 中新增 `katex` 的配置项：

```typescript
import { SITE } from "@config";
import { defineCollection, z } from "astro:content";

const blog = defineCollection({
  type: "content",
  schema: ({ image }) =>
    z.object({
      author: z.string().default(SITE.author),
      ......
      canonicalURL: z.string().optional(),
      katex: z.boolean().default(false), // Add this line
    }),
});

export const collections = { blog };
```

2. 在 `src/layouts/PostDetails.astro` 中给文章添加 katex 属性，并赋给 `layoutProps`，最终传给 `Layout.astro` 组件以控制是否加载 KaTeX 的相关资源：

```astro
const { post } = Astro.props;

const {
  title,
  // ......
  tags,
  katex // Add this line
} = post.data;

const layoutProps = {
  title: `${title} | ${SITE.title}`,
  // ......
  scrollSmooth: true,
  katex // Add this line
};
```

3. 在 `src/layouts/Layout.astro` 中根据 `katex` 属性的值来决定是否加载 KaTeX 的相关资源：

```astro
<!-- KaTeX -->
{
  katex && (
    <link
      rel="stylesheet"
      href="https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/katex.min.css"
      integrity="sha384-nB0miv6/jRmo5UMMR1wu3Gz6NLsoTkbqJghGIsx//Rlm+ZU03BU6SQNC66uf4l5+"
      crossorigin="anonymous"
    />
  )
}
```

4. 可选。修改 `.vscode/astro-paper.code-snippets`，在 VS Code 中新增 KaTeX Frontmatter Snippet：

```json
{
  "Frontmatter": {
    "scope": "markdown",
    "prefix": "frontmatter",
    "body": [
      "---",
      "author: $1",
      // ......
      "tags:",
      "  - $7",
      "description: $8",
      "katex: ${9|false,true|}", // Add this line
      "---",
    ],
    "description": "Adds the frontmatter block for the AstroPaper Blog post"
  },
  // ......
}
```
