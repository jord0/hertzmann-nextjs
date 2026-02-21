import { redirect, notFound } from 'next/navigation';
import { revalidateTag, revalidatePath } from 'next/cache';
import { query } from '@/lib/db';

interface Photographer {
  id: number;
  firstName: string;
  lastName: string;
  years: string;
  country: string;
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
  const enabled = formData.get('enabled') === 'on' ? 1 : 0;

  await query(
    'UPDATE photographers SET firstName=?, lastName=?, years=?, country=?, enabled=? WHERE id=?',
    [firstName, lastName, years, country, enabled, id]
  );

  revalidateTag('browse-data', 'default');
  // Bust old slug path in case name changed
  revalidatePath(`/photographs/photographer/${oldSlug}`);
  const newSlug = makeSlug(firstName, lastName);
  if (newSlug !== oldSlug) {
    revalidatePath(`/photographs/photographer/${newSlug}`);
  }

  redirect('/admin/photographers');
}

export default async function EditPhotographerPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const rows = (await query('SELECT * FROM photographers WHERE id = ?', [id])) as Photographer[];
  if (rows.length === 0) notFound();
  const p = rows[0];
  const oldSlug = makeSlug(p.firstName, p.lastName);

  const action = updatePhotographer.bind(null, p.id, oldSlug);

  return (
    <div>
      <h1 style={{ marginTop: 0 }}>Edit Photographer</h1>

      <form action={action} style={{ maxWidth: '480px' }}>
        <Field label="First Name" name="firstName" defaultValue={p.firstName} required />
        <Field label="Last Name" name="lastName" defaultValue={p.lastName} required />
        <Field label="Years Active" name="years" defaultValue={p.years || ''} />
        <Field label="Country" name="country" defaultValue={p.country || ''} />

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
    </div>
  );
}

function Field({
  label, name, defaultValue, required,
}: {
  label: string;
  name: string;
  defaultValue?: string;
  required?: boolean;
}) {
  return (
    <div style={{ marginBottom: '1rem' }}>
      <label
        htmlFor={name}
        style={{ display: 'block', marginBottom: '0.3rem', fontSize: '0.9rem', fontWeight: 500 }}
      >
        {label}{required && ' *'}
      </label>
      <input
        id={name}
        name={name}
        type="text"
        required={required}
        defaultValue={defaultValue}
        style={{
          width: '100%',
          padding: '0.6rem 0.75rem',
          fontSize: '1rem',
          border: '1px solid #ccc',
          borderRadius: '4px',
          boxSizing: 'border-box',
        }}
      />
    </div>
  );
}

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
