import { redirect } from 'next/navigation';
import { revalidateTag, revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { getIronSession } from 'iron-session';
import type { SessionData } from '@/lib/session';
import { sessionOptions } from '@/lib/session';
import { query } from '@/lib/db';
import { uploadPhoto } from '@/lib/r2';
import KeywordPicker from '../KeywordPicker';
import adminStyles from '@/app/admin/admin.module.css';

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

async function createPhoto(formData: FormData) {
  'use server';
  const session = await getIronSession<SessionData>(await cookies(), sessionOptions);
  if (!session.isLoggedIn) redirect('/admin/login');

  const photographerId = parseInt(formData.get('photographerId') as string, 10);
  const title = ((formData.get('title') as string) || '').trim();
  const medium = ((formData.get('medium') as string) || '').trim();
  const date = ((formData.get('date') as string) || '').trim();
  const width = ((formData.get('width') as string) || '').trim();
  const height = ((formData.get('height') as string) || '').trim();
  const priceStr = ((formData.get('price') as string) || '').trim();
  const price = priceStr === '' ? 0 : (parseInt(priceStr, 10) || 0);
  const description = ((formData.get('description') as string) || '').trim();
  const provenance = ((formData.get('provenance') as string) || '').trim();
  const inventoryNumber = ((formData.get('inventoryNumber') as string) || '').trim();
  const keywordsRaw = ((formData.get('keywords') as string) || '').trim();
  const illustrated = ((formData.get('illustrated') as string) || '').trim();
  const exhibitions = ((formData.get('exhibitions') as string) || '').trim();
  const levelStr = ((formData.get('level') as string) || '').trim();
  const level = levelStr === '' ? 0 : (parseInt(levelStr, 10) || 0);
  const enabled = formData.get('enabled') === 'on' ? 1 : 0;

  const keywordsFormatted = keywordsRaw
    ? '|' + keywordsRaw.split(',').map(k => k.trim()).filter(Boolean).join('|') + '|'
    : '';

  const result = (await query(
    `INSERT INTO photos
      (photographer, artist, title, medium, date, width, height, price, description, provenance, inventoryNumber, keywords, enabled, illustrated, exhibitions, level, notes)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, '')`,
    [photographerId, photographerId, title, medium, date, width, height, price, description, provenance, inventoryNumber, keywordsFormatted, enabled, illustrated, exhibitions, level]
  )) as { insertId: number };

  const photoId = result.insertId;

  const imageFile = formData.get('image') as File | null;
  if (imageFile && imageFile.size > 0) {
    const buffer = Buffer.from(await imageFile.arrayBuffer());
    await uploadPhoto(photographerId, photoId, buffer);
  }

  const photographers = (await query(
    'SELECT firstName, lastName FROM photographers WHERE id = ?',
    [photographerId]
  )) as { firstName: string; lastName: string }[];

  revalidateTag('browse-data', 'default');
  revalidateTag('carousel-photos', 'default');
  if (photographers.length > 0) {
    const slug = makeSlug(photographers[0].firstName, photographers[0].lastName);
    revalidatePath(`/photographs/photographer/${slug}`);
  }

  redirect(`/admin/photos/${photoId}?created=1`);
}

export default async function NewPhotoPage() {
  const session = await getIronSession<SessionData>(await cookies(), sessionOptions);
  if (!session.isLoggedIn) redirect('/admin/login');

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

  return (
    <div>
      <h1 style={{ marginTop: 0, fontSize: '2rem' }}>Add Photograph and Inventory Information</h1>

      <form action={createPhoto} style={{ maxWidth: '600px' }}>
        <div style={{ marginBottom: '1rem' }}>
          <label htmlFor="photographerId" style={labelStyle}>Photographer (required)</label>
          <select id="photographerId" name="photographerId" required style={selectStyle}>
            <option value="">— select —</option>
            {photographers.map(p => (
              <option key={p.id} value={p.id}>
                {p.firstName} {p.lastName}
              </option>
            ))}
          </select>
        </div>

        <Field label="Inventory Number" name="inventoryNumber" placeholder="e.g. HI-1234" />
        <Field label="Title" name="title" required />

        <KeywordPicker allKeywords={allKeywords} />

        <Field label="Medium" name="medium" placeholder="e.g. Gelatin silver print" />
        <Field label="Date" name="date" placeholder="e.g. 1952" />

        <div style={{ display: 'flex', gap: '1rem' }}>
          <Field label="Height (inches)" name="height" placeholder="e.g. 10" noMargin />
          <Field label="Width (inches)" name="width" placeholder="e.g. 8" noMargin />
        </div>
        <div style={{ height: '1rem' }} />

        <Field label="Price" name="price" type="number" max={8388607} hint="Enter 0 or leave empty if no price" />

        <TextareaField label="Provenance" name="provenance" />
        <TextareaField label="Illustrated" name="illustrated" placeholder="e.g. Published in..." rows={2} />
        <TextareaField label="Exhibitions" name="exhibitions" rows={2} />

        <Field label="Display Order" name="level" type="number" hint="Lower numbers appear first on the artist page" />

        <div style={{ marginBottom: '1rem' }}>
          <label style={labelStyle}>Image (JPEG)</label>
          <div className={adminStyles.fileInputWrap} style={{ marginTop: '0.3rem' }}>
            <label className={adminStyles.fileInputLabel}>
              Choose File
              <input className={adminStyles.fileInput} type="file" name="image" accept="image/jpeg" />
            </label>
          </div>
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
            <input type="checkbox" name="enabled" defaultChecked />
            <span>Enabled (visible on site)</span>
          </label>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
          <button type="submit" className={adminStyles.btnPrimary}>Save</button>
          <a href="/admin/photos" className={adminStyles.btnSecondary}>Cancel</a>
        </div>
      </form>
    </div>
  );
}

function Field({ label, name, required, placeholder, type = 'text', max, noMargin, hint }: {
  label: string; name: string; required?: boolean; placeholder?: string; type?: string; max?: number; noMargin?: boolean; hint?: string;
}) {
  return (
    <div style={{ marginBottom: noMargin ? 0 : '1rem', flex: noMargin ? 1 : undefined }}>
      <label htmlFor={name} style={labelStyle}>{label}{required && ' (required)'}</label>
      <input
        id={name}
        name={name}
        type={type}
        required={required}
        placeholder={placeholder}
        max={max}
        style={inputStyle}
      />
      {hint && <p style={{ margin: '0.3rem 0 0', fontSize: '0.8rem', color: '#888' }}>{hint}</p>}
    </div>
  );
}

function TextareaField({ label, name, placeholder, rows = 4 }: { label: string; name: string; placeholder?: string; rows?: number }) {
  return (
    <div style={{ marginBottom: '1rem' }}>
      <label htmlFor={name} style={labelStyle}>{label}</label>
      <textarea
        id={name}
        name={name}
        rows={rows}
        placeholder={placeholder}
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
