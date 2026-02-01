
import React from 'react';
import Card from './Card';
import { TOOLS } from '../constants';
import { User } from '../types';

interface DashboardProps {
  user: User;
  onStartTool: (id: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ user, onStartTool }) => {
  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <div className="text-center mb-12 animate-fade-in">
        <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4 drop-shadow-lg">
          {/* Fix: Property 'name' does not exist on type 'User'. Use 'fullName' instead. */}
          Chào mừng, {user.fullName.split(' ').pop()}! 👋
        </h1>
        <p className="text-purple-100 text-lg md:text-xl opacity-90">
          Hôm nay chúng ta sẽ bắt đầu tiết học đầy cảm hứng bằng công cụ nào?
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
        {TOOLS.map((tool) => (
          <Card key={tool.id} tool={tool} onStart={onStartTool} />
        ))}
      </div>
      
      {/* Decorative background shapes */}
      <div className="fixed -top-20 -right-20 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse pointer-events-none"></div>
      <div className="fixed top-1/2 -left-20 w-60 h-60 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse pointer-events-none"></div>
    </div>
  );
};

export default Dashboard;
