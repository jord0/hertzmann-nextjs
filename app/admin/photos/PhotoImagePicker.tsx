/* eslint-disable @next/next/no-img-element */
'use client';

import { useState } from 'react';
import { useFormStatus } from 'react-dom';
import adminStyles from '@/app/admin/admin.module.css';

interface Props {
  currentImageUrl?: string;
  photoEnabled?: boolean;
  label?: string;
}

export default function PhotoImagePicker({
  currentImageUrl,
  photoEnabled = true,
  label = 'Choose Photo',
}: Props) {
  const { pending } = useFormStatus();
  const [preview, setPreview] = useState<string | null>(null);
  const [filename, setFilename] = useState<string | null>(null);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) { setPreview(null); setFilename(null); return; }
    setFilename(file.name);
    if (preview) URL.revokeObjectURL(preview);
    setPreview(URL.createObjectURL(file));
  }

  const displayImage = preview ?? currentImageUrl;
  const hasNewFile = !!preview;

  return (
    <div>
      {displayImage && (
        <div style={{ position: 'relative', display: 'inline-block', maxWidth: '100%' }}>
          <img
            src={displayImage}
            alt="Photo preview"
            style={{
              maxWidth: '100%',
              maxHeight: '500px',
              width: 'auto',
              height: 'auto',
              objectFit: 'contain',
              backgroundColor: '#f5f5f5',
              border: '1px solid #e0e0e0',
              display: 'block',
              opacity: !hasNewFile && !photoEnabled ? 0.4 : 1,
            }}
          />
          {pending && hasNewFile && (
            <div style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: 'rgba(255, 255, 255, 0.8)',
              fontSize: '0.9rem',
              fontWeight: 500,
              color: '#333',
            }}>
              Uploading…
            </div>
          )}
        </div>
      )}
      {!hasNewFile && currentImageUrl && !photoEnabled && (
        <p style={{ margin: '0.5rem 0 0', fontSize: '0.8rem', color: '#888' }}>
          Disabled — not visible on site
        </p>
      )}
      <div style={{ marginTop: displayImage ? '1.25rem' : 0 }}>
        <div className={adminStyles.fileInputWrap}>
          <label className={adminStyles.fileInputLabel}>
            ↑ {filename ? 'Change Photo' : label}
            <input
              type="file"
              name="image"
              accept="image/jpeg"
              onChange={handleChange}
              className={adminStyles.fileInput}
              disabled={pending}
            />
          </label>
        </div>
        <p className={adminStyles.fileNameHint}>
          {filename ?? 'JPEG only'}
        </p>
      </div>
    </div>
  );
}
