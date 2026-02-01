
import { Tool } from './types';

export const TOOLS: Tool[] = [
  {
    id: 'video',
    title: 'Video Tương Tác',
    description: 'Tạo video học tập có tích hợp câu hỏi trắc nghiệm dừng video.',
    icon: '🎬',
    color: 'bg-red-100 text-red-600',
  },
  {
    id: 'eval',
    title: 'Đánh Giá Nhanh',
    description: 'Công cụ đánh giá nhanh kiểm tra phẩm chất, năng lực học sinh.',
    icon: '📊',
    color: 'bg-blue-100 text-blue-600',
  },
  {
    id: 'ai-tools',
    title: 'Công Cụ AI',
    description: 'Soạn giáo án, tạo câu hỏi trắc nghiệm tự động với Gemini.',
    icon: '🤖',
    color: 'bg-purple-100 text-purple-600',
  },
  {
    id: 'panorama',
    title: 'Bảo Tàng Panorama',
    description: 'Trình chiếu ảnh panorama 360 độ tương tác cho các môn Lịch sử, Địa lý.',
    icon: '🌍',
    color: 'bg-green-100 text-green-600',
  },
  {
    id: 'drag-drop',
    title: 'Trắc Nghiệm Kéo Thả',
    description: 'Tạo bài trắc nghiệm kéo thả hình ảnh sinh động.',
    icon: '🧩',
    color: 'bg-yellow-100 text-yellow-600',
  },
  {
    id: 'robot',
    title: 'Robot Đồng Hành',
    description: 'Robot AI hỗ trợ giáo viên giải đáp thắc mắc ngay trong tiết học.',
    icon: '🦾',
    color: 'bg-indigo-100 text-indigo-600',
  },
  {
    id: 'wheel',
    title: 'Vòng Quay Quiz',
    description: 'Quay tên học sinh ngẫu nhiên và chọn câu hỏi thử thách.',
    icon: '🎡',
    color: 'bg-pink-100 text-pink-600',
  },
  {
    id: 'fruit-ninja',
    title: 'Quiz Chém Hoa Quả',
    description: 'Trò chơi trắc nghiệm phong cách game show kịch tính.',
    icon: '🍉',
    color: 'bg-orange-100 text-orange-600',
  },
  {
    id: 'puzzle',
    title: 'Trò Chơi Lật Mảnh Ghép',
    description: 'Trả lời đúng câu hỏi để mở từng mảnh ghép bí ẩn.',
    icon: '🖼️',
    color: 'bg-teal-100 text-teal-600',
  },
  {
    id: 'docs',
    title: 'Tài Liệu Dạy Học',
    description: 'Kho giáo án, slide, tài liệu tham khảo phong phú.',
    icon: '📚',
    color: 'bg-amber-100 text-amber-600',
  },
];
