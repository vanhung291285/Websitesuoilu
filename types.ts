
export enum UserRole {
  ADMIN = 'ADMIN',   // Quản trị viên cao cấp
  EDITOR = 'EDITOR', // Biên tập viên
  GUEST = 'GUEST'
}

export interface User {
  id: string;
  username: string;
  password?: string;
  fullName: string;
  role: UserRole;
  email: string;
}

export interface FooterLink {
  id: string;
  label: string;
  url: string;
}

export interface Tool {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
}

export interface Message {
  role: 'user' | 'model';
  text: string;
}

export interface Video {
  id: string;
  title: string;
  youtubeUrl: string;
  order: number;
}

export interface DisplayBlock {
  id: string;
  name: string;
  position: 'main' | 'sidebar';
  type: 'hero' | 'grid' | 'list' | 'highlight' | 'docs' | 'html' | 'stats' | 'video'; 
  order: number;
  itemCount: number;
  isVisible: boolean;
  htmlContent?: string; 
  targetPage: 'all' | 'home' | 'detail'; 
  customColor?: string;     // Màu chủ đạo của khối (thanh dọc, nút, gạch chân)
  customTextColor?: string; // Màu chữ tiêu đề
}

export interface Attachment {
  id: string;
  name: string;
  url: string;
  type: 'file' | 'link';
  fileType?: string;
}

export interface PostCategory {
  id: string;
  name: string;
  slug: string;
  color: string;
  order: number;
}

export interface Post {
  id: string;
  title: string;
  slug: string;
  summary: string;
  content: string;
  thumbnail: string;
  imageCaption?: string;
  author: string;
  date: string;
  category: string;
  additionalCategories?: string[];
  tags: string[];
  views: number;
  status: 'draft' | 'published' | 'scheduled'; 
  publishedAt?: string; 
  isFeatured: boolean;
  showOnHome: boolean;
  blockIds: string[];
  attachments: Attachment[];
}

export interface IntroductionArticle {
  id: string;
  title: string;
  slug: string;
  content: string;
  imageUrl?: string;
  order: number;
  isVisible: boolean;
}

export interface DocumentCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  order: number;
}

export interface SchoolDocument {
  id: string;
  number: string;
  title: string;
  date: string;
  categoryId: string;
  downloadUrl: string;
}

export interface GalleryAlbum {
  id: string;
  title: string;
  description?: string;
  thumbnail: string;
  createdDate: string;
}

export interface GalleryImage {
  id: string;
  url: string;
  caption: string;
  albumId: string;
}

export interface MenuItem {
  id: string;
  label: string;
  path: string;
  order: number;
}

export interface SchoolConfig {
  name: string;
  slogan: string;
  logoUrl: string;
  faviconUrl?: string;
  bannerUrl: string;
  principalName: string;
  address: string;
  phone: string;
  email: string;
  hotline: string;
  mapUrl: string;
  facebook: string;
  youtube: string;
  zalo?: string; 
  website: string;
  showWelcomeBanner: boolean;
  homeNewsCount: number;
  homeShowProgram: boolean;
  primaryColor: string;
  titleColor?: string;
  titleShadowColor?: string;
  metaTitle: string;
  metaDescription: string;
  footerLinks?: FooterLink[]; // Mảng các liên kết ở chân trang
}

export interface StaffMember {
  id: string;
  fullName: string;
  position: string;
  partyDate?: string;
  email: string;
  avatarUrl: string;
  order: number;
}

export type PageRoute = 
  | 'home' 
  | 'intro'           
  | 'news' 
  | 'news-detail' 
  | 'documents'       
  | 'resources'       
  | 'gallery'         
  | 'contact' 
  | 'staff'           
  | 'login' 
  | 'admin-dashboard' 
  | 'admin-news' 
  | 'admin-categories'
  | 'admin-videos'
  | 'admin-blocks'
  | 'admin-docs'
  | 'admin-gallery'
  | 'admin-users'
  | 'admin-staff'
  | 'admin-intro'
  | 'admin-menu'
  | 'admin-settings';
