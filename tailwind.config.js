/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Base colors
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        
        // Text colors
        'text': {
          primary: 'var(--text-primary)',
          secondary: 'var(--text-secondary)',
          tertiary: 'var(--text-tertiary)',
        },
        
        // UI element colors
        'accent': {
          blue: 'var(--accent-blue)',
          'blue-hover': 'var(--accent-blue-hover)',
          'blue-disabled': 'var(--accent-blue-disabled)',
        },
        
        // Background colors
        'bg': {
          primary: 'var(--bg-primary)',
          secondary: 'var(--bg-secondary)',
          tertiary: 'var(--bg-tertiary)',
          overlay: 'var(--bg-overlay)',
        },
        
        // Border colors
        'border': {
          primary: 'var(--border-primary)',
          secondary: 'var(--border-secondary)',
        },
        
        // Button colors
        'button': {
          primary: 'var(--button-primary)',
          'primary-hover': 'var(--button-primary-hover)',
          secondary: 'var(--button-secondary)',
          'secondary-hover': 'var(--button-secondary-hover)',
        },
        
        // Status colors
        success: 'var(--success)',
        error: 'var(--error)',
        warning: 'var(--warning)',
        
        // Interaction colors
        'hover': {
          bg: 'var(--hover-bg)',
        },
        'active': {
          bg: 'var(--active-bg)',
        },
      },
      animation: {
        'fadeInUp': 'fadeInUp 0.6s ease-out',
        'slideInLeft': 'slideInLeft 0.3s ease-out',
        'slideInRight': 'slideInRight 0.3s ease-out',
      },
      keyframes: {
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideInLeft: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(0)' },
        },
        slideInRight: {
          '0%': { transform: 'translateX(100%)' },
          '100%': { transform: 'translateX(0)' },
        },
      },
      boxShadow: {
        'app': '0 2px 8px var(--shadow-color)',
        'app-lg': '0 4px 12px var(--shadow-color)',
      },
    },
  },
  plugins: [],
} 