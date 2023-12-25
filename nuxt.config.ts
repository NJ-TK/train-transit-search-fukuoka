// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  ssr: true,
  runtimeConfig: {
    public: {
      stationListApiEndpoint: process.env.STATION_LIST_API_ENDPOINT,
      routeApiEndpoint: process.env.ROUTE_API_ENDPOINT
    },
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
