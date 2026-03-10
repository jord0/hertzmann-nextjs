// Named entity map covering common HTML entities from legacy data.
// This runs server-side where DOMParser is unavailable.
const ENTITIES: Record<string, string> = {
  '&ndash;': '–', '&mdash;': '—', '&amp;': '&', '&lt;': '<', '&gt;': '>',
  '&quot;': '"', '&#39;': "'", '&apos;': "'", '&nbsp;': '\u00a0',
  '&rsquo;': '\u2019', '&lsquo;': '\u2018', '&rdquo;': '\u201d', '&ldquo;': '\u201c',
  '&agrave;': 'à', '&aacute;': 'á', '&acirc;': 'â', '&atilde;': 'ã', '&auml;': 'ä', '&aring;': 'å',
  '&aelig;': 'æ', '&ccedil;': 'ç',
  '&egrave;': 'è', '&eacute;': 'é', '&ecirc;': 'ê', '&euml;': 'ë',
  '&igrave;': 'ì', '&iacute;': 'í', '&icirc;': 'î', '&iuml;': 'ï',
  '&ograve;': 'ò', '&oacute;': 'ó', '&ocirc;': 'ô', '&otilde;': 'õ', '&ouml;': 'ö', '&oslash;': 'ø',
  '&ugrave;': 'ù', '&uacute;': 'ú', '&ucirc;': 'û', '&uuml;': 'ü',
  '&ntilde;': 'ñ', '&szlig;': 'ß', '&yuml;': 'ÿ',
  '&Agrave;': 'À', '&Aacute;': 'Á', '&Acirc;': 'Â', '&Atilde;': 'Ã', '&Auml;': 'Ä', '&Aring;': 'Å',
  '&Egrave;': 'È', '&Eacute;': 'É', '&Ecirc;': 'Ê', '&Euml;': 'Ë',
  '&Igrave;': 'Ì', '&Iacute;': 'Í', '&Icirc;': 'Î', '&Iuml;': 'Ï',
  '&Ograve;': 'Ò', '&Oacute;': 'Ó', '&Ocirc;': 'Ô', '&Otilde;': 'Õ', '&Ouml;': 'Ö', '&Oslash;': 'Ø',
  '&Ugrave;': 'Ù', '&Uacute;': 'Ú', '&Ucirc;': 'Û', '&Uuml;': 'Ü',
  '&Ntilde;': 'Ñ',
};

export function decodeHtmlEntities(text: string | null): string {
  if (!text) return '';
  return text
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)))
    .replace(/&[a-zA-Z]+;/g, match => ENTITIES[match] ?? match);
}