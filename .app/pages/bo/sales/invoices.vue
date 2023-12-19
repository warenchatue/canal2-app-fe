<script setup lang="ts">
import { toTypedSchema } from '@vee-validate/zod'
import { Field, useForm } from 'vee-validate'
import { z } from 'zod'
import { UserRole } from '~/types/user'
import { DatePicker } from 'v-calendar'

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

const authStore = useAuthStore()
const route = useRoute()
const router = useRouter()
const page = computed(() => parseInt((route.query.page as string) ?? '1'))
const filter = ref('')
const perPage = ref(10)
const isModalNewPackageOpen = ref(false)
const isModalDeletePackageOpen = ref(false)
const isModalConfirmOrderOpen = ref(false)
const isModalSalesReportOpen = ref(false)
const isEdit = ref(false)
const isPrint = ref(false)
const toaster = useToaster()
const currentOrg = ref('')
const currentTeam = ref('')
const dates = {
  start: new Date(),
  end: new Date(),
}

// Check if can have access
if (
  authStore.user.appRole?.name != UserRole.billing &&
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

watch(currentOrg, (value) => {
  filter.value = value?.name
})

watch(currentTeam, (value) => {
  filter.value = value
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

const { data, pending } = await useFetch('/api/sales/invoices', {
  query,
})

const { data: allUsers } = await useFetch('/api/users', {
  query,
})

const { data: orgs } = await useFetch('/api/admin/orgs', {
  query,
})

const commercials = allUsers.value?.data.filter((e: any) => {
  return e.appRole?.name == UserRole.sale
})
function editPackage(spotPackage: any) {
  isModalNewPackageOpen.value = true
  isEdit.value = true
  currentPackage.value = spotPackage
  setFieldValue('spotPackage._id', spotPackage._id)
  setFieldValue('spotPackage.label', spotPackage.label)
  setFieldValue('spotPackage.announcer', spotPackage.announcer)
  setFieldValue('spotPackage.commercial', spotPackage.manager)
  setFieldValue('spotPackage.status', spotPackage.status)
  setFieldValue('spotPackage.invoice.amount', spotPackage.invoice.amount)
  setFieldValue('spotPackage.invoice.label', spotPackage.invoice.label)
  setFieldValue('spotPackage.invoice.pending', spotPackage.invoice.pending)
  setFieldValue(
    'spotPackage.invoice.totalSpotsPaid',
    spotPackage.invoice.totalSpotsPaid,
  )
}

function confirmDeletePackage(invoice: any) {
  isModalDeletePackageOpen.value = true
  isEdit.value = false
  currentPackage.value = invoice
}

function printSalesReport() {
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

async function deletePackage(invoice: any) {
  const query2 = computed(() => {
    return {
      action: 'delete',
      token: token.value,
      id: invoice._id,
    }
  })

  const response = await useFetch('/api/sales/invoices', {
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
    selected.value = data.value?.data.map((item) => item.id) ?? []
  }
}

const currentPackage = ref({})

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

async function confirmOrder() {
  const query4 = computed(() => {
    return {
      action: 'updatePackage',
      token: token.value,
      id: currentPackage.value._id,
    }
  })
  if (authStore.user?.appRole?.tag == UserRole.respSaleTag) {
    currentPackage.value.orderValidator = authStore.user._id
  } else if (authStore.user.appRole?.tag == UserRole.respBillingTag) {
    currentPackage.value.billValidator = authStore.user._id
  } else if (authStore.user.appRole?.name == UserRole.admin) {
    currentPackage.value.adminValidator = authStore.user._id
  }

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
      message: `Commande confirmée !`,
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
      title: 'Oops',
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
    const contractUrl =
      isEdit.value == true ? ref(currentPackage.contractUrl ?? '') : ref('')
    const invoiceUrl =
      isEdit.value == true ? ref(currentPackage.invoice?.url ?? '') : ref('')

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
          class="w-full sm:w-52"
          @click="isModalSalesReportOpen = true"
        >
          <Icon name="ph:file" class="h-4 w-4" />
          <span>Rapports</span>
        </BaseButton>
        <BaseButton
          color="primary"
          class="w-full sm:w-52"
          to="/bo/sales/orders/new-invoice-0"
        >
          <Icon name="ph:plus" class="h-4 w-4" />
          <span>Nouvelle facture</span>
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
                <span>{{ data?.metaData?.totalItems }}</span>
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
                <span>{{ data?.metaData?.totalAnnouncers }}</span>
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
                <span>{{ data?.metaData?.totalSpots }}</span>
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
                <span>Annonceurs</span>
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
                <span>{{ data?.metaData?.totalFiles }}</span>
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
      <div id="print-sales-report" class="mx-2">
        <div
          v-if="isPrint"
          class="flex justify-between items-center border-b-2 py-1"
        >
          <div shape="straight" class="">
            <img class="h-32 fit-content" src="/uploads/logos/c2.png" />
          </div>
          <div class="flex justify-end">
            <div>
              <h5
                class="font-heading text-right text-muted-900 text-base font-medium py-1 leading-6 dark:text-white"
              >
                {{ currentOrg?.name ?? '' }}
              </h5>
              <h5
                class="font-heading text-right text-muted-900 text-base font-medium pb-1 leading-6 dark:text-white"
              >
                {{ currentOrg?.email ?? '' }}
              </h5>
              <h5
                class="font-heading text-right text-muted-900 text-base font-medium pb-1 leading-6 dark:text-white"
              >
                {{ currentOrg?.address ?? '' }}
              </h5>
            </div>
          </div>
        </div>
        <div v-if="isPrint" shape="straight" class="border border-t-1"></div>
        <h4
          v-if="isPrint"
          class="font-heading text-muted-900 text-base font-medium pb-2 pt-1 px-2 leading-6 dark:text-white"
        >
          Etat de ventes du .. au .. Pour la ville de .. de la société
          {{ currentOrg?.name ?? '' }}
        </h4>
        <h5
          v-if="isPrint"
          class="font-heading text-muted-900 text-base font-medium py-1 leading-6 px-2 dark:text-white"
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
                  <TairoTableHeading uppercase spaced
                    >Numéro de la facture</TairoTableHeading
                  >
                  <TairoTableHeading uppercase spaced>
                    Annonceur
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
                  <TairoTableHeading uppercase spaced> TVA </TairoTableHeading>
                  <TairoTableHeading uppercase spaced> TSP </TairoTableHeading>
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
                  <TairoTableCell v-if="!isPrint" spaced>
                    <div class="flex items-center">
                      <BaseCheckbox
                        v-model="selected"
                        :value="item.id"
                        :name="`item-checkbox-${item.id}`"
                        shape="rounded"
                        class="text-primary-500"
                      />
                    </div>
                  </TairoTableCell>
                  <TairoTableCell light spaced>
                    <NuxtLink
                      class="text-primary-500 underline-offset-4 hover:underline"
                      :to="'/bo/sales/orders/view-invoice-' + item._id"
                    >
                      {{ item.code }}
                    </NuxtLink>
                  </TairoTableCell>
                  <TairoTableCell spaced>
                    <div class="flex items-center">
                      <BaseAvatar
                        :src="
                          item.announcer?.logo ?? '/img/avatars/company.svg'
                        "
                        :text="item.initials"
                        :class="getRandomColor()"
                      />
                      <div class="ms-3 leading-none">
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
                    {{ new Date(item.createdAt).toLocaleDateString('fr-FR') }}
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
                  <TairoTableCell light spaced>
                    {{
                      new Intl.NumberFormat().format(Math.ceil(item.tva ?? 0))
                    }}
                    XAF
                  </TairoTableCell>
                  <TairoTableCell light spaced>
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
                    {{
                      new Intl.NumberFormat().format(
                        Math.ceil(item.amount - item.paid ?? 0) > 0
                          ? Math.ceil(item.amount - item.paid ?? 0)
                          : 0,
                      )
                    }}
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
                      v-if="item.state === 'trashed'"
                      color="muted"
                      flavor="pastel"
                      shape="full"
                      condensed
                      class="font-medium"
                    >
                      {{ item.state }}
                    </BaseTag>
                    <BaseTag
                      v-else-if="item.state === 'active'"
                      color="warning"
                      flavor="pastel"
                      shape="full"
                      condensed
                      class="font-medium"
                    >
                      {{ item.state }}
                    </BaseTag>
                  </TairoTableCell>
                  <TairoTableCell v-if="!isPrint" spaced>
                    <div class="flex">
                      <BaseButtonAction
                        class="mx-2"
                        :to="'/bo/sales/orders/view-invoice-' + item._id"
                        muted
                      >
                        <Icon name="lucide:eye" class="h-4 w-4"
                      /></BaseButtonAction>
                      <BaseButtonAction
                        :to="'/bo/sales/orders/edit-invoice-' + item._id"
                      >
                        <Icon name="lucide:edit" class="h-4 w-4"
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
          @submit.prevent="onSubmit"
        >
          <div
            shape="curved"
            class="bg-muted-50 dark:bg-muted-800/60 space-y-8 p-5 md:px-5"
          >
            <div class="mx-auto flex w-full flex-col">
              <div>
                <div>
                  <div class="col-span-12 sm:col-span-6 mt-2">
                    <Field
                      v-slot="{ field, errorMessage, handleChange, handleBlur }"
                      name="report.org"
                    >
                      <BaseListbox
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
                        :disabled="isSubmitting"
                        @update:model-value="handleChange"
                        @blur="handleBlur"
                      />
                    </Field>
                  </div>
                  <div class="col-span-12 md:col-span-6">
                    <Field
                      v-slot="{ field, errorMessage, handleChange, handleBlur }"
                      name="order.team"
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
                  <div class="col-span-12 mx-0 mt-2">
                    <DatePicker
                      v-model.range="planningDates"
                      :masks="masks"
                      mode="date"
                      hide-time-header
                      trim-weeks
                    >
                      <template #default="{ inputValue, inputEvents }">
                        <div class="flex w-full flex-col gap-4 sm:flex-row">
                          <div class="relative grow">
                            <Field
                              v-slot="{
                                field,
                                errorMessage,
                                handleChange,
                                handleBlur,
                              }"
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
                              v-slot="{
                                field,
                                errorMessage,
                                handleChange,
                                handleBlur,
                              }"
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
            class="font-alt text-muted-700 dark:text-muted-400 text-sm leading-5"
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
