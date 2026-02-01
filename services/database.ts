
import { supabase } from './supabaseClient';
import { Post, SchoolConfig, SchoolDocument, GalleryImage, GalleryAlbum, User, UserRole, MenuItem, DisplayBlock, DocumentCategory, StaffMember, IntroductionArticle, PostCategory, Video } from '../types';

/**
 * CACHE CONFIGURATION
 * Sử dụng LocalStorage để lưu trữ tạm thời các dữ liệu ít thay đổi.
 */
const CACHE_KEYS = {
  CONFIG: 'school_config_v1',
  MENU: 'menu_items_v1',
  POSTS_HOME: 'posts_home_v1',
  STAFF: 'staff_list_v1',
  DOC_CATS: 'doc_categories_v1'
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

// Helper để kiểm tra xem một ID có phải là UUID thật (từ DB) hay ID tạm thời (từ Client)
const isRealId = (id?: string) => {
    if (!id) return false;
    // UUID có độ dài 36 ký tự. ID tạm thời thường có dạng "prefix_timestamp"
    return id.length > 20 && !id.includes('_');
};

const setCache = (key: string, data: any) => {
  try {
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
  trackVisit: async () => {
    try {
      const sessionId = sessionStorage.getItem('visitor_session_id') || crypto.randomUUID();
      sessionStorage.setItem('visitor_session_id', sessionId);
      supabase.from('visitor_logs').upsert({ session_id: sessionId, last_active: new Date().toISOString() }, { onConflict: 'session_id' }).then();
      const today = new Date().toISOString().split('T')[0];
      const visitKey = 'site_visit_' + today;
      if (!localStorage.getItem(visitKey)) {
          supabase.rpc('increment_visit_counters').then(() => { localStorage.setItem(visitKey, 'true'); });
      }
    } catch (e) {}
  },

  getVisitorStats: async () => {
    try {
      const { data: counters } = await supabase.from('site_counters').select('*');
      const tenMinsAgo = new Date(Date.now() - 10 * 60 * 1000).toISOString();
      const { count: onlineCount } = await supabase.from('visitor_logs').select('*', { count: 'exact', head: true }).gt('last_active', tenMinsAgo);
      const statsMap: any = {};
      counters?.forEach(c => { statsMap[c.key] = parseInt(c.value); });
      return { total: statsMap['total_visits'] || 0, today: statsMap['today_visits'] || 0, month: statsMap['month_visits'] || 0, online: onlineCount || 1 };
    } catch (e) { return { total: 0, today: 0, month: 0, online: 1 }; }
  },

  getConfig: async (): Promise<SchoolConfig> => {
    const cached = getCache(CACHE_KEYS.CONFIG);
    const fetchPromise = supabase.from('school_config').select('*').limit(1).single()
      .then(({ data, error }) => {
        if (data && !error) {
          const config = {
             name: data.name, slogan: data.slogan, logoUrl: data.logo_url, faviconUrl: data.favicon_url,
             bannerUrl: data.banner_url, principalName: data.principal_name, address: data.address,
             phone: data.phone, email: data.email, hotline: data.hotline, mapUrl: data.map_url,
             facebook: data.facebook, youtube: data.youtube, zalo: data.zalo, website: data.website,
             showWelcomeBanner: data.show_welcome_banner, homeNewsCount: data.home_news_count,
             homeShowProgram: data.home_show_program, primaryColor: data.primary_color,
             titleColor: data.title_color, titleShadowColor: data.title_shadow_color,
             metaTitle: data.meta_title, metaDescription: data.meta_description,
             footerLinks: data.footer_links || DEFAULT_CONFIG.footerLinks
          } as SchoolConfig;
          setCache(CACHE_KEYS.CONFIG, config);
          return config;
        }
        return cached || DEFAULT_CONFIG;
      });
    return cached || fetchPromise;
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

  getPosts: async (limitCount: number = 20): Promise<Post[]> => {
    const cached = getCache(CACHE_KEYS.POSTS_HOME);
    const fetchPromise = supabase.from('posts').select('id, title, slug, summary, thumbnail, created_at, category, date, views, status, is_featured, show_on_home').eq('status', 'published').order('created_at', { ascending: false }).limit(limitCount)
      .then(({ data, error }) => {
          if (error) throw error;
          const posts = (data || []).map((p: any) => ({ ...p, tags: [], attachments: [], blockIds: [] })) as Post[];
          setCache(CACHE_KEYS.POSTS_HOME, posts);
          return posts;
      });
    return cached || fetchPromise;
  },

  savePost: async (post: Post) => {
    const dbPost = { title: post.title, slug: post.slug, summary: post.summary, content: post.content, thumbnail: post.thumbnail, author: post.author, date: post.date, category: post.category, status: post.status, is_featured: post.isFeatured, show_on_home: post.showOnHome, tags: post.tags, attachments: post.attachments, block_ids: post.blockIds };
    if (isRealId(post.id)) await supabase.from('posts').update(dbPost).eq('id', post.id);
    else await supabase.from('posts').insert(dbPost);
    localStorage.removeItem(CACHE_KEYS.POSTS_HOME);
  },

  deletePost: (id: string) => {
    localStorage.removeItem(CACHE_KEYS.POSTS_HOME);
    return supabase.from('posts').delete().eq('id', id);
  },

  getStaff: async (): Promise<StaffMember[]> => {
    const cached = getCache(CACHE_KEYS.STAFF);
    const fetchPromise = supabase.from('staff_members').select('*').order('order_index', { ascending: true })
      .then(({ data }) => {
        const staff = (data || []).map((s: any) => ({ id: s.id, fullName: s.full_name, position: s.position, partyDate: s.party_date, email: s.email, avatarUrl: s.avatar_url, order: s.order_index }));
        setCache(CACHE_KEYS.STAFF, staff);
        return staff;
      });
    return cached || fetchPromise;
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
    const { data } = await supabase.from('documents').select('id, number, title, date, category_id, download_url').order('created_at', { ascending: false });
    return (data || []).map((d: any) => ({ id: d.id, number: d.number, title: d.title, date: d.date, categoryId: d.category_id, downloadUrl: d.download_url }));
  },

  saveDocument: async (doc: SchoolDocument) => {
    const dbDoc = { number: doc.number, title: doc.title, date: doc.date, download_url: doc.downloadUrl, category_id: doc.categoryId };
    if (isRealId(doc.id)) await supabase.from('documents').update(dbDoc).eq('id', doc.id);
    else await supabase.from('documents').insert(dbDoc);
  },

  // Fix: Add missing deleteDocument method
  deleteDocument: (id: string) => supabase.from('documents').delete().eq('id', id),

  getAlbums: async (): Promise<GalleryAlbum[]> => {
    const { data } = await supabase.from('gallery_albums').select('id, title, description, thumbnail, created_date').order('created_at', { ascending: false });
    return (data || []).map((a: any) => ({ id: a.id, title: a.title, description: a.description, thumbnail: a.thumbnail, createdDate: a.created_date }));
  },

  saveAlbum: async (album: GalleryAlbum) => {
    const dbAlbum = { title: album.title, description: album.description, thumbnail: album.thumbnail, created_date: album.createdDate };
    if (isRealId(album.id)) await supabase.from('gallery_albums').update(dbAlbum).eq('id', album.id);
    else await supabase.from('gallery_albums').insert(dbAlbum);
  },

  // Fix: Add missing deleteAlbum method
  deleteAlbum: (id: string) => supabase.from('gallery_albums').delete().eq('id', id),

  getBlocks: async (): Promise<DisplayBlock[]> => {
      const { data } = await supabase.from('display_blocks').select('*').order('order_index', { ascending: true });
      return (data || []).map((b: any) => ({
          id: b.id, name: b.name, position: b.position, type: b.type, order: b.order_index, itemCount: b.item_count, isVisible: b.is_visible, htmlContent: b.html_content, targetPage: b.target_page, customColor: b.custom_color || '#1e3a8a', customTextColor: b.custom_text_color || '#1e3a8a'
      }));
  },

  saveBlock: async (block: DisplayBlock) => {
      const dbBlock = { name: block.name, position: block.position, type: block.type, order_index: block.order, item_count: block.itemCount, is_visible: block.isVisible, html_content: block.htmlContent, target_page: block.targetPage, custom_color: block.customColor, custom_text_color: block.customTextColor };
      if (isRealId(block.id)) await supabase.from('display_blocks').update(dbBlock).eq('id', block.id);
      else await supabase.from('display_blocks').insert(dbBlock);
  },

  // Fix: Add missing deleteBlock method
  deleteBlock: (id: string) => supabase.from('display_blocks').delete().eq('id', id),

  saveBlocksOrder: async (blocks: DisplayBlock[]) => {
      for (const b of blocks) await supabase.from('display_blocks').update({ order_index: b.order }).eq('id', b.id);
  },

  getMenu: async (): Promise<MenuItem[]> => {
      const cached = getCache(CACHE_KEYS.MENU);
      const fetchPromise = supabase.from('menu_items').select('*').order('order_index', { ascending: true })
        .then(({ data }) => {
          const menu = (data || []).map((m: any) => ({ id: m.id, label: m.label, path: m.path, order: m.order_index }));
          setCache(CACHE_KEYS.MENU, menu);
          return menu;
        });
      return cached || fetchPromise;
  },

  saveMenu: async (items: MenuItem[]) => {
      for (const m of items) {
          const dbMenu = { label: m.label, path: m.path, order_index: m.order };
          // Kiểm tra nếu ID là ID thật từ Database (UUID 36 ký tự)
          if (isRealId(m.id)) {
              await supabase.from('menu_items').update(dbMenu).eq('id', m.id);
          } else {
              // Nếu là ID tạm thời (menu_...), bỏ qua ID để DB tự tạo UUID mới
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
     const { data } = await supabase.from('post_categories').select('*').order('order_index', { ascending: true });
     return (data || []).map((c: any) => ({ id: c.id, name: c.name, slug: c.slug, color: c.color, order: c.order_index }));
  },

  savePostCategory: async (cat: PostCategory) => {
    const dbCat = { name: cat.name, slug: cat.slug, color: cat.color, order_index: cat.order };
    if (isRealId(cat.id)) await supabase.from('post_categories').update(dbCat).eq('id', cat.id);
    else await supabase.from('post_categories').insert(dbCat);
  },

  // Fix: Add missing deletePostCategory method
  deletePostCategory: (id: string) => supabase.from('post_categories').delete().eq('id', id),

  getDocCategories: async (): Promise<DocumentCategory[]> => {
    const { data } = await supabase.from('document_categories').select('*').order('order_index', { ascending: true });
    return (data || []).map((c: any) => ({ id: c.id, name: c.name, slug: c.slug, description: c.description, order: c.order_index || 0 }));
  },

  saveDocCategory: async (cat: DocumentCategory) => {
    const dbCat = { name: cat.name, slug: cat.slug, description: cat.description, order_index: cat.order };
    if (isRealId(cat.id)) await supabase.from('document_categories').update(dbCat).eq('id', cat.id);
    else await supabase.from('document_categories').insert(dbCat);
  },

  // Fix: Add missing deleteDocCategory method
  deleteDocCategory: (id: string) => supabase.from('document_categories').delete().eq('id', id),

  // Fix: Add missing saveDocCategoriesOrder method
  saveDocCategoriesOrder: async (categories: DocumentCategory[]) => {
      for (const c of categories) await supabase.from('document_categories').update({ order_index: c.order }).eq('id', c.id);
  },

  getVideos: async (): Promise<Video[]> => {
    const { data } = await supabase.from('videos').select('*').order('order_index', { ascending: true });
    return (data || []).map((v: any) => ({ id: v.id, title: v.title, youtubeUrl: v.youtube_url, order: v.order_index }));
  },

  saveVideo: async (video: Video) => {
    const dbVideo = { title: video.title, youtube_url: video.youtubeUrl, order_index: video.order };
    if (isRealId(video.id)) await supabase.from('videos').update(dbVideo).eq('id', video.id);
    else await supabase.from('videos').insert(dbVideo);
  },

  // Fix: Add missing deleteVideo method
  deleteVideo: (id: string) => supabase.from('videos').delete().eq('id', id),

  getIntroductions: async (): Promise<IntroductionArticle[]> => {
    const { data } = await supabase.from('school_introductions').select('*').order('order_index', { ascending: true });
    return (data || []).map((i: any) => ({ id: i.id, title: i.title, slug: i.slug, content: i.content, imageUrl: i.image_url, order: i.order_index, isVisible: i.is_visible }));
  },

  saveIntroduction: async (intro: IntroductionArticle) => {
    const dbIntro = { title: intro.title, slug: intro.slug, content: intro.content, image_url: intro.imageUrl, order_index: intro.order, is_visible: intro.isVisible };
    if (isRealId(intro.id)) await supabase.from('school_introductions').update(dbIntro).eq('id', intro.id);
    else await supabase.from('school_introductions').insert(dbIntro);
  },

  // Fix: Add missing deleteIntroduction method
  deleteIntroduction: (id: string) => supabase.from('school_introductions').delete().eq('id', id),

  getGallery: async (): Promise<GalleryImage[]> => {
     const { data } = await supabase.from('gallery_images').select('id, url, caption, album_id').order('created_at', { ascending: false });
     return (data || []).map((i: any) => ({ id: i.id, url: i.url, caption: i.caption, albumId: i.album_id }));
  },

  // Fix: Add missing saveImage method
  saveImage: async (image: GalleryImage) => {
    const dbImage = { url: image.url, caption: image.caption, album_id: image.albumId };
    if (isRealId(image.id)) await supabase.from('gallery_images').update(dbImage).eq('id', image.id);
    else await supabase.from('gallery_images').insert(dbImage);
  },

  // Fix: Add missing deleteImage method
  deleteImage: (id: string) => supabase.from('gallery_images').delete().eq('id', id),

  // Fix: Add missing getUsers method
  getUsers: async (): Promise<User[]> => {
    const { data } = await supabase.from('user_profiles').select('*');
    return (data || []).map((u: any) => ({
      id: u.id,
      username: u.username,
      fullName: u.full_name,
      role: u.role as UserRole,
      email: u.username + '@school.edu.vn'
    }));
  },

  saveUser: async (user: User) => {
    const dbUser = { username: user.username, full_name: user.fullName, role: user.role };
    if (isRealId(user.id)) await supabase.from('user_profiles').update(dbUser).eq('id', user.id);
    else await supabase.from('user_profiles').insert(dbUser);
  },

  deleteUser: (id: string) => supabase.from('user_profiles').delete().eq('id', id),
};
