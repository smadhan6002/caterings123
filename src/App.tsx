import React, { useState, useRef, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';
import { User, ChevronDown, Check } from 'lucide-react';
import { categories } from './data/menu';
import { CartProvider } from './context/CartContext';
import { LanguageProvider, useLanguage, type Language } from './context/LanguageContext';
import { Hero } from './components/Hero';
import { CategoryNav } from './components/CategoryNav';
import { MenuSection } from './components/MenuSection';
import { CartActionBar } from './components/CartActionBar';
import { CartDrawer } from './components/CartDrawer';
import { RiceSuggestionModal } from './components/RiceSuggestionModal';
import { AdminPage } from './components/admin/AdminPage';
import { Footer } from './components/Footer';
import { FoodImageDisclaimer } from './components/FoodImageDisclaimer';
import logoImg from './assets/LOGO.png';

function LanguageSwitcher() {
  const { lang, setLang } = useLanguage();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const options: { value: Language; label: string; native: string }[] = [
    { value: 'en', label: 'English', native: 'English' },
    { value: 'ta', label: 'Tamil', native: 'தமிழ்' },
  ];

  const current = options.find(o => o.value === lang) ?? options[0];

  return (
    <div ref={ref} className="relative" id="language-switcher">
      <button
        onClick={() => setOpen(v => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={`Language: ${current.native}`}
        className="bg-white/90 hover:bg-white text-slate-800 text-xs sm:text-sm font-medium px-2.5 py-1.5 sm:px-3 sm:py-1.5 rounded-lg shadow-md hover:shadow-lg transition-all duration-150 flex items-center gap-1 cursor-pointer backdrop-blur-sm border border-slate-200/70"
      >
        <span className="text-sm leading-none">{lang === 'ta' ? '🇮🇳' : '🌐'}</span>
        <span className="hidden xs:inline">{current.native}</span>
        <ChevronDown className={`w-3 h-3 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div
          role="listbox"
          aria-label="Select language"
          className="absolute top-full right-0 mt-2 z-50 bg-white rounded-xl shadow-xl border border-slate-100 overflow-hidden min-w-[130px]"
        >
          {options.map(opt => (
            <button
              key={opt.value}
              role="option"
              aria-selected={lang === opt.value}
              onClick={() => { setLang(opt.value); setOpen(false); }}
              className={`w-full flex items-center justify-between gap-3 px-4 py-2.5 text-sm transition-colors cursor-pointer
                ${lang === opt.value
                  ? 'bg-orange-50 text-primary font-semibold'
                  : 'text-slate-700 hover:bg-slate-50'
                }`}
            >
              <span>{opt.native}</span>
              {lang === opt.value && <Check className="w-3.5 h-3.5 text-primary" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function AdminLoginButton() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  return (
    <button
      onClick={() => navigate('/admin')}
      className="bg-slate-900/90 hover:bg-slate-800 text-white text-xs sm:text-sm font-medium px-3 py-1.5 sm:px-3.5 sm:py-1.5 rounded-lg shadow-md hover:shadow-lg transition-all duration-150 flex items-center gap-1.5 cursor-pointer backdrop-blur-sm border border-slate-700/50"
      aria-label="Admin login"
    >
      <User className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-300" />
      <span>{t.admin}</span>
    </button>
  );
}

function MainApp() {
  const [activeCategory, setActiveCategory] = React.useState(categories[0].id);

  React.useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.find(entry => entry.isIntersecting);
        if (visible) {
          const id = visible.target.id.replace('category-', '');
          setActiveCategory(id);
        }
      },
      { rootMargin: '-20% 0px -70% 0px' }
    );

    categories.forEach(cat => {
      const el = document.getElementById(`category-${cat.id}`);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <div className="min-h-screen pb-24">
      {/* Navbar Container */}
      <div className="absolute top-0 left-0 right-0 z-50 pointer-events-none p-3 sm:p-4 flex items-start justify-between">
        {/* Logo */}
        <div className="pointer-events-auto">
          <a href="/" className="block group" aria-label="Annapoorna Catering Home">
            <img 
              src={logoImg} 
              alt="Annapoorna Catering Logo" 
              className="h-14 w-14 sm:h-16 sm:w-16 md:h-20 md:w-20 object-contain rounded-full shadow-lg border-2 border-white/90 bg-white/95 p-1 transition-transform group-hover:scale-105 duration-200" 
            />
          </a>
        </div>
        
        {/* Actions */}
        <div className="pointer-events-auto flex items-center gap-2 sm:gap-3">
          <LanguageSwitcher />
          <AdminLoginButton />
        </div>
      </div>
      
      <Hero />
      <CategoryNav categories={categories} activeCategory={activeCategory} />

      <main className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
        <FoodImageDisclaimer />
        {categories.map((category) => (
          <MenuSection key={category.id} category={category} />
        ))}
      </main>

      <Footer />

      <CartActionBar />
      <CartDrawer />
      <RiceSuggestionModal />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <LanguageProvider>
        <CartProvider>
          <Routes>
            <Route path="/" element={<MainApp />} />
            <Route path="/admin" element={<AdminPage />} />
            <Route path="/admin/*" element={<AdminPage />} />
          </Routes>
        </CartProvider>
      </LanguageProvider>
    </BrowserRouter>
  );
}

