/**
 * TAILWIND CONFIGURATION
 * 
 * Simple Tailwind config for PromptStack.
 * Includes dark mode and common plugins.
 * 
 * TO CUSTOMIZE:
 * - Add custom colors in theme.extend.colors
 * - Add custom fonts in theme.extend.fontFamily
 * - Add animations in theme.extend.animation
 * 
 * COMMON AI PROMPTS:
 * - "Add custom brand colors"
 * - "Add custom font family"
 * - "Add new animation"
 * - "Add custom breakpoint"
 */

/** @type {import('tailwindcss').Config} */
module.exports = {
  // Where to look for classes
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  
  // Enable dark mode with class strategy
  darkMode: 'class',
  
  theme: {
    extend: {
      // Custom colors using CSS variables
      colors: {
        // Base colors from CSS variables
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))'
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))'
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))'
        },
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        
        // Semantic colors
        success: {
          DEFAULT: 'hsl(var(--success))',
          foreground: 'hsl(var(--success-foreground))'
        },
        error: {
          DEFAULT: 'hsl(var(--error))',
          foreground: 'hsl(var(--error-foreground))'
        },
        warning: {
          DEFAULT: 'hsl(var(--warning))',
          foreground: 'hsl(var(--warning-foreground))'
        },
        info: {
          DEFAULT: 'hsl(var(--info))',
          foreground: 'hsl(var(--info-foreground))'
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))'
        },
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))'
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))'
        },
        
        // Legacy colors for backward compatibility
        charcoal: '#1a1a1a',
        'dark-gray': '#2a2a2a',
        orange: {
          DEFAULT: '#ff6b35',
          50: '#fff4ec',
          100: '#ffe8d9',
          200: '#ffd1b3',
          300: '#ffba8d',
          400: '#ffa367',
          500: '#ff6b35',
          600: '#cc562a',
          700: '#994120',
          800: '#662b15',
          900: '#33160b',
        }
      },
      
      // Custom fonts (add your fonts here)
      fontFamily: {
        // Example: 'display': ['Inter', 'sans-serif'],
      },
      
      // Custom animations
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'bounce-slow': 'bounce 2s infinite',
      },
      
      // Custom spacing
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
      },
      
      // Custom border radius
      borderRadius: {
        '4xl': '2rem',
      },
      
      // Custom shadows
      boxShadow: {
        'soft': '0 2px 15px -3px rgba(0, 0, 0, 0.07), 0 10px 20px -2px rgba(0, 0, 0, 0.04)',
      }
    },
  },
  
  // Useful plugins
  plugins: [
    // Forms plugin for better form styles
    require('@tailwindcss/forms')({
      strategy: 'class', // Use class strategy to avoid conflicts
    }),
    
    // Typography plugin for prose styles (optional)
    // require('@tailwindcss/typography'),
    
    // Aspect ratio plugin (optional)
    // require('@tailwindcss/aspect-ratio'),
  ],
}