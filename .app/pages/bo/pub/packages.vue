<script setup lang="ts">
import { toTypedSchema } from '@vee-validate/zod'
import { Field, useForm } from 'vee-validate'
import 'vue-select/dist/vue-select.css'
import { z } from 'zod'
import { UserRole } from '~/types/user'

definePageMeta({
  title: 'Campagnes Publicitaires',
  preview: {
    title: 'Campagnes Publicitaires',
    description: 'Contribution and withdrawal',
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
const isModalNewPackageOpen = ref(false)
const isModalDeletePackageOpen = ref(false)
const isModalSyncCampaignOpen = ref(false)
const isModalConfirmOrderOpen = ref(false)
const isEdit = ref(false)
const toaster = useToaster()
// Check if can have access
if (
  authStore.user.appRole.name != UserRole.sale &&
  authStore.user.appRole.name != UserRole.mediaPlanner &&
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

const inputOrderContracts = ref<FileList | null>()
const orderContractFile = ref<File | null>(null)
const inputOrderInvoices = ref<FileList | null>()
const orderInvoiceFile = ref<File | null>(null)
watch(inputOrderContracts, (value) => {
  console.log('orderContract')
  const file = value?.item(0) || null
  orderContractFile.value = file
})

watch(inputOrderInvoices, (value) => {
  console.log('orderInvoice')
  const file = value?.item(0) || null
  orderInvoiceFile.value = file
})

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
const query2 = computed(() => {
  return {
    perPage: 1000,
    page: page.value,
    action: 'findAll',
    token: token.value,
  }
})
const query3 = computed(() => {
  return {
    perPage: 50,
    page: page.value,
    action: 'findAll',
    token: token.value,
  }
})

const { data, pending, refresh } = await useFetch('/api/pub/packages', {
  query,
  lazy: true,
})

const { data: allInvoices, pending: pendingInvoices } = await useFetch(
  '/api/sales/invoices',
  {
    query: query2,
    lazy: false,
    transform: (els) => {
      return els.data?.map((el) => ({
        name: el.code,
        id: el._id,
        text: new Date(el.createdAt).toLocaleDateString(),
      }))
    },
  },
)

const { data: orgs } = await useFetch('/api/admin/orgs', {
  query: query3,
})

const { data: allUsers } = await useFetch('/api/users', {
  query: query3,
})
const adminsUser = allUsers.value?.data.filter((e: any) => {
  return (
    e.appRole?.name == UserRole.admin || e.appRole?.name == UserRole.superAdmin
  )
})
function editPackage(campaign: any) {
  isModalNewPackageOpen.value = true
  isEdit.value = true
  currentPackage.value = campaign
  setFieldValue('campaign._id', campaign._id)
  setFieldValue('campaign.label', campaign.label)
  setFieldValue('campaign.code', campaign.code)
  setFieldValue('campaign.description', campaign.description)
  setFieldValue('campaign.numberProducts', campaign.numberProducts)
  setFieldValue('campaign.quantities', campaign.quantities)
  setFieldValue('campaign.period', campaign.period)
  setFieldValue('campaign.org', campaign.org)
  setFieldValue('campaign.adminValidator', campaign.adminValidator)
  setFieldValue('campaign.announcer', {
    id: campaign.announcer._id,
    name: campaign.announcer.name,
    text: campaign.announcer.phone,
  })
  setFieldValue('campaign.invoice', {
    id: campaign.invoice._id,
    name: campaign.invoice.code,
    text: campaign.invoice.createdAt,
  })
}

function confirmDeletePackage(campaign: any) {
  isModalDeletePackageOpen.value = true
  isEdit.value = false
  currentPackage.value = campaign
}

function confirmSyncCampaign(campaign: any) {
  isModalSyncCampaignOpen.value = true
  isEdit.value = false
  currentPackage.value = campaign
}

async function filterAnnouncersItems(query?: string, items?: any[]) {
  if (query.length < 3) {
    return []
  }

  if (!query || !items) {
    return items ?? []
  }

  const queryLightByName = computed(() => {
    return {
      filter: filter.value,
      perPage: 10000,
      page: page.value,
      action: 'findAllLightByName',
      name: query,
      token: token.value,
    }
  })

  const { data: announcersData } = await useFetch('/api/sales/announcers', {
    query: queryLightByName,
  })

  // search by name
  return announcersData.value?.data ?? false
}

function filterItems(query?: string, items?: any[]) {
  if (query.length < 3) {
    return []
  }

  if (!query || !items) {
    return items ?? []
  }

  // search by name or text
  return items.filter((item) => {
    const nameMatches = item?.name?.toLowerCase().includes(query.toLowerCase())
    // const textMatches = item?.text?.toLowerCase().includes(query.toLowerCase())
    return nameMatches
  })
}

async function deletePackage(campaign: any) {
  const query2 = computed(() => {
    return {
      action: 'delete',
      token: token.value,
      id: campaign._id,
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
      message: `Campagne supprimé !`,
      color: 'success',
      icon: 'ph:check',
      closable: true,
    })
    isModalDeletePackageOpen.value = false
    filter.value = 'campaign'
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

async function syncCampaign(campaign: any) {
  const query2 = computed(() => {
    return {
      action: 'sync',
      token: token.value,
      id: campaign._id,
    }
  })

  const response = await $fetch(
    '/api/pub/packages?action=sync&token=' +
      token.value +
      '&id=' +
      campaign._id,
    {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
    },
  )

  if (response.success) {
    success.value = true
    toaster.clearAll()
    toaster.show({
      title: 'Success',
      message: `${response.data} plannings synchronisés !`,
      color: 'success',
      icon: 'ph:check',
      closable: true,
    })
    isModalSyncCampaignOpen.value = false
    filter.value = 'campaign'
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

const currentPackage = ref({})

// This is the object that will contain the validation messages
const VALIDATION_TEXT = {
  LABEL_REQUIRED: "Label can't be empty",
  PHONE_REQUIRED: "Phone number can't be empty",
  EMAIL_REQUIRED: "Email address can't be empty",
  COUNTRY_REQUIRED: 'Please select a country',
}

// This is the Zod schema for the form input
// It's used to define the shape that the form data will have
const zodSchema = z
  .object({
    campaign: z.object({
      _id: z.string().optional(),
      code: z.string().optional(),
      label: z.string().optional(),
      description: z.string().optional(),
      numberProducts: z.number().optional(),
      quantities: z.number().optional(),
      status: z
        .union([
          z.literal('onHold'),
          z.literal('confirmed'),
          z.literal('paid'),
          z.literal('closed'),
        ])
        .optional(),
      announcer: z
        .object({
          id: z.string(),
          name: z.string(),
          phone: z.string().optional(),
          email: z.string().optional(),
        })
        .optional()
        .nullable(),
      org: z
        .object({
          _id: z.string(),
          name: z.string(),
          email: z.string().optional(),
        })
        .optional()
        .nullable(),
      adminValidator: z
        .object({
          _id: z.string(),
          lastName: z.string(),
          email: z.string(),
        })
        .optional()
        .nullable(),
      order: z
        .object({
          id: z.string(),
          name: z.string(),
        })
        .optional()
        .nullable(),
      invoice: z
        .object({
          id: z.string(),
          name: z.string(),
          text: z.string(),
        })
        .optional()
        .nullable(),
      period: z.string(),
    }),
  })
  .superRefine((data, ctx) => {
    if (!data.campaign.label) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: VALIDATION_TEXT.LABEL_REQUIRED,
        path: ['campaign.label'],
      })
    }
  })

// Zod has a great infer method that will
// infer the shape of the schema into a TypeScript type
type FormInput = z.infer<typeof zodSchema>

const validationSchema = toTypedSchema(zodSchema)
const initialValues = computed<FormInput>(() => ({
  avatar: null,
  campaign: {
    label: '',
    code: '',
    description: '',
    quantities: 0,
    numberProducts: 0,
    period: '',
    status: 'onHold',
  },
}))

const { handleSubmit, isSubmitting, resetForm, setFieldValue } = useForm({
  validationSchema,
  initialValues,
})

const success = ref(false)

async function confirmOrder() {
  const query4 = computed(() => {
    return {
      action: 'updatePackage',
      token: token.value,
      id: currentPackage.value._id,
    }
  })
  currentPackage.value.adminValidated = true

  const response = await useFetch('/api/pub/packages', {
    method: 'put',
    headers: { 'Content-Type': 'application/json' },
    query: query4,
    body: { ...currentPackage.value },
  })

  if (response.data?.value?.success) {
    success.value = true
    toaster.clearAll()
    toaster.show({
      title: 'Success',
      message: `Campagne validée !`,
      color: 'success',
      icon: 'ph:check',
      closable: true,
    })
    isModalConfirmOrderOpen.value = false
    filter.value = 'order'
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

// This is where you would send the form data to the server
const onSubmit = handleSubmit(
  async (values) => {
    success.value = false

    // here you have access to the validated form values
    console.log('package-create-success', values)

    try {
      const isSuccess = ref(false)

      if (isEdit.value == true) {
        const query2 = computed(() => {
          return {
            action: 'updatePackage',
            token: token.value,
            id: values.campaign._id,
          }
        })

        const response = await useFetch('/api/pub/packages', {
          method: 'put',
          headers: { 'Content-Type': 'application/json' },
          query: query2,
          body: {
            ...values.campaign,
            announcer: values.campaign?.announcer?.id ?? undefined,
            order: values.campaign?.order?.id ?? undefined,
            invoice: values.campaign?.invoice?.id ?? undefined,
            adminValidator: values.campaign?.adminValidator?._id ?? undefined,
          },
        })
        isSuccess.value = response.data.value?.success
      } else {
        const query2 = computed(() => {
          return {
            action: 'createPackage',
            token: token.value,
          }
        })

        const response = await useFetch('/api/pub/packages', {
          method: 'post',
          headers: { 'Content-Type': 'application/json' },
          query: query2,
          body: {
            ...values.campaign,
            announcer: values.campaign?.announcer?.id ?? undefined,
            order: values.campaign?.order?.id ?? undefined,
            invoice: values.campaign?.invoice?.id ?? undefined,
            adminValidator: values.campaign?.adminValidator?._id ?? undefined,
            _id: undefined,
          },
        })
        isSuccess.value = response.data.value?.success
      }
      if (isSuccess) {
        success.value = true
        toaster.clearAll()
        toaster.show({
          title: 'Success',
          message:
            isEdit.value == false ? `Campagne crée !` : `Campagne mise à jour`,
          color: 'success',
          icon: 'ph:check',
          closable: true,
        })
        isModalNewPackageOpen.value = false
        resetForm()
        filter.value = 'campaign'
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
    } catch (error: any) {
      console.log(error)
      document.documentElement.scrollTo({
        top: 0,
        behavior: 'smooth',
      })
      toaster.clearAll()
      toaster.show({
        title: 'Désolé!',
        message: 'Veuillez examiner les erreurs dans le formulaire',
        color: 'danger',
        icon: 'lucide:alert-triangle',
        closable: true,
      })
      // return
    }

    success.value = true
  },
  (error) => {
    // this callback is optional and called only if the form has errors
    success.value = false

    // here you have access to the error
    console.log('package-create-error', error)

    // you can use it to scroll to the first error
    document.documentElement.scrollTo({
      top: 0,
      behavior: 'smooth',
    })
  },
)
</script>

<template>
  <div>
    <TairoContentWrapper>
      <template #left>
        <BaseInput
          v-model="filter"
          icon="lucide:search"
          placeholder="Filtrer package..."
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
        <BaseButton
          color="primary"
          class="w-full sm:w-52"
          @click=";(isModalNewPackageOpen = true), (isEdit = false)"
        >
          <Icon name="ph:plus" class="h-4 w-4" />
          <span>Nouvelle campagne</span>
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
                class="text-muted-500 dark:text-muted-400"
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
                <span v-if="!pending">{{ data?.stats?.totalItems }}</span>
                <span v-else
                  ><BasePlaceload class="h-3 w-10 rounded-lg"
                /></span>
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
                <span>Annonceurs</span>
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
                <span v-if="!pending">{{ data?.stats?.totalAnnouncers }}</span>
                <span v-else
                  ><BasePlaceload class="h-3 w-10 rounded-lg"
                /></span>
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
                <span>Spots</span>
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
                <span v-if="!pending">{{ data?.stats?.totalSpots }}</span>
                <span v-else
                  ><BasePlaceload class="h-3 w-10 rounded-lg"
                /></span>
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
                <span>Produits</span>
              </BaseHeading>
              <BaseIconBox
                size="xs"
                class="bg-primary-100 text-primary-500 dark:bg-primary-500/20 dark:text-primary-400 dark:border-primary-500 dark:border-2"
                shape="full"
              >
                <Icon name="ph:file" class="h-5 w-5" />
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
                <span v-if="!pending">{{ data?.stats?.totalFiles }}</span>
                <span v-else
                  ><BasePlaceload class="h-3 w-10 rounded-lg"
                /></span>
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
        <div v-else-if="pending">
          <TairoTableRow v-for="index in 5" :key="index">
            <TairoTableCell class="!w-full" spaced>
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
                <TairoTableHeading uppercase spaced class="p-4">
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
                <TairoTableHeading uppercase spaced>Code</TairoTableHeading>
                <TairoTableHeading uppercase spaced>Date</TairoTableHeading>
                <TairoTableHeading uppercase spaced>
                  Annonceur
                </TairoTableHeading>

                <TairoTableHeading uppercase spaced>Nom</TairoTableHeading>
                <TairoTableHeading uppercase spaced>Société</TairoTableHeading>

                <TairoTableHeading uppercase spaced
                  >Commandés</TairoTableHeading
                >

                <TairoTableHeading uppercase spaced>Produits</TairoTableHeading>

                <TairoTableHeading uppercase spaced>Période</TairoTableHeading>
                <!-- <TairoTableHeading uppercase spaced>Docs</TairoTableHeading> -->
                <TairoTableHeading uppercase spaced>Statut</TairoTableHeading>
                <TairoTableHeading uppercase spaced>Action</TairoTableHeading>
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

              <TairoTableRow v-for="item in data?.data" :key="item.id">
                <TairoTableCell spaced>
                  <div class="flex items-center">
                    <BaseCheckbox
                      v-model="selected"
                      :value="item._id"
                      :name="`item-checkbox-${item._id}`"
                      shape="rounded"
                      class="text-primary-500"
                    />
                  </div>
                </TairoTableCell>
                <TairoTableCell light spaced>
                  <NuxtLink
                    class="text-primary-500 underline-offset-4 hover:underline"
                    :to="'/bo/pub/package-details/' + item._id"
                  >
                    {{ item.code }}
                  </NuxtLink>
                </TairoTableCell>
                <TairoTableCell light spaced>
                  {{ new Date(item.createdAt).toLocaleDateString('fr-FR') }}
                </TairoTableCell>
                <TairoTableCell spaced>
                  <div
                    style="white-space: pre-wrap; word-wrap: break-word"
                    class="flex items-center"
                  >
                    <!-- <BaseAvatar
                      :src="item.announcer?.logo ?? '/img/avatars/company.svg'"
                      :text="item.initials"
                      :class="getRandomColor()"
                    /> -->
                    <div class="!w-44 ms-3">
                      <h4 class="font-sans text-sm font-medium">
                        {{ item.announcer?.name }}
                      </h4>
                      <p class="text-muted-400 font-sans text-xs">
                        {{ item.announcer?.email }}
                      </p>
                    </div>
                  </div>
                </TairoTableCell>
                <TairoTableCell
                  light
                  spaced
                  style="white-space: pre-wrap; word-wrap: break-word"
                >
                  <span class="!w-48"> {{ item.label }}</span>
                </TairoTableCell>
                <TairoTableCell
                  light
                  spaced
                  style="white-space: pre-wrap; word-wrap: break-word"
                >
                  <span class="!w-52"> {{ item.org?.name ?? '' }}</span>
                </TairoTableCell>
                <TairoTableCell light spaced>
                  {{ item.quantities }} spots
                </TairoTableCell>
                <TairoTableCell light spaced>
                  {{ item.numberProducts }}
                </TairoTableCell>
                <TairoTableCell light spaced>
                  {{ item.period }}
                </TairoTableCell>
                <!-- <TairoTableCell light spaced>
                  <a
                    v-if="item.contractUrl"
                    class="mx-1 text-white bg-muted-600 p-2 rounded"
                    :href="'/' + item?.contractUrl"
                    target="_blank"
                    >C</a
                  >
                  <a
                    v-if="item.invoice?.url"
                    class="mx-1 text-white bg-muted-600 p-2 rounded"
                    :href="'/' + item.invoice?.url"
                    target="_blank"
                    >F</a
                  >
                </TairoTableCell> -->
                <TairoTableCell spaced class="capitalize">
                  <BaseTag
                    v-if="item.validator == null"
                    color="warning"
                    flavor="pastel"
                    shape="full"
                    condensed
                    class="font-medium"
                  >
                    Brouillon
                  </BaseTag>
                  <BaseTag
                    v-else-if="item.validator != null"
                    color="success"
                    flavor="pastel"
                    shape="full"
                    condensed
                    class="font-medium"
                  >
                    Validée
                  </BaseTag>
                </TairoTableCell>
                <TairoTableCell spaced>
                  <div class="flex">
                    <BaseButtonAction
                      class="mx-2"
                      :to="'/bo/pub/package-details/' + item._id"
                      muted
                    >
                      <Icon name="lucide:settings" class="h-4 w-4"
                    /></BaseButtonAction>
                    <BaseButtonAction @click="editPackage(item)">
                      <Icon name="lucide:edit" class="h-4 w-4"
                    /></BaseButtonAction>
                    <BaseButtonAction
                      @click="confirmSyncCampaign(item)"
                      class="mx-2"
                    >
                      <Icon
                        name="ph:arrows-clockwise"
                        class="h-4 w-4 text-warning-500"
                    /></BaseButtonAction>
                    <BaseButtonAction
                      @click="confirmDeletePackage(item)"
                      class="mx-2"
                      :disabled="
                        authStore.user.appRole?.name != UserRole.superAdmin
                      "
                    >
                      <Icon name="lucide:trash" class="h-4 w-4 text-red-500"
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

    <!-- Modal new Package -->
    <TairoModal
      :open="isModalNewPackageOpen"
      size="3xl"
      @close="isModalNewPackageOpen = false"
    >
      <template #header>
        <!-- Header -->
        <div class="flex w-full items-center justify-between p-4 md:p-6">
          <h3
            class="font-heading text-muted-900 text-lg font-medium leading-6 dark:text-white"
          >
            {{ isEdit == true ? 'Editer' : 'Nouvelle' }} Campagne
          </h3>

          <BaseButtonClose @click="isModalNewPackageOpen = false" />
        </div>
      </template>

      <!-- Body -->
      <BaseCard class="w-full">
        <form
          method="POST"
          action=""
          class="divide-muted-200 dark:divide-muted-700"
          @submit.prevent="onSubmit"
        >
          <div
            shape="curved"
            class="bg-muted-50 dark:bg-muted-800/60 space-y-8 p-5 md:px-5"
          >
            <div class="mx-auto flex w-full flex-col">
              <div>
                <div class="grid grid-cols-12 gap-4">
                  <div class="ltablet:col-span-6 col-span-12 lg:col-span-6">
                    <Field
                      v-slot="{ field, errorMessage, handleChange, handleBlur }"
                      name="campaign.invoice"
                    >
                      <BaseAutocomplete
                        :model-value="field.value"
                        :error="errorMessage"
                        :disabled="isSubmitting || pendingInvoices"
                        @update:model-value="handleChange"
                        @blur="handleBlur"
                        :items="allInvoices"
                        :display-value="(item: any) => item.name || ''"
                        :filter-items="filterItems"
                        icon="lucide:file"
                        placeholder="e.g. FAC/2023"
                        label="Facture"
                        clearable
                        :clear-value="''"
                      >
                        <template #empty="value">
                          <!-- Use destruct to keep what you need -->
                          <div v-if="value.query.length < 3">
                            Saisissez au-moins 3 caractères
                          </div>
                          <div v-else>Aucun resultat.</div>
                        </template>
                      </BaseAutocomplete>
                    </Field>
                  </div>
                  <div class="ltablet:col-span-6 col-span-12 lg:col-span-6">
                    <Field
                      v-slot="{ field, errorMessage, handleChange, handleBlur }"
                      name="campaign.announcer"
                    >
                      <BaseAutocomplete
                        :model-value="field.value"
                        :error="errorMessage"
                        :disabled="isSubmitting"
                        @update:model-value="handleChange"
                        @blur="handleBlur"
                        :items="[]"
                        :display-value="(item: any) => item.name || ''"
                        :filter-items="filterAnnouncersItems"
                        icon="lucide:file"
                        placeholder="e.g. Canal2 International"
                        label="Annonceur"
                        clearable
                        :clear-value="''"
                      >
                        <template #empty="value">
                          <!-- Use destruct to keep what you need -->
                          <div v-if="value.query.length < 3">
                            Saisissez au-moins 3 caractères
                          </div>
                          <div v-else>
                            Aucun resultat. Veuillez
                            <NuxtLink
                              class="text-primary-500 hover:underline"
                              to="/bo/sales/announcers"
                            >
                              créer un nouvel annonceur </NuxtLink
                            >.
                          </div>
                        </template>
                      </BaseAutocomplete>
                    </Field>
                  </div>
                  <div class="ltablet:col-span-6 col-span-12 lg:col-span-6">
                    <Field
                      v-slot="{ field, errorMessage, handleChange, handleBlur }"
                      name="campaign.org"
                    >
                      <BaseListbox
                        label="Société"
                        :items="orgs.data"
                        :properties="{
                          value: '_id',
                          label: 'name',
                          sublabel: 'email',
                          media: 'flag',
                        }"
                        :model-value="field.value"
                        :error="errorMessage"
                        :disabled="isSubmitting"
                        @update:model-value="handleChange"
                        @blur="handleBlur"
                      />
                    </Field>
                  </div>
                  <div class="col-span-12 md:col-span-6">
                    <Field
                      v-slot="{ field, errorMessage, handleChange, handleBlur }"
                      name="campaign.label"
                    >
                      <BaseInput
                        label="Nom"
                        icon="ph:file-duotone"
                        placeholder="ex: SPOT"
                        :model-value="field.value"
                        :error="errorMessage"
                        :disabled="isSubmitting"
                        @update:model-value="handleChange"
                        @blur="handleBlur"
                      />
                    </Field>
                  </div>
                  <div class="col-span-12 md:col-span-6">
                    <Field
                      v-slot="{ field, errorMessage, handleChange, handleBlur }"
                      name="campaign.numberProducts"
                    >
                      <BaseInput
                        label="Nombre de produits"
                        icon="ph:file-duotone"
                        type="number"
                        placeholder=""
                        :model-value="field.value"
                        :error="errorMessage"
                        :disabled="isSubmitting"
                        @update:model-value="handleChange"
                        @blur="handleBlur"
                      />
                    </Field>
                  </div>
                  <div class="col-span-12 md:col-span-6">
                    <Field
                      v-slot="{ field, errorMessage, handleChange, handleBlur }"
                      name="campaign.quantities"
                    >
                      <BaseInput
                        label="Quantité totale"
                        icon="ph:file-duotone"
                        type="number"
                        placeholder=""
                        :model-value="field.value"
                        :error="errorMessage"
                        :disabled="isSubmitting"
                        @update:model-value="handleChange"
                        @blur="handleBlur"
                      />
                    </Field>
                  </div>
                  <div class="col-span-12 md:col-span-6">
                    <Field
                      v-slot="{ field, errorMessage, handleChange, handleBlur }"
                      name="campaign.period"
                    >
                      <BaseInput
                        label="Periode"
                        icon="ph:file-duotone"
                        placeholder=""
                        :model-value="field.value"
                        :error="errorMessage"
                        :disabled="isSubmitting"
                        @update:model-value="handleChange"
                        @blur="handleBlur"
                      />
                    </Field>
                  </div>
                  <div class="ltablet:col-span-6 col-span-12 lg:col-span-6">
                    <Field
                      v-slot="{ field, errorMessage, handleChange, handleBlur }"
                      name="campaign.status"
                    >
                      <BaseSelect
                        label="Statut *"
                        icon="ph:funnel"
                        :model-value="field.value"
                        :error="errorMessage"
                        :disabled="true"
                        @update:model-value="handleChange"
                        @blur="handleBlur"
                      >
                        <option value="onHold">En attente de validation</option>
                        <option value="confirmed">Validéé</option>
                        <option value="completed">Soldée</option>
                        <option value="closed">Cloturées</option>
                      </BaseSelect>
                    </Field>
                  </div>
                  <div class="ltablet:col-span-6 col-span-12 lg:col-span-6">
                    <Field
                      v-slot="{ field, errorMessage, handleChange, handleBlur }"
                      name="campaign.adminValidator"
                    >
                      <BaseListbox
                        label="Validateur"
                        :items="adminsUser"
                        :properties="{
                          value: '_id',
                          label: 'lastName',
                          sublabel: 'email',
                        }"
                        :model-value="field.value"
                        :error="errorMessage"
                        :disabled="isSubmitting"
                        @update:model-value="handleChange"
                        @blur="handleBlur"
                      />
                    </Field>
                  </div>
                  <div class="col-span-12 md:col-span-6">
                    <Field
                      v-slot="{ field, errorMessage, handleChange, handleBlur }"
                      name="campaign.description"
                    >
                      <BaseInput
                        label="Observations"
                        icon="ph:file-duotone"
                        placeholder=""
                        :model-value="field.value"
                        :error="errorMessage"
                        :disabled="isSubmitting"
                        @update:model-value="handleChange"
                        @blur="handleBlur"
                      />
                    </Field>
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
            <BaseButton @click="isModalNewPackageOpen = false"
              >Annuler</BaseButton
            >
            <div v-if="isEdit == true" class="flex">
              <BaseButton
                :color="currentPackage?.adminValidated ? 'success' : 'warning'"
                class="!mx-2"
                flavor="solid"
                @click="confirmOrder()"
                :disabled="
                  authStore.user?._id != currentPackage?.adminValidator
                "
              >
                <span class="text-bold text-muted-700">
                  Validation du PDG/DG/DO</span
                >
              </BaseButton>
            </div>

            <BaseButton color="primary" flavor="solid" @click="onSubmit">
              {{ isEdit == true ? 'Modifier' : 'Créer' }}
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
            Suppression d'un planning
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

    <!-- Modal Sync campaign -->
    <TairoModal
      :open="isModalSyncCampaignOpen"
      size="sm"
      @close="isModalSyncCampaignOpen = false"
    >
      <template #header>
        <!-- Header -->
        <div class="flex w-full items-center justify-between p-4 md:p-6">
          <h3
            class="font-heading text-muted-900 text-lg font-medium leading-6 dark:text-white"
          >
            Synchronisation d'une campagne
          </h3>

          <BaseButtonClose @click="isModalSyncCampaignOpen = false" />
        </div>
      </template>

      <!-- Body -->
      <div class="p-4 md:p-6">
        <div class="mx-auto w-full max-w-xs text-center">
          <h3
            class="font-heading text-muted-800 text-lg font-medium leading-6 dark:text-white"
          >
            Synchroniser
            <span class="text-warning-500">{{ currentPackage?.label }}</span> ?
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
            <BaseButton @click="isModalSyncCampaignOpen = false"
              >Annuler</BaseButton
            >

            <BaseButton
              color="primary"
              flavor="solid"
              @click="syncCampaign(currentPackage)"
              >Valider</BaseButton
            >
          </div>
        </div>
      </template>
    </TairoModal>
    <!-- Modal confirm order -->
    <TairoModal
      :open="isModalConfirmOrderOpen"
      size="sm"
      @close="isModalConfirmOrderOpen = false"
    >
      <template #header>
        <!-- Header -->
        <div class="flex w-full items-center justify-between p-4 md:p-6">
          <h3
            class="font-heading text-muted-900 text-lg font-medium leading-6 dark:text-white"
          >
            Confirmation de la commande
          </h3>

          <BaseButtonClose @click="isModalConfirmOrderOpen = false" />
        </div>
      </template>

      <!-- Body -->
      <div class="p-4 md:p-6">
        <div class="mx-auto w-full max-w-xs text-center">
          <h3
            class="font-heading text-muted-800 text-lg font-medium leading-6 dark:text-white"
          >
            Voulez-vous confirmer la commande
            <span class="text-primary-500">{{ currentPackage.label }}</span>
            de
            <span class="text-primary-500"
              >{{ currentPackage?.announcer?.name }}
            </span>
            ?
          </h3>

          <p
            class="font-alt text-muted-500 dark:text-muted-400 text-sm leading-5"
          >
            Cette action est reversible
          </p>
        </div>
      </div>

      <template #footer>
        <!-- Footer -->
        <div class="p-4 md:p-6">
          <div class="flex gap-x-2">
            <BaseButton @click="isModalConfirmOrderOpen = false"
              >Annuler</BaseButton
            >

            <BaseButton color="primary" flavor="solid" @click="confirmOrder()"
              >Valider</BaseButton
            >
          </div>
        </div>
      </template>
    </TairoModal>
  </div>
</template>
