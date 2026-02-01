
import React, { useState } from 'react';
import { TOOLS } from '../constants';
import { generateLessonPlan, chatWithRobot } from '../services/gemini';
import { Message } from '../types';

interface ToolDetailProps {
  toolId: string;
  onBack: () => void;
}

const ToolDetail: React.FC<ToolDetailProps> = ({ toolId, onBack }) => {
  const tool = TOOLS.find(t => t.id === toolId);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  
  // AI Tools State
  const [topic, setTopic] = useState('');
  const [grade, setGrade] = useState('1');

  // Robot Chat State
  const [chatMessages, setChatMessages] = useState<Message[]>([]);
  const [inputMsg, setInputMsg] = useState('');

  const handleGeneratePlan = async () => {
    if (!topic) return;
    setLoading(true);
    try {
      const plan = await generateLessonPlan(topic, grade);
      setResult(plan || 'Không thể tạo giáo án lúc này.');
    } catch (error) {
      setResult('Đã có lỗi xảy ra.');
    } finally {
      setLoading(false);
    }
  };

  const handleRobotChat = async () => {
    if (!inputMsg) return;
    const userMsg: Message = { role: 'user', text: inputMsg };
    setChatMessages(prev => [...prev, userMsg]);
    setInputMsg('');
    setLoading(true);
    try {
      const aiResponse = await chatWithRobot(chatMessages, inputMsg);
      setChatMessages(prev => [...prev, { role: 'model', text: aiResponse || 'Rất tiếc mình không hiểu ý bạn.' }]);
    } catch (error) {
       setChatMessages(prev => [...prev, { role: 'model', text: 'Có lỗi kết nối với Robot.' }]);
    } finally {
      setLoading(false);
    }
  };

  if (!tool) return null;

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <button 
        onClick={onBack}
        className="flex items-center text-white mb-8 hover:underline font-semibold"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        Quay lại trang chủ
      </button>

      <div className="bg-white rounded-3xl p-8 shadow-2xl min-h-[600px] flex flex-col">
        <div className="flex items-center space-x-4 mb-8">
          <div className={`w-16 h-16 ${tool.color} rounded-2xl flex items-center justify-center text-3xl shadow-sm`}>
            {tool.icon}
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-800">{tool.title}</h1>
            <p className="text-gray-500">{tool.description}</p>
          </div>
        </div>

        <div className="flex-grow border-t pt-6">
          {toolId === 'ai-tools' && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Chủ đề bài học</label>
                  <input 
                    type="text" 
                    placeholder="VD: Quang hợp ở thực vật"
                    className="w-full border p-3 rounded-xl outline-none focus:ring-2 focus:ring-purple-500"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Khối lớp</label>
                  <select 
                    className="w-full border p-3 rounded-xl outline-none focus:ring-2 focus:ring-purple-500"
                    value={grade}
                    onChange={(e) => setGrade(e.target.value)}
                  >
                    {[1,2,3,4,5,6,7,8,9,10,11,12].map(g => (
                      <option key={g} value={g}>Lớp {g}</option>
                    ))}
                  </select>
                </div>
              </div>
              <button 
                onClick={handleGeneratePlan}
                disabled={loading}
                className="w-full py-4 bg-purple-600 text-white font-bold rounded-xl hover:bg-purple-700 disabled:opacity-50 transition-colors shadow-lg"
              >
                {loading ? 'Đang soạn giáo án với Gemini AI...' : 'Tạo giáo án thông minh ✨'}
              </button>

              {result && (
                <div className="bg-gray-50 p-6 rounded-2xl border border-gray-200 prose prose-purple max-w-none whitespace-pre-wrap text-gray-700">
                  {result}
                </div>
              )}
            </div>
          )}

          {toolId === 'robot' && (
            <div className="flex flex-col h-[500px]">
              <div className="flex-grow overflow-y-auto mb-4 space-y-4 p-4 bg-gray-50 rounded-2xl no-scrollbar">
                {chatMessages.length === 0 && (
                  <div className="text-center py-10 opacity-50">
                    <p className="text-4xl mb-2">🦾</p>
                    <p>Chào thầy cô, tôi là Robot Đồng Hành. <br/> Tôi có thể giúp gì cho tiết học hôm nay?</p>
                  </div>
                )}
                {chatMessages.map((msg, idx) => (
                  <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] p-3 rounded-2xl ${msg.role === 'user' ? 'bg-purple-600 text-white rounded-br-none' : 'bg-white text-gray-800 border rounded-bl-none shadow-sm'}`}>
                      {msg.text}
                    </div>
                  </div>
                ))}
                {loading && <div className="text-xs text-gray-400 italic">Robot đang suy nghĩ...</div>}
              </div>
              <div className="flex space-x-2">
                <input 
                  type="text" 
                  placeholder="Hỏi robot bất cứ điều gì..."
                  className="flex-grow border p-3 rounded-xl outline-none focus:ring-2 focus:ring-purple-500"
                  value={inputMsg}
                  onChange={(e) => setInputMsg(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleRobotChat()}
                />
                <button 
                  onClick={handleRobotChat}
                  className="bg-purple-600 text-white p-3 rounded-xl hover:bg-purple-700"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                </button>
              </div>
            </div>
          )}

          {['video', 'eval', 'panorama', 'drag-drop', 'wheel', 'fruit-ninja', 'puzzle', 'docs'].includes(toolId) && (
             <div className="flex flex-col items-center justify-center py-20 space-y-4 opacity-70">
                <div className="text-6xl">{tool.icon}</div>
                <p className="text-xl font-medium text-gray-600">Tính năng "{tool.title}" đang được hoàn thiện</p>
                <p className="text-gray-400 text-center max-w-md">Chúng tôi đang nỗ lực mang đến những trải nghiệm tương tác tốt nhất cho thầy cô. Vui lòng quay lại sau.</p>
                <button onClick={onBack} className="bg-purple-100 text-purple-600 px-6 py-2 rounded-full font-bold">Quay lại</button>
             </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ToolDetail;
