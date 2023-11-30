<script setup lang="ts">
import { toTypedSchema } from '@vee-validate/zod'
import { Field, useForm } from 'vee-validate'
import { DatePicker } from 'v-calendar'
import { z } from 'zod'
import { UserRole } from '~/types/user'

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

const route = useRoute()
const router = useRouter()
const toaster = useToaster()
const authStore = useAuthStore()
const page = computed(() => parseInt((route.query.page as string) ?? '1'))
const filter = ref('')
const perPage = ref(10)
const isEdit = ref(false)
const isPrint = ref(false)
const currentOrderInvoice = ref({})
const token = useCookie('token')
const isModalCreatePackageOpen = ref(false)
const isModalDeletePackageOpen = ref(false)
const isModalConfirmOrderOpen = ref(false)
const isModalCreatePaymentOpen = ref(false)
const currentOrg = ref({})
const packageId = ref('')
const selectedOrder = ref({})
const totalAmount = ref(0)
const dates = ref({
  start: new Date(),
  end: new Date(),
})
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

const query = computed(() => {
  return {
    filter: filter.value,
    perPage: perPage.value,
    page: page.value,
    action: 'findAll',
    token: token.value,
  }
})

const { data } = await useFetch('/api/pub/packages', {
  query,
})

const { data: allOrders } = await useFetch('/api/sales/orders', {
  query,
})

const { data: announcers } = await useFetch('/api/sales/announcers', {
  query,
})

const { data: articles } = await useFetch('/api/sales/articles', {
  query,
})

const { data: orgs } = await useFetch('/api/admin/orgs', {
  query,
})

const { data: taxes } = await useFetch('/api/accountancy/taxes', {
  query,
})

const { data: accounts } = await useFetch('/api/accountancy/accounts', {
  query,
})

const { data: allUsers } = await useFetch('/api/users', {
  query,
})
const commercials = allUsers.value?.data.filter((e: any) => {
  return e.appRole?.name == UserRole.sale
})

const pageType = computed(() => route.params.type)
const pageValue = computed(() => route.params.value)
const pageId = computed(() => route.params.id)

let pageTitle = ''
if (pageType.value == 'new') {
  if (pageValue.value == 'order') {
    pageTitle = 'Nouveau Devis'
  } else if (pageValue.value == 'invoice') {
    pageTitle = 'Nouvelle Facture'
  }
}
if (pageType.value == 'view') {
  if (pageValue.value == 'order') {
    pageTitle = 'Consultation Devis'
  } else if (pageValue.value == 'invoice') {
    pageTitle = 'Consultation Facture'
  }
} else if (pageType.value == 'edit') {
  isEdit.value = true
  const query = computed(() => {
    return {
      filter: filter.value,
      perPage: perPage.value,
      page: page.value,
      action: 'findOne',
      id: pageId.value,
      token: token.value,
    }
  })
  if (pageValue.value == 'order') {
    pageTitle = 'Mise à jour Devis'
    const { data: singleOrder } = await useFetch('/api/sales/orders', {
      query,
    })
    if (singleOrder.value?.success) {
      currentOrderInvoice.value = singleOrder.value?.data
      packageId.value = currentOrderInvoice.value.package?._id ?? undefined
      editOrderInvoiceFile(currentOrderInvoice.value)
    }
  } else if (pageValue.value == 'invoice') {
    pageTitle = 'Mise à jour Facture'
    const { data: singleOrder } = await useFetch('/api/sales/invoices', {
      query,
    })
    if (singleOrder.value?.success) {
      currentOrderInvoice.value = singleOrder.value?.data
      packageId.value =
        currentOrderInvoice.value.order.package?._id ?? undefined
      selectedOrder.value = currentOrderInvoice.value.order
      editOrderInvoiceFile(currentOrderInvoice.value)
    }
  }
}

watch(selectedOrder, (value) => {
  setTimeout(() => {
    editOrderInvoiceFile(value)
  }, 1000)
})

function printOrder() {
  isPrint.value = true
  setTimeout(() => {
    var printContents = document.getElementById('print-invoice').innerHTML
    var originalContents = document.body.innerHTML
    document.body.innerHTML = printContents
    window.print()
    document.body.innerHTML = originalContents
    location.reload()
  }, 1000)
}

