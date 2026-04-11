import Link from 'next/link';
import styles from './not-found.module.css';

export default function NotFound() {
  return (
    <div className={styles.container}>
      <p className={styles.code}>404</p>
      <h1 className={styles.heading}>Page Not Found</h1>
      <p className={styles.body}>The page you&rsquo;re looking for doesn&rsquo;t exist or may have moved.</p>
      <Link href="/" className={styles.link}>Return home</Link>
    </div>
  );
}
