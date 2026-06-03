export default defineNuxtConfig({
  modules: ['@nuxtjs/tailwindcss'],
  css: ['~/assets/css/main.css'],

  runtimeConfig: {
    // server-only secrets
    teamPassword: process.env.TEAM_PASSWORD,
    sheets: {
      endpoint: process.env.GOOGLE_SHEETS_ENDPOINT,
      token: process.env.GOOGLE_SHEETS_TOKEN, // optional
    },
    public: {},
  },

  nitro: process.env.NETLIFY
    ? {
        preset: 'netlify',
      }
    : undefined,

  compatibilityDate: '2024-11-01',
})
