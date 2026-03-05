"use client";

import Link from "next/link";
import { useLanguage } from "../i18n/LanguageContext";
import LanguageSelector from "./LanguageSelector";
import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import type { User } from "@supabase/supabase-js";

export default function Navbar() {
    const { t } = useLanguage();
    const [user, setUser] = useState<User | null>(null);
    const supabase = createClient();

    useEffect(() => {
        const fetchUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            setUser(user);
        };

        fetchUser();

        const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
            setUser(session?.user ?? null);
        });

        return () => {
            authListener?.subscription.unsubscribe();
        };
    }, [supabase]);

    return (
        <nav className="sticky top-0 z-50 bg-background-light/95 backdrop-blur-md border-b border-nordic-dark/10">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-20">
                    <Link href="/" className="flex-shrink-0 flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity">
                        <div className="w-8 h-8 rounded-lg bg-nordic-dark flex items-center justify-center">
                            <span className="material-icons text-white text-lg">apartment</span>
                        </div>
                        <span className="text-xl font-semibold tracking-tight text-nordic-dark">
                            LuxeEstate
                        </span>
                    </Link>
                    <div className="hidden md:flex items-center space-x-8">
                        <Link className="text-mosque font-medium text-sm border-b-2 border-mosque px-1 py-1" href="/">{t('navbar.buy')}</Link>
                        <Link className="text-nordic-dark/70 hover:text-nordic-dark font-medium text-sm hover:border-b-2 hover:border-nordic-dark/20 px-1 py-1 transition-all" href="#">{t('navbar.rent')}</Link>
                        <Link className="text-nordic-dark/70 hover:text-nordic-dark font-medium text-sm hover:border-b-2 hover:border-nordic-dark/20 px-1 py-1 transition-all" href="#">{t('navbar.sell')}</Link>
                        <Link className="text-nordic-dark/70 hover:text-nordic-dark font-medium text-sm hover:border-b-2 hover:border-nordic-dark/20 px-1 py-1 transition-all" href="#">{t('navbar.saved_homes')}</Link>
                    </div>
                    <div className="flex items-center space-x-4 sm:space-x-6">
                        <button className="text-nordic-dark hover:text-mosque transition-colors" title={t('navbar.search')}>
                            <span className="material-icons">search</span>
                        </button>
                        <button className="text-nordic-dark hover:text-mosque transition-colors relative" title={t('navbar.notifications')}>
                            <span className="material-icons">notifications_none</span>
                            <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full border-2 border-background-light"></span>
                        </button>
                        <LanguageSelector />
                        {user ? (
                            <div className="flex items-center gap-3 pl-2 border-l border-nordic-dark/10 ml-2">
                                <button
                                    onClick={async () => {
                                        await supabase.auth.signOut();
                                        window.location.reload();
                                    }}
                                    className="text-sm font-medium text-nordic-dark/70 hover:text-red-600 transition-colors px-2 py-1"
                                >
                                    {t('navbar.logout')}
                                </button>
                                <div className="w-9 h-9 rounded-full bg-gray-200 overflow-hidden ring-2 ring-transparent transition-all" title={t('navbar.profile')}>
                                    <img
                                        alt={t('navbar.profile')}
                                        className="w-full h-full object-cover"
                                        src={user.user_metadata?.avatar_url || "https://lh3.googleusercontent.com/aida-public/AB6AXuCAWhQZ663Bd08kmzjbOPmUk4UIxYooNONShMEFXLR-DtmVi6Oz-TiaY77SPwFk7g0OobkeZEOMvt6v29mSOD0Xm2g95WbBG3ZjWXmiABOUwGU0LOySRfVDo-JTXQ0-gtwjWxbmue0qDm91m-zEOEZwAW6iRFB1qC1bAU-wkjxm67Sbztq8w7srHkFT9bVEC86qG-FzhOBTomhAurNRmx9l8Yfqabk328NfdKuVLckgCdaPsNFE3yN65MeoRi05GA_gXIMwG4YDIeA"}
                                    />
                                </div>
                            </div>
                        ) : (
                            <div className="flex items-center gap-3 pl-2 border-l border-nordic-dark/10 ml-2">
                                <Link
                                    href="/login"
                                    className="text-sm font-medium text-white bg-mosque hover:bg-mosque-dark px-4 py-2 rounded-lg transition-colors shadow-sm"
                                >
                                    {t('navbar.login')}
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
}
