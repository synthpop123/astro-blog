---
author: lkw123
pubDatetime: 2024-02-23T20:00:00.000Z
title: 为 AstroPaper 主题添加 KaTeX 支持
slug: how-to-add-katex-to-astropaper
featured: false
draft: false
tags:
  - Blog
description: How you can add KaTeX to AstroPaper theme
---

[AstroPaper](https://github.com/satnaing/astro-paper/) 主题并不支持 KaTeX，因此我们需要手动添加 KaTeX 支持。

## Table of contents

## 安装依赖项

为了使博客的本地构建可以正常运行，我们需要安装相关依赖项：

- `remark-math`：用于解析 Markdown 中的数学公式；
- `rehype-katex`：用于将数学公式渲染为 HTML。

```bash
npm install remark-math
npm install rehype-katex
```

## 修改博客 JavaScript 配置文件

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
    rehypePlugins: [rehypeKatex],
    ...
  },
});
```

## 添加 KaTeX 样式表引入

为引入 KaTeX 的 stylesheet，需在 `src/layouts/Layout.astro` 中添加：

```html
<!-- Katex -->
<link
  rel="stylesheet"
  href="https://cdn.jsdelivr.net/npm/katex@0.16.10/dist/katex.min.css"
  integrity="sha384-wcIxkf4k558AjM3Yz3BBFQUbk/zgIYC2R0QpeeYb+TwlBVMrlgLqwRjRtGZiK7ww"
  crossorigin="anonymous"
/>
```

## 更改暗色主题相关 CSS

然而，根据 [issue #150](https://github.com/satnaing/astro-paper/issues/150) 中的讨论，AstroPaper 主题的暗色模式下 KaTeX 渲染效果不佳，会出现如下图所示的情形：

![AstroPaper 主题暗色模式下 KaTeX 渲染效果](@assets/images/astropaper-katex-dark-mode.png)

因此，我们需要手动在 `src/layouts/PostDetails.astro` 中新增覆写相关 CSS 的处理：

```css
/* Fix the dim color of KaTeX in dark mode */
.prose {
  color: var(--color-text-base);
}
```

在进行本地构建后，`package.json` 和 `package-lock.json` 文件会自动修改。至此，AstroPaper 博客主题已支持 KaTeX 渲染。
