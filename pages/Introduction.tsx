
import React, { useState, useEffect } from 'react';
import { SchoolConfig, IntroductionArticle } from '../types';
import { DatabaseService } from '../services/database';
import { Loader2 } from 'lucide-react';

interface IntroductionProps {
  config: SchoolConfig;
}

export const Introduction: React.FC<IntroductionProps> = ({ config }) => {
  const [articles, setArticles] = useState<IntroductionArticle[]>([]);
  const [activeId, setActiveId] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    DatabaseService.getIntroductions().then(data => {
        const visible = data.filter(i => i.isVisible).sort((a,b) => a.order - b.order);
        setArticles(visible);
        if (visible.length > 0) setActiveId(visible[0].id);
        setLoading(false);
    });
  }, []);

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-blue-600"/></div>;

  const activeArticle = articles.find(a => a.id === activeId);

  return (
    <div className="container mx-auto px-4 py-10">
      <div className="flex flex-col lg:flex-row gap-10">
        
        {/* Main Content */}
        <div className="lg:w-3/4 bg-white p-8 rounded-lg shadow-sm border border-gray-100 min-h-[500px]">
           {activeArticle ? (
             <article className="animate-fade-in">
                <h1 className="text-3xl font-bold text-blue-900 mb-6 pb-2 border-b">{activeArticle.title}</h1>
                
                {activeArticle.imageUrl && (
                    <img src={activeArticle.imageUrl} alt={activeArticle.title} className="w-full rounded-lg shadow-md mb-6 object-cover max-h-[400px]" />
                )}
                
                <div 
                    className="prose max-w-none text-gray-800 leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: activeArticle.content }}
                />
             </article>
           ) : (
             <div className="text-center text-gray-500 py-10">
                <p>Nội dung đang được cập nhật...</p>
             </div>
           )}
        </div>

        {/* Sidebar Menu */}
        <aside className="lg:w-1/4">
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden sticky top-24">
             <div className="bg-blue-900 text-white p-3 font-bold uppercase text-center">
                Giới thiệu
             </div>
             {articles.length > 0 ? (
                <ul className="divide-y divide-gray-100">
                    {articles.map(item => (
                        <li 
                            key={item.id}
                            onClick={() => setActiveId(item.id)}
                            className={`p-3 cursor-pointer transition border-l-4 ${
                                activeId === item.id 
                                ? 'bg-blue-50 text-blue-800 font-bold border-blue-600' 
                                : 'text-gray-600 hover:text-blue-800 hover:bg-blue-50 border-transparent'
                            }`}
                        >
                            {item.title}
                        </li>
                    ))}
                </ul>
             ) : (
                 <div className="p-4 text-sm text-gray-500 text-center italic">Chưa có mục nào</div>
             )}
          </div>
        </aside>

      </div>
    </div>
  );
};
