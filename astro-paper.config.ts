import { defineAstroPaperConfig } from "./src/types/config";

export default defineAstroPaperConfig({
  site: {
    url: "https://khaizinam.com",
    title: "KhaiziNam Blog",
    description:
      "Blog cá nhân về công nghệ, lập trình, kinh nghiệm thực tế và chia sẻ kiến thức từ góc nhìn của một developer Việt Nam.",
    author: "KhaiziNam",
    profile: "https://khaizinam.com",
    ogImage: "https://cdn.khaizinam.io.vn/blog/nextjs-vibe-coding.jpg",
    lang: "vi",
    timezone: "Asia/Ho_Chi_Minh",
    dir: "ltr",
    // Bilingual: "vi" = default (/:slug), "en" = /en/:slug
  },
  posts: {
    perPage: 6,
    perIndex: 6,
    scheduledPostMargin: 15 * 60 * 1000,
  },
  features: {
    lightAndDarkMode: true,
    dynamicOgImage: true,
    showArchives: true,
    showBackButton: true,
    editPost: {
      enabled: false,
    },
    search: "pagefind",
  },
  socials: [
    { name: "github", url: "https://github.com/khaizinam" },
    { name: "facebook", url: "https://facebook.com/khaizinam" },
    { name: "linkedin", url: "https://www.linkedin.com/in/khaizinam/" },
    { name: "mail", url: "mailto:contact@khaizinam.com" },
    { name: "rss", url: "/rss.xml" },
  ],
  shareLinks: [
    { name: "facebook", url: "https://www.facebook.com/sharer.php?u=" },
    { name: "x", url: "https://x.com/intent/post?url=" },
    { name: "telegram", url: "https://t.me/share/url?url=" },
    { name: "whatsapp", url: "https://wa.me/?text=" },
    { name: "pinterest", url: "https://pinterest.com/pin/create/button/?url=" },
    { name: "mail", url: "mailto:?subject=Bài viết hay&body=" },
  ],
});