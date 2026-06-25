import {
  defineConfig,
  envField,
  fontProviders,
  svgoOptimizer,
} from "astro/config";
import tailwindcss from "@tailwindcss/vite";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import remarkToc from "remark-toc";
import remarkCollapse from "remark-collapse";
import {
  transformerNotationDiff,
  transformerNotationHighlight,
  transformerNotationWordHighlight,
} from "@shikijs/transformers";
import { visit } from "unist-util-visit";
import { transformerFileName } from "./src/utils/transformers/fileName";
import config from "./astro-paper.config";

// Helpers for clean accent-free slugs
function getNodeText(node: any): string {
  if (node.type === "text") return node.value || "";
  if (node.children && Array.isArray(node.children)) {
    return node.children.map(getNodeText).join("");
  }
  return "";
}

function cleanSlugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Remove Vietnamese accents
    .replace(/[đĐ]/g, "d")
    .replace(/[^a-z0-9\s-]/g, "") // Remove special characters
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

function rehypeCleanSlugs() {
  return (tree: any) => {
    visit(tree, "element", (node: any) => {
      if (["h1", "h2", "h3", "h4", "h5", "h6"].includes(node.tagName)) {
        const text = getNodeText(node);
        node.properties = node.properties || {};
        node.properties.id = cleanSlugify(text);
      }
      if (node.tagName === "a" && node.properties && typeof node.properties.href === "string" && node.properties.href.startsWith("#") && node.properties.href.length > 1) {
        try {
          const decodedHref = decodeURIComponent(node.properties.href.slice(1));
          node.properties.href = "#" + cleanSlugify(decodedHref);
        } catch (e) {
          // ignore
        }
      }
    });
  };
}

function rehypeFigure() {
  return (tree: any) => {
    function visitNode(node: any) {
      if (node.children) {
        for (let i = 0; i < node.children.length; i++) {
          const child = node.children[i];
          // Tìm thẻ <p> chỉ chứa duy nhất một thẻ <img> có thuộc tính alt
          if (child.type === "element" && child.tagName === "p" && child.children) {
            const nonWhitespace = child.children.filter(
              (c: any) => !(c.type === "text" && /^\s*$/.test(c.value))
            );
            if (
              nonWhitespace.length === 1 &&
              nonWhitespace[0].type === "element" &&
              nonWhitespace[0].tagName === "img" &&
              nonWhitespace[0].properties &&
              nonWhitespace[0].properties.alt
            ) {
              const imgNode = nonWhitespace[0];
              const altText = imgNode.properties.alt;

              // Thay thế thẻ <p> bằng thẻ <figure> chứa ảnh và chú thích figcaption
              node.children[i] = {
                type: "element",
                tagName: "figure",
                properties: {},
                children: [
                  imgNode,
                  {
                    type: "element",
                    tagName: "figcaption",
                    properties: {},
                    children: [{ type: "text", value: altText }]
                  }
                ]
              };
              continue;
            }
          }
          visitNode(child);
        }
      }
    }
    visitNode(tree);
  };
}

function remarkFixTocLinks() {
  return (tree: any) => {
    visit(tree, "link", (node: any) => {
      if (typeof node.url === "string" && node.url.startsWith("#") && node.url.length > 1) {
        try {
          console.log("Found link to process:", node.url);
          const decodedUrl = decodeURIComponent(node.url.slice(1));
          node.url = "#" + cleanSlugify(decodedUrl);
          console.log("Processed link:", node.url);
        } catch (e) {
          console.error("Error processing link:", e);
        }
      }
    });
  };
}

export default defineConfig({
  site: config.site.url,
  redirects: {
    "/en/cach-dam-phan-luong-khi-moi-ra-truong-bi-quyet-de-khong-bi-tra-gia-thap-hon-gia-tri-that": "/en/junior-developer-salary-negotiation",
    "/en/muc-luong-fresher-junior-it-2026-ban-nen-ky-vong-bao-nhieu": "/en/entry-level-software-engineer-salary-2026",
    "/en/cach-gioi-thieu-ban-than-khi-phong-van-it-script-mau-cho-fresher-va-junior-dev": "/en/it-interview-self-introduction-scripts-by-stack"
  },
  integrations: [
    mdx({
      remarkPlugins: [remarkFixTocLinks],
      rehypePlugins: [rehypeCleanSlugs, rehypeFigure],
    }),
    sitemap({
      filter: page =>
        config.features?.showArchives !== false || !page.endsWith("/archives/"),
    }),
  ],
  i18n: {
    locales: ["vi", "en"],
    defaultLocale: "vi",
    routing: {
      prefixDefaultLocale: false,
    },
  },
  markdown: {
    remarkPlugins: [
      [remarkToc, { heading: "toc|table[ -]of[ -]contents?|mục lục|mục lục nội dung", maxDepth: 3 }],
      remarkFixTocLinks
    ],
    rehypePlugins: [rehypeCleanSlugs, rehypeFigure],
    shikiConfig: {
      themes: { light: "min-light", dark: "night-owl" },
      defaultColor: false,
      wrap: false,
      transformers: [
        transformerFileName({ style: "v2", hideDot: false }),
        transformerNotationHighlight(),
        transformerNotationWordHighlight(),
        transformerNotationDiff({ matchAlgorithm: "v3" }),
      ],
    },
  },
  vite: {
    plugins: [tailwindcss() as any],
  },
  fonts: [
    {
      name: "Google Sans Code",
      cssVariable: "--font-google-sans-code",
      provider: fontProviders.google(),
      fallbacks: ["monospace"],
      weights: [300, 400, 500, 600, 700],
      styles: ["normal", "italic"],
      formats: ["woff", "ttf"],
    },
  ],
  env: {
    schema: {
      PUBLIC_GOOGLE_SITE_VERIFICATION: envField.string({
        access: "public",
        context: "client",
        optional: true,
      }),
    },
  },
  experimental: {
    svgOptimizer: svgoOptimizer(),
  },
});
