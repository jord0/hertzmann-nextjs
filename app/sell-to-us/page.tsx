import type { Metadata } from "next";
import styles from './page.module.css';

export const metadata: Metadata = {
  title: 'Contact',
  description: 'Get in touch with Susan Herzig and Paul Hertzmann about vintage photography inquiries, appraisals, or general questions.',
};

export default function ContactPage() {
  return (
    <div>
      <div className={styles.pageHeader}>
        <div className={styles.pageHeaderInner}>
          <h1 className={styles.pageTitle}>Sell to Us</h1>
        </div>
      </div>
      <div className={styles.content}>
        <div className={styles.card}>
          <p className={styles.intro}>
            We are currently seeking relevant collections and individual pieces to purchase.
            If you are selling vintage photographs, we would love to hear from you.
          </p>
          <div className={styles.contactBlock}>
            <p className={styles.contactLabel}>Email</p>
            <a href="mailto:pmhi@hertzmann.net" className={styles.contactValue} target="_blank" rel="noopener noreferrer">
              pmhi@hertzmann.net
            </a>
            <p className={styles.contactLabel}>Phone</p>
            <span className={styles.contactValue}>
              (415) 626-2677
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
