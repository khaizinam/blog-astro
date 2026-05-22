import type { UIStrings } from "../types";

export default {
  nav: {
    home: "Trang chủ",
    posts: "Bài viết",
    tags: "Chủ đề",
    about: "Về tôi",
    archives: "Lưu trữ",
    search: "Tìm kiếm",
  },
  post: {
    publishedAt: "Đăng ngày",
    updatedAt: "Cập nhật",
    sharePostIntro: "Chia sẻ bài viết:",
    sharePostOn: "Chia sẻ bài viết này trên {{platform}}",
    sharePostViaEmail: "Chia sẻ bài viết qua email",
    tagLabel: "Chủ đề",
    backToTop: "Lên đầu trang",
    goBack: "Quay lại",
    editPage: "Chỉnh sửa trang",
    previousPost: "Bài trước",
    nextPost: "Bài tiếp theo",
  },
  pagination: {
    prev: "Trước",
    next: "Tiếp",
    page: "Trang",
  },
  home: {
    socialLinks: "Mạng xã hội",
    featured: "Nổi bật",
    recentPosts: "Bài viết mới nhất",
    allPosts: "Tất cả bài viết",
  },
  footer: {
    copyright: "Bản quyền",
    allRightsReserved: "Bảo lưu mọi quyền.",
  },
  pages: {
    tagTitle: "Chủ đề",
    tagDesc: "Tất cả bài viết với chủ đề",

    tagsTitle: "Chủ đề",
    tagsDesc: "Tất cả các chủ đề đã dùng trong bài viết.",

    postsTitle: "Bài viết",
    postsDesc: "Tất cả các bài viết của tôi.",

    archivesTitle: "Lưu trữ",
    archivesDesc: "Tất cả bài viết được lưu trữ.",

    searchTitle: "Tìm kiếm",
    searchDesc: "Tìm kiếm bài viết bất kỳ ...",
  },
  a11y: {
    skipToContent: "Bỏ qua đến nội dung",
    openMenu: "Mở menu",
    closeMenu: "Đóng menu",
    toggleTheme: "Chuyển giao diện",
    searchPlaceholder: "Tìm kiếm bài viết...",
    noResults: "Không tìm thấy kết quả",
    goToPreviousPage: "Trang trước",
    goToNextPage: "Trang tiếp theo",
  },
  notFound: {
    title: "404 Không tìm thấy",
    message: "Không tìm thấy trang",
    goHome: "Về trang chủ",
  },
} satisfies UIStrings;
