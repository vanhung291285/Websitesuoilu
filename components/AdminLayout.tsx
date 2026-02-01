
import React from 'react';
import { LayoutDashboard, FileText, Settings, LogOut, GraduationCap, Menu, Users, Image, FolderOpen, List, LayoutTemplate, Briefcase, Info, Tag, Video } from 'lucide-react';
import { User, UserRole } from '../types';

interface AdminLayoutProps {
  children: React.ReactNode;
  activePage: string;
  onNavigate: (path: string) => void;
  currentUser: User | null;
  onLogout: () => void;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ children, activePage, onNavigate, currentUser, onLogout }) => {
  const [sidebarOpen, setSidebarOpen] = React.useState(true);

  const menuItems = [
    { id: 'admin-dashboard', label: 'Bảng điều khiển', icon: LayoutDashboard, role: 'ALL' },
    { id: 'admin-news', label: 'Quản lý Tin tức', icon: FileText, role: 'ALL' },
    { id: 'admin-categories', label: 'Chuyên mục bài viết', icon: Tag, role: UserRole.ADMIN },
    { id: 'admin-videos', label: 'Thư viện Video', icon: Video, role: 'ALL' },
    { id: 'admin-intro', label: 'Giới thiệu nhà trường', icon: Info, role: 'ALL' },
    { id: 'admin-docs', label: 'Văn bản - Tài liệu', icon: FolderOpen, role: 'ALL' },
    { id: 'admin-gallery', label: 'Thư viện ảnh', icon: Image, role: 'ALL' },
    { id: 'admin-staff', label: 'Danh sách Cán bộ', icon: Briefcase, role: 'ALL' }, 
    { id: 'admin-users', label: 'Tài khoản người dùng', icon: Users, role: UserRole.ADMIN },
    { id: 'admin-menu', label: 'Cấu hình Menu', icon: List, role: UserRole.ADMIN },
    { id: 'admin-blocks', label: 'Cấu hình Khối', icon: LayoutTemplate, role: UserRole.ADMIN }, 
    { id: 'admin-settings', label: 'Cấu hình chung', icon: Settings, role: UserRole.ADMIN },
  ];

  return (
    <div className="flex h-screen bg-slate-50">
      <aside 
        className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-slate-900 text-white transition-all duration-300 flex flex-col fixed md:relative h-full z-20 shadow-2xl`}
      >
        <div className="p-4 flex items-center justify-center border-b border-slate-700 h-16 bg-slate-950">
          {sidebarOpen ? (
            <div className="flex items-center space-x-2 font-bold text-lg text-white">
              <GraduationCap className="text-blue-400" />
              <span>Hệ thống Quản trị</span>
            </div>
          ) : (
             <GraduationCap className="text-blue-400" />
          )}
        </div>

        <nav className="flex-1 py-4 overflow-y-auto">
          <p className="px-4 text-xs font-bold text-slate-400 uppercase mb-2 tracking-wider">{sidebarOpen && 'Modules'}</p>
          <ul className="space-y-1">
            {menuItems.map((item) => {
              if (item.role !== 'ALL' && currentUser?.role !== item.role) return null;
              
              const Icon = item.icon;
              const isActive = activePage === item.id;
              
              return (
                <li key={item.id}>
                  <button
                    onClick={() => onNavigate(item.id)}
                    className={`w-full flex items-center px-4 py-3 transition-colors border-l-4 ${
                      isActive 
                        ? 'bg-blue-900 text-white border-blue-400 shadow-inner' 
                        : 'text-slate-300 hover:bg-slate-800 hover:text-white border-transparent'
                    }`}
                  >
                    <Icon size={20} className={`min-w-[20px] ${isActive ? 'text-blue-300' : 'text-slate-400'}`} />
                    {sidebarOpen && <span className={`ml-3 truncate font-medium ${isActive ? 'text-white' : ''}`}>{item.label}</span>}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="p-4 border-t border-slate-700 bg-slate-950">
           <button 
             onClick={onLogout}
             className="w-full flex items-center px-2 py-2 text-red-400 hover:bg-slate-800 hover:text-red-300 rounded transition"
           >
              <LogOut size={20} />
              {sidebarOpen && <span className="ml-3 font-medium">Đăng xuất</span>}
           </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col overflow-hidden text-gray-900">
        <header className="bg-white shadow-sm h-16 flex items-center justify-between px-6 z-10 border-b border-gray-200">
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-gray-700 hover:text-blue-600">
            <Menu size={24} />
          </button>
          <div className="flex items-center space-x-4">
            <div className="text-right hidden md:block">
              <div className="text-sm font-bold text-gray-900">{currentUser?.fullName}</div>
              <div className="text-xs text-gray-600 font-medium">{currentUser?.role === UserRole.ADMIN ? 'Quản trị viên' : 'Biên tập viên'}</div>
            </div>
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-800 font-bold border-2 border-blue-200 shadow-sm">
              {currentUser?.username.charAt(0).toUpperCase()}
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-auto p-6 bg-slate-100">
          {children}
        </main>
      </div>
    </div>
  );
};
