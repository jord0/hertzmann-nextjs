export const dynamic = 'force-dynamic';

import { redirect, notFound } from 'next/navigation';
import { revalidateTag, revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { getIronSession } from 'iron-session';
import type { SessionData } from '@/lib/session';
import { sessionOptions } from '@/lib/session';
import Link from 'next/link';
import { query } from '@/lib/db';
import { uploadPhoto } from '@/lib/r2';
import { photoImageUrl } from '@/lib/photo-url';
import AddPhotoSection from './AddPhotoSection';

interface Photographer {
  id: number;
  firstName: string;
  lastName: string;
  years: string;
  country: string;
  cv: string;
  enabled: number;
  updatedAt: Date | null;
}

function formatTs(ts: Date | null): string {
  if (!ts) return '';
  return ts.toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' });
}

function makeSlug(firstName: string, lastName: string): string {
  return `${firstName || ''}-${lastName}`
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]/g, '')
    .replace(/^-+|-+$/g, '');
}

async function updatePhotographer(id: number, oldSlug: string, formData: FormData) {
  'use server';
  const session = await getIronSession<SessionData>(await cookies(), sessionOptions);
  if (!session.isLoggedIn) redirect('/admin/login');

  const firstName = (formData.get('firstName') as string).trim();
  const lastName = (formData.get('lastName') as string).trim();
  const years = (formData.get('years') as string).trim();
  const country = (formData.get('country') as string).trim();
  const cv = (formData.get('cv') as string).trim();
  const enabled = formData.get('enabled') === 'on' ? 1 : 0;

  await query(
    'UPDATE photographers SET firstName=?, lastName=?, years=?, country=?, cv=?, enabled=? WHERE id=?',
    [firstName, lastName, years, country, cv, enabled, id]
  );

  revalidateTag('browse-data', 'default');
  revalidatePath(`/photographs/photographer/${oldSlug}`);
  const newSlug = makeSlug(firstName, lastName);
  if (newSlug !== oldSlug) {
    revalidatePath(`/photographs/photographer/${newSlug}`);
  }

  redirect('/admin/photographers');
}

async function createPhoto(photographerId: number, slug: string, formData: FormData) {
  'use server';
  const session = await getIronSession<SessionData>(await cookies(), sessionOptions);
  if (!session.isLoggedIn) redirect('/admin/login');

  const title = (formData.get('title') as string).trim();
  const medium = (formData.get('medium') as string).trim();
  const date = (formData.get('date') as string).trim();
  const width = (formData.get('width') as string).trim();
  const height = (formData.get('height') as string).trim();
  const priceStr = (formData.get('price') as string).trim();
  const price = priceStr === '' ? null : (parseInt(priceStr, 10) || 0);
  const description = (formData.get('description') as string).trim();
  const provenance = (formData.get('provenance') as string).trim();
  const inventoryNumber = (formData.get('inventoryNumber') as string).trim();
  const keywordsRaw = (formData.get('keywords') as string).trim();
  const enabled = formData.get('enabled') === 'on' ? 1 : 0;

  const keywordsFormatted = keywordsRaw
    ? '|' + keywordsRaw.split(',').map(k => k.trim()).filter(Boolean).join('|') + '|'
    : '';

  const result = (await query(
    `INSERT INTO photos
      (photographer, artist, title, medium, date, width, height, price, description, provenance, inventoryNumber, keywords, enabled, illustrated, exhibitions, notes)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, '', '', '')`,
    [photographerId, photographerId, title, medium, date, width, height, price, description, provenance, inventoryNumber, keywordsFormatted, enabled]
  )) as { insertId: number };

  const photoId = result.insertId;

  const imageFile = formData.get('image') as File | null;
  if (imageFile && imageFile.size > 0) {
    const buffer = Buffer.from(await imageFile.arrayBuffer());
    await uploadPhoto(photographerId, photoId, buffer);
  }

  revalidateTag('browse-data', 'default');
  revalidateTag('carousel-photos', 'default');
  revalidatePath(`/photographs/photographer/${slug}`);

  redirect(`/admin/photographers/${photographerId}`);
}

