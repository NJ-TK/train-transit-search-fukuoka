// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },
  app: {
    head: {
      link: [
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/icon?family=Material+Icons',
        },
      ]
    }
  },
  css: [
    "@/assets/styles/index.css"
  ],
  components: [
    {
      path: '~/components',
      extensions: ['.vue']
    }
  ]
})
