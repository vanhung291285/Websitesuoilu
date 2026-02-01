
import React from 'react';
import { Tool } from '../types';

interface CardProps {
  tool: Tool;
  onStart: (toolId: string) => void;
}

const Card: React.FC<CardProps> = ({ tool, onStart }) => {
  const playClick = () => {
    const audio = new Audio('https://www.soundjay.com/buttons/sounds/button-3.mp3');
    audio.play().catch(() => {});
  };

  return (
    <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 group flex flex-col items-center text-center transform hover:-translate-y-2 border border-gray-100">
      <div className={`w-20 h-20 ${tool.color} rounded-2xl flex items-center justify-center text-4xl mb-4 group-hover:scale-110 transition-transform duration-300 shadow-inner`}>
        {tool.icon}
      </div>
      
      <h3 className="text-xl font-bold text-gray-800 mb-2">{tool.title}</h3>
      <p className="text-gray-500 text-sm mb-6 flex-grow">{tool.description}</p>
      
      <button 
        onClick={() => { playClick(); onStart(tool.id); }}
        className="w-full py-2.5 bg-gray-50 text-purple-600 font-bold rounded-xl group-hover:bg-purple-600 group-hover:text-white transition-all duration-300 active:scale-95 shadow-sm"
      >
        Bắt đầu
      </button>
    </div>
  );
};

export default Card;
