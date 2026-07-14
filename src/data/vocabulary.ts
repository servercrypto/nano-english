export interface WordItem {
  id: string;
  word: string;
  translation: string;
  emoji: string;
  image?: string;
}

export const categories: Record<string, { name: string; icon: string; items: WordItem[] }> = {
  food: {
    name: "Їжа",
    icon: "🍎",
    items: [
      { id: "f1", word: "Bread", translation: "Хліб", emoji: "🍞" },
      { id: "f2", word: "Milk", translation: "Молоко", emoji: "🥛" },
      { id: "f3", word: "Cheese", translation: "Сир", emoji: "🧀" },
      { id: "f4", word: "Juice", translation: "Сік", emoji: "🧃" },
      { id: "f5", word: "Butter", translation: "Масло", emoji: "🧈" },
      { id: "f6", word: "Eggs", translation: "Яйця", emoji: "🥚" }
    ]
  },
  sea: {
    name: "Море",
    icon: "🐬",
    items: [
      { id: "s1", word: "Shark", translation: "Акула", emoji: "🦈" },
      { id: "s2", word: "Octopus", translation: "Восьминіг", emoji: "🐙" },
      { id: "s3", word: "Wave", translation: "Хвиля", emoji: "🌊" },
      { id: "s4", word: "Island", translation: "Острів", emoji: "🏝️" },
      { id: "s5", word: "Swim", translation: "Плавати", emoji: "🏊" },
      { id: "s6", word: "Sunbathe", translation: "Засмагати", emoji: "🏖️" }
    ]
  },
  actions: {
    name: "Дія",
    icon: "🏃",
    items: [
      { id: "a1", word: "Hug", translation: "Обіймати", emoji: "🤗", image: "/images/actions/Hug.png" },
      { id: "a2", word: "Drive", translation: "Водити", emoji: "🚗", image: "/images/actions/Drive.png" },
      { id: "a3", word: "Sing", translation: "Співати", emoji: "🎤", image: "/images/actions/Sing.png" },
      { id: "a4", word: "Read", translation: "Читати", emoji: "📖", image: "/images/actions/Read.PNG" },
      { id: "a5", word: "Drink", translation: "Пити", emoji: "🥛", image: "/images/actions/Drink.png" },
      { id: "a6", word: "Play", translation: "Грати", emoji: "🧸", image: "/images/actions/Play.png" }
    ]
  }
};
