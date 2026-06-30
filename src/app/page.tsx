"use client";

import React, { useState, useEffect } from 'react';
import { categories, WordItem } from '../data/vocabulary';

type GameState = 'MENU' | 'VOCABULARY' | 'PUZZLE' | 'SPEAKING';
type FeedbackType = 'correct' | 'wrong' | null;

export default function App() {
  const [gameState, setGameState] = useState<GameState>('MENU');
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [shuffledItems, setShuffledItems] = useState<WordItem[]>([]);
  const [selectedWordId, setSelectedWordId] = useState<string | null>(null);
  const [matchedIds, setMatchedIds] = useState<string[]>([]);
  
  // Контур моментального фидбека
  const [feedbackId, setFeedbackId] = useState<string | null>(null);
  const [feedbackType, setFeedbackType] = useState<FeedbackType>(null);

  useEffect(() => {
    if (gameState === 'PUZZLE' && activeCategory && categories[activeCategory]) {
      const itemsCopy = [...categories[activeCategory].items];
      itemsCopy.sort(() => Math.random() - 0.5);
      setShuffledItems(itemsCopy);
      setMatchedIds([]);
      setSelectedWordId(null);
      setFeedbackId(null);
      setFeedbackType(null);
    }
  }, [gameState, activeCategory]);

  // Процедурный синтез звуков для экономии трафика и RAM сервера
  const playFeedbackSound = (type: 'correct' | 'wrong') => {
    if (typeof window === 'undefined') return;
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;

    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.connect(gain);
    gain.connect(ctx.destination);

    if (type === 'correct') {
      // Позитивный ретро-аккорд (два быстрых высоких тона)
      osc.type = 'sine';
      osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
      osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.08); // E5
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
      osc.start();
      osc.stop(ctx.currentTime + 0.3);
    } else {
      // Негативный басовый срез (низкий спадающий sawtooth)
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(140, ctx.currentTime);
      osc.frequency.linearRampToValueAtTime(70, ctx.currentTime + 0.2);
      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
      osc.start();
      osc.stop(ctx.currentTime + 0.25);
    }
  };

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

  const handleWordSlotTap = (wordItem: WordItem) => {
    if (matchedIds.includes(wordItem.id) || feedbackId === wordItem.id) return;
    speak(wordItem.word, 'en-US');
    setSelectedWordId(wordItem.id);
  };

  const handleEmojiCubeTap = (emojiItem: WordItem) => {
    if (!selectedWordId) return;

    const targetWordId = selectedWordId;

    if (targetWordId === emojiItem.id) {
      // Идеальный матч
      setFeedbackId(targetWordId);
      setFeedbackType('correct');
      playFeedbackSound('correct');
      setMatchedIds([...matchedIds, emojiItem.id]);
      setSelectedWordId(null);

      // Очищаем триггер анимации через полсекунды
      setTimeout(() => {
        setFeedbackId(null);
        setFeedbackType(null);
      }, 600);
    } else {
      // Ошибка сопоставления
      setFeedbackId(targetWordId);
      setFeedbackType('wrong');
      playFeedbackSound('wrong');
      setSelectedWordId(null);

      // Даем ребенку рассмотреть ошибку и убираем красный X
      setTimeout(() => {
        setFeedbackId(null);
        setFeedbackType(null);
      }, 800);
    }
  };

  const isPuzzleComplete = activeCategory && categories[activeCategory] 
    ? matchedIds.length === categories[activeCategory].items.length 
    : false;

  return (
    <div className="min-h-screen bg-[#0f172a] text-white font-sans p-4 flex flex-col items-center justify-center relative overflow-hidden select-none">
      
      {/* Шапка */}
      <div className="text-center mb-6 z-10">
        <h1 className="text-2xl font-bold tracking-tight text-white flex items-center justify-center gap-2">
          Nano English <span className="text-indigo-400">•</span> Tan-Tan
        </h1>
      </div>

      {/* КИТ-КОНТУР 1: ГЛАВНОЕ МЕНЮ */}
      {gameState === 'MENU' && (
        <div className="grid grid-cols-2 gap-6 w-full max-w-md px-4">
          {Object.entries(categories).map(([key, cat]) => (
            <button
              key={key}
              onClick={() => { setActiveCategory(key); setGameState('VOCABULARY'); }}
              className="flex flex-col items-center justify-center bg-slate-800/80 hover:bg-slate-700/90 border-2 border-slate-700 rounded-2xl p-6 transition-all transform active:scale-95 shadow-xl aspect-square group"
            >
              <span className="text-5xl mb-3 group-hover:animate-bounce">{cat.icon}</span>
              <span className="text-lg font-semibold tracking-wide text-slate-200">{cat.name}</span>
            </button>
          ))}
        </div>
      )}

      {/* КИТ-КОНТУР 2: ИЗУЧЕНИЕ (VOCABULARY) */}
      {gameState === 'VOCABULARY' && activeCategory !== null && (
        <div className="w-full max-w-xl flex flex-col items-center animate-fadeIn">
          <div className="w-full flex justify-between items-center mb-6 px-4">
            <h2 className="text-lg font-medium text-slate-400 flex items-center gap-2">
              <span>{categories[activeCategory].icon}</span> {categories[activeCategory].name}
            </h2>
            <button onClick={() => setGameState('MENU')} className="bg-slate-800 text-xs font-medium px-4 py-2 rounded-xl border border-slate-700 active:scale-95">
              ← В Меню
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4 w-full px-4">
            {categories[activeCategory].items.map((item) => (
              <div
                key={item.id}
                onClick={() => handleCardTap(item)}
                className="flex flex-col items-center justify-center bg-slate-800/50 border border-slate-700/60 rounded-2xl p-4 cursor-pointer transition-all active:scale-98 aspect-square"
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

      {/* КИТ-КОНТУР 3: ИНТЕРЛОКИНГ ПАЗЛ С СИСТЕМОЙ МГНОВЕННОГО ФИДБЕКА */}
      {gameState === 'PUZZLE' && activeCategory !== null && (
        <div className="w-full max-w-2xl flex flex-col items-center animate-fadeIn z-10">
          
          <div className="w-full flex justify-between items-center mb-6 px-4">
            <h2 className="text-lg font-medium text-slate-400">🧩 Пазл: {categories[activeCategory].name}</h2>
            <button onClick={() => setGameState('VOCABULARY')} className="bg-slate-800 text-xs font-medium px-4 py-2 rounded-xl border border-slate-700 active:scale-95">
              ← Назад
            </button>
          </div>

          <div className="grid grid-cols-2 gap-x-12 gap-y-4 w-full px-4 mb-6 relative">
            
            {/* ЛЕВАЯ СТОРОНА: СЛОВЕСНЫЕ СЛОТЫ И ИХ СОСТОЯНИЯ */}
            <div className="flex flex-col gap-3">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider px-1">1. Натисни Слово</span>
              {categories[activeCategory].items.map((wordItem) => {
                const isMatched = matchedIds.includes(wordItem.id);
                const isSelected = selectedWordId === wordItem.id;
                const isCurrentFeedback = feedbackId === wordItem.id;

                return (
                  <div 
                    key={wordItem.id}
                    onClick={() => handleWordSlotTap(wordItem)}
                    className={`flex items-center justify-between p-4 h-16 rounded-l-2xl transition-all border-2 relative cursor-pointer ${
                      isCurrentFeedback && feedbackType === 'correct'
                        ? 'border-green-400 bg-green-500/20 scale-102 shadow-lg'
                        : isCurrentFeedback && feedbackType === 'wrong'
                          ? 'border-red-500 bg-red-500/20 animate-shake shadow-lg shadow-red-500/10'
                          : isMatched 
                            ? 'border-green-500/30 bg-green-500/5 opacity-90' 
                            : isSelected
                              ? 'border-indigo-500 bg-indigo-500/10 shadow-md scale-98'
                              : 'border-slate-700 bg-slate-800/20 hover:border-slate-600'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {/* Динамический вылет иконки обратной связи */}
                      {isCurrentFeedback && feedbackType === 'correct' && <span className="text-green-400 animate-scaleIn font-bold text-sm">✅</span>}
                      {isCurrentFeedback && feedbackType === 'wrong' && <span className="text-red-500 animate-scaleIn font-bold text-sm">❌</span>}
                      <span className="text-sm font-bold text-white tracking-wide">{wordItem.word}</span>
                    </div>
                    
                    {/* Замок сцепления пазла */}
                    <div className={`absolute right-[-10px] top-1/2 transform -translate-y-1/2 w-5 h-5 rounded-full z-20 border-y-2 border-r-2 ${
                      isCurrentFeedback && feedbackType === 'correct' ? 'bg-green-950 border-green-400' :
                      isCurrentFeedback && feedbackType === 'wrong' ? 'bg-red-950 border-red-500' :
                      isMatched ? 'bg-[#0f172a] border-green-500/30' : 
                      isSelected ? 'bg-indigo-950 border-indigo-500' : 'bg-[#0f172a] border-slate-700'
                    }`} />

                    {/* Постоянный эмодзи при успехе */}
                    {isMatched && !isCurrentFeedback && (
                      <span className="text-3xl absolute right-4 animate-scaleIn z-30">{wordItem.emoji}</span>
                    )}
                  </div>
                );
              })}
            </div>

            {/* ПРАВАЯ СТОРОНА: КУБИКИ-ЭМОДЗИ */}
            <div className="flex flex-col gap-3">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider px-1">2. Знайди Кубик</span>
              <div className="flex flex-col gap-3">
                {shuffledItems.map((item) => {
                  const isMatched = matchedIds.includes(item.id);
                  return (
                    <div key={item.id} className="h-16 relative">
                      {!isMatched ? (
                        <button 
                          onClick={() => handleEmojiCubeTap(item)}
                          disabled={!selectedWordId}
                          className={`w-full h-full flex items-center justify-center text-3xl rounded-r-2xl border-2 border-l-0 transition-all relative ${
                            selectedWordId 
                              ? 'border-slate-700 bg-slate-800/60 hover:bg-slate-700 active:scale-95 cursor-pointer' 
                              : 'border-slate-800/40 bg-slate-800/10 opacity-30 cursor-not-allowed'
                          }`}
                        >
                          <div className="absolute left-[-11px] top-1/2 transform -translate-y-1/2 w-5 h-5 rounded-full bg-[#0f172a] border-r-2 border-transparent z-10" />
                          <span className="z-20">{item.emoji}</span>
                        </button>
                      ) : (
                        <div className="w-full h-full border border-dashed border-slate-800/5 opacity-0" />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

          </div>

          {/* ПОЛНОЭКРАННЫЙ МОДАЛ С ЧЕЛОВЕКОМ-ПАУКОМ ПРИ ПОЛНОЙ СБОРКЕ */}
          {isPuzzleComplete && (
            <div className="fixed inset-0 bg-black/85 backdrop-blur-md flex flex-col items-center justify-center z-50 p-6 animate-fadeIn">
              <div className="bg-slate-900 border-2 border-red-500/40 rounded-3xl p-8 max-w-sm w-full flex flex-col items-center shadow-2xl relative overflow-hidden">
                
                <div className="absolute inset-0 opacity-5 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]" />
                
                {/* Герой мультфильма Spidey */}
                <div className="w-36 h-36 bg-gradient-to-b from-red-600 to-blue-600 rounded-full flex items-center justify-center shadow-2xl shadow-red-500/30 mb-6 border-4 border-slate-700 animate-bounce relative z-10">
                  <span className="text-7xl select-none filter drop-shadow-md">🕷️</span>
                  <div className="absolute bottom-10 left-8 w-6 h-8 bg-white rounded-br-full rotate-12 border-2 border-black" />
                  <div className="absolute bottom-10 right-8 w-6 h-8 bg-white rounded-bl-full -rotate-12 border-2 border-black" />
                </div>

                <h2 className="text-2xl font-black text-center text-white uppercase tracking-wide mb-1 relative z-10">
                  Чудово! 🎮
                </h2>
                <p className="text-sm font-medium text-green-400 text-center mb-6 relative z-10">
                  Пазл повністю зібрано!
                </p>

                <button 
                  onClick={() => setGameState('SPEAKING')} 
                  className="w-full bg-gradient-to-r from-red-600 to-blue-600 hover:from-red-500 hover:to-blue-500 text-white font-extrabold py-3.5 px-6 rounded-2xl shadow-lg shadow-blue-600/30 transition-all transform active:scale-95 text-center uppercase tracking-wider text-sm relative z-10"
                >
                  Далі →
                </button>
              </div>
            </div>
          )}

        </div>
      )}

      {/* КИТ-КОНТУР 4: МИКРОФОН */}
      {gameState === 'SPEAKING' && (
        <div className="w-full max-w-md p-6 bg-slate-800/40 border border-slate-700 rounded-2xl flex flex-col items-center text-center animate-fadeIn">
          <div className="text-4xl mb-2">🎙️</div>
          <h2 className="text-lg font-bold text-indigo-400 mb-4">Модуль перевірки вимови</h2>
          <div className="p-4 bg-slate-900/50 rounded-xl border border-slate-800 text-sm text-slate-400 mb-6 w-full">
            Тут буде активовано нативний Web Speech API для розпізнавання мови малюка.
          </div>
          <button onClick={() => setGameState('MENU')} className="text-xs text-slate-500 underline">
            Повернутися на головну
          </button>
        </div>
      )}

    </div>
  );
}
