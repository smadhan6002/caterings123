import React from 'react';
import { Info } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export const FoodImageDisclaimer: React.FC = () => {
  const { t } = useLanguage();

  return (
    <div
      id="food-image-disclaimer"
      className="my-6 p-4 rounded-xl bg-orange-50/70 border border-orange-200/80 flex items-start sm:items-center gap-3 text-slate-700 shadow-xs transition-colors"
      role="note"
      aria-label="Food image disclaimer"
    >
      <Info className="w-5 h-5 text-primary flex-shrink-0 mt-0.5 sm:mt-0" aria-hidden="true" />
      <p className="text-xs sm:text-sm text-blue-950 font-medium leading-relaxed">
        {t.imageDisclaimer}
      </p>
    </div>
  );
};
