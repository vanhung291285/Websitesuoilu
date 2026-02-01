
import { supabase } from './supabaseClient';
import { Post, SchoolConfig, SchoolDocument, GalleryImage, GalleryAlbum, User, UserRole, MenuItem, DisplayBlock, DocumentCategory, StaffMember, IntroductionArticle, PostCategory, Video } from '../types';

// Cấu hình mặc định dự phòng cho trường Suối Lư
const DEFAULT_CONFIG: SchoolConfig = {
  name: 'Trường PTDTBT TH và THCS Suối Lư',
  slogan: 'Trách nhiệm - Yêu thương - Sáng tạo',
  logoUrl: '',
  bannerUrl: '',
  principalName: '',
  address: 'Huyện Điện Biên Đông, Tỉnh Điện Biên',
  phone: '',
  email: '',
  hotline: '',
  mapUrl: '',
  facebook: '',
  youtube: '',
  zalo: '', 
  website: '',
  showWelcomeBanner: true,
  homeNewsCount: 6,
  homeShowProgram: true,
  primaryColor: '#1e3a8a',
  titleColor: '#fbbf24', 
  titleShadowColor: 'rgba(0,0,0,0.8)', 
  metaTitle: 'Trường PTDTBT TH và THCS Suối Lư',
  metaDescription: 'Cổng thông tin điện tử chính thức của Trường PTDTBT TH và THCS Suối Lư',
  footerLinks: [
    { id: '1', label: 'Bộ Giáo dục & Đào tạo', url: 'https://moet.gov.vn' },
    { id: '2', label: 'Sở GD tỉnh Điện Biên', url: '#' },
    { id: '3', label: 'Phòng GD Điện Biên Đông', url: '#' }
  ]
};

const CACHE_KEYS = {
  CONFIG: 'school_config_cache',
  MENU: 'menu_items_cache',
  POSTS: 'posts_list_cache'
};

const safeSaveCache = (key: string, data: any) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    if (e instanceof DOMException && (e.name === 'QuotaExceededError' || e.name === 'NS_ERROR_DOM_QUOTA_REACHED')) {
        localStorage.removeItem(CACHE_KEYS.POSTS);
    }
  }
};

