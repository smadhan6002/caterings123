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
                ? 'bg-[#0966CC] text-white border-[#0966CC] shadow-xs'
                : 'bg-white text-[#123B75] border-[#DCE8F5] hover:bg-[#EFF6FF] hover:border-blue-300'
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
              ? 'bg-[#0966CC] text-white border-[#0966CC] shadow-xs'
              : 'bg-white text-[#123B75] border-[#DCE8F5] hover:bg-[#EFF6FF] hover:border-blue-300'
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
          className="w-full px-3.5 py-2.5 border border-[#DCE8F5] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0966CC]/30 focus:border-[#0966CC] text-[#24364B] bg-white text-sm"
        />
      )}
    </div>
  );
};
