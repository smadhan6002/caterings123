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
    <section id={`category-${category.id}`} className="py-8 scroll-mt-24">
      <h2 className="text-2xl font-bold text-blue-950 mb-6">{categoryName(category.id, category.name)}</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {dishes.map((item) => (
          <MenuItemCard key={item.id} item={item} />
        ))}
      </div>
    </section>
  );
};
