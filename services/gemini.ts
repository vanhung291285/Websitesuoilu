import { GoogleGenAI } from "@google/genai";

// Use process.env.API_KEY directly as per Gemini API guidelines
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Using gemini-3-pro-preview for complex reasoning tasks like lesson planning
export const generateLessonPlan = async (topic: string, grade: string) => {
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: `Bạn là một trợ lý giáo dục chuyên nghiệp. Hãy soạn một giáo án chi tiết cho chủ đề: "${topic}" cho lớp ${grade}. 
    Cấu trúc giáo án gồm: Mục tiêu, Chuẩn bị, Hoạt động khởi động, Hoạt động hình thành kiến thức, Hoạt động luyện tập, Vận dụng.`,
    config: {
      temperature: 0.7,
      topP: 0.95,
    }
  });
  return response.text;
};

// Using gemini-3-pro-preview for chat interactions which often involve nuanced queries
export const chatWithRobot = async (history: {role: 'user' | 'model', text: string}[], message: string) => {
  const chat = ai.chats.create({
    model: 'gemini-3-pro-preview',
    config: {
      systemInstruction: 'Bạn là Robot Đồng Hành của giáo viên trong lớp học. Bạn vui vẻ, thông thái và trả lời ngắn gọn, dễ hiểu cho học sinh.',
    }
  });
  
  // Format history for Gemini SDK if needed, but for simplicity we send current context
  const response = await chat.sendMessage({ message });
  return response.text;
};
