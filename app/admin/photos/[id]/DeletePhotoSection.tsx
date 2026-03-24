'use client';

import { useState } from 'react';
import adminStyles from '@/app/admin/admin.module.css';

interface Props {
  action: () => Promise<void>;
}

export default function DeletePhotoSection({ action }: Props) {
  const [confirmed, setConfirmed] = useState(false);

  return (
    <div style={{ maxWidth: '480px' }}>
      <h2 style={{ fontSize: '1rem', marginTop: 0, color: '#c00' }}>Delete Photo</h2>
      <p style={{ fontSize: '0.9rem', color: '#666', marginTop: 0 }}>
        Permanently removes this photo record from the database and deletes the image file from R2. This cannot be undone.
      </p>
      <label style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', fontSize: '0.9rem', color: '#333', cursor: 'pointer', marginBottom: '1rem' }}>
        <input
          type="checkbox"
          checked={confirmed}
          onChange={e => setConfirmed(e.target.checked)}
          style={{ marginTop: '2px', flexShrink: 0 }}
        />
        <span>I understand this will permanently delete this photo from the database and R2.</span>
      </label>
      <form action={action}>
        <button
          type="submit"
          className={adminStyles.btnDanger}
          disabled={!confirmed}
          style={{ opacity: confirmed ? 1 : 0.4, cursor: confirmed ? 'pointer' : 'not-allowed' }}
        >
          Delete Photo
        </button>
      </form>
    </div>
  );
}
