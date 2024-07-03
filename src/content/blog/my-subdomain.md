---
author: lkw123
pubDatetime: 2024-07-03T23:00:00Z
title: 我的子域名上都跑着哪些服务？
slug: services-on-my-subdomains
featured: false
draft: false
tags:
  - Cloudflare
  - Docker
  - Caddy
description: An overview of the various services hosted on my subdomains
---

## Table of contents

## 我的域名

> Working on it...

最初，我使用 [GitHub Student Pack](https://education.github.com/pack/offers) 中免费提供的 `.me` 和 `.tech` 域名等托管自己的一些杂七杂八的小项目，但我还是希望能拥有一个和自己的姓名高度关联的、具有自己的特征的 `.com` 顶级域名。

可由于 `姓名全拼.com` 已被注册，最终，我选择了 `lkwplus.com` 作为我的主域名，并希望尽可能的将自己部署在云端的服务链接到其子域名下，一方面是便于记忆和管理，另一方面也是想在这个网络世界里保留一点小小的仪式感。

域名注册于 [Namesilo](https://www.namesilo.com/)，DNS 服务由 [Cloudflare](https://www.cloudflare.com/) 提供。Whois 信息如下：

```toml
# Whois Information for lkwplus.com

Domain = lkwplus.com
Registrar = NameSilo, LLC
Registered_On = 2021-11-16
Expires_On = 2028-11-16
Updated_On = 2024-07-03
Status = ok
Namesevers = damiete.ns.cloudflare.com, robin.ns.cloudflare.com
```

## 静态网站

### PaaS 平台的选择

### 个人主页 www

在根域名，当然应该放置自己的个人主页。但是在此之前，关于 www(World Wide Web) 和 no www 的选择，也是一个很有趣的话题，可以参考 [MDN Web Doc](https://developer.mozilla.org/zh-CN/docs/Web/HTTP/Basics_of_HTTP/Choosing_between_www_and_non-www_URLs) 给出的解释，可以认为是一个非常主观的 `自行车棚效应`[^1]。

[^1]: 自行车棚效应（即帕金森琐碎法则），它描述了一种非常常见的现象：问题越简单，它所引起的讨论就越多，也就是其中“讨论量与主题的复杂程度是成反比的”。

仅出于个人偏好，我采用 www 作为个人主页的 hostname，并通过 HTTP 301 重定向将所有常识访问非规范网址 `lkwplus.com` 的请求重定向到规范的等效网址 `www.lkwplus.com` 上。

特别的，对于托管在 Cloudflare 中的域名，可以通过如下方式实现：

1. 在 Cloudflare 站点主页的 `Rules -> Redirect Rules` 板块添加重定向规则如下：

   - Rule name: `redirect domain apex to www`;

   - 选择 Custom filter expression，If 部分填入值：

     ```toml
     Field = 'Hostname'
     Operator = 'equals'
     Vaule = 'your-domain.com'
     ```

     Expression Preview 如下：

     ```
     (http.host eq "your-domain.com")
     ```

   - Then 部分填入值：

     ```toml
     Type = 'Dynamic'
     Expression = 'concat("https://www.your-domain.com", http.request.uri.path)'
     Status_Code = 301
     ```

   - 勾选 Preserve query string。

2. 为域名添加相关 DNS 配置如下：

| Type  | Name | Content                                                    | TTL  |
| ----- | ---- | ---------------------------------------------------------- | ---- |
| A     | @    | 192.0.2.1[^2]                                              | Auto |
| CNAME | www  | landing-page-5jq.pages.dev (Assigned by `Cloudflare Page`) | Auto |

[^2]: 192.0.2.1 是一个特殊的 IP 地址，用于文档和示例目的。这个地址属于 192.0.2.0/24 范围，该范围是由 IETF（Internet Engineering Task Force）在 RFC 5737 中定义的，用于教学、文档和示例代码中，不应该在实际的生产环境中使用。

## 动态网站

### Web Server 的选择

## 域名邮箱

---
