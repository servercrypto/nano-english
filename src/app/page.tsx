"use client";

import React, { useState, useEffect } from 'react';
import { categories, WordItem } from '../data/vocabulary';

type GameState = 'MENU' | 'VOCABULARY' | 'PUZZLE' | 'SPEAKING';

export default function App() {
  const [gameState, setGameState] = useState<GameState>('MENU');
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [shuffledItems, setShuffledItems] = useState<WordItem[]>([]);
  const [selectedWordId, setSelectedWordId] = useState<string | null>(null);
  const [matchedIds, setMatchedIds] = useState<string[]>([]);

  // Инициализация и перемешивание кубиков при старте пазла
  useEffect(() => {
    if (gameState === 'PUZZLE' && activeCategory && categories[activeCategory]) {
      const itemsCopy = [...categories[activeCategory].items];
      itemsCopy.sort(() => Math.random() - 0.5);
      setShuffledItems(itemsCopy);
      setMatchedIds([]);
      setSelectedWordId(null);
    }
  }, [gameState, activeCategory]);

  const speak = (text: string, lang: string) => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = lang;
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleCardTap = (item: WordItem) => {
    speak(item.word, 'en-US');
    setTimeout(() => {
      speak(item.translation, 'uk-UA');
    }, 1000);
  };

  const handleMenuNavigation = (categoryKey: string) => {
    setActiveCategory(categoryKey);
    setGameState('VOCABULARY');
  };

  const handleBackToVocabulary = () => {
    setGameState('VOCABULARY');
  };

  const handleBackToMenu = () => {
    setActiveCategory(null);
    setGameState('MENU');
  };

  // Шаг 1: Выбор слова и его активация/озвучка
  const handleWordSlotTap = (wordItem: WordItem) => {
    if (matchedIds.includes(wordItem.id)) return; // Если уже угадано, игнорируем
    
    speak(wordItem.word, 'en-US');
    setSelectedWordId(wordItem.id);
  };

  // Шаг 2: Выбор кубика-эмодзи для сопоставления с активным словом
  const handleEmojiCubeTap = (emojiItem: WordItem) => {
    if (!selectedWordId) return; // Если слово не выбрано, кубики не реагируют

    if (selectedWordId === emojiItem.id) {
      // Успешное совпадение
      setMatchedIds([...matchedIds, emojiItem.id]);
      speak("Excellent", 'en-US');
      setSelectedWordId(null);
    } else {
      // Ошибка сопоставления — мягкий сброс фокуса слова
      setSelectedWordId(null);
    }
  };

  const handleNextToSpeaking = () => {
    setGameState('SPEAKING');
  };

  const isPuzzleComplete = activeCategory && categories[activeCategory] 
    ? matchedIds.length === categories[activeCategory].items.length 
    : false;

  return (
    <div className="min-h-screen bg-[#0f172a] text-white font-sans p-6 flex flex-col items-center justify-center">
      
      {/* Шапка приложения */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-white flex items-center justify-center gap-2">
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
        <div className="w-full max-w-xl flex flex-col items-center">
          
          <div className="w-full flex justify-between items-center mb-6 px-4">
            <h2 className="text-xl font-medium text-slate-400 flex items-center gap-2">
              <span>{categories[activeCategory].icon}</span>
              {categories[activeCategory].name}
            </h2>
            <button 
              onClick={handleBackToMenu}
              className="bg-slate-800 hover:bg-slate-700 text-sm font-medium px-4 py-2 rounded-xl border border-slate-700 transition-colors active:scale-95"
            >
              ← В Меню
            </button>
          </div>

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

          <button 
            onClick={() => setGameState('PUZZLE')} 
            className="mt-8 w-full max-w-xs bg-indigo-600 hover:bg-indigo-500 text-white font-medium py-3 px-6 rounded-xl shadow-lg transition-all transform active:scale-95 text-center"
          >
            Грати в Пазл →
          </button>

        </div>
      )}

      {/* КИТ-КОНТУР 3: РЕЖИМ ИГРЫ "ПАЗЛ" */}
      {gameState === 'PUZZLE' && activeCategory !== null && (
        <div className="w-full max-w-2xl flex flex-col items-center animate-fadeIn">
          
          <div className="w-full flex justify-between items-center mb-6 px-4">
            <h2 className="text-xl font-medium text-slate-400 flex items-center gap-2">
              <span>🧩</span> Пазл: {categories[activeCategory].name}
            </h2>
            <button 
              onClick={handleBackToVocabulary}
              className="bg-slate-800 hover:bg-slate-700 text-sm font-medium px-4 py-2 rounded-xl border border-slate-700 transition-colors active:scale-95"
            >
              ← Назад
            </button>
          </div>

          <div className="grid grid-cols-2 gap-8 w-full px-4 mb-6">
            
            {/* Левая сторона (Слова-Слоты) */}
            <div className="flex flex-col gap-3">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-1">1. Натисни Слово</span>
              {categories[activeCategory].items.map((wordItem) => {
                const isMatched = matchedIds.includes(wordItem.id);
                const isSelected = selectedWordId === wordItem.id;
                return (
                  <div 
                    key={wordItem.id}
                    onClick={() => handleWordSlotTap(wordItem)}
                    className={`flex items-center justify-between p-4 h-20 rounded-xl transition-all border-2 cursor-pointer ${
                      isMatched 
                        ? 'border-green-500/50 bg-green-500/5' 
                        : isSelected
                          ? 'border-indigo-500 bg-indigo-500/20 shadow-md animate-pulse'
                          : 'border-slate-700 bg-slate-800/30 hover:border-slate-600'
                    }`}
                  >
                    <span className="text-base font-bold text-white tracking-wide">{wordItem.word}</span>
                    {isMatched && <span className="text-4xl animate-scaleIn">{wordItem.emoji}</span>}
                  </div>
                );
              })}
            </div>

            {/* Правая сторона (Кубики-Эмодзи) — Разряженная, крупная структура */}
            <div className="flex flex-col gap-3">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-1">2. Знайди Кубик</span>
              <div className="flex flex-col gap-3">
                {shuffledItems.map((item) => {
                  const isMatched = matchedIds.includes(item.id);
                  
                  return (
                    <div key={item.id} className="h-20">
                      {!isMatched ? (
                        <button 
                          onClick={() => handleEmojiCubeTap(item)}
                          disabled={!selectedWordId}
                          className={`w-full h-full flex items-center justify-center text-4xl rounded-xl bg-slate-800 border transition-all ${
                            selectedWordId 
                              ? 'border-slate-700 hover:bg-slate-700/80 hover:border-indigo-500/30 active:scale-95 cursor-pointer' 
                              : 'border-slate-800 opacity-40 cursor-not-allowed'
                          }`}
                        >
                          {item.emoji}
                        </button>
                      ) : (
                        // Пустое пространство вместо исчезнувшего кубика для сохранения стабильности сетки
                        <div className="w-full h-full border border-dashed border-slate-800/20 rounded-xl" />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

          </div>

          {/* Экран Успеха */}
          {isPuzzleComplete && (
            <div className="w-full px-4 mt-4 p-6 bg-green-500/10 border border-green-500/30 rounded-2xl flex flex-col items-center text-center animate-fadeIn">
              <h2 className="text-xl font-bold text-green-400 mb-2">Чудово! Правильна відповідь! 🎉</h2>
              <p className="text-xs text-slate-400 mb-4">Всі кубики розставлені по місцях.</p>
              <button 
                onClick={handleNextToSpeaking} 
                className="bg-green-600 hover:bg-green-500 text-white font-semibold py-2.5 px-6 rounded-xl transition-all transform active:scale-95 shadow-md"
              >
                Далі (До мікрофону) →
              </button>
            </div>
          )}

        </div>
      )}

      {/* КИТ-КОНТУР 4: РЕЖИМ МИКРОФОНА */}
      {gameState === 'SPEAKING' && (
        <div className="w-full max-w-md p-6 bg-slate-800/40 border border-slate-700 rounded-2xl flex flex-col items-center text-center animate-fadeIn">
          <div className="text-4xl mb-2">🎙️</div>
          <h2 className="text-lg font-bold text-indigo-400 mb-4">Модуль перевірки вимови</h2>
          <div className="p-4 bg-slate-900/50 rounded-xl border border-slate-800 text-sm text-slate-400 mb-6 w-full">
            Тут буде активовано нативний Web Speech API для розпізнавання мови малюка.
          </div>
          <button 
            onClick={() => setGameState('MENU')} 
            className="text-xs text-slate-500 hover:text-slate-400 underline transition-colors"
          >
            Повернутися на головну
          </button>
        </div>
      )}

    </div>
  );
}
