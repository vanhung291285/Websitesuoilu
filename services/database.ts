import { supabase } from './supabaseClient';
import { Post, SchoolConfig, SchoolDocument, GalleryImage, GalleryAlbum, User, UserRole, MenuItem, DisplayBlock, DocumentCategory, StaffMember, IntroductionArticle, PostCategory, Video } from '../types';

/**
 * CACHE CONFIGURATION
 */
const CACHE_KEYS = {
  CONFIG: 'school_config_v5',
  MENU: 'menu_items_v5',
  POSTS_HOME: 'posts_home_v5',
  STAFF: 'staff_list_v5',
  DOC_CATS: 'doc_categories_v5'
};

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
  metaDescription: 'Website chính thức của Trường PTDTBT TH và THCS Suối Lư',
  footerLinks: [
    { id: '1', label: 'Bộ Giáo dục & Đào tạo', url: 'https://moet.gov.vn' },
    { id: '2', label: 'Sở GD tỉnh Điện Biên', url: '#' },
    { id: '3', label: 'Phòng GD Điện Biên Đông', url: '#' }
  ]
};

// Helper: Chờ đợi (để retry)
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * fetchWithRetry: Thực hiện fetch với cơ chế retry thông minh
 * Xử lý đặc biệt cho lỗi 'statement timeout' của Postgres
 */
async function fetchWithRetry<T>(fetchFn: () => Promise<{data: T | null, error: any}>, retries = 3, delay = 1500): Promise<T | null> {
    for (let i = 0; i < retries; i++) {
        try {
            const { data, error } = await fetchFn();
            
            if (error) {
                const errorMsg = error.message?.toLowerCase() || '';
                // Nếu là lỗi timeout từ server Postgres hoặc lỗi mạng
                if (errorMsg.includes('timeout') || errorMsg.includes('cancel') || error.code === 'PGRST116' || !window.navigator.onLine) {
                    console.warn(`[Supabase] Lần thử ${i + 1} thất bại (${errorMsg}), đang thử lại sau ${delay * (i + 1)}ms...`);
                    await sleep(delay * (i + 1));
                    continue;
                }
                throw error; // Các lỗi RLS hoặc lỗi logic thì báo ngay
            }
            return data;
        } catch (e: any) {
            if (i === retries - 1) {
                console.error("[Supabase] Đã thử lại nhiều lần nhưng vẫn lỗi:", e);
                throw e;
            }
            await sleep(delay * (i + 1));
        }
    }
    return null;
}

const isRealId = (id?: string) => {
    if (!id) return false;
    return id.length > 20 && !id.includes('_');
};

const setCache = (key: string, data: any) => {
  try {
    if (Array.isArray(data) && data.length === 0) {
        const existing = localStorage.getItem(key);
        if (existing) return; 
    }
    localStorage.setItem(key, JSON.stringify({ data, timestamp: Date.now() }));
  } catch (e) {}
};

const getCache = (key: string) => {
  try {
    const cached = localStorage.getItem(key);
    if (!cached) return null;
    return JSON.parse(cached).data;
  } catch (e) { return null; }
};

