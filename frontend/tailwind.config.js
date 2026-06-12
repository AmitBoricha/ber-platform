/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: '#07080F',
        card: '#141624',
        card2: '#1C2038',
        border: '#252840',
        teal: '#00C49A',
        blue: '#4A8FE7',
        purple: '#8B5CF6',
        amber: '#F59E0B',
        red: '#E24B4A',
        lgray: '#C8D0DC',
        gray2: '#8892A4',
      },
    },
  },
  plugins: [],
}
