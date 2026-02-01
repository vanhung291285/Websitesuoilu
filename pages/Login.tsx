import React, { useState } from 'react';
import { User, UserRole } from '../types';
import { supabase } from '../services/supabaseClient';
import { Lock, User as UserIcon, GraduationCap, AlertCircle, ArrowLeft } from 'lucide-react';

interface LoginProps {
  onLoginSuccess: (user: User) => void;
  onNavigate: (path: string) => void;
}

export const Login: React.FC<LoginProps> = ({ onLoginSuccess, onNavigate }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
         email: email,
         password: password
      });

      if (error) throw error;

      if (data.session) {
          // Construct User object
          const user: User = {
             id: data.session.user.id,
             username: email.split('@')[0],
             email: email,
             fullName: 'Quản trị viên', // Ideally fetch from profile table
             role: UserRole.ADMIN
          };
          onLoginSuccess(user);
      }
    } catch (err: any) {
        setError(err.message || 'Đăng nhập thất bại.');
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 relative">
      <button 
        onClick={() => onNavigate('home')}
        className="absolute top-6 left-6 flex items-center text-gray-600 hover:text-blue-600 transition font-medium"
      >
        <ArrowLeft size={20} className="mr-2" /> Về trang chủ
      </button>

      <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md border-t-4 border-blue-900 animate-fade-in">
        <div className="text-center mb-8">
           <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
             <GraduationCap size={32} className="text-blue-900" />
           </div>
           <h2 className="text-2xl font-bold text-gray-800">Đăng nhập Hệ thống</h2>
           <p className="text-sm text-gray-500 mt-2">Sử dụng tài khoản Supabase Auth</p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-700 p-3 rounded mb-6 text-sm flex items-center">
             <AlertCircle size={16} className="mr-2 flex-shrink-0" />
             {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
           <div>
             <label className="block text-sm font-bold text-gray-700 mb-2">Email</label>
             <div className="relative">
                <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input 
                  type="email" 
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                  placeholder="admin@school.edu.vn"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                />
             </div>
           </div>

           <div>
             <label className="block text-sm font-bold text-gray-700 mb-2">Mật khẩu</label>
             <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input 
                  type="password" 
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                  placeholder="Nhập mật khẩu"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                />
             </div>
           </div>

           <button 
             type="submit" 
             disabled={loading}
             className={`w-full bg-blue-900 text-white font-bold py-3 rounded hover:bg-blue-800 transition shadow-lg transform active:scale-95 ${loading ? 'opacity-70 cursor-wait' : ''}`}
           >
             {loading ? 'Đang xác thực...' : 'Đăng nhập'}
           </button>
        </form>
      </div>
    </div>
  );
};