export const DatabaseService = {
  CACHE_KEYS,

  trackVisit: async () => {
    try {
      let sessionId = sessionStorage.getItem('visitor_session_id');
      if (!sessionId) {
        sessionId = crypto.randomUUID();
        sessionStorage.setItem('visitor_session_id', sessionId);
      }
      await supabase.from('visitor_logs').upsert({ 
        session_id: sessionId, 
        last_active: new Date().toISOString() 
      }, { onConflict: 'session_id' });

      const today = new Date().toISOString().split('T')[0];
      const visitKey = 'site_visit_counted_' + today;
      if (!localStorage.getItem(visitKey)) {
          const { error } = await supabase.rpc('increment_visit_counters');
          if (!error) localStorage.setItem(visitKey, 'true');
      }
    } catch (e) {}
  },

  getVisitorStats: async () => {
    try {
      const { data: counters } = await supabase.from('site_counters').select('*');
      const fiveMinsAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
      const { count: onlineCount } = await supabase.from('visitor_logs').select('*', { count: 'exact', head: true }).gt('last_active', fiveMinsAgo);

      const stats = { total: 0, today: 0, month: 0, online: 1 };
      if (counters) {
        counters.forEach((c: any) => { 
           if (c.key === 'total_visits') stats.total = Number(c.value);
           if (c.key === 'today_visits') stats.today = Number(c.value);
           if (c.key === 'month_visits') stats.month = Number(c.value);
        });
      }
      stats.online = Math.max(1, onlineCount || 1);
      return stats;
    } catch (e) { return { total: 0, today: 0, month: 0, online: 1 }; }
  },

  getConfig: async (): Promise<SchoolConfig> => {
    const cached = getCache(CACHE_KEYS.CONFIG);
    try {
      const data = await fetchWithRetry<any>(() => supabase.from('school_config').select('*').limit(1).single());
      if (data) {
        const config: SchoolConfig = {
            name: data.name, slogan: data.slogan, logoUrl: data.logo_url, faviconUrl: data.favicon_url,
            bannerUrl: data.banner_url, principalName: data.principal_name, address: data.address,
            phone: data.phone, email: data.email, hotline: data.hotline, mapUrl: data.map_url,
            facebook: data.facebook, youtube: data.youtube, zalo: data.zalo, website: data.website,
            showWelcomeBanner: data.show_welcome_banner, homeNewsCount: data.home_news_count,
            homeShowProgram: data.home_show_program, primaryColor: data.primary_color,
            titleColor: data.title_color, titleShadowColor: data.title_shadow_color,
            metaTitle: data.meta_title, metaDescription: data.meta_description,
            footerLinks: data.footer_links || DEFAULT_CONFIG.footerLinks
        };
        setCache(CACHE_KEYS.CONFIG, config);
        return config;
      }
    } catch (e) {
        console.error("Lỗi getConfig:", e);
    }
    return cached || DEFAULT_CONFIG;
  },

  saveConfig: async (config: SchoolConfig) => {
    const dbConfig = {
       name: config.name, slogan: config.slogan, logo_url: config.logoUrl, favicon_url: config.faviconUrl,
       banner_url: config.bannerUrl, principal_name: config.principalName, address: config.address,
       phone: config.phone, email: config.email, hotline: config.hotline, map_url: config.mapUrl,
       facebook: config.facebook, youtube: config.youtube, zalo: config.zalo, website: config.website,
       show_welcome_banner: config.showWelcomeBanner, home_news_count: config.homeNewsCount,
       home_show_program: config.homeShowProgram, primary_color: config.primaryColor,
       title_color: config.titleColor, title_shadow_color: config.titleShadowColor,
       meta_title: config.metaTitle, meta_description: config.metaDescription,
       footer_links: config.footerLinks
    };
    const { data: currentData } = await supabase.from('school_config').select('id').limit(1);
    if (currentData && currentData.length > 0) {
       await supabase.from('school_config').update(dbConfig).eq('id', currentData[0].id);
    } else {
       await supabase.from('school_config').insert(dbConfig);
    }
    setCache(CACHE_KEYS.CONFIG, config);
  },

  /**
   * getPosts: Chỉ lấy các cột metadata nhẹ, giới hạn 20 bài để tránh lỗi Statement Timeout.
   */
  getPosts: async (limitCount: number = 20): Promise<Post[]> => {
    const cachedPosts = getCache(CACHE_KEYS.POSTS_HOME);
    try {
      // TUYỆT ĐỐI KHÔNG LẤY CỘT 'content' TRONG DANH SÁCH
      const data = await fetchWithRetry<any[]>(() => supabase.from('posts')
        .select('id, title, slug, summary, thumbnail, author, date, category, views, status, is_featured, show_on_home, tags, attachments, block_ids, created_at')
        .order('created_at', { ascending: false })
        .limit(limitCount));
      
      if (data) {
          if (data.length === 0 && cachedPosts && cachedPosts.length > 0) return cachedPosts;

          const posts = data.map((p: any) => ({ 
            ...p, 
            imageCaption: p.image_caption || '',
            blockIds: p.block_ids || [],
            tags: p.tags || [], 
            attachments: p.attachments || [],
            isFeatured: !!(p.is_featured ?? false),
            showOnHome: !!(p.show_on_home ?? true),
            views: p.views || 0,
            date: p.date || new Date(p.created_at || Date.now()).toISOString().split('T')[0]
          })) as Post[];
          
          if (posts.length > 0) setCache(CACHE_KEYS.POSTS_HOME, posts);
          return posts;
      }
    } catch (e) {
      console.error("Lỗi đồng bộ bài viết:", e);
    }
    return cachedPosts || [];
  },

  getPostBySlug: async (slug: string): Promise<Post | null> => {
    try {
      const data = await fetchWithRetry<any>(() => supabase.from('posts').select('*').eq('slug', slug).single());
      if (!data) return null;
      return {
        ...data,
        imageCaption: data.image_caption,
        blockIds: data.block_ids || [],
        tags: data.tags || [],
        attachments: data.attachments || [],
        isFeatured: !!data.is_featured,
        showOnHome: !!data.show_on_home
      } as Post;
    } catch (e) { return null; }
  },

  getPostById: async (id: string): Promise<Post | null> => {
    try {
      const data = await fetchWithRetry<any>(() => supabase.from('posts').select('*').eq('id', id).single());
      if (!data) return null;
      return {
        ...data,
        imageCaption: data.image_caption,
        blockIds: data.block_ids || [],
        tags: data.tags || [],
        attachments: data.attachments || [],
        isFeatured: !!data.is_featured,
        showOnHome: !!data.show_on_home
      } as Post;
    } catch (e) { return null; }
  },

  savePost: async (post: Post) => {
    const dbPost = { 
        title: post.title, 
        slug: post.slug, 
        summary: post.summary, 
        content: post.content, 
        thumbnail: post.thumbnail, 
        image_caption: post.imageCaption, 
        author: post.author, 
        date: post.date, 
        category: post.category, 
        status: post.status, 
        is_featured: post.isFeatured,
        show_on_home: post.showOnHome,
        tags: post.tags, 
        attachments: post.attachments, 
        block_ids: post.blockIds 
    };
    if (isRealId(post.id)) await supabase.from('posts').update(dbPost).eq('id', post.id);
    else await supabase.from('posts').insert(dbPost);
    localStorage.removeItem(CACHE_KEYS.POSTS_HOME);
  },

  deletePost: (id: string) => {
    localStorage.removeItem(CACHE_KEYS.POSTS_HOME);
    return supabase.from('posts').delete().eq('id', id);
  },

  getStaff: async (): Promise<StaffMember[]> => {
    try {
        const data = await fetchWithRetry<any[]>(() => supabase.from('staff_members').select('*').order('order_index', { ascending: true }));
        const staff = (data || []).map((s: any) => ({ id: s.id, fullName: s.full_name, position: s.position, partyDate: s.party_date, email: s.email, avatarUrl: s.avatar_url, order: s.order_index }));
        if (staff.length > 0) setCache(CACHE_KEYS.STAFF, staff);
        return staff;
    } catch(e) {
        return getCache(CACHE_KEYS.STAFF) || [];
    }
  },
  
  saveStaff: async (staff: StaffMember) => {
    const dbStaff = { full_name: staff.fullName, position: staff.position, party_date: staff.partyDate || null, email: staff.email, avatar_url: staff.avatarUrl, order_index: staff.order };
    if (isRealId(staff.id)) await supabase.from('staff_members').update(dbStaff).eq('id', staff.id);
    else await supabase.from('staff_members').insert(dbStaff);
    localStorage.removeItem(CACHE_KEYS.STAFF);
  },

  deleteStaff: (id: string) => {
    localStorage.removeItem(CACHE_KEYS.STAFF);
    return supabase.from('staff_members').delete().eq('id', id);
  },

  getDocuments: async (): Promise<SchoolDocument[]> => {
    try {
      const data = await fetchWithRetry<any[]>(() => supabase.from('documents').select('*').order('created_at', { ascending: false }));
      return (data || []).map((d: any) => ({ id: d.id, number: d.number, title: d.title, date: d.date, categoryId: d.category_id, downloadUrl: d.download_url }));
    } catch(e) { return []; }
  },

  saveDocument: async (doc: SchoolDocument) => {
    const dbDoc = { number: doc.number, title: doc.title, date: doc.date, download_url: doc.downloadUrl, category_id: doc.categoryId };
    if (isRealId(doc.id)) await supabase.from('documents').update(dbDoc).eq('id', doc.id);
    else await supabase.from('documents').insert(dbDoc);
  },

  deleteDocument: (id: string) => supabase.from('documents').delete().eq('id', id),

  getAlbums: async (): Promise<GalleryAlbum[]> => {
    try {
      const data = await fetchWithRetry<any[]>(() => supabase.from('gallery_albums').select('*').order('created_at', { ascending: false }));
      return (data || []).map((a: any) => ({ id: a.id, title: a.title, description: a.description, thumbnail: a.thumbnail, createdDate: a.created_date }));
    } catch(e) { return []; }
  },

  saveAlbum: async (album: GalleryAlbum) => {
    const dbAlbum = { title: album.title, description: album.description, thumbnail: album.thumbnail, created_date: album.createdDate };
    if (isRealId(album.id)) await supabase.from('gallery_albums').update(dbAlbum).eq('id', album.id);
    else await supabase.from('gallery_albums').insert(dbAlbum);
  },

  deleteAlbum: (id: string) => supabase.from('gallery_albums').delete().eq('id', id),

  getBlocks: async (): Promise<DisplayBlock[]> => {
      try {
        const data = await fetchWithRetry<any[]>(() => supabase.from('display_blocks').select('*').order('order_index', { ascending: true }));
        return (data || []).map((b: any) => ({
            id: b.id, name: b.name, position: b.position, type: b.type, order: b.order_index, itemCount: b.item_count, isVisible: b.is_visible, htmlContent: b.html_content, targetPage: b.target_page, customColor: b.custom_color || '#1e3a8a', customTextColor: b.custom_text_color || '#1e3a8a'
        }));
      } catch(e) { return []; }
  },

  saveBlock: async (block: DisplayBlock) => {
      const dbBlock = { name: block.name, position: block.position, type: block.type, order_index: block.order, item_count: block.itemCount, is_visible: block.isVisible, html_content: block.htmlContent, target_page: block.targetPage, custom_color: block.customColor, custom_text_color: block.customTextColor };
      if (isRealId(block.id)) await supabase.from('display_blocks').update(dbBlock).eq('id', block.id);
      else await supabase.from('display_blocks').insert(dbBlock);
  },

  deleteBlock: (id: string) => supabase.from('display_blocks').delete().eq('id', id),

  saveBlocksOrder: async (blocks: DisplayBlock[]) => {
      for (const b of blocks) await supabase.from('display_blocks').update({ order_index: b.order }).eq('id', b.id);
  },

  getMenu: async (): Promise<MenuItem[]> => {
      try {
          const data = await fetchWithRetry<any[]>(() => supabase.from('menu_items').select('*').order('order_index', { ascending: true }));
          const menu = (data || []).map((m: any) => ({ id: m.id, label: m.label, path: m.path, order: m.order_index }));
          if (menu.length > 0) setCache(CACHE_KEYS.MENU, menu);
          return menu;
      } catch(e) {
          return getCache(CACHE_KEYS.MENU) || [];
      }
  },

  saveMenu: async (items: MenuItem[]) => {
      for (const m of items) {
          const dbMenu = { label: m.label, path: m.path, order_index: m.order };
          if (isRealId(m.id)) {
              await supabase.from('menu_items').update(dbMenu).eq('id', m.id);
          } else {
              await supabase.from('menu_items').insert(dbMenu);
          }
      }
      localStorage.removeItem(CACHE_KEYS.MENU);
  },

  deleteMenu: (id: string) => {
    localStorage.removeItem(CACHE_KEYS.MENU);
    return supabase.from('menu_items').delete().eq('id', id);
  },

  getPostCategories: async (): Promise<PostCategory[]> => {
     try {
       const data = await fetchWithRetry<any[]>(() => supabase.from('post_categories').select('*').order('order_index', { ascending: true }));
       return (data || []).map((c: any) => ({ id: c.id, name: c.name, slug: c.slug, color: c.color, order: c.order_index }));
     } catch(e) { return []; }
  },

  savePostCategory: async (cat: PostCategory) => {
    const dbCat = { name: cat.name, slug: cat.slug, color: cat.color, order_index: cat.order };
    if (isRealId(cat.id)) await supabase.from('post_categories').update(dbCat).eq('id', cat.id);
    else await supabase.from('post_categories').insert(dbCat);
  },

  deletePostCategory: (id: string) => supabase.from('post_categories').delete().eq('id', id),

  getDocCategories: async (): Promise<DocumentCategory[]> => {
    try {
      const data = await fetchWithRetry<any[]>(() => supabase.from('document_categories').select('*').order('order_index', { ascending: true }));
      return (data || []).map((c: any) => ({ id: c.id, name: c.name, slug: c.slug, description: c.description, order: c.order_index || 0 }));
    } catch(e) { return []; }
  },

  saveDocCategory: async (cat: DocumentCategory) => {
    const dbCat = { name: cat.name, slug: cat.slug, description: cat.description, order_index: cat.order };
    if (isRealId(cat.id)) await supabase.from('document_categories').update(dbCat).eq('id', cat.id);
    else await supabase.from('document_categories').insert(dbCat);
  },

  saveDocCategoriesOrder: async (categories: DocumentCategory[]) => {
    for (const cat of categories) {
      await supabase.from('document_categories').update({ order_index: cat.order }).eq('id', cat.id);
    }
  },

  deleteDocCategory: (id: string) => supabase.from('document_categories').delete().eq('id', id),

  getVideos: async (): Promise<Video[]> => {
    try {
      const data = await fetchWithRetry<any[]>(() => supabase.from('videos').select('*').order('order_index', { ascending: true }));
      return (data || []).map((v: any) => ({ id: v.id, title: v.title, youtubeUrl: v.youtube_url, order: v.order_index }));
    } catch(e) { return []; }
  },

  saveVideo: async (video: Video) => {
    const dbVideo = { title: video.title, youtube_url: video.youtubeUrl, order_index: video.order };
    if (isRealId(video.id)) await supabase.from('videos').update(dbVideo).eq('id', video.id);
    else await supabase.from('videos').insert(dbVideo);
  },

  deleteVideo: (id: string) => supabase.from('videos').delete().eq('id', id),

  getIntroductions: async (): Promise<IntroductionArticle[]> => {
    try {
      const data = await fetchWithRetry<any[]>(() => supabase.from('school_introductions').select('*').order('order_index', { ascending: true }));
      return (data || []).map((i: any) => ({ id: i.id, title: i.title, slug: i.slug, content: i.content, imageUrl: i.image_url, order: i.order_index, isVisible: i.is_visible }));
    } catch(e) { return []; }
  },

  saveIntroduction: async (intro: IntroductionArticle) => {
    const dbIntro = { title: intro.title, slug: intro.slug, content: intro.content, image_url: intro.imageUrl, order_index: intro.order, is_visible: intro.isVisible };
    if (isRealId(intro.id)) await supabase.from('school_introductions').update(dbIntro).eq('id', intro.id);
    else await supabase.from('school_introductions').insert(dbIntro);
  },

  deleteIntroduction: (id: string) => supabase.from('school_introductions').delete().eq('id', id),

  getGallery: async (): Promise<GalleryImage[]> => {
     try {
       const data = await fetchWithRetry<any[]>(() => supabase.from('gallery_images').select('*').order('created_at', { ascending: false }));
       return (data || []).map((i: any) => ({ id: i.id, url: i.url, caption: i.caption, albumId: i.album_id }));
     } catch(e) { return []; }
  },

  saveImage: async (image: GalleryImage) => {
    const dbImage = { url: image.url, caption: image.caption, album_id: image.albumId };
    if (isRealId(image.id)) await supabase.from('gallery_images').update(dbImage).eq('id', image.id);
    else await supabase.from('gallery_images').insert(dbImage);
  },

  deleteImage: (id: string) => supabase.from('gallery_images').delete().eq('id', id),

  getUsers: async (): Promise<User[]> => {
    try {
      const data = await fetchWithRetry<any[]>(() => supabase.from('user_profiles').select('*'));
      return (data || []).map((u: any) => ({ id: u.id, username: u.username, fullName: u.full_name, role: u.role as UserRole, email: u.username + '@school.edu.vn' }));
    } catch(e) { return []; }
  },

  saveUser: async (user: User) => {
    const dbUser = { username: user.username, full_name: user.fullName, role: user.role };
    if (isRealId(user.id)) await supabase.from('user_profiles').update(dbUser).eq('id', user.id);
    else await supabase.from('user_profiles').insert(dbUser);
  },

  deleteUser: async (id: string) => await supabase.from('user_profiles').delete().eq('id', id),
};
