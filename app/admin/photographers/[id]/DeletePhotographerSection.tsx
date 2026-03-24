'use client';

import { useState } from 'react';
import adminStyles from '@/app/admin/admin.module.css';

interface Props {
  action: () => Promise<void>;
  photoCount: number;
}

export default function DeletePhotographerSection({ action, photoCount }: Props) {
  const [confirmed, setConfirmed] = useState(false);

  return (
    <div style={{ maxWidth: '480px' }}>
      <h2 style={{ fontSize: '1rem', marginTop: 0, color: '#c00' }}>Delete Photographer</h2>
      <p style={{ fontSize: '0.9rem', color: '#666', marginTop: 0 }}>
        Permanently deletes this photographer and all {photoCount} associated photo{photoCount !== 1 ? 's' : ''} from the database.
        Photo image files are also removed from R2. This cannot be undone.
      </p>
      <label style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', fontSize: '0.9rem', color: '#333', cursor: 'pointer', marginBottom: '1rem' }}>
        <input
          type="checkbox"
          checked={confirmed}
          onChange={e => setConfirmed(e.target.checked)}
          style={{ marginTop: '2px', flexShrink: 0 }}
        />
        <span>I understand this will permanently delete this photographer and all their photos from the database and R2.</span>
      </label>
      <form action={action}>
        <button
          type="submit"
          className={adminStyles.btnDanger}
          disabled={!confirmed}
          style={{ opacity: confirmed ? 1 : 0.4, cursor: confirmed ? 'pointer' : 'not-allowed' }}
        >
          Delete Photographer
        </button>
      </form>
    </div>
  );
}
