import React, { useState, useEffect } from 'react';
import { SchoolDocument, DocumentCategory } from '../types';
import { FileText, Download, Search, Filter, FolderOpen, Eye, X, Maximize2 } from 'lucide-react';

interface DocumentsProps {
  documents: SchoolDocument[];
  categories: DocumentCategory[];
  initialCategorySlug?: string;
}

export const Documents: React.FC<DocumentsProps> = ({ documents, categories, initialCategorySlug }) => {
  const [activeCategorySlug, setActiveCategorySlug] = useState<string>(initialCategorySlug || (categories[0]?.slug || ''));
  const [searchTerm, setSearchTerm] = useState('');
  const [previewDoc, setPreviewDoc] = useState<SchoolDocument | null>(null);

  // Update active slug if initial prop changes
  useEffect(() => {
      if (initialCategorySlug) setActiveCategorySlug(initialCategorySlug);
  }, [initialCategorySlug]);

  const activeCategory = categories.find(c => c.slug === activeCategorySlug);
  
  // Filter Docs
  const filteredDocs = documents.filter(doc => {
      const matchCat = activeCategory ? doc.categoryId === activeCategory.id : true;
      const matchSearch = doc.title.toLowerCase().includes(searchTerm.toLowerCase()) || doc.number.toLowerCase().includes(searchTerm.toLowerCase());
      return matchCat && matchSearch;
  });

  const handlePreview = (doc: SchoolDocument) => {
    if (!doc.downloadUrl || doc.downloadUrl === '#') {
        alert("Tài liệu này chưa có nội dung để xem trước.");
        return;
    }
    setPreviewDoc(doc);
  };

  return (
    <div className="container mx-auto px-4 py-10">
      <div className="flex flex-col lg:flex-row gap-8">
        
        {/* MAIN CONTENT (Moved to first position = Left) */}
        <div className="lg:w-3/4">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 min-h-[600px]">
                {/* Page Header */}
                <div className="p-6 border-b border-gray-100 bg-gray-50 rounded-t-lg">
                    <h1 className="text-2xl font-bold text-blue-900 uppercase mb-2">
                        {activeCategory ? activeCategory.name : 'Tất cả văn bản'}
                    </h1>
                    <p className="text-gray-600 text-sm">
                        {activeCategory?.description || 'Hệ thống văn bản và tài nguyên học tập nhà trường.'}
                    </p>
                </div>

                {/* Filter Toolbar */}
                <div className="p-4 border-b border-gray-100 flex flex-col md:flex-row gap-4 justify-between bg-white sticky top-0 z-10">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input 
                            type="text" 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Tìm kiếm theo số hiệu hoặc nội dung..."
                            className="w-full pl-10 pr-4 py-2 bg-[#333333] border border-gray-600 rounded text-blue-200 placeholder-blue-300/70 focus:ring-2 focus:ring-blue-500 outline-none" 
                        />
                    </div>
                </div>

                {/* Document List/Table */}
                <div className="overflow-x-auto">
                    {filteredDocs.length === 0 ? (
                        <div className="p-10 text-center text-gray-500 italic">
                            Không tìm thấy tài liệu nào trong mục này.
                        </div>
                    ) : (
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-100 text-gray-700 text-sm font-bold uppercase border-b border-gray-300">
                                <th className="px-6 py-3 border-r w-32">Số hiệu</th>
                                <th className="px-6 py-3 border-r w-32">Ngày BH</th>
                                <th className="px-6 py-3 border-r">Trích yếu nội dung</th>
                                <th className="px-6 py-3 text-center w-32">Thao tác</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 text-sm">
                                {filteredDocs.map((doc, index) => {
                                    const isImage = doc.downloadUrl && doc.downloadUrl.match(/\.(jpeg|jpg|gif|png|webp|bmp)$/i) || doc.downloadUrl.startsWith('data:image');
                                    return (
                                        <tr key={doc.id} className={index % 2 === 0 ? 'bg-white hover:bg-blue-50' : 'bg-gray-50 hover:bg-blue-50'}>
                                            <td className="px-6 py-4 font-mono text-blue-800 font-medium border-r">{doc.number}</td>
                                            <td className="px-6 py-4 border-r text-gray-600">{doc.date}</td>
                                            <td className="px-6 py-4 border-r text-gray-800 font-medium">
                                                <div 
                                                    className="cursor-pointer hover:text-blue-600 transition"
                                                    onClick={() => handlePreview(doc)}
                                                >
                                                    {doc.title}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <div className="flex items-center justify-center gap-2">
                                                    {/* Preview Button */}
                                                    <button 
                                                        onClick={() => handlePreview(doc)}
                                                        className="text-blue-600 hover:text-blue-800 p-2 rounded-full hover:bg-blue-100 transition"
                                                        title="Xem trước"
                                                    >
                                                        <Eye size={18} />
                                                    </button>
                                                    
                                                    {/* Download Button */}
                                                    <a 
                                                        href={doc.downloadUrl}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                        download={doc.downloadUrl.startsWith('data:') ? `${doc.number}.pdf` : undefined}
                                                        className="text-green-600 hover:text-green-800 p-2 rounded-full hover:bg-green-100 transition"
                                                        title="Tải về máy"
                                                    >
                                                        <Download size={18} />
                                                    </a>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>

        {/* SIDEBAR CATEGORIES (Moved to second position = Right) */}
        <div className="lg:w-1/4">
           <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden sticky top-24">
               <div className="bg-blue-900 text-white p-3 font-bold text-center uppercase text-sm tracking-wide">
                  Danh mục văn bản
               </div>
               <div className="flex flex-col">
                   {categories.map(cat => (
                       <button
                          key={cat.id}
                          onClick={() => setActiveCategorySlug(cat.slug)}
                          className={`flex items-center p-4 border-b border-gray-100 text-left transition hover:bg-blue-50 ${
                              activeCategorySlug === cat.slug 
                                ? 'bg-blue-50 text-blue-800 font-bold border-l-4 border-l-blue-600' 
                                : 'text-gray-700 hover:text-blue-600 border-l-4 border-l-transparent'
                          }`}
                       >
                          <FolderOpen size={18} className={`mr-3 ${activeCategorySlug === cat.slug ? 'text-blue-600' : 'text-gray-400'}`} />
                          <div>
                              <span className="block">{cat.name}</span>
                              {cat.description && <span className="text-[10px] text-gray-500 font-normal">{cat.description}</span>}
                          </div>
                       </button>
                   ))}
               </div>
           </div>
        </div>

      </div>

      {/* DOCUMENT PREVIEW MODAL */}
      {previewDoc && (
            <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 p-4 animate-fade-in">
                <div className="bg-white w-full max-w-4xl h-[85vh] rounded-lg shadow-2xl flex flex-col overflow-hidden">
                    {/* Header */}
                    <div className="flex justify-between items-center p-3 bg-gray-800 text-white border-b border-gray-700">
                        <div className="flex items-center overflow-hidden">
                             <FileText size={18} className="mr-2 text-orange-400 flex-shrink-0"/>
                             <h3 className="font-bold text-sm truncate pr-4">{previewDoc.title}</h3>
                        </div>
                        <div className="flex items-center space-x-2 flex-shrink-0">
                            <a 
                                href={previewDoc.downloadUrl} 
                                target="_blank" 
                                rel="noreferrer" 
                                className="p-1.5 hover:bg-gray-700 rounded text-gray-300 hover:text-white transition"
                                title="Mở trong tab mới"
                            >
                                <Maximize2 size={18} />
                            </a>
                            <button 
                                onClick={() => setPreviewDoc(null)}
                                className="p-1.5 hover:bg-red-600 rounded text-gray-300 hover:text-white transition"
                            >
                                <X size={20} />
                            </button>
                        </div>
                    </div>
                    
                    {/* Content */}
                    <div className="flex-1 bg-gray-100 relative">
                        {previewDoc.downloadUrl.match(/\.(jpeg|jpg|gif|png|webp)$/i) || previewDoc.downloadUrl.startsWith('data:image') ? (
                            <div className="w-full h-full flex items-center justify-center overflow-auto p-4">
                                <img src={previewDoc.downloadUrl} alt="Preview" className="max-w-full max-h-full object-contain shadow-lg" />
                            </div>
                        ) : (
                            /* Using Google Docs Viewer for generic preview support for PDF, DOC, etc. */
                            <iframe 
                                src={previewDoc.downloadUrl.startsWith('data:') ? previewDoc.downloadUrl : (previewDoc.downloadUrl.startsWith('http') ? previewDoc.downloadUrl : '')} 
                                className="w-full h-full" 
                                frameBorder="0"
                                title="Document Preview"
                            ></iframe>
                        )}
                        
                        {/* Fallback Message for Iframe issues */}
                        <div className="absolute inset-0 -z-10 flex flex-col items-center justify-center text-gray-400">
                             <p>Đang tải bản xem trước...</p>
                             <p className="text-xs mt-2">Nếu không hiển thị, vui lòng nhấn nút tải về.</p>
                        </div>
                    </div>
                    
                    {/* Footer */}
                    <div className="bg-gray-50 p-3 border-t border-gray-200 text-right">
                        <a 
                            href={previewDoc.downloadUrl} 
                            target="_blank" 
                            rel="noreferrer"
                            download={previewDoc.downloadUrl.startsWith('data:') ? `${previewDoc.number}.pdf` : undefined}
                            className="inline-flex items-center justify-center px-4 py-2 bg-blue-600 text-white text-sm font-bold rounded hover:bg-blue-700 transition"
                        >
                            <Download size={16} className="mr-2"/> Tải tài liệu gốc
                        </a>
                    </div>
                </div>
            </div>
        )}
    </div>
  );
};