const fs = require('fs');
const path = require('path');

const POSTS_DIR_VI = path.join(__dirname, '../content/posts/vi');
const POSTS_DIR_EN = path.join(__dirname, '../content/posts/en');

function fixLinksInDirectory(dirPath, isEnglish) {
  if (!fs.existsSync(dirPath)) return;
  const files = fs.readdirSync(dirPath).filter(f => f.endsWith('.md'));

  console.log(`\n=== Fixing internal links in: ${dirPath} (isEnglish: ${isEnglish}) ===`);

  files.forEach(filename => {
    const filePath = path.join(dirPath, filename);
    let content = fs.readFileSync(filePath, 'utf8');
    let hasChanges = false;

    // Regex to match khaizinam.com URLs
    // Group 1 captures the pathname (and hash/query if any)
    const urlRegex = /https?:\/\/(?:www\.)?khaizinam\.com([^\s)\]"\'>]*)/gi;

    const newContent = content.replace(urlRegex, (match, pathAndHash) => {
      // 1. Kiểm tra xem có phải là ảnh không (kết thúc bằng đuôi ảnh thông dụng)
      const cleanPath = pathAndHash.split('?')[0].split('#')[0];
      const isImage = /\.(jpg|jpeg|png|webp|gif|svg)$/i.test(cleanPath);
      
      if (isImage) {
        // Giữ nguyên link ảnh hoàn chỉnh để tránh mất ảnh
        return match;
      }

      // 2. Tách phần hash (#...) nếu có
      const hashIndex = pathAndHash.indexOf('#');
      let pathname = hashIndex !== -1 ? pathAndHash.substring(0, hashIndex) : pathAndHash;
      const hash = hashIndex !== -1 ? pathAndHash.substring(hashIndex) : '';

      // 3. Chuẩn hóa pathname
      // Xóa dấu / ở đầu và cuối
      let relativePath = pathname.replace(/^\/|\/$/g, '');
      
      // Xóa tiền tố ngôn ngữ "en/" nếu có để lấy slug gốc sạch sẽ
      if (relativePath.startsWith('en/')) {
        relativePath = relativePath.substring(3);
      } else if (relativePath.startsWith('en')) {
        relativePath = relativePath.substring(2);
      }
      relativePath = relativePath.replace(/^\/|\/$/g, '');

      // 4. Sinh link tương đối chuẩn dựa vào ngôn ngữ của bài viết hiện tại
      let newUrl = '';
      if (isEnglish) {
        newUrl = relativePath ? `/en/${relativePath}` : '/en';
      } else {
        newUrl = relativePath ? `/${relativePath}` : '/';
      }

      // 5. Nối lại phần hash nếu có
      newUrl += hash;

      if (match !== newUrl) {
        hasChanges = true;
        console.log(`  [${filename}] Changed: ${match} -> ${newUrl}`);
      }

      return newUrl;
    });

    if (hasChanges) {
      fs.writeFileSync(filePath, newContent, 'utf8');
    }
  });
}

fixLinksInDirectory(POSTS_DIR_VI, false);
fixLinksInDirectory(POSTS_DIR_EN, true);

console.log('\n=== Internal Links Fix Complete! ===\n');
