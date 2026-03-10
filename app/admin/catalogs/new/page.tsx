import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { getIronSession } from 'iron-session';
import type { SessionData } from '@/lib/session';
import { sessionOptions } from '@/lib/session';
import { query } from '@/lib/db';
import { uploadCatalogPdf } from '@/lib/r2';
import adminStyles from '@/app/admin/admin.module.css';

async function createCatalog(formData: FormData) {
  'use server';
  const session = await getIronSession<SessionData>(await cookies(), sessionOptions);
  if (!session.isLoggedIn) redirect('/admin/login');
  const title = (formData.get('title') as string).trim();
  const date = (formData.get('date') as string).trim();
  const price = parseInt(formData.get('price') as string || '0', 10) || 0;
  const description = (formData.get('description') as string).trim();
  const level = parseInt(formData.get('level') as string || '0', 10) || 0;
  const enabled = formData.get('enabled') === 'on' ? 1 : 0;

  const result = await query(
    'INSERT INTO catalogs (title, date, price, description, level, enabled) VALUES (?, ?, ?, ?, ?, ?)',
    [title, date, price, description, level, enabled]
  ) as { insertId: number };

  const pdfFile = formData.get('pdf') as File | null;
  if (pdfFile && pdfFile.size > 0) {
    const buffer = Buffer.from(await pdfFile.arrayBuffer());
    await uploadCatalogPdf(result.insertId, buffer);
  }

  revalidatePath('/catalogs');
  redirect('/admin/catalogs');
}

export default function NewCatalogPage() {
  return (
    <div>
      <h1 style={{ marginTop: 0 }}>Add Catalog</h1>

      <form action={createCatalog} style={{ maxWidth: '480px' }}>
        <Field label="Title" name="title" required />
        <Field label="Date" name="date" placeholder="e.g. 2024" />
        <Field label="Price" name="price" type="number" placeholder="0 for contact-for-price" />
        <TextareaField label="Description" name="description" />
        <Field label="Level (display order)" name="level" type="number" defaultValue="0" />

        <div style={{ marginBottom: '1rem' }}>
          <label htmlFor="pdf" style={labelStyle}>PDF File</label>
          <input
            id="pdf"
            name="pdf"
            type="file"
            accept="application/pdf"
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
          <button type="submit" className={adminStyles.btnPrimary}>Save</button>
          <a href="/admin/catalogs" className={adminStyles.btnSecondary}>Cancel</a>
        </div>
      </form>
    </div>
  );
}

function Field({ label, name, required, placeholder, type = 'text', defaultValue }: {
  label: string;
  name: string;
  required?: boolean;
  placeholder?: string;
  type?: string;
  defaultValue?: string;
}) {
  return (
    <div style={{ marginBottom: '1rem' }}>
      <label htmlFor={name} style={labelStyle}>{label}{required && ' *'}</label>
      <input
        id={name}
        name={name}
        type={type}
        required={required}
        placeholder={placeholder}
        defaultValue={defaultValue}
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
        rows={5}
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

