import './globals.css';
import React from 'react';

export const metadata = {
  title: 'Nano English - Tan-Tan',
  description: 'Interactive Learning App',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="uk" className="w-full h-full bg-[#0f172a]">
      <body className="w-full h-full bg-[#0f172a] text-white antialiased m-0 p-0 overflow-x-hidden">
        {children}
      </body>
    </html>
  );
}
