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
  rectSortingStrategy,
  useSortable,
  arrayMove,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { reorderPhotos } from '@/app/admin/photos/actions';
import { photoImageUrl } from '@/lib/photo-url';

interface Photo {
  id: number;
  title: string;
  enabled: number;
  level: number;
}

interface Props {
  photos: Photo[];
  photographerId: number;
  photographerSlug: string;
}

function SortablePhoto({ photo, photographerId }: { photo: Photo; photographerId: number }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: photo.id });

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.4 : 1,
        width: '220px',
        cursor: 'grab',
      }}
      {...attributes}
      {...listeners}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={photoImageUrl(photographerId, photo.id)}
        alt={photo.title || `Photo ${photo.id}`}
        draggable={false}
        style={{
          width: '220px',
          height: '180px',
          objectFit: 'contain',
          backgroundColor: '#f5f5f5',
          border: '1px solid #e0e0e0',
          display: 'block',
          opacity: photo.enabled ? 1 : 0.4,
        }}
      />
      <Link
        href={`/admin/photos/${photo.id}`}
        style={{
          display: 'block',
          marginTop: '0.3rem',
          fontSize: '1rem',
          color: '#555',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          textDecoration: 'none',
        }}
        onClick={e => e.stopPropagation()}
      >
        {photo.title || <em>Untitled</em>}
      </Link>
    </div>
  );
}

export default function PhotoGrid({ photos: initialPhotos, photographerId, photographerSlug }: Props) {
  const [photos, setPhotos] = useState(initialPhotos);
  const [saving, setSaving] = useState(false);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = photos.findIndex(p => p.id === active.id);
    const newIndex = photos.findIndex(p => p.id === over.id);
    const reordered = arrayMove(photos, oldIndex, newIndex);

    setPhotos(reordered);
    setSaving(true);
    await reorderPhotos(photographerSlug, reordered.map(p => p.id));
    setSaving(false);
  }

  return (
    <div>
      <h2 style={{ margin: '0 0 0.5rem', fontSize: '1.5rem' }}>
        Photos <span style={{ fontWeight: 400, color: '#888', fontSize: '1rem' }}>({photos.length})</span>
        {saving && <span style={{ fontWeight: 400, color: '#888', fontSize: '0.85rem', marginLeft: '0.75rem' }}>Saving…</span>}
      </h2>
      <p style={{ margin: '0 0 1rem', fontSize: '0.9rem', color: '#888' }}>Drag to reorder · click title to edit</p>

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={photos.map(p => p.id)} strategy={rectSortingStrategy}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
            {photos.map(photo => (
              <SortablePhoto key={photo.id} photo={photo} photographerId={photographerId} />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
}
