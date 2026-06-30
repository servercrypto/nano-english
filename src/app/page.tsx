"use client";

import React, { useState } from 'react';
import { categories, WordItem } from '../data/vocabulary';

type GameState = 'MENU' | 'VOCABULARY' | 'PUZZLE' | 'SPEAKING';

export default function App() {
  const [gameState, setGameState] = useState<GameState>('MENU');
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const speak = (text: string, lang: string) => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = lang;
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleCardTap = (item: WordItem) => {
    // Каскадная озвучка: Сначала Английский, затем Украинский перевод
    speak(item.word, 'en-US');
    setTimeout(() => {
      speak(item.translation, 'uk-UA');
    }, 1000);
  };

  const handleMenuNavigation = (categoryKey: string) => {
    setActiveCategory(categoryKey);
    setGameState('VOCABULARY');
  };

  const handleBack = () => {
    setActiveCategory(null);
    setGameState('MENU');
  };

  return (
    <div className="min-h-screen bg-[#0f172a] text-white font-sans p-6 flex flex-col items-center justify-center">
      
      {/* Шапка приложения */}
      <div className="text-center mb-8">
        <h1 className="text-3-xl font-bold tracking-tight text-white flex items-center justify-center gap-2">
          Nano English <span className="text-indigo-400">•</span> Tan-Tan
        </h1>
        <div className="mt-2 flex gap-2 justify-center text-xs">
          <span className="bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded border border-amber-500/30">
            node: host_optimization
          </span>
          <span className="bg-indigo-500/20 text-indigo-400 px-2 py-0.5 rounded border border-indigo-500/30">
            audio: web_speech_api
          </span>
        </div>
      </div>

      {/* КИТ-КОНТУР 1: ГЛАВНОЕ МЕНЮ ВЫБОРА КАТЕГОРИЙ */}
      {gameState === 'MENU' && (
        <div className="grid grid-cols-2 gap-6 w-full max-w-md px-4">
          {Object.entries(categories).map(([key, cat]) => (
            <button
              key={key}
              onClick={() => handleMenuNavigation(key)}
              className="flex flex-col items-center justify-center bg-slate-800/80 hover:bg-slate-700/90 border-2 border-slate-700 rounded-2xl p-6 transition-all transform active:scale-95 shadow-xl aspect-square group"
            >
              <span className="text-5xl mb-3 group-hover:animate-bounce">{cat.icon}</span>
              <span className="text-lg font-semibold tracking-wide text-slate-200">{cat.name}</span>
            </button>
          ))}
        </div>
      )}

      {/* КИТ-КОНТУР 2: РЕЖИМ ИЗУЧЕНИЯ СЛОВ (VOCABULARY) */}
      {gameState === 'VOCABULARY' && activeCategory !== null && (
        <div className="w-full max-w-xl flex flex-col items-center animate-fadeIn">
          
          {/* Панель управления контурным шагом */}
          <div className="w-full flex justify-between items-center mb-6 px-4">
            <h2 className="text-xl font-medium text-slate-400 flex items-center gap-2">
              <span>{categories[activeCategory].icon}</span>
              {categories[activeCategory].name}
            </h2>
            <button 
              onClick={handleBack}
              className="bg-slate-800 hover:bg-slate-700 text-sm font-medium px-4 py-2 rounded-xl border border-slate-700 transition-colors active:scale-95"
            >
              ← Назад
            </button>
          </div>

          {/* Сетка карточек объектов */}
          <div className="grid grid-cols-2 gap-4 w-full px-4">
            {categories[activeCategory].items.map((item) => (
              <div
                key={item.id}
                onClick={() => handleCardTap(item)}
                className="flex flex-col items-center justify-center bg-slate-800/50 hover:bg-slate-800 border border-slate-700/60 rounded-2xl p-4 cursor-pointer transition-all active:scale-98 hover:border-indigo-500/50 shadow-md aspect-square"
              >
                <span className="text-5xl mb-2">{item.emoji}</span>
                <span className="text-base font-bold text-white tracking-wide">{item.word}</span>
                <span className="text-xs text-slate-400 mt-1 font-light">{item.translation}</span>
              </div>
            ))}
          </div>

        </div>
      )}

      {/* Заглушки для будущих интерактивных модулей (Пазл / Микрофон) */}
      {/* {gameState === 'PUZZLE' && <div>ПАЗЛ В РАЗРАБОТКЕ</div>} */}
      {/* {gameState === 'SPEAKING' && <div>МИКРОФОН В РАЗРАБОТКЕ</div>} */}

    </div>
  );
}
