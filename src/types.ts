import type socialIcons from "@assets/socialIcons";

export type Site = {
  website: string;
  author: string;
  desc: string;
  title: string;
  head: string;
  ogImage?: string;
  lightAndDarkMode: boolean;
  postPerIndex: number;
  postPerPage: number;
  scheduledPostMargin: number;
};

export type SocialObjects = {
  name: keyof typeof socialIcons;
  href: string;
  active: boolean;
  footeractive: boolean;
  linkTitle: string;
}[];
