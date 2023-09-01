import { Org } from '~/types/org'

const delay = (t: number) => new Promise((r) => setTimeout(r, t))

var baseOrg: Org
var arrOrgs: Org[]
export const useAppStore = defineStore('app', {
  state: () => ({
    activeOrg: baseOrg,
    myOrgs: arrOrgs,
  }),

  persist: true,

  getters: {
    fullName(): String {
      return `${this.activeOrg.name} ${this.activeOrg.name}`
    },
  },

  actions: {
    me() {
      console.log(this.activeOrg.name)
    },

    async setActiveOrg(org: Org) {
      this.activeOrg = org
    },
    async addOrg(org: Org) {
      this.myOrgs.push(org)
    },
    async reset() {
      this.activeOrg = baseOrg
    },
  },
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useAppStore, import.meta.hot))
}
