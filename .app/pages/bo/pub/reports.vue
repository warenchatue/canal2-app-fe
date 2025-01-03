<script setup lang="ts">
import { DatePicker } from 'v-calendar'
import { Field } from 'vee-validate'
import { UserRole } from '~/types/user'

definePageMeta({
  title: 'Suivi des campagnes',
  preview: {
    title: 'Suivi des campagnes',
    description: 'Contribution and withdrawal',
    categories: ['bo', 'pub'],
    src: '/img/screens/layouts-table-list-1.png',
    srcDark: '/img/screens/layouts-table-list-1-dark.png',
    order: 44,
  },
})

const authStore = useAuthStore()
const route = useRoute()
const router = useRouter()
const page = computed(() => parseInt((route.query.page as string) ?? '1'))
const filter = ref('')
const perPage = ref(25)
const isModalDeletePackageOpen = ref(false)
const isPrint = ref(false)
const isActive = ref(false)

const toaster = useToaster()
// Check if can have access
if (
  authStore.user.appRole.name != UserRole.sale &&
  authStore.user.appRole?.name != UserRole.mediaPlanner &&
  authStore.user.appRole?.name != UserRole.adminSale &&
  authStore.user.appRole?.name != UserRole.accountancy &&
  authStore.user.appRole?.name != UserRole.admin &&
  authStore.user.appRole.name != UserRole.superAdmin
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

const orderContracts = ref<FileList | null>()
const orderInvoices = ref<FileList | null>()

watch(orderContracts, (value) => {
  console.log('orderContracts')
  console.log(orderContracts.value)
})

watch(orderInvoices, (value) => {
  console.log('orderInvoices')
  console.log(orderInvoices.value)
})

watch([filter, perPage, isActive], () => {
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
    isActive: isActive.value,
    page: page.value,
    action: 'findAllReport',
    token: token.value,
  }
})

const dates = ref({
  start: new Date(),
  end: new Date(),
})

const { data, pending, error, refresh } = await useFetch('/api/pub/packages', {
  query,
})

async function printCampaigns(active: boolean) {
  isPrint.value = true
  if (active) {
    const queryP = computed(() => {
      return {
        perPage: 1000,
        action: 'findAllReport',
        token: token.value,
      }
    })
    const { data: reportData } = await useFetch('/api/pub/packages', {
      query: queryP,
    })
    const today = new Date()
    data.value = reportData.value?.data?.filter(
      (el) => new Date(el.endDate) >= today,
    )
  }
  await printElement()
}

async function printElement() {
  setTimeout(() => {
    var printContents = document.getElementById('print-campaigns').innerHTML
    var originalContents = document.body.innerHTML
    document.body.innerHTML = printContents
    window.print()
    document.body.innerHTML = originalContents
    location.reload()
  }, 500)
}

async function deletePackage(spotPackage: any) {
  const query2 = computed(() => {
    return {
      action: 'delete',
      token: token.value,
      id: spotPackage._id,
    }
  })

  const response = await useFetch('/api/pub/packages', {
    method: 'delete',
    headers: { 'Content-Type': 'application/json' },
    query: query2,
  })

  if (response.data?.value?.success) {
    success.value = true
    toaster.clearAll()
    toaster.show({
      title: 'Success',
      message: `Package supprimé !`,
      color: 'success',
      icon: 'ph:check',
      closable: true,
    })
    isModalDeletePackageOpen.value = false
    filter.value = 'spotPackage'
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
  return selected.value.length === data.value?.data?.length
})

function toggleAllVisibleSelection() {
  if (isAllVisibleSelected.value) {
    selected.value = []
  } else {
    selected.value = data.value?.data.map((item) => item._id) ?? []
  }
}

const currentPackage = ref({})

const success = ref(false)
</script>