export const DatabaseService = {
  // --- THỐNG KÊ TRUY CẬP ---
  trackVisit: async () => {
    try {
      const sessionId = sessionStorage.getItem('visitor_session_id') || crypto.randomUUID();
      sessionStorage.setItem('visitor_session_id', sessionId);

      await supabase.from('visitor_logs').upsert({ 
        session_id: sessionId,
        last_active: new Date().toISOString() 
      }, { onConflict: 'session_id' });

      const today = new Date().toISOString().split('T')[0];
      const visitKey = 'site_visit_' + today;
      
      if (!localStorage.getItem(visitKey)) {
          await supabase.rpc('increment_visit_counters');
          localStorage.setItem(visitKey, 'true');
      }
    } catch (e) {
      console.error("Tracking error", e);
    }
  },

  getVisitorStats: async () => {
    try {
      const { data: counters } = await supabase.from('site_counters').select('*');
      const tenMinsAgo = new Date(Date.now() - 10 * 60 * 1000).toISOString();
      const { count: onlineCount } = await supabase
        .from('visitor_logs')
        .select('*', { count: 'exact', head: true })
        .gt('last_active', tenMinsAgo);

      const statsMap: any = {};
      counters?.forEach(c => { statsMap[c.key] = parseInt(c.value); });

      return {
        total: statsMap['total_visits'] || 0,
        today: statsMap['today_visits'] || 0,
        month: statsMap['month_visits'] || 0,
        online: onlineCount || 1
      };
    } catch (e) {
      return { total: 0, today: 0, month: 0, online: 1 };
    }
  },

  // --- CẤU HÌNH HỆ THỐNG ---
  getConfig: async (): Promise<SchoolConfig> => {
    try {
        const { data, error } = await supabase.from('school_config').select('*').limit(1).single();
        if (error || !data) {
            const cached = localStorage.getItem(CACHE_KEYS.CONFIG);
            return cached ? JSON.parse(cached) : DEFAULT_CONFIG;
        }
        
        const config = {
           name: data.name,
           slogan: data.slogan,
           logoUrl: data.logo_url,
           faviconUrl: data.favicon_url,
           bannerUrl: data.banner_url,
           principalName: data.principal_name,
           address: data.address,
           phone: data.phone,
           email: data.email,
           hotline: data.hotline,
           mapUrl: data.map_url,
           facebook: data.facebook,
           youtube: data.youtube,
           zalo: data.zalo, 
           website: data.website,
           showWelcomeBanner: data.show_welcome_banner,
           homeNewsCount: data.home_news_count,
           homeShowProgram: data.home_show_program,
           primaryColor: data.primary_color,
           titleColor: data.title_color,
           titleShadowColor: data.title_shadow_color,
           metaTitle: data.meta_title,
           metaDescription: data.meta_description,
           footerLinks: data.footer_links || DEFAULT_CONFIG.footerLinks
        } as any;

        safeSaveCache(CACHE_KEYS.CONFIG, config);
        return config;
    } catch {
        const cached = localStorage.getItem(CACHE_KEYS.CONFIG);
        return cached ? JSON.parse(cached) : DEFAULT_CONFIG;
    }
  },

  saveConfig: async (config: SchoolConfig) => {
    const dbConfig = {
       name: config.name, slogan: config.slogan, logo_url: config.logoUrl, favicon_url: config.faviconUrl,
       banner_url: config.bannerUrl, principal_name: config.principalName, address: config.address,
       phone: config.phone, email: config.email, hotline: config.hotline, map_url: config.map_url,
       facebook: config.facebook, youtube: config.youtube, zalo: config.zalo, website: config.website,
       show_welcome_banner: config.showWelcomeBanner, home_news_count: config.homeNewsCount,
       home_show_program: config.homeShowProgram, primary_color: config.primaryColor,
       title_color: config.titleColor, title_shadow_color: config.titleShadowColor,
       meta_title: config.metaTitle, meta_description: config.metaDescription,
       footer_links: config.footer_links
    };
    const { data: currentData } = await supabase.from('school_config').select('id').limit(1);
    if (currentData && currentData.length > 0) {
       await supabase.from('school_config').update(dbConfig).eq('id', currentData[0].id);
    } else {
       await supabase.from('school_config').insert(dbConfig);
    }
    safeSaveCache(CACHE_KEYS.CONFIG, config);
  },

  // --- TIN TỨC & BÀI VIẾT (TỐI ƯU SWR) ---
  getPosts: async (limitCount: number = 20): Promise<Post[]> => {
    try {
        const { data, error } = await supabase
          .from('posts')
          .select('id, title, slug, summary, thumbnail, created_at, category, date, views, status, is_featured, show_on_home') 
          .eq('status', 'published')
          .order('created_at', { ascending: false })
          .limit(limitCount);
          
        if (error) throw error;

        const posts = (data || []).map((p: any) => ({ 
          id: p.id, title: p.title, slug: p.slug, summary: p.summary, 
          thumbnail: p.thumbnail, date: p.date, category: p.category, 
          views: p.views, status: p.status, isFeatured: p.is_featured, showOnHome: p.show_on_home,
          tags: [], attachments: [], blockIds: [] 
        })) as any;

        if (posts.length > 0) {
            safeSaveCache(CACHE_KEYS.POSTS, posts.slice(0, 20));
        }

        return posts;
    } catch (e) {
        console.error("Lỗi khi kết nối Supabase:", e);
        const cached = localStorage.getItem(CACHE_KEYS.POSTS);
        return cached ? JSON.parse(cached) : [];
    }
  },

  savePost: async (post: Post) => {
    const dbPost = { 
      title: post.title, slug: post.slug, summary: post.summary, content: post.content, 
      thumbnail: post.thumbnail, author: post.author, date: post.date, category: post.category, 
      status: post.status, is_featured: post.isFeatured, show_on_home: post.showOnHome, 
      tags: post.tags, attachments: post.attachments, block_ids: post.blockIds
    };
    if (post.id && post.id.length > 10) await supabase.from('posts').update(dbPost).eq('id', post.id);
    else await supabase.from('posts').insert(dbPost);
    localStorage.removeItem(CACHE_KEYS.POSTS);
  },

  deletePost: (id: string) => {
    localStorage.removeItem(CACHE_KEYS.POSTS);
    return supabase.from('posts').delete().eq('id', id);
  },

  // --- CÁN BỘ GIÁO VIÊN ---
  getStaff: async (): Promise<StaffMember[]> => {
    const { data } = await supabase.from('staff_members').select('*').order('order_index', { ascending: true });
    return (data || []).map((s: any) => ({ 
      id: s.id, fullName: s.full_name, position: s.position, 
      partyDate: s.party_date, email: s.email, avatarUrl: s.avatar_url, 
      order: s.order_index 
    }));
  },
  
  saveStaff: async (staff: StaffMember) => {
    const dbStaff = { full_name: staff.fullName, position: staff.position, party_date: staff.partyDate || null, email: staff.email, avatar_url: staff.avatar_url, order_index: staff.order };
    if (staff.id && staff.id.length > 10) await supabase.from('staff_members').update(dbStaff).eq('id', staff.id);
    else await supabase.from('staff_members').insert(dbStaff);
  },

  deleteStaff: (id: string) => supabase.from('staff_members').delete().eq('id', id),

  // --- VĂN BẢN & TÀI LIỆU ---
  getDocuments: async (): Promise<SchoolDocument[]> => {
    const { data } = await supabase.from('documents').select('*').order('created_at', { ascending: false });
    return (data || []).map((d: any) => ({ id: d.id, number: d.number, title: d.title, date: d.date, categoryId: d.category_id, downloadUrl: d.download_url }));
  },

  saveDocument: async (doc: SchoolDocument) => {
    const dbDoc = { number: doc.number, title: doc.title, date: doc.date, download_url: doc.downloadUrl, category_id: doc.categoryId };
    if (doc.id && doc.id.length > 10) await supabase.from('documents').update(dbDoc).eq('id', doc.id);
    else await supabase.from('documents').insert(dbDoc);
  },

  deleteDocument: (id: string) => supabase.from('documents').delete().eq('id', id),

  // --- THƯ VIỆN ẢNH ---
  getAlbums: async (): Promise<GalleryAlbum[]> => {
    const { data } = await supabase.from('gallery_albums').select('*').order('created_at', { ascending: false });
    return (data || []).map((a: any) => ({ id: a.id, title: a.title, description: a.description, thumbnail: a.thumbnail, createdDate: a.created_date }));
  },

  saveAlbum: async (album: GalleryAlbum) => {
    const dbAlbum = { title: album.title, description: album.description, thumbnail: album.thumbnail, created_date: album.createdDate };
    if (album.id && album.id.length > 10) await supabase.from('gallery_albums').update(dbAlbum).eq('id', album.id);
    else await supabase.from('gallery_albums').insert(dbAlbum);
  },

  deleteAlbum: (id: string) => supabase.from('gallery_albums').delete().eq('id', id),

  // --- CÁC MÔ-ĐUN KHÁC ---
  getBlocks: async (): Promise<DisplayBlock[]> => {
      const { data } = await supabase.from('display_blocks').select('*').order('order_index', { ascending: true });
      return (data || []).map((b: any) => ({
          id: b.id, name: b.name, position: b.position, type: b.type, order: b.order_index, itemCount: b.item_count, isVisible: b.is_visible, html_content: b.html_content, targetPage: b.target_page, customColor: b.custom_color || '#1e3a8a', customTextColor: b.custom_text_color || '#1e3a8a'
      }));
  },

  saveBlock: async (block: DisplayBlock) => {
      const dbBlock = { name: block.name, position: block.position, type: block.type, order_index: block.order, item_count: block.itemCount, is_visible: block.isVisible, html_content: block.htmlContent, target_page: block.targetPage, custom_color: block.customColor, custom_text_color: block.customTextColor };
      if (block.id && block.id.length > 10) await supabase.from('display_blocks').update(dbBlock).eq('id', block.id);
      else await supabase.from('display_blocks').insert(dbBlock);
  },

  deleteBlock: (id: string) => supabase.from('display_blocks').delete().eq('id', id),
  saveBlocksOrder: async (blocks: DisplayBlock[]) => {
      for (const b of blocks) await supabase.from('display_blocks').update({ order_index: b.order }).eq('id', b.id);
  },

  getMenu: async (): Promise<MenuItem[]> => {
      const { data } = await supabase.from('menu_items').select('*').order('order_index', { ascending: true });
      return (data || []).map((m: any) => ({ id: m.id, label: m.label, path: m.path, order: m.order_index }));
  },

  saveMenu: async (items: MenuItem[]) => {
      for (const m of items) {
          const dbMenu = { label: m.label, path: m.path, order_index: m.order };
          if (m.id && m.id.length > 10) await supabase.from('menu_items').update(dbMenu).eq('id', m.id);
          else await supabase.from('menu_items').insert(dbMenu);
      }
  },

  deleteMenu: (id: string) => supabase.from('menu_items').delete().eq('id', id),

  getPostCategories: async (): Promise<PostCategory[]> => {
     const { data } = await supabase.from('post_categories').select('*').order('order_index', { ascending: true });
     return (data || []).map((c: any) => ({ id: c.id, name: c.name, slug: c.slug, color: c.color, order: c.order_index }));
  },

  // Fix: Added missing savePostCategory method
  savePostCategory: async (cat: PostCategory) => {
    const dbCat = { name: cat.name, slug: cat.slug, color: cat.color, order_index: cat.order };
    if (cat.id && cat.id.length > 10) await supabase.from('post_categories').update(dbCat).eq('id', cat.id);
    else await supabase.from('post_categories').insert(dbCat);
  },

  // Fix: Added missing deletePostCategory method
  deletePostCategory: (id: string) => supabase.from('post_categories').delete().eq('id', id),

  getDocCategories: async (): Promise<DocumentCategory[]> => {
    const { data } = await supabase.from('document_categories').select('*').order('order_index', { ascending: true });
    return (data || []).map((c: any) => ({ id: c.id, name: c.name, slug: c.slug, description: c.description, order: c.order_index || 0 }));
  },

  // Fix: Added missing saveDocCategory method
  saveDocCategory: async (cat: DocumentCategory) => {
    const dbCat = { name: cat.name, slug: cat.slug, description: cat.description, order_index: cat.order };
    if (cat.id && cat.id.length > 10) await supabase.from('document_categories').update(dbCat).eq('id', cat.id);
    else await supabase.from('document_categories').insert(dbCat);
  },

  // Fix: Added missing deleteDocCategory method
  deleteDocCategory: (id: string) => supabase.from('document_categories').delete().eq('id', id),

  // Fix: Added missing saveDocCategoriesOrder method
  saveDocCategoriesOrder: async (categories: DocumentCategory[]) => {
    for (const cat of categories) {
      await supabase.from('document_categories').update({ order_index: cat.order }).eq('id', cat.id);
    }
  },

  getVideos: async (): Promise<Video[]> => {
    const { data } = await supabase.from('videos').select('*').order('order_index', { ascending: true });
    return (data || []).map((v: any) => ({ id: v.id, title: v.title, youtubeUrl: v.youtube_url, order: v.order_index }));
  },

  saveVideo: async (video: Video) => {
    const dbVideo = { title: video.title, youtube_url: video.youtubeUrl, order_index: video.order };
    if (video.id && video.id.length > 10) await supabase.from('videos').update(dbVideo).eq('id', video.id);
    else await supabase.from('videos').insert(dbVideo);
  },

  deleteVideo: (id: string) => supabase.from('videos').delete().eq('id', id),
  
  getIntroductions: async (): Promise<IntroductionArticle[]> => {
    const { data } = await supabase.from('school_introductions').select('*').order('order_index', { ascending: true });
    return (data || []).map((i: any) => ({ id: i.id, title: i.title, slug: i.slug, content: i.content, imageUrl: i.image_url, order: i.order_index, isVisible: i.is_visible }));
  },

  saveIntroduction: async (intro: IntroductionArticle) => {
    const dbIntro = { title: intro.title, slug: intro.slug, content: intro.content, image_url: intro.imageUrl, order_index: intro.order, is_visible: intro.isVisible };
    if (intro.id && intro.id.length > 10) await supabase.from('school_introductions').update(dbIntro).eq('id', intro.id);
    else await supabase.from('school_introductions').insert(dbIntro);
  },

  // Fix: Added missing deleteIntroduction method
  deleteIntroduction: (id: string) => supabase.from('school_introductions').delete().eq('id', id),

  getGallery: async (): Promise<GalleryImage[]> => {
     const { data } = await supabase.from('gallery_images').select('*').order('created_at', { ascending: false });
     return (data || []).map((i: any) => ({ id: i.id, url: i.url, caption: i.caption, albumId: i.album_id }));
  },

  saveImage: async (img: GalleryImage) => {
     await supabase.from('gallery_images').insert({ url: img.url, caption: img.caption, album_id: img.albumId });
  },

  deleteImage: (id: string) => supabase.from('gallery_images').delete().eq('id', id),

  getUsers: async (): Promise<User[]> => {
      const { data } = await supabase.from('user_profiles').select('*');
      return (data || []).map((u: any) => ({ id: u.id, username: u.username, fullName: u.full_name, role: u.role as UserRole, email: u.username + '@school.edu.vn' }));
  },

  // Fix: Added missing saveUser method
  saveUser: async (user: User) => {
    const dbUser = { username: user.username, full_name: user.fullName, role: user.role };
    if (user.id && user.id.length > 10) await supabase.from('user_profiles').update(dbUser).eq('id', user.id);
    else await supabase.from('user_profiles').insert(dbUser);
  },

  // Fix: Added missing deleteUser method
  deleteUser: (id: string) => supabase.from('user_profiles').delete().eq('id', id),
};
