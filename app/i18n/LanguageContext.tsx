'use client';

import React, { createContext, useContext, useState } from 'react';
import en from './dictionaries/en.json';
import es from './dictionaries/es.json';
import fr from './dictionaries/fr.json';

type Locale = 'en' | 'es' | 'fr';

const dictionaries: Record<Locale, any> = {
    en,
    es,
    fr
};

const getNestedObject = (obj: any, path: string) => {
    return path.split('.').reduce((acc, part) => acc && acc[part], obj);
};

interface LanguageContextType {
    locale: Locale;
    setLocale: (l: Locale) => void;
    t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children, initialLocale }: { children: React.ReactNode, initialLocale: string }) => {
    const defaultLocale: Locale = ['en', 'es', 'fr'].includes(initialLocale) ? (initialLocale as Locale) : 'en';
    const [locale, setLocaleState] = useState<Locale>(defaultLocale);

    const setLocale = (newLocale: Locale) => {
        setLocaleState(newLocale);
        document.cookie = `NEXT_LOCALE=${newLocale}; path=/; max-age=31536000`; // 1 year
        // Force a router refresh might be needed if there are server components that query the locale cookie directly.
        // However, our string replacements will primarily happen in client components for now. 
        // We can just rely on the context state change to trigger rerender of translation functions.
    };

    const t = (key: string): string => {
        const value = getNestedObject(dictionaries[locale], key);
        return value || key;
    };

    return (
        <LanguageContext.Provider value={{ locale, setLocale, t }}>
            {children}
        </LanguageContext.Provider>
    );
};

export const useLanguage = () => {
    const context = useContext(LanguageContext);
    if (!context) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
};
