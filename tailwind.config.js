/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./**/*.{js,ts,jsx,tsx}",
    ],
    darkMode: 'class',
    theme: {
        screens: {
            'xs': '320px',
            'sm': '480px',
            'md': '768px',
            'lg': '1024px',
            'xl': '1280px',
            '2xl': '1536px',
        },
        extend: {
            colors: {
                paper: 'var(--color-paper)',
                surface: 'var(--color-surface)',
                ink: 'var(--color-ink)',
                subtle: 'var(--color-subtle)',
                border: 'var(--color-border)',
            },
            fontFamily: {
                sans: ['"Inter"', 'Helvetica', 'Arial', 'sans-serif'],
                serif: ['"Playfair Display"', 'Times', 'serif'],
            },
            boxShadow: {
                'glass': '0 4px 20px 0 rgba(0, 0, 0, 0.02)',
                'glass-hover': '0 8px 30px 0 rgba(0, 0, 0, 0.04)',
                'glow': '0 0 20px rgba(255, 255, 255, 0.1)',
            },
            fontSize: {
                'xxs': ['0.625rem', { lineHeight: '0.875rem' }],
            },
        },
    },
    plugins: [],
}
