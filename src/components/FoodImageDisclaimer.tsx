import React from 'react';
import { Info } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export const FoodImageDisclaimer: React.FC = () => {
  const { t } = useLanguage();

  return (
    <div
      id="food-image-disclaimer"
      className="my-5 sm:my-6 p-3.5 sm:p-4 rounded-2xl bg-[#EFF6FF] border border-[#DCE8F5] flex items-start sm:items-center gap-3 text-[#24364B] shadow-2xs transition-colors"
      role="note"
      aria-label="Food image disclaimer"
    >
      <Info className="w-5 h-5 text-[#0966CC] flex-shrink-0 mt-0.5 sm:mt-0" aria-hidden="true" />
      <p className="text-xs sm:text-sm text-[#123B75] font-medium leading-relaxed">
        {t.imageDisclaimer}
      </p>
    </div>
  );
};
