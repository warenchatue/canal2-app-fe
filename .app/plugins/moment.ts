import moment from 'moment'

export default defineNuxtPlugin((nuxtApp) => {
  return {
    provide: {
      relative: (d: any) => moment().from(d),
    },
  }
})
