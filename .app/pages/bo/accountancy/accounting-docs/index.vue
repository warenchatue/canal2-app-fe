<script setup lang="ts">
import { toTypedSchema } from '@vee-validate/zod'
import { Field, useForm } from 'vee-validate'
import { z } from 'zod'
import { UserRole } from '~/types/user'

definePageMeta({
  title: 'Bons de Caisse',
  preview: {
    title: 'Bons de Caisse',
    description: 'Bons de Caisse | Comptabilité',
    categories: ['bo', 'Accountancy', 'accounting-docs'],
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
const isModalSalesReportOpen = ref(false)
const isEdit = ref(false)
const isPrint = ref(false)
const currentOrg = ref('')
const currentTeam = ref('')
const startDate = ref(new Date())
const endDate = ref(new Date())
const toaster = useToaster()
const isLoading = ref(false)

// Check if can have access
if (
  authStore.user.appRole?.name != UserRole.sale &&
  authStore.user.appRole?.name != UserRole.billing &&
  authStore.user.appRole?.name != UserRole.accountancy &&
  authStore.user.appRole?.name != UserRole.admin &&
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

const { data, pending } = await useFetch('/api/accountancy/accounting-docs', {
  query,
  lazy: true,
})

const { data: orgs, pending: pendingOrg } = await useFetch('/api/admin/orgs', {
  query,
  lazy: true,
})

function confirmDeletePackage(spotPackage: any) {
  isModalDeletePackageOpen.value = true
  isEdit.value = false
  currentOrder.value = spotPackage
}

function openReportModal() {
  setTimeout(() => {
    isModalSalesReportOpen.value = true
  }, 500)
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

  const { data: reportData } = await useFetch(
    '/api/accountancy/accounting-docs',
    {
      query: queryP,
    },
  )
  data.value = reportData.value
  isPrint.value = true
  setTimeout(() => {
    var printContents = document.getElementById(
      'print-expenses-report',
    ).innerHTML
    var originalContents = document.body.innerHTML
    document.body.innerHTML = printContents
    window.print()
    document.body.innerHTML = originalContents
    location.reload()
  }, 500)
}

async function deleteOrder(order: any) {
  const query2 = computed(() => {
    return {
      action: 'delete',
      token: token.value,
      id: order._id,
    }
  })

  const response = await useFetch('/api/accountancy/accounting-docs', {
    method: 'delete',
    headers: { 'Content-Type': 'application/json' },
    query: query2,
  })

  if (response.data?.value?.success) {
    success.value = true
    toaster.clearAll()
    toaster.show({
      title: 'Success',
      message: `Bon supprimé !`,
      color: 'success',
      icon: 'ph:check',
      closable: true,
    })
    isModalDeletePackageOpen.value = false
    filter.value = 'accountng doc'
    filter.value = ''
  } else {
    toaster.clearAll()
    toaster.show({
      title: 'Oops',
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
    selected.value = data.value?.data.map((item) => item._id) ?? []
  }
}

const currentOrder = ref({})

// This is the object that will contain the validation messages
const ONE_MB = 1000000
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
    spotPackage: z.object({
      _id: z.string().optional(),
      label: z.string().min(1, VALIDATION_TEXT.LABEL_REQUIRED),
      status: z
        .union([
          z.literal('onHold'),
          z.literal('confirmed'),
          z.literal('paid'),
          z.literal('closed'),
        ])
        .optional(),
      period: z.string(),
      invoice: z
        .object({
          label: z.string(),
          amount: z.number(),
          pending: z.number(),
          totalSpotsPaid: z.number(),
          url: z.string(),
        })
        .optional()
        .nullable(),
      announcer: z
        .object({
          _id: z.string(),
          email: z.string(),
          name: z.string(),
          photo: z.string().optional(),
        })
        .optional()
        .nullable(),
      commercial: z
        .object({
          _id: z.string(),
          email: z.string(),
          lastName: z.string(),
          photo: z.string().optional(),
        })
        .optional()
        .nullable(),
    }),
  })
  .superRefine((data, ctx) => {
    if (!data.spotPackage.label) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: VALIDATION_TEXT.LABEL_REQUIRED,
        path: ['spotPackage.label'],
      })
    }
  })

// Zod has a great infer method that will
// infer the shape of the schema into a TypeScript type
type FormInput = z.infer<typeof zodSchema>

const validationSchema = toTypedSchema(zodSchema)
const initialValues = computed<FormInput>(() => ({
  avatar: null,
  spotPackage: {
    label: '',
    period: '',
    status: 'onHold',
    invoice: {
      label: '',
      amount: 0,
      pending: 0,
      totalSpotsPaid: 0,
      url: '',
    },
    announcer: {
      _id: '',
      email: '',
      name: '',
      flag: '',
    },
    commercial: {
      _id: authStore.user._id ?? '',
      email: authStore.user.email ?? '',
      lastName: authStore.user.firstName + ' ' + authStore.user.lastName,
      photo: '',
    },
  },
}))

const {
  handleSubmit,
  isSubmitting,
  setFieldError,
  meta,
  values,
  errors,
  resetForm,
  setFieldValue,
  setErrors,
} = useForm({
  validationSchema,
  initialValues,
})

const success = ref(false)

// This is where you would send the form data to the server
const onSubmit = handleSubmit(
  async (values) => {
    success.value = false

    // here you have access to the validated form values
    console.log('package-create-success', values)
    const contractUrl =
      isEdit.value == true ? ref(currentOrder.contractUrl ?? '') : ref('')
    const invoiceUrl =
      isEdit.value == true ? ref(currentOrder.invoice?.url ?? '') : ref('')

    try {
      const isSuccess = ref(false)

      // upload contract file
      if (orderContractFile.value != null) {
        const fd = new FormData()
        fd.append('0', orderContractFile.value)
        const query3 = computed(() => {
          return {
            action: 'new-single-file',
            dir: 'uploads/ordersFiles/contracts',
            token: token.value,
          }
        })

        const { data: uploadData, refresh } = await useFetch(
          '/api/files/upload',
          {
            method: 'POST',
            query: query3,
            body: fd,
          },
        )
        console.log(uploadData)
        if (uploadData.value?.success == false) {
          contractUrl.value = ''
          toaster.show({
            title: 'Oops',
            message: `Une erreur est survenue lors de l'importation de des fichiers !`,
            color: 'danger',
            icon: 'ph:check',
            closable: true,
          })
        } else {
          contractUrl.value = uploadData.value.fileName
        }
      }

      // upload invoice file
      if (orderInvoiceFile.value != null) {
        const fd = new FormData()
        fd.append('0', orderInvoiceFile.value)
        const query3 = computed(() => {
          return {
            action: 'new-single-file',
            dir: 'uploads/ordersFiles/invoices',
            token: token.value,
          }
        })

        const { data: uploadData, refresh } = await useFetch(
          '/api/files/upload',
          {
            method: 'POST',
            query: query3,
            body: fd,
          },
        )
        console.log(uploadData)
        if (uploadData.value?.success == false) {
          invoiceUrl.value = ''
          toaster.show({
            title: 'Oops',
            message: `Une erreur est survenue lors de l'importation de des fichiers !`,
            color: 'danger',
            icon: 'ph:check',
            closable: true,
          })
        } else {
          invoiceUrl.value = uploadData.value.fileName
        }
      }

      if (isEdit.value == true) {
        const query2 = computed(() => {
          return {
            action: 'updatePackage',
            token: token.value,
            id: values.spotPackage._id,
          }
        })

        const response = await useFetch('/api/pub/packages', {
          method: 'put',
          headers: { 'Content-Type': 'application/json' },
          query: query2,
          body: {
            ...values.spotPackage,
            announcer: values.spotPackage?.announcer?._id,
            manager: values.spotPackage?.commercial?._id,
            invoice: { ...values.spotPackage?.invoice, url: invoiceUrl.value },
            contractUrl,
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
            ...values.spotPackage,
            announcer: values.spotPackage?.announcer?._id,
            manager: values.spotPackage?.commercial?._id,
            _id: undefined,
            invoice: { ...values.spotPackage?.invoice, url: invoiceUrl.value },
            contractUrl,
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
            isEdit.value == false ? `Package créé !` : `Package mis à jour`,
          color: 'success',
          icon: 'ph:check',
          closable: true,
        })
        isModalNewPackageOpen.value = false
        resetForm()
        filter.value = 'spotPackage'
        filter.value = ''
      } else {
        toaster.clearAll()
        toaster.show({
          title: 'Oops',
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
        title: 'Oops!',
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
    console.log('payment-create-error', error)

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
          placeholder="Filtrer bon de caisse..."
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
          class="w-full sm:w-52"
          @click="openReportModal()"
        >
          <Icon name="ph:file" class="h-4 w-4" />
          <span>Rapports</span>
        </BaseButton>
        <BaseButton
          color="primary"
          class="w-full sm:w-52"
          to="/bo/accountancy/accounting-docs/new-0"
          @click="isLoading = true"
          :loading="isLoading"
          :disabled="isLoading"
        >
          <Icon name="ph:plus" class="h-4 w-4" />
          <span>Nouvelle pièce</span>
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
                class="text-muted-500 dark:text-muted-400"
              >
                <span>Confirmée</span>
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
                <span v-if="!pending">{{ 0 }}</span>
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
                class="text-muted-500 dark:text-muted-400"
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
                <span v-if="!pending">{{ 0 }}</span>
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
                class="text-muted-500 dark:text-muted-400"
              >
                <span>Montant Total</span>
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
                <span v-if="!pending">
                  {{
                    new Intl.NumberFormat().format(
                      Math.ceil(data?.metaData?.totalAmount ?? 0),
                    )
                  }}
                  XAF</span
                >
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
      <div id="print-expenses-report" class="mx-2">
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
          Etat des dépenses du
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
                  <TairoTableHeading uppercase spaced>Code</TairoTableHeading>
                  <TairoTableHeading uppercase spaced> Date </TairoTableHeading>
                  <TairoTableHeading v-if="!isPrint" uppercase spaced>
                    Journal
                  </TairoTableHeading>
                  <TairoTableHeading v-if="!isPrint" uppercase spaced>
                    Pièce
                  </TairoTableHeading>
                  <TairoTableHeading uppercase spaced> Ref </TairoTableHeading>
                  <TairoTableHeading uppercase spaced>
                    Motif
                  </TairoTableHeading>
                  <TairoTableHeading uppercase spaced>
                    Montant
                  </TairoTableHeading>

                  <TairoTableHeading uppercase spaced>
                    Ville
                  </TairoTableHeading>

                  <TairoTableHeading uppercase spaced>
                    Beneficiaire
                  </TairoTableHeading>
                  <TairoTableHeading uppercase spaced>
                    Ordonateur
                  </TairoTableHeading>
                  <TairoTableHeading uppercase spaced>
                    Societé
                  </TairoTableHeading>

                  <TairoTableHeading v-if="!isPrint" uppercase spaced
                    >Docs</TairoTableHeading
                  >
                  <TairoTableHeading uppercase spaced>Statut</TairoTableHeading>
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
                  <TairoTableCell v-if="!isPrint" spaced>
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
                      :to="'/bo/accountancy/accounting-docs/view-' + item._id"
                    >
                      {{ item.code }}
                    </NuxtLink>
                  </TairoTableCell>
                  <TairoTableCell light spaced>
                    {{ new Date(item.date).toLocaleDateString('fr-FR') }}
                  </TairoTableCell>
                  <TairoTableCell v-if="!isPrint" light spaced>
                    {{ item.journal?.code }}
                  </TairoTableCell>
                  <TairoTableCell v-if="!isPrint" light spaced>
                    {{ item.docType?.label }}
                  </TairoTableCell>

                  <TairoTableCell light spaced>
                    {{ item.ref ?? item.invoiceNumber }}
                  </TairoTableCell>
                  <TairoTableCell
                    style="white-space: pre-wrap; word-wrap: break-word"
                    light
                    spaced
                  >
                    <div class="!w-64">{{ item.label }}</div>
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
                    {{ item.team.toUpperCase() }}
                  </TairoTableCell>

                  <TairoTableCell spaced>
                    <div class="flex items-center">
                      <BaseAvatar
                        :src="
                          item.beneficiary?.logo ?? '/img/avatars/company.svg'
                        "
                        :text="item.initials"
                        :class="getRandomColor()"
                      />
                      <div v-if="item.beneficiary" class="ms-3 leading-none">
                        <h4 class="font-sans text-sm font-medium">
                          {{ item.beneficiary?.firstName }}
                          {{ item.beneficiary?.lastName }}
                        </h4>
                        <p class="text-muted-400 font-sans text-xs">
                          {{ item.beneficiary?.email }}
                        </p>
                      </div>
                      <div v-else class="ms-3 leading-none">
                        {{ item.extBeneficiary }}
                      </div>
                    </div>
                  </TairoTableCell>
                  <TairoTableCell spaced>
                    <div class="flex items-center">
                      <BaseAvatar
                        :src="
                          item.authorizer?.logo ?? '/img/avatars/company.svg'
                        "
                        :text="item.initials"
                        :class="getRandomColor()"
                      />
                      <div class="ms-3 leading-none">
                        <h4 class="font-sans text-sm font-medium">
                          {{ item.authorizer?.firstName }}
                          {{ item.authorizer?.lastName }}
                        </h4>
                        <p class="text-muted-400 font-sans text-xs">
                          {{ item.authorizer?.email }}
                        </p>
                      </div>
                    </div>
                  </TairoTableCell>
                  <TairoTableCell light spaced>
                    {{ item.org.name }}
                  </TairoTableCell>

                  <TairoTableCell v-if="!isPrint" light spaced>
                    <a
                      v-if="item.contractUrl"
                      class="mx-1 text-white bg-muted-600 p-2 rounded"
                      :href="'/' + item.contractUrl"
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
                  </TairoTableCell>
                  <TairoTableCell spaced class="capitalize">
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
                      Non confirmée
                    </BaseTag>
                  </TairoTableCell>
                  <TairoTableCell v-if="!isPrint" spaced>
                    <div class="flex">
                      <BaseButtonAction
                        class="mx-2"
                        :to="'/bo/accountancy/accounting-docs/view-' + item._id"
                        muted
                      >
                        <Icon name="lucide:eye" class="h-4 w-4"
                      /></BaseButtonAction>
                      <BaseButtonAction
                        :to="'/bo/accountancy/accounting-docs/edit-' + item._id"
                      >
                        <Icon name="lucide:edit" class="h-4 w-4" s
                      /></BaseButtonAction>
                      <BaseButtonAction
                        @click="confirmDeletePackage(item)"
                        class="mx-2"
                        :disabled="
                          authStore.user.appRole?.name != UserRole.superAdmin &&
                          authStore.user.appRole?.name != UserRole.accountancy
                        "
                      >
                        <Icon name="lucide:trash" class="h-4 w-4 text-red-500"
                      /></BaseButtonAction>
                    </div>
                  </TairoTableCell>
                </TairoTableRow>
                <TairoTableRow class="border !border-t-2" v-if="isPrint">
                  <TairoTableCell spaced> </TairoTableCell>
                  <TairoTableCell light spaced> </TairoTableCell>
                  <TairoTableCell light spaced> </TairoTableCell>
                  <TairoTableCell light spaced>Total: </TairoTableCell>

                  <TairoTableCell v-if="!isPrint" light spaced>
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
                  <TairoTableCell v-if="!isPrint" light spaced>
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
            Rapport des dépenses
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
              Visualiser
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
            Suppression d'un Bon de caisse
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
            <span class="text-red-500">{{ currentOrder?.label }}</span> ?
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
              @click="deleteOrder(currentOrder)"
              >Suppimer</BaseButton
            >
          </div>
        </div>
      </template>
    </TairoModal>
  </div>
</template>
