import type { Metadata } from "next";
import styles from './page.module.css';

export const metadata: Metadata = {
  title: 'Contact',
  description: 'Get in touch with Susan Herzig and Paul Hertzmann about vintage photography inquiries.',
};

export default function ContactPage() {
  return (
    <div className={styles.container}>
      <h1 className={styles.heading}>Contact Us</h1>

      <div className={styles.body}>
        <p className={styles.intro}>
          We welcome inquiries about our collection. Please feel free to contact us regarding:
        </p>

        <ul className={styles.list}>
          <li className={styles.listItem}>Purchasing photographs</li>
          <li className={styles.listItem}>Selling your collection</li>
          <li className={styles.listItem}>Research inquiries</li>
          <li className={styles.listItem}>Appraisals</li>
        </ul>

        <div className={styles.contactBox}>
          <p className={styles.contactRow}>
            <strong>Email:</strong>{' '}
            <a href="mailto:hertzmann@hertzmann.com" className={styles.contactLink}>
              hertzmann@hertzmann.com
            </a>
          </p>
          <p className={styles.contactRow}>
            <strong>Phone:</strong> [Add your phone number]
          </p>
          <p className={styles.contactRow}>
            <strong>Hours:</strong> By appointment
          </p>
        </div>
      </div>
    </div>
  );
}
