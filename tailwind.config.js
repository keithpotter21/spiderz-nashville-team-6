/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./app.vue",
    "./components/**/*.{vue,js,ts}",
    "./layouts/**/*.vue",
    "./pages/**/*.vue",
    "./middleware/**/*.ts",
    "./server/**/*.ts",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
