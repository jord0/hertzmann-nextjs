import Link from 'next/link';
import HeroCarousel from './components/HeroCarousel';
import { getCarouselPhotos } from '@/lib/carousel-data';
import styles from './page.module.css';

export default async function Home() {
  const photos = await getCarouselPhotos();

  return (
    <>
      {/* A. Hero Carousel */}
      <HeroCarousel photos={photos} />

      {/* B. About Us */}
      <section className={styles.aboutSection}>
        <div className={styles.aboutGrid}>
          <div className={styles.aboutLabel}>
            <div className={styles.aboutLabelInner}>
              <div className={styles.goldRule} />
              <h2 className={styles.sectionHeading}>
                About Us
              </h2>
            </div>
          </div>
          <div className={styles.aboutContent}>
            <p className={styles.bodyText}>
              Paul M. Hertzmann, Inc. has been a leading dealer in vintage photographs for over fifty years. Based in San Francisco, we specialize in 20th-century modernism, the f.64 group, photojournalism, and American landscape photography. Our inventory spans rare prints, exceptional albums, and works by the most significant photographers of the 19th and 20th centuries.
            </p>
            <p className={styles.bodyText}>
              Susan Herzig and Paul Hertzmann bring decades of expertise and passion to each acquisition and sale, working with collectors, institutions, and estates worldwide.
            </p>
            <Link href="/photographs" className={styles.ctaLink}>
              Explore the Collection →
            </Link>
          </div>
        </div>
      </section>

      {/* C. 50 Years of Excellence */}
      <section className={styles.fiftySection}>
        <div className={styles.fiftyGrid}>
          <div className={styles.fiftyNumWrap}>
            <span className={styles.fiftyNum}>
              50
            </span>
          </div>
          <div className={styles.fiftyContent}>
            <h2 className={styles.fiftyHeading}>
              Years of Excellence
            </h2>
            <p className={styles.fiftyText}>
              Since the early 1970s, we have been at the forefront of the vintage photograph market, building relationships with collectors and institutions that span generations. Our commitment to quality, scholarship, and integrity has made us a trusted name in the field.
            </p>
            <div className={styles.fiftyRule} />
          </div>
        </div>
      </section>

      {/* D. Services */}
      <section className={styles.servicesSection}>
        <div className={styles.servicesMastHead}>
          <div className={styles.goldRule} />
          <h2 className={styles.sectionHeading}>
            Services
          </h2>
        </div>
        <div className={styles.servicesGrid}>
          <div className={styles.serviceItem}>
            <h3 className={styles.serviceHeading}>
              For Collectors
            </h3>
            <p className={styles.serviceText}>
              Whether you are building a collection or seeking a single important work, we offer expert guidance, authentication research, and access to an extensive inventory of vintage photographs. We work closely with collectors at every level.
            </p>
            <Link href="/photographs" className={styles.ctaLink}>
              View Collection →
            </Link>
          </div>
          <div className={styles.serviceItem}>
            <h3 className={styles.serviceHeading}>
              For Sellers
            </h3>
            <p className={styles.serviceText}>
              We actively purchase individual photographs and entire collections, offering fair market valuations and discreet, professional transactions. If you have photographs to sell, we welcome the opportunity to discuss your holdings.
            </p>
            <Link href="/contact" className={styles.ctaLink}>
              Contact Us →
            </Link>
          </div>
        </div>
      </section>

      {/* E. Discover Our Collection CTA */}
      <section className={styles.ctaSection}>
        <div className={styles.ctaInner}>
          <div className={styles.ctaGoldRule} />
          <h2 className={styles.ctaHeading}>
            Discover Our Collection
          </h2>
          <p className={styles.ctaText}>
            Browse our curated selection of vintage photographs, from 19th-century masterworks to 20th-century modernist prints.
          </p>
          <div className={styles.ctaButtons}>
            <Link href="/photographs" className={styles.ctaBtn}>
              Browse Photographs →
            </Link>
            <Link href="/contact" className={styles.ctaBtnOutline}>
              Get in Touch →
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
