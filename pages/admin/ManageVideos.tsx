
import React, { useState, useEffect } from 'react';
import { Video } from '../../types';
import { DatabaseService } from '../../services/database';
// Added RotateCcw to the imports from lucide-react to fix the error on line 138
import { Plus, Trash2, Save, Link as LinkIcon, AlertCircle, PlayCircle, Loader2, Video as VideoIcon, Code, CheckCircle2, Terminal, RotateCcw } from 'lucide-react';

interface ManageVideosProps {
  refreshData: () => void;
}

export const ManageVideos: React.FC<ManageVideosProps> = ({ refreshData }) => {
  const [videos, setVideos] = useState<Video[]>([]);
  const [newVideo, setNewVideo] = useState<Partial<Video>>({ title: '', youtubeUrl: '' });
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{type: 'success' | 'error' | 'table_missing', msg: string} | null>(null);

  useEffect(() => {
    loadVideos();
  }, []);

  const loadVideos = async () => {
    try {
      const data = await DatabaseService.getVideos();
      setVideos(data);
    } catch (e: any) {
      console.error("Lỗi tải video:", e);
      if (e.message?.includes('public.videos') || e.code === 'PGRST116') {
        setStatus({ 
          type: 'table_missing', 
          msg: "Bảng 'videos' chưa được khởi tạo trong Database Supabase của bạn." 
        });
      }
    }
  };

  const getYouTubeId = (input: string) => {
    if (!input) return null;
    const trimmed = input.trim();
    if (trimmed.includes('<iframe')) {
      const embedRegex = /src=["'](?:https?:)?\/\/www\.youtube\.com\/embed\/([^"&?\/\s]{11})["']/i;
      const match = trimmed.match(embedRegex);
      if (match) return match[1];
    }
    const urlRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/|youtube\.com\/shorts\/)([^"&?\/\s]{11})/i;
    const urlMatch = trimmed.match(urlRegex);
    if (urlMatch) return urlMatch[1];
    if (trimmed.length === 11 && !trimmed.includes(' ')) return trimmed;
    return null;
  };

  const handleAdd = async () => {
    setStatus(null);
    const trimmedTitle = newVideo.title?.trim();
    const inputUrl = newVideo.youtubeUrl?.trim();

    if (!trimmedTitle || !inputUrl) {
      return setStatus({ type: 'error', msg: "Vui lòng nhập đầy đủ Tiêu đề và Link video." });
    }
    
    const videoId = getYouTubeId(inputUrl);
    if (!videoId) {
      return setStatus({ type: 'error', msg: "Nguồn video không hợp lệ. Hãy dán link YouTube hoặc mã nhúng." });
    }

    const finalUrl = `https://www.youtube.com/watch?v=${videoId}`;

    setLoading(true);
    try {
      await DatabaseService.saveVideo({
        id: '', 
        title: trimmedTitle,
        youtubeUrl: finalUrl,
        order: videos.length + 1
      } as Video);
      
      setNewVideo({ title: '', youtubeUrl: '' });
      setStatus({ type: 'success', msg: "Đã lưu video thành công!" });
      await loadVideos();
      refreshData();
    } catch (e: any) {
      console.error("Lỗi Database:", e);
      setStatus({ 
        type: 'error', 
        msg: `Lỗi: ${e.message || "Không thể lưu dữ liệu."}` 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Xóa video này khỏi danh sách?")) {
      try {
        await DatabaseService.deleteVideo(id);
        await loadVideos();
        refreshData();
      } catch (e: any) {
        alert("Lỗi khi xóa: " + e.message);
      }
    }
  };

  return (
    <div className="space-y-6 animate-fade-in text-gray-900">
      {/* Thông báo hướng dẫn nếu thiếu bảng */}
      {status?.type === 'table_missing' && (
        <div className="bg-red-50 border-2 border-red-200 p-6 rounded-2xl shadow-lg animate-pulse">
           <div className="flex items-center gap-3 text-red-700 mb-4">
              <AlertCircle size={32} />
              <h3 className="text-xl font-black uppercase">Cần khởi tạo Database</h3>
           </div>
           <p className="text-sm text-red-900 mb-4 leading-relaxed">
             Hệ thống chưa tìm thấy bảng <b>videos</b>. Bạn cần vào <b>Supabase SQL Editor</b> và chạy đoạn mã sau để sửa lỗi:
           </p>
           <div className="bg-slate-900 text-slate-300 p-4 rounded-xl font-mono text-[11px] overflow-x-auto relative group">
              <button 
                onClick={() => {
                  navigator.clipboard.writeText("CREATE TABLE IF NOT EXISTS videos (id UUID PRIMARY KEY DEFAULT uuid_generate_v4(), title TEXT NOT NULL, youtube_url TEXT NOT NULL, order_index INTEGER DEFAULT 0, created_at TIMESTAMPTZ DEFAULT NOW()); ALTER TABLE videos ENABLE ROW LEVEL SECURITY; CREATE POLICY \"Public Read\" ON videos FOR SELECT USING (true); CREATE POLICY \"Auth All\" ON videos FOR ALL USING (auth.role() = 'authenticated');");
                  alert("Đã sao chép mã SQL!");
                }}
                className="absolute right-2 top-2 bg-blue-600 text-white px-2 py-1 rounded text-[10px] font-bold"
              >Copy</button>
              <code>
                CREATE TABLE IF NOT EXISTS videos (<br/>
                &nbsp;&nbsp;id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),<br/>
                &nbsp;&nbsp;title TEXT NOT NULL,<br/>
                &nbsp;&nbsp;youtube_url TEXT NOT NULL,<br/>
                &nbsp;&nbsp;order_index INTEGER DEFAULT 0<br/>
                );<br/>
                ALTER TABLE videos ENABLE ROW LEVEL SECURITY;<br/>
                CREATE POLICY \"Allow Public\" ON videos FOR SELECT USING (true);
              </code>
           </div>
           <button 
             onClick={() => window.location.reload()} 
             className="mt-4 bg-red-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-red-700 flex items-center gap-2"
           >
             <RotateCcw size={18}/> Đã chạy xong SQL, Tải lại trang
           </button>
        </div>
      )}

      <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200">
        <h3 className="font-black text-gray-800 mb-6 flex items-center text-xl uppercase tracking-tight">
          <Plus size={24} className="mr-2 text-red-600"/> Thêm Video Mới
        </h3>

        {status && status.type !== 'table_missing' && (
          <div className={`mb-6 p-4 rounded-lg flex items-center gap-3 animate-fade-in ${status.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
             {status.type === 'success' ? <CheckCircle2 size={20}/> : <AlertCircle size={20}/>}
             <span className="font-bold text-sm">{status.msg}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="block text-xs font-black text-gray-500 uppercase tracking-widest">Tiêu đề hiển thị</label>
            <input 
              type="text" 
              className="w-full border-2 border-gray-100 rounded-xl p-3.5 text-sm bg-gray-50 focus:bg-white focus:border-red-500 outline-none transition-all font-bold"
              placeholder="VD: Lễ bế giảng năm học"
              value={newVideo.title}
              onChange={e => setNewVideo({...newVideo, title: e.target.value})}
            />
          </div>
          <div className="space-y-2">
            <label className="block text-xs font-black text-gray-500 uppercase tracking-widest">Link YouTube hoặc Mã nhúng</label>
            <div className="flex gap-3">
              <div className="relative flex-1">
                <input 
                  type="text" 
                  className="w-full border-2 border-gray-100 rounded-xl p-3.5 text-sm bg-gray-50 focus:bg-white focus:border-red-500 outline-none transition-all font-mono"
                  placeholder="Dán link hoặc mã <iframe... vào đây"
                  value={newVideo.youtubeUrl}
                  onChange={e => setNewVideo({...newVideo, youtubeUrl: e.target.value})}
                />
                <div className="absolute right-4 top-4 text-gray-400">
                   {newVideo.youtubeUrl?.includes('<iframe') ? <Code size={20}/> : <LinkIcon size={20}/>}
                </div>
              </div>
              <button 
                onClick={handleAdd}
                disabled={loading || status?.type === 'table_missing'}
                className="bg-red-700 text-white px-8 rounded-xl font-black uppercase text-sm hover:bg-red-800 transition-all shadow-lg active:scale-95 disabled:opacity-50 flex items-center"
              >
                {loading ? <Loader2 size={18} className="animate-spin mr-2"/> : <Save size={18} className="mr-2"/>}
                {loading ? 'Đang lưu' : 'Lưu Video'}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="p-5 bg-slate-50 border-b border-gray-200 flex justify-between items-center">
           <h4 className="font-black text-slate-700 uppercase text-sm tracking-widest">Thư viện video ({videos.length})</h4>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-white text-gray-400 font-black uppercase text-[10px] border-b border-gray-100">
                <th className="p-5 w-48 text-center">Xem trước</th>
                <th className="p-5">Thông tin video</th>
                <th className="p-5 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {videos.map((video, idx) => {
                const videoId = getYouTubeId(video.youtubeUrl);
                return (
                  <tr key={video.id} className="hover:bg-red-50/30 transition group">
                    <td className="p-4">
                      {videoId ? (
                        <div className="relative aspect-video rounded-xl overflow-hidden shadow-md border-2 border-white bg-black">
                          <img 
                            src={`https://img.youtube.com/vi/${videoId}/mqdefault.jpg`} 
                            alt="" 
                            className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition"
                            onError={(e) => (e.currentTarget.src = 'https://i.ytimg.com/vi/not_found/mqdefault.jpg')}
                          />
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="bg-red-600 text-white p-2.5 rounded-full shadow-2xl transform group-hover:scale-110 transition duration-300">
                               <PlayCircle size={24} />
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="aspect-video bg-gray-100 rounded-xl flex items-center justify-center text-gray-300 border-2 border-dashed border-gray-200">
                          <AlertCircle size={24}/>
                        </div>
                      )}
                    </td>
                    <td className="p-5">
                      <div className="text-[10px] font-black text-red-600 uppercase mb-1">Video #{idx+1}</div>
                      <div className="font-black text-slate-800 text-lg mb-2 group-hover:text-red-700 transition">{video.title}</div>
                      <div className="text-[11px] text-blue-600 font-mono flex items-center bg-blue-50 w-fit px-3 py-1 rounded-full border border-blue-100">
                        <LinkIcon size={12} className="mr-2 shrink-0"/> 
                        <span className="truncate max-w-[400px]">{video.youtubeUrl}</span>
                      </div>
                    </td>
                    <td className="p-5 text-right">
                      <button 
                        onClick={() => handleDelete(video.id)} 
                        className="text-gray-300 hover:text-red-600 p-3 rounded-full hover:bg-white hover:shadow-md transition-all active:scale-90"
                        title="Gỡ bỏ video"
                      >
                        <Trash2 size={22} />
                      </button>
                    </td>
                  </tr>
                );
              })}
              {videos.length === 0 && (
                <tr>
                  <td colSpan={3} className="p-24 text-center">
                     <VideoIcon size={64} className="mx-auto mb-4 text-slate-200 opacity-50"/>
                     <p className="text-slate-400 font-bold italic">Chưa có video nào trong thư viện.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
