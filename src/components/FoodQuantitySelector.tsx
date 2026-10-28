import React, { useState } from 'react';
import { Plus, Pencil, Trash2, X, Check } from 'lucide-react';
import { useCart, type FoodQuantity } from '../context/CartContext';
import { useLanguage } from '../context/LanguageContext';

export const FoodQuantitySelector: React.FC = () => {
  const { cartItems, foodQuantities, addFoodQuantity, updateFoodQuantity, removeFoodQuantity } = useCart();
  const { t, dishName } = useLanguage();

  const [activeInputId, setActiveInputId] = useState<string | null>(null);
  const [quantityInput, setQuantityInput] = useState('');
  const [error, setError] = useState('');

  if (cartItems.length === 0) return null;

  function handleAdd(dishId: string, name: string) {
    setError('');
    const qty = parseFloat(quantityInput);
    if (isNaN(qty) || quantityInput.trim() === '') { setError(t.validationInvalidKg); return; }
    if (qty <= 0) { setError(t.validationZeroKg); return; }

    const fq: FoodQuantity = {
      dishId,
      dishName: name, // canonical English name
      quantity: Math.round(qty * 1000) / 1000,
      unit: 'kg',
    };
    addFoodQuantity(fq);
    setActiveInputId(null);
    setQuantityInput('');
  }

  function handleSaveEdit(dishId: string) {
    setError('');
    const qty = parseFloat(quantityInput);
    if (isNaN(qty) || quantityInput.trim() === '') { setError(t.validationInvalidKg); return; }
    if (qty <= 0) { setError(t.validationZeroKg); return; }
    updateFoodQuantity(dishId, Math.round(qty * 1000) / 1000);
    setActiveInputId(null);
    setQuantityInput('');
  }

  function startEdit(fq: FoodQuantity) {
    setActiveInputId(fq.dishId);
    setQuantityInput(String(fq.quantity));
    setError('');
  }

  function startAdd(dishId: string) {
    setActiveInputId(dishId);
    setQuantityInput('');
    setError('');
  }

  return (
    <section className="space-y-3">
      <h3 className="text-sm font-semibold text-slate-900">{t.foodQuantityTitle}</h3>
      
      <div className="space-y-2">
        {cartItems.map((item) => {
          const fq = foodQuantities.find((q) => q.dishId === item.id);
          const isEditing = activeInputId === item.id;
          const displayNm = dishName(item.id, item.name);

          // State 1: Editing / Adding Mode
          if (isEditing) {
            return (
              <div key={item.id} className="border border-orange-300 rounded-xl p-3 bg-orange-50/60 space-y-2">
                <p className="text-sm font-semibold text-slate-900">{displayNm}</p>
                <div className="flex gap-2">
                  <input
                    type="number"
                    min="0.001"
                    step="0.001"
                    value={quantityInput}
                    onChange={(e) => { setQuantityInput(e.target.value); setError(''); }}
                    className="w-24 px-2.5 py-1.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary bg-white"
                    placeholder={t.enterQuantityKg}
                    autoFocus
                  />
                  <span className="text-sm text-slate-700 self-center whitespace-nowrap font-medium">{t.kgUnit}</span>
                  <div className="flex gap-1 ml-auto">
                    <button
                      onClick={() => fq ? handleSaveEdit(item.id) : handleAdd(item.id, item.name)}
                      className="px-3 py-1.5 bg-primary hover:bg-[#c2410c] text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1 shadow-2xs"
                    >
                      {fq ? <Check size={14} /> : t.addQuantity}
                    </button>
                    <button
                      onClick={() => { setActiveInputId(null); setQuantityInput(''); setError(''); }}
                      className="px-3 py-1.5 bg-slate-100 text-slate-600 rounded-lg text-xs font-semibold hover:bg-slate-200 transition-colors cursor-pointer"
                    >
                      <X size={14} />
                    </button>
                  </div>
                </div>
                {error && <p className="text-red-500 text-xs font-medium">{error}</p>}
              </div>
            );
          }

          // State 2: Has Quantity
          if (fq) {
            return (
              <div key={item.id} className="flex items-center justify-between gap-2 py-2 px-3 bg-orange-50/50 rounded-xl border border-orange-200/70">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-900 truncate">{displayNm}</p>
                  <p className="text-xs text-primary font-bold">{fq.quantity} {t.kgUnit}</p>
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => startEdit(fq)}
                    aria-label={`Edit ${displayNm}`}
                    className="p-1.5 text-primary hover:text-[#c2410c] hover:bg-orange-100/70 rounded-lg transition-colors cursor-pointer"
                  >
                    <Pencil size={13} />
                  </button>
                  <button
                    onClick={() => removeFoodQuantity(item.id)}
                    aria-label={`Remove ${displayNm}`}
                    className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            );
          }

          // State 3: No Quantity, show "Add Quantity" button
          return (
            <div key={item.id} className="flex items-center justify-between gap-2 py-2 px-3 border border-dashed border-slate-200 rounded-xl hover:border-orange-300 transition-colors">
              <p className="text-sm font-medium text-slate-800 truncate flex-1">{displayNm}</p>
              <button
                onClick={() => startAdd(item.id)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-primary hover:bg-orange-50 transition-colors cursor-pointer whitespace-nowrap"
              >
                <Plus size={14} />
                {t.addFoodQuantity}
              </button>
            </div>
          );
        })}
      </div>
    </section>
  );
};
