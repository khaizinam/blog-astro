const fs = require('fs');
const path = require('path');

function cleanSlugify(text) {
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

const POSTS_DIR_VI = path.join(__dirname, '../content/posts/vi');
const POSTS_DIR_EN = path.join(__dirname, '../content/posts/en');

function processDirectory(dirPath) {
  if (!fs.existsSync(dirPath)) return;
  const files = fs.readdirSync(dirPath).filter(f => f.endsWith('.md'));

  console.log(`\n=== Processing directory: ${dirPath} ===`);

  files.forEach(filename => {
    const filePath = path.join(dirPath, filename);
    let content = fs.readFileSync(filePath, 'utf8');
    let hasChanges = false;

    // 1. Tìm tất cả tiêu đề và slug tương ứng của chúng
    const headings = [];
    const lines = content.split('\n');
    lines.forEach((line, index) => {
      // Khớp các tiêu đề bắt đầu bằng ##, ###, ####, #####, ######
      const headingMatch = line.match(/^(#{2,6})\s+(.+)$/);
      if (headingMatch) {
        const level = headingMatch[1].length;
        const text = headingMatch[2].trim();
        const slug = cleanSlugify(text);
        headings.push({
          level,
          text,
          slug,
          lineNumber: index + 1
        });
      }
    });

    if (headings.length === 0) return;

    // 2. Tìm và thay thế các link mục lục
    // Khớp dạng: [Text](#anchor) hoặc * [Text](#anchor) hoặc [Text](#anchor)
    // Regex tìm kiếm các markdown link chứa anchor (bắt đầu bằng #)
    const linkRegex = /\[([^\]]+)\]\(#([^)]+)\)/g;

    const newContent = content.replace(linkRegex, (match, linkText, oldAnchor) => {
      const trimmedText = linkText.trim();
      
      // Trích xuất số thứ tự ở đầu, ví dụ "1. " hoặc "1\. " hoặc "1.1 "
      const numMatch = trimmedText.match(/^(\d+(\\\.)?\d*)/);
      const leadingNumber = numMatch ? numMatch[1].replace('\\', '') : null;

      // Tìm tiêu đề khớp
      let matchedHeading = null;

      // Cách 1: Tìm tiêu đề khớp chính xác slug của linkText
      const linkSlug = cleanSlugify(trimmedText);
      matchedHeading = headings.find(h => h.slug === linkSlug);

      // Cách 2: Nếu không khớp chính xác, tìm tiêu đề có cùng số thứ tự bắt đầu
      if (!matchedHeading && leadingNumber) {
        matchedHeading = headings.find(h => {
          const headingNumMatch = h.text.match(/^(\d+(\\\.)?\d*)/);
          if (headingNumMatch) {
            const hNum = headingNumMatch[1].replace('\\', '');
            return hNum === leadingNumber;
          }
          return false;
        });
      }

      // Cách 3: Nếu vẫn không khớp, thử so sánh độ tương đồng tương đối (chứa text)
      if (!matchedHeading) {
        const normalizedLink = cleanSlugify(trimmedText).replace(/^\d+-/, ''); // bỏ số ở đầu
        matchedHeading = headings.find(h => {
          const normalizedHeading = h.slug.replace(/^\d+-/, '');
          return normalizedHeading.includes(normalizedLink) || normalizedLink.includes(normalizedHeading);
        });
      }

      if (matchedHeading) {
        const newAnchor = matchedHeading.slug;
        if (oldAnchor !== newAnchor) {
          hasChanges = true;
          console.log(`  [${filename}] Fix: "${trimmedText}" -> #${newAnchor} (was #${oldAnchor})`);
          return `[${linkText}](#${newAnchor})`;
        }
      } else {
        // Cảnh báo nếu có anchor không khớp tiêu đề nào
        console.warn(`  [${filename}] Warning: Link "${trimmedText}" (#${oldAnchor}) could not be matched to any heading!`);
      }

      return match;
    });

    if (hasChanges) {
      fs.writeFileSync(filePath, newContent, 'utf8');
    }
  });
}

processDirectory(POSTS_DIR_VI);
processDirectory(POSTS_DIR_EN);
console.log('\n=== TOC Anchors Fix Complete! ===\n');
