import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { Sidebar } from './components/Sidebar'; 
import { AdminLayout } from './components/AdminLayout';
import { Home } from './pages/Home';
import { Introduction } from './pages/Introduction';
import { Documents } from './pages/Documents';
import { Gallery } from './pages/Gallery';
import { Staff } from './pages/Staff'; 
import { Login } from './pages/Login'; 
import { FloatingContact } from './components/FloatingContact';
import { NewsTicker } from './components/NewsTicker'; 
import { ManageNews } from './pages/admin/ManageNews';
import { ManageDocuments } from './pages/admin/ManageDocuments';
import { ManageGallery } from './pages/admin/ManageGallery';
import { ManageVideos } from './pages/admin/ManageVideos';
import { ManageUsers } from './pages/admin/ManageUsers';
import { ManageMenu } from './pages/admin/ManageMenu';
import { ManageSettings } from './pages/admin/ManageSettings';
import { ManageBlocks } from './pages/admin/ManageBlocks';
import { ManageStaff } from './pages/admin/ManageStaff';
import { ManageIntro } from './pages/admin/ManageIntro';
import { ManagePostCategories } from './pages/admin/ManagePostCategories'; 
import { Dashboard } from './pages/admin/Dashboard';
import { DatabaseService } from './services/database'; 
import { supabase } from './services/supabaseClient';
import { PageRoute, Post, SchoolConfig, SchoolDocument, GalleryImage, GalleryAlbum, User, UserRole, DisplayBlock, MenuItem, DocumentCategory, StaffMember, IntroductionArticle, PostCategory, Video } from './types';
import { Loader2, Share2, Facebook, Printer, Link as LinkIcon, RefreshCcw } from 'lucide-react';

