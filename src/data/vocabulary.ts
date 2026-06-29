export interface WordItem {
  id: string;
  category: 'food' | 'sea';
  en: string;
  ua: string;
  emoji: string;
}
export const vocabulary: WordItem[] = [
  { id: 'bread', category: 'food', en: 'Bread', ua: 'Хліб', emoji: '🍞' },
  { id: 'juice', category: 'food', en: 'Juice', ua: 'Сік', emoji: '🧃' },
  { id: 'cheese', category: 'food', en: 'Cheese', ua: 'Сир', emoji: '🧀' },
  { id: 'butter', category: 'food', en: 'Butter', ua: 'Масло', emoji: '🧈' },
  { id: 'milk', category: 'food', en: 'Milk', ua: 'Молоко', emoji: '🥛' },
  { id: 'eggs', category: 'food', en: 'Eggs', ua: 'Яйця', emoji: '🥚' },
  { id: 'sunbathe', category: 'sea', en: 'Sunbathe', ua: 'Засмагати', emoji: '🏖️' },
  { id: 'octopus', category: 'sea', en: 'Octopus', ua: 'Восьминіг', emoji: '🐙' },
  { id: 'shark', category: 'sea', en: 'Shark', ua: 'Акула', emoji: '🦈' },
  { id: 'island', category: 'sea', en: 'Island', ua: 'Острів', emoji: '🏝️' },
  { id: 'swim', category: 'sea', en: 'Swim', ua: 'Плавати', emoji: '🏊' },
  { id: 'wave', category: 'sea', en: 'Wave', ua: 'Хвиля', emoji: '🌊' }
];
