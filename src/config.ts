import type { Site, SocialObjects } from "./types";

export const SITE: Site = {
  website: "https://blog.lkwplus.com/", // replace this with your deployed domain
  author: "lkw123",
  desc: "Yet another personal blog.",
  title: "lkw123's Blog",
  head: "NAMELESS",
  ogImage: "astropaper-og.jpg",
  lightAndDarkMode: true,
  postPerIndex: 4,
  postPerPage: 10,
  scheduledPostMargin: 15 * 60 * 1000, // 15 minutes
};

export const LOCALE = {
  lang: "zh", // html lang code. Set this empty and default will be "en"
  langTag: ["zh-CN"], // BCP 47 Language Tags. Set this empty [] to use the environment default
} as const;

export const LOGO_IMAGE = {
  enable: true,
  svg: false,
  width: 150,
  height: 20,
};

export const SOCIALS: SocialObjects = [
  {
    name: "Homepage",
    href: "https://www.lkwplus.com/",
    linkTitle: `${SITE.author}'s Homepage`,
    active: true,
    footeractive: true,
  },
  {
    name: "Github",
    href: "https://github.com/synthpop123",
    linkTitle: `${SITE.author} on Github`,
    active: true,
    footeractive: true,
  },
  {
    name: "Facebook",
    href: "https://github.com/satnaing/astro-paper",
    linkTitle: `${SITE.author} on Facebook`,
    active: false,
    footeractive: false,
  },
  {
    name: "LinkedIn",
    href: "https://github.com/satnaing/astro-paper",
    linkTitle: `${SITE.author} on LinkedIn`,
    active: false,
    footeractive: false,
  },
  {
    name: "Mail",
    href: "mailto:lkw20010211@gmail.com",
    linkTitle: `Send an email to ${SITE.author}`,
    active: true,
    footeractive: true,
  },
  {
    name: "Twitter",
    href: "https://x.com/whoamamamiii",
    linkTitle: `${SITE.author} on Twitter`,
    active: true,
    footeractive: false,
  },
  {
    name: "Telegram",
    href: "https://t.me/lkwtg",
    linkTitle: `${SITE.author} on Telegram`,
    active: true,
    footeractive: false,
  },
  {
    name: "Instagram",
    href: "https://www.instagram.com/whoamamiii/",
    linkTitle: `${SITE.author} on Instagram`,
    active: true,
    footeractive: false,
  },
  {
    name: "Twitch",
    href: "https://github.com/satnaing/astro-paper",
    linkTitle: `${SITE.author} on Twitch`,
    active: false,
    footeractive: false,
  },
  {
    name: "YouTube",
    href: "https://github.com/satnaing/astro-paper",
    linkTitle: `${SITE.author} on YouTube`,
    active: false,
    footeractive: false,
  },
  {
    name: "WhatsApp",
    href: "https://github.com/satnaing/astro-paper",
    linkTitle: `${SITE.author} on WhatsApp`,
    active: false,
    footeractive: false,
  },
  {
    name: "Snapchat",
    href: "https://github.com/satnaing/astro-paper",
    linkTitle: `${SITE.author} on Snapchat`,
    active: false,
    footeractive: false,
  },
  {
    name: "Pinterest",
    href: "https://github.com/satnaing/astro-paper",
    linkTitle: `${SITE.author} on Pinterest`,
    active: false,
    footeractive: false,
  },
  {
    name: "TikTok",
    href: "https://github.com/satnaing/astro-paper",
    linkTitle: `${SITE.author} on TikTok`,
    active: false,
    footeractive: false,
  },
  {
    name: "CodePen",
    href: "https://github.com/satnaing/astro-paper",
    linkTitle: `${SITE.author} on CodePen`,
    active: false,
    footeractive: false,
  },
  {
    name: "Discord",
    href: "https://github.com/satnaing/astro-paper",
    linkTitle: `${SITE.author} on Discord`,
    active: false,
    footeractive: false,
  },
  {
    name: "GitLab",
    href: "https://github.com/satnaing/astro-paper",
    linkTitle: `${SITE.author} on GitLab`,
    active: false,
    footeractive: false,
  },
  {
    name: "Reddit",
    href: "https://github.com/satnaing/astro-paper",
    linkTitle: `${SITE.author} on Reddit`,
    active: false,
    footeractive: false,
  },
  {
    name: "Skype",
    href: "https://github.com/satnaing/astro-paper",
    linkTitle: `${SITE.author} on Skype`,
    active: false,
    footeractive: false,
  },
  {
    name: "Steam",
    href: "https://github.com/satnaing/astro-paper",
    linkTitle: `${SITE.author} on Steam`,
    active: false,
    footeractive: false,
  },
  {
    name: "Mastodon",
    href: "https://mastodon.social/@lkw123",
    linkTitle: `${SITE.author} on Mastodon`,
    active: true,
    footeractive: false,
  },
];
