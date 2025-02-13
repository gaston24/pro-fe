/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  safelist: [
    'bg-yellow-600',
    'bg-yellow-700', 
    'bg-blue-600', 
    'bg-green-600', 
    'bg-red-600',
    'bg-red-700',
    'bg-purple-600',
    'bg-teal-600',
    'bg-emerald-600',
  ],
  darkMode: false,
  theme: {
    extend: {},
  },
  plugins: [],
};
