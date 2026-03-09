import { redirect } from 'next/navigation';
import { revalidateTag } from 'next/cache';
import { cookies } from 'next/headers';
import { getIronSession } from 'iron-session';
import type { SessionData } from '@/lib/session';
import { sessionOptions } from '@/lib/session';
import { query } from '@/lib/db';

async function createPhotographer(formData: FormData) {
  'use server';
  const session = await getIronSession<SessionData>(await cookies(), sessionOptions);
  if (!session.isLoggedIn) redirect('/admin/login');

  const firstName = (formData.get('firstName') as string).trim();
  const lastName = (formData.get('lastName') as string).trim();
  const years = (formData.get('years') as string).trim();
  const country = (formData.get('country') as string).trim();
  const cv = (formData.get('cv') as string).trim();
  const enabled = formData.get('enabled') === 'on' ? 1 : 0;

  const result = (await query(
    'INSERT INTO photographers (firstName, lastName, years, country, cv, enabled) VALUES (?, ?, ?, ?, ?, ?)',
    [firstName, lastName, years, country, cv, enabled]
  )) as { insertId: number };

  revalidateTag('browse-data', 'default');
  redirect(`/admin/photographers/${result.insertId}`);
}

export default function NewPhotographerPage() {
  return (
    <div>
      <h1 style={{ marginTop: 0 }}>Add Photographer</h1>

      <form action={createPhotographer} style={{ maxWidth: '480px' }}>
        <Field label="First Name" name="firstName" required />
        <Field label="Last Name" name="lastName" required />
        <Field label="Years Active" name="years" placeholder="e.g. 1920&ndash;1980" />
        <Field label="Country" name="country" />
        <TextareaField label="CV / Bio" name="cv" />

        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
            <input type="checkbox" name="enabled" defaultChecked />
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

function TextareaField({ label, name }: { label: string; name: string }) {
  return (
    <div style={{ marginBottom: '1rem' }}>
      <label htmlFor={name} style={{ display: 'block', marginBottom: '0.3rem', fontSize: '0.9rem', fontWeight: 500 }}>
        {label}
      </label>
      <textarea
        id={name}
        name={name}
        rows={5}
        style={{ width: '100%', padding: '0.6rem 0.75rem', fontSize: '1rem', border: '1px solid #ccc', borderRadius: '4px', boxSizing: 'border-box', resize: 'vertical' }}
      />
    </div>
  );
}

function Field({
  label, name, required, placeholder,
}: {
  label: string;
  name: string;
  required?: boolean;
  placeholder?: string;
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
        placeholder={placeholder}
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
