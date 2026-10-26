import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { MapPin, Phone, ChefHat } from 'lucide-react';
import { siteConfig } from '../config/site';
import logoImg from '../assets/LOGO.png';

export const Footer: React.FC = () => {
  const { t } = useLanguage();

  return (
    <footer className="bg-[#123B75] text-blue-100/90 pt-12 pb-8 border-t border-blue-900 shadow-inner">
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-10 pb-10 border-b border-blue-800/60">
          {/* Brand Info */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <img
                src={logoImg}
                alt={`${siteConfig.name} Logo`}
                className="w-12 h-12 rounded-full bg-white p-0.5 border border-blue-300 shadow-md object-contain"
              />
              <div>
                <h3 className="text-lg font-bold text-white tracking-tight">{siteConfig.name}</h3>
                <p className="text-xs text-blue-200">{siteConfig.tamilName}</p>
              </div>
            </div>
            <p className="text-xs sm:text-sm text-blue-200/80 leading-relaxed">
              Authentic traditional pure vegetarian catering for grand weddings, family ceremonies, corporate galas, and temple festivals.
            </p>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-800/50 border border-blue-700/50 text-xs text-blue-200 font-medium">
              <ChefHat size={14} className="text-[#3B82F6]" />
              <span>Authentic Kanchipuram Taste & Heritage</span>
            </div>
          </div>

          {/* Services Section */}
          <div>
            <h3 className="text-base sm:text-lg font-bold text-white mb-4 tracking-wide flex items-center gap-2">
              <span className="w-1.5 h-4 bg-[#3B82F6] rounded-full inline-block" />
              {t.servicesOffered}
            </h3>
            <ul className="space-y-2.5 text-xs sm:text-sm">
              {t.servicesList.map((service, index) => (
                <li key={index} className="flex items-start">
                  <span className="text-[#3B82F6] mr-2 mt-0.5">•</span>
                  <span className="leading-relaxed text-blue-100">{service}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Location & Contact Section */}
          <div>
            <h3 className="text-base sm:text-lg font-bold text-white mb-4 tracking-wide flex items-center gap-2">
              <span className="w-1.5 h-4 bg-[#3B82F6] rounded-full inline-block" />
              {t.locationAndContact}
            </h3>

            <div className="space-y-4 text-xs sm:text-sm">
              {/* Address */}
              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-[#3B82F6] mt-1 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-white mb-0.5">{t.addressLabel}</h4>
                  <p className="leading-relaxed text-blue-200">
                    {t.addressLine1}
                    <br />
                    {t.addressLine2}
                  </p>
                </div>
              </div>

              {/* Phone Numbers */}
              <div className="flex items-start gap-3">
                <Phone className="w-4 h-4 text-[#3B82F6] mt-1 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-white mb-0.5">{t.phoneNumbersLabel}</h4>
                  <div className="flex flex-col space-y-1">
                    <a
                      href="tel:+917200015790"
                      className="text-blue-200 hover:text-white transition-colors hover:underline"
                    >
                      +91 72000 15790
                    </a>
                    <a
                      href="tel:+919543950049"
                      className="text-blue-200 hover:text-white transition-colors hover:underline"
                    >
                      +91 95439 50049
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="pt-6 text-center text-xs text-blue-300/70">
          <p>© {new Date().getFullYear()} {siteConfig.name}. All rights reserved. | Kanchipuram, Tamil Nadu</p>
        </div>
      </div>
    </footer>
  );
};
