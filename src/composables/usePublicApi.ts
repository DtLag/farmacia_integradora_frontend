import { createFetch } from '@vueuse/core'

export const usePublicApi = createFetch({
  baseUrl: 'https://api.harold-dev.me/api',

  options: {
    beforeFetch({ options }) {
      options.headers = {
        ...options.headers,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      }
      return { options }
    },
    onFetchError(ctx) {
      console.error('Error en API Pública:', ctx.error)
      console.error('Respuesta del servidor:', ctx.response)
      console.error('Datos de respuesta:', ctx.data)
      return ctx
    },
  },

  fetchOptions: {
    mode: 'cors',
  },
})
