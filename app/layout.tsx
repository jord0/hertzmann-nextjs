//Sitewide metadata
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    default: 'Paul M. Hertzmann, Inc. Vintage Photographs',
    template: '%s | Hertzmann Photography'
  },
  description: 'Vintage photography collection specializing in 20th-century modernism, f.64, photojournalism, and American landscape photography',
  keywords: ['vintage photography', 'photojournalism', 'modernism', 'f.64', 'American landscape', 'Photo-Secession', 'Post-World War II', '19th century American landscape photography', 'Unusual or exceptional photographic albums'], 
  authors: [{ name: 'Susan Herzig and Paul Hertzmann' }],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    siteName: 'Hertzmann Photography',
    description: 'Vintage photography collection specializing in 20th-century modernism, f.64, photojournalism, and American landscape photography'
  },
  twitter: {
    card: 'summary_large_image',
  },
};

import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
