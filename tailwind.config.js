/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        brandGreen: '#43b581',
        brandDanger: '#f04747',
        bgPrimary: '#36393f',
        bgSecondary: '#2f3136',
        bgTertiary: '#202225',
      }
    },
  },
  plugins: [],
}
