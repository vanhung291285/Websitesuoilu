import React from 'react';
import { Post } from '../../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { Users, FileText, Eye, TrendingUp } from 'lucide-react';

interface DashboardProps {
  posts: Post[];
}

export const Dashboard: React.FC<DashboardProps> = ({ posts }) => {
  // Aggregate data for charts
  const totalViews = posts.reduce((sum, p) => sum + p.views, 0);
  const newsCount = posts.filter(p => p.category === 'news').length;
  const activityCount = posts.filter(p => p.category === 'activity').length;
  const announceCount = posts.filter(p => p.category === 'announcement').length;

  const dataCategory = [
    { name: 'Tin tức', value: newsCount },
    { name: 'Hoạt động', value: activityCount },
    { name: 'Thông báo', value: announceCount },
  ];

  // Mock visit data over time
  const visitData = [
    { name: 'T2', visits: 400 },
    { name: 'T3', visits: 300 },
    { name: 'T4', visits: 550 },
    { name: 'T5', visits: 450 },
    { name: 'T6', visits: 600 },
    { name: 'T7', visits: 200 },
    { name: 'CN', visits: 150 },
  ];

  const StatCard = ({ title, value, icon: Icon, color }: any) => (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 flex items-center space-x-4">
      <div className={`p-3 rounded-full ${color} text-white`}>
        <Icon size={24} />
      </div>
      <div>
        <p className="text-sm text-gray-500 font-medium uppercase">{title}</p>
        <p className="text-2xl font-bold text-gray-800">{value}</p>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Tổng quan hệ thống</h2>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard title="Tổng bài viết" value={posts.length} icon={FileText} color="bg-blue-500" />
        <StatCard title="Lượt truy cập" value={totalViews.toLocaleString()} icon={Eye} color="bg-green-500" />
        <StatCard title="Học sinh" value="1,250" icon={Users} color="bg-purple-500" />
        <StatCard title="Giáo viên" value="85" icon={TrendingUp} color="bg-orange-500" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
        {/* Chart 1: Content Distribution */}
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-lg font-bold text-gray-700 mb-4">Phân bố nội dung</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dataCategory}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="value" fill="#3b82f6" barSize={50} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Visits */}
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-lg font-bold text-gray-700 mb-4">Truy cập tuần qua</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={visitData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="visits" stroke="#10b981" strokeWidth={2} activeDot={{ r: 8 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
