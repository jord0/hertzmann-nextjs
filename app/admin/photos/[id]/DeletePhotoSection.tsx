'use client';

import { useState } from 'react';
import adminStyles from '@/app/admin/admin.module.css';

interface Props {
  action: () => Promise<void>;
}

export default function DeletePhotoSection({ action }: Props) {
  const [confirming, setConfirming] = useState(false);

  return (
    <div style={{ maxWidth: '480px' }}>
      <h2 style={{ fontSize: '1rem', marginTop: 0, color: '#c00' }}>Delete Photo</h2>

      {!confirming ? (
        <button
          type="button"
          className={adminStyles.btnDanger}
          onClick={() => setConfirming(true)}
        >
          Delete Photo
        </button>
      ) : (
        <div>
          <p style={{ fontSize: '0.9rem', color: '#333', marginTop: 0, marginBottom: '1rem' }}>
            Are you sure you want to delete this photograph? This can&apos;t be undone.
          </p>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <form action={action}>
              <button type="submit" className={adminStyles.btnDanger}>
                Yes, delete permanently
              </button>
            </form>
            <button
              type="button"
              className={adminStyles.btnSecondary}
              onClick={() => setConfirming(false)}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
