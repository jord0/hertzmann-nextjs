export function decodeHtmlEntities(text: string | null): string {
    if (!text) return '';
    
    const entities: Record<string, string> = {
      '&ndash;': '–',
      '&mdash;': '—',
      '&amp;': '&',
      '&lt;': '<',
      '&gt;': '>',
      '&quot;': '"',
      '&#39;': "'",
      '&nbsp;': ' ',
      '&rsquo;': "'",
      '&lsquo;': "'",
      '&rdquo;': '"',
      '&ldquo;': '"',
    };
    
    return text.replace(/&[a-z]+;/gi, match => entities[match] || match);
  }