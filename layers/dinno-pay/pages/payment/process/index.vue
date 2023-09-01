<script setup lang="ts">
import { Org } from '~/types/org'
import { Transaction } from '~/types/transaction'

definePageMeta({
  title: 'Confirm payment',
  layout: 'empty',
  preview: {
    title: 'Confirm payment',
    description: 'For onboarding new users',
    categories: ['payment-auth'],
    src: '/img/screens/layouts-onboarding-1.png',
    srcDark: '/img/screens/layouts-onboarding-1-dark.png',
    order: 93,
  },
})

const auth = useAuthStore()
const txnStore = useTransactionStore()
const orgStore = useOrgStore()
const toaster = useToaster()
const loading = ref(true)
const router = useRouter()
const query = computed(() => {
  return {
    action: 'getUserOrgs',
  }
})

const timer = setTimeout(async () => {
  loading.value = false
  //update txn
  await txnStore.updateActiveTransaction({
    ...txnStore.activeTransaction,
    status: 'success',
  } as Transaction)
  const activeTxn = txnStore.activeTransaction
  console.log(activeTxn)
  //update donation
  await orgStore.updateDonation(activeTxn)
  console.log(await orgStore.getDonation(activeTxn.id!))
  console.log(await orgStore.activeOrg.donations?.toString)

  goToPaymentResult()
  clearTimeout(timer)
}, 1000)

const { data, pending, error, refresh } = await useFetch('/api/orgs', {
  method: 'post',
  headers: { 'Content-Type': 'application/json' },
  query: query,
  body: {
    uid: auth.user.id,
  },
})

if (data.value) {
  console.log(data)
}
async function goToOrgNew() {
  router.push('/bo/org/org-new')
}
async function goToPaymentResult() {
  loading.value = true
  const timer = setTimeout(async () => {
    loading.value = false
    router.push('/payment/result')
    clearTimeout(timer)
  }, 100)
}
</script>

<template>
  <div class="bg-muted-100 dark:bg-muted-900 min-h-screen">
    <div
      class="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-4"
    >
      <NuxtLink
        to="/"
        class="text-muted-400 hover:text-primary-500 dark:text-muted-700 dark:hover:text-primary-500 transition-colors duration-300"
      >
        <TairoLogo class="h-10 w-10" />
      </NuxtLink>
      <div class="flex items-center gap-4">
        <BaseThemeToggle />
        <BaseText
          size="xs"
          class="text-muted-400 hover:cursor-pointer"
          @click="auth.logUserOut()"
          >{{ auth.user.firstName }} {{ auth.user.lastName }}</BaseText
        >
      </div>
    </div>
    <div class="flex justify-items-center justify-center items-center">
      <div>
        <div class="pt-16 md:pt-32 text-center">
          <BaseHeading
            tag="h2"
            size="3xl"
            weight="medium"
            class="mb-2 text-xl md:text-3xl"
          >
            Paiement en cours de traitement
          </BaseHeading>
          <BaseParagraph class="text-muted-500 dark:text-muted-400 mb-10">
            Nous procedons au traitement de votre transaction
          </BaseParagraph>

          <BaseParagraph class="text-muted-800 dark:text-muted-200 mb-8">
            Veuillez composer le #150*10# pour confirmer le paiement...
          </BaseParagraph>
        </div>

        <div class="w-full">
          <div class="mx-auto w-full">
            <div class="w-full flex flex-col items-center">
              <div class="mx-auto flex flex-col items-center">
                <BaseButton
                  type="button"
                  shape="curved"
                  class="!h-12 w-48"
                  color="primary"
                  :loading="loading"
                  @click="goToPaymentResult()"
                  >Reesayer</BaseButton
                >
                <NuxtLink
                  v-if="!loading"
                  to="/"
                  class="text-muted-400 hover:text-primary-500 mt-4 text-xs font-medium underline-offset-4 transition-colors duration-300 hover:underline"
                  >Retourner à la page d'accueil</NuxtLink
                >
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
