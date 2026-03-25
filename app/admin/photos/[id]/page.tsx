export const dynamic = 'force-dynamic';

import { redirect, notFound } from 'next/navigation';
import { revalidateTag, revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { getIronSession } from 'iron-session';
import type { SessionData } from '@/lib/session';
import { sessionOptions } from '@/lib/session';
import { query } from '@/lib/db';
import adminStyles from '@/app/admin/admin.module.css';
import { uploadPhoto, deletePhoto } from '@/lib/r2';
import { photoImageUrl } from '@/lib/photo-url';
import KeywordPicker from '../KeywordPicker';
import DeletePhotoSection from './DeletePhotoSection';

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
  illustrated: string;
  exhibitions: string;
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

async function updatePhoto(photoId: number, formData: FormData) {
  'use server';
  const session = await getIronSession<SessionData>(await cookies(), sessionOptions);
  if (!session.isLoggedIn) redirect('/admin/login');

  const photographer = parseInt(formData.get('photographer') as string, 10);
  const title = ((formData.get('title') as string) || '').trim();
  const medium = ((formData.get('medium') as string) || '').trim();
  const date = ((formData.get('date') as string) || '').trim();
  const width = ((formData.get('width') as string) || '').trim();
  const height = ((formData.get('height') as string) || '').trim();
  const priceStr = ((formData.get('price') as string) || '').trim();
  const price = priceStr === '' ? null : (parseInt(priceStr, 10) || 0);
  const description = ((formData.get('description') as string) || '').trim();
  const provenance = ((formData.get('provenance') as string) || '').trim();
  const inventoryNumber = ((formData.get('inventoryNumber') as string) || '').trim();
  const keywordsRaw = ((formData.get('keywords') as string) || '').trim();
  const illustrated = ((formData.get('illustrated') as string) || '').trim();
  const exhibitions = ((formData.get('exhibitions') as string) || '').trim();
  const enabled = formData.get('enabled') === 'on' ? 1 : 0;

  const keywordsFormatted = keywordsRaw
    ? '|' + keywordsRaw.split(',').map(k => k.trim()).filter(Boolean).join('|') + '|'
    : '';

  await query(
    `UPDATE photos SET
      photographer=?, artist=?, title=?, medium=?, date=?, width=?, height=?,
      price=?, description=?, provenance=?, inventoryNumber=?, keywords=?,
      illustrated=?, exhibitions=?, enabled=?
     WHERE id=?`,
    [photographer, photographer, title, medium, date, width, height, price, description, provenance, inventoryNumber, keywordsFormatted, illustrated, exhibitions, enabled, photoId]
  );

  const imageFile = formData.get('image') as File | null;
  if (imageFile && imageFile.size > 0) {
    const buffer = Buffer.from(await imageFile.arrayBuffer());
    await uploadPhoto(photographer, photoId, buffer);
  }

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

  redirect(`/admin/photos/${photoId}?saved=1`);
}

async function deletePhotoRecord(photoId: number) {
  'use server';
  const session = await getIronSession<SessionData>(await cookies(), sessionOptions);
  if (!session.isLoggedIn) redirect('/admin/login');

  const rows = (await query(
    'SELECT photographer FROM photos WHERE id = ?',
    [photoId]
  )) as { photographer: number }[];

  if (rows.length > 0) {
    try { await deletePhoto(rows[0].photographer, photoId); } catch { /* file may not exist */ }
  }

  await query('DELETE FROM photos WHERE id = ?', [photoId]);

  if (rows.length > 0) {
    const photographers = (await query(
      'SELECT firstName, lastName FROM photographers WHERE id = ?',
      [rows[0].photographer]
    )) as { firstName: string; lastName: string }[];

    revalidateTag('browse-data', 'default');
    revalidateTag('carousel-photos', 'default');
    if (photographers.length > 0) {
      const slug = makeSlug(photographers[0].firstName, photographers[0].lastName);
      revalidatePath(`/photographs/photographer/${slug}`);
    }
  }

  redirect('/admin/photos');
}

export default async function EditPhotoPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ saved?: string; created?: string }>;
}) {
  const { id } = await params;
  const sp = await searchParams;
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
  const deleteAction = deletePhotoRecord.bind(null, photo.id);

  return (
    <div>
      {(sp.saved || sp.created) && (
        <div style={{
          marginBottom: '1.5rem',
          padding: '0.75rem 1rem',
          backgroundColor: '#dcfce7',
          border: '1px solid #bbf7d0',
          borderRadius: '4px',
          color: '#15803d',
          fontSize: '0.9rem',
        }}>
          {sp.created ? 'Photo created successfully.' : 'Changes saved successfully.'}
        </div>
      )}

      <h1 style={{ marginTop: 0, marginBottom: photo.updatedAt ? '0.4rem' : '1.5rem', fontSize: '2rem' }}>Edit Photo #{photo.id}</h1>
      {photo.updatedAt && (
        <p style={{ margin: '0 0 1.5rem', fontSize: '0.8rem', color: '#888' }}>Last edited {formatTs(photo.updatedAt)}</p>
      )}

      <form action={action}>
        <div style={{ display: 'flex', gap: '3rem', alignItems: 'flex-start' }}>
          <div style={{ width: '480px', flexShrink: 0 }}>
            <div style={{ marginBottom: '1rem' }}>
              <label htmlFor="photographer" style={labelStyle}>Photographer (required)</label>
              <select id="photographer" name="photographer" required defaultValue={photo.photographer} style={selectStyle}>
                {photographers.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.firstName} {p.lastName}
                  </option>
                ))}
              </select>
            </div>

            <Field label="Inventory Number" name="inventoryNumber" defaultValue={photo.inventoryNumber} placeholder="e.g. HI-1234" />
            <Field label="Title" name="title" defaultValue={photo.title} required />

            <KeywordPicker allKeywords={allKeywords} selected={selectedKeywords} />

            <Field label="Medium" name="medium" defaultValue={photo.medium} placeholder="e.g. Gelatin silver print" />
            <Field label="Date" name="date" defaultValue={photo.date} />

            <div style={{ display: 'flex', gap: '1rem' }}>
              <Field label="Height (inches)" name="height" defaultValue={photo.height} noMargin />
              <Field label="Width (inches)" name="width" defaultValue={photo.width} noMargin />
            </div>
            <div style={{ height: '1rem' }} />

            <Field label="Price" name="price" defaultValue={photo.price} type="number" max={8388607} placeholder="Leave blank if not for sale" />

            <TextareaField label="Provenance" name="provenance" defaultValue={photo.provenance} />
            <TextareaField label="Illustrated" name="illustrated" defaultValue={photo.illustrated} placeholder="e.g. Published in..." rows={2} />
            <TextareaField label="Exhibitions" name="exhibitions" defaultValue={photo.exhibitions} rows={2} />

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                <input type="checkbox" name="enabled" defaultChecked={!!photo.enabled} />
                <span>Enabled (visible on site)</span>
              </label>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
              <button type="submit" className={adminStyles.btnPrimary}>Save</button>
              <a href="/admin/photos" className={adminStyles.btnSecondary}>Cancel</a>
            </div>
          </div>

          {/* Photo preview + replace image */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <h2 style={{ margin: '0 0 1rem', fontSize: '1.5rem' }}>Preview</h2>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={photoImageUrl(photo.photographer, photo.id)}
              alt={photo.title || `Photo ${photo.id}`}
              style={{
                maxWidth: '100%',
                maxHeight: '500px',
                width: 'auto',
                height: 'auto',
                objectFit: 'contain',
                backgroundColor: '#f5f5f5',
                border: '1px solid #e0e0e0',
                display: 'block',
                opacity: photo.enabled ? 1 : 0.4,
              }}
            />
            {!photo.enabled && (
              <p style={{ margin: '0.5rem 0 0', fontSize: '0.8rem', color: '#888' }}>Disabled — not visible on site</p>
            )}
            <div style={{ marginTop: '1.5rem' }}>
              <div className={adminStyles.fileInputWrap}>
                <label htmlFor="image" className={adminStyles.fileInputLabel}>
                  ↑ Replace Image
                </label>
                <input
                  id="image"
                  name="image"
                  type="file"
                  accept="image/jpeg"
                  className={adminStyles.fileInput}
                />
              </div>
              <p className={adminStyles.fileNameHint}>JPEG only</p>
            </div>
          </div>
        </div>
      </form>

      <hr style={{ margin: '3rem 0 1.5rem', border: 'none', borderTop: '1px solid #ddd' }} />

      <DeletePhotoSection action={deleteAction} />
    </div>
  );
}

function Field({ label, name, defaultValue, required, placeholder, type = 'text', max, noMargin }: {
  label: string; name: string; defaultValue?: string | number; required?: boolean; placeholder?: string; type?: string; max?: number; noMargin?: boolean;
}) {
  return (
    <div style={{ marginBottom: noMargin ? 0 : '1rem', flex: noMargin ? 1 : undefined }}>
      <label htmlFor={name} style={labelStyle}>{label}{required && ' (required)'}</label>
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

function TextareaField({ label, name, defaultValue, placeholder, rows = 4 }: {
  label: string; name: string; defaultValue?: string; placeholder?: string; rows?: number;
}) {
  return (
    <div style={{ marginBottom: '1rem' }}>
      <label htmlFor={name} style={labelStyle}>{label}</label>
      <textarea
        id={name}
        name={name}
        rows={rows}
        defaultValue={defaultValue}
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
