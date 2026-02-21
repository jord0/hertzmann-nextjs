import { getBrowseData } from '@/lib/browse-data';
import PhotographsPageInner from './PhotographsPageInner';

export default async function PhotographsPage() {
  const { photographers, keywords } = await getBrowseData();
  return <PhotographsPageInner photographers={photographers} keywords={keywords} />;
}