export default async function EditPhotographerPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const rows = (await query('SELECT * FROM photographers WHERE id = ?', [id])) as Photographer[];
  if (rows.length === 0) notFound();
  const p = rows[0];
  const oldSlug = makeSlug(p.firstName, p.lastName);

  const photos = (await query(
    'SELECT id, title, enabled FROM photos WHERE photographer = ? ORDER BY title',
    [p.id]
  )) as { id: number; title: string; enabled: number }[];

  const keywordRows = await query(`
    SELECT DISTINCT TRIM(SUBSTRING_INDEX(SUBSTRING_INDEX(keywords, '|', n), '|', -1)) as keyword
    FROM photos
    CROSS JOIN (
      SELECT 1 n UNION SELECT 2 UNION SELECT 3 UNION SELECT 4 UNION SELECT 5
      UNION SELECT 6 UNION SELECT 7 UNION SELECT 8 UNION SELECT 9 UNION SELECT 10
    ) numbers
    WHERE CHAR_LENGTH(keywords) - CHAR_LENGTH(REPLACE(keywords, '|', '')) >= n - 1
    AND keywords IS NOT NULL AND keywords != ''
    AND TRIM(SUBSTRING_INDEX(SUBSTRING_INDEX(keywords, '|', n), '|', -1)) != ''
    ORDER BY keyword
  `) as { keyword: string }[];
  const allKeywords = keywordRows.map(r => r.keyword);

  const updateAction = updatePhotographer.bind(null, p.id, oldSlug);
  const createPhotoAction = createPhoto.bind(null, p.id, oldSlug);

  return (
    <div>
      <h1 style={{ marginTop: 0, marginBottom: p.updatedAt ? '0.4rem' : '1.5rem', fontSize: '2rem' }}>Edit Photographer</h1>
      {p.updatedAt && (
        <p style={{ margin: '0 0 1.5rem', fontSize: '0.8rem', color: '#888' }}>Last edited {formatTs(p.updatedAt)}</p>
      )}

      <div style={{ display: 'flex', gap: '3rem', alignItems: 'flex-start' }}>
        <div style={{ width: '480px', flexShrink: 0 }}>
          <form action={updateAction}>
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
              <Field label="First Name" name="firstName" defaultValue={p.firstName} required noMargin />
              <Field label="Last Name" name="lastName" defaultValue={p.lastName} required noMargin />
            </div>
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
              <Field label="Years Active" name="years" defaultValue={p.years || ''} noMargin />
              <Field label="Country" name="country" defaultValue={p.country || ''} noMargin />
            </div>
            <TextareaField label="CV / Bio" name="cv" defaultValue={p.cv || ''} />

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                <input type="checkbox" name="enabled" defaultChecked={!!p.enabled} />
                <span>Enabled (visible on site)</span>
              </label>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
              <button type="submit" style={submitStyle}>Save</button>
              <a href="/admin/photographers" style={cancelStyle}>Cancel</a>
            </div>
          </form>

          <AddPhotoSection action={createPhotoAction} allKeywords={allKeywords} />
        </div>

        {/* Photo thumbnails */}
        {photos.length > 0 && (
          <div style={{ flex: 1, minWidth: 0 }}>
            <h2 style={{ margin: '0 0 1rem', fontSize: '1.5rem' }}>
              Photos <span style={{ fontWeight: 400, color: '#888', fontSize: '1rem' }}>({photos.length})</span>
            </h2>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
              {photos.map(photo => (
                <Link
                  key={photo.id}
                  href={`/admin/photos/${photo.id}`}
                  style={{ textDecoration: 'none', color: 'inherit', flexShrink: 0 }}
                >
                  <div style={{ width: '220px' }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={photoImageUrl(p.id, photo.id)}
                      alt={photo.title || `Photo ${photo.id}`}
                      style={{
                        width: '220px',
                        height: '180px',
                        objectFit: 'contain',
                        backgroundColor: '#f5f5f5',
                        border: '1px solid #e0e0e0',
                        display: 'block',
                        opacity: photo.enabled ? 1 : 0.4,
                      }}
                    />
                    <p style={{
                      margin: '0.3rem 0 0',
                      fontSize: '0.72rem',
                      color: '#555',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      maxWidth: '220px',
                    }}>
                      {photo.title || <em>Untitled</em>}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function TextareaField({ label, name, defaultValue }: { label: string; name: string; defaultValue?: string }) {
  return (
    <div style={{ marginBottom: '1rem' }}>
      <label htmlFor={name} style={labelStyle}>
        {label}
      </label>
      <textarea
        id={name}
        name={name}
        rows={4}
        defaultValue={defaultValue}
        style={{ ...inputStyle, resize: 'vertical' }}
      />
    </div>
  );
}

function Field({
  label, name, defaultValue, required, placeholder, type = 'text', max, noMargin,
}: {
  label: string;
  name: string;
  defaultValue?: string;
  required?: boolean;
  placeholder?: string;
  type?: string;
  max?: number;
  noMargin?: boolean;
}) {
  return (
    <div style={{ marginBottom: noMargin ? 0 : '1rem', flex: noMargin ? 1 : undefined }}>
      <label
        htmlFor={name}
        style={labelStyle}
      >
        {label}{required && ' *'}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        required={required}
        defaultValue={defaultValue}
        placeholder={placeholder}
        max={max}
        style={inputStyle}
      />
    </div>
  );
}

const labelStyle: React.CSSProperties = {
  display: 'block', marginBottom: '0.3rem', fontSize: '0.9rem', fontWeight: 500,
};

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '0.6rem 0.75rem',
  fontSize: '1rem',
  border: '1px solid #ccc',
  borderRadius: '4px',
  boxSizing: 'border-box',
};

const submitStyle: React.CSSProperties = {
  padding: '0.6rem 1.25rem',
  backgroundColor: '#333',
  color: 'white',
  border: 'none',
  borderRadius: '4px',
  cursor: 'pointer',
  fontSize: '0.95rem',
};

const cancelStyle: React.CSSProperties = {
  padding: '0.6rem 1.25rem',
  backgroundColor: 'white',
  color: '#333',
  border: '1px solid #ccc',
  borderRadius: '4px',
  cursor: 'pointer',
  fontSize: '0.95rem',
  textDecoration: 'none',
  display: 'inline-flex',
  alignItems: 'center',
};
