export const dynamic = 'force-dynamic';

import { redirect, notFound } from 'next/navigation';
import { revalidateTag, revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { getIronSession } from 'iron-session';
import type { SessionData } from '@/lib/session';
import { sessionOptions } from '@/lib/session';
import { query } from '@/lib/db';
import { uploadPhoto } from '@/lib/r2';
import KeywordPicker from '../KeywordPicker';

interface Photo {
  id: number;
  photographer: number;
  title: string;
  medium: string;
  date: string;
  width: string;
  height: string;
  price: string;
  description: string;
  provenance: string;
  inventoryNumber: string;
  keywords: string;
  enabled: number;
  updatedAt: Date | null;
}

function formatTs(ts: Date | null): string {
  if (!ts) return '';
  return ts.toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' });
}

interface PhotographerOption {
  id: number;
  firstName: string;
  lastName: string;
}

function makeSlug(firstName: string, lastName: string): string {
  return `${firstName || ''}-${lastName}`
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]/g, '')
    .replace(/^-+|-+$/g, '');
}

// Convert pipe-delimited |kw1|kw2| to comma-separated for the form
function pipesToComma(keywords: string): string {
  return keywords.replace(/^\||\|$/g, '').split('|').filter(Boolean).join(', ');
}

async function updatePhoto(photoId: number, formData: FormData) {
  'use server';
  const session = await getIronSession<SessionData>(await cookies(), sessionOptions);
  if (!session.isLoggedIn) redirect('/admin/login');

  const photographer = parseInt(formData.get('photographer') as string, 10);
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

  await query(
    `UPDATE photos SET
      photographer=?, artist=?, title=?, medium=?, date=?, width=?, height=?,
      price=?, description=?, provenance=?, inventoryNumber=?, keywords=?, enabled=?
     WHERE id=?`,
    [photographer, photographer, title, medium, date, width, height, price, description, provenance, inventoryNumber, keywordsFormatted, enabled, photoId]
  );

  // Upload new image if provided
  const imageFile = formData.get('image') as File | null;
  if (imageFile && imageFile.size > 0) {
    const buffer = Buffer.from(await imageFile.arrayBuffer());
    await uploadPhoto(photographer, photoId, buffer);
  }

  // Get photographer info for revalidation
  const photographers = (await query(
    'SELECT firstName, lastName FROM photographers WHERE id = ?',
    [photographer]
  )) as { firstName: string; lastName: string }[];

  revalidateTag('browse-data', 'default');
  revalidateTag('carousel-photos', 'default');
  if (photographers.length > 0) {
    const slug = makeSlug(photographers[0].firstName, photographers[0].lastName);
    revalidatePath(`/photographs/photographer/${slug}`);
  }

  redirect('/admin');
}

export default async function EditPhotoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const rows = (await query('SELECT * FROM photos WHERE id = ?', [id])) as Photo[];
  if (rows.length === 0) notFound();
  const photo = rows[0];

  const photographers = (await query(
    'SELECT id, firstName, lastName FROM photographers ORDER BY lastName, firstName'
  )) as PhotographerOption[];

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
  const selectedKeywords = (photo.keywords || '')
    .replace(/^\||\|$/g, '').split('|').filter(Boolean);

  const action = updatePhoto.bind(null, photo.id);

  return (
    <div>
      <h1 style={{ marginTop: 0, marginBottom: photo.updatedAt ? '0.4rem' : undefined }}>Edit Photo #{photo.id}</h1>
      {photo.updatedAt && (
        <p style={{ margin: '0 0 1.5rem', fontSize: '0.8rem', color: '#888' }}>Last edited {formatTs(photo.updatedAt)}</p>
      )}

      <form action={action} style={{ maxWidth: '600px' }}>
        <div style={{ marginBottom: '1rem' }}>
          <label htmlFor="photographer" style={labelStyle}>Photographer *</label>
          <select id="photographer" name="photographer" required defaultValue={photo.photographer} style={selectStyle}>
            {photographers.map(p => (
              <option key={p.id} value={p.id}>
                {p.firstName} {p.lastName}
              </option>
            ))}
          </select>
        </div>

        <Field label="Title" name="title" defaultValue={photo.title} required />
        <Field label="Medium" name="medium" defaultValue={photo.medium} />
        <Field label="Date" name="date" defaultValue={photo.date} />
        <Field label="Width" name="width" defaultValue={photo.width} />
        <Field label="Height" name="height" defaultValue={photo.height} />
        <Field label="Price" name="price" defaultValue={photo.price} type="number" max={8388607} />
        <Field label="Inventory Number" name="inventoryNumber" defaultValue={photo.inventoryNumber} maxLength={10} />

        <TextareaField label="Description" name="description" defaultValue={photo.description} />
        <TextareaField label="Provenance" name="provenance" defaultValue={photo.provenance} />

        <KeywordPicker allKeywords={allKeywords} selected={selectedKeywords} />

        <div style={{ marginBottom: '1rem' }}>
          <label htmlFor="image" style={labelStyle}>Replace Image (JPEG, optional)</label>
          <input
            id="image"
            name="image"
            type="file"
            accept="image/jpeg"
            style={{ display: 'block', marginTop: '0.3rem' }}
          />
          <p style={{ margin: '0.3rem 0 0', fontSize: '0.8rem', color: '#888' }}>
            Current: {photo.photographer}_{photo.id}.jpg — leave blank to keep existing image
          </p>
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
            <input type="checkbox" name="enabled" defaultChecked={!!photo.enabled} />
            <span>Enabled (visible on site)</span>
          </label>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
          <button type="submit" style={submitStyle}>Save</button>
          <a href="/admin" style={cancelStyle}>Cancel</a>
        </div>
      </form>
    </div>
  );
}

function Field({ label, name, defaultValue, required, placeholder, type = 'text', max, maxLength }: {
  label: string; name: string; defaultValue?: string | number; required?: boolean; placeholder?: string; type?: string; max?: number; maxLength?: number;
}) {
  return (
    <div style={{ marginBottom: '1rem' }}>
      <label htmlFor={name} style={labelStyle}>{label}{required && ' *'}</label>
      <input
        id={name}
        name={name}
        type={type}
        required={required}
        defaultValue={defaultValue}
        placeholder={placeholder}
        max={max}
        maxLength={maxLength}
        style={inputStyle}
      />
    </div>
  );
}

function TextareaField({ label, name, defaultValue }: { label: string; name: string; defaultValue?: string }) {
  return (
    <div style={{ marginBottom: '1rem' }}>
      <label htmlFor={name} style={labelStyle}>{label}</label>
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

const selectStyle: React.CSSProperties = {
  ...inputStyle,
  backgroundColor: 'white',
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
