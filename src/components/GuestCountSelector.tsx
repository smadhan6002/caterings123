import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { useLanguage } from '../context/LanguageContext';
import { cn } from './ui/Button';

export const GuestCountSelector: React.FC = () => {
  const { guestCount, setGuestCount } = useCart();
  const { t } = useLanguage();
  const [isCustom, setIsCustom] = useState(false);

  const presets = [50, 100, 150, 200];

  // If the current guest count isn't in presets and isn't null, it's custom.
  const currentIsCustom = isCustom || (guestCount !== null && !presets.includes(guestCount));

  const handleCustomChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value, 10);
    if (!isNaN(val) && val > 0) {
      setGuestCount(val);
    } else if (e.target.value === '') {
      setGuestCount(null);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {presets.map((preset) => (
          <button
            key={preset}
            onClick={() => {
              setGuestCount(preset);
              setIsCustom(false);
            }}
            className={cn(
              'px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-150 border cursor-pointer',
              guestCount === preset && !isCustom
                ? 'bg-primary text-white border-primary shadow-xs'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-orange-50 hover:border-orange-300 hover:text-primary'
            )}
          >
            {preset}
          </button>
        ))}

        <button
          onClick={() => setIsCustom(true)}
          className={cn(
            'px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-150 border cursor-pointer',
            currentIsCustom
              ? 'bg-primary text-white border-primary shadow-xs'
              : 'bg-white text-slate-700 border-slate-200 hover:bg-orange-50 hover:border-orange-300 hover:text-primary'
          )}
        >
          {t.custom}
        </button>
      </div>

      {currentIsCustom && (
        <input
          type="number"
          min="1"
          placeholder={t.enterGuestCount}
          value={guestCount || ''}
          onChange={handleCustomChange}
          className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary text-slate-900 bg-white text-sm"
        />
      )}
    </div>
  );
};
