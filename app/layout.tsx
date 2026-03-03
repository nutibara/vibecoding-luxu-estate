import type { Metadata } from "next";
import "./globals.css";
import Navbar from "./components/Navbar";

export const metadata: Metadata = {
  title: "LuxeEstate — Premium Real Estate",
  description: "Find your sanctuary. Discover premium properties for sale and rent worldwide.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="light" style={{ colorScheme: 'light' }}>
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
      </head>
      <body className="bg-[#EEF6F6] text-[#19322F] antialiased">
        <Navbar />
        {children}
      </body>
    </html>
  );
}