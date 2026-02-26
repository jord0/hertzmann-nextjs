import type { Metadata } from "next";
import ContactForm from './ContactForm';
import styles from './page.module.css';

export const metadata: Metadata = {
  title: 'Contact',
  description: 'Get in touch with Susan Herzig and Paul Hertzmann about vintage photography inquiries, appraisals, or general questions.',
};

export default function ContactPage() {
  return (
    <div>
      <div className={styles.goldHeader}>
        <div className={styles.headerInner}>
          <h1 className={styles.headerTitle}>Contact</h1>
          <p className={styles.headerSub}>Get in touch with us for inquiries, appraisals, or general questions</p>
        </div>
      </div>

      <div className={styles.content}>
        <div className={styles.formBox}>
          <ContactForm />
        </div>

        <p className={styles.directContact}>
          You can also reach us directly at:
          <a href="mailto:hertzmann@hertzmann.com" className={styles.directEmail}>
            hertzmann@hertzmann.com
          </a>
        </p>
      </div>
    </div>
  );
}
