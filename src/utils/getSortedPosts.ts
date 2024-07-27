import type { CollectionEntry } from "astro:content";
import postFilter from "./postFilter";

const getSortedPosts = (posts: CollectionEntry<"blog">[]) => {
  return posts
    .filter(postFilter)
    .sort(
      (a, b) =>
        // Sort by pubDatetime
        Math.floor(
          new Date(b.data.pubDatetime ?? b.data.modDatetime).getTime() / 1000
        ) -
        Math.floor(
          new Date(a.data.pubDatetime ?? a.data.modDatetime).getTime() / 1000
        )
    );
};

export default getSortedPosts;
