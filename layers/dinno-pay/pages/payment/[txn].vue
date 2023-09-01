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
const orgStore = useOrgStore()
const txnStore = useTransactionStore()
const toaster = useToaster()
const loading = ref(false)
const router = useRouter()
const route = useRoute()
const txnId = route.params.txn.toString()
const query = computed(() => {
  return {
    action: 'getUserOrgs',
  }
})

//fetch the transaction
const txn = await txnStore.getTransaction(txnId)
console.log(txn)
if (txn?.type) {
  const donation = await orgStore.getDonation(txn?.typeId)
  txn.donation = donation
}

async function goToOrgNew() {
  router.push('/bo/org/org-new')
}
async function goToPaymentMethods() {
  await txnStore.updateActiveTransaction({ ...txn } as Transaction)
  loading.value = true
  const timer = setTimeout(async () => {
    loading.value = false
    router.push('/payment/payment-method')
    clearTimeout(timer)
  }, 500)
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
        >
          {{ auth.user.firstName }} {{ auth.user.lastName }}
        </BaseText>
      </div>
    </div>
    <form
      action=""
      method="POST"
      class="mx-auto max-w-7xl px-4"
      @submit.prevent
    >
      <div v-if="!txn">
        <BasePlaceholderPage title="Aucune transaction trouvé" subtitle="">
          <template #image>
            <img
              class="block dark:hidden"
              src="/img/illustrations/placeholders/flat/placeholder-search-4.svg"
              alt="Placeholder image"
            />
            <img
              class="hidden dark:block"
              src="/img/illustrations/placeholders/flat/placeholder-search-4-dark.svg"
              alt="Placeholder image"
            />
          </template>
        </BasePlaceholderPage>
        <div class="mx-auto flex flex-col pb-5 items-center">
          <BaseButton
            type="button"
            shape="curved"
            class="!h-12 w-48"
            color="primary"
            :loading="loading"
            @click="goToOrgNew()"
          >
            Faire un don
          </BaseButton>
          <NuxtLink
            to="/"
            class="text-muted-400 hover:text-primary-500 mt-4 text-xs font-medium underline-offset-4 transition-colors duration-300 hover:underline"
          >
            Retourner à la page d'accueil
          </NuxtLink>
        </div>
      </div>
      <div v-else>
        <div class="pt-8 text-center">
          <BaseHeading tag="h2" size="3xl" weight="medium" class="mb-2">
            Confirmation du paiement
          </BaseHeading>
          <BaseParagraph class="text-muted-500 dark:text-muted-400 mb-8">
            Vérifiez les informations ci-dessous et procedez au paiement
          </BaseParagraph>
        </div>

        <div>
          <div class="w-full">
            <div class="mx-auto w-full">
              <div class="w-full">
                <div v-if="txn" class="mx-auto mb-8">
                  <div class="mx-auto mb-8 max-w-sm">
                    <BaseCard class="w-full ptablet:p-8 p-6 lg:p-8">
                      <BaseText
                        size="xs"
                        weight="medium"
                        class="text-muted-400 mb-6 block uppercase tracking-wider"
                      >
                        ID transaction: {{ txn.id }}
                      </BaseText>
                      <div class="mb-2 flex">
                        <div class="grow">
                          <BaseHeading as="h3" weight="medium">
                            {{ txn.donation?.donor?.firstName }}
                            {{ txn.donation?.donor?.lastName }}
                          </BaseHeading>
                          <BaseText size="sm" class="text-muted-400">
                            {{ txn.donation?.donor?.city }},
                            {{ txn.donation?.donor?.country?.name }}
                          </BaseText>
                          <div
                            class="text-muted-400 mb-4 mt-2 flex items-center gap-2"
                          >
                            <Icon name="lucide:mail" class="h-4 w-4" />
                            <BaseText size="xs">
                              {{ txn.donation?.donor?.email }}
                            </BaseText>
                          </div>
                        </div>
                        <div class="shrink-0">
                          <BaseAvatar size="lg" src="/img/avatars/20.svg" />
                        </div>
                      </div>

                      <div
                        class="divide-muted-200 dark:divide-muted-700 flex w-full items-center divide-x py-4"
                      >
                        <div class="xxl:pe-6 flex flex-1 flex-col gap-1 pe-4">
                          <BaseHeading
                            as="h3"
                            size="sm"
                            weight="medium"
                            lead="none"
                          >
                            {{ txn.amount }} XAF
                          </BaseHeading>
                          <BaseText size="xs" class="text-muted-400">
                            Montant
                          </BaseText>
                        </div>
                        <div class="xxl:px-6 flex flex-1 flex-col gap-1 px-4">
                          <BaseHeading
                            as="h3"
                            size="sm"
                            weight="medium"
                            lead="none"
                          >
                            {{ txn.donation?.type }}
                          </BaseHeading>
                          <BaseText size="xs" class="text-muted-400">
                            Type
                          </BaseText>
                        </div>
                        <div class="xxl:ps-6 flex flex-1 flex-col gap-1 ps-4">
                          <BaseHeading
                            as="h3"
                            size="sm"
                            weight="medium"
                            lead="none"
                          >
                            Online
                          </BaseHeading>
                          <BaseText size="xs" class="text-muted-400">
                            Method
                          </BaseText>
                        </div>
                      </div>
                      <BaseHeading as="h3" size="md" weight="medium">
                        Organisation
                      </BaseHeading>
                      <BaseText size="sm" class="text-muted-400">
                        <span class="">{{ orgStore.activeOrg.name }}</span>
                      </BaseText>
                      <div class="my-2">
                        <BaseHeading as="h3" size="md" weight="medium">
                          Observation
                        </BaseHeading>
                        <BaseText size="sm" class="text-muted-400">
                          {{ txn.donation?.comments }}
                        </BaseText>
                      </div>
                    </BaseCard>
                  </div>
                </div>
                <div class="mx-auto flex flex-col items-center">
                  <BaseButton
                    type="button"
                    shape="curved"
                    class="!h-12 w-48"
                    color="primary"
                    :loading="loading"
                    @click="goToPaymentMethods()"
                  >
                    Continuer
                  </BaseButton>
                  <NuxtLink
                    to="/"
                    class="text-muted-400 hover:text-primary-500 mt-4 text-xs font-medium underline-offset-4 transition-colors duration-300 hover:underline"
                  >
                    Retourner à la page d'accueil
                  </NuxtLink>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </form>
  </div>
</template>
