export const theme = {
  colors: {
    primary: {
      50: '#FAFAFA',
      100: '#F5F5F5',
      200: '#EEEEEE',
      DEFAULT: '#FFFFFF',
    },
    accent: {
      light: '#FF8C42',
      DEFAULT: '#FF6B35',
      dark: '#E85A2A',
      darker: '#D04A1F',
    },
    text: {
      primary: '#333333',
      secondary: '#666666',
      tertiary: '#999999',
      light: '#CCCCCC',
    },
    background: {
      DEFAULT: '#F5F5F5',
      light: '#FAFAFA',
      dark: '#E5E5E5',
    },
    success: '#10B981',
    error: '#EF4444',
    warning: '#F59E0B',
    info: '#3B82F6',
  },

  typography: {
    fontFamily: {
      sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      heading: ['Poppins', 'Inter', 'system-ui', 'sans-serif'],
    },
    fontSize: {
      xs: '0.75rem',
      sm: '0.875rem',
      base: '1rem',
      lg: '1.125rem',
      xl: '1.25rem',
      '2xl': '1.5rem',
      '3xl': '1.875rem',
      '4xl': '2.25rem',
      '5xl': '3rem',
      '6xl': '3.75rem',
    },
    fontWeight: {
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
      extrabold: 800,
    },
    lineHeight: {
      tight: 1.2,
      normal: 1.5,
      relaxed: 1.75,
      loose: 2,
    },
  },

  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '0.75rem',
    lg: '1rem',
    xl: '1.5rem',
    '2xl': '2rem',
    '3xl': '3rem',
    '4xl': '4rem',
  },

  breakpoints: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
  },

  shadows: {
    soft: '0 2px 15px rgba(0, 0, 0, 0.08)',
    medium: '0 4px 25px rgba(0, 0, 0, 0.12)',
    hard: '0 10px 40px rgba(0, 0, 0, 0.15)',
  },

  borderRadius: {
    sm: '0.25rem',
    md: '0.5rem',
    lg: '0.75rem',
    xl: '1rem',
    '2xl': '1.5rem',
    full: '9999px',
  },

  transitions: {
    fast: '150ms',
    base: '200ms',
    slow: '300ms',
  },
} as const;

export type Theme = typeof theme;
