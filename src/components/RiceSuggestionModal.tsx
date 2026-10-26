import React from 'react';
import { X, Check, Plus, Sparkles } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useLanguage } from '../context/LanguageContext';
import { categories, type MenuItem } from '../data/menu';

export const RiceSuggestionModal: React.FC = () => {
  const { isRiceSuggestionOpen, setIsRiceSuggestionOpen, cartItems, addItem } = useCart();
  const { t, dishName } = useLanguage();

  if (!isRiceSuggestionOpen) return null;

  // Retrieve exact existing dishes from "meals-sides" category
  const mealsSidesCategory = categories.find((c) => c.id === 'meals-sides');

  const sambarItem = mealsSidesCategory?.items.find(
    (i) => i.id === 'ms3' || i.name.toLowerCase() === 'sambar'
  );
  const vathaKuzhambuItem = mealsSidesCategory?.items.find(
    (i) => i.id === 'ms4' || i.name.toLowerCase() === 'vatha kuzhambu'
  );
  const tomatoRasamItem = mealsSidesCategory?.items.find(
    (i) => i.id === 'ms5' || i.name.toLowerCase() === 'tomato rasam'
  );
  const buttermilkItem = mealsSidesCategory?.items.find(
    (i) => i.id === 'ms9' || i.name.toLowerCase() === 'buttermilk'
  );

  // Represent the 4 specific required dishes using existing data
  const suggestedList: { key: string; item: MenuItem; fallbackName: string }[] = [];

  if (sambarItem) {
    suggestedList.push({
      key: 'sambar',
      item: sambarItem,
      fallbackName: 'Sambar',
    });
  }

  if (vathaKuzhambuItem) {
    suggestedList.push({
      key: 'vatha-kuzhambu',
      item: vathaKuzhambuItem,
      fallbackName: 'Vatha Kuzhambu',
    });
  }

  if (tomatoRasamItem) {
    suggestedList.push({
      key: 'rasam',
      item: { ...tomatoRasamItem, name: 'Rasam' },
      fallbackName: 'Rasam',
    });
  }

  if (buttermilkItem) {
    suggestedList.push({
      key: 'buttermilk',
      item: buttermilkItem,
      fallbackName: 'Buttermilk',
    });
  }

  // Check if each suggested dish is already in the cart
  const isDishAdded = (fallbackName: string, item: MenuItem) => {
    return cartItems.some(
      (c) =>
        c.id === item.id ||
        c.name.toLowerCase() === fallbackName.toLowerCase() ||
        c.name.toLowerCase() === item.name.toLowerCase() ||
        (fallbackName === 'Rasam' && c.name.toLowerCase().includes('rasam'))
    );
  };

  const handleAdd = (dish: MenuItem) => {
    addItem(dish);
  };

  const handleClose = () => {
    setIsRiceSuggestionOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity"
        onClick={handleClose}
      />

      <div className="min-h-full flex items-center justify-center p-4">
        {/* Modal Card */}
        <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-5 sm:p-6 overflow-hidden border border-slate-100 z-10 animate-in fade-in zoom-in-95 duration-200">
          {/* Header */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-green-50 text-green-700 border border-green-200">
                <Check size={12} className="stroke-[3]" /> {t.riceAdded}
              </span>
            </div>
            <button
              onClick={handleClose}
              className="text-slate-400 hover:text-slate-700 p-1 rounded-full hover:bg-slate-100 transition-colors"
              aria-label="Close suggestions"
            >
              <X size={18} />
            </button>
          </div>

          <div className="mb-4">
            <div className="flex items-center gap-2">
              <Sparkles size={18} className="text-primary" />
              <h3 className="text-xl font-bold text-blue-950">{t.suggestedWithRice}</h3>
            </div>
            <p className="text-xs text-blue-800/80 mt-1 font-medium">
              {t.riceSubtitle}
            </p>
          </div>

          {/* Dish List */}
          <div className="space-y-2.5 mb-5">
            {suggestedList.map(({ key, item, fallbackName }) => {
              const added = isDishAdded(fallbackName, item);
              const displayName = dishName(item.id, item.name);
              
              return (
                <div
                  key={key}
                  className="bg-blue-50/40 border border-blue-100 hover:border-blue-200 rounded-xl p-3 flex items-center justify-between gap-3 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={item.image}
                      alt={displayName}
                      className="w-12 h-12 rounded-lg object-cover flex-shrink-0 border border-blue-200"
                      loading="lazy"
                    />
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-blue-900 truncate">{displayName}</p>
                      <p className="text-[11px] text-blue-700/80 font-medium">{t.traditionalSide}</p>
                    </div>
                  </div>

                  <button
                    onClick={() => handleAdd(item)}
                    disabled={added}
                    className={`flex-shrink-0 flex items-center justify-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      added
                        ? 'bg-green-100 text-green-800 border border-green-200 cursor-default'
                        : 'bg-white text-blue-700 border border-blue-200 hover:border-blue-400 hover:bg-blue-50 hover:text-blue-900 active:scale-95 shadow-xs cursor-pointer'
                    }`}
                  >
                    {added ? (
                      <>
                        <Check size={14} className="stroke-[2.5]" /> {t.added}
                      </>
                    ) : (
                      <>
                        <Plus size={14} /> {t.add}
                      </>
                    )}
                  </button>
                </div>
              );
            })}
          </div>

          {/* Footer Actions */}
          <div className="flex flex-col gap-2">
            <button
              onClick={handleClose}
              className="w-full bg-[#0966CC] hover:bg-[#123B75] text-white py-3 rounded-xl font-semibold text-sm transition-all shadow-md hover:shadow-lg cursor-pointer border border-blue-600/30"
            >
              {t.continue}
            </button>
            <button
              onClick={handleClose}
              className="w-full text-center text-xs text-slate-500 hover:text-slate-800 py-1 transition-colors cursor-pointer"
            >
              {t.skip}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

