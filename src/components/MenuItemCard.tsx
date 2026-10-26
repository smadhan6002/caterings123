import React from 'react';
import type { MenuItem } from '../data/menu';
import { useCart } from '../context/CartContext';
import { useLanguage } from '../context/LanguageContext';
import { Check, Plus } from 'lucide-react';

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
    <div className="bg-white rounded-2xl overflow-hidden shadow-xs hover:shadow-md border border-[#DCE8F5] hover:border-blue-300 transition-all duration-200 flex flex-col group">
      {/* Dish Image */}
      <div className="relative w-full aspect-[4/3] bg-slate-100 overflow-hidden">
        <img
          src={item.image}
          alt={displayName}
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          loading="lazy"
        />
      </div>

      {/* Dish Card Content */}
      <div className="p-3 sm:p-4 flex flex-col justify-between flex-1 gap-2.5">
        <h3 className="font-bold text-[#123B75] text-xs sm:text-sm line-clamp-2 leading-snug min-h-[2rem] sm:min-h-[2.5rem]">
          {displayName}
        </h3>

        <button
          onClick={handleAdd}
          disabled={isAdded}
          className={`w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-150 ${
            isAdded
              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-2xs cursor-default'
              : 'bg-[#0966CC] hover:bg-[#123B75] text-white border border-blue-600/30 shadow-xs hover:shadow-md cursor-pointer active:scale-[0.98]'
          }`}
        >
          {isAdded ? (
            <>
              <Check size={15} className="stroke-[2.5]" />
              <span>{t.added}</span>
            </>
          ) : (
            <>
              <Plus size={15} className="stroke-[2.5]" />
              <span>{t.add}</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
