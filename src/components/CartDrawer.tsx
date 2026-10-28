import React, { useState } from 'react';
import { X, Check } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useLanguage } from '../context/LanguageContext';
import { GuestCountSelector } from './GuestCountSelector';
import { FoodQuantitySelector } from './FoodQuantitySelector';
import { InquiryFormModal } from './InquiryFormModal';

export const CartDrawer: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const {
    cartItems,
    isCartDrawerOpen,
    setIsCartDrawerOpen,
    removeItem,
    guestCount,
    foodQuantities,
  } = useCart();
  const { t, dishName, categoryName } = useLanguage();

  if (!isCartDrawerOpen) return null;

  // Group items by categoryId
  const groupedItems = cartItems.reduce((acc, item) => {
    if (!acc[item.categoryId]) {
      acc[item.categoryId] = [];
    }
    acc[item.categoryId].push(item);
    return acc;
  }, {} as Record<string, typeof cartItems>);

  const handleSendInquiry = () => {
    if (cartItems.length === 0) {
      setErrorMsg(t.pleaseAddDish);
      return;
    }
    const hasGuestCount = guestCount !== null && guestCount > 0;
    const hasFoodQuantity = foodQuantities.length > 0 && foodQuantities.some((fq) => fq.quantity > 0);

    if (!hasGuestCount && !hasFoodQuantity) {
      setErrorMsg(t.pleaseSelectPeople);
      return;
    }
    setErrorMsg('');
    setIsModalOpen(true);
  };

  return (
    <>
      <div className="fixed inset-0 z-50 overflow-hidden">
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
          onClick={() => setIsCartDrawerOpen(false)}
        />

        {/* Drawer */}
        <div className="absolute inset-y-0 right-0 w-full max-w-md bg-white shadow-2xl flex flex-col transform transition-transform duration-300">
          {/* Header */}
          <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-200 bg-white">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">{t.yourSelection}</h2>
            <button
              onClick={() => setIsCartDrawerOpen(false)}
              className="w-9 h-9 flex items-center justify-center rounded-full border border-slate-200 text-slate-600 hover:bg-orange-50 hover:text-primary transition-colors cursor-pointer"
              aria-label="Close cart"
            >
              <X size={18} />
            </button>
          </div>

          {/* Scrollable Content with ample bottom padding so nothing is hidden by fixed footer */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 pb-36">
            {/* Guest Count */}
            <section className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs">
              <h3 className="text-sm font-bold text-slate-900 mb-3">{t.numberOfPeople}</h3>
              <GuestCountSelector />
            </section>

            {/* Food Quantity (kg) Section */}
            <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs">
              <FoodQuantitySelector />
            </div>

            {/* Selected Items */}
            {Object.keys(groupedItems).length > 0 && (
              <section className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs">
                <h3 className="text-sm font-bold text-slate-900 mb-3">{t.selectedDishes}</h3>
                {Object.entries(groupedItems).map(([categoryId, items]) => (
                  <div key={categoryId} className="mb-4 last:mb-0">
                    <h4 className="text-xs font-bold text-primary tracking-wider uppercase mb-2">
                      {categoryName(categoryId, categoryId)}
                    </h4>
                    <div className="space-y-2">
                      {items.map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center justify-between gap-3 py-2 border-b border-slate-100 last:border-0"
                        >
                          <div className="flex items-center gap-2.5 flex-1 min-w-0">
                            <Check size={16} className="text-emerald-600 flex-shrink-0" />
                            <span className="text-slate-800 text-xs sm:text-sm font-semibold truncate">
                              {dishName(item.id, item.name)}
                            </span>
                          </div>
                          <button
                            onClick={() => removeItem(item.id)}
                            className="text-red-500 hover:text-red-700 text-xs font-semibold px-2 py-1 rounded-lg hover:bg-red-50 transition-colors cursor-pointer flex-shrink-0"
                            aria-label={`Remove ${dishName(item.id, item.name)}`}
                          >
                            {t.remove}
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </section>
            )}

            {cartItems.length === 0 && (
              <div className="text-center py-12 text-slate-400 font-medium text-sm">
                {t.emptyCart}
              </div>
            )}
          </div>

          {/* Sticky Bottom Actions */}
          <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-5 border-t border-slate-200 bg-white/95 backdrop-blur-md shadow-lg">
            {errorMsg && (
              <p className="text-red-600 bg-red-50 border border-red-200 text-xs sm:text-sm mb-3 py-2 px-3 rounded-xl text-center font-semibold">
                {errorMsg}
              </p>
            )}
            <button
              onClick={handleSendInquiry}
              className="w-full bg-primary hover:bg-[#c2410c] text-white py-3.5 rounded-xl font-bold text-sm sm:text-base transition-all duration-150 shadow-md hover:shadow-lg cursor-pointer border border-orange-600/30 active:scale-[0.99]"
            >
              {t.sendCateringInquiry}
            </button>
          </div>
        </div>
      </div>
      <InquiryFormModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  );
};
