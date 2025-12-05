/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'primary': '#00CED1',
        'primary-dark': '#0099a8',
        'secondary': '#FF8C00',
        'bg-dark': '#0a0a0a',
        'bg-panel': '#1a1a1a',
        'border': '#333333',
        'text-gray': '#aaaaaa',
      }
    }
  },
  plugins: [],
}
