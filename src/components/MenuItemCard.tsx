import React from 'react';
import type { MenuItem } from '../data/menu';
import { useCart } from '../context/CartContext';
import { useLanguage } from '../context/LanguageContext';
import { Check } from 'lucide-react';

interface MenuItemCardProps {
  item: MenuItem;
}

export const MenuItemCard: React.FC<MenuItemCardProps> = ({ item }) => {
  const { cartItems, addItem } = useCart();
  const { dishName, t } = useLanguage();
  
  const isAdded = cartItems.some((i) => i.id === item.id);

  const handleAdd = () => {
    if (!isAdded) {
      addItem(item);
    }
  };

  const displayName = dishName(item.id, item.name);

  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 transition-all hover:shadow-md">
      {/* Image */}
      <div className="relative w-full aspect-video">
        <img 
          src={item.image} 
          alt={displayName} 
          className="absolute inset-0 w-full h-full object-cover"
          loading="lazy"
        />
      </div>
      
      {/* Content */}
      <div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <h3 className="font-semibold text-blue-900 flex-1 line-clamp-2">{displayName}</h3>
        <button
          onClick={handleAdd}
          disabled={isAdded}
          className={`flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold transition-colors border ${
            isAdded
              ? 'bg-green-50 text-green-700 border-green-200 cursor-default'
              : 'bg-white text-blue-700 border-blue-200 hover:bg-blue-50 hover:text-blue-900 hover:border-blue-300'
          }`}
        >
          {isAdded ? (
            <>
              <Check size={16} /> {t.added}
            </>
          ) : (
            t.add
          )}
        </button>
      </div>
    </div>
  );
};

