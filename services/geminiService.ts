
import { GoogleGenAI } from "@google/genai";

export const generateSchoolContent = async (topic: string, type: 'news' | 'announcement'): Promise<string> => {
  try {
    // Initialize GoogleGenAI with API key from process.env.API_KEY
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    const prompt = type === 'news' 
      ? `Viết một bài báo ngắn (khoảng 200 từ) cho website trường học về chủ đề: "${topic}". Văn phong trang trọng, tích cực, phù hợp môi trường giáo dục Việt Nam. Định dạng Markdown.`
      : `Viết một thông báo chính thức (khoảng 150 từ) từ Ban giám hiệu về việc: "${topic}". Văn phong hành chính, rõ ràng, ngắn gọn. Định dạng Markdown.`;

    // Always use ai.models.generateContent to query GenAI with both the model name and prompt
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });

    return response.text || "Không thể tạo nội dung.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Đã xảy ra lỗi khi kết nối với AI.";
  }
};
