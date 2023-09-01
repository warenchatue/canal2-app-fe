import { Donation } from '~/types/donation'
import { Org } from '~/types/org'
import { Transaction } from '~/types/transaction'

var baseOrg: Org
var arrOrgs: Org[]
export const useOrgStore = defineStore('org', {
  state: () => ({
    activeOrg: baseOrg,
    myOrgs: arrOrgs,
  }),

  persist: true,

  getters: {
    whoami(): String {
      return `${this.activeOrg.name} ${this.activeOrg.description}`
    },
  },

  actions: {
    me() {
      console.log(this.activeOrg)
    },
    allMyOrgs() {
      return this.myOrgs
    },

    async setActiveOrg(org: Org) {
      this.activeOrg = org
      this.activeOrg.donations = []
      this.activeOrg.campaigns = [
        {
          id: '1',
          slug: 'construction-ecole-a-hiala',
          name: 'Constructon d`une école a hiala',
          category: 'Education',
          description:
            "L`objectif de ce projet vise à construire un établissement d'enseignement primaire à hiala  pour améliorer léduction de la population de cette localité.",
          status: 'active',
          dueDate: 'August 2024',
          updated: '3m ago',
          image:
            'https://cdn.helloasso.com/img/photos/collectes/plans%20en%203d%203%20-4fa70113e8c141c1ace77074ff291a54.jpg?resize=fill:500:360',
          completed: 75,
          recent: false,
          meta: {
            monthDuration: 8,
            budgetType: 'Fixed',
          },
          owner: {
            id: '1',
            name: 'Communauté Bandjoun',
            slug: 'bandjoun',
            description:
              'La communauté bandjoun. Pour une évolution vers lavenir',
            owner: '1',
            members: ['1', '2'],
            type: 'NPO',
            medias: {
              cover:
                'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8c/Cour_du_Palais_de_Bandjoun.jpg/1024px-Cour_du_Palais_de_Bandjoun.jpg',
              logo: 'https://image.jimcdn.com/app/cms/image/transf/none/path/s1084e755aa436055/image/ia9e3c984b2429c21/version/1600703023/image.jpg',
              badge: '/img/icons/flags/cmr.svg',
            },
          },
          files: [
            'https://cdn.helloasso.com/img/photos/collectes/plans%20en%203d%203%20-4fa70113e8c141c1ace77074ff291a54.jpg?resize=fill:500:360',
            'https://cdn.helloasso.com/img/photos/collectes/plans%20en%203d%203%20-4fa70113e8c141c1ace77074ff291a54.jpg?resize=fill:500:360',
            'https://cdn.helloasso.com/img/photos/collectes/plans%20en%203d%203%20-4fa70113e8c141c1ace77074ff291a54.jpg?resize=fill:500:360',
            'https://cdn.helloasso.com/img/photos/collectes/plans%20en%203d%203%20-4fa70113e8c141c1ace77074ff291a54.jpg?resize=fill:500:360',
          ],
          contributors: [
            {
              id: 27,
              src: '/img/avatars/24.svg',
              badge: '/img/stacks/illustrator.svg',
              name: 'CHATUE Emmanuel',
              tooltip: 'Carmen E.',
              'data-tooltip': 'Carmen E.',
              text: 'CE',
              amount: '500 000 XAF',
              date: '18-04-2023',
              txn: {},
            },
            {
              id: 15,
              src: '/img/avatars/15.svg',
              badge: '/img/stacks/js.svg',
              name: 'ANAFACK Jordan',
              tooltip: 'Josh C.',
              'data-tooltip': 'Josh C.',
              text: 'JC',
              amount: '25 000 XAF',
              date: '20-03-2022',
              txn: {},
            },
            {
              id: 12,
              src: '/img/avatars/12.svg',
              badge: '/img/stacks/csharp.svg',
              name: 'Anonyme',
              tooltip: 'Marjory L.',
              'data-tooltip': 'Marjory L.',
              text: 'ML',
              amount: '5000 XAF',
              date: '10-04-2022',
              txn: {},
            },
          ],
          tools: [
            {
              name: 'whatsapp',
              description: 'Design Software',
              icon: '/img/stacks/sketch.svg',
            },
            {
              name: 'facebook',
              description: 'Design Software',
              icon: '/img/stacks/sketch.svg',
            },
            {
              name: 'twitter',
              description: 'Design Software',
              icon: '/img/stacks/sketch.svg',
            },
          ],
        },
      ]
    },
    async addDonation(donation: Donation) {
      this.activeOrg.donations?.push(donation)
    },
    async addCampaignDonation(campaignId: string, donation: Donation) {
      for (let i = 0; i < this.activeOrg?.campaigns?.length; i++) {
        if (this.activeOrg.campaigns[i].id === campaignId) {
          this.activeOrg.campaigns[i]?.contributions?.push(donation)
        }
      }
    },
    async getDonation(id: string) {
      const donations = this.activeOrg.donations?.filter((d) => d.id == id)
      if (donations?.length == 1) {
        return donations[0]
      }
      return null
    },

    async updateDonation(txn: Transaction) {
      if (this.activeOrg.donations?.length) {
        for (let i = 0; i < this.activeOrg.donations?.length; i++) {
          if (this.activeOrg.donations[i].id === txn.typeId) {
            this.activeOrg.donations[i].status = txn.status
            this.activeOrg.donations[i].txnId = txn.id
            this.activeOrg.donations[i].txn = txn
            console.log(this.activeOrg.donations[i])
          }
        }
      }
    },
    // async updateCampaign(txn: Transaction) {
    //   if (this.activeOrg.campaigns?.length) {
    //     for (let i = 0; i < this.activeOrg.campaigns?.length; i++) {
    //       if (this.activeOrg.campaigns[i].id === txn.typeId) {
    //         this.activeOrg.campaigns[i].txnId = txn.id
    //         this.activeOrg.campaigns[i].txn = txn
    //         console.log(this.activeOrg.campaigns[i])
    //       }
    //     }
    //   }
    // },
    async reset() {
      this.activeOrg = baseOrg
    },
  },
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useOrgStore, import.meta.hot))
}
