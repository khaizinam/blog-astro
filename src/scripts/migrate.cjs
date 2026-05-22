const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
const TurndownService = require('turndown');

// Cấu hình Turndown chuyển đổi HTML sang Markdown
const turndownService = new TurndownService({
  headingStyle: 'atx',
  codeBlockStyle: 'fenced',
  emDelimiter: '_',
  strongDelimiter: '**',
  bulletMarker: '-'
});

// Thêm quy tắc xử lý Code Block <pre><code>...</code></pre>
turndownService.addRule('codeBlock', {
  filter: function (node) {
    return (
      node.nodeName === 'PRE' &&
      node.firstChild &&
      node.firstChild.nodeName === 'CODE'
    );
  },
  replacement: function (content, node) {
    const className = node.firstChild.className || '';
    const lang = className.replace('language-', '') || '';
    // Lấy nội dung text thuần để không bị escape ký tự lập trình
    const codeText = node.firstChild.textContent;
    return `\n\`\`\`${lang}\n${codeText.trim()}\n\`\`\`\n`;
  }
});

// Thêm quy tắc giữ nguyên thẻ iframe (ví dụ youtube video embed)
turndownService.keep(['iframe', 'embed']);

function decodeHtml(html) {
  if (!html) return '';
  return html
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'");
}

function formatDate(dateStr) {
  if (!dateStr) return new Date().toISOString();
  const d = new Date(dateStr);
  return d.toISOString();
}

function cleanYamlString(str) {
  if (!str) return '""';
  const cleaned = str
    .replace(/\\/g, '\\\\')
    .replace(/"/g, '\\"')
    .replace(/\n/g, ' ')
    .replace(/\r/g, '');
  return `"${cleaned}"`;
}

async function main() {
  const connection = await mysql.createConnection({
    host: '103.216.127.14',
    user: 'root',
    password: 'x7Qp9aZt',
    database: 'dev_blog',
    port: 4408
  });

  const postsDir = path.join(__dirname, '../content/posts');
  const viDir = path.join(postsDir, 'vi');
  const enDir = path.join(postsDir, 'en');

  // 1. Xoá sạch thư mục content posts cũ
  console.log('Cleaning up existing posts directories...');
  if (fs.existsSync(viDir)) {
    fs.rmSync(viDir, { recursive: true, force: true });
  }
  if (fs.existsSync(enDir)) {
    fs.rmSync(enDir, { recursive: true, force: true });
  }

  // Tạo lại thư mục
  fs.mkdirSync(viDir, { recursive: true });
  fs.mkdirSync(enDir, { recursive: true });

  try {
    // 2. Lấy toàn bộ bài viết đã published
    console.log('Fetching posts from MySQL database...');
    const [posts] = await connection.query(`
      SELECT 
        p.id, p.name as vi_title, p.description as vi_description, p.content as vi_content, p.created_at, p.is_featured, p.status,
        s.key as vi_slug,
        pt.name as en_title, pt.description as en_description, pt.content as en_content,
        st.key as en_slug
      FROM posts p
      LEFT JOIN slugs s ON s.reference_id = p.id AND s.reference_type LIKE '%Post'
      LEFT JOIN posts_translations pt ON pt.posts_id = p.id AND pt.lang_code = 'en_US'
      LEFT JOIN slugs_translations st ON st.slugs_id = s.id AND st.lang_code = 'en_US'
      WHERE p.status = 'published'
    `);

    console.log(`Found ${posts.length} published posts. Starting migration with HTML-to-Markdown conversion...`);

    for (let post of posts) {
      // Lấy tags cho bài viết này
      const [tagsRows] = await connection.query(`
        SELECT t.name 
        FROM tags t
        JOIN post_tags pt ON pt.tag_id = t.id
        WHERE pt.post_id = ?
      `, [post.id]);
      const tags = tagsRows.map(t => t.name);

      const translationKey = `post-${post.id}`;
      const pubDatetime = formatDate(post.created_at);
      const featured = post.is_featured === 1;

      // Định dạng tags YAML dạng an toàn
      const tagsYaml = tags.length > 0 
        ? tags.map(t => `  - "${t}"`).join('\n')
        : '  []';

      // --- TẠO BÀI VIẾT TIẾNG VIỆT ---
      const viSlug = post.vi_slug || `post-${post.id}`;
      const viTitle = decodeHtml(post.vi_title);
      const viDesc = decodeHtml(post.vi_description || '');
      
      // Convert HTML content sang Markdown
      const rawViContent = post.vi_content || '';
      const viMarkdownContent = turndownService.turndown(rawViContent);

      const viFrontmatter = `---
title: ${cleanYamlString(viTitle)}
author: KhaiziNam
pubDatetime: ${pubDatetime}
slug: ${viSlug}
lang: vi
translationKey: ${translationKey}
featured: ${featured}
draft: false
tags:
${tagsYaml}
description: ${cleanYamlString(viDesc)}
---

${viMarkdownContent}
`;
      const viFilePath = path.join(viDir, `${viSlug}.md`);
      fs.writeFileSync(viFilePath, viFrontmatter, 'utf8');
      console.log(`Migrated & Converted [VI]: ${viSlug}`);

      // --- TẠO BÀI VIẾT TIẾNG ANH (NẾU CÓ BẢN DỊCH) ---
      if (post.en_title) {
        const enSlug = viSlug;
        const enTitle = decodeHtml(post.en_title);
        const enDesc = decodeHtml(post.en_description || '');
        
        // Convert HTML content sang Markdown
        const rawEnContent = post.en_content || '';
        const enMarkdownContent = turndownService.turndown(rawEnContent);

        const enFrontmatter = `---
title: ${cleanYamlString(enTitle)}
author: KhaiziNam
pubDatetime: ${pubDatetime}
slug: ${enSlug}
lang: en
translationKey: ${translationKey}
featured: ${featured}
draft: false
tags:
${tagsYaml}
description: ${cleanYamlString(enDesc)}
---

${enMarkdownContent}
`;
        const enFilePath = path.join(enDir, `${enSlug}.md`);
        fs.writeFileSync(enFilePath, enFrontmatter, 'utf8');
        console.log(`Migrated & Converted [EN]: ${enSlug}`);
      }
    }

    console.log('\nMigration and HTML-to-Markdown conversion completed successfully!');

  } catch (error) {
    console.error('Error during migration:', error);
  } finally {
    await connection.end();
  }
}

main();
