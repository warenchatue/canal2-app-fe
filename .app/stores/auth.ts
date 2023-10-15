import { User } from '~/types/user'

const delay = (t: number) => new Promise((r) => setTimeout(r, t))

const baseUser = {
  _id: '',
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  appRole: {},
  picture: '',
}

export interface UserPayloadInterface {
  username: string
  password: string
  type: string
}

export const useAuthStore = defineStore('auth', {
  state: () => ({
    authenticated: false,
    token: null,
    user: baseUser,
    loading: false,
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
      const { data, success }: any = await useFetch('/api/auth', {
        method: 'post',
        headers: { 'Content-Type': 'application/json' },
        query: {
          action: 'login',
        },
        body: {
          username,
          password,
          type: 'email',
        },
      })
      this.loading = success
      var response = data._value.data
      console.log('response')
      console.log(response)

      if (data.value) {
        this.user._id = response.user._id
        this.user.firstName = response.user.firstName
        this.user.lastName = response.user.lastName
        this.user.email = response.user.email
        this.user.phone = response.user.phone
        this.user.appRole = response.user.appRole
        this.user.picture = ''
        this.authenticated = true
        const token = useCookie('token') // useCookie new hook in nuxt 3
        token.value = response.accessToken // set token to cookie
        this.authenticated = true // set authenticated  state value to true
      }
    },
    async registerUser(user: User, isAdmin: boolean): Promise<boolean> {
      const { data, success }: any = await useFetch('/api/auth', {
        method: 'post',
        headers: { 'Content-Type': 'application/json' },
        query: {
          action: 'register',
        },
        body: {
          ...user,
        },
      })
      this.loading = success
      var response = data._value.data
      console.log('response')
      console.log(response)

      if (data.value && isAdmin == false) {
        this.user._id = response.user._id
        this.user.firstName = response.user.firstName
        this.user.lastName = response.user.lastName
        this.user.email = response.user.email
        this.user.appRole = response.user.appRole
        this.user.picture = ''
        this.authenticated = true
        const token = useCookie('token') // useCookie new hook in nuxt 3
        token.value = response.accessToken // set token to cookie
        this.authenticated = true // set authenticated  state value to true
        return true
      } else if (data.value && isAdmin == true) {
        return true
      } else {
        return false
      }
    },
    async updateUser(user: User, isAdmin: boolean): Promise<boolean> {
      const token = useCookie('token')
      const { data, success }: any = await useFetch('/api/users', {
        method: 'post',
        headers: { 'Content-Type': 'application/json' },
        query: {
          action: 'updateOne',
          id: user._id,
          token: token.value,
        },
        body: {
          ...user,
        },
      })
      this.loading = success
      var response = data._value.data
      console.log('response')
      console.log(response)

      if (data.value && isAdmin == true) {
        return true
      } else if (isAdmin == false) {
        this.user.firstName = response.user.firstName
        this.user.lastName = response.user.lastName
        this.user.email = response.user.email
        this.user.phone = response.user.phone
        return true
      } else {
        return false
      }
    },
    logUserOut() {
      const token = useCookie('token') // useCookie new hook in nuxt 3
      this.authenticated = false // set authenticated  state value to false
      token.value = null // clear the token cookie
      this.user = baseUser
      const router = useRouter()
      router.push('/')
    },
  },
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useAuthStore, import.meta.hot))
}
