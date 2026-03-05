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
    const [isAdmin, setIsAdmin] = useState(false);
    const supabase = createClient();

    useEffect(() => {
        const fetchUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            setUser(user);
            if (user) {
                const { data } = await supabase.from('user_roles').select('role').eq('user_id', user.id).single();
                setIsAdmin(data?.role === 'admin');
            } else {
                setIsAdmin(false);
            }
        };

        fetchUser();

        const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
            setUser(session?.user ?? null);
            if (session?.user) {
                const { data } = await supabase.from('user_roles').select('role').eq('user_id', session.user.id).single();
                setIsAdmin(data?.role === 'admin');
            } else {
                setIsAdmin(false);
            }
        });

        return () => {
            authListener?.subscription.unsubscribe();
        };
    }, [supabase]);

    return (
        <nav className="sticky top-0 z-50 bg-background-light/95 backdrop-blur-md border-b border-nordic-dark/10">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {isAdmin ? (
                    <div className="flex justify-between items-center h-20">
                        <div className="flex items-center gap-10">
                            <Link href="/admin/properties" className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity">
                                <span className="material-icons text-[#006655] text-2xl">apartment</span>
                                <span className="text-lg font-bold tracking-tight text-[#19322F]">LuxeEstate</span>
                            </Link>
                            <div className="hidden md:flex items-center space-x-6">
                                <Link className="text-gray-400 hover:text-[#19322F] font-medium text-sm transition-colors" href="/admin">Dashboard</Link>
                                <Link className="text-gray-400 hover:text-[#19322F] font-medium text-sm transition-colors" href="/admin/properties">Properties</Link>
                                <Link className="text-gray-400 hover:text-[#19322F] font-medium text-sm transition-colors" href="/admin/users">Users</Link>
                            </div>
                        </div>
                        <div className="flex items-center space-x-6">
                            <button className="text-gray-400 hover:text-[#19322F] transition-colors relative" title="Notifications">
                                <span className="material-icons text-2xl">notifications</span>
                                <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
                            </button>
                            <div className="h-10 w-px bg-gray-200 my-auto hidden sm:block"></div>
                            <div className="flex items-center gap-3 cursor-pointer group" onClick={async () => {
                                await supabase.auth.signOut();
                                window.location.href = "/";
                            }}>
                                <div className="flex flex-col items-end hidden sm:flex">
                                    <span className="text-sm font-semibold text-[#19322F] group-hover:text-[#006655] transition-colors">{user?.email}</span>
                                    <span className="text-xs text-gray-400">Administrator</span>
                                </div>
                                <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden transition-all group-hover:ring-2 group-hover:ring-[#006655]">
                                    <span className="material-icons text-gray-500 text-2xl">person</span>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
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
                )}
            </div>
        </nav>
    );
}
