"use client";

import { useState } from "react";
import { vocabulary, WordItem } from "../data/vocabulary";
import { speak } from "../utils/audio";

export default function GamePage() {
  const [activeCategory, setActiveCategory] = useState<"food" | "sea">("food");
  const [activeCard, setActiveCard] = useState<string | null>(null);

  const filteredVocabulary = vocabulary.filter(
    (item) => item.category === activeCategory
  );

  const handleCardTap = (item: WordItem) => {
    // Триггер анимации нажатия
    setActiveCard(item.id);
    setTimeout(() => setActiveCard(null), 150);

    // Нативная озвучка: Сначала английский, через небольшую паузу — украинский
    speak(item.en, "en-US");
    setTimeout(() => {
      speak(item.ua, "uk-UA");
    }, 1200);
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-900 via-indigo-950 to-slate-950 text-slate-100 p-6 flex flex-col items-center">
      {/* Шапка */}
      <header className="w-full max-w-4xl text-center my-6">
        <h1 className="text-4xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-fuchsia-500 drop-shadow-sm">
          Nano English · Тап-Тап
        </h1>
        <p className="text-slate-400 text-sm mt-2 font-mono">
          [ mode: host_optimization / audio: web_speech_api ]
        </p>
      </header>

      {/* Селектор категорий */}
      <div className="flex gap-4 p-1.5 bg-slate-800/60 backdrop-blur-md rounded-2xl border border-slate-700/50 mb-10 w-full max-w-md shadow-lg">
        <button
          onClick={() => setActiveCategory("food")}
          className={`flex-1 py-3 px-6 rounded-xl font-bold text-sm transition-all duration-200 flex items-center justify-center gap-2 ${
            activeCategory === "food"
              ? "bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md scale-[1.02]"
              : "text-slate-400 hover:text-slate-200 hover:bg-slate-700/30"
          }`}
        >
          <span>🍎</span> Еда / Food
        </button>
        <button
          onClick={() => setActiveCategory("sea")}
          className={`flex-1 py-3 px-6 rounded-xl font-bold text-sm transition-all duration-200 flex items-center justify-center gap-2 ${
            activeCategory === "sea"
              ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md scale-[1.02]"
              : "text-slate-400 hover:text-slate-200 hover:bg-slate-700/30"
          }`}
        >
          <span>🌊</span> Море / Sea
        </button>
      </div>

      {/* Игровая сетка */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 w-full max-w-4xl px-2">
        {filteredVocabulary.map((item) => (
          <button
            key={item.id}
            onClick={() => handleCardTap(item)}
            className={`relative overflow-hidden aspect-square bg-slate-800/40 backdrop-blur-sm border border-slate-700/60 rounded-3xl p-6 flex flex-col items-center justify-between transition-all duration-150 cursor-pointer select-none group text-center outline-none ${
              activeCard === item.id
                ? "scale-95 bg-slate-700/60 border-cyan-500"
                : "hover:border-slate-500/80 hover:bg-slate-800/80 hover:-translate-y-1 shadow-md hover:shadow-cyan-950/20"
            }`}
          >
            {/* Эмодзи элемент */}
            <div className="text-6xl my-auto filter drop-shadow-md group-hover:scale-110 transition-transform duration-200">
              {item.emoji}
            </div>

            {/* Языковой блок */}
            <div className="w-full mt-auto space-y-1">
              <p className="text-xl font-black tracking-wide text-white font-sans group-hover:text-cyan-300 transition-colors">
                {item.en}
              </p>
              <p className="text-sm font-semibold text-slate-400">
                {item.ua}
              </p>
            </div>
          </button>
        ))}
      </div>
    </main>
  );
}
