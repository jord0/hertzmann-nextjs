'use client';

import styles from './not-found.module.css';

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className={styles.container}>
      <p className={styles.code}>Error</p>
      <h1 className={styles.heading}>Something went wrong</h1>
      <p className={styles.body}>An unexpected error occurred. Please try again.</p>
      <button onClick={reset} className={styles.link}>Try again</button>
    </div>
  );
}
