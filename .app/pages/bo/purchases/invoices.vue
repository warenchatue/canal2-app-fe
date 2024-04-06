<script setup lang="ts">
import { Field } from 'vee-validate'
import { UserRole } from '~/types/user'

definePageMeta({
  title: 'Factures',
  preview: {
    title: 'Factures',
    description: 'Factures | Commandes',
    categories: ['bo', 'spots', 'orders'],
    src: '/img/screens/layouts-table-list-1.png',
    srcDark: '/img/screens/layouts-table-list-1-dark.png',
    order: 44,
  },
})

const fakeItems = ref([])

const authStore = useAuthStore()
const route = useRoute()
const router = useRouter()
const page = computed(() => parseInt((route.query.page as string) ?? '1'))
const filter = ref('')
const perPage = ref(10)
const isModalDeletePackageOpen = ref(false)
const isModalCopyInvoiceOpen = ref(false)
const isModalDoitInvoiceOpen = ref(false)
const isModalSalesReportOpen = ref(false)
const isEdit = ref(false)
const isPrint = ref(false)
const toaster = useToaster()
const currentOrg = ref('')
const currentTeam = ref('')
const currentPackage = ref({})
const isLoading = ref(false)
const dates = ref({
  start: new Date(),
  end: new Date(),
})
const startDate = ref(new Date())
const endDate = ref(new Date())

// Check if can have access
if (
  authStore.user.appRole?.name != UserRole.billing &&
  authStore.user.appRole?.name != UserRole.adminSale &&
  authStore.user.appRole?.name != UserRole.admin &&
  authStore.user.appRole?.name != UserRole.accountancy &&
  authStore.user.appRole?.name != UserRole.superAdmin
) {
  toaster.clearAll()
  toaster.show({
    title: 'Désolé',
    message: `Vous n'avez pas access à cette page!`,
    color: 'danger',
    icon: 'ph:check',
    closable: true,
  })
  router.back()
}

watch([filter, perPage], () => {
  router.push({
    query: {
      page: undefined,
    },
  })
})

const token = useCookie('token')
const query = computed(() => {
  return {
    filter: filter.value,
    perPage: perPage.value,
    page: page.value,
    action: 'findAll',
    token: token.value,
  }
})

const { data, pending, refresh } = await useFetch('/api/purchases/invoices', {
  query,
  lazy: true,
})

const { data: orgs, pending: pendingOrg } = await useFetch('/api/admin/orgs', {
  query,
  lazy: true,
})

function confirmDeletePackage(invoice: any) {
  isModalDeletePackageOpen.value = true
  isEdit.value = false
  currentPackage.value = invoice
}

function updateCurrentInvoice(invoice: any) {
  currentPackage.value = invoice
}

async function printSalesReport() {
  const queryP = computed(() => {
    return {
      filter: filter.value,
      perPage: perPage.value,
      page: page.value,
      org: currentOrg.value._id,
      team: currentTeam.value,
      startDate: startDate.value,
      endDate: endDate.value,
      action: 'findAllFilters',
      token: token.value,
    }
  })

  const { data: reportData } = await useFetch('/api/purchases/invoices', {
    query: queryP,
  })
  data.value = reportData.value
  isPrint.value = true
  setTimeout(() => {
    var printContents = document.getElementById('print-sales-report').innerHTML
    var originalContents = document.body.innerHTML
    document.body.innerHTML = printContents
    window.print()
    document.body.innerHTML = originalContents
    location.reload()
  }, 500)
}

function openReportModal() {
  setTimeout(() => {
    isModalSalesReportOpen.value = true
  }, 500)
}

async function deletePackage(invoice: any) {
  const query2 = computed(() => {
    return {
      action: 'delete',
      token: token.value,
      id: invoice._id,
    }
  })

  const response = await useFetch('/api/purchases/invoices', {
    method: 'delete',
    headers: { 'Content-Type': 'application/json' },
    query: query2,
  })

  if (response.data?.value?.success) {
    success.value = true
    toaster.clearAll()
    toaster.show({
      title: 'Success',
      message: `Facture supprimée !`,
      color: 'success',
      icon: 'ph:check',
      closable: true,
    })
    isModalDeletePackageOpen.value = false
    filter.value = 'invoice'
    filter.value = ''
  } else {
    toaster.clearAll()
    toaster.show({
      title: 'Désolé',
      message: `Une erreur est survenue !`,
      color: 'danger',
      icon: 'ph:check',
      closable: true,
    })
  }
}

