'use client';

import { useState } from 'react';
import KeywordPicker from '../../photos/KeywordPicker';
import PhotoUploadControls from './PhotoUploadControls';

interface Props {
  action: (formData: FormData) => Promise<void>;
  allKeywords: string[];
}

export default function AddPhotoSection({ action, allKeywords }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        style={{
          marginTop: '0.75rem',
          padding: '0.6rem 1.25rem',
          backgroundColor: '#F0B23C',
          color: '#1a1a1a',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          fontSize: '0.95rem',
          fontWeight: 600,
        }}
      >
        {open ? '✕ Cancel Add Photo' : '+ Add Photo'}
      </button>

      {open && (
        <div style={{ marginTop: '2.5rem' }}>
          {/* Section header */}
          <div style={{ marginBottom: '2rem', padding: '1.25rem 1.5rem', backgroundColor: '#faf8f4', borderLeft: '4px solid #F0B23C', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <h2 style={{ margin: 0, fontSize: '1.5rem' }}>Add Photo</h2>
              <p style={{ margin: '0.25rem 0 0', fontSize: '0.85rem', color: '#666' }}>Fill in the form below to add a new photo for this photographer.</p>
            </div>
          </div>

          <form action={action} style={{ maxWidth: '600px' }}>
            <Field label="Title" name="title" />
            <Field label="Medium" name="medium" />
            <Field label="Date" name="date" placeholder="e.g. 1952" />
            <Field label="Width" name="width" placeholder="in inches" />
            <Field label="Height" name="height" placeholder="in inches" />
            <Field label="Price" name="price" type="number" max={8388607} />
            <Field label="Inventory Number" name="inventoryNumber" maxLength={10} />
            <TextareaField label="Description" name="description" />
            <TextareaField label="Provenance" name="provenance" />
            <KeywordPicker allKeywords={allKeywords} />
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                <input type="checkbox" name="enabled" defaultChecked />
                <span>Enabled (visible on site)</span>
              </label>
            </div>
            <PhotoUploadControls />
          </form>
        </div>
      )}
    </>
  );
}

function Field({ label, name, required, placeholder, type = 'text', max, maxLength }: {
  label: string; name: string; required?: boolean; placeholder?: string; type?: string; max?: number; maxLength?: number;
}) {
  return (
    <div style={{ marginBottom: '1rem' }}>
      <label htmlFor={name} style={labelStyle}>{label}{required && ' (required)'}</label>
      <input
        id={name}
        name={name}
        type={type}
        required={required}
        placeholder={placeholder}
        max={max}
        maxLength={maxLength}
        style={inputStyle}
      />
    </div>
  );
}

function TextareaField({ label, name }: { label: string; name: string }) {
  return (
    <div style={{ marginBottom: '1rem' }}>
      <label htmlFor={name} style={labelStyle}>{label}</label>
      <textarea id={name} name={name} rows={4} style={{ ...inputStyle, resize: 'vertical' }} />
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
