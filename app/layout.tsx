import Link from 'next/link';
//Sitewide metadata
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
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
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
        
        <nav style={navStyles.nav}>
          <div style={navStyles.container}>
            <Link href="/" style={navStyles.logo}>
              Hertzmann Photography
            </Link>
            <div style={navStyles.links}>
              <Link href="/" style={navStyles.link}>Home</Link>
              <Link href="/photographs" style={navStyles.link}>Photographs</Link>
              <a 
                href="https://edwardwestonbibliography.blog/" 
                target="_blank" 
                rel="noopener noreferrer"
                style={navStyles.link}
              >
                Edward Weston Blog
              </a>
              <Link href="/about" style={navStyles.link}>About</Link>
              <Link href="/contact" style={navStyles.link}>Contact</Link>
            </div>
          </div>
        </nav>
        <main style={navStyles.main}>
          {children}
        </main>
      </body>
    </html>
  );
}

const navStyles = {
  nav: {
    backgroundColor: '#1a1a1a',
    borderBottom: '1px solid #333',
    position: 'sticky' as const,
    top: 0,
    zIndex: 1000,
  },
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '1rem 2rem',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  logo: {
    color: 'white',
    fontSize: '1.25rem',
    fontWeight: 'bold',
    textDecoration: 'none',
  },
  links: {
    display: 'flex',
    gap: '2rem',
  },
  link: {
    color: '#ccc',
    textDecoration: 'none',
    fontSize: '1rem',
    transition: 'color 0.2s',
  },
  main: {
    minHeight: 'calc(100vh - 60px)',
  },
};