async function copyInvoice(invoice: any) {
  const query2 = computed(() => {
    return {
      action: 'copyInvoice',
      token: token.value,
      id: invoice._id,
    }
  })

  const response = await useFetch('/api/purchases/invoices', {
    method: 'put',
    headers: { 'Content-Type': 'application/json' },
    query: query2,
  })

  if (response.data?.value?.success) {
    success.value = true
    toaster.clearAll()
    toaster.show({
      title: 'Success',
      message: `Facture Dupliquée !`,
      color: 'success',
      icon: 'ph:check',
      closable: true,
    })
    isModalCopyInvoiceOpen.value = false
    filter.value = 'invoice'
    filter.value = ''
  } else {
    toaster.clearAll()
    toaster.show({
      title: 'Désolé',
      message: `Une erreur est survenue !`,
      color: 'danger',
      icon: 'ph:check',
      closable: true,
    })
  }
}
async function updateInvoiceIsDoit(invoice: any) {
  const query2 = computed(() => {
    return {
      action: 'updateInvoiceIsDoit',
      token: token.value,
      id: invoice._id,
    }
  })

  const response = await useFetch('/api/purchases/invoices', {
    method: 'put',
    headers: { 'Content-Type': 'application/json' },
    query: query2,
  })

  if (response.data?.value?.success) {
    success.value = true
    toaster.clearAll()
    toaster.show({
      title: 'Success',
      message: `Facture transformée !`,
      color: 'success',
      icon: 'ph:check',
      closable: true,
    })
    isModalDoitInvoiceOpen.value = false
    filter.value = 'invoice'
    filter.value = ''
  } else {
    toaster.clearAll()
    toaster.show({
      title: 'Désolé',
      message: `Une erreur est survenue !`,
      color: 'danger',
      icon: 'ph:check',
      closable: true,
    })
  }
}

const selected = ref<number[]>([])
const isAllVisibleSelected = computed(() => {
  return selected.value.length === data.value?.data.length
})

function toggleAllVisibleSelection() {
  if (isAllVisibleSelected.value) {
    selected.value = []
  } else {
    selected.value = data.value?.data?.map((item) => item._id) ?? []
  }
}

const success = ref(false)
</script>

