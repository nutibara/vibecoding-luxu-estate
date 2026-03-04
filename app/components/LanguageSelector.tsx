'use client';

import { useLanguage } from '../i18n/LanguageContext';
import { useState, useRef, useEffect } from 'react';

export default function LanguageSelector() {
    const { locale, setLocale } = useLanguage();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const languages = [
        { code: 'en', label: 'English', flag: '🇺🇸' },
        { code: 'es', label: 'Español', flag: '🇪🇸' },
        { code: 'fr', label: 'Français', flag: '🇫🇷' }
    ] as const;

    const currentLang = languages.find(l => l.code === locale) || languages[0];

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-1 text-nordic-dark hover:text-mosque transition-colors font-medium text-sm ml-2"
                aria-label="Select Language"
            >
                <span className="material-icons text-[18px]">language</span>
                <span className="hidden sm:inline-block">{currentLang.code.toUpperCase()}</span>
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 py-2 w-36 bg-white rounded-lg shadow-xl border border-gray-100 z-50 overflow-hidden">
                    {languages.map(lang => (
                        <button
                            key={lang.code}
                            onClick={() => {
                                setLocale(lang.code);
                                setIsOpen(false);
                            }}
                            className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex items-center gap-2 transition-colors ${locale === lang.code ? 'text-mosque font-medium bg-gray-50/50' : 'text-gray-700'}`}
                        >
                            <span>{lang.flag}</span>
                            <span>{lang.label}</span>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
