import React, { useState, useEffect } from 'react';
import type { Category, MenuItem } from '../data/menu';
import { MenuItemCard } from './MenuItemCard';
import { dishService } from '../services/dishService';
import { useLanguage } from '../context/LanguageContext';

interface MenuSectionProps {
  category: Category;
}

export const MenuSection: React.FC<MenuSectionProps> = ({ category }) => {
  const [dishes, setDishes] = useState<MenuItem[]>([]);
  const { categoryName } = useLanguage();

  useEffect(() => {
    // Read live active dishes from unified dish catalogue
    const active = dishService.getActiveDishes(category.id).map((d) => ({
      id: d.id,
      name: d.name,
      categoryId: d.categoryId,
      image: d.image,
    }));
    setDishes(active);
  }, [category.id]);

  if (dishes.length === 0) {
    return null;
  }

  return (
    <section id={`category-${category.id}`} className="py-6 sm:py-8 scroll-mt-28 sm:scroll-mt-32">
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <h2 className="text-xl sm:text-2xl font-bold text-[#123B75] tracking-tight">
          {categoryName(category.id, category.name)}
        </h2>
        <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-[#EFF6FF] text-[#0966CC] border border-[#DCE8F5]">
          {dishes.length}
        </span>
      </div>

      {/* Responsive Grid: 1 col on <340px, 2 cols on mobile (340px-639px), 3 cols on tablet, 4 cols on desktop */}
      <div className="grid grid-cols-1 min-[340px]:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
        {dishes.map((item) => (
          <MenuItemCard key={item.id} item={item} />
        ))}
      </div>
    </section>
  );
};
