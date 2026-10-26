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
      // Offset for sticky header (h-14 to h-18) + sticky nav (~55px)
      const y = element.getBoundingClientRect().top + window.scrollY - 130;
      window.scrollTo({ top: Math.max(0, y), behavior: 'smooth' });
    }
  };

  return (
    <div className="sticky top-14 sm:top-16 md:top-18 z-40 w-full bg-white/95 backdrop-blur-md border-b border-[#DCE8F5] py-2.5 sm:py-3 shadow-2xs">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2 sm:gap-2.5 overflow-x-auto hide-scrollbar scroll-smooth py-0.5">
          {categories.map((cat) => {
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => scrollToCategory(cat.id)}
                className={cn(
                  'whitespace-nowrap px-4 sm:px-5 py-2 rounded-full text-xs sm:text-sm transition-all duration-150 border cursor-pointer select-none',
                  isActive
                    ? 'bg-[#0966CC] text-white border-[#0966CC] shadow-xs font-semibold scale-[1.02]'
                    : 'bg-white text-[#0966CC] border-[#DCE8F5] hover:bg-[#EFF6FF] hover:border-[#3B82F6] font-medium'
                )}
              >
                {categoryName(cat.id, cat.name)}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
