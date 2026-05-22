import type { CollectionEntry } from "astro:content";
import { getPostUrl } from "./getPostPaths";

/**
 * Given a post, find its translation in the `allPosts` collection
 * by matching `translationKey` and opposite `lang`.
 *
 * Returns the URL of the translation, or undefined if none exists.
 */
export function findTranslation(
  post: CollectionEntry<"posts">,
  allPosts: CollectionEntry<"posts">[]
): { post: CollectionEntry<"posts">; url: string } | undefined {
  const { translationKey, lang } = post.data;
  if (!translationKey) return undefined;

  const targetLang = lang === "vi" ? "en" : "vi";

  const translated = allPosts.find(
    p =>
      p.data.translationKey === translationKey &&
      p.data.lang === targetLang &&
      !p.data.draft
  );

  if (!translated) return undefined;

  return {
    post: translated,
    url: getPostUrl(translated.id, translated.filePath, targetLang),
  };
}
