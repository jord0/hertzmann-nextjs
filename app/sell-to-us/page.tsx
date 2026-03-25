import type { Metadata } from "next";
import styles from './page.module.css';

export const metadata: Metadata = {
  title: 'Contact',
  description: 'Get in touch with Susan Herzig and Paul Hertzmann about vintage photography inquiries, appraisals, or general questions.',
};

export default function ContactPage() {
  return (
    <div>
      <div className={styles.content}>
        <p className={styles.intro}>
          We are currently seeking relevant collections and individual pieces to purchase.
          If you are selling vintage photographs, we would love to hear from you.
        </p>
        <div className={styles.contactBlock}>
          <p className={styles.contactLabel}>Email</p>
          <a href="mailto:pmhi@hertzmann.net" className={styles.contactValue}>
            pmhi@hertzmann.net
          </a>
          <p className={styles.contactLabel}>Phone</p>
          <a href="tel:+14156262677" className={styles.contactValue}>
            (415) 626-2677
          </a>
        </div>
      </div>
    </div>
  );
}
