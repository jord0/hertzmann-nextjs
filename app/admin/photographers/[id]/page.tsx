import { redirect, notFound } from 'next/navigation';
import { revalidateTag, revalidatePath } from 'next/cache';
import { query } from '@/lib/db';
import { uploadPhoto } from '@/lib/r2';
import KeywordPicker from '../../photos/KeywordPicker';

interface Photographer {
  id: number;
  firstName: string;
  lastName: string;
  years: string;
  country: string;
  cv: string;
  enabled: number;
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
  const title = (formData.get('title') as string).trim();
  const medium = (formData.get('medium') as string).trim();
  const date = (formData.get('date') as string).trim();
  const width = (formData.get('width') as string).trim();
  const height = (formData.get('height') as string).trim();
  const price = (formData.get('price') as string).trim();
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
      (photographer, title, medium, date, width, height, price, description, provenance, inventoryNumber, keywords, enabled)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [photographerId, title, medium, date, width, height, price, description, provenance, inventoryNumber, keywordsFormatted, enabled]
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
      <h1 style={{ marginTop: 0 }}>Edit Photographer</h1>

      <form action={updateAction} style={{ maxWidth: '480px' }}>
        <Field label="First Name" name="firstName" defaultValue={p.firstName} required />
        <Field label="Last Name" name="lastName" defaultValue={p.lastName} required />
        <Field label="Years Active" name="years" defaultValue={p.years || ''} />
        <Field label="Country" name="country" defaultValue={p.country || ''} />
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

      {/* Add Photo */}
      <hr style={{ margin: '2.5rem 0', border: 'none', borderTop: '1px solid #ddd' }} />
      <h2 style={{ margin: '0 0 1.5rem', fontSize: '1.25rem' }}>Add Photo</h2>

      <form action={createPhotoAction} encType="multipart/form-data" style={{ maxWidth: '600px' }}>
        <Field label="Title" name="title" />
        <Field label="Medium" name="medium" />
        <Field label="Date" name="date" placeholder="e.g. 1952" />
        <Field label="Width" name="width" placeholder="in inches" />
        <Field label="Height" name="height" placeholder="in inches" />
        <Field label="Price" name="price" />
        <Field label="Inventory Number" name="inventoryNumber" />

        <TextareaField label="Description" name="description" />
        <TextareaField label="Provenance" name="provenance" />

        <KeywordPicker allKeywords={allKeywords} />

        <div style={{ marginBottom: '1rem' }}>
          <label htmlFor="photo-image" style={labelStyle}>Image (JPEG)</label>
          <input
            id="photo-image"
            name="image"
            type="file"
            accept="image/jpeg"
            style={{ display: 'block', marginTop: '0.3rem' }}
          />
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
            <input type="checkbox" name="enabled" defaultChecked />
            <span>Enabled (visible on site)</span>
          </label>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
          <button type="submit" style={submitStyle}>Add Photo</button>
        </div>
      </form>
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
  label, name, defaultValue, required, placeholder,
}: {
  label: string;
  name: string;
  defaultValue?: string;
  required?: boolean;
  placeholder?: string;
}) {
  return (
    <div style={{ marginBottom: '1rem' }}>
      <label
        htmlFor={name}
        style={labelStyle}
      >
        {label}{required && ' *'}
      </label>
      <input
        id={name}
        name={name}
        type="text"
        required={required}
        defaultValue={defaultValue}
        placeholder={placeholder}
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
