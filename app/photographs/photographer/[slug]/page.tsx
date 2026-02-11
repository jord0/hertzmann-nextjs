import Link from 'next/link';
import { Metadata } from 'next';
import { query } from '@/lib/db';
import { notFound } from 'next/navigation';
import fs from 'fs';
import path from 'path';
import { decodeHtmlEntities } from '@/lib/htmlDecode';

interface Photo {
  id: number;
  title: string;
  medium: string | null;
  date: string | null;
  width: string | null;
  height: string | null;
}

interface Photographer {
  id: number;
  firstName: string;
  lastName: string;
  years: string | null;
  country: string | null;
}

interface PageProps {
  params: Promise<{ slug: string }>;
}

async function getPhotographer(slug: string) {
    const cleanSlug = slug.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '').replace(/^-+|-+$/g, '');
    
    console.log('Looking for slug:', cleanSlug);
    
    // First get all enabled photographers
    const sql = `SELECT * FROM photographers WHERE enabled = 1`;
    const allPhotographers = await query(sql) as Photographer[];
    
    // Generate slugs and find match
    const photographer = allPhotographers.find((p: any) => {
      const generatedSlug = `${p.firstName || ''}-${p.lastName}`
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^\w-]/g, '')
        .replace(/^-+|-+$/g, '');
      return generatedSlug === cleanSlug;
    });
    
    console.log('Found photographer:', photographer);
    
    if (!photographer) {
      return null;
    }
    
    return photographer;
  }

  async function getPhotos(photographerId: number): Promise<Photo[]> {
    const sql = 'SELECT * FROM photos WHERE photographer = ? AND enabled = 1';
    const results = await query(sql, [photographerId]) as Photo[];
    
    // Return all photos - we can't check HE filesystem from Vercel
    // Images that don't exist will just fail to load (handled by onError in img tag)
    return results;
  }

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { slug } = await params;
    const photographer = await getPhotographer(slug);
    
    if (!photographer) {
      return {
        title: 'Photographer Not Found'
      };
    }
    
    const photos = await getPhotos(photographer.id);
    const fullName = `${photographer.firstName || ''} ${photographer.lastName}`.trim();
    const years = decodeHtmlEntities(photographer.years);
    
    return {
      title: fullName,
      description: `Explore ${photos.length} photograph${photos.length !== 1 ? 's' : ''} by ${fullName}${years ? ` (${years})` : ''}. Vintage photography from the Hertzmann collection.`,
      openGraph: {
        title: fullName,
        description: `${photos.length} photograph${photos.length !== 1 ? 's' : ''} by ${fullName}`,
        type: 'profile',
      }
    };
  }

export default async function PhotographerPage({ params }: PageProps) {
  const { slug } = await params;
  const photographer = await getPhotographer(slug);
  
  if (!photographer) {
    notFound();
  }
  
  const photos = await getPhotos(photographer.id);

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>
      <Link href="/photographs" style={{ display: 'inline-block', marginBottom: '2rem', color: '#333', textDecoration: 'none' }}>
        ← Back to Browse
      </Link>
      
      <header style={{ textAlign: 'center', marginBottom: '3rem', borderBottom: '2px solid #333', paddingBottom: '1.5rem' }}>
        <h1>{photographer.firstName} {photographer.lastName}</h1>
        {photographer.years && <p style={{ color: '#666', fontStyle: 'italic' }}>{decodeHtmlEntities(photographer.years)}</p>}        {photographer.country && <p style={{ color: '#666' }}>{photographer.country}</p>}
      </header>
      
      <main>
        <h2>Photographs ({photos.length})</h2>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
          gap: '2rem',
          marginTop: '2rem'
        }}>
          {photos.map(photo => (
            <div key={photo.id} style={{ border: '1px solid #ddd', padding: '1rem', borderRadius: '8px' }}>
              <img 
                src={`https://hertzmann.net/pages/photos/${photographer.id}_${photo.id}.jpg`}
                alt={photo.title}
                style={{ width: '100%', height: 'auto', marginBottom: '1rem' }}
              />
              <h3 style={{ fontSize: '1.1rem', margin: '0.5rem 0' }}>{photo.title}</h3>
              {photo.medium && <p style={{ margin: '0.25rem 0', color: '#666', fontSize: '0.9rem' }}>{photo.medium}</p>}
              {photo.date && <p style={{ margin: '0.25rem 0', color: '#666', fontSize: '0.9rem' }}>{photo.date}</p>}
              {photo.width && photo.height && (
                <p style={{ margin: '0.25rem 0', color: '#666', fontSize: '0.9rem' }}>{photo.width}" × {photo.height}"</p>
              )}
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}

// Generate static paths for all photographers at build time
export async function generateStaticParams() {
    const sql = 'SELECT firstName, lastName FROM photographers WHERE enabled = 1';
    const results = await query(sql) as Photographer[];
    
    return results.map((p: any) => ({
      slug: `${p.firstName || ''}-${p.lastName}`.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '').replace(/^-+|-+$/g, '')
    }));
  }