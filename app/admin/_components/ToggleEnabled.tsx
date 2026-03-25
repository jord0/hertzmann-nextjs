'use client';

import { useState, useTransition } from 'react';

interface Props {
  enabled: boolean;
  action: (newEnabled: number) => Promise<void>;
}

export default function ToggleEnabled({ enabled, action }: Props) {
  const [optimistic, setOptimistic] = useState(enabled);
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    const next = !optimistic;
    setOptimistic(next);
    startTransition(() => action(next ? 1 : 0));
  }

  return (
    <button
      onClick={handleClick}
      disabled={isPending}
      style={{
        display: 'inline-block',
        padding: '0.2rem 0.5rem',
        borderRadius: '3px',
        fontSize: '0.8rem',
        backgroundColor: optimistic ? '#dcfce7' : '#f3f4f6',
        color: optimistic ? '#15803d' : '#6b7280',
        border: 'none',
        cursor: isPending ? 'wait' : 'pointer',
        opacity: isPending ? 0.6 : 1,
        fontFamily: 'inherit',
      }}
    >
      {optimistic ? 'Enabled' : 'Disabled'}
    </button>
  );
}
