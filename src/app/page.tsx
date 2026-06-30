"use client";

import React, { useState, useEffect, useRef } from 'react';
import { categories, WordItem } from '../data/vocabulary';

type GameState = 'MENU' | 'VOCABULARY' | 'PUZZLE' | 'SPEAKING';
type FeedbackType = 'correct' | 'wrong' | 'complete' | null;

export default function App() {
  const [gameState, setGameState] = useState<GameState>('MENU');
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  
  // Состояния Пазла
  const [shuffledItems, setShuffledItems] = useState<WordItem[]>([]);
  const [selectedWordId, setSelectedWordId] = useState<string | null>(null);
  const [matchedIds, setMatchedIds] = useState<string[]>([]);
  const [feedbackId, setFeedbackId] = useState<string | null>(null);
  const [feedbackType, setFeedbackType] = useState<FeedbackType>(null);

  // Состояния Микрофона (Speaking)
  const [speakingIndex, setSpeakingIndex] = useState<number>(0);
  const [isListening, setIsListening] = useState<boolean>(false);
  const [speakingFeedback, setSpeakingFeedback] = useState<FeedbackType>(null);
  
  const recognitionRef = useRef<any>(null);

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
    if (gameState === 'SPEAKING') {
      setSpeakingIndex(0);
      setSpeakingFeedback(null);
      setIsListening(false);
    }
  }, [gameState, activeCategory]);

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
      osc.type = 'sine';
      osc.frequency.setValueAtTime(523.25, ctx.currentTime);
      osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.08);
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
      osc.start();
      osc.stop(ctx.currentTime + 0.3);
    } else {
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
      setFeedbackId(targetWordId);
      setFeedbackType('correct');
      playFeedbackSound('correct');
      setMatchedIds([...matchedIds, emojiItem.id]);
      setSelectedWordId(null);

      setTimeout(() => {
        setFeedbackId(null);
        setFeedbackType(null);
      }, 600);
    } else {
      setFeedbackId(targetWordId);
      setFeedbackType('wrong');
      playFeedbackSound('wrong');
      setSelectedWordId(null);

      setTimeout(() => {
        setFeedbackId(null);
        setFeedbackType(null);
      }, 800);
    }
  };

  const startSpeechRecognition = () => {
    if (typeof window === 'undefined') return;
    if (speakingFeedback === 'correct' || isListening) return;

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setIsListening(true);
      setSpeakingFeedback(null);
    };

    recognition.onresult = (event: any) => {
      let spokenText = event.results[0][0].transcript.toLowerCase().trim();
      spokenText = spokenText.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?]/g, "");

      const currentItem = categories[activeCategory!].items[speakingIndex];
      const targetWord = currentItem.word.toLowerCase().trim();

      // Глобальная матрица фонетических допусков (Speech Fallback Matrix)
      const speechFallbacks: Record<string, string[]> = {
        bread: ['red', 'brad', 'dread', 'brend', 'breathe', 'breath', 'braid', 'brand', 'pret'],
        butter: ['better', 'button', 'water', 'matter', 'batur', 'butler', 'bat', 'bater', 'barter', 'bata'],
        eggs: ['ex', 'x', 'ax', 'acts', 'ext', 'next', 'age', 'egg', 'eg', 'adds', 'ecs', 'ekz', 'eks', 'text', 's'],
        milk: ['mil', 'malk', 'melk', 'miolk'],
        juice: ['jus', 'choose', 'shoes', 'jewice', 'juiz', 'us'],
        cheese: ['chis', 'chees', 'chiz', 'shees']
      };

      const fallbacks = speechFallbacks[targetWord] || [];
      const isFallbackMatch = fallbacks.some(f => spokenText === f || spokenText.includes(f));

      if (spokenText === targetWord || spokenText.includes(targetWord) || isFallbackMatch) {
        setSpeakingFeedback('correct');
        playFeedbackSound('correct');

        setTimeout(() => {
          if (speakingIndex < categories[activeCategory!].items.length - 1) {
            setSpeakingIndex(prev => prev + 1);
            setSpeakingFeedback(null);
          } else {
            setSpeakingFeedback('complete');
          }
        }, 1200);
      } else {
        setSpeakingFeedback('wrong');
        playFeedbackSound('wrong');
        setTimeout(() => setSpeakingFeedback(null), 1500);
      }
    };

    recognition.onerror = () => {
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;
    try {
      recognition.start();
    } catch (e) {
      console.error(e);
    }
  };

  const stopSpeechRecognition = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
    }
    setIsListening(false);
  };

  const handleExitToMenu = () => {
    setActiveCategory(null);
    setGameState('MENU');
  };

  const isPuzzleComplete = activeCategory && categories[activeCategory] 
    ? matchedIds.length === categories[activeCategory].items.length 
    : false;

  return (
    <div className="w-full min-h-screen bg-[#0f172a] text-white font-sans p-6 flex flex-col items-center justify-center relative overflow-hidden select-none">
      
      {/* Шапка */}
      <div className="text-center mb-8 z-10">
        <h1 className="text-3xl font-bold tracking-tight text-white flex items-center justify-center gap-2">
          Nano English <span className="text-indigo-400">•</span> Tan-Tan
        </h1>
      </div>

      {/* КИТ-КОНТУР 1: ГЛАВНОЕ МЕНЮ */}
      {gameState === 'MENU' && (
        <div className="grid grid-cols-2 gap-8 w-full max-w-2xl px-6">
          {Object.entries(categories).map(([key, cat]) => (
            <button
              key={key}
              onClick={() => { setActiveCategory(key); setGameState('VOCABULARY'); }}
              className="flex flex-col items-center justify-center bg-slate-800/80 hover:bg-slate-700/90 border-2 border-slate-700 rounded-3xl p-8 transition-all transform active:scale-95 shadow-2xl aspect-square group"
            >
              <span className="text-6xl mb-4 group-hover:animate-bounce">{cat.icon}</span>
              <span className="text-xl font-bold tracking-wide text-slate-200">{cat.name}</span>
            </button>
          ))}
        </div>
      )}

      {/* КИТ-КОНТУР 2: ИЗУЧЕНИЕ СЛОВ */}
      {gameState === 'VOCABULARY' && activeCategory !== null && (
        <div className="w-full max-w-4xl flex flex-col items-center animate-fadeIn px-4">
          <div className="w-full flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold text-slate-400 flex items-center gap-2">
              <span>{categories[activeCategory].icon}</span> {categories[activeCategory].name}
            </h2>
            <button onClick={handleExitToMenu} className="bg-slate-800 text-sm font-semibold px-6 py-2.5 rounded-xl border border-slate-700 active:scale-95">
              ← В Меню
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 w-full">
            {categories[activeCategory].items.map((item) => (
              <div
                key={item.id}
                onClick={() => handleCardTap(item)}
                className="flex flex-col items-center justify-center bg-slate-800/50 border-2 border-slate-700/60 rounded-2xl p-6 cursor-pointer transition-all active:scale-98 shadow-lg aspect-square hover:border-indigo-500/40"
              >
                <span className="text-6xl mb-3">{item.emoji}</span>
                <span className="text-lg font-black text-white tracking-wide">{item.word}</span>
                <span className="text-sm text-slate-400 mt-1 font-medium">{item.translation}</span>
              </div>
            ))}
          </div>

          <button 
            onClick={() => setGameState('PUZZLE')} 
            className="mt-10 w-full max-w-sm bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-4 px-8 rounded-2xl shadow-xl shadow-indigo-600/20 transition-all transform active:scale-95 text-center text-lg"
          >
            Грати в Пазл →
          </button>
        </div>
      )}

      {/* КИТ-КОНТУР 3: ИНТЕРЛОКИНГ ПАЗЛ */}
      {gameState === 'PUZZLE' && activeCategory !== null && (
        <div className="w-full max-w-3xl flex flex-col items-center animate-fadeIn z-10 px-4">
          
          <div className="w-full flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-slate-400">🧩 Пазл: {categories[activeCategory].name}</h2>
            <button onClick={() => setGameState('VOCABULARY')} className="bg-slate-800 text-sm font-semibold px-5 py-2 rounded-xl border border-slate-700 active:scale-95">
              ← Назад
            </button>
          </div>

          <div className="grid grid-cols-2 gap-x-16 gap-y-4 w-full mb-6 relative">
            
            {/* ЛЕВАЯ СТОРОНА: СЛОВА */}
            <div className="flex flex-col gap-4">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider px-1">1. Натисни Слово</span>
              {categories[activeCategory].items.map((wordItem) => {
                const isMatched = matchedIds.includes(wordItem.id);
                const isSelected = selectedWordId === wordItem.id;
                const isCurrentFeedback = feedbackId === wordItem.id;

                return (
                  <div 
                    key={wordItem.id}
                    onClick={() => handleWordSlotTap(wordItem)}
                    className={`flex items-center justify-between p-5 h-20 rounded-l-3xl transition-all border-2 relative cursor-pointer ${
                      isCurrentFeedback && feedbackType === 'correct'
                        ? 'border-green-400 bg-green-500/20 scale-102 shadow-lg'
                        : isCurrentFeedback && feedbackType === 'wrong'
                          ? 'border-red-500 bg-red-500/20 animate-shake shadow-lg'
                          : isMatched 
                            ? 'border-green-500/30 bg-green-500/5 opacity-90' 
                            : isSelected
                              ? 'border-indigo-500 bg-indigo-500/10 shadow-md'
                              : 'border-slate-700 bg-slate-800/20 hover:border-slate-600'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {isCurrentFeedback && feedbackType === 'correct' && <span className="text-green-400 animate-scaleIn text-lg">✅</span>}
                      {isCurrentFeedback && feedbackType === 'wrong' && <span className="text-red-500 animate-scaleIn text-lg">❌</span>}
                      <span className="text-base font-black text-white tracking-wide">{wordItem.word}</span>
                    </div>
                    
                    <div className={`absolute right-[-10px] top-1/2 transform -translate-y-1/2 w-6 h-6 rounded-full z-20 border-y-2 border-r-2 ${
                      isCurrentFeedback && feedbackType === 'correct' ? 'bg-green-950 border-green-400' :
                      isCurrentFeedback && feedbackType === 'wrong' ? 'bg-red-950 border-red-500' :
                      isMatched ? 'bg-[#0f172a] border-green-500/30' : 
                      isSelected ? 'bg-indigo-950 border-indigo-500' : 'bg-[#0f172a] border-slate-700'
                    }`} />

                    {isMatched && !isCurrentFeedback && (
                      <span className="text-4xl absolute right-6 animate-scaleIn z-30">{wordItem.emoji}</span>
                    )}
                  </div>
                );
              })}
            </div>

            {/* ПРАВАЯ СТОРОНА: КУБИКИ */}
            <div className="flex flex-col gap-4">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider px-1">2. Знайди Кубик</span>
              <div className="flex flex-col gap-4">
                {shuffledItems.map((item) => {
                  const isMatched = matchedIds.includes(item.id);
                  return (
                    <div key={item.id} className="h-20 relative">
                      {!isMatched ? (
                        <button 
                          onClick={() => handleEmojiCubeTap(item)}
                          disabled={!selectedWordId}
                          className={`w-full h-full flex items-center justify-center text-4xl rounded-r-3xl border-2 border-l-0 transition-all relative ${
                            selectedWordId 
                              ? 'border-slate-700 bg-slate-800/60 hover:bg-slate-700 active:scale-95 cursor-pointer shadow-md' 
                              : 'border-slate-800/40 bg-slate-800/10 opacity-30 cursor-not-allowed'
                          }`}
                        >
                          <div className="absolute left-[-13px] top-1/2 transform -translate-y-1/2 w-6 h-6 rounded-full bg-[#0f172a] border-r-2 border-transparent z-10" />
                          <span className="z-20">{item.emoji}</span>
                        </button>
                      ) : (
                        <div className="w-full h-full opacity-0" />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

          </div>

          {/* СПАЙДИ-МОДАЛ ПОСЛЕ ПАЗЛА */}
          {isPuzzleComplete && (
            <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex flex-col items-center justify-center z-50 p-6 animate-fadeIn">
              <div className="bg-slate-900 border-2 border-red-500/40 rounded-3xl p-10 max-w-sm w-full flex flex-col items-center shadow-2xl relative overflow-hidden">
                <div className="absolute inset-0 opacity-5 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]" />
                
                <div className="w-44 h-44 flex items-center justify-center mb-6 relative z-10">
                  <img 
                    src="/spidey.png" 
                    alt="Spidey Cartoon Hero" 
                    className="w-full h-full object-contain animate-bounce select-none pointer-events-none drop-shadow-[0_15px_20px_rgba(239,68,68,0.4)]"
                  />
                </div>

                <h2 className="text-3xl font-black text-center text-white uppercase tracking-wide mb-1 relative z-10">
                  Чудово! 🎮
                </h2>
                <p className="text-base font-semibold text-green-400 text-center mb-8 relative z-10">
                  Пазл повністю зібрано!
                </p>

                <button 
                  onClick={() => setGameState('SPEAKING')} 
                  className="w-full bg-gradient-to-r from-red-600 to-blue-600 hover:from-red-500 hover:to-blue-500 text-white font-extrabold py-4 px-6 rounded-2xl shadow-xl shadow-blue-600/40 transition-all transform active:scale-95 text-center uppercase tracking-wider text-base relative z-10"
                >
                  Далі →
                </button>
              </div>
            </div>
          )}

        </div>
      )}

      {/* КИТ-КОНТУР 4: МОДУЛЬ ПРОВЕРКИ ВИМОВИ */}
      {gameState === 'SPEAKING' && activeCategory !== null && (() => {
        const currentItem = categories[activeCategory].items[speakingIndex];
        return (
          <div className="w-full max-w-2xl flex flex-col items-center animate-fadeIn px-4 z-10">
            
            <div className="w-full flex justify-between items-center mb-8">
              <h2 className="text-xl font-bold text-slate-400 flex items-center gap-2">
                <span>🎙️</span> Вимова: {categories[activeCategory].name} ({speakingIndex + 1}/{categories[activeCategory].items.length})
              </h2>
              <button 
                onClick={handleExitToMenu} 
                className="bg-slate-800 hover:bg-slate-700 text-sm font-semibold px-5 py-2 rounded-xl border border-slate-700 active:scale-95 transition-all text-red-400 hover:border-red-500/30"
              >
                ← В Меню
              </button>
            </div>

            <div className={`w-full max-w-md bg-slate-800/40 border-2 rounded-3xl p-8 flex flex-col items-center relative shadow-2xl transition-all ${
              speakingFeedback === 'correct' ? 'border-green-500 bg-green-500/5 shadow-green-500/5' :
              speakingFeedback === 'wrong' ? 'border-red-500 bg-red-500/5 animate-shake' : 'border-slate-700'
            }`}>
              
              <span className="text-9xl mb-6 filter drop-shadow-md select-none animate-fadeIn">{currentItem.emoji}</span>
              
              <h3 className="text-4xl font-black tracking-wide text-white mb-2 uppercase">{currentItem.word}</h3>
              <p className="text-base text-slate-400 font-medium tracking-wide mb-6">{currentItem.translation}</p>

              <button 
                onClick={() => speak(currentItem.word, 'en-US')}
                className="bg-amber-400 hover:bg-amber-300 text-slate-900 font-black px-6 py-3.5 rounded-2xl flex items-center gap-2 text-sm shadow-xl shadow-amber-500/10 transition-all transform active:scale-95 border-b-4 border-amber-600 active:border-b-0"
              >
                <span className="text-base">➔</span> 🔊 СЛУХАТИ
              </button>

              {speakingFeedback === 'correct' && (
                <div className="absolute inset-0 bg-slate-950/90 rounded-3xl flex flex-col items-center justify-center animate-scaleIn">
                  <span className="text-6xl mb-2">✅</span>
                  <span className="text-xl font-black text-green-400 uppercase tracking-wider">Супер! Вірно!</span>
                </div>
              )}
              
              {speakingFeedback === 'wrong' && (
                <div className="absolute bottom-4 bg-red-500/20 border border-red-500/40 px-4 py-2 rounded-xl animate-scaleIn">
                  <span className="text-xs font-bold text-red-400">❌ Спробуй ще раз</span>
                </div>
              )}
            </div>

            <div className="mt-10 flex flex-col items-center gap-3">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Затисни та говори</span>
              
              <button
                onMouseDown={(e) => { e.preventDefault(); startSpeechRecognition(); }}
                onMouseUp={(e) => { e.preventDefault(); stopSpeechRecognition(); }}
                onMouseLeave={(e) => { e.preventDefault(); stopSpeechRecognition(); }}
                onTouchStart={(e) => { e.preventDefault(); startSpeechRecognition(); }}
                onTouchEnd={(e) => { e.preventDefault(); stopSpeechRecognition(); }}
                className={`w-28 h-28 rounded-full flex items-center justify-center border-4 select-none transition-all shadow-2xl relative transform active:scale-90 ${
                  isListening 
                    ? 'bg-red-600 border-red-400 shadow-red-600/30 cursor-grabbing' 
                    : 'bg-indigo-600 border-slate-700 hover:bg-indigo-500 cursor-pointer shadow-indigo-600/20'
                }`}
              >
                {isListening && (
                  <span className="absolute inset-0 rounded-full border-4 border-red-400 animate-ping opacity-75 pointer-events-none" />
                )}
                <span className="text-4xl select-none">{isListening ? '🛑' : '🎙️'}</span>
              </button>
            </div>

            {/* СПАЙДИ-МОДАЛ ПОЛНОГО ЗАВЕРШЕНИЯ КАТЕГОРИИ */}
            {speakingFeedback === 'complete' && (
              <div className="fixed inset-0 bg-black/95 backdrop-blur-md flex flex-col items-center justify-center z-50 p-6 animate-fadeIn">
                <div className="bg-slate-900 border-2 border-indigo-500/40 rounded-3xl p-10 max-w-sm w-full flex flex-col items-center shadow-2xl relative overflow-hidden">
                  <div className="absolute inset-0 opacity-5 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]" />
                  
                  <div className="w-48 h-48 flex items-center justify-center mb-6 relative z-10">
                    <img 
                      src="/spidey.png" 
                      alt="Spidey Victory Hero" 
                      className="w-full h-full object-contain animate-bounce select-none pointer-events-none drop-shadow-[0_20px_25px_rgba(239,68,68,0.5)]"
                    />
                  </div>

                  <h2 className="text-3xl font-black text-center text-white uppercase tracking-wide mb-1 relative z-10">
                    ТИ СУПЕРГЕРОЙ! 🏆
                  </h2>
                  <p className="text-sm font-semibold text-indigo-400 text-center mb-8 relative z-10">
                    Усі слова вивчено на відмінно!
                  </p>

                  <button 
                    onClick={handleExitToMenu} 
                    className="w-full bg-gradient-to-r from-red-600 to-blue-600 hover:from-red-500 hover:to-blue-500 text-white font-extrabold py-4 px-6 rounded-2xl shadow-xl shadow-blue-600/40 transition-all transform active:scale-95 text-center uppercase tracking-wider text-base relative z-10"
                  >
                    В Головне Меню
                  </button>
                </div>
              </div>
            )}

          </div>
        );
      })()}

    </div>
  );
}
