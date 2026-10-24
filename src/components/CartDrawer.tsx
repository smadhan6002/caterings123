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
    foodQuantities
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
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity"
        onClick={() => setIsCartDrawerOpen(false)}
      />
      
      {/* Drawer */}
      <div className="absolute inset-y-0 right-0 w-full max-w-md bg-white shadow-2xl flex flex-col transform transition-transform duration-300">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 pb-2">
          <h2 className="text-2xl font-bold text-blue-950">{t.yourSelection}</h2>
          <button 
            onClick={() => setIsCartDrawerOpen(false)}
            className="w-10 h-10 flex items-center justify-center rounded-full border border-blue-200 text-blue-600 hover:bg-blue-50 transition-colors -mr-2"
            aria-label="Close cart"
          >
            <X size={20} />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 pt-4 space-y-8">
          
          {/* Guest Count */}
          <section>
            <h3 className="text-sm font-semibold text-blue-900 mb-3">{t.numberOfPeople}</h3>
            <GuestCountSelector />
          </section>

          {/* Food Quantity (kg) Section */}
          <FoodQuantitySelector />
          
          {/* Items */}
          {Object.keys(groupedItems).length > 0 && (
            <section>
              <h3 className="text-sm font-semibold text-blue-900 mb-3">{t.selectedDishes}</h3>
              {Object.entries(groupedItems).map(([categoryId, items]) => (
                <div key={categoryId} className="mb-4">
                  <h4 className="text-xs font-bold text-primary tracking-wider uppercase mb-2">
                    {categoryName(categoryId, categoryId)}
                  </h4>
                  <div className="space-y-2">
                    {items.map((item) => (
                      <div key={item.id} className="flex items-center justify-between gap-4 py-2 border-b border-gray-100 last:border-0">
                        <div className="flex items-center gap-3 flex-1">
                          <Check size={16} className="text-green-500" />
                          <span className="text-blue-900 text-sm font-semibold">{dishName(item.id, item.name)}</span>
                        </div>
                        <button 
                          onClick={() => removeItem(item.id)}
                          className="text-red-500 hover:text-red-600 text-sm font-medium px-2 py-1 rounded hover:bg-red-50"
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
            <div className="text-center py-8 text-blue-800/80 font-medium">
              {t.emptyCart}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-100 bg-white">
          {errorMsg && (
            <p className="text-red-500 text-sm mb-3 text-center">{errorMsg}</p>
          )}
          <button
            onClick={handleSendInquiry}
            className="w-full bg-[#ea580c] hover:bg-[#d94f0b] text-white py-3.5 rounded-md font-medium transition-colors"
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


