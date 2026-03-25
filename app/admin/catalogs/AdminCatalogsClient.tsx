'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import CatalogToggle from './CatalogToggle';
import { reorderCatalogs } from './actions';

export interface CatalogRow {
  id: number;
  title: string;
  date: string;
  price: number;
  level: number;
  enabled: number;
  updatedAt: string | null;
}

function formatTs(iso: string | null): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function SortableRow({ catalog }: { catalog: CatalogRow }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: catalog.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
    backgroundColor: isDragging ? '#f5f5f5' : 'white',
  };

  return (
    <tr ref={setNodeRef} style={style}>
      <td style={tdStyle}>
        <span
          {...attributes}
          {...listeners}
          title="Drag to reorder"
          style={{ cursor: 'grab', color: '#bbb', marginRight: '0.6rem', userSelect: 'none', fontSize: '1rem' }}
        >
          ⠿
        </span>
        <Link href={`/admin/catalogs/${catalog.id}`} style={{ color: '#0066cc', textDecoration: 'none' }}>
          {catalog.title}
        </Link>
      </td>
      <td style={{ ...tdStyle, color: '#666' }}>{catalog.date}</td>
      <td style={{ ...tdStyle, color: '#666' }}>{catalog.price > 0 ? `$${catalog.price}` : '—'}</td>
      <td style={{ ...tdStyle, color: '#888', fontSize: '0.8rem' }}>{formatTs(catalog.updatedAt)}</td>
      <td style={tdStyle}>
        <CatalogToggle id={catalog.id} enabled={!!catalog.enabled} />
      </td>
    </tr>
  );
}

export default function AdminCatalogsClient({ initialRows }: { initialRows: CatalogRow[] }) {
  const [rows, setRows] = useState(initialRows);

  const sensors = useSensors(useSensor(PointerSensor));

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = rows.findIndex(r => r.id === active.id);
    const newIndex = rows.findIndex(r => r.id === over.id);
    const reordered = arrayMove(rows, oldIndex, newIndex);

    setRows(reordered);
    reorderCatalogs(reordered.map(r => r.id));
  }

  return (
    <table style={{ width: '100%', borderCollapse: 'collapse', backgroundColor: 'white', borderRadius: '6px', overflow: 'hidden', border: '1px solid #ddd' }}>
      <thead>
        <tr style={{ backgroundColor: '#f0f0f0', textAlign: 'left' }}>
          <th style={thStyle}>Title</th>
          <th style={thStyle}>Date</th>
          <th style={thStyle}>Price</th>
          <th style={thStyle}>Last Edited</th>
          <th style={thStyle}>Status</th>
        </tr>
      </thead>
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={rows.map(r => r.id)} strategy={verticalListSortingStrategy}>
          <tbody>
            {rows.map(catalog => (
              <SortableRow key={catalog.id} catalog={catalog} />
            ))}
          </tbody>
        </SortableContext>
      </DndContext>
    </table>
  );
}

const thStyle: React.CSSProperties = {
  padding: '0.75rem 1rem',
  fontWeight: 600,
  fontSize: '0.85rem',
  color: '#555',
};

const tdStyle: React.CSSProperties = {
  padding: '0.75rem 1rem',
};
