import Link from 'next/link';
import type { Metadata } from "next";
import Script from 'next/script';

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

import { Inter, Cormorant } from "next/font/google";
import "./globals.css";
import styles from "./layout.module.css";

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
        {/* Google Analytics */}
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

        <nav className={styles.nav}>
          <div className={styles.container}>
            <Link href="/" className={styles.logo}>
              Hertzmann
            </Link>
            <div className={styles.links}>
              <Link href="/" className={styles.navLink}>Home</Link>
              <Link href="/photographs" className={styles.navLink}>Photographs</Link>
              <Link href="/catalogs" className={styles.navLink}>Catalogs</Link>
              <a
                href="https://edwardwestonbibliography.blog/"
                target="_blank"
                rel="noopener noreferrer"
                className={styles.navLink}
              >
                Edward Weston Blog
              </a>
              <Link href="/contact" className={styles.navLink}>Contact</Link>
              <Link href="/about" className={styles.navLink}>About Us</Link>
            </div>
          </div>
        </nav>
        <main className={styles.main}>
          {children}
        </main>
      </body>
    </html>
  );
}
