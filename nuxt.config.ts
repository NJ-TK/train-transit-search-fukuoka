// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  ssr: true,
  runtimeConfig: {
    public: {
      STATION_LIST_API_ENDPOINT: 'http://localhost:8888/.netlify/functions/route-db'
    }    
  },
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
      path: "@/components",
      pathPrefix: false,
    }
  ]
})
