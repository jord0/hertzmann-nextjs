import Link from 'next/link';
import HeroCarousel from './components/HeroCarousel';
import { getCarouselPhotos } from '@/lib/carousel-data';
import { tokens } from '@/lib/design-tokens';

export default async function Home() {
  const photos = await getCarouselPhotos();

  return (
    <>
      <style>{`
        @media (max-width: 768px) {
          .home-about-grid { flex-direction: column !important; }
          .home-fifty-grid { flex-direction: column !important; }
          .home-services-grid { flex-direction: column !important; }
          .home-fifty-num { font-size: 100px !important; }
          .home-cta-buttons { flex-direction: column !important; align-items: center !important; }
        }
      `}</style>

      {/* A. Hero Carousel */}
      <HeroCarousel photos={photos} />

      {/* B. About Us */}
      <section style={{ padding: tokens.section.padding, maxWidth: tokens.section.maxWidth, margin: '0 auto' }}>
        <div className="home-about-grid" style={{ display: 'flex', gap: '4rem', alignItems: 'flex-start' }}>
          <div style={{ flex: '0 0 220px' }}>
            <div style={{ width: '48px', height: '3px', backgroundColor: tokens.color.gold, marginBottom: '1.25rem' }} />
            <h2 style={{
              fontFamily: tokens.font.serif,
              fontSize: '2.75rem',
              fontWeight: tokens.fontWeight.semibold,
              lineHeight: 1.1,
              color: tokens.color.foreground,
              margin: 0,
            }}>
              About Us
            </h2>
          </div>
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: '1rem', lineHeight: 1.8, color: tokens.color.foreground, fontWeight: tokens.fontWeight.light, marginTop: 0 }}>
              Paul M. Hertzmann, Inc. has been a leading dealer in vintage photographs for over fifty years. Based in San Francisco, we specialize in 20th-century modernism, the f.64 group, photojournalism, and American landscape photography. Our inventory spans rare prints, exceptional albums, and works by the most significant photographers of the 19th and 20th centuries.
            </p>
            <p style={{ fontSize: '1rem', lineHeight: 1.8, color: tokens.color.foreground, fontWeight: tokens.fontWeight.light }}>
              Susan Herzig and Paul Hertzmann bring decades of expertise and passion to each acquisition and sale, working with collectors, institutions, and estates worldwide.
            </p>
            <Link href="/photographs" style={{
              display: 'inline-block',
              marginTop: '1rem',
              color: tokens.color.gold,
              fontSize: '0.8rem',
              fontWeight: tokens.fontWeight.medium,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              textDecoration: 'none',
              borderBottom: `1px solid ${tokens.color.gold}`,
              paddingBottom: '2px',
            }}>
              Explore the Collection →
            </Link>
          </div>
        </div>
      </section>

      {/* C. 50 Years of Excellence */}
      <section style={{ backgroundColor: tokens.color.gold, padding: '3.5rem 2.5rem', width: '100%' }}>
        <div className="home-fifty-grid" style={{
          display: 'flex',
          alignItems: 'center',
          gap: '2rem',
          maxWidth: tokens.section.maxWidth,
          margin: '0 auto',
        }}>
          <div style={{ flexShrink: 0 }}>
            <span className="home-fifty-num" style={{
              fontFamily: tokens.font.serif,
              fontSize: '200px',
              fontWeight: tokens.fontWeight.semibold,
              color: 'rgba(0,0,0,0.12)',
              lineHeight: 0.85,
              display: 'block',
              userSelect: 'none',
            }}>
              50
            </span>
          </div>
          <div style={{ flex: 1 }}>
            <h2 style={{
              fontFamily: tokens.font.serif,
              fontSize: '2.25rem',
              fontWeight: tokens.fontWeight.semibold,
              color: tokens.color.dark,
              margin: '0 0 1rem',
              lineHeight: 1.2,
            }}>
              Years of Excellence
            </h2>
            <p style={{ fontSize: '1rem', lineHeight: 1.8, fontWeight: tokens.fontWeight.light, color: 'rgba(0,0,0,0.65)', margin: '0 0 1.5rem' }}>
              Since the early 1970s, we have been at the forefront of the vintage photograph market, building relationships with collectors and institutions that span generations. Our commitment to quality, scholarship, and integrity has made us a trusted name in the field.
            </p>
            <div style={{ width: '60px', height: '2px', backgroundColor: 'rgba(0,0,0,0.25)' }} />
          </div>
        </div>
      </section>

      {/* D. Services */}
      <section style={{ padding: tokens.section.padding, maxWidth: tokens.section.maxWidth, margin: '0 auto' }}>
        <div style={{ marginBottom: '3rem' }}>
          <div style={{ width: '48px', height: '3px', backgroundColor: tokens.color.gold, marginBottom: '1.25rem' }} />
          <h2 style={{
            fontFamily: tokens.font.serif,
            fontSize: '2.75rem',
            fontWeight: tokens.fontWeight.semibold,
            color: tokens.color.foreground,
            margin: 0,
          }}>
            Services
          </h2>
        </div>
        <div className="home-services-grid" style={{ display: 'flex', gap: '4rem' }}>
          <div style={{ flex: 1 }}>
            <h3 style={{
              fontFamily: tokens.font.serif,
              fontSize: '1.5rem',
              fontWeight: tokens.fontWeight.semibold,
              color: tokens.color.foreground,
              margin: '0 0 0.75rem',
            }}>
              For Collectors
            </h3>
            <p style={{ fontSize: '0.95rem', lineHeight: 1.8, fontWeight: tokens.fontWeight.light, color: tokens.color.foreground, margin: '0 0 1.5rem' }}>
              Whether you are building a collection or seeking a single important work, we offer expert guidance, authentication research, and access to an extensive inventory of vintage photographs. We work closely with collectors at every level.
            </p>
            <Link href="/photographs" style={{
              fontSize: '0.78rem',
              fontWeight: tokens.fontWeight.medium,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color: tokens.color.foreground,
              textDecoration: 'none',
              borderBottom: `2px solid ${tokens.color.gold}`,
              paddingBottom: '2px',
            }}>
              View Collection →
            </Link>
          </div>
          <div style={{ flex: 1 }}>
            <h3 style={{
              fontFamily: tokens.font.serif,
              fontSize: '1.5rem',
              fontWeight: tokens.fontWeight.semibold,
              color: tokens.color.foreground,
              margin: '0 0 0.75rem',
            }}>
              For Sellers
            </h3>
            <p style={{ fontSize: '0.95rem', lineHeight: 1.8, fontWeight: tokens.fontWeight.light, color: tokens.color.foreground, margin: '0 0 1.5rem' }}>
              We actively purchase individual photographs and entire collections, offering fair market valuations and discreet, professional transactions. If you have photographs to sell, we welcome the opportunity to discuss your holdings.
            </p>
            <Link href="/contact" style={{
              fontSize: '0.78rem',
              fontWeight: tokens.fontWeight.medium,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color: tokens.color.foreground,
              textDecoration: 'none',
              borderBottom: `2px solid ${tokens.color.gold}`,
              paddingBottom: '2px',
            }}>
              Contact Us →
            </Link>
          </div>
        </div>
      </section>

      {/* E. Discover Our Collection CTA */}
      <section style={{
        backgroundColor: tokens.color.dark,
        padding: '5rem 2.5rem',
        textAlign: 'center',
        width: '100%',
      }}>
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
          <div style={{ width: '48px', height: '2px', backgroundColor: tokens.color.gold, margin: '0 auto 1.5rem' }} />
          <h2 style={{
            fontFamily: tokens.font.serif,
            fontSize: '2.5rem',
            fontWeight: tokens.fontWeight.semibold,
            color: tokens.color.bg,
            margin: '0 0 1rem',
          }}>
            Discover Our Collection
          </h2>
          <p style={{ color: tokens.color.muted, fontSize: '1rem', fontWeight: tokens.fontWeight.light, lineHeight: 1.7, margin: '0 0 2.5rem' }}>
            Browse our curated selection of vintage photographs, from 19th-century masterworks to 20th-century modernist prints.
          </p>
          <div className="home-cta-buttons" style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <Link href="/photographs" style={{
              display: 'inline-block',
              padding: '0.875rem 1.75rem',
              backgroundColor: tokens.color.gold,
              color: tokens.color.dark,
              fontSize: '0.78rem',
              fontWeight: tokens.fontWeight.medium,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              textDecoration: 'none',
            }}>
              Browse Photographs →
            </Link>
            <Link href="/contact" style={{
              display: 'inline-block',
              padding: '0.875rem 1.75rem',
              backgroundColor: 'transparent',
              color: tokens.color.bg,
              fontSize: '0.78rem',
              fontWeight: tokens.fontWeight.medium,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              textDecoration: 'none',
              border: '1px solid rgba(255,255,255,0.4)',
            }}>
              Get in Touch →
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
