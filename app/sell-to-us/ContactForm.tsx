'use client';

import { useState } from 'react';
import styles from './page.module.css';

export default function ContactForm() {
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus('sending');
    const form = e.currentTarget;
    const data = new FormData(form);

    // Honeypot: if the hidden field is filled, silently discard
    if (data.get('website')) {
      setStatus('success');
      return;
    }

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        body: JSON.stringify({
          name: data.get('name'),
          email: data.get('email'),
          message: data.get('message'),
        }),
        headers: { 'Content-Type': 'application/json' },
      });
      if (res.ok) {
        setStatus('success');
        form.reset();
      } else {
        setStatus('error');
      }
    } catch {
      setStatus('error');
    }
  }

  if (status === 'success') {
    return (
      <div className={styles.successBox}>
        <p className={styles.successText}>Thank you — your message has been sent. We'll be in touch shortly.</p>
      </div>
    );
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit} noValidate>
      {/* Honeypot — hidden from real users, bots will fill it */}
      <input type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" className={styles.honeypot} />
      <div className={styles.field}>
        <label className={styles.label} htmlFor="name">Your Name <span className={styles.required}>*</span></label>
        <input className={styles.input} id="name" name="name" type="text" required autoComplete="name" />
      </div>

      <div className={styles.field}>
        <label className={styles.label} htmlFor="email">Email Address <span className={styles.required}>*</span></label>
        <input className={styles.input} id="email" name="email" type="email" required autoComplete="email" />
      </div>

      <div className={styles.field}>
        <label className={styles.label} htmlFor="message">Message <span className={styles.required}>*</span></label>
        <textarea
          className={styles.textarea}
          id="message"
          name="message"
          rows={5}
          required
          placeholder="Tell us about your inquiry..."
        />
      </div>

      {status === 'error' && (
        <p className={styles.errorText}>Something went wrong. Please try again or email us directly.</p>
      )}

      <button className={styles.submitBtn} type="submit" disabled={status === 'sending'}>
        {status === 'sending' ? 'Sending…' : 'Send Message'}
      </button>

      <p className={styles.formNote}>* Required fields. We respect your privacy and will not share your information.</p>
    </form>
  );
}
