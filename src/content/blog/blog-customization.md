---
author: lkw123
pubDatetime: 2024-05-25T00:00:00.000Z
title: 博客自定义
slug: blog-customization
featured: false
tags:
  - Blog
description: How I customize my blog
---

## Table of contents

## 修改

### 字体

由于 Astro-Paper 主题默认采用的 IBM Plex Mono 字体对于中文支持不佳，我选择将主字体替换为开源中文字体 [落霞文楷](https://github.com/lxgw/LxgwWenKai)。

需要在 `tailwind.config.cjs` 中对 `fontFamily` 的扩展进行修改，将 `IBM Plex Mono` 替换为 `LXGW WenKai Screen`：

```diff
@@ -54,7 +54,7 @@ module.exports = {
         transparent: "transparent",
       },
       fontFamily: {
-        mono: ["IBM Plex Mono", "monospace"],
+        mono: ["LXGW WenKai Screen", "monospace"],
       },

       typography: {
```
