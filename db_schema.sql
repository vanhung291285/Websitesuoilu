
-- ==============================================================================
-- KỊCH BẢN KHỞI TẠO CƠ SỞ DỮ LIỆU TOÀN DIỆN CHO VINAEDU CMS
-- Dự án: website_suoilu
-- ==============================================================================

-- 0. Kích hoạt Extension quan trọng
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Bảng cấu hình trường học
CREATE TABLE IF NOT EXISTS school_config (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT DEFAULT 'Trường học Suối Lư',
  slogan TEXT DEFAULT 'SGD tỉnh Điện Biên',
  logo_url TEXT,
  favicon_url TEXT,
  banner_url TEXT,
  principal_name TEXT,
  address TEXT DEFAULT 'Huyện Điện Biên Đông, Tỉnh Điện Biên',
  phone TEXT,
  email TEXT,
  hotline TEXT,
  map_url TEXT,
  facebook TEXT,
  youtube TEXT,
  zalo TEXT DEFAULT '',
  website TEXT,
  show_welcome_banner BOOLEAN DEFAULT true,
  home_news_count INTEGER DEFAULT 6,
  home_show_program BOOLEAN DEFAULT true,
  primary_color TEXT DEFAULT '#1e3a8a',
  title_color TEXT DEFAULT '#fbbf24',
  title_shadow_color TEXT DEFAULT 'rgba(0,0,0,0.8)',
  meta_title TEXT,
  meta_description TEXT,
  footer_links JSONB DEFAULT '[]', -- Cột quan trọng lưu danh sách liên kết chân trang
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- (Các bảng khác giữ nguyên như file gốc)
-- 2. Chuyên mục bài viết
CREATE TABLE IF NOT EXISTS post_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  color TEXT DEFAULT 'blue',
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Bài viết
CREATE TABLE IF NOT EXISTS posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  summary TEXT,
  content TEXT,
  thumbnail TEXT,
  image_caption TEXT,
  author TEXT,
  date DATE DEFAULT CURRENT_DATE,
  category TEXT,
  views INTEGER DEFAULT 0,
  status TEXT DEFAULT 'published',
  is_featured BOOLEAN DEFAULT false,
  show_on_home BOOLEAN DEFAULT true,
  block_ids JSONB DEFAULT '[]',
  tags JSONB DEFAULT '[]',
  attachments JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- (Các phần còn lại của db_schema.sql...)
