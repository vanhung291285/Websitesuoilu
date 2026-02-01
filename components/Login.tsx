
import React, { useState } from 'react';
import { User, UserRole } from '../types';

interface LoginProps {
  // Fix: Aligning prop name with App.tsx and adding missing onNavigate
  onLoginSuccess: (user: User) => void;
  onNavigate: (path: string) => void;
}

const Login: React.FC<LoginProps> = ({ onLoginSuccess, onNavigate }) => {
  const [isHovered, setIsHovered] = useState(false);

  const simulateLogin = () => {
    // Play sound effect
    const audio = new Audio('https://www.soundjay.com/buttons/sounds/button-11.mp3');
    audio.play().catch(() => {});

    // Fix: Object literal must match User interface in types.ts
    onLoginSuccess({
      id: 'mock-teacher-id',
      username: 'giaovien',
      fullName: "Nguyễn Văn Giáo Viên",
      email: "giaovien.doimoi@gmail.com",
      role: UserRole.EDITOR
    });
  };

  return (
    <div className="min-h-screen gradient-bg flex items-center justify-center p-6 relative overflow-hidden">
      {/* Decorative floating elements */}
      <div className="absolute top-10 left-10 text-white opacity-20 text-9xl select-none">📚</div>
      <div className="absolute bottom-10 right-10 text-white opacity-20 text-9xl select-none">✏️</div>
      <div className="absolute top-1/2 left-1/4 text-white opacity-10 text-7xl select-none">🧪</div>

      <div className="bg-white/95 backdrop-blur-md rounded-[2.5rem] p-12 shadow-2xl max-w-lg w-full text-center relative z-10 border border-white/20">
        <div className="mb-8 flex flex-col items-center">
          <div className="w-24 h-24 bg-purple-600 rounded-3xl flex items-center justify-center text-white font-black text-4xl mb-6 shadow-xl transform -rotate-6">
            GV
          </div>
          <h1 className="text-4xl font-black text-gray-800 mb-2 tracking-tight">Giáo viên đổi mới</h1>
          <p className="text-gray-500 font-medium">Kiến tạo tương lai học tập số</p>
        </div>

        <p className="text-gray-600 mb-10 leading-relaxed text-lg">
          Hãy đăng nhập để truy cập kho công cụ hỗ trợ giảng dạy hiện đại và bộ sưu tập trò chơi tương tác thú vị.
        </p>

        <button 
          onClick={simulateLogin}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          className={`flex items-center justify-center space-x-4 w-full py-4 px-6 border-2 border-gray-100 rounded-2xl hover:bg-gray-50 transition-all duration-300 transform ${isHovered ? 'scale-105 shadow-xl border-purple-200' : 'scale-100 shadow-md'}`}
        >
          <img src="https://www.google.com/favicon.ico" alt="Google" className="w-6 h-6" />
          <span className="text-gray-700 font-bold text-lg">Đăng nhập với Google</span>
        </button>

        <div className="mt-12 pt-8 border-t border-gray-100">
          <p className="text-sm text-gray-400">
            Bằng cách đăng nhập, bạn đồng ý với <a href="#" className="underline">Điều khoản</a> và <a href="#" className="underline">Chính sách bảo mật</a> của chúng tôi.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