<template>
  <div>
    <TairoContentWrapper>
      <template #left>
        <div class="col-span-12 mx-2 -mt-6">
          <DatePicker
            v-model.range="dates"
            mode="date"
            hide-time-header
            trim-weeks
          >
            <template #default="{ inputValue, inputEvents }">
              <div class="flex w-full flex-col gap-4 sm:flex-row">
                <div class="relative grow">
                  <Field
                    v-slot="{ field, errorMessage, handleChange, handleBlur }"
                    name="event.startDateTime"
                  >
                    <BaseInput
                      shape="curved"
                      label="Date debut"
                      icon="ph:calendar-blank-duotone"
                      :value="inputValue.start"
                      v-on="inputEvents.start"
                      :classes="{
                        input: '!h-11 !ps-11',
                        icon: '!h-11 !w-11',
                      }"
                      :model-value="field.value"
                      :error="errorMessage"
                      :disabled="isSubmitting"
                      type="text"
                      @update:model-value="handleChange"
                      @blur="handleBlur"
                    />
                  </Field>
                </div>
                <div class="relative grow">
                  <Field
                    v-slot="{ field, errorMessage, handleChange, handleBlur }"
                    name="event.endDateTime"
                  >
                    <BaseInput
                      shape="curved"
                      label="Date fin"
                      icon="ph:calendar-blank-duotone"
                      :value="inputValue.end"
                      v-on="inputEvents.end"
                      :classes="{
                        input: '!h-11 !ps-11',
                        icon: '!h-11 !w-11',
                      }"
                      :model-value="field.value"
                      :error="errorMessage"
                      :disabled="isSubmitting"
                      type="text"
                      @update:model-value="handleChange"
                      @blur="handleBlur"
                    />
                  </Field>
                </div>
              </div>
            </template>
          </DatePicker>
        </div>

        <BaseInput
          v-model="filter"
          icon="lucide:search"
          placeholder="Filtre raport..."
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
          <option :value="250">250 per page</option>
          <option :value="500">500 per page</option>
        </BaseSelect>
        <BaseSwitchBall v-model="isActive" label="En cours" color="primary" />
        <BaseButton
          @click="printCampaigns(true)"
          color="primary"
          class="w-full sm:w-44"
        >
          <Icon name="ph:printer" class="h-6 w-6" />
          <span>Exporter</span>
        </BaseButton>
        <BaseButton color="primary" class="w-full sm:w-16">
          <span></span>
          <Icon name="ph:arrows-clockwise" class="h-6 w-6" />
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
                class="text-muted-500 dark:text-muted-400"
              >
                <span>Total Campagnes</span>
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
                <span>{{ data?.metaData?.totalItems }}</span>
              </BaseHeading>
            </div>
            <div
              class="text-success-500 flex items-center gap-1 font-sans text-sm"
            >
              <span>+0%</span>
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
                class="text-muted-500 dark:text-muted-400"
              >
                <span>Active</span>
              </BaseHeading>
              <BaseIconBox
                size="xs"
                class="bg-yellow-100 text-yellow-500 dark:border-2 dark:border-yellow-500 dark:bg-yellow-500/20 dark:text-yellow-400"
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
                <span>{{ data?.metaData?.totalActives }}</span>
              </BaseHeading>
            </div>
            <div
              class="text-danger-500 flex items-center gap-1 font-sans text-sm"
            >
              <span>-0%</span>
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
                class="text-muted-500 dark:text-muted-400"
              >
                <span>Facturés</span>
              </BaseHeading>
              <BaseIconBox
                size="xs"
                class="bg-primary-100 text-primary-500 dark:bg-primary-500/20 dark:text-primary-400 dark:border-primary-500 dark:border-2"
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
                <span>{{
                  (data?.metaData?.totalItems ?? 0) -
                  (data?.metaData?.totalNoInvoices ?? 0)
                }}</span>
              </BaseHeading>
            </div>
            <div
              class="text-success-500 flex items-center gap-1 font-sans text-sm"
            >
              <span>+0%</span>
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
                class="text-muted-500 dark:text-muted-400"
              >
                <span>Non Facturés</span>
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
                <span>{{ data?.metaData?.totalNoInvoices ?? 0 }}</span>
              </BaseHeading>
            </div>
            <div
              class="text-success-500 flex items-center gap-1 font-sans text-sm"
            >
              <span>+0%</span>
              <Icon name="lucide:trending-up" class="h-5 w-5" />
              <span class="text-muted-400 text-xs">en hausse</span>
            </div>
          </BaseCard>
        </div>
      </div>
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
        <div v-else>
          <div id="print-campaigns" class="w-full">
            <TairoTable shape="rounded">
              <template #header>
                <TairoTableHeading v-if="!isPrint" uppercase spaced class="p-4">
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
                <TairoTableHeading uppercase spaced>
                  Campagne
                </TairoTableHeading>

                <TairoTableHeading uppercase spaced
                  >Annonceur</TairoTableHeading
                >
                <TairoTableHeading uppercase spaced>Société</TairoTableHeading>

                <TairoTableHeading uppercase spaced>Nature</TairoTableHeading>

                <TairoTableHeading uppercase spaced>Durée</TairoTableHeading>
                <TairoTableHeading uppercase spaced
                  >Date Début</TairoTableHeading
                >
                <TairoTableHeading uppercase spaced>Date Fin</TairoTableHeading>
                <TairoTableHeading v-if="!isPrint" uppercase spaced
                  >Nombre de diffusion par jour</TairoTableHeading
                >
                <TairoTableHeading v-if="!isPrint" uppercase spaced
                  >Total commandés</TairoTableHeading
                >
                <TairoTableHeading v-if="!isPrint" uppercase spaced
                  >Total diffusés</TairoTableHeading
                >
                <TairoTableHeading uppercase spaced
                  >Formule d'achat</TairoTableHeading
                >
                <TairoTableHeading uppercase spaced
                  >Initiateur</TairoTableHeading
                >
                <TairoTableHeading uppercase spaced>Note</TairoTableHeading>
                <TairoTableHeading uppercase spaced
                  >Montant global
                </TairoTableHeading>
                <TairoTableHeading uppercase spaced
                  >MOntant payé
                </TairoTableHeading>
                <TairoTableHeading uppercase spaced
                  >Montant restant
                </TairoTableHeading>
                <TairoTableHeading v-if="!isPrint" uppercase spaced
                  >Statut</TairoTableHeading
                >
                <TairoTableHeading v-if="!isPrint" uppercase spaced
                  >Action</TairoTableHeading
                >
              </template>

              <TairoTableRow v-if="selected.length > 0" :hoverable="false">
                <TairoTableCell
                  colspan="6"
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
                <TairoTableCel v-if="!isPrint" spaced>
                  <div class="flex p-4 items-center">
                    <BaseCheckbox
                      v-model="selected"
                      :value="item._id"
                      :name="`item-checkbox-${item._id}`"
                      shape="rounded"
                      class="text-primary-500"
                    />
                  </div>
                </TairoTableCel>
                <TairoTableCell
                  style="white-space: pre-wrap; word-wrap: break-word"
                  light
                  spaced
                >
                  <div v-if="item.products" class="!w-44">
                    <p v-if="item.products.length > 0">
                      1- {{ item.products[0].product }}
                    </p>
                    <p v-if="item.products.length > 1">
                      2- {{ item.products[1].product }}
                    </p>
                    <p v-if="item.products.length > 2">
                      3- {{ item.products[2].product }}
                    </p>
                    <p v-if="item.products.length > 3">
                      4- {{ item.products[3].product }}
                    </p>
                    <p v-if="item.products.length > 4">
                      5- {{ item.products[4].product }}
                    </p>
                  </div>
                </TairoTableCell>
                <TairoTableCell spaced>
                  <div
                    style="white-space: pre-wrap; word-wrap: break-word"
                    class="flex items-center"
                  >
                    <div class="!w-44 ms-3 leading-none">
                      <h4 class="font-sans text-sm font-medium">
                        {{ item.announcer?.name }}
                      </h4>
                      <p class="text-muted-400 font-sans text-xs">
                        {{ item.announcer?.email }}
                      </p>
                    </div>
                  </div>
                </TairoTableCell>
                <TairoTableCell light spaced>
                  <span class="text-base"> {{ item.org?.name ?? '' }}</span>
                </TairoTableCell>
                <TairoTableCell light spaced>
                  <p v-if="item.products.length > 0">
                    1- {{ item.products[0].type }}
                  </p>
                  <p v-if="item.products.length > 1">
                    2- {{ item.products[1].type }}
                  </p>
                  <p v-if="item.products.length > 2">
                    3- {{ item.products[2].type }}
                  </p>
                  <p v-if="item.products.length > 3">
                    4- {{ item.products[3].type }}
                  </p>
                  <p v-if="item.products.length > 4">
                    5- {{ item.products[4].type }}
                  </p>
                </TairoTableCell>
                <TairoTableCell light spaced>
                  <span class="text-base">
                    {{ item.durationDays ?? 0 }} jour(s)</span
                  >
                </TairoTableCell>
                <TairoTableCell light spaced>
                  {{ item.startDate ?? '' }}
                </TairoTableCell>
                <TairoTableCell light spaced>
                  {{ item.endDate ?? '' }}
                </TairoTableCell>
                <TairoTableCell v-if="!isPrint" light spaced>
                  <span class="text-base"> {{ item.numberProducts }}</span>
                </TairoTableCell>
                <TairoTableCell v-if="!isPrint" light spaced>
                  <span class="text-base"> {{ item.quantities }}</span>
                </TairoTableCell>
                <TairoTableCell v-if="!isPrint" light spaced>
                  <span class="text-base"> {{ item.totalDiffused }}</span>
                </TairoTableCell>
                <TairoTableCell
                  style="white-space: pre-wrap; word-wrap: break-word"
                  light
                  spaced
                >
                  <span class="!w-48">{{ item.label }}</span>
                </TairoTableCell>
                <TairoTableCell light spaced>
                  {{
                    item.order?.manager?.firstName ?? item.creator?.firstName
                  }}
                  {{ item.order?.manager?.lastName ?? item.creator?.lastName }}
                </TairoTableCell>
                <TairoTableCell
                  style="white-space: pre-wrap; word-wrap: break-word"
                  light
                  spaced
                >
                  {{ item.description }}
                </TairoTableCell>
                <TairoTableCell light spaced>
                  {{
                    new Intl.NumberFormat().format(item.invoice?.amount ?? 0)
                  }}
                  XAF
                </TairoTableCell>
                <TairoTableCell light spaced>
                  {{ new Intl.NumberFormat().format(item.invoice?.paid ?? 0) }}
                  XAF
                </TairoTableCell>
                <TairoTableCell light spaced>
                  {{
                    new Intl.NumberFormat().format(
                      (item.invoice?.amount ?? 0) - (item.invoice?.paid ?? 0),
                    )
                  }}
                  XAF
                </TairoTableCell>
                <TairoTableCell v-if="!isPrint" spaced class="capitalize">
                  <BaseTag
                    v-if="item.status === 'closed'"
                    color="muted"
                    flavor="pastel"
                    shape="full"
                    condensed
                    class="font-medium"
                  >
                    Cloturée
                  </BaseTag>
                  <BaseTag
                    v-else-if="
                      item.status === 'onHold' ||
                      item.status === 'confirmed' ||
                      item.status == 'paid'
                    "
                    color="warning"
                    flavor="pastel"
                    shape="full"
                    condensed
                    class="font-medium"
                  >
                    En cours
                  </BaseTag>
                </TairoTableCell>
                <TairoTableCell v-if="!isPrint" spaced>
                  <div class="flex">
                    <BaseButtonAction
                      class="mx-2"
                      :to="'/bo/pub/package-details/' + item._id"
                      muted
                    >
                      <Icon name="lucide:settings" class="h-4 w-4"
                    /></BaseButtonAction>
                  </div>
                </TairoTableCell>
              </TairoTableRow>
            </TairoTable>
          </div>
          <div class="mt-6">
            <BasePagination
              :total-items="data?.total ?? 0"
              :item-per-page="perPage"
              :current-page="page"
              shape="curved"
            />
          </div>
        </div>
      </div>
    </TairoContentWrapper>

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
            Suppression d'un package
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
            class="font-alt text-muted-500 dark:text-muted-400 text-sm leading-5"
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
  </div>
</template>
