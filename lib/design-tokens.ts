export const tokens = {
  color: {
    gold: '#F0B23C',
    dark: '#1a1a1a',        // CTA section background, not text
    foreground: '#2a2a2a',  // primary text
    muted: '#666666',       // secondary text
    bg: '#ffffff',
    bgWarm: '#faf8f4',      // caption bar, warm off-white
    border: 'rgba(42, 42, 42, 0.1)',
    borderWarm: '#e8e0d0',
  },
  font: {
    serif: 'var(--font-cormorant)',
    sans: 'var(--font-inter)',
  },
  fontWeight: {
    light: 300,
    normal: 400,
    medium: 500,
    semibold: 600,
  },
  section: {
    padding: '5rem 2.5rem',
    maxWidth: '1100px',
  },
  goldRule: {
    width: '48px',
    height: '3px',
    marginBottom: '0.35rem',
  },
} as const;
