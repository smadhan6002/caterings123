import React from 'react';
import { ShoppingCart } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useLanguage } from '../context/LanguageContext';

export const CartActionBar: React.FC = () => {
  const { totalItems, setIsCartDrawerOpen } = useCart();
  const { t } = useLanguage();

  if (totalItems === 0) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 p-3 sm:p-4 z-50 bg-gradient-to-t from-white via-white/80 to-transparent pointer-events-none pb-safe">
      <div className="max-w-md mx-auto flex justify-center pointer-events-auto">
        <button
          onClick={() => setIsCartDrawerOpen(true)}
          className="w-full bg-[#0966CC] hover:bg-[#123B75] text-white py-3.5 px-6 rounded-2xl font-bold text-sm sm:text-base flex items-center justify-center gap-2.5 shadow-xl shadow-blue-900/30 transition-all duration-150 hover:scale-[1.01] active:scale-[0.98] cursor-pointer border border-blue-500/30"
        >
          <ShoppingCart size={20} className="stroke-[2.5]" />
          <span>{t.viewCart}</span>
          <span className="bg-white/20 text-white text-xs px-2 py-0.5 rounded-full font-bold ml-1">
            {totalItems}
          </span>
        </button>
      </div>
    </div>
  );
};