<template>
  <div>
    <TairoContentWrapper>
      <template #left>
        <BaseInput
          v-model="filter"
          icon="lucide:search"
          placeholder="Filtrer facture..."
          :classes="{
            wrapper: 'w-full sm:w-auto',
          }"
        />
      </template>
      <template #right>
        <BaseSelect
          v-model="perPage"
          label=""
          :classes="{
            wrapper: 'w-full sm:w-40',
          }"
        >
          <option :value="10">10 per page</option>
          <option :value="25">25 per page</option>
          <option :value="50">50 per page</option>
          <option :value="100">100 per page</option>
        </BaseSelect>
        <BaseButton
          color="primary"
          class="w-full sm:w-40"
          @click="openReportModal()"
        >
          <Icon name="ph:file" class="h-4 w-4" />
          <span>Rapports</span>
        </BaseButton>
        <BaseButton
          color="primary"
          class="w-full sm:w-52"
          to="/bo/purchases/orders/new-invoice-0"
          @click="isLoading = true"
          :loading="isLoading"
          :disabled="isLoading"
        >
          <Icon name="ph:plus" class="h-4 w-4" />
          <span>Nouvelle facture</span>
        </BaseButton>
        <BaseButton
          data-tooltip="Raffraichir la page"
          color="primary"
          class="w-full sm:w-16"
          @click="refresh"
        >
          <Icon name="ph:arrows-clockwise" class="h-6 w-6" />
          <span></span>
        </BaseButton>
      </template>
      <div class="grid grid-cols-12 gap-4 pb-5">
        <!-- Stat tile -->
        <div class="col-span-12 md:col-span-3">
          <BaseCard class="p-4">
            <div class="mb-1 flex items-center justify-between">
              <BaseHeading
                as="h5"
                size="sm"
                weight="medium"
                lead="tight"
                class="text-muted-700 dark:text-muted-400"
              >
                <span>Total</span>
              </BaseHeading>
              <BaseIconBox
                size="xs"
                class="bg-success-100 text-success-500 dark:bg-success-500/20 dark:text-success-400 dark:border-success-500 dark:border-2"
                shape="full"
              >
                <Icon name="ph:basket" class="h-5 w-5" />
              </BaseIconBox>
            </div>
            <div class="mb-2">
              <BaseHeading
                as="h4"
                size="2xl"
                weight="bold"
                lead="tight"
                class="text-muted-800 dark:text-white"
              >
                <span v-if="!pending">{{ data?.metaData?.totalItems }}</span>
                <span v-else
                  ><BasePlaceload class="h-3 w-10 rounded-lg"
                /></span>
              </BaseHeading>
            </div>
            <div
              class="text-success-500 flex items-center gap-1 font-sans text-sm"
            >
              <span>+0.0%</span>
              <Icon name="lucide:trending-up" class="h-5 w-5" />
              <span class="text-muted-400 text-xs">en hause</span>
            </div>
          </BaseCard>
        </div>
        <!-- Stat tile -->
        <div class="col-span-12 md:col-span-3">
          <BaseCard class="p-4">
            <div class="mb-1 flex items-center justify-between">
              <BaseHeading
                as="h5"
                size="sm"
                weight="medium"
                lead="tight"
                class="text-muted-700 dark:text-muted-400"
              >
                <span>Soldés</span>
              </BaseHeading>
              <BaseIconBox
                size="xs"
                class="bg-yellow-100 text-yellow-500 dark:border-2 dark:border-yellow-500 dark:bg-yellow-500/20 dark:text-yellow-400"
                shape="full"
              >
                <Icon name="ph:money" class="h-5 w-5" />
              </BaseIconBox>
            </div>
            <div class="mb-2">
              <BaseHeading
                as="h4"
                size="2xl"
                weight="bold"
                lead="tight"
                class="text-muted-800 dark:text-white"
              >
                <span v-if="!pending">{{
                  data?.metaData?.totalAnnouncers
                }}</span>
                <span v-else
                  ><BasePlaceload class="h-3 w-10 rounded-lg"
                /></span>
              </BaseHeading>
            </div>
            <div
              class="text-danger-500 flex items-center gap-1 font-sans text-sm"
            >
              <span>-0.0%</span>
              <Icon name="lucide:trending-down" class="h-5 w-5" />
              <span class="text-muted-400 text-xs">en baisse</span>
            </div>
          </BaseCard>
        </div>
        <!-- Stat tile -->
        <div class="col-span-12 md:col-span-3">
          <BaseCard class="p-4">
            <div class="mb-1 flex items-center justify-between">
              <BaseHeading
                as="h5"
                size="sm"
                weight="medium"
                lead="tight"
                class="text-muted-700 dark:text-muted-400"
              >
                <span>En attente</span>
              </BaseHeading>
              <BaseIconBox
                size="xs"
                class="bg-primary-100 text-primary-500 dark:bg-primary-500/20 dark:text-primary-400 dark:border-primary-500 dark:border-2"
                shape="full"
              >
                <Icon name="ph:money" class="h-5 w-5" />
              </BaseIconBox>
            </div>
            <div class="mb-2">
              <BaseHeading
                as="h4"
                size="2xl"
                weight="bold"
                lead="tight"
                class="text-muted-800 dark:text-white"
              >
                <span v-if="!pending">{{ data?.metaData?.totalSpots }}</span>
                <span v-else
                  ><BasePlaceload class="h-3 w-10 rounded-lg"
                /></span>
              </BaseHeading>
            </div>
            <div
              class="text-success-500 flex items-center gap-1 font-sans text-sm"
            >
              <span>+0.0%</span>
              <Icon name="lucide:trending-up" class="h-5 w-5" />
              <span class="text-muted-400 text-xs">en hausse</span>
            </div>
          </BaseCard>
        </div>
        <!-- Stat tile -->
        <div class="col-span-12 md:col-span-3">
          <BaseCard class="p-4">
            <div class="mb-1 flex items-center justify-between">
              <BaseHeading
                as="h5"
                size="sm"
                weight="medium"
                lead="tight"
                class="text-muted-700 dark:text-muted-400"
              >
                <span>Fourisseurs</span>
              </BaseHeading>
              <BaseIconBox
                size="xs"
                class="bg-primary-100 text-primary-500 dark:bg-primary-500/20 dark:text-primary-400 dark:border-primary-500 dark:border-2"
                shape="full"
              >
                <Icon name="ph:user" class="h-5 w-5" />
              </BaseIconBox>
            </div>
            <div class="mb-2">
              <BaseHeading
                as="h4"
                size="2xl"
                weight="bold"
                lead="tight"
                class="text-muted-800 dark:text-white"
              >
                <span v-if="!pending">{{ data?.metaData?.totalFiles }}</span>
                <span v-else
                  ><BasePlaceload class="h-3 w-10 rounded-lg"
                /></span>
              </BaseHeading>
            </div>
            <div
              class="text-success-500 flex items-center gap-1 font-sans text-sm"
            >
              <span>+0.0%</span>
              <Icon name="lucide:trending-up" class="h-5 w-5" />
              <span class="text-muted-400 text-xs">en hausse</span>
            </div>
          </BaseCard>
        </div>
      </div>
      <div id="print-sales-report" class="mx-1">
        <div
          v-if="isPrint"
          class="flex justify-between items-center border-b-2 py-1"
        >
          <div shape="straight" class="">
            <img
              v-if="currentOrg?.logo?.includes('r2')"
              class="h-16 pb-1 fit-content"
              :src="currentOrg.logo"
            />
            <img v-else class="h-32 max fit-content" :src="currentOrg.logo" />
          </div>
          <div class="flex justify-end">
            <div>
              <h5
                class="font-heading text-right text-muted-900 text-xs font-medium leading-6 dark:text-white"
              >
                {{ currentOrg?.name ?? '' }}
              </h5>
              <h5
                class="font-heading text-right text-muted-900 text-xs font-medium leading-6 dark:text-white"
              >
                {{ currentOrg?.email ?? '' }}
              </h5>
              <h5
                class="font-heading text-right text-muted-900 text-xs font-medium leading-6 dark:text-white"
              >
                {{ currentOrg?.address ?? '' }}
              </h5>
            </div>
          </div>
        </div>
        <div v-if="isPrint" shape="straight" class="border border-t-1"></div>
        <h4
          v-if="isPrint"
          class="font-heading text-muted-900 text-xs font-medium pb-2 pt-1 px-2 leading-6 dark:text-white"
        >
          Etat des ventes du
          {{ new Date(startDate).toLocaleDateString('fr-FR') }} au
          {{ new Date(endDate).toLocaleDateString('fr-FR') }} Pour la ville de
          {{ currentTeam ? currentTeam.toUpperCase() : 'Douala et Yaounde' }} de
          la société
          {{ currentOrg?.name ?? '' }}
        </h4>
        <h5
          v-if="isPrint"
          class="font-heading text-muted-900 text-xs font-medium leading-6 py-1 px-2 dark:text-white"
        >
          Fait par {{ authStore.user.firstName }} {{ authStore.user.lastName }}
        </h5>
        <div>
          <div v-if="!pending && data?.data.length === 0">
            <BasePlaceholderPage
              title="No matching results"
              subtitle="Looks like we couldn't find any matching results for your search terms. Try other search terms."
            >
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
          </div>
          <div v-else-if="pending">
            <TairoTableRow v-for="index in 5" :key="index">
              <TairoTableCell spaced>
                <div class="flex items-center">
                  <BaseCheckbox
                    v-model="fakeItems"
                    :value="`placeload-item-checkbox-${index}`"
                    rounded="full"
                    color="primary"
                  />
                </div>
              </TairoTableCell>
              <TairoTableCell spaced>
                <BasePlaceload class="h-3 w-24 rounded-lg" />
              </TairoTableCell>
              <TairoTableCell spaced>
                <div class="flex items-center gap-2">
                  <BasePlaceload class="size-8 shrink-0 rounded-full" />
                  <div class="space-y-1">
                    <BasePlaceload class="h-2 w-[70px] rounded-lg" />
                    <BasePlaceload class="h-2 w-[50px] rounded-lg" />
                  </div>
                </div>
              </TairoTableCell>
              <TairoTableCell light spaced>
                <BasePlaceload class="h-3 w-12 rounded-lg" />
              </TairoTableCell>
              <TairoTableCell light spaced>
                <BasePlaceload class="h-3 w-12 rounded-lg" />
              </TairoTableCell>
              <TairoTableCell light spaced>
                <BasePlaceload class="h-3 w-12 rounded-lg" />
              </TairoTableCell>
              <TairoTableCell light spaced>
                <BasePlaceload class="h-3 w-12 rounded-lg" />
              </TairoTableCell>
              <TairoTableCell light spaced>
                <BasePlaceload class="h-3 w-12 rounded-lg" />
              </TairoTableCell>
              <TairoTableCell light spaced>
                <BasePlaceload class="h-3 w-12 rounded-lg" />
              </TairoTableCell>
              <TairoTableCell light spaced>
                <BasePlaceload class="h-3 w-12 rounded-lg" />
              </TairoTableCell>
              <TairoTableCell spaced>
                <BasePlaceload class="h-8 w-16 rounded-lg" />
              </TairoTableCell>
            </TairoTableRow>
          </div>
          <div v-else>
            <div class="w-full">
              <TairoTable shape="rounded">
                <template #header>
                  <TairoTableHeading
                    v-if="!isPrint"
                    uppercase
                    spaced
                    class="p-4"
                  >
                    <div class="flex items-center">
                      <BaseCheckbox
                        :model-value="isAllVisibleSelected"
                        :indeterminate="
                          selected.length > 0 && !isAllVisibleSelected
                        "
                        name="table-1-main"
                        shape="rounded"
                        class="text-primary-500"
                        @click="toggleAllVisibleSelection"
                      />
                    </div>
                  </TairoTableHeading>
                  <TairoTableHeading
                    :class="!isPrint ? '!text-xs' : ''"
                    uppercase
                    spaced
                    >Numéro de facture</TairoTableHeading
                  >
                  <TairoTableHeading
                    :class="isPrint ? '!text-xs' : ''"
                    uppercase
                    spaced
                  >
                    Fournisseur
                  </TairoTableHeading>
                  <TairoTableHeading uppercase spaced>
                    Date facturation
                  </TairoTableHeading>
                  <TairoTableHeading v-if="!isPrint" uppercase spaced>
                    Societé
                  </TairoTableHeading>

                  <TairoTableHeading uppercase spaced>
                    Total HT
                  </TairoTableHeading>
                  <TairoTableHeading v-if="false" uppercase spaced>
                    TVA
                  </TairoTableHeading>
                  <TairoTableHeading v-if="false" uppercase spaced>
                    TSP
                  </TairoTableHeading>
                  <TairoTableHeading uppercase spaced>
                    Total TTC
                  </TairoTableHeading>
                  <TairoTableHeading uppercase spaced>
                    Montant payé
                  </TairoTableHeading>
                  <TairoTableHeading uppercase spaced
                    >Montant Dû
                  </TairoTableHeading>
                  <TairoTableHeading v-if="!isPrint" uppercase spaced>
                    Vendeur
                  </TairoTableHeading>
                  <TairoTableHeading v-if="!isPrint" uppercase spaced
                    >Docs</TairoTableHeading
                  >
                  <TairoTableHeading v-if="!isPrint" uppercase spaced
                    >Statut</TairoTableHeading
                  >
                  <TairoTableHeading v-if="!isPrint" uppercase spaced
                    >Action</TairoTableHeading
                  >
                </template>

                <TairoTableRow v-if="selected.length > 0" :hoverable="false">
                  <TairoTableCell colspan="3" class="p-4">
                    <BaseButtonAction
                      v-if="selected.length == 1"
                      @click="isModalCopyInvoiceOpen = true"
                      class="mx-2"
                    >
                      <Icon
                        name="lucide:copy"
                        class="h-4 w-4 mr-2 text-orange-500"
                      />
                      Dupliquer</BaseButtonAction
                    >
                    <BaseButtonAction
                      v-if="selected.length == 1"
                      @click="isModalDoitInvoiceOpen = true"
                      class="mx-2"
                    >
                      <Icon
                        name="lucide:file"
                        class="h-4 w-4 mr-2 text-orange-500"
                      />
                      Transformer en facture d'avoir</BaseButtonAction
                    >
                  </TairoTableCell>
                  <TairoTableCell
                    colspan="4"
                    class="bg-success-100 text-success-700 dark:bg-success-700 dark:text-success-100 p-4"
                  >
                    You have selected {{ selected.length }} items of the total
                    {{ data?.total }} items.
                    <a
                      href="#"
                      class="outline-none hover:underline focus:underline"
                      >Click here to everything</a
                    >
                  </TairoTableCell>
                </TairoTableRow>

                <TairoTableRow v-for="item in data?.data" :key="item._id">
                  <TairoTableCell v-if="!isPrint" spaced>
                    <div class="flex items-center">
                      <BaseCheckbox
                        v-model="selected"
                        :value="item._id"
                        :name="`item-checkbox-${item._id}`"
                        shape="rounded"
                        class="text-primary-500"
                        @click="updateCurrentInvoice(item)"
                      />
                    </div>
                  </TairoTableCell>
                  <TairoTableCell light spaced>
                    <NuxtLink
                      class="text-primary-500 underline-offset-4 hover:underline"
                      :to="'/bo/purchases/orders/view-invoice-' + item._id"
                    >
                      {{ item.code }}
                    </NuxtLink>
                  </TairoTableCell>
                  <TairoTableCell>
                    <div
                      style="white-space: pre-wrap; word-wrap: break-word"
                      class="flex items-center"
                    >
                      <BaseAvatar
                        v-if="!isPrint"
                        :src="item.supplier?.logo ?? '/img/avatars/company.svg'"
                        :text="item.initials"
                        :class="getRandomColor()"
                      />
                      <div class="!w-48 ms-3">
                        <p class="font-sans text-xs font-medium">
                          {{ item.supplier?.name }}
                        </p>
                        <p
                          v-if="!isPrint"
                          class="text-muted-400 font-sans text-xs"
                        >
                          {{ item.supplier?.code }}
                        </p>
                      </div>
                    </div>
                  </TairoTableCell>
                  <TairoTableCell light spaced>
                    {{ new Date(item.date).toLocaleDateString('fr-FR') }}
                  </TairoTableCell>
                  <TairoTableCell v-if="!isPrint" light spaced>
                    {{ item.org.name }}
                  </TairoTableCell>

                  <TairoTableCell light spaced>
                    {{
                      new Intl.NumberFormat().format(
                        Math.ceil(item.amountHT ?? 0),
                      )
                    }}
                    XAF
                  </TairoTableCell>
                  <TairoTableCell v-if="false" light spaced>
                    {{
                      new Intl.NumberFormat().format(Math.ceil(item.tva ?? 0))
                    }}
                    XAF
                  </TairoTableCell>
                  <TairoTableCell v-if="false" light spaced>
                    {{
                      new Intl.NumberFormat().format(Math.ceil(item.tsp ?? 0))
                    }}
                    XAF
                  </TairoTableCell>
                  <TairoTableCell light spaced>
                    {{
                      new Intl.NumberFormat().format(
                        Math.ceil(item.amount ?? 0),
                      )
                    }}
                    XAF
                  </TairoTableCell>
                  <TairoTableCell light spaced>
                    {{
                      new Intl.NumberFormat().format(Math.ceil(item.paid ?? 0))
                    }}
                    XAF
                  </TairoTableCell>
                  <TairoTableCell light spaced>
                    <span v-if="item.taxes.length > 0">(ANR) 0</span>
                    <span v-else>
                      {{
                        new Intl.NumberFormat().format(
                          Math.ceil(item.amount - item.paid ?? 0) > 0
                            ? Math.ceil(item.amount - item.paid ?? 0)
                            : 0,
                        )
                      }}</span
                    >

                    XAF
                  </TairoTableCell>
                  <TairoTableCell v-if="!isPrint" light spaced>
                    {{ item.manager?.lastName }}
                    {{ item.manager?.firstName }}
                  </TairoTableCell>
                  <TairoTableCell v-if="!isPrint" light spaced>
                    <a
                      v-if="item.contractUrl"
                      class="mx-1 text-white bg-muted-600 p-2 rounded"
                      :href="'/' + item.order.contractUrl"
                      target="_blank"
                      >C</a
                    >
                  </TairoTableCell>
                  <TairoTableCell v-if="!isPrint" spaced class="capitalize">
                    <BaseTag
                      v-if="item.validator"
                      color="success"
                      flavor="pastel"
                      shape="full"
                      condensed
                      class="font-medium"
                    >
                      Confirmée
                    </BaseTag>
                    <BaseTag
                      v-else
                      color="warning"
                      flavor="pastel"
                      shape="full"
                      condensed
                      class="font-medium"
                    >
                      Brouillon
                    </BaseTag>
                  </TairoTableCell>
                  <TairoTableCell v-if="!isPrint" spaced>
                    <div class="flex">
                      <BaseButtonAction
                        class="mx-2"
                        :to="'/bo/purchases/orders/view-invoice-' + item._id"
                        muted
                      >
                        <Icon name="lucide:eye" class="h-4 w-4"
                      /></BaseButtonAction>
                      <BaseButtonAction
                        :to="'/bo/purchases/orders/edit-invoice-' + item._id"
                      >
                        <Icon name="lucide:edit" class="h-4 w-4"
                      /></BaseButtonAction>
                      <BaseButtonAction
                        @click="confirmDeletePackage(item)"
                        class="mx-2"
                        :disabled="
                          authStore.user.appRole?.name !=
                            UserRole.accountancy &&
                          authStore.user.appRole?.name != UserRole.superAdmin
                        "
                      >
                        <Icon name="lucide:trash" class="h-4 w-4 text-red-500"
                      /></BaseButtonAction>
                    </div>
                  </TairoTableCell>
                </TairoTableRow>
                <TairoTableRow class="border !border-t-2" v-if="isPrint">
                  <TairoTableCell v-if="!isPrint" spaced> </TairoTableCell>
                  <TairoTableCell light spaced> </TairoTableCell>
                  <TairoTableCell spaced> </TairoTableCell>
                  <TairoTableCell light spaced> Total: </TairoTableCell>

                  <TairoTableCell light spaced>
                    {{
                      new Intl.NumberFormat().format(
                        Math.ceil(
                          data.data
                            .map((item) => item.amountHT)
                            .reduce((accumulator, currentValue) => {
                              return accumulator + currentValue
                            }, 0) ?? 0,
                        ),
                      )
                    }}
                    XAF
                  </TairoTableCell>
                  <TairoTableCell v-if="false" light spaced>
                    {{
                      new Intl.NumberFormat().format(
                        Math.ceil(
                          data.data
                            .map((item) => item.tva)
                            .reduce((accumulator, currentValue) => {
                              return accumulator + currentValue
                            }, 0) ?? 0,
                        ),
                      )
                    }}
                    XAF
                  </TairoTableCell>
                  <TairoTableCell v-if="false" light spaced>
                    {{
                      new Intl.NumberFormat().format(
                        Math.ceil(
                          data.data
                            .map((item) => item.tsp)
                            .reduce((accumulator, currentValue) => {
                              return accumulator + currentValue
                            }, 0) ?? 0,
                        ),
                      )
                    }}
                    XAF
                  </TairoTableCell>
                  <TairoTableCell light spaced>
                    {{
                      new Intl.NumberFormat().format(
                        Math.ceil(
                          data.data
                            .map((item) => item.amount)
                            .reduce((accumulator, currentValue) => {
                              return accumulator + currentValue
                            }, 0) ?? 0,
                        ),
                      )
                    }}
                    XAF
                  </TairoTableCell>
                  <TairoTableCell light spaced>
                    {{
                      new Intl.NumberFormat().format(
                        Math.ceil(
                          data.data
                            .map((item) => item.paid)
                            .reduce((accumulator, currentValue) => {
                              return accumulator + currentValue
                            }, 0) ?? 0,
                        ),
                      )
                    }}
                    XAF
                  </TairoTableCell>
                  <TairoTableCell light spaced>
                    {{
                      new Intl.NumberFormat().format(
                        Math.ceil(
                          data.data
                            .map((item) => item.amount - item.paid ?? 0)
                            .reduce((accumulator, currentValue) => {
                              return accumulator + currentValue
                            }, 0) ?? 0,
                        ),
                      )
                    }}
                    XAF
                  </TairoTableCell>
                  <TairoTableCell v-if="!isPrint" light spaced>
                  </TairoTableCell>
                  <TairoTableCell v-if="!isPrint" light spaced>
                  </TairoTableCell>
                  <TairoTableCell v-if="!isPrint" spaced> </TairoTableCell>
                </TairoTableRow>
              </TairoTable>
            </div>
            <div v-if="!isPrint" class="mt-6">
              <BasePagination
                :total-items="data?.total ?? 0"
                :item-per-page="perPage"
                :current-page="page"
                shape="curved"
              />
            </div>
          </div>
        </div>
      </div>
    </TairoContentWrapper>

    <!-- Modal import new report -->
    <TairoModal
      :open="isModalSalesReportOpen"
      size="xl"
      @close="isModalSalesReportOpen = false"
    >
      <template #header>
        <!-- Header -->
        <div class="flex w-full items-center justify-between p-4 md:p-6">
          <h3
            class="font-heading text-muted-900 text-lg font-medium leading-6 dark:text-white"
          >
            Rapport des ventes
          </h3>

          <BaseButtonClose @click="isModalSalesReportOpen = false" />
        </div>
      </template>

      <!-- Body -->
      <BaseCard class="w-full">
        <form
          method="POST"
          action=""
          class="divide-muted-200 dark:divide-muted-700"
        >
          <div
            shape="curved"
            class="bg-muted-50 dark:bg-muted-800/60 space-y-8 p-5 md:px-5"
          >
            <div class="mx-auto flex w-full flex-col">
              <div>
                <div v-if="!pendingOrg" class="col-span-12 sm:col-span-6 mt-2">
                  <Field
                    v-slot="{ field, errorMessage, handleChange, handleBlur }"
                    name="report.org"
                  >
                    <BaseListbox
                      :disabled="pendingOrg"
                      label="Société"
                      :items="orgs.data"
                      :classes="{
                        wrapper: '!w-60',
                      }"
                      :properties="{
                        value: '_id',
                        label: 'name',
                        sublabel: 'email',
                        media: '',
                      }"
                      v-model="currentOrg"
                      :error="errorMessage"
                      @update:model-value="handleChange"
                      @blur="handleBlur"
                    />
                  </Field>
                </div>
                <div class="col-span-12 md:col-span-6 py-5">
                  <Field
                    v-slot="{ field, errorMessage, handleChange, handleBlur }"
                    name="report.team"
                  >
                    <BaseSelect
                      label="Equipe"
                      icon="ph:funnel"
                      v-model="currentTeam"
                      :error="errorMessage"
                      @update:model-value="handleChange"
                      @blur="handleBlur"
                    >
                      <option value="douala">Douala</option>
                      <option value="yaounde">Yaoundé</option>
                    </BaseSelect>
                  </Field>
                </div>
                <div class="flex justify-between pt-5">
                  <div class="col-span-12 md:col-span-6 mt-2">
                    <label for="start">Date debut: </label>
                    <input
                      type="date"
                      id="start"
                      name="report-start"
                      v-model="startDate"
                    />
                  </div>
                  <div class="col-span-12 md:col-span-6 mt-2">
                    <label for="start">Date de fin: </label>
                    <input
                      type="date"
                      id="end"
                      name="report-start"
                      v-model="endDate"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </form>
      </BaseCard>
      <template #footer>
        <!-- Footer -->
        <div class="p-4 md:p-6">
          <div class="flex gap-x-2">
            <BaseButton @click="isModalSalesReportOpen = false"
              >Annuler</BaseButton
            >

            <BaseButton
              color="primary"
              flavor="solid"
              @click="printSalesReport()"
            >
              Imprimer
            </BaseButton>
          </div>
        </div>
      </template>
    </TairoModal>

    <!-- Modal delete -->
    <TairoModal
      :open="isModalDeletePackageOpen"
      size="sm"
      @close="isModalDeletePackageOpen = false"
    >
      <template #header>
        <!-- Header -->
        <div class="flex w-full items-center justify-between p-4 md:p-6">
          <h3
            class="font-heading text-muted-900 text-lg font-medium leading-6 dark:text-white"
          >
            Suppression d'une facture
          </h3>

          <BaseButtonClose @click="isModalDeletePackageOpen = false" />
        </div>
      </template>

      <!-- Body -->
      <div class="p-4 md:p-6">
        <div class="mx-auto w-full max-w-xs text-center">
          <h3
            class="font-heading text-muted-800 text-lg font-medium leading-6 dark:text-white"
          >
            Supprimer
            <span class="text-red-500">{{ currentPackage?.label }}</span> ?
          </h3>

          <p
            class="font-alt text-muted-700 dark:text-muted-400 text-sm leading-5"
          >
            Cette action est irreversible
          </p>
        </div>
      </div>

      <template #footer>
        <!-- Footer -->
        <div class="p-4 md:p-6">
          <div class="flex gap-x-2">
            <BaseButton @click="isModalDeletePackageOpen = false"
              >Annuler</BaseButton
            >

            <BaseButton
              color="primary"
              flavor="solid"
              @click="deletePackage(currentPackage)"
              >Suppimer</BaseButton
            >
          </div>
        </div>
      </template>
    </TairoModal>

    <!-- Modal Copy -->
    <TairoModal
      :open="isModalCopyInvoiceOpen"
      size="sm"
      @close="isModalCopyInvoiceOpen = false"
    >
      <template #header>
        <!-- Header -->
        <div class="flex w-full items-center justify-between p-4 md:p-6">
          <h3
            class="font-heading text-muted-900 text-lg font-medium leading-6 dark:text-white"
          >
            Copie d'une facture
          </h3>

          <BaseButtonClose @click="isModalCopyInvoiceOpen = false" />
        </div>
      </template>

      <!-- Body -->
      <div class="p-4 md:p-6">
        <div class="mx-auto w-full max-w-xs text-center">
          <h3
            class="font-heading text-muted-800 text-lg font-medium leading-6 dark:text-white"
          >
            Dupliquer la facture sélèctionnée
            <span class="text-red-500"></span> ?
          </h3>

          <p
            class="font-alt text-muted-700 dark:text-muted-400 text-sm leading-5"
          >
            Cette action est irreversible
          </p>
        </div>
      </div>

      <template #footer>
        <!-- Footer -->
        <div class="p-4 md:p-6">
          <div class="flex gap-x-2">
            <BaseButton @click="isModalCopyInvoiceOpen = false"
              >Annuler</BaseButton
            >

            <BaseButton
              color="primary"
              flavor="solid"
              @click="copyInvoice(currentPackage)"
              >Proceder</BaseButton
            >
          </div>
        </div>
      </template>
    </TairoModal>

    <!-- Modal Doit -->
    <TairoModal
      :open="isModalDoitInvoiceOpen"
      size="sm"
      @close="isModalDoitInvoiceOpen = false"
    >
      <template #header>
        <!-- Header -->
        <div class="flex w-full items-center justify-between p-4 md:p-6">
          <h3
            class="font-heading text-muted-900 text-lg font-medium leading-6 dark:text-white"
          >
            Transformation en facture d'avoir
          </h3>

          <BaseButtonClose @click="isModalDoitInvoiceOpen = false" />
        </div>
      </template>

      <!-- Body -->
      <div class="p-4 md:p-6">
        <div class="mx-auto w-full max-w-xs text-center">
          <h3
            class="font-heading text-muted-800 text-lg font-medium leading-6 dark:text-white"
          >
            Transformer cette facture en facture d'avoir
            <span class="text-red-500"></span> ?
          </h3>

          <p
            class="font-alt text-muted-700 dark:text-muted-400 text-sm leading-5"
          >
            Cette action est irreversible
          </p>
        </div>
      </div>

      <template #footer>
        <!-- Footer -->
        <div class="p-4 md:p-6">
          <div class="flex gap-x-2">
            <BaseButton @click="isModalDoitInvoiceOpen = false"
              >Annuler</BaseButton
            >

            <BaseButton
              color="primary"
              flavor="solid"
              @click="updateInvoiceIsDoit(currentPackage)"
              >Proceder</BaseButton
            >
          </div>
        </div>
      </template>
    </TairoModal>
  </div>
</template>
