const delay = (t: number) => new Promise((r) => setTimeout(r, t))

const baseUser = {
  id: '',
  firstName: '',
  lastName: '',
  email: '',
  role: 'member',
  picture: '',
}

interface UserPayloadInterface {
  username: string
  password: string
}

export const useAuthStore = defineStore('auth', {
  state: () => ({
    authenticated: false,
    loading: false,
    user: baseUser,
  }),

  persist: true,

  getters: {
    fullName(): String {
      return `${this.user.firstName} ${this.user.lastName}`
    },
  },

  actions: {
    me() {
      console.log(this.user.firstName)
    },

    async authenticateUser({ username, password }: UserPayloadInterface) {
      const { data, pending }: any = await useFetch('/api/users', {
        method: 'post',
        headers: { 'Content-Type': 'application/json' },
        query: {
          action: 'post',
        },
        body: {
          username,
          password,
        },
      })
      this.loading = pending

      var myUser = data._value.data
      console.log(myUser)

      if (data.value) {
        this.user.id = myUser.id
        this.user.firstName = myUser.firstName
        this.user.lastName = myUser.lastName
        this.user.email = myUser.email
        this.user.role = myUser.role
        this.user.picture = myUser.picture
        this.authenticated = true
        const token = useCookie('token') // useCookie new hook in nuxt 3
        token.value = myUser.token // set token to cookie
        this.authenticated = true // set authenticated  state value to true
      }
    },
    logUserOut() {
      const token = useCookie('token') // useCookie new hook in nuxt 3
      this.authenticated = false // set authenticated  state value to false
      token.value = null // clear the token cookie
      this.user = baseUser
      const router  = useRouter()
      router.push('/')
    },
  },
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useAuthStore, import.meta.hot))
}
