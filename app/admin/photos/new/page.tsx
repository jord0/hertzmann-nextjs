import { redirect } from 'next/navigation';
import { revalidateTag, revalidatePath } from 'next/cache';
import { query } from '@/lib/db';
import { uploadPhotoToHE } from '@/lib/sftp';

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
  const photographerId = parseInt(formData.get('photographerId') as string, 10);
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

  // Convert comma-separated keywords to pipe-delimited format: |kw1|kw2|
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

  // Upload image if provided
  const imageFile = formData.get('image') as File | null;
  if (imageFile && imageFile.size > 0) {
    const buffer = Buffer.from(await imageFile.arrayBuffer());
    await uploadPhotoToHE(photographerId, photoId, buffer);
  }

  // Get photographer info for revalidation
  const photographers = (await query(
    'SELECT firstName, lastName FROM photographers WHERE id = ?',
    [photographerId]
  )) as { firstName: string; lastName: string }[];

  revalidateTag('browse-data', 'default');
  if (photographers.length > 0) {
    const slug = makeSlug(photographers[0].firstName, photographers[0].lastName);
    revalidatePath(`/photographs/photographer/${slug}`);
  }

  redirect('/admin');
}

export default async function NewPhotoPage() {
  const photographers = (await query(
    'SELECT id, firstName, lastName FROM photographers WHERE enabled = 1 ORDER BY lastName, firstName'
  )) as PhotographerOption[];

  return (
    <div>
      <h1 style={{ marginTop: 0 }}>Add Photo</h1>

      <form action={createPhoto} encType="multipart/form-data" style={{ maxWidth: '600px' }}>
        <div style={{ marginBottom: '1rem' }}>
          <label htmlFor="photographerId" style={labelStyle}>Photographer *</label>
          <select id="photographerId" name="photographerId" required style={selectStyle}>
            <option value="">— select —</option>
            {photographers.map(p => (
              <option key={p.id} value={p.id}>
                {p.firstName} {p.lastName}
              </option>
            ))}
          </select>
        </div>

        <Field label="Title" name="title" required />
        <Field label="Medium" name="medium" />
        <Field label="Date" name="date" placeholder="e.g. 1952" />
        <Field label="Width" name="width" placeholder="in inches" />
        <Field label="Height" name="height" placeholder="in inches" />
        <Field label="Price" name="price" />
        <Field label="Inventory Number" name="inventoryNumber" />

        <TextareaField label="Description" name="description" />
        <TextareaField label="Provenance" name="provenance" />

        <Field
          label="Keywords"
          name="keywords"
          placeholder="comma-separated, e.g. landscape, forest, black and white"
        />

        <div style={{ marginBottom: '1rem' }}>
          <label htmlFor="image" style={labelStyle}>Image (JPEG)</label>
          <input
            id="image"
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
          <button type="submit" style={submitStyle}>Save</button>
          <a href="/admin" style={cancelStyle}>Cancel</a>
        </div>
      </form>
    </div>
  );
}

function Field({ label, name, required, placeholder }: {
  label: string; name: string; required?: boolean; placeholder?: string;
}) {
  return (
    <div style={{ marginBottom: '1rem' }}>
      <label htmlFor={name} style={labelStyle}>{label}{required && ' *'}</label>
      <input
        id={name}
        name={name}
        type="text"
        required={required}
        placeholder={placeholder}
        style={inputStyle}
      />
    </div>
  );
}

function TextareaField({ label, name }: { label: string; name: string }) {
  return (
    <div style={{ marginBottom: '1rem' }}>
      <label htmlFor={name} style={labelStyle}>{label}</label>
      <textarea
        id={name}
        name={name}
        rows={4}
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
