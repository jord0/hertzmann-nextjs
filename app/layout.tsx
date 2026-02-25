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
import { tokens } from "@/lib/design-tokens";

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
      <body
        className={`${inter.variable} ${cormorant.variable}`}
        style={{ fontFamily: tokens.font.sans, fontWeight: tokens.fontWeight.light, color: tokens.color.foreground }}
      >
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

        <style>{`
          .nav-link {
            border-bottom: 2px solid transparent;
            padding-bottom: 2px;
            transition: border-bottom-color 0.15s;
          }
          .nav-link:hover {
            border-bottom-color: ${tokens.color.gold};
          }
        `}</style>

        <nav style={navStyles.nav}>
          <div style={navStyles.container}>
            <Link href="/" style={navStyles.logo}>
              Hertzmann
            </Link>
            <div style={navStyles.links}>
              <Link href="/" className="nav-link" style={navStyles.link}>Home</Link>
              <Link href="/photographs" className="nav-link" style={navStyles.link}>Photographs</Link>
              <Link href="/catalogs" className="nav-link" style={navStyles.link}>Catalogs</Link>
              <a
                href="https://edwardwestonbibliography.blog/"
                target="_blank"
                rel="noopener noreferrer"
                className="nav-link"
                style={navStyles.link}
              >
                Edward Weston Blog
              </a>
              <Link href="/contact" className="nav-link" style={navStyles.link}>Contact</Link>
              <Link href="/about" className="nav-link" style={navStyles.link}>About Us</Link>
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
    backgroundColor: tokens.color.bg,
    borderBottom: `1px solid ${tokens.color.borderWarm}`,
    position: 'sticky' as const,
    top: 0,
    zIndex: 1000,
  },
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '1rem 2.5rem',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  logo: {
    fontFamily: tokens.font.serif,
    fontStyle: 'italic' as const,
    color: tokens.color.gold,
    fontSize: '1.5rem',
    fontWeight: tokens.fontWeight.semibold,
    textDecoration: 'none',
    letterSpacing: '0.01em',
  },
  links: {
    display: 'flex',
    gap: '2rem',
    alignItems: 'center',
  },
  link: {
    color: tokens.color.foreground,
    textDecoration: 'none',
    fontSize: '0.75rem',
    fontFamily: tokens.font.sans,
    textTransform: 'uppercase' as const,
    letterSpacing: '0.08em',
    fontWeight: tokens.fontWeight.medium,
  },
  main: {
    minHeight: 'calc(100vh - 61px)',
  },
};
