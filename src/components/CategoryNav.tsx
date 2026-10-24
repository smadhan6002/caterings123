import React from 'react';
import type { Category } from '../data/menu';
import { cn } from './ui/Button';
import { useLanguage } from '../context/LanguageContext';

interface CategoryNavProps {
  categories: Category[];
  activeCategory: string;
}

export const CategoryNav: React.FC<CategoryNavProps> = ({ categories, activeCategory }) => {
  const { categoryName } = useLanguage();

  const scrollToCategory = (id: string) => {
    const element = document.getElementById(`category-${id}`);
    if (element) {
      // Offset for sticky nav
      const y = element.getBoundingClientRect().top + window.scrollY - 100;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  return (
    <div className="sticky top-0 z-40 w-full bg-slate-50/90 backdrop-blur-md border-b border-gray-200 py-4">
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 overflow-x-auto hide-scrollbar">
        <div className="flex items-center gap-3">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => scrollToCategory(cat.id)}
              className={cn(
                "whitespace-nowrap px-5 py-2 rounded-full text-sm font-medium transition-colors border",
                activeCategory === cat.id
                  ? "bg-primary text-white border-primary shadow-sm"
                  : "bg-white text-blue-900 border-blue-200/80 hover:bg-blue-50/80 font-medium"
              )}
            >
              {categoryName(cat.id, cat.name)}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

