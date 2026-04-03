import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: '#F8FAFC',
        surface: '#FFFFFF',
        'text-primary': '#0F172A',
        'text-secondary': '#475569',
        'text-muted': '#94A3B8',
        border: '#E2E8F0',
        'border-soft': '#EEF2FF',
        primary: '#1E1B4B',
        'primary-soft': '#EEF2FF',
        accent: '#0F766E',
        success: '#16A34A',
        'success-soft': '#DCFCE7',
        warning: '#D97706',
        'warning-soft': '#FEF3C7',
        danger: '#DC2626',
        'danger-soft': '#FEE2E2',
        info: '#2563EB',
      },
      borderRadius: {
        sm: '8px',
        md: '12px',
        lg: '16px',
        xl: '20px',
        xxl: '24px',
      },
      boxShadow: {
        card: '0 4px 10px rgba(30, 27, 75, 0.07)',
        soft: '0 3px 8px rgba(30, 27, 75, 0.04)',
      },
      spacing: {
        xs: '4px',
        sm: '8px',
        md: '12px',
        lg: '16px',
        xl: '20px',
        xxl: '24px',
        xxxl: '32px',
      },
      fontSize: {
        xs: ['12px', { lineHeight: '16px' }],
        sm: ['13px', { lineHeight: '18px' }],
        base: ['15px', { lineHeight: '20px' }],
        lg: ['18px', { lineHeight: '24px' }],
        xl: ['22px', { lineHeight: '28px' }],
        '2xl': ['30px', { lineHeight: '36px' }],
      },
    },
  },
  plugins: [],
}
export default config
