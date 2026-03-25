'use client';

import ToggleEnabled from '@/app/admin/_components/ToggleEnabled';
import { toggleCatalogEnabled } from './actions';

export default function CatalogToggle({ id, enabled }: { id: number; enabled: boolean }) {
  return (
    <ToggleEnabled
      enabled={enabled}
      action={(n) => toggleCatalogEnabled(id, n)}
    />
  );
}
