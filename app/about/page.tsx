import type { Metadata } from "next";
import styles from './page.module.css';

export const metadata: Metadata = {
  title: 'About',
  description: 'Learn about Susan Herzig and Paul Hertzmann\'s vintage photography collection and expertise.',
};

export default function AboutPage() {
  return (
    <div className={styles.container}>
      <h1 className={styles.heading}>About Us</h1>

      <div className={styles.body}>
        <p className={styles.para}>
          Susan Herzig and Paul Hertzmann specialize in 20th-century vintage photography including modernism,
          f.64, photojournalism, the Photo-Secession, post-World War II innovations, as well as 19th century
          American landscape photography and unusual or exceptional photographic albums.
        </p>

        <p className={styles.para}>
          Our specialization extends to portraits of American artists, including &ldquo;ex-pats&rdquo; who lived and worked
          abroad and artists who visited or emigrated to the United States.
        </p>

        <p className={styles.para}>
          With more than 50 years of experience buying and selling vintage photographs, we are pleased to share
          our expertise with museums, private collectors, and colleagues. Our knowledge of the art market, our
          connoisseurship, and extensive research enable us to offer photographs of quality, rarity, and importance.
        </p>

        <p>
          Many photographs available for sale are not posted on this website. Please contact us for additional
          photographs. Prices are listed for photographs below $10,000; contact us for prices not posted.
        </p>
      </div>
    </div>
  );
}
