<script setup lang="ts">
import { toTypedSchema } from '@vee-validate/zod'
import { Field, useForm } from 'vee-validate'
import { z } from 'zod'
import { UserRole } from '~/types/user'

const route = useRoute()
const router = useRouter()
const toaster = useToaster()
const pageType = computed(() => route.params.slug)
let pageTitle = ''
if (pageType.value == 'order') {
  pageTitle = 'Nouveau devis'
} else if (pageType.value == 'order') {
  pageTitle = 'Nouvelle facture'
}
definePageMeta({
  title: 'Devis & Factures',
  preview: {
    title: 'Devis & Factures',
    description: 'Gestion des devis et factures',
    categories: ['bo', 'sales', 'orders'],
    src: '/img/screens/layouts-table-list-1.png',
    srcDark: '/img/screens/layouts-table-list-1-dark.png',
    order: 44,
  },
})

const authStore = useAuthStore()
const page = computed(() => parseInt((route.query.page as string) ?? '1'))
const filter = ref('')
const perPage = ref(10)
const isModalNewPackageOpen = ref(false)
const isModalDeletePackageOpen = ref(false)
const isModalConfirmOrderOpen = ref(false)
const isEdit = ref(false)
// Check if can have access
if (authStore.user.appRole?.name == UserRole.broadcast) {
  toaster.clearAll()
  toaster.show({
    title: 'Désolé',
    message: `Vous n'avez pas access à cette page!`,
    color: 'danger',
    icon: 'ph:check',
    closable: true,
  })
  router.push('/bo/spots/diffusion-list')
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

const { data, pending } = await useFetch('/api/pub/packages', {
  query,
})

const { data: announcers } = await useFetch('/api/pub/announcers', {
  query,
})

const { data: articles } = await useFetch('/api/sales/articles', {
  query,
})

const { data: allUsers } = await useFetch('/api/users', {
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
  setFieldValue('spotPackage.numberSpots', spotPackage.numberSpots)
  setFieldValue('spotPackage.numberProducts', spotPackage.numberProducts)
  setFieldValue('spotPackage.period', spotPackage.period)
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

function confirmDeletePackage(spotPackage: any) {
  isModalDeletePackageOpen.value = true
  isEdit.value = false
  currentPackage.value = spotPackage
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
      numberSpots: z.number(),
      numberProducts: z.number(),
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
    numberSpots: 0,
    numberProducts: 0,
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

function addOrderItem() {
  orderData.value.push({ ...curOrderItem.value, id: orderData.value.length })
}

function deleteOrderItem(id: number) {
  orderData.value = orderData.value?.filter((e: any) => {
    return e.id != id
  })
}

const orderData = ref([])

const curOrderItem = ref({
  id: 0,
  article: '',
  description: '',
  account: 0,
  quantity: 0,
  unit: 'unité(s)',
  rate: 0,
  discount: 0,
  taxes: [],
  amount: 0,
})

const vatRate = 0.1
const totalData = computed(() => {
  const subtotal = orderData.value.reduce((acc, item) => {
    return acc + item.quantity * item.rate
  }, 0)

  const discount = orderData.value.reduce((acc, item) => {
    return acc + (item.quantity * item.rate * item.discount) / 100
  }, 0)

  const vatValue = orderData.value.reduce((acc, item) => {
    return acc + item.quantity * item.rate * (item.taxes[0].text / 100 ?? 0)
  }, 0)
  const total = subtotal - discount + vatValue

  return [
    {
      label: '+ Total Brut',
      value: subtotal,
    },
    {
      label: '- Remise',
      value: discount,
    },
    {
      label: '+ Taxes',
      value: vatValue,
    },
    {
      label: 'Net à payer',
      value: total,
    },
  ]
})

const taxes = [
  {
    id: 1,
    name: 'TVA',
    text: 19.25,
  },
  {
    id: 2,
    name: 'TSP',
    text: 3,
  },
  {
    id: 3,
    name: 'IR',
    text: 33,
  },
]

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
        <BaseHeading
          as="h1"
          size="xl"
          weight="medium"
          lead="tight"
          class="text-muted-500 dark:text-muted-200"
        >
          {{ pageTitle }}
        </BaseHeading>
      </template>
      <template #right>
        <BaseSelect
          v-model="perPage"
          label=""
          :classes="{
            wrapper: 'w-full sm:w-40',
          }"
        >
          <option :value="10">Canal2</option>
          <option :value="25">Sweet FM</option>
          <option :value="50">Regie2</option>
        </BaseSelect>
        <BaseButton
          color="primary"
          class="w-full sm:w-52"
          @click=";(isModalNewPackageOpen = true), (isEdit = false)"
        >
          <Icon name="ph:pen" class="h-4 w-4" />
          <span>Enregistrer</span>
        </BaseButton>
      </template>
      <form method="POST" action="" @submit.prevent="onSubmit">
        <div class="mx-auto max-w-5xl py-5">
          <div class="mb-4 flex items-center justify-between">
            <div>
              <BaseHeading as="h2" size="xl" weight="medium" lead="none">
                {{ pageType == 'order' ? 'Devis' : 'Facture' }} #ox-81469
              </BaseHeading>
            </div>
            <div class="flex items-center justify-end gap-3">
              <BaseButtonIcon
                condensed
                shape="full"
                data-tooltip="Edit invoice"
              >
                <Icon name="ph:pencil-duotone" class="h-4 w-4" />
              </BaseButtonIcon>
              <BaseButtonIcon
                condensed
                shape="full"
                data-tooltip="Send by email"
              >
                <Icon name="ph:envelope-duotone" class="h-4 w-4" />
              </BaseButtonIcon>
              <BaseButtonIcon
                condensed
                shape="full"
                data-tooltip="Print invoice"
              >
                <Icon name="ph:printer-duotone" class="h-4 w-4" />
              </BaseButtonIcon>
              <BaseButtonIcon
                condensed
                shape="full"
                data-tooltip="Download as PDF"
              >
                <Icon name="ph:download-duotone" class="h-4 w-4" />
              </BaseButtonIcon>
            </div>
          </div>
          <div>
            <BaseCard>
              <div class="overflow-hidden font-sans">
                <div>
                  <div
                    class="border-muted-200 dark:border-muted-700 flex flex-col justify-between gap-y-4 border-b px-8 py-4 sm:flex-row sm:items-center"
                  >
                    <div class="flex items-center gap-4">
                      <img
                        class="h-32 fit-content"
                        src="/uploads/logos/c2.png"
                      />
                      <div class="">
                        <BaseHeading
                          as="h3"
                          size="md"
                          weight="medium"
                          lead="none"
                        >
                        </BaseHeading>
                        <BaseParagraph size="xs" class="text-muted-400">
                          Canal2 International
                        </BaseParagraph>
                      </div>
                    </div>
                    <div class="flex gap-12">
                      <div
                        class="text-muted-500 dark:text-muted-400 text-sm font-light"
                      >
                        <p
                          class="text-muted-700 dark:text-muted-100 text-sm font-normal"
                        >
                          Canal2 International
                        </p>
                        <p class="text-xs">
                          Siege social avenue de l'independance au rond poind du
                          cinquantenaire à youpwe
                        </p>
                        <p class="text-xs">Douala BP.</p>
                        <p class="text-xs">
                          Couriel:dircom@canal2international.net
                        </p>
                      </div>
                    </div>
                  </div>
                  <div
                    class="border-muted-200 dark:border-muted-700 flex flex-col justify-between gap-y-2 border-b p-4 sm:flex-row sm:items-center"
                  >
                    <div class="flex items-center gap-4">
                      <div class="">
                        <BaseHeading
                          as="h1"
                          size="xl"
                          weight="medium"
                          lead="none"
                        >
                          Devis No:
                        </BaseHeading>
                      </div>
                    </div>
                    <div class="flex gap-12">
                      <div
                        class="text-muted-500 dark:text-muted-400 text-sm font-light"
                      >
                        <p
                          class="text-muted-700 dark:text-muted-100 text-sm font-normal"
                        >
                          DEV/2023/0314
                        </p>
                      </div>
                    </div>
                  </div>
                  <div
                    class="border-muted-200 dark:border-muted-700 flex flex-col justify-between gap-y-8 border-b p-8 sm:flex-row sm:items-center"
                  >
                    <div>
                      <div class="flex items-center gap-3">
                        <div class="">
                          <BaseHeading
                            as="h3"
                            size="md"
                            weight="medium"
                            lead="none"
                          >
                            Devis pour
                          </BaseHeading>
                          <BaseParagraph size="sm" class="text-muted-400">
                            Digital Innova
                          </BaseParagraph>
                        </div>
                      </div>
                      <div class="flex gap-2 mt-5">
                        <div
                          class="text-muted-500 dark:text-muted-400 text-sm font-light"
                        >
                          <p
                            class="text-muted-700 dark:text-muted-100 text-xs font-normal"
                          >
                            Addresse
                          </p>

                          <p
                            class="text-muted-700 dark:text-muted-100 mt-2 text-xs font-normal"
                          >
                            Mobile :
                          </p>
                          <p
                            class="text-muted-700 dark:text-muted-100 mt-2 text-xs font-normal"
                          >
                            Courriel :
                          </p>

                          <p
                            class="text-muted-700 dark:text-muted-100 mt-2 text-xs font-normal"
                          >
                            R/C :
                          </p>
                          <p
                            class="text-muted-700 dark:text-muted-100 mt-2 text-xs font-normal"
                          >
                            N. Contribuable :
                          </p>
                        </div>
                        <div
                          class="text-muted-500 dark:text-muted-400 text-sm font-light"
                        >
                          <p class="text-xs">Douala</p>
                          <p class="mt-2 text-xs">694682713</p>
                          <p class="mt-2 text-xs">contact@digitalinnova.tech</p>
                          <p class="mt-2 text-xs">TEKRERKEJRKJR</p>
                          <p class="mt-2 text-xs">MBSDLSKLD</p>
                        </div>
                      </div>
                    </div>

                    <div class="flex gap-2 mt-5">
                      <div
                        class="text-muted-500 dark:text-muted-400 text-sm font-light"
                      >
                        <p
                          class="text-muted-700 dark:text-muted-100 text-xs font-normal"
                        >
                          Date De Devis
                        </p>

                        <p
                          class="text-muted-700 dark:text-muted-100 mt-2 text-xs font-normal"
                        >
                          Description :
                        </p>
                        <p
                          class="text-muted-700 dark:text-muted-100 mt-2 text-xs font-normal"
                        >
                          Date Echéance :
                        </p>
                      </div>
                      <div
                        class="text-muted-500 dark:text-muted-400 text-sm font-light"
                      >
                        <p class="text-xs">19/11/2023</p>
                        <p class="mt-2 text-xs">BC NN.</p>
                        <p class="mt-2 text-xs">29/11/2023</p>
                      </div>
                    </div>
                  </div>
                  <!--  -->
                  <div
                    shape="curved"
                    class="bg-muted-50 dark:bg-muted-800/60 space-y-8 p-5 md:px-5"
                  >
                    <div class="mx-auto flex w-full flex-col">
                      <div>
                        <p
                          class="font-alt text-muted-500 dark:text-muted-200 text-lg leading-5"
                        >
                          Devis en brouillon
                        </p>
                        <div class="grid grid-cols-12 gap-4">
                          <div
                            class="ltablet:col-span-6 col-span-12 lg:col-span-6"
                          >
                            <Field
                              v-slot="{
                                field,
                                errorMessage,
                                handleChange,
                                handleBlur,
                              }"
                              name="spotPackage.announcer"
                            >
                              <BaseListbox
                                label="Annonceur"
                                :items="announcers?.data"
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
                              v-slot="{
                                field,
                                errorMessage,
                                handleChange,
                                handleBlur,
                              }"
                              name="spotPackage.label"
                            >
                              <BaseInput
                                label="Mode de paiement"
                                icon="ph:money-duotone"
                                placeholder="ex: Bon de commande"
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
                              v-slot="{
                                field,
                                errorMessage,
                                handleChange,
                                handleBlur,
                              }"
                              name="spotPackage.period"
                            >
                              <BaseInput
                                label="Conditions de reglements"
                                icon="ph:file-duotone"
                                placeholder="Ex: 100% 30 jours de reception"
                                :model-value="field.value"
                                :error="errorMessage"
                                :disabled="isSubmitting"
                                @update:model-value="handleChange"
                                @blur="handleBlur"
                              />
                            </Field>
                          </div>

                          <div
                            class="ltablet:col-span-6 col-span-12 lg:col-span-6"
                          >
                            <Field
                              v-slot="{
                                field,
                                errorMessage,
                                handleChange,
                                handleBlur,
                              }"
                              name="spotPackage.commercial"
                            >
                              <BaseListbox
                                label="vendeur"
                                :items="commercials"
                                :properties="{
                                  value: '_id',
                                  label: 'lastName',
                                  sublabel: 'email',
                                  media: 'photo',
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
                              v-slot="{
                                field,
                                errorMessage,
                                handleChange,
                                handleBlur,
                              }"
                              name="spotPackage.label"
                            >
                              <BaseInput
                                label="Equipe commerciale"
                                icon="ph:user-duotone"
                                placeholder="ex: Douala"
                                :model-value="field.value"
                                :error="errorMessage"
                                :disabled="isSubmitting"
                                @update:model-value="handleChange"
                                @blur="handleBlur"
                              />
                            </Field>
                          </div>
                          <div
                            class="ltablet:col-span-6 col-span-12 lg:col-span-6"
                          >
                            <Field
                              v-slot="{
                                field,
                                errorMessage,
                                handleChange,
                                handleBlur,
                              }"
                              name="spotPackage.status"
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
                                <option value="onHold">
                                  En attente de validation
                                </option>
                                <option value="confirmed">Validéé</option>
                                <option value="completed">Soldée</option>
                                <option value="closed">Cloturées</option>
                              </BaseSelect>
                            </Field>
                          </div>
                          <div
                            class="ltablet:col-span-12 col-span-12 lg:col-span-6"
                          >
                            <BaseInputFile
                              v-model="inputOrderContracts"
                              :disabled="
                                isSubmitting ||
                                (authStore.user?.appRole?.name !=
                                  UserRole.superAdmin &&
                                  authStore.user?.appRole?.name !=
                                    UserRole.sale)
                              "
                              shape="straight"
                              label="Slectionnez le contrat"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div class="px-2 py-8 sm:p-4">
                    <div class="flex flex-col px-2 overflow-auto">
                      <table
                        class="divide-muted-200 dark:divide-muted-700 min-w-full divide-y"
                      >
                        <thead class="font-sans">
                          <tr>
                            <th
                              scope="col"
                              class="text-muted-400 py-3.5 pe-3 ps-4 text-left text-xs font-medium uppercase sm:ps-6 md:ps-0"
                            >
                              <Icon name="lucide:settings" class="h-4 w-4" />
                            </th>
                            <th
                              scope="col"
                              class="text-muted-400 py-3.5 pe-3 ps-4 text-left text-xs font-medium uppercase sm:ps-6 md:ps-0"
                            >
                              #
                            </th>
                            <th
                              scope="col"
                              class="text-muted-400 py-3.5 pe-3 ps-4 text-left text-xs font-medium uppercase sm:ps-6 md:ps-0"
                            >
                              Article
                            </th>
                            <th
                              scope="col"
                              class="text-muted-400 py-3.5 pe-3 ps-4 text-left text-xs font-medium uppercase sm:ps-6 md:ps-0"
                            >
                              Description
                            </th>
                            <th
                              scope="col"
                              class="text-muted-400 py-3.5 pe-3 ps-4 text-left text-xs font-medium uppercase sm:ps-6 md:ps-0"
                            >
                              Compte
                            </th>
                            <th
                              scope="col"
                              class="text-muted-400 hidden px-3 py-3.5 text-right text-xs font-medium uppercase sm:table-cell"
                            >
                              Quantité
                            </th>
                            <th
                              scope="col"
                              class="text-muted-400 hidden px-3 py-3.5 text-right text-xs font-medium uppercase sm:table-cell"
                            >
                              U.M
                            </th>
                            <th
                              scope="col"
                              class="text-muted-400 hidden px-3 py-3.5 text-right text-xs font-medium uppercase sm:table-cell"
                            >
                              Prix Unitaire
                            </th>
                            <th
                              scope="col"
                              class="text-muted-400 hidden px-3 py-3.5 text-right text-xs font-medium uppercase sm:table-cell"
                            >
                              Remise(%)
                            </th>
                            <th
                              scope="col"
                              class="text-muted-400 hidden px-3 py-3.5 text-right text-xs font-medium uppercase sm:table-cell"
                            >
                              Taxes
                            </th>
                            <th
                              scope="col"
                              class="text-muted-400 py-3.5 pe-4 ps-3 text-right text-xs font-medium uppercase sm:pe-6 md:pe-0"
                            >
                              Montant
                            </th>
                          </tr>
                        </thead>
                        <tbody class="font-sans">
                          <tr
                            v-for="(item, i) in orderData"
                            :key="i"
                            class="border-muted-200 dark:border-muted-700 border-b"
                          >
                            <td class="py-4 pe-3 ps-4 text-sm sm:ps-6 md:ps-0">
                              <div
                                class="text-muted-800 dark:text-muted-100 font-medium"
                              >
                                <BaseButtonAction @click="deleteOrderItem(i)">
                                  <Icon
                                    name="lucide:trash"
                                    class="h-4 w-4 text-red-500"
                                  />
                                </BaseButtonAction>
                              </div>
                            </td>
                            <td
                              class="text-muted-500 dark:text-muted-400 hidden px-3 py-4 text-left text-sm sm:table-cell"
                            >
                              {{ item.id + 1 }}
                            </td>
                            <td
                              class="text-muted-500 dark:text-muted-400 hidden px-3 py-4 text-left text-sm sm:table-cell"
                            >
                              {{ item.article.firstName }}
                            </td>
                            <td
                              class="text-muted-500 dark:text-muted-400 hidden px-3 py-4 text-left text-sm sm:table-cell"
                            >
                              {{ item.description }}
                            </td>
                            <td
                              class="hidden px-3 py-4 text-right text-sm sm:table-cell"
                            >
                              7011
                            </td>
                            <td
                              class="text-muted-400 hidden px-3 py-4 text-right text-sm sm:table-cell"
                            >
                              {{ item.quantity }}
                            </td>
                            <td
                              class="text-muted-400 hidden px-3 py-4 text-right text-sm sm:table-cell"
                            >
                              {{ item.unit }}
                            </td>
                            <td
                              class="text-muted-400 hidden px-3 py-4 text-right text-sm sm:table-cell"
                            >
                              {{ item.rate }}
                            </td>
                            <td
                              class="text-muted-400 hidden px-3 py-4 text-right text-sm sm:table-cell"
                            >
                              {{ item.discount }}
                            </td>
                            <td
                              class="text-muted-400 hidden px-3 py-4 text-right text-sm sm:table-cell"
                            >
                              {{ item.taxes[0]?.title }}
                            </td>
                            <td
                              class="text-muted-800 dark:text-muted-100 py-4 pe-4 ps-3 text-right text-sm sm:pe-6 md:pe-0"
                            >
                              {{
                                new Intl.NumberFormat('fr-FR').format(
                                  item.rate * item.quantity,
                                )
                              }}
                            </td>
                          </tr>
                          <!--  -->
                          <tr
                            class="border-muted-200 dark:border-muted-700 border-b"
                          >
                            <td class="py-4 pe-3 ps-4 text-sm sm:ps-6 md:ps-0">
                              <div
                                class="text-muted-800 dark:text-muted-100 font-medium"
                              >
                                <BaseButtonAction @click="addOrderItem()">
                                  <Icon name="lucide:plus" class="h-4 w-4" />
                                </BaseButtonAction>
                              </div>
                            </td>
                            <td class="py-4 pe-3 ps-4 text-sm sm:ps-6 md:ps-0">
                              <div
                                class="text-muted-800 dark:text-muted-100 font-medium"
                              >
                                {{ orderData.length + 1 }}
                              </div>
                            </td>
                            <td class="py-4 pe-3 ps-4 text-sm sm:ps-6 md:ps-0">
                              <div
                                class="text-muted-800 dark:text-muted-100 font-medium"
                              >
                                <Field
                                  v-slot="{
                                    field,
                                    errorMessage,
                                    handleChange,
                                    handleBlur,
                                  }"
                                  name="order.article"
                                >
                                  <BaseListbox
                                    label=""
                                    :items="articles.data"
                                    :classes="{
                                      wrapper: 'w-32',
                                    }"
                                    :properties="{
                                      value: '_id',
                                      label: 'name',
                                      sublabel: 'code',
                                      media: '',
                                    }"
                                    v-model="curOrderItem.article"
                                    :error="errorMessage"
                                    :disabled="isSubmitting"
                                    @update:model-value="handleChange"
                                    @blur="handleBlur"
                                  />
                                </Field>
                              </div>
                            </td>
                            <td
                              class="text-muted-500 dark:text-muted-400 hidden px-3 py-4 text-right text-sm sm:table-cell"
                            >
                              <BaseTextarea
                                v-model="curOrderItem.description"
                                label=""
                                shape="rounded"
                                placeholder="..."
                                rows="1"
                                :classes="{
                                  wrapper: 'w-32',
                                }"
                                autogrow
                              />
                            </td>
                            <td
                              class="hidden px-3 py-4 text-right text-sm sm:table-cell"
                            >
                              <div class="flex justify-end">
                                <BaseInput
                                  v-model="curOrderItem.account"
                                  type="text"
                                  :classes="{
                                    wrapper: 'w-16',
                                  }"
                                />
                              </div>
                            </td>
                            <td
                              class="hidden px-3 py-4 text-right text-sm sm:table-cell"
                            >
                              <div class="flex justify-end">
                                <BaseInput
                                  v-model.number="curOrderItem.quantity"
                                  type="number"
                                  :classes="{
                                    wrapper: 'w-16',
                                  }"
                                />
                              </div>
                            </td>
                            <td
                              class="text-muted-400 hidden px-3 py-4 text-right text-sm sm:table-cell"
                            >
                              <BaseInput
                                v-model="curOrderItem.unit"
                                type="text"
                                :classes="{
                                  wrapper: 'w-20 text-xs',
                                }"
                              />
                            </td>
                            <td
                              class="text-muted-800 dark:text-muted-100 py-4 pe-4 ps-3 text-right text-sm sm:pe-6 md:pe-0"
                            >
                              <BaseInput
                                v-model.number="curOrderItem.rate"
                                type="number"
                                :classes="{
                                  wrapper: 'w-24',
                                }"
                              />
                            </td>
                            <td
                              class="text-muted-800 dark:text-muted-100 py-4 pe-4 ps-3 text-right text-sm sm:pe-6 md:pe-0"
                            >
                              <BaseInput
                                v-model.number="curOrderItem.discount"
                                type="number"
                                :classes="{
                                  wrapper: 'w-16',
                                }"
                              />
                            </td>
                            <td
                              class="text-muted-800 dark:text-muted-100 py-4 pe-4 ps-3 text-right text-sm sm:pe-6 md:pe-0"
                            >
                              <BaseListbox
                                v-model="curOrderItem.taxes"
                                label=""
                                :items="taxes"
                                placeholder=""
                                :multiple-label="
                              (value: any[], labelProperty?: string) => { 
                                if (value.length === 0) { return 'Vide'; } else if (value.length > 1) { return `${value.length} elements`; } 
                                return labelProperty ? String(value?.[0]?.[labelProperty]) :  String(value?.[0])+' : '+String(value?.[1]); }"
                                :properties="{
                                  value: 'id',
                                  label: 'name',
                                  sublabel: 'text',
                                }"
                                multiple
                              />
                              <div></div>
                            </td>
                            <td
                              class="text-muted-800 dark:text-muted-100 py-4 pe-4 ps-3 text-right text-sm sm:pe-6 md:pe-0"
                            >
                              {{
                                new Intl.NumberFormat('fr-FR').format(
                                  curOrderItem.rate * curOrderItem.quantity,
                                )
                              }}
                            </td>
                          </tr>
                        </tbody>
                        <tfoot>
                          <tr v-for="item in totalData" :key="item.label">
                            <!-- <div class="flex justify-end gap-2 mt-5">
                              <div
                                class="text-muted-500 dark:text-muted-400 text-sm font-light"
                              >
                                <p
                                  class="text-muted-700 dark:text-muted-100 text-xs font-normal"
                                >
                                  Addresse
                                </p>
                              </div>
                              <div
                                class="text-muted-500 dark:text-muted-400 text-sm font-light"
                              >
                                <p class="text-xs">Douala</p>
                              </div>
                            </div> -->
                            <th
                              scope="row"
                              colspan="10"
                              class="text-muted-400 hidden pe-3 ps-6 pt-6 text-right text-sm font-light sm:table-cell md:ps-0"
                            >
                              {{ item.label }}
                            </th>
                            <th
                              scope="row"
                              class="text-muted-500 pe-3 ps-4 pt-6 text-left text-sm font-light sm:hidden"
                            >
                              {{ item.label }}
                            </th>
                            <td
                              class="pe-4 ps-3 pt-6 text-right sm:pe-6 md:pe-0 !w-32"
                              :class="
                                item.label === 'Net à payer'
                                  ? 'font-semibold text-base text-muted-800 dark:text-muted-100'
                                  : 'text-sm text-muted-500 dark:text-muted-200/70'
                              "
                            >
                              <span class="!w-32">
                                {{
                                  new Intl.NumberFormat('fr-FR').format(
                                    item.value,
                                  )
                                }}
                                XAF
                              </span>
                            </td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  </div>

                  <div class="mt-8 p-8">
                    <div
                      class="border-muted-200 dark:border-muted-700 border-t pt-8"
                    >
                      <div class="text-muted-400">
                        <BaseParagraph size="xs">
                          Payment terms are 14 days. Please be aware that
                          according to the Late Payment of company Debts Acts,
                          freelancers are entitled to claim a 00.00 late fee
                          upon non-payment of debts after this time, at which
                          point a new invoice will be submitted with the
                          addition of this fee.
                        </BaseParagraph>
                      </div>
                    </div>
                  </div>
                  <div class="mt-2 p-8 flex justify-end">
                    <div class="text-muted-400">
                      <BaseParagraph size="xs">
                        The sales department
                      </BaseParagraph>
                    </div>
                  </div>
                </div>
              </div>
            </BaseCard>
          </div>
        </div>
      </form>
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
