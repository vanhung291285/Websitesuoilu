import React, { useState } from 'react';
import { GalleryImage, GalleryAlbum } from '../types';
import { Camera, Folder, ArrowLeft, Calendar } from 'lucide-react';

interface GalleryProps {
  images: GalleryImage[];
  albums: GalleryAlbum[];
}

export const Gallery: React.FC<GalleryProps> = ({ images, albums }) => {
  const [selectedAlbumId, setSelectedAlbumId] = useState<string | null>(null);

  // If an album is selected, show images inside it
  if (selectedAlbumId) {
     const currentAlbum = albums.find(a => a.id === selectedAlbumId);
     const albumImages = images.filter(img => img.albumId === selectedAlbumId);

     return (
        <div className="container mx-auto px-4 py-10">
           <div className="mb-6">
              <button 
                 onClick={() => setSelectedAlbumId(null)}
                 className="flex items-center text-blue-600 hover:text-blue-800 font-bold text-sm mb-4 transition"
              >
                 <ArrowLeft size={16} className="mr-1" /> Quay lại danh sách Album
              </button>
              
              <div className="border-b pb-4 mb-6">
                  <h1 className="text-3xl font-bold text-blue-900 mb-2">{currentAlbum?.title}</h1>
                  <p className="text-gray-600">{currentAlbum?.description}</p>
                  <div className="text-xs text-gray-500 mt-2 flex items-center">
                     <Calendar size={12} className="mr-1"/> {currentAlbum?.createdDate}
                     <span className="mx-2">|</span>
                     {albumImages.length} hình ảnh
                  </div>
              </div>

              <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
                  {albumImages.map((img) => (
                      <div key={img.id} className="break-inside-avoid bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300 group">
                        <div className="relative overflow-hidden">
                            <img src={img.url} alt={img.caption} className="w-full h-auto transform group-hover:scale-105 transition-transform duration-500" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                              <span className="text-white font-medium text-sm">{img.caption}</span>
                            </div>
                        </div>
                      </div>
                  ))}
                  {albumImages.length === 0 && (
                     <p className="text-gray-500 italic text-center col-span-full">Album này chưa có hình ảnh nào.</p>
                  )}
              </div>
           </div>
        </div>
     );
  }

  // Default View: List of Albums
  return (
    <div className="container mx-auto px-4 py-10">
      <div className="text-center mb-10">
         <h1 className="text-3xl font-bold text-blue-900 uppercase mb-3 flex items-center justify-center">
            <Camera className="mr-3" /> Thư viện hình ảnh
         </h1>
         <p className="text-gray-600">Khoảnh khắc đáng nhớ của thầy và trò nhà trường</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
         {albums.map((album) => {
            const imageCount = images.filter(i => i.albumId === album.id).length;
            return (
               <div 
                  key={album.id} 
                  onClick={() => setSelectedAlbumId(album.id)}
                  className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden cursor-pointer hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group"
               >
                  <div className="h-48 overflow-hidden relative">
                     <img src={album.thumbnail} alt={album.title} className="w-full h-full object-cover" />
                     <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition"></div>
                     <div className="absolute bottom-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded flex items-center">
                        <Folder size={12} className="mr-1"/> {imageCount} ảnh
                     </div>
                  </div>
                  <div className="p-5">
                     <h3 className="text-lg font-bold text-gray-800 mb-2 group-hover:text-blue-700 transition">{album.title}</h3>
                     <p className="text-sm text-gray-500 line-clamp-2">{album.description}</p>
                     <div className="mt-4 pt-3 border-t border-gray-100 flex justify-between items-center text-xs text-gray-400">
                        <span>{album.createdDate}</span>
                        <span className="text-blue-600 font-bold group-hover:underline">Xem album →</span>
                     </div>
                  </div>
               </div>
            );
         })}
      </div>
      
      {albums.length === 0 && (
         <div className="text-center py-12 text-gray-500">
            Chưa có album ảnh nào được tạo.
         </div>
      )}
    </div>
  );
};