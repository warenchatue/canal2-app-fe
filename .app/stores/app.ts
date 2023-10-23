const delay = (t: number) => new Promise((r) => setTimeout(r, t))

var appRoles: any[]
var appCountries: any[]
export const useAppStore = defineStore('app', {
  state: () => ({
    roles: appRoles,
    countries: appCountries,
  }),

  persist: true,

  getters: {
    fullName(): String {
      return ``
    },
  },

  actions: {
    me() {},
    async setRoles() {
      const token = useCookie('token')
      const perPage = ref(100)
      const { data }: any = await useFetch('/api/users/roles', {
        method: 'get',
        headers: { 'Content-Type': 'application/json' },
        query: {
          perPage,
          action: 'findAll',
          token: token.value,
        },
      })
      var response = data._value.data
      this.roles = response
    },
    async setCountries() {
      const token = useCookie('token')
      const perPage = ref(100)
      const { data }: any = await useFetch('/api/countries', {
        method: 'get',
        headers: { 'Content-Type': 'application/json' },
        query: {
          perPage,
          action: 'findAll',
          token: token.value,
        },
      })
      var response = data._value.data
      this.countries = response
    },

    async updateRoles(role: any) {
      this.roles.push(role)
    },
    async updateCountry(country: any) {
      this.countries.push(country)
    },
  },
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useAppStore, import.meta.hot))
}
