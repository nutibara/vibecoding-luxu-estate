import type { Metadata } from "next";
import { cookies } from "next/headers";
import "./globals.css";
import Navbar from "./components/Navbar";
import { LanguageProvider } from "./i18n/LanguageContext";

export const metadata: Metadata = {
  title: "LuxeEstate — Premium Real Estate",
  description: "Find your sanctuary. Discover premium properties for sale and rent worldwide.",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const localeCookie = cookieStore.get('NEXT_LOCALE');
  const initialLocale = localeCookie ? localeCookie.value : 'en';

  return (
    <html lang={initialLocale} className="light" style={{ colorScheme: 'light' }}>
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
      </head>
      <body className="bg-[#EEF6F6] text-[#19322F] antialiased">
        <LanguageProvider initialLocale={initialLocale}>
          <Navbar />
          {children}
        </LanguageProvider>
      </body>
    </html>
  );
}