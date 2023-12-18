<script setup>
const router = useRouter()
const route = useRoute()

const runtimeConfig = useRuntimeConfig();

if (isNaN(route.params.origin) || isNaN(route.params.destination)) {
  throw new Error('param_error')
}
const originStationId = Number(route.params.origin)
const destinationStationId = Number(route.params.destination)

let resultRoute = {}

const fetchRoute = async () => {
  if (!runtimeConfig.ROUTE_API_ENDPOINT) return
  const params = {
    origin: originStationId,
    destination: destinationStationId
  }
  const query = new URLSearchParams(params)
  const { data } = await useAsyncData(
    'fetchMessage',
    () => {
      return $fetch(runtimeConfig.ROUTE_API_ENDPOINT + '?' + query).catch((error) => console.log(error))
    },
    { server: true }
  )
  resultRoute = data.value
}

await fetchRoute()

const backToHome = () => {
  router.push({ path: `/` })
}
</script>

<template>
    <div>
      <h1>{{$route.params.origin}} -> {{$route.params.destination}}</h1>
      <pre>{{resultRoute.stations}}</pre>
    </div>
  </template>