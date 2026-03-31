export const dynamic = 'force-dynamic';

import { redirect, notFound } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { getIronSession } from 'iron-session';
import type { SessionData } from '@/lib/session';
import { sessionOptions } from '@/lib/session';
import { query } from '@/lib/db';
import { uploadCatalogPdf, deleteCatalogPdf, uploadCatalogThumbnail, deleteCatalogThumbnail } from '@/lib/r2';
import adminStyles from '@/app/admin/admin.module.css';

interface Catalog {
  id: number;
  title: string;
  date: string;
  price: number;
  description: string;
  level: number;
  enabled: number;
  updatedAt: Date | null;
}

function formatTs(ts: Date | null): string {
  if (!ts) return '';
  return ts.toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' });
}

async function updateCatalog(id: number, formData: FormData) {
  'use server';
  const session = await getIronSession<SessionData>(await cookies(), sessionOptions);
  if (!session.isLoggedIn) redirect('/admin/login');
  const title = (formData.get('title') as string).trim();
  const date = (formData.get('date') as string).trim();
  const price = parseInt(formData.get('price') as string || '0', 10) || 0;
  const description = (formData.get('description') as string).trim();
  const level = parseInt(formData.get('level') as string || '0', 10) || 0;
  const enabled = formData.get('enabled') === 'on' ? 1 : 0;

  await query(
    'UPDATE catalogs SET title=?, date=?, price=?, description=?, level=?, enabled=? WHERE id=?',
    [title, date, price, description, level, enabled, id]
  );

  const pdfFile = formData.get('pdf') as File | null;
  if (pdfFile && pdfFile.size > 0) {
    const buffer = Buffer.from(await pdfFile.arrayBuffer());
    await uploadCatalogPdf(id, buffer);
  }

  const thumbnailFile = formData.get('thumbnail') as File | null;
  if (thumbnailFile && thumbnailFile.size > 0) {
    const buffer = Buffer.from(await thumbnailFile.arrayBuffer());
    await uploadCatalogThumbnail(id, buffer);
  }

  revalidatePath('/catalogs');
  redirect('/admin/catalogs');
}

async function deleteCatalog(id: number) {
  'use server';
  const session = await getIronSession<SessionData>(await cookies(), sessionOptions);
  if (!session.isLoggedIn) redirect('/admin/login');
  await query('DELETE FROM catalogs WHERE id=?', [id]);
  try { await deleteCatalogPdf(id); } catch { /* PDF may not exist */ }
  try { await deleteCatalogThumbnail(id); } catch { /* thumbnail may not exist */ }
  revalidatePath('/catalogs');
  redirect('/admin/catalogs');
}

export default async function EditCatalogPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const rows = await query('SELECT * FROM catalogs WHERE id=?', [id]) as Catalog[];
  if (rows.length === 0) notFound();
  const c = rows[0];

  const updateAction = updateCatalog.bind(null, c.id);
  const deleteAction = deleteCatalog.bind(null, c.id);

  return (
    <div>
      <h1 style={{ marginTop: 0, marginBottom: c.updatedAt ? '0.4rem' : undefined }}>Edit Catalogue #{c.id}</h1>
      {c.updatedAt && (
        <p style={{ margin: '0 0 1.5rem', fontSize: '0.8rem', color: '#888' }}>Last edited {formatTs(c.updatedAt)}</p>
      )}

      <form action={updateAction} style={{ maxWidth: '480px' }}>
        <Field label="Title" name="title" defaultValue={c.title} required />
        <Field label="Date" name="date" defaultValue={c.date} placeholder="e.g. 2024" />
        <Field label="Price" name="price" type="number" defaultValue={String(c.price)} />
        <TextareaField label="Description" name="description" defaultValue={c.description} />
        <Field label="Level (display order)" name="level" type="number" defaultValue={String(c.level)} />

        <div style={{ marginBottom: '1rem' }}>
          <label htmlFor="pdf" style={labelStyle}>Replace PDF (optional)</label>
          <input
            id="pdf"
            name="pdf"
            type="file"
            accept="application/pdf"
            style={{ display: 'block', marginTop: '0.3rem' }}
          />
          <p style={{ margin: '0.3rem 0 0', fontSize: '0.8rem', color: '#888' }}>
            Stored as {c.id}.pdf — leave blank to keep existing
          </p>
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <label htmlFor="thumbnail" style={labelStyle}>Replace Cover Thumbnail (optional, JPEG)</label>
          <input
            id="thumbnail"
            name="thumbnail"
            type="file"
            accept="image/jpeg"
            style={{ display: 'block', marginTop: '0.3rem' }}
          />
          <p style={{ margin: '0.3rem 0 0', fontSize: '0.8rem', color: '#888' }}>
            Stored as {c.id}.jpg — leave blank to keep existing. Also removed from R2 if catalog is deleted.
          </p>
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
            <input type="checkbox" name="enabled" defaultChecked={!!c.enabled} />
            <span>Enabled (visible on site)</span>
          </label>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
          <button type="submit" className={adminStyles.btnPrimary}>Save</button>
          <a href="/admin/catalogs" className={adminStyles.btnSecondary}>Cancel</a>
        </div>
      </form>

      <hr style={{ margin: '3rem 0 1.5rem', border: 'none', borderTop: '1px solid #ddd' }} />

      <div style={{ maxWidth: '480px' }}>
        <h2 style={{ fontSize: '1rem', marginTop: 0, color: '#c00' }}>Delete Catalogue</h2>
        <p style={{ fontSize: '0.9rem', color: '#666', marginTop: 0 }}>
          Permanently removes this catalog record, its PDF, and its cover thumbnail from R2. This cannot be undone.
        </p>
        <form action={deleteAction}>
          <button type="submit" className={adminStyles.btnDanger}>Delete Catalogue</button>
        </form>
      </div>
    </div>
  );
}

function Field({ label, name, defaultValue, required, placeholder, type = 'text' }: {
  label: string;
  name: string;
  defaultValue?: string;
  required?: boolean;
  placeholder?: string;
  type?: string;
}) {
  return (
    <div style={{ marginBottom: '1rem' }}>
      <label htmlFor={name} style={labelStyle}>{label}{required && ' (required)'}</label>
      <input
        id={name}
        name={name}
        type={type}
        required={required}
        defaultValue={defaultValue}
        placeholder={placeholder}
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

