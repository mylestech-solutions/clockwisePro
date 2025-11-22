/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    // Custom breakpoints for all screen sizes
    screens: {
      'xs': '375px',      // Small phones
      'sm': '640px',      // Large phones / small tablets
      'md': '768px',      // Tablets
      'lg': '1024px',     // Laptops / small desktops
      'xl': '1280px',     // Desktops
      '2xl': '1536px',    // Large desktops
      '3xl': '1920px',    // Ultrawide monitors
      '4xl': '2560px',    // 4K displays
      // Height-based breakpoints
      'tall': { 'raw': '(min-height: 800px)' },
      'short': { 'raw': '(max-height: 600px)' },
      // Orientation breakpoints
      'portrait': { 'raw': '(orientation: portrait)' },
      'landscape': { 'raw': '(orientation: landscape)' },
      // Touch/hover detection
      'touch': { 'raw': '(hover: none)' },
      'hover-device': { 'raw': '(hover: hover)' },
    },
    extend: {
      // Extended spacing for responsive layouts
      spacing: {
        '18': '4.5rem',
        '22': '5.5rem',
        '26': '6.5rem',
        '30': '7.5rem',
        '34': '8.5rem',
        '38': '9.5rem',
        '42': '10.5rem',
        '50': '12.5rem',
        '58': '14.5rem',
        '66': '16.5rem',
        '74': '18.5rem',
        '82': '20.5rem',
        '90': '22.5rem',
        '100': '25rem',
        '120': '30rem',
        '140': '35rem',
        '160': '40rem',
        '180': '45rem',
        '200': '50rem',
        // Viewport-based spacing
        'screen-10': '10vw',
        'screen-20': '20vw',
        'screen-25': '25vw',
        'screen-30': '30vw',
        'screen-40': '40vw',
        'screen-50': '50vw',
        'screen-60': '60vw',
        'screen-70': '70vw',
        'screen-75': '75vw',
        'screen-80': '80vw',
        'screen-90': '90vw',
      },
      // Min/Max widths for containers
      maxWidth: {
        'xs': '20rem',      // 320px
        'sm': '24rem',      // 384px
        'md': '28rem',      // 448px
        'lg': '32rem',      // 512px
        'xl': '36rem',      // 576px
        '2xl': '42rem',     // 672px
        '3xl': '48rem',     // 768px
        '4xl': '56rem',     // 896px
        '5xl': '64rem',     // 1024px
        '6xl': '72rem',     // 1152px
        '7xl': '80rem',     // 1280px
        '8xl': '90rem',     // 1440px
        '9xl': '100rem',    // 1600px
        'mobile': '430px',  // iPhone 14 Pro Max width
        'tablet': '834px',  // iPad Pro 11" width
        'screen-90': '90vw',
        'screen-95': '95vw',
      },
      minWidth: {
        'xs': '20rem',
        'sm': '24rem',
        'md': '28rem',
        'touch': '44px',    // Minimum touch target
      },
      minHeight: {
        'touch': '44px',    // Minimum touch target
        'screen-50': '50vh',
        'screen-75': '75vh',
        'screen-90': '90vh',
      },
      // Responsive font sizes
      fontSize: {
        '2xs': ['0.625rem', { lineHeight: '0.875rem' }],     // 10px
        'xs': ['0.75rem', { lineHeight: '1rem' }],           // 12px
        'sm': ['0.875rem', { lineHeight: '1.25rem' }],       // 14px
        'base': ['1rem', { lineHeight: '1.5rem' }],          // 16px
        'lg': ['1.125rem', { lineHeight: '1.75rem' }],       // 18px
        'xl': ['1.25rem', { lineHeight: '1.75rem' }],        // 20px
        '2xl': ['1.5rem', { lineHeight: '2rem' }],           // 24px
        '3xl': ['1.875rem', { lineHeight: '2.25rem' }],      // 30px
        '4xl': ['2.25rem', { lineHeight: '2.5rem' }],        // 36px
        '5xl': ['3rem', { lineHeight: '1' }],                // 48px
        '6xl': ['3.75rem', { lineHeight: '1' }],             // 60px
        '7xl': ['4.5rem', { lineHeight: '1' }],              // 72px
        '8xl': ['6rem', { lineHeight: '1' }],                // 96px
        '9xl': ['8rem', { lineHeight: '1' }],                // 128px
        // Responsive fluid typography
        'fluid-sm': 'clamp(0.75rem, 0.7rem + 0.25vw, 0.875rem)',
        'fluid-base': 'clamp(0.875rem, 0.8rem + 0.4vw, 1rem)',
        'fluid-lg': 'clamp(1rem, 0.9rem + 0.5vw, 1.125rem)',
        'fluid-xl': 'clamp(1.125rem, 1rem + 0.6vw, 1.25rem)',
        'fluid-2xl': 'clamp(1.25rem, 1.1rem + 0.75vw, 1.5rem)',
        'fluid-3xl': 'clamp(1.5rem, 1.2rem + 1.5vw, 1.875rem)',
        'fluid-4xl': 'clamp(1.875rem, 1.5rem + 2vw, 2.25rem)',
        'fluid-5xl': 'clamp(2.25rem, 1.8rem + 2.5vw, 3rem)',
        'fluid-6xl': 'clamp(3rem, 2.5rem + 3vw, 3.75rem)',
      },
      // Extended border radius
      borderRadius: {
        '4xl': '2rem',
        '5xl': '2.5rem',
        '6xl': '3rem',
      },
      // Container configuration
      container: {
        center: true,
        padding: {
          DEFAULT: '1rem',
          sm: '1.5rem',
          md: '2rem',
          lg: '2.5rem',
          xl: '3rem',
          '2xl': '4rem',
        },
      },
      // Animation durations
      transitionDuration: {
        '250': '250ms',
        '350': '350ms',
        '400': '400ms',
        '600': '600ms',
      },
      // Z-index scale
      zIndex: {
        '60': '60',
        '70': '70',
        '80': '80',
        '90': '90',
        '100': '100',
        'dropdown': '100',
        'sticky': '200',
        'modal': '300',
        'popover': '400',
        'tooltip': '500',
        'toast': '600',
      },
      // Grid template columns for responsive grids
      gridTemplateColumns: {
        'auto-fit-xs': 'repeat(auto-fit, minmax(150px, 1fr))',
        'auto-fit-sm': 'repeat(auto-fit, minmax(200px, 1fr))',
        'auto-fit-md': 'repeat(auto-fit, minmax(250px, 1fr))',
        'auto-fit-lg': 'repeat(auto-fit, minmax(300px, 1fr))',
        'auto-fit-xl': 'repeat(auto-fit, minmax(350px, 1fr))',
        'auto-fill-xs': 'repeat(auto-fill, minmax(150px, 1fr))',
        'auto-fill-sm': 'repeat(auto-fill, minmax(200px, 1fr))',
        'auto-fill-md': 'repeat(auto-fill, minmax(250px, 1fr))',
        'auto-fill-lg': 'repeat(auto-fill, minmax(300px, 1fr))',
        'auto-fill-xl': 'repeat(auto-fill, minmax(350px, 1fr))',
      },
      // Aspect ratios
      aspectRatio: {
        'card': '4 / 3',
        'wide': '16 / 9',
        'ultrawide': '21 / 9',
        'portrait': '3 / 4',
        'square': '1 / 1',
      },
      // Brand colors
      colors: {
        primary: {
          50: '#f0fdfa',
          100: '#ccfbf1',
          200: '#99f6e4',
          300: '#5eead4',
          400: '#2dd4bf',
          500: '#14b8a6',
          600: '#0d9488',
          700: '#0f766e',
          800: '#115e59',
          900: '#134e4a',
          950: '#042f2e',
        },
      },
    },
  },
  plugins: [],
}