function confirmDeleteOrder(order: any) {
  isModalDeletePackageOpen.value = true
  isEdit.value = false
  currentPackage.value = order
}

function viewOrder() {
  setTimeout(() => {
    isPrint.value = !isPrint.value
    editOrderInvoiceFile(currentOrderInvoice.value)
  }, 1000)
}

async function deletePackage(spotPackage: any) {
  const query2 = computed(() => {
    return {
      action: 'delete',
      token: token.value,
      id: order._id,
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

async function addInvoicePayment() {
  const query2 = computed(() => {
    return {
      action: 'addInvoicePayment',
      token: token.value,
      id: currentOrderInvoice.value._id,
    }
  })

  const response = await useFetch('/api/sales/invoices', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    query: query2,
    body: {
      ...curInvoicePaymentForm.value,
      org: currentOrg?.value?._id,
    },
  })

  if (response.data?.value?.success) {
    success.value = true
    toaster.clearAll()
    toaster.show({
      title: 'Success',
      message: `Paiment créer !`,
      color: 'success',
      icon: 'ph:check',
      closable: true,
    })
    isModalCreatePaymentOpen.value = false
    filter.value = 'payment'
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
    order: z.object({
      _id: z.string().optional(),
      label: z.string().min(1, VALIDATION_TEXT.LABEL_REQUIRED),
      amount: z.number(),
      paymentCondition: z.string().optional(),
      team: z.string().optional(),
      pending: z.number(),
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
    if (!data.order.label) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: VALIDATION_TEXT.LABEL_REQUIRED,
        path: ['order.label'],
      })
    }
  })

// Zod has a great infer method that will
// infer the shape of the schema into a TypeScript type
type FormInput = z.infer<typeof zodSchema>

const validationSchema = toTypedSchema(zodSchema)
const initialValues = computed<FormInput>(() => ({
  avatar: null,
  order: {
    label: '',
    amount: 0,
    pending: 0,
    status: 'onHold',
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

function editOrderInvoiceFile(currentOrderInvoice: any) {
  setTimeout(() => {
    setFieldValue('order._id', currentOrderInvoice._id)
    setFieldValue('order.label', currentOrderInvoice.label)
    setFieldValue('order.announcer', currentOrderInvoice.announcer)
    setFieldValue('order.commercial', currentOrderInvoice.manager)
    setFieldValue('order.status', currentOrderInvoice.status)
    setFieldValue(
      'order.paymentCondition',
      currentOrderInvoice.paymentCondition,
    )
    currentOrg.value = currentOrderInvoice.org
    orderData.value = currentOrderInvoice.items
  }, 1000)
}
async function createPackage() {
  const query4 = computed(() => {
    return {
      action: 'createPackage',
      token: token.value,
    }
  })

  const response = await useFetch('/api/pub/packages', {
    method: 'post',
    headers: { 'Content-Type': 'application/json' },
    query: query4,
    body: { order: currentOrderInvoice.value._id },
  })

  if (response.data?.value?.success) {
    success.value = true
    toaster.clearAll()
    toaster.show({
      title: 'Success',
      message: `Package créer !`,
      color: 'success',
      icon: 'ph:check',
      closable: true,
    })
    await addPackageOrder(response.data?.value?.data._id)
    isModalCreatePackageOpen.value = false
    filter.value = 'package'
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
async function addPackageOrder(id: string) {
  const query4 = computed(() => {
    return {
      action: 'updateOrder',
      token: token.value,
      id: currentOrderInvoice.value._id,
    }
  })
  const response = await useFetch('/api/sales/orders', {
    method: 'put',
    headers: { 'Content-Type': 'application/json' },
    query: query4,
    body: { ...currentOrderInvoice.value, package: id },
  })

  if (response.data?.value?.success) {
    success.value = true
    toaster.clearAll()
    toaster.show({
      title: 'Success',
      message: 'Devis mis à jour !',
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

async function confirmOrder() {
  const query4 = computed(() => {
    return {
      action: pageValue.value == 'order' ? 'updateOrder' : 'updateInvoice',
      token: token.value,
      id: currentOrderInvoice.value._id,
    }
  })
  currentOrderInvoice.value.validator = authStore.user._id

  const response = await useFetch(
    pageValue.value == 'order' ? '/api/sales/orders' : '/api/sales/invoices',
    {
      method: 'put',
      headers: { 'Content-Type': 'application/json' },
      query: query4,
      body: { ...currentOrderInvoice.value },
    },
  )

  if (response.data?.value?.success) {
    success.value = true
    toaster.clearAll()
    toaster.show({
      title: 'Success',
      message:
        pageValue.value == 'order' ? `Devis confirmé !` : `Facture confirmée !`,
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

const curInvoicePaymentForm = ref({
  account: '',
  label: '',
  amount: 0,
  date: '',
  currency: '',
})

const vatRate = 0.1
const totalData = computed(() => {
  const subtotal = orderData.value.reduce((acc, item) => {
    return acc + item.quantity * item.rate
  }, 0)

  const discount = orderData.value.reduce((acc, item) => {
    return acc + (item.quantity * item.rate * item.discount) / 100
  }, 0)

  const vatValue = orderData.value.reduce((acc, item: any) => {
    const baseAmount =
      item.quantity * item.rate * (1 - item.discount / 100 ?? 0)
    let tspAmount = 0
    let tvaAmount = 0
    let totalTaxes = 0
    const tsp = item.taxes.filter((el: any) => el.code == 'TSP')
    if (tsp.length == 1) {
      tspAmount = baseAmount * (tsp[0].value / 100 ?? 0)
      totalTaxes += tspAmount
    }

    const tva = item.taxes.filter((el: any) => el.code == 'TVA')
    if (tva.length == 1) {
      tvaAmount = (baseAmount + tspAmount) * (tva[0].value / 100 ?? 0)
      totalTaxes += tvaAmount
    }

    const otherTaxes = item.taxes.filter(
      (el: any) => el.code != 'TSP' && el.code != 'TVA',
    )
    for (let index = 0; index < otherTaxes.length; index++) {
      totalTaxes += baseAmount * (otherTaxes[index].value / 100 ?? 0)
    }
    return acc + totalTaxes
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

// This is where you would send the form data to the server
const onSubmit = handleSubmit(
  async (values) => {
    success.value = false

    // here you have access to the validated form values
    console.log('order-invoice-create-success', values)
    const contractUrl =
      isEdit.value == true
        ? ref(currentOrderInvoice?.contractUrl ?? '')
        : ref('')

    try {
      const isSuccess = ref(false)

      if (pageValue.value == 'order') {
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
      }

      if (pageValue.value == 'order') {
        if (isEdit.value == true) {
          const query2 = computed(() => {
            return {
              action: 'updateOrder',
              token: token.value,
              id: values.order._id,
            }
          })

          const response = await useFetch('/api/sales/orders', {
            method: 'put',
            headers: { 'Content-Type': 'application/json' },
            query: query2,
            body: {
              ...values.order,
              announcer: values.order?.announcer?._id,
              manager: values.order?.commercial?._id,
              org: currentOrg.value,
              contractUrl,
              items: orderData.value,
              amount:
                totalData.value.length > 0
                  ? totalData.value[totalData.value.length - 1].value
                  : 0,
            },
          })
          isSuccess.value = response.data.value?.success
        } else {
          const query2 = computed(() => {
            return {
              action: 'createOrder',
              token: token.value,
            }
          })

          const response = await useFetch('/api/sales/orders', {
            method: 'post',
            headers: { 'Content-Type': 'application/json' },
            query: query2,
            body: {
              ...values.order,
              announcer: values.order?.announcer?._id,
              manager: values.order?.commercial?._id,
              org: currentOrg.value,
              _id: undefined,
              contractUrl,
              items: orderData.value,
              amount:
                totalData.value.length > 0
                  ? totalData.value[totalData.value.length - 1].value
                  : 0,
            },
          })
          isSuccess.value = response.data.value?.success
        }
      } else if (pageValue.value == 'invoice') {
        let totalPaid = 0
        if (isEdit.value == true) {
          const query2 = computed(() => {
            return {
              action: 'updateInvoice',
              token: token.value,
              id: values.order._id,
            }
          })

          const response = await useFetch('/api/sales/invoices', {
            method: 'put',
            headers: { 'Content-Type': 'application/json' },
            query: query2,
            body: {
              ...values.order,
              announcer: values.order?.announcer?._id,
              manager: values.order?.commercial?._id,
              order: selectedOrder.value?._id ?? undefined,
              org: currentOrg.value,
              items: orderData.value,
              paid: totalPaid,
              amount:
                totalData.value.length > 0
                  ? totalData.value[totalData.value.length - 1].value
                  : 0,
            },
          })
          isSuccess.value = response.data.value?.success
        } else {
          const query2 = computed(() => {
            return {
              action: 'createInvoice',
              token: token.value,
            }
          })

          const response = await useFetch('/api/sales/invoices', {
            method: 'post',
            headers: { 'Content-Type': 'application/json' },
            query: query2,
            body: {
              ...values.order,
              announcer: values.order?.announcer?._id,
              manager: values.order?.commercial?._id,
              _id: undefined,
              order: selectedOrder.value?._id ?? undefined,
              org: currentOrg.value,
              items: orderData.value,
              paid: totalPaid,
              amount:
                totalData.value.length > 0
                  ? totalData.value[totalData.value.length - 1].value
                  : 0,
            },
          })
          isSuccess.value = response.data.value?.success
        }
      }

      if (isSuccess) {
        success.value = true
        toaster.clearAll()
        toaster.show({
          title: 'Success',
          message:
            isEdit.value == false
              ? `Création réussie !`
              : `Mise à jour réussie`,
          color: 'success',
          icon: 'ph:check',
          closable: true,
        })
        // resetForm()
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
    console.log('order-create-error', error)

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
          class="text-primary-500 dark:text-primary-500"
        >
          {{ pageTitle }}
        </BaseHeading>
      </template>
      <template #right>
        <BaseHeading
          as="h5"
          size="sm"
          weight="medium"
          lead="tight"
          class="text-muted-500 dark:text-muted-200"
        >
          Entreprise :
        </BaseHeading>
        <div class="text-muted-800 dark:text-muted-100 font-medium !w-64">
          <BaseListbox
            label=""
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
        </div>
        <BaseButton
          v-if="pageType == 'new'"
          color="primary"
          class="w-full sm:w-40"
          @click="onSubmit"
        >
          <Icon name="ph:pen" class="h-4 w-4" />
          <span>Créer</span>
        </BaseButton>
        <BaseButton
          v-if="pageType == 'edit'"
          color="primary"
          class="w-full sm:w-32"
          @click="onSubmit"
        >
          <Icon name="ph:pen" @click="onSubmit" class="h-4 w-4" />
          <span>Sauvegarder</span>
        </BaseButton>
        <BaseButton
          v-if="isEdit && packageId"
          color="info"
          class="w-full sm:w-32"
          :to="'/bo/pub/package-details/' + packageId"
        >
          <Icon name="ph:file" class="h-4 w-4" />
          <span>Planning</span>
        </BaseButton>
        <BaseButton
          v-if="isEdit && !packageId"
          color="info"
          class="w-full sm:w-32"
          @click="isModalCreatePackageOpen = true"
        >
          <Icon name="ph:file" class="h-4 w-4" />
          <span>Planning</span>
        </BaseButton>
        <BaseButton
          v-if="isEdit"
          :disabled="currentOrderInvoice.validator ? true : false"
          color="warning"
          class="w-full sm:w-32"
          @click="isModalConfirmOrderOpen = true"
        >
          <Icon name="ph:check" class="h-4 w-4" />
          <span>Valider</span>
        </BaseButton>
      </template>
      <form method="POST" action="" @submit.prevent="onSubmit">
        <div class="mx-auto max-w-5xl py-5">
          <div class="mb-4 flex items-center justify-between">
            <div>
              <BaseHeading as="h2" size="xl" weight="medium" lead="none">
                {{ pageValue == 'order' ? 'Devis' : 'Facture' }}
                {{
                  currentOrderInvoice.validator
                    ? pageValue == 'order'
                      ? 'Confirmé'
                      : 'Confirmée'
                    : 'Brouillon'
                }}
                {{ isEdit ? ' - ' + currentOrderInvoice?.code : '' }}
              </BaseHeading>
            </div>
            <div class="flex items-center justify-end gap-3">
              <BaseButtonIcon
                v-if="pageValue == 'invoice'"
                @click="isModalCreatePaymentOpen = true"
                condensed
                shape="full"
                data-tooltip="Ajouter un règlement"
              >
                <Icon name="ph:money-duotone" class="h-4 w-4" />
              </BaseButtonIcon>
              <BaseButtonIcon
                @click="viewOrder()"
                condensed
                shape="full"
                data-tooltip="Prévisualiser"
              >
                <Icon name="ph:eye-duotone" class="h-4 w-4" />
              </BaseButtonIcon>
              <BaseButtonIcon
                condensed
                shape="full"
                @click="printOrder()"
                data-tooltip="Imprimer"
              >
                <Icon name="ph:printer-duotone" class="h-4 w-4" />
              </BaseButtonIcon>
            </div>
          </div>
          <div id="print-invoice">
            <BaseCard>
              <div class="overflow-hidden font-sans">
                <div
                  v-if="isPrint"
                  class="border-muted-200 dark:border-muted-700 flex justify-between gap-y-4 border-b px-8 py-4 items-center"
                >
                  <div class="flex items-center gap-4">
                    <img class="h-32 fit-content" src="/uploads/logos/c2.png" />
                    <div class="">
                      <BaseHeading
                        as="h3"
                        size="md"
                        weight="medium"
                        lead="none"
                      >
                      </BaseHeading>
                      <BaseParagraph size="xs" class="text-muted-400">
                        <!-- {{ currentOrg?.name }} -->
                      </BaseParagraph>
                    </div>
                  </div>
                  <div class="flex justify-end">
                    <div
                      class="text-muted-500 dark:text-muted-400 text-sm font-light"
                    >
                      <p
                        class="text-muted-700 dark:text-muted-100 text-right text-sm font-normal"
                      >
                        {{ currentOrg?.name }}
                      </p>
                      <p class="text-xs text-right">
                        {{ currentOrg?.address }}
                      </p>
                      <p class="text-xs text-right">
                        {{ currentOrg?.country?.name }}
                      </p>
                      <p class="text-xs text-right">
                        {{ currentOrg?.email }}
                      </p>
                    </div>
                  </div>
                </div>

                <div
                  v-if="isPrint"
                  class="border-muted-200 dark:border-muted-700 flex justify-between gap-y-2 border-b p-4 items-center"
                >
                  <div class="flex items-center gap-4">
                    <div class="">
                      <BaseHeading
                        as="h1"
                        size="xl"
                        weight="medium"
                        lead="none"
                      >
                        {{ pageValue == 'order' ? 'Devis' : 'Facture' }} No:
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
                        {{ currentOrderInvoice?.code }}
                      </p>
                    </div>
                  </div>
                </div>

                <div
                  v-if="isPrint"
                  class="border-muted-200 dark:border-muted-700 flex justify-between gap-y-8 border-b p-8 items-center"
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
                          {{ currentOrderInvoice?.announcer?.name }}
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
                        <p class="text-xs">
                          {{
                            currentOrderInvoice?.announcer?.country?.name ??
                            'Douala'
                          }}
                        </p>
                        <p class="mt-2 text-xs">
                          {{ currentOrderInvoice?.announcer?.phone }}
                        </p>
                        <p class="mt-2 text-xs">
                          {{ currentOrderInvoice?.announcer?.email }}
                        </p>
                        <p class="mt-2 text-xs">
                          {{ currentOrderInvoice?.announcer?.rc }}
                        </p>
                        <p class="mt-2 text-xs">
                          {{ currentOrderInvoice?.announcer?.nc }}
                        </p>
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
                      <p class="text-xs">
                        {{
                          new Date(
                            currentOrderInvoice?.createdAt,
                          ).toLocaleDateString('fr-FR')
                        }}
                      </p>
                      <p class="mt-2 text-xs">
                        {{ currentOrderInvoice?.label }}
                      </p>
                      <p class="mt-2 text-xs">29/11/2023</p>
                    </div>
                  </div>
                </div>
                <!--  -->
                <div
                  v-if="!isPrint"
                  shape="curved"
                  class="bg-muted-50 dark:bg-muted-800/60 space-y-8 p-5 md:px-5"
                >
                  <div class="mx-auto flex w-full flex-col">
                    <div>
                      <div class="grid grid-cols-12 gap-4">
                        <div
                          v-if="pageValue == 'invoice'"
                          class="ltablet:col-span-6 col-span-12 lg:col-span-6"
                        >
                          <BaseListbox
                            label="Devis"
                            :items="allOrders?.data"
                            :properties="{
                              value: '_id',
                              label: 'code',
                              sublabel: 'label',
                            }"
                            v-model="selectedOrder"
                            :error="errorMessage"
                            :disabled="isSubmitting || isEdit"
                          />
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
                            name="order.announcer"
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
                            name="order.label"
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
                            name="order.paymentCondition"
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
                            name="order.commercial"
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
                            name="order.team"
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
                            name="order.status"
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
                                authStore.user?.appRole?.name != UserRole.sale)
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
                            v-if="!isPrint"
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
                            v-if="!isPrint"
                            scope="col"
                            class="text-muted-400 py-3.5 pe-3 ps-4 text-center text-xs font-medium uppercase sm:ps-6 md:ps-0"
                          >
                            Compte
                          </th>
                          <th
                            scope="col"
                            class="text-muted-400 px-3 py-3.5 text-right text-xs font-medium uppercase sm:table-cell"
                          >
                            Quantité
                          </th>
                          <th
                            scope="col"
                            class="text-muted-400 px-3 py-3.5 text-center text-xs font-medium uppercase sm:table-cell"
                          >
                            U.M
                          </th>
                          <th
                            scope="col"
                            class="text-muted-400 px-3 py-3.5 text-right text-xs font-medium uppercase sm:table-cell"
                          >
                            Prix Unitaire
                          </th>
                          <th
                            scope="col"
                            class="text-muted-400 px-3 py-3.5 text-right text-xs font-medium uppercase sm:table-cell"
                          >
                            Remise(%)
                          </th>
                          <th
                            scope="col"
                            class="text-muted-400 px-3 py-3.5 text-center text-xs font-medium uppercase sm:table-cell"
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
                          <td
                            v-if="!isPrint"
                            class="py-4 pe-3 ps-4 text-sm sm:ps-6 md:ps-0"
                          >
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
                            class="text-muted-500 dark:text-muted-400 px-3 py-4 text-left text-sm sm:table-cell"
                          >
                            {{ item.id + 1 }}
                          </td>
                          <td
                            class="text-muted-500 dark:text-muted-400 px-3 py-4 text-left text-sm sm:table-cell"
                          >
                            {{ item.article.code }}
                          </td>
                          <td
                            class="text-muted-500 dark:text-muted-400 px-3 py-4 text-left text-sm sm:table-cell"
                          >
                            {{ item.description }}
                          </td>
                          <td
                            v-if="!isPrint"
                            class="px-3 py-4 text-center text-sm sm:table-cell"
                          >
                            7011
                          </td>
                          <td
                            class="text-muted-400 px-1 py-4 text-center text-sm sm:table-cell"
                          >
                            {{ item.quantity }}
                          </td>
                          <td
                            class="text-muted-400 px-3 py-4 text-center text-sm sm:table-cell"
                          >
                            {{ item.unit }}
                          </td>
                          <td
                            class="text-muted-400 px-3 py-4 text-center text-sm sm:table-cell"
                          >
                            {{ item.rate }}
                          </td>
                          <td
                            class="text-muted-400 px-3 py-4 text-center text-sm sm:table-cell"
                          >
                            {{ item.discount }} %
                          </td>
                          <td
                            class="text-muted-400 px-3 py-4 text-center text-sm sm:table-cell"
                          >
                            <p v-if="item.taxes.length > 0">
                              {{ item.taxes[0]?.code }} :
                              {{ item.taxes[0]?.value }} %
                            </p>
                            <p v-if="item.taxes.length > 1">
                              {{ item.taxes[1]?.code }} :
                              {{ item.taxes[1]?.value }} %
                            </p>
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
                          v-if="!isPrint"
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
                            <div class="flex justify-center">
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
                                  name="order.account"
                                >
                                  <BaseListbox
                                    label=""
                                    :items="accounts.data"
                                    :classes="{
                                      wrapper: 'w-16',
                                    }"
                                    :properties="{
                                      value: '_id',
                                      label: 'code',
                                      sublabel: 'label',
                                      media: '',
                                    }"
                                    v-model="curOrderItem.account"
                                    :error="errorMessage"
                                    :disabled="isSubmitting"
                                    @update:model-value="handleChange"
                                    @blur="handleBlur"
                                  />
                                </Field>
                              </div>
                            </div>
                          </td>
                          <td
                            class="hidden px-3 py-4 text-right text-sm sm:table-cell"
                          >
                            <div class="flex justify-center">
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
                            class="text-muted-800 dark:text-muted-100 py-4 pe-4 ps-3 text-center text-sm sm:pe-6 md:pe-0"
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
                            class="text-muted-800 dark:text-muted-100 py-4 pe-4 ps-3 text-center text-sm sm:pe-6 md:pe-0"
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
                            class="text-muted-800 dark:text-muted-100 py-4 pe-4 ps-3 text-center text-sm sm:pe-6 md:pe-0"
                          >
                            <BaseListbox
                              v-model="curOrderItem.taxes"
                              label=""
                              :items="taxes.data"
                              placeholder=""
                              :multiple-label="
                              (value: any[], labelProperty?: string) => { 
                                if (value.length === 0) { return 'Vide'; } else if (value.length > 1) { return `${value.length} elements`; } 
                                return labelProperty ? String(value?.[0]?.[labelProperty]) :  String(value?.[0])+' : '+String(value?.[1]); }"
                              :properties="{
                                value: '_id',
                                label: 'code',
                                sublabel: 'value',
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
                  <BaseParagraph size="xs">
                    Termes de paiement :
                    {{ currentOrderInvoice?.paymentCondition }}
                  </BaseParagraph>
                  <div
                    class="border-muted-200 dark:border-muted-700 border-t pt-8"
                  >
                    <div class="text-muted-400">
                      <BaseParagraph size="xs">
                        Termes de paiement :
                        {{ currentOrderInvoice?.paymentCondition }}
                      </BaseParagraph>
                      <BaseParagraph size="xs">
                        Commentaire : {{ currentOrderInvoice?.label }}
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
            Confirmation
            {{ pageValue == 'order' ? 'du devis' : 'de la facture' }}
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
            Voulez-vous confirmer
            {{ pageValue == 'order' ? 'le devis' : 'la facture' }}
            <span class="text-primary-500">{{
              currentOrderInvoice.label
            }}</span>
            de
            <span class="text-primary-500"
              >{{ currentOrderInvoice?.announcer?.name }}
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

    <!-- Modal create package -->
    <TairoModal
      :open="isModalCreatePackageOpen"
      size="sm"
      @close="isModalCreatePackageOpen = false"
    >
      <template #header>
        <!-- Header -->
        <div class="flex w-full items-center justify-between p-4 md:p-6">
          <h3
            class="font-heading text-muted-900 text-lg font-medium leading-6 dark:text-white"
          >
            Création du package
          </h3>

          <BaseButtonClose @click="isModalCreatePackageOpen = false" />
        </div>
      </template>

      <!-- Body -->
      <div class="p-4 md:p-6">
        <div class="mx-auto w-full max-w-xs text-center">
          <h3
            class="font-heading text-muted-800 text-lg font-medium leading-6 dark:text-white"
          >
            Voulez-vous créer le package pour le devis
            <span class="text-primary-500">{{
              currentOrderInvoice.label
            }}</span>
            de
            <span class="text-primary-500"
              >{{ currentOrderInvoice?.announcer?.name }}
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
            <BaseButton @click="isModalCreatePackageOpen = false"
              >Annuler</BaseButton
            >

            <BaseButton color="primary" flavor="solid" @click="createPackage()"
              >Valider</BaseButton
            >
          </div>
        </div>
      </template>
    </TairoModal>

    <!-- Modal create payment -->
    <TairoModal
      :open="isModalCreatePaymentOpen"
      size="xl"
      @close="isModalCreatePaymentOpen = false"
    >
      <template #header>
        <!-- Header -->
        <div class="flex w-full items-center justify-between p-4 md:p-6">
          <h3
            class="font-heading text-muted-900 text-lg font-medium leading-6 dark:text-white"
          >
            Nouveau paiement
          </h3>

          <BaseButtonClose @click="isModalCreatePaymentOpen = false" />
        </div>
      </template>

      <!-- Body -->
      <BaseCard class="w-full">
        <div class="divide-muted-200 dark:divide-muted-700">
          <div
            shape="curved"
            class="bg-muted-50 dark:bg-muted-800/60 space-y-8 p-5 md:px-5"
          >
            <div class="mx-auto flex w-full flex-col">
              <div>
                <div>
                  <div class="grid grid-cols-12 gap-4">
                    <div class="ltablet:col-span-12 col-span-12 lg:col-span-6">
                      <BaseListbox
                        label="Journal des reglements"
                        :items="accounts?.data"
                        :properties="{
                          value: '_id',
                          label: 'label',
                          sublabel: 'code',
                        }"
                        v-model="curInvoicePaymentForm.account"
                        :error="errorMessage"
                        :disabled="isSubmitting"
                        @update:model-value="handleChange"
                        @blur="handleBlur"
                      />
                    </div>
                    <div class="ltablet:col-span-12 col-span-12 lg:col-span-6">
                      <DatePicker
                        v-model.range="dates"
                        :masks="masks"
                        :min-date="new Date()"
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
                                  shape="rounded"
                                  label="Date de l'operation"
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
                          </div>
                        </template>
                      </DatePicker>
                    </div>
                  </div>
                  <div class="col-span-12 sm:col-span-6 mt-2">
                    <Field
                      v-slot="{ field, errorMessage, handleChange, handleBlur }"
                      name="operation.label"
                    >
                      <BaseInput
                        label="Libéllé"
                        icon="ph:note"
                        placeholder="Ex: virement"
                        v-model="curInvoicePaymentForm.label"
                        :error="errorMessage"
                        :disabled="isSubmitting"
                        type="text"
                        @update:model-value="handleChange"
                        @blur="handleBlur"
                      />
                    </Field>
                  </div>
                  <!-- <div class="grid grid-cols-12 gap-4 mt-2">
                    <div class="ltablet:col-span-12 col-span-12 lg:col-span-6">
                      <Field
                        v-slot="{
                          field,
                          errorMessage,
                          handleChange,
                          handleBlur,
                        }"
                        name="operation.currency"
                      >
                        <BaseListbox
                          label="Devise"
                          :items="currenciesData?.data"
                          :properties="{
                            value: '_id',
                            label: 'name',
                            sublabel: 'rate',
                            media: '',
                          }"
                         v-model="curInvoicePaymentForm.currency"
                          :error="errorMessage"
                          :disabled="isSubmitting"
                          @update:model-value="handleChange"
                          @blur="handleBlur"
                        />
                      </Field>
                    </div>
                  </div> -->
                  <div class="col-span-12 sm:col-span-6 mt-2">
                    <Field
                      v-slot="{ field, errorMessage, handleChange, handleBlur }"
                      name="operation.amount"
                    >
                      <BaseInput
                        label="Montant"
                        icon="ph:money"
                        placeholder="Ex: 500 000 000"
                        v-model="curInvoicePaymentForm.amount"
                        :error="errorMessage"
                        :disabled="isSubmitting"
                        type="number"
                        @update:model-value="handleChange"
                        @blur="handleBlur"
                      />
                    </Field>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </BaseCard>
      <template #footer>
        <!-- Footer -->
        <div class="p-4 md:p-6">
          <div class="flex gap-x-2">
            <BaseButton @click="isModalCreatePaymentOpen = false"
              >Annuler</BaseButton
            >

            <BaseButton
              color="primary"
              flavor="solid"
              @click="addInvoicePayment()"
            >
              Créer
            </BaseButton>
          </div>
        </div>
      </template>
    </TairoModal>
  </div>
</template>
