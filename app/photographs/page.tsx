import type { Metadata } from 'next';
import { getBrowseData } from '@/lib/browse-data';
import PhotographsPageInner from './PhotographsPageInner';

export const metadata: Metadata = {
  title: 'Photographs',
  description: 'Browse the Hertzmann vintage photography collection by artist or subject.',
};

export default async function PhotographsPage() {
  const { photographers, keywords } = await getBrowseData();
  return <PhotographsPageInner photographers={photographers} keywords={keywords} />;
}
