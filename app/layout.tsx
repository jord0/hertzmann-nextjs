import type { Metadata } from "next";
import Script from 'next/script';
import NavBar from './components/NavBar';
import { Inter, Cormorant } from "next/font/google";
import "./globals.css";

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

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["300", "400", "500"],
});

const cormorant = Cormorant({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${cormorant.variable}`}>
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-Y87Y5056K0"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-Y87Y5056K0');
          `}
        </Script>
        <NavBar />
        <main>{children}</main>
      </body>
    </html>
  );
}