const FALLBACK_CONFIG: SchoolConfig = {
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
  metaDescription: 'Cổng thông tin điện tử Trường PTDTBT TH và THCS Suối Lư'
};

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<PageRoute>('home');
  const [detailId, setDetailId] = useState<string | undefined>(undefined);
  const [fullPost, setFullPost] = useState<Post | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  
  // Nạp dữ liệu ban đầu từ LocalStorage nếu có (Cơ chế Hydration)
  const [posts, setPosts] = useState<Post[]>(() => {
    try {
      const cached = localStorage.getItem('posts_home_v5');
      return cached ? JSON.parse(cached).data : [];
    } catch (e) { return []; }
  });

  const [postCategories, setPostCategories] = useState<PostCategory[]>([]);
  const [introductions, setIntroductions] = useState<IntroductionArticle[]>([]); 
  const [documents, setDocuments] = useState<SchoolDocument[]>([]);
  const [docCategories, setDocCategories] = useState<DocumentCategory[]>([]);
  const [galleryImages, setGalleryImages] = useState<GalleryImage[]>([]);
  const [albums, setAlbums] = useState<GalleryAlbum[]>([]);
  const [videos, setVideos] = useState<Video[]>([]);
  const [blocks, setBlocks] = useState<DisplayBlock[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [staffList, setStaffList] = useState<StaffMember[]>([]);
  
  const [config, setConfig] = useState<SchoolConfig | null>(() => {
    try {
      const cached = localStorage.getItem('school_config_v5');
      return cached ? JSON.parse(cached).data : null;
    } catch (e) { return null; }
  });

  const [loading, setLoading] = useState(true);
  const [dataError, setDataError] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  const safePushState = (url: string) => {
    try {
      window.history.pushState({}, '', url);
    } catch (e) {
      console.warn("Routing blocked by environment.", e);
    }
  };

  useEffect(() => {
    // Chỉ hiện Loader nếu chưa có cả bài viết lẫn cấu hình trong cache
    const shouldShowLoader = posts.length === 0 && !config;
    refreshData(shouldShowLoader);
    
    DatabaseService.trackVisit();
    const heartbeat = setInterval(() => {
      DatabaseService.trackVisit();
    }, 60000);

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
         setCurrentUser({
            id: session.user.id,
            email: session.user.email || '',
            fullName: 'Admin User',
            username: session.user.email?.split('@')[0] || 'admin',
            role: UserRole.ADMIN
         });
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
       if (session) {
         setCurrentUser({
            id: session.user.id,
            email: session.user.email || '',
            fullName: 'Admin User',
            username: session.user.email?.split('@')[0] || 'admin',
            role: UserRole.ADMIN
         });
       } else {
         setCurrentUser(null);
       }
    });

    handleUrlRouting();
    window.addEventListener('popstate', handleUrlRouting);
    
    return () => {
      clearInterval(heartbeat);
      subscription.unsubscribe();
      window.removeEventListener('popstate', handleUrlRouting);
    };
  }, []);

  // Effect fetch full post content when entering detail page
  useEffect(() => {
    if (currentPage === 'news-detail' && detailId) {
       const postInList = posts.find(p => p.id === detailId);
       
       // Nếu trong state đã có content rồi thì không fetch nữa
       if (postInList && postInList.content) {
         setFullPost(postInList);
       } else {
         // Fetch dữ liệu đầy đủ từ DB
         setLoadingDetail(true);
         DatabaseService.getPostById(detailId).then(data => {
            if (data) setFullPost(data);
            setLoadingDetail(false);
         }).catch(() => setLoadingDetail(false));
       }
    } else {
       setFullPost(null);
    }
  }, [currentPage, detailId, posts]);

  const handleUrlRouting = () => {
    try {
      const searchParams = new URLSearchParams(window.location.search);
      const pageParam = searchParams.get('page');
      const idParam = searchParams.get('id');

      if (pageParam) {
        setCurrentPage(pageParam as PageRoute);
        if (idParam) setDetailId(idParam);
      } else {
        setCurrentPage('home');
      }
    } catch (e) {
      setCurrentPage('home');
    }
  };

  useEffect(() => {
    if (config) {
        document.title = config.metaTitle || config.name;
        if (config.faviconUrl) {
            let link = document.querySelector("link[rel~='icon']") as HTMLLinkElement;
            if (!link) {
                link = document.createElement('link');
                link.rel = 'icon';
                document.head.appendChild(link);
            }
            link.href = config.faviconUrl;
        }
    }
  }, [config]);

  const refreshData = async (showLoader: boolean = true) => {
    if (showLoader) setLoading(true);
    setDataError(false);
    
    try {
        const [
            fetchedConfig, 
            fetchedPosts, 
            fetchedDocs, 
            fetchedCats, 
            fetchedGallery, 
            fetchedAlbums, 
            fetchedVideos,
            fetchedBlocks, 
            fetchedMenu,
            fetchedStaff,
            fetchedIntros,
            fetchedPostCats
        ] = await Promise.all([
            DatabaseService.getConfig(),
            DatabaseService.getPosts(),
            DatabaseService.getDocuments().catch(() => []),
            DatabaseService.getDocCategories().catch(() => []),
            DatabaseService.getGallery().catch(() => []),
            DatabaseService.getAlbums().catch(() => []),
            DatabaseService.getVideos().catch(() => []),
            DatabaseService.getBlocks().catch(() => []),
            DatabaseService.getMenu().catch(() => []),
            DatabaseService.getStaff().catch(() => []),
            DatabaseService.getIntroductions().catch(() => []),
            DatabaseService.getPostCategories().catch(() => [])
        ]);

        if (fetchedConfig) setConfig(fetchedConfig);
        else if (!config) setConfig(FALLBACK_CONFIG);

        if (fetchedPosts && fetchedPosts.length > 0) {
            setPosts(fetchedPosts);
        }

        setDocuments(fetchedDocs);
        setDocCategories(fetchedCats);
        setGalleryImages(fetchedGallery);
        setAlbums(fetchedAlbums);
        setVideos(fetchedVideos);
        setBlocks(fetchedBlocks.filter(b => b.isVisible).sort((a,b) => a.order - b.order));
        setMenuItems(fetchedMenu.sort((a,b) => a.order - b.order));
        setStaffList(fetchedStaff);
        setIntroductions(fetchedIntros.filter(i => i.isVisible).sort((a,b) => a.order - b.order));
        setPostCategories(fetchedPostCats);

    } catch (error) {
        console.error("Failed to load data", error);
        setDataError(true);
        if (!config) setConfig(FALLBACK_CONFIG);
    } finally {
        if (showLoader) setLoading(false);
    }
  };

  const handleLoginSuccess = (user: User) => {
    setCurrentUser(user);
    setCurrentPage('admin-dashboard');
    safePushState('/?page=admin-dashboard');
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setCurrentUser(null);
    setCurrentPage('login');
    safePushState('/?page=login');
  };

  const navigate = (path: string, id?: string) => {
    if (path.startsWith('admin') && !currentUser) {
       setCurrentPage('login');
       safePushState('/?page=login');
       return;
    }
    if (id) setDetailId(id);
    setCurrentPage(path as PageRoute);
    window.scrollTo(0, 0);
    let newUrl = path === 'home' ? '/' : (path === 'login' ? '/admin' : `/?page=${path}${id ? `&id=${id}` : ''}`);
    safePushState(newUrl);
  };

  if (loading && posts.length === 0 && !config) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center space-y-4">
            <Loader2 size={48} className="animate-spin text-blue-600" />
            <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">Đang đồng bộ dữ liệu...</p>
        </div>
      </div>
    );
  }

  const activeConfig = config || FALLBACK_CONFIG;

  if (currentPage === 'login') {
      return <Login onLoginSuccess={handleLoginSuccess} onNavigate={navigate} />;
  }

  if (currentPage.startsWith('admin-')) {
    if (!currentUser) return <Login onLoginSuccess={handleLoginSuccess} onNavigate={navigate} />;
    return (
      <AdminLayout activePage={currentPage} onNavigate={navigate} currentUser={currentUser} onLogout={handleLogout}>
        {currentPage === 'admin-dashboard' && <Dashboard posts={posts} />}
        {currentPage === 'admin-news' && <ManageNews posts={posts} categories={postCategories} refreshData={refreshData} />}
        {currentPage === 'admin-categories' && <ManagePostCategories refreshData={refreshData} />}
        {currentPage === 'admin-videos' && <ManageVideos refreshData={refreshData} />}
        {currentPage === 'admin-intro' && <ManageIntro refreshData={refreshData} />}
        {currentPage === 'admin-blocks' && <ManageBlocks />}
        {currentPage === 'admin-docs' && <ManageDocuments documents={documents} categories={docCategories} refreshData={refreshData} />}
        {currentPage === 'admin-gallery' && <ManageGallery images={galleryImages} albums={albums} refreshData={refreshData} />}
        {currentPage === 'admin-staff' && <ManageStaff refreshData={refreshData} />} 
        {currentUser.role === UserRole.ADMIN && (
          <>
            {currentPage === 'admin-users' && <ManageUsers refreshData={refreshData} />}
            {currentPage === 'admin-menu' && <ManageMenu refreshData={refreshData} />}
            {currentPage === 'admin-settings' && <ManageSettings />}
          </>
        )}
      </AdminLayout>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-100 font-sans text-slate-900">
      <Header config={activeConfig} menuItems={menuItems} onNavigate={navigate} activePath={currentPage} />
      {!currentPage.startsWith('admin-') && <NewsTicker posts={posts} onNavigate={navigate} primaryColor={activeConfig.primaryColor} />}

      <main className="flex-grow w-full">
        {dataError && (
          <div className="bg-yellow-50 p-3 text-center text-xs font-bold text-yellow-800 border-b border-yellow-100 flex items-center justify-center gap-2">
             Có lỗi kết nối, dữ liệu hiển thị có thể là phiên bản cũ. 
             <button onClick={() => refreshData()} className="flex items-center gap-1 bg-white px-2 py-0.5 rounded border border-yellow-300 hover:bg-yellow-100"><RefreshCcw size={12}/> Thử lại</button>
          </div>
        )}
        
        {currentPage === 'home' && (
          <Home posts={posts} postCategories={postCategories} docCategories={docCategories} config={activeConfig} gallery={galleryImages} videos={videos} blocks={blocks} introductions={introductions} onNavigate={(p, id) => navigate(p, id)} />
        )}
        {currentPage === 'intro' && <Introduction config={activeConfig} />}
        {currentPage === 'staff' && <Staff staffList={staffList} />}
        {currentPage === 'documents' && <Documents documents={documents} categories={docCategories} initialCategorySlug="official" />}
        {currentPage === 'resources' && <Documents documents={documents} categories={docCategories} initialCategorySlug="resource" />}
        {currentPage === 'gallery' && <Gallery images={galleryImages} albums={albums} />}
        {currentPage === 'news' && (
           <div className="container mx-auto px-4 py-10">
            <div className="bg-white p-6 rounded shadow-sm border border-gray-200">
                <div className="flex items-center mb-8 pb-2 border-b-2 border-blue-900">
                    <h2 className="text-2xl font-bold text-blue-900 uppercase">Tin tức & Sự kiện</h2>
                </div>
                {posts.filter(p => p.status === 'published').length === 0 ? (
                    <div className="p-10 text-center text-gray-500 italic">Đang tải tin tức...</div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {posts.filter(p => p.status === 'published').map(post => {
                        const cat = postCategories.find(c => c.slug === post.category);
                        return (
                        <div key={post.id} onClick={() => navigate('news-detail', post.id)} className="group cursor-pointer flex flex-col h-full">
                            <div className="overflow-hidden rounded mb-3 border border-gray-200">
                                <img src={post.thumbnail} className="h-48 w-full object-cover transform group-hover:scale-105 transition duration-500" alt={post.title}/>
                            </div>
                            <span className={`text-xs font-bold uppercase mb-1 block text-${cat?.color || 'blue'}-600`}>{cat?.name || 'Tin tức'}</span>
                            <h3 className="font-bold text-lg mb-2 group-hover:text-blue-700 leading-snug">{post.title}</h3>
                            <p className="text-gray-700 text-sm line-clamp-2 mb-2 flex-grow">{post.summary}</p>
                            <div className="text-xs text-gray-400 mt-auto pt-2 border-t border-gray-100">{post.date}</div>
                        </div>
                    )})}
                    </div>
                )}
            </div>
          </div>
        )}
        {currentPage === 'news-detail' && detailId && (
          <div className="container mx-auto px-4 py-8">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                <div className="lg:col-span-8">
                    {(() => {
                      const post = fullPost || posts.find(p => p.id === detailId);
                      
                      if (loadingDetail) {
                          return (
                            <div className="bg-white p-12 rounded-lg shadow-sm border border-gray-200 text-center">
                                <Loader2 size={32} className="animate-spin text-blue-600 mx-auto mb-4" />
                                <p className="text-gray-500 font-bold uppercase text-xs">Đang tải nội dung chi tiết...</p>
                            </div>
                          );
                      }

                      if (!post) return <div className="p-10 text-center bg-white rounded shadow">Bài viết không tồn tại.</div>;
                      
                      const cat = postCategories.find(c => c.slug === post.category);
                      return (
                        <article className="bg-white p-6 md:p-8 rounded-lg shadow-sm border border-gray-200">
                            <div className="mb-6">
                              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 leading-tight mb-4">{post.title}</h1>
                              <div className="flex flex-wrap items-center gap-4 text-gray-600 text-sm border-b pb-4 border-gray-100 mb-4">
                                <span className={`font-bold text-${cat?.color || 'blue'}-700`}>{(cat?.name || post.category).toUpperCase()}</span>
                                <span>|</span><span>{post.date}</span><span>|</span><span>Tác giả: {post.author}</span>
                              </div>
                            </div>
                            <div className="font-semibold text-lg text-gray-800 mb-6 italic bg-gray-50 p-4 border-l-4 border-blue-500 rounded-r">{post.summary}</div>
                            {post.content ? (
                                <div className="prose prose-blue prose-lg max-w-none text-gray-900 leading-relaxed text-justify news-content-area" dangerouslySetInnerHTML={{ __html: post.content }} />
                            ) : (
                                <div className="text-gray-400 italic">Dữ liệu nội dung đang được tải...</div>
                            )}
                        </article>
                      );
                    })()}
                </div>
                <div className="lg:col-span-4">
                    <Sidebar blocks={blocks.filter(b => b.position === 'sidebar')} posts={posts} postCategories={postCategories} docCategories={docCategories} documents={documents} onNavigate={navigate} currentPage="news-detail" videos={videos} />
                </div>
              </div>
          </div>
        )}
      </main>
      <Footer config={activeConfig} />
      {!currentPage.startsWith('admin-') && <FloatingContact config={activeConfig} />}
    </div>
  );
};

export default App;
