'use client';

import { useFormStatus } from 'react-dom';
import adminStyles from '@/app/admin/admin.module.css';

export default function SubmitButton({ children = 'Save', pendingLabel = 'Saving…' }: {
  children?: string;
  pendingLabel?: string;
}) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className={adminStyles.btnPrimary}
      style={pending ? { opacity: 0.65, cursor: 'not-allowed' } : undefined}
    >
      {pending ? pendingLabel : children}
    </button>
  );
}
