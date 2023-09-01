import { Transaction } from '~/types/transaction'

var arrTxns: Transaction[] = []
var txn: Transaction
export const useTransactionStore = defineStore('transactions', {
  state: () => ({
    transactions: arrTxns,
    activeTransaction: txn,
  }),

  persist: true,

  getters: {
    whoami(): String {
      return `All transactions`
    },
  },

  actions: {
    me() {
      console.log(this.transactions)
    },
    allTransactions() {
      return this.transactions
    },

    async addTxn(txn: Transaction) {
      this.transactions.push(txn)
    },
    async getTransaction(id: string) {
      const txns = this.transactions.filter((t) => t.id == id)
      if (txns?.length == 1) {
        return txns[0]
      }
      return null
    },
    async updateActiveTransaction(txn: Transaction) {
      for (let i = 0; i < this.transactions.length; i++) {
        if (this.transactions[i].id === txn.id) {
          this.transactions[i] = txn
          this.activeTransaction = txn
          console.log(this.activeTransaction)
        }
      }
    },
    async reset() {
      this.transactions = []
    },
  },
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useTransactionStore, import.meta.hot))
}
