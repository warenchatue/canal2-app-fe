<script setup lang="ts">
import { toTypedSchema } from '@vee-validate/zod'
import moment from 'moment'
import { ToWords } from 'to-words'
import { DatePicker } from 'v-calendar'
import { Field, useForm } from 'vee-validate'
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
const perPage = ref(12000)
const isEdit = ref(false)
const isPrint = ref(false)
const isLoading = ref(false)
const currentOrderInvoice = ref({})
const token = useCookie('token')
const isModalCreatePackageOpen = ref(false)
const isModalConfirmOrderOpen = ref(false)
const isModalConfirmInvoiceOpen = ref(false)
const isModalCreatePaymentOpen = ref(false)
const isModalCreateTaxOpen = ref(false)
const currentOrg = ref({})
const packageId = ref('')
const selectedOrder = ref({})
const dates = ref({
  start: new Date(),
  end: new Date(),
})
// Check if can have access
if (
  authStore.user.appRole?.name != UserRole.sale &&
  authStore.user.appRole?.name != UserRole.adminSale &&
  authStore.user.appRole?.name != UserRole.mediaPlanner &&
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

const queryLight = computed(() => {
  return {
    filter: filter.value,
    perPage: perPage.value,
    page: page.value,
    action: 'findAllLight',
    token: token.value,
  }
})

// const { data: allOrders } = await useFetch('/api/sales/orders', {
//   query,
// })

// const { data: announcers, pending: pendingAnnouncer } = await useFetch(
//   '/api/sales/announcers',
//   {
//     query: queryLight,
//     lazy: false,
//   },
// )

const { data: articles } = await useFetch('/api/sales/articles', {
  query,
})

const { data: orgs } = await useFetch('/api/admin/orgs', {
  query,
})

const { data: taxes } = await useFetch('/api/accountancy/taxes', {
  query,
})

const { data: accounts, pending: pendingAccounts } = await useFetch(
  '/api/accountancy/accounts',
  {
    query: queryLight,
    lazy: true,
    transform: (els) => {
      return els.data?.filter((el: any) => {
        return el.position == 'd'
      })
    },
  },
)

const { data: paymentMethods } = await useFetch(
  '/api/accountancy/payment-methods',
  {
    query,
  },
)

const { data: paymentConditions } = await useFetch(
  '/api/accountancy/payment-conditions',
  {
    query,
  },
)

const { data: allUsers } = await useFetch('/api/users', {
  query,
})

const commercials = allUsers.value?.data.filter((e: any) => {
  return (
    e.appRole?.name == UserRole.sale ||
    e.appRole?.name == UserRole.billing ||
    e.appRole?.name == UserRole.admin
  )
})

// const finalOrders = allOrders.value?.data.filter((e: any) => {
//   return e.validator
// })

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
if (pageType.value == 'view' || pageType.value == 'edit') {
  if (pageValue.value == 'order') {
    pageTitle = 'Mise à jour Devis'
  } else if (pageValue.value == 'invoice') {
    pageTitle = 'Mise à jour Facture'
  }
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
    const { data: singleOrder } = await useFetch('/api/sales/orders', {
      query,
    })
    if (singleOrder.value?.success) {
      currentOrderInvoice.value = singleOrder.value?.data
      packageId.value = currentOrderInvoice.value?.package?._id ?? undefined
      editOrderInvoiceFile(currentOrderInvoice.value)
    }
  } else if (pageValue.value == 'invoice') {
    const { data: singleOrder } = await useFetch('/api/sales/invoices', {
      query,
    })
    if (singleOrder.value?.success) {
      currentOrderInvoice.value = singleOrder.value?.data
      packageId.value =
        currentOrderInvoice.value.order?.package?._id ?? undefined
      selectedOrder.value = currentOrderInvoice.value.order
      if (currentOrderInvoice.value.order) {
        selectedOrder.value.id =
          currentOrderInvoice.value.order?._id ?? undefined
        selectedOrder.value.name = currentOrderInvoice.value.order?.code ?? ''
      }
      editOrderInvoiceFile(currentOrderInvoice.value)
    }
  }
  if (pageType.value == 'view') {
    isPrint.value = true
  } else {
    isEdit.value = true
  }
}

watch(selectedOrder, (value) => {
  setTimeout(async () => {
    const query = computed(() => {
      return {
        filter: filter.value,
        perPage: perPage.value,
        page: page.value,
        action: 'findOne',
        id: value.id!,
        token: token.value,
      }
    })
    const { data: singleOrder } = await useFetch('/api/sales/orders', {
      query,
    })
    if (singleOrder.value?.success) {
      editOrderInvoiceFile(singleOrder.value.data, true)
    }
  }, 500)
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

async function refreshData() {
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
    // const { data: singleOrder } = await useFetch('/api/sales/orders', {
    //   query,
    // })
    const singleOrder = await $fetch(
      '/api/sales/orders?action=findOne&token=' +
        token.value +
        '&id=' +
        pageId.value,
      {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      },
    )
    if (singleOrder.value?.success) {
      currentOrderInvoice.value = singleOrder.value?.data
      packageId.value = currentOrderInvoice.value?.package?._id ?? undefined
      editOrderInvoiceFile(currentOrderInvoice.value)
    }
  } else if (pageValue.value == 'invoice') {
    // const { data: singleOrder } = await useFetch('/api/sales/invoices', {
    //   query,
    // })
    const singleOrder = await $fetch(
      '/api/sales/invoices?action=findOne&token=' +
        token.value +
        '&id=' +
        pageId.value,
      {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      },
    )
    console.log(singleOrder)
    if (singleOrder?.success) {
      currentOrderInvoice.value = singleOrder?.data
      packageId.value =
        currentOrderInvoice.value.order?.package?._id ?? undefined
      selectedOrder.value = currentOrderInvoice.value.order
      editOrderInvoiceFile(currentOrderInvoice.value)
    }
  }
}

async function viewOrder() {
  setTimeout(() => {
    isPrint.value = !isPrint.value
    editOrderInvoiceFile(currentOrderInvoice.value)
  }, 500)
}

async function addInvoicePayment() {
  ;[2]
  const query2 = computed(() => {
    return {
      action: 'addInvoicePayment',
      token: token.value,
      id: currentOrderInvoice.value._id,
    }
  })

  isLoading.value = true

  const response = await useFetch('/api/sales/invoices', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    query: query2,
    body: {
      ...curInvoicePaymentForm.value,
      status: 'completed',
      paymentAccount: curInvoicePaymentForm.value.paymentAccount._id,
      org: currentOrg?.value?._id,
      announcer: currentOrderInvoice?.value?.announcer._id,
      data: {
        invoiceId: currentOrderInvoice.value._id,
        invoiceCode: currentOrderInvoice.value.code,
        city: currentOrderInvoice.value.team,
      },
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
    isLoading.value = false
    currentOrderInvoice.value.transactions =
      response.data?.value.data.transactions
    // location.reload()
    // await refreshData()
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

async function addInvoiceTaxes() {
  const query2 = computed(() => {
    return {
      action: 'addInvoiceTaxes',
      token: token.value,
      id: currentOrderInvoice.value._id,
    }
  })

  const response = await useFetch('/api/sales/invoices', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    query: query2,
    body: {
      ...curInvoiceTaxForm.value,
      date: dates.value.start,
    },
  })

  if (response.data?.value?.success) {
    success.value = true
    toaster.clearAll()
    toaster.show({
      title: 'Success',
      message: `Taxe crée !`,
      color: 'success',
      icon: 'ph:check',
      closable: true,
    })
    isModalCreateTaxOpen.value = false
    filter.value = 'taxes'
    filter.value = ''
    location.reload()
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
function editOrderInvoiceFile(currentOrderInvoice: any, isFromOrder = false) {
  if (isFromOrder == false) {
    dates.value.start = new Date(currentOrderInvoice.date)
    dates.value.end = new Date(currentOrderInvoice.date)
  }
  setTimeout(() => {
    setFieldValue('order._id', currentOrderInvoice._id)
    setFieldValue('order.label', currentOrderInvoice.label)
    setFieldValue('order.description', currentOrderInvoice.description)
    setFieldValue('order.note', currentOrderInvoice.note)
    setFieldValue('order.team', currentOrderInvoice.team)
    setFieldValue('order.announcer', {
      id: currentOrderInvoice.announcer._id,
      name: currentOrderInvoice.announcer.name,
    })
    if (isFromOrder == false) {
      setFieldValue('order.commercial', currentOrderInvoice.manager)
    }
    setFieldValue('order.status', currentOrderInvoice.status)
    setFieldValue('order.paymentMethod', currentOrderInvoice.paymentMethod)
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
      title: 'Désolé',
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
    location.reload()
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

async function confirmOrder() {
  const query4 = computed(() => {
    return {
      action: pageValue.value == 'order' ? 'updateOrder' : 'updateInvoice',
      token: token.value,
      id: currentOrderInvoice.value._id,
    }
  })
  const userValidator = authStore.user._id

  const response = await useFetch(
    pageValue.value == 'order' ? '/api/sales/orders' : '/api/sales/invoices',
    {
      method: 'put',
      headers: { 'Content-Type': 'application/json' },
      query: query4,
      body: { ...currentOrderInvoice.value, validator: userValidator },
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
    // location.reload()
    currentOrderInvoice.value.validator = authStore.user._id
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

async function confirmInvoice() {
  const query4 = computed(() => {
    return {
      action: pageValue.value == 'order' ? 'updateOrder' : 'updateInvoice',
      token: token.value,
      id: currentOrderInvoice.value._id,
    }
  })
  const userValidator = authStore.user._id

  const response = await useFetch(
    pageValue.value == 'order' ? '/api/sales/orders' : '/api/sales/invoices',
    {
      method: 'put',
      headers: { 'Content-Type': 'application/json' },
      query: query4,
      body: { ...currentOrderInvoice.value, adminValidator: userValidator },
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
    isModalConfirmInvoiceOpen.value = false
    // location.reload()
    currentOrderInvoice.value.adminValidator = authStore.user._id
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

async function filterItems(query?: string, items?: any[]) {
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
async function filterOrdersItems(query?: string, items?: any[]) {
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
      action: 'findAllLightByCode',
      name: query,
      token: token.value,
    }
  })

  const { data: announcersData } = await useFetch('/api/sales/orders', {
    query: queryLightByName,
  })

  // search by name
  return announcersData.value?.data ?? false
}

// function filterItems(query?: string, items?: any[]) {
//   if (query.length < 3) {
//     return []
//   }

//   if (!query || !items) {
//     return items ?? []
//   }

//   // search by name
//   return items.filter((item) => {
//     const nameMatches = item?.name?.toLowerCase().includes(query.toLowerCase())
//     // const textMatches = item?.text?.toLowerCase().includes(query.toLowerCase())
//     return nameMatches
//   })
// }

const currentPackage = ref({})

// This is the object that will contain the validation messages
const ONE_MB = 1000000
const VALIDATION_TEXT = {
  LABEL_REQUIRED: 'Ce champ est obligatoire',
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
      label: z.string().optional(),
      description: z.string().optional(),
      note: z.string().optional(),
      amount: z.number(),
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
      paymentMethod: z
        .object({
          _id: z.string(),
          label: z.string(),
          description: z.string(),
        })
        .optional()
        .nullable(),
      paymentCondition: z
        .object({
          _id: z.string(),
          label: z.string(),
          delay: z.number(),
          description: z.string(),
        })
        .optional()
        .nullable(),
      announcer: z.object({
        id: z.string(),
        name: z.string(),
        email: z.string().optional(),
      }),
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
    if (!data.order.paymentMethod) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: VALIDATION_TEXT.LABEL_REQUIRED,
        path: ['order.paymentMethod'],
      })
      if (!data.order.announcer) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: VALIDATION_TEXT.LABEL_REQUIRED,
          path: ['order.announcer'],
        })
      }
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
    team: authStore.user?.team ?? 'douala',
    status: 'onHold',
    announcer: {
      id: '',
      email: '',
      name: '',
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

function addOrderItem() {
  orderData.value.push({ ...curOrderItem.value, id: orderData.value.length })
  curOrderItem.value = {
    id: 0,
    article: '',
    description: '',
    account: '7011',
    quantity: 0,
    unit: 'unité(s)',
    rate: 0,
    discount: 0,
    taxes: [],
    amount: 0,
  }
}

function deleteOrderItem(id: number) {
  orderData.value = orderData.value?.filter((e: any) => {
    return e.id != id
  })
}

function editOrderItem(item: any) {
  curOrderItem.value = { ...item }
  isEditOrderItem.value = true
}

function updateOrderItem(item: any) {
  orderData.value[item.id] = item
  isEditOrderItem.value = false
}

const orderData = ref([])
const isEditOrderItem = ref(false)
const curOrderItem = ref({
  id: 0,
  article: '',
  description: '',
  account: '7011',
  quantity: 0,
  unit: 'unité(s)',
  rate: 0,
  discount: 0,
  taxes: [],
  amount: 0,
})

watch(curOrderItem, (value) => {
  setTimeout(() => {
    console.log('value')
    if (curOrderItem.value.article != value.article) {
      curOrderItem.value.rate = value.article.price
    }
  }, 500)
})

const curInvoicePaymentForm = ref({
  paymentAccount: {},
  label: '',
  amount:
    (currentOrderInvoice.value?.amount ?? 0) -
    (currentOrderInvoice.value?.paid ?? 0),
  date: new Date(),
  currency: '',
})

const curInvoiceTaxForm = ref({
  account: {},
  label: '',
  amount:
    (currentOrderInvoice.value?.tva ?? 0) +
    (currentOrderInvoice.value?.tsp ?? 0),
  date: new Date(),
})

const totalData = computed(() => {
  const subtotal = orderData.value.reduce((acc, item) => {
    return acc + item.quantity * item.rate
  }, 0)

  const discount = orderData.value.reduce((acc, item) => {
    return acc + (item.quantity * item.rate * item.discount) / 100
  }, 0)

  const tspValue = orderData.value.reduce((acc, item: any) => {
    const baseAmount =
      item.quantity * item.rate * (1 - item.discount / 100 ?? 0)
    let tspAmount = 0
    const tsp = item.taxes.filter((el: any) => el.code == 'TSP')
    if (tsp.length == 1) {
      tspAmount += baseAmount * (tsp[0].value / 100 ?? 0)
    }
    return acc + tspAmount
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

  const total = subtotal - discount + tspValue + vatValue

  return [
    {
      label: 'Total Brut',
      value: subtotal,
    },
    {
      label: 'Remise',
      value: Math.ceil(discount),
    },
    {
      label: 'Total HT',
      value: Math.ceil(subtotal - discount),
    },
    {
      label: 'TSP',
      value: Math.ceil(tspValue),
    },
    {
      label: 'TVA',
      value: Math.ceil(vatValue),
    },
    {
      label: 'Montant TTC',
      value: Math.ceil(total),
    },
    {
      label: 'Montant Dû',
      value: Math.ceil(total - (currentOrderInvoice.value?.paid ?? 0)),
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
      const orderInvoiceId = ref(undefined)

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

          const { data: uploadData } = await useFetch('/api/files/upload', {
            method: 'POST',
            query: query3,
            body: fd,
          })
          console.log(uploadData)
          if (uploadData.value?.success == false) {
            contractUrl.value = ''
            toaster.show({
              title: 'Désolé',
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
              paymentMethod: values.order?.paymentMethod?._id,
              paymentCondition: values.order?.paymentCondition?._id,
              announcer: values.order?.announcer?.id,
              manager: values.order?.commercial?._id,
              org: currentOrg.value,
              contractUrl,
              items: orderData.value,
              date: dates.value?.start ?? new Date(),
              dueDate: moment(dates.value?.start ?? new Date()).add(
                values.order?.paymentCondition?.delay ?? 0,
                'days',
              ),
              amountHT:
                totalData.value.length > 0
                  ? totalData.value[totalData.value.length - 5].value
                  : 0,
              amount:
                totalData.value.length > 0
                  ? totalData.value[totalData.value.length - 2].value
                  : 0,
            },
          })
          isSuccess.value = response.data.value?.success
          orderInvoiceId.value = response.data.value?.data._id
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
              paymentMethod: values.order?.paymentMethod?._id,
              paymentCondition: values.order?.paymentCondition?._id,
              announcer: values.order?.announcer?.id,
              manager: values.order?.commercial?._id,
              org: currentOrg.value,
              _id: undefined,
              contractUrl,
              items: orderData.value,
              date: dates.value?.start ?? new Date(),
              dueDate: moment(dates.value?.start ?? new Date()).add(
                values.order?.paymentCondition?.delay ?? 0,
                'days',
              ),
              amountHT:
                totalData.value.length > 0
                  ? totalData.value[totalData.value.length - 5].value
                  : 0,
              amount:
                totalData.value.length > 0
                  ? totalData.value[totalData.value.length - 2].value
                  : 0,
            },
          })
          isSuccess.value = response.data.value?.success
          orderInvoiceId.value = response.data.value?.data._id
        }
      } else if (pageValue.value == 'invoice') {
        let totalPaid = 0
        if (isEdit.value == true) {
          totalPaid = currentOrderInvoice.value?.transactions
            ?.map((item) => item.amount)
            .reduce((acc, item) => {
              return acc + item
            }, 0)

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
              paymentMethod: values.order?.paymentMethod?._id,
              paymentCondition: values.order?.paymentCondition?._id,
              announcer: values.order?.announcer?.id,
              manager: values.order?.commercial?._id,
              order: selectedOrder.value?.id ?? undefined,
              org: currentOrg.value,
              items: orderData.value,
              paid: totalPaid,
              date: dates.value?.start ?? new Date(),
              dueDate: moment(dates.value?.start ?? new Date()).add(
                values.order?.paymentCondition?.delay ?? 0,
                'days',
              ),
              amountHT:
                totalData.value.length > 0
                  ? totalData.value[totalData.value.length - 5].value
                  : 0,
              tsp:
                totalData.value.length > 0
                  ? totalData.value[totalData.value.length - 4].value
                  : 0,
              tva:
                totalData.value.length > 0
                  ? totalData.value[totalData.value.length - 3].value
                  : 0,
              amount:
                totalData.value.length > 0
                  ? totalData.value[totalData.value.length - 2].value
                  : 0,
            },
          })
          isSuccess.value = response.data.value?.success
          orderInvoiceId.value = response.data.value?.data._id
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
              paymentMethod: values.order?.paymentMethod?._id,
              paymentCondition: values.order?.paymentCondition?._id,
              announcer: values.order?.announcer?.id,
              manager: values.order?.commercial?._id,
              _id: undefined,
              order: selectedOrder.value?.id ?? undefined,
              org: currentOrg.value,
              items: orderData.value,
              paid: totalPaid,
              date: dates.value?.start ?? new Date(),
              dueDate: moment(dates.value?.start ?? new Date()).add(
                values.order?.paymentCondition?.delay ?? 0,
                'days',
              ),
              amountHT:
                totalData.value.length > 0
                  ? totalData.value[totalData.value.length - 5].value
                  : 0,
              tsp:
                totalData.value.length > 0
                  ? totalData.value[totalData.value.length - 4].value
                  : 0,
              tva:
                totalData.value.length > 0
                  ? totalData.value[totalData.value.length - 3].value
                  : 0,
              amount:
                totalData.value.length > 0
                  ? totalData.value[totalData.value.length - 2].value
                  : 0,
            },
          })
          isSuccess.value = response.data.value?.success
          orderInvoiceId.value = response.data.value?.data._id
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
        if (isEdit.value == true) {
          location.reload()
        } else {
          if (pageValue.value == 'order') {
            router.push('/bo/sales/orders/edit-order-' + orderInvoiceId.value)
          } else {
            router.push('/bo/sales/orders/edit-invoice-' + orderInvoiceId.value)
          }
        }
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
          Société :
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
            :disabled="isSubmitting"
          />
        </div>
        <BaseButton
          v-if="pageType == 'new'"
          color="primary"
          class="w-full sm:w-40"
          @click="onSubmit"
          :disabled="isSubmitting"
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
        <!-- <BaseButton
          v-if="isEdit && packageId"
          color="info"
          class="w-full sm:w-32"
          :to="'/bo/pub/package-details/' + packageId"
        >
          <Icon name="ph:file" class="h-4 w-4" />
          <span>Planning</span>
        </BaseButton> -->
        <!-- <BaseButton
          v-if="isEdit && !packageId"
          color="info"
          class="w-full sm:w-32"
          @click="isModalCreatePackageOpen = true"
        >
          <Icon name="ph:file" class="h-4 w-4" />
          <span>Planning</span>
        </BaseButton> -->
        <BaseButton
          v-if="isEdit"
          :disabled="currentOrderInvoice.validator ? true : false"
          :color="currentOrderInvoice.validator ? 'success' : 'warning'"
          class="w-full sm:w-32"
          @click="isModalConfirmOrderOpen = true"
        >
          <Icon name="ph:check" class="h-4 w-4" />
          <span>Valider</span>
        </BaseButton>
        <BaseButton
          v-if="
            authStore.user.appRole?.name == UserRole.superAdmin &&
            isEdit &&
            pageValue != 'order'
          "
          :disabled="currentOrderInvoice.adminValidator ? true : false"
          :color="currentOrderInvoice.adminValidator ? 'success' : 'warning'"
          class="w-full sm:w-44"
          @click="isModalConfirmInvoiceOpen = true"
        >
          <Icon name="ph:check" class="h-4 w-4" />
          <span>Validation DAF</span>
        </BaseButton>
      </template>
      <form method="POST" action="" @submit.prevent="onSubmit">
        <div class="mx-auto max-w-8xl py-5">
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
                v-if="pageValue == 'invoice' && pageType == 'edit'"
                @click="isModalCreatePaymentOpen = true"
                condensed
                shape="xl"
                class="!w-48 !font-semibold"
                data-tooltip="Ajouter un règlement"
              >
                <Icon name="ph:money-duotone" class="h-4 w-6 px-1" /> Ajouter un
                reglement
              </BaseButtonIcon>
              <BaseButtonIcon
                v-if="pageValue == 'invoice' && pageType == 'edit'"
                @click="isModalCreateTaxOpen = true"
                condensed
                shape="xl"
                class="!w-48 !font-semibold"
                data-tooltip="Ajouter une retenue"
              >
                <Icon name="ph:money-duotone" class="h-4 w-6 px-1" /> Ajouter
                une retenue
              </BaseButtonIcon>
              <BaseButtonIcon
                v-if="
                  (authStore.user.appRole?.name == UserRole.sale ||
                    authStore.user.appRole?.name == UserRole.billing ||
                    authStore.user.appRole?.name == UserRole.admin ||
                    authStore.user.appRole?.name == UserRole.superAdmin) &&
                  pageType == 'view' &&
                  pageValue == 'order'
                "
                :to="'/bo/sales/orders/edit-order-' + currentOrderInvoice?._id"
                condensed
                class="!w-32"
                shape="xl"
                data-tooltip="Modifier"
              >
                <Icon name="ph:eye-duotone" class="h-4 w-6 px-1" />
                Modifier
              </BaseButtonIcon>
              <BaseButtonIcon
                v-if="
                  (authStore.user.appRole?.name == UserRole.billing ||
                    authStore.user.appRole?.name == UserRole.admin ||
                    authStore.user.appRole?.name == UserRole.superAdmin) &&
                  pageType == 'view' &&
                  pageValue == 'invoice'
                "
                :to="
                  '/bo/sales/orders/edit-invoice-' + currentOrderInvoice?._id
                "
                condensed
                class="!w-32"
                shape="xl"
                data-tooltip="Modifier"
              >
                <Icon name="ph:eye-duotone" class="h-4 w-6 px-1" />
                Modifier
              </BaseButtonIcon>
              <BaseButtonIcon
                @click="viewOrder()"
                condensed
                class="!w-32 !font-semibold"
                shape="xl"
                data-tooltip="Prévisualiser"
              >
                <Icon name="ph:eye-duotone" class="h-4 w-6 px-1" />
                Prévisualiser
              </BaseButtonIcon>
              <BaseButtonIcon
                condensed
                class="!w-32 !font-semibold"
                shape="xl"
                @click="printOrder()"
                data-tooltip="Imprimer"
              >
                <Icon name="ph:printer-duotone" class="h-4 w-6 px-1" /> Imprimer
              </BaseButtonIcon>
            </div>
          </div>
          <div id="print-invoice" class="">
            <div
              :class="
                isPrint == false
                  ? 'bg-muted-50 dark:bg-muted-800/60 rounded'
                  : ''
              "
            >
              <div class="overflow-hidden font-sans">
                <div
                  v-if="isPrint"
                  class="border-muted-200 dark:border-muted-700 flex justify-between gap-y-4 px-8 pt-4 items-center"
                >
                  <div class="flex items-center gap-4">
                    <img
                      v-if="currentOrg?.logo?.includes('r2')"
                      class="h-16 pb-1 fit-content"
                      :src="currentOrg.logo"
                    />
                    <img
                      v-else
                      class="h-32 max fit-content"
                      :src="currentOrg.logo"
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
                        <!-- {{ currentOrg?.name }} -->
                      </BaseParagraph>
                    </div>
                  </div>
                  <div class="flex justify-end">
                    <div
                      class="text-muted-800 dark:text-muted-400 text-sm font-light"
                    >
                      <p
                        class="text-muted-800 dark:text-muted-100 text-right text-sm font-semibold"
                      >
                        {{ currentOrg?.name }}
                      </p>
                      <p class="text-[10px] text-right">
                        {{ currentOrg?.address }}
                      </p>
                      <p class="text-[10px] text-right">
                        {{ currentOrg?.country?.name }}
                      </p>
                      <p class="text-[10px] text-right">
                        <span class="font-bold">Courriel</span> :
                        <span>{{ currentOrg?.email }}</span>
                      </p>
                    </div>
                  </div>
                </div>

                <div class="px-4">
                  <div
                    v-if="isPrint"
                    class="border-muted-200 dark:border-muted-700 bg-primary-500/20 flex justify-between gap-y-2 p-4 items-center"
                  >
                    <div class="flex items-center gap-4">
                      <div class="">
                        <BaseHeading
                          as="h1"
                          size="2xl"
                          weight="bold"
                          lead="none"
                        >
                          {{ pageValue == 'order' ? 'Devis' : 'Facture' }} No:
                        </BaseHeading>
                      </div>
                    </div>
                    <div class="flex gap-12">
                      <div class="text-muted-900 dark:text-muted-400 text-sm">
                        <BaseHeading
                          as="h1"
                          size="2xl"
                          weight="bold"
                          lead="none"
                        >
                          {{ currentOrderInvoice?.code }}
                        </BaseHeading>
                      </div>
                    </div>
                  </div>
                </div>

                <div
                  v-if="isPrint"
                  class="border-muted-200 dark:border-muted-700 flex justify-between gap-y-8 px-6 py-4 items-center"
                >
                  <div>
                    <div class="flex items-center gap-3">
                      <div class="">
                        <BaseHeading
                          as="h5"
                          size="sm"
                          weight="medium"
                          lead="none"
                        >
                          {{ pageValue == 'order' ? 'Devis' : 'Facture' }} pour:
                        </BaseHeading>
                        <BaseParagraph
                          size="sm"
                          class="text-muted-800 dark:text-muted-400 font-semibold !w-96"
                        >
                          {{ currentOrderInvoice?.announcer?.name }}
                        </BaseParagraph>
                      </div>
                    </div>
                    <div class="flex gap-2 mt-2">
                      <div
                        class="text-muted-500 dark:text-muted-400 text-sm font-light"
                      >
                        <p
                          v-if="currentOrderInvoice?.announcer?.address"
                          class="text-muted-700 dark:text-muted-100 text-[9px] font-bold"
                        >
                          Addresse :
                        </p>

                        <p
                          v-if="currentOrderInvoice?.announcer?.phone"
                          class="text-muted-700 dark:text-muted-100 mt-1 text-[9px] font-bold"
                        >
                          Mobile :
                        </p>
                        <p
                          v-if="currentOrderInvoice?.announcer?.email"
                          class="text-muted-700 dark:text-muted-100 mt-1 text-[9px] font-bold"
                        >
                          Courriel :
                        </p>

                        <p
                          v-if="currentOrderInvoice?.announcer?.rc"
                          class="text-muted-700 dark:text-muted-100 mt-1 text-[9px] font-bold"
                        >
                          R/C :
                        </p>
                        <p
                          v-if="currentOrderInvoice?.announcer?.nc"
                          class="text-muted-700 dark:text-muted-100 mt-1 text-[9px] font-bold"
                        >
                          N. Contribuable :
                        </p>
                        <p
                          v-if="currentOrderInvoice?.announcer?.niu"
                          class="text-muted-700 dark:text-muted-100 mt-1 text-[9px] font-bold"
                        >
                          Numéro d'Identifiant Unique :
                        </p>
                      </div>
                      <div
                        class="text-muted-800 dark:text-muted-400 text-sm font-normal"
                      >
                        <p class="text-[9px]">
                          {{ currentOrderInvoice?.announcer?.address }}
                        </p>
                        <p class="mt-1 text-[9px]">
                          {{ currentOrderInvoice?.announcer?.phone }}
                        </p>
                        <p class="mt-1 text-[9px]">
                          {{ currentOrderInvoice?.announcer?.email }}
                        </p>
                        <p class="mt-1 text-[9px]">
                          {{ currentOrderInvoice?.announcer?.rc }}
                        </p>
                        <p class="mt-1 text-[9px]">
                          {{ currentOrderInvoice?.announcer?.nc }}
                        </p>
                        <p class="mt-1 text-[9px]">
                          {{ currentOrderInvoice?.announcer?.niu }}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div class="flex gap-2 bg-primary-500/20 p-2 mt-2">
                    <div
                      class="text-muted-500 dark:text-muted-400 text-sm font-light"
                    >
                      <p
                        class="text-muted-800 dark:text-muted-100 text-[10px] font-semibold"
                      >
                        {{
                          pageValue == 'invoice'
                            ? 'Date De Facture'
                            : 'Date De Devis'
                        }}
                      </p>

                      <!-- <p
                        class="text-muted-800 dark:text-muted-100 mt-2 text-[10px] font-semibold"
                      >
                        Date de commande :
                      </p>  -->
                      <p
                        class="text-muted-800 dark:text-muted-100 mt-2 text-[10px] font-semibold"
                      >
                        Date Echéance :
                      </p>
                      <p
                        v-if="currentOrderInvoice?.description"
                        class="text-muted-800 dark:text-muted-100 mt-2 text-[10px] font-semibold"
                      >
                        Description :
                      </p>

                      <p
                        v-if="currentOrderInvoice?.announcer?.supCode"
                        class="text-muted-800 dark:text-muted-100 mt-2 text-[10px] font-semibold"
                      >
                        Code Fournisseur :
                      </p>
                    </div>
                    <div
                      class="text-muted-800 dark:text-muted-400 text-sm font-normal"
                    >
                      <p class="text-[10px]">
                        {{
                          new Date(
                            currentOrderInvoice?.date,
                          ).toLocaleDateString('fr-FR')
                        }}
                      </p>

                      <!-- <p class="mt-2 text-[10px]">SO3078</p>
                      <p class="mt-2 text-[10px]">30/05/2023</p> -->
                      <p class="mt-2 text-[10px]">
                        {{
                          new Date(
                            currentOrderInvoice?.dueDate,
                          ).toLocaleDateString('fr-FR')
                        }}
                      </p>
                      <p
                        v-if="currentOrderInvoice?.description"
                        class="mt-2 text-[10px]"
                      >
                        {{ currentOrderInvoice?.description }}
                        <!-- BC N° 33880 DU 18/07/2023 -->
                      </p>
                      <p
                        v-if="currentOrderInvoice?.announcer?.supCode"
                        class="mt-2 text-[10px]"
                      >
                        {{ currentOrderInvoice?.announcer?.supCode ?? '' }}
                      </p>
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
                        <!-- <div
                          v-if="pageValue == 'invoice'"
                          class="ltablet:col-span-6 col-span-12 lg:col-span-6"
                        >
                          <BaseListbox
                            label="Devis"
                            :items="finalOrders"
                            :properties="{
                              value: '_id',
                              label: 'code',
                              sublabel: 'label',
                            }"
                            v-model="selectedOrder"
                            :error="errorMessage"
                            :disabled="isSubmitting || isEdit"
                          />
                        </div> -->
                        <div
                          v-if="pageValue == 'invoice'"
                          class="ltablet:col-span-6 col-span-12 lg:col-span-6"
                        >
                          <Field
                            v-slot="{
                              field,
                              errorMessage,
                              handleChange,
                              handleBlur,
                            }"
                            name="order.order"
                          >
                            <BaseAutocomplete
                              v-model="selectedOrder"
                              :error="errorMessage"
                              :disabled="isSubmitting"
                              @update:model-value="handleChange"
                              @blur="handleBlur"
                              :items="[]"
                              :display-value="(item: any) => item.name || ''"
                              :filter-items="filterOrdersItems"
                              icon="lucide:file"
                              placeholder="DEV/2024/..."
                              label="Devis"
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
                            <BaseAutocomplete
                              :model-value="field.value"
                              :error="errorMessage"
                              :disabled="isSubmitting"
                              @update:model-value="handleChange"
                              @blur="handleBlur"
                              :items="[]"
                              :display-value="(item: any) => item.name || ''"
                              :filter-items="filterItems"
                              icon="lucide:user"
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
                        <div class="col-span-12 md:col-span-6">
                          <Field
                            v-slot="{
                              field,
                              errorMessage,
                              handleChange,
                              handleBlur,
                            }"
                            name="order.paymentMethod"
                          >
                            <BaseListbox
                              label="Mode de paiment"
                              :items="paymentMethods?.data"
                              :properties="{
                                value: '_id',
                                label: 'label',
                                sublabel: 'description',
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
                            name="order.paymentCondition"
                          >
                            <BaseListbox
                              label="Conditions de reglements"
                              :items="paymentConditions?.data"
                              :properties="{
                                value: '_id',
                                label: 'label',
                                sublabel: 'description',
                              }"
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
                            <BaseSelect
                              label="Equipe commerciale"
                              icon="ph:funnel"
                              :model-value="field.value"
                              :error="errorMessage"
                              @update:model-value="handleChange"
                              @blur="handleBlur"
                            >
                              <option value="douala">Douala</option>
                              <option value="yaounde">Yaoundé</option>
                            </BaseSelect>
                          </Field>
                        </div>
                        <div
                          class="ltablet:col-span-12 col-span-12 lg:col-span-6"
                        >
                          <DatePicker
                            v-model.range="dates"
                            :min-date="new Date('2022-01-01')"
                            mode="date"
                            hide-time-header
                            trim-weeks
                          >
                            <template #default="{ inputValue, inputEvents }">
                              <div
                                class="flex w-full flex-col gap-4 sm:flex-row"
                              >
                                <div class="relative grow">
                                  <Field
                                    v-slot="{
                                      field,
                                      errorMessage,
                                      handleChange,
                                      handleBlur,
                                    }"
                                    name="order.date"
                                  >
                                    <BaseInput
                                      shape="rounded"
                                      label="Date opération"
                                      icon="ph:calendar-blank-duotone"
                                      :value="inputValue.start"
                                      v-on="inputEvents.start"
                                      :classes="{
                                        input: '!h-11 !ps-11',
                                        icon: '!h-11 !w-11',
                                      }"
                                      :v-model="dates.start"
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
                            label="Joindre un document"
                          />
                        </div>
                        <div
                          class="ltablet:col-span-12 col-span-12 lg:col-span-6"
                        >
                          <Field
                            v-slot="{
                              field,
                              errorMessage,
                              handleChange,
                              handleBlur,
                            }"
                            name="order.description"
                          >
                            <BaseInput
                              label="Référence"
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
                        <div
                          class="ltablet:col-span-12 col-span-12 lg:col-span-6"
                        >
                          <Field
                            v-slot="{
                              field,
                              errorMessage,
                              handleChange,
                              handleBlur,
                            }"
                            name="order.note"
                          >
                            <BaseInput
                              label="Note"
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
                <div class="px-2 py-4 sm:p-4 overflow-x-auto w-full">
                  <div class="px-2 w-full">
                    <table
                      class="divide-muted-200 dark:divide-muted-700 min-w-full divide-y"
                    >
                      <thead class="font-sans">
                        <tr class="bg-primary-500/20 px-2">
                          <th
                            v-if="!isPrint"
                            scope="col"
                            class="text-muted-800 dark:text-muted-400 py-2 pe-3 ps-4 text-left text-[9px] font-medium sm:ps-6 md:ps-0"
                          >
                            <Icon name="lucide:settings" class="h-4 w-4" />
                          </th>
                          <th
                            scope="col"
                            class="text-muted-800 dark:text-muted-400 py-2 pe-3 ps-4 text-center text-[9px] font-bold sm:ps-6 md:ps-0"
                          >
                            #
                          </th>
                          <th
                            v-if="!isPrint"
                            scope="col"
                            class="text-muted-800 dark:text-muted-400 py-2 pe-3 ps-4 text-center text-[9px] font-bold sm:ps-6 md:ps-0"
                          >
                            Article
                          </th>
                          <!-- <th
                            scope="col"
                            class="text-muted-800 dark:text-muted-400 py-2 pe-3 ps-4 text-left text-[9px] font-bold sm:ps-6 md:ps-0"
                          >
                            Référence Mercuriale
                          </th> -->
                          <th
                            scope="col"
                            class="text-muted-800 dark:text-muted-400 py-2 pe-3 ps-4 text-left text-[9px] font-bold sm:ps-6 md:ps-0"
                          >
                            Description
                          </th>
                          <!-- <th
                            v-if="!isPrint"
                            scope="col"
                            class="text-muted-800 dark:text-muted-400 py-2 pe-3 ps-4 text-center text-[9px] font-bold sm:ps-6 md:ps-0"
                          >
                            Compte
                          </th> -->
                          <th
                            scope="col"
                            class="text-muted-800 dark:text-muted-400 px-3 py-2 text-center text-[9px] font-bold sm:table-cell"
                          >
                            Quantité
                          </th>
                          <th
                            v-if="!isPrint"
                            scope="col"
                            class="text-muted-800 dark:text-muted-400 px-3 py-2 text-center text-[9px] font-bold sm:table-cell"
                          >
                            Unité de mesure
                          </th>
                          <th
                            scope="col"
                            class="text-muted-800 dark:text-muted-400 px-3 py-2 text-center text-[9px] font-bold sm:table-cell"
                          >
                            Prix unitaire
                          </th>
                          <th
                            scope="col"
                            class="text-muted-800 dark:text-muted-400 px-3 py-2 text-center text-[9px] font-bold sm:table-cell"
                          >
                            Remise
                          </th>
                          <th
                            scope="col"
                            class="text-muted-800 dark:text-muted-400 px-3 py-2 text-center text-[9px] font-bold sm:table-cell"
                          >
                            Taxes
                          </th>
                          <th
                            scope="col"
                            class="text-muted-800 dark:text-muted-400 py-2 pe-4 ps-3 px-2 text-right text-[9px] font-bold sm:pe-6 md:pe-0"
                          >
                            Prix
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
                              class="flex text-muted-800 dark:text-muted-100 font-normal"
                            >
                              <BaseButtonAction
                                class="!p-2"
                                @click="editOrderItem(item)"
                              >
                                <Icon
                                  name="lucide:edit"
                                  class="h-4 w-4 text-info-500"
                                />
                              </BaseButtonAction>
                              <BaseButtonAction
                                class="!p-2 mx-2"
                                @click="deleteOrderItem(i)"
                              >
                                <Icon
                                  name="lucide:trash"
                                  class="h-4 w-4 text-red-500"
                                />
                              </BaseButtonAction>
                            </div>
                          </td>
                          <td
                            class="text-muted-800 dark:text-muted-400 px-3 py-4 text-left text-[9px] sm:table-cell"
                          >
                            {{ item.id + 1 }}
                          </td>
                          <td
                            v-if="!isPrint"
                            class="text-muted-800 dark:text-muted-400 text-left text-[9px] sm:table-cell"
                          ></td>
                          <!-- <td
                            style="white-space: pre-wrap; word-wrap: break-word"
                            class="text-muted-800 dark:text-muted-400 !w-20 px-3 py-4 text-left font-medium text-[9px] sm:table-cell"
                          >
                            <p class="w-20 break-words">48-002-200326</p>
                          </td> -->
                          <td
                            style="white-space: pre-wrap; word-wrap: break-word"
                            class="text-muted-800 dark:text-muted-400 !w-48 px-3 py-4 text-left font-medium text-[9px] sm:table-cell"
                          >
                            <p class="w-48 break-words">
                              {{ item.description }}
                            </p>
                          </td>
                          <!-- <td
                            v-if="!isPrint"
                            class="px-3 py-4 text-center text-[9px] sm:table-cell"
                          >
                            7011
                          </td> -->
                          <td
                            class="text-muted-800 dark:text-muted-400 px-1 py-4 text-center font-medium text-[9px] sm:table-cell"
                          >
                            {{ item.quantity }}
                          </td>
                          <td
                            v-if="!isPrint"
                            class="text-muted-800 dark:text-muted-400 px-3 py-4 text-center font-medium text-[9px] sm:table-cell"
                          >
                            {{ item.unit }}
                          </td>
                          <td
                            class="text-muted-800 dark:text-muted-400 px-3 py-4 text-center font-medium text-[9px] sm:table-cell"
                          >
                            {{ item.rate }}
                          </td>
                          <td
                            class="text-muted-800 dark:text-muted-400 px-2 py-4 text-center font-medium text-[9px] sm:table-cell"
                          >
                            {{ item.discount }} %
                          </td>
                          <td
                            class="text-muted-800 dark:text-muted-400 px-3 py-4 text-center font-medium text-[9px] sm:table-cell"
                          >
                            <span v-if="item.taxes.length > 0">
                              {{ item.taxes[0]?.code }} :
                              {{ item.taxes[0]?.value }} %
                            </span>
                            <span v-if="item.taxes.length > 0"> , </span>
                            <span v-if="item.taxes.length > 1">
                              {{ item.taxes[1]?.code }} :
                              {{ item.taxes[1]?.value }} %
                            </span>
                          </td>
                          <td
                            class="text-muted-800 dark:text-muted-100 py-4 pe-4 ps-3 text-right font-medium text-[9px] sm:pe-6 md:pe-0"
                          >
                            {{
                              new Intl.NumberFormat('fr-FR').format(
                                item.rate * item.quantity,
                              )
                            }}
                            XAF
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
                              <BaseButtonAction
                                v-if="isEditOrderItem == true"
                                @click="updateOrderItem(curOrderItem)"
                              >
                                <Icon name="lucide:save" class="h-4 w-4" />
                              </BaseButtonAction>

                              <BaseButtonAction
                                v-if="isEditOrderItem == false"
                                @click="addOrderItem()"
                              >
                                <Icon name="lucide:plus" class="h-4 w-4" />
                              </BaseButtonAction>
                            </div>
                          </td>
                          <td class="py-4 pe-3 ps-4 text-sm sm:ps-6 md:ps-0">
                            <div
                              class="text-muted-800 dark:text-muted-100 font-medium"
                            >
                              {{
                                isEditOrderItem
                                  ? curOrderItem.id + 1
                                  : orderData.length + 1
                              }}
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
                          <!-- <td
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
                                    :items="saleAccounts"
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
                          </td> -->
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
                                wrapper: 'w-20 text-[9px]',
                              }"
                            />
                          </td>
                          <td
                            class="text-muted-800 dark:text-muted-100 py-4 pe-4 ps-3 text-center text-sm sm:pe-6 md:pe-0"
                          >
                            <BaseInput
                              v-model.number="curOrderItem.rate"
                              :value="
                                curOrderItem.rate == 0
                                  ? curOrderItem.article?.price ?? 0
                                  : curOrderItem.rate
                              "
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
                            class="text-muted-800 dark:text-muted-100 py-4 pe-4 ps-3 text-right text-[10px] sm:pe-6 md:pe-0"
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
                        <tr clas="" v-for="item in totalData" :key="item.label">
                          <th
                            scope="row"
                            colspan="6"
                            class="text-muted-800 dark:text-muted-400 pe-3 ps-6 pt-2 text-right text-[10px] font-bold"
                          >
                            {{ item.label }}
                          </th>
                          <td
                            scope="row"
                            colspan="4"
                            class="ps-3 pt-2 text-right"
                            :class="
                              item.label === 'Montant TTC'
                                ? 'text-[10px] text-primary-800 border-muted-400 dark:border-muted-700 border-t font-bold dark:text-primary-500'
                                : item.label === 'Total HT'
                                ? 'text-[10px] border-muted-400 dark:border-muted-700 text-muted-800 font-bold dark:text-muted-200/70 border-t'
                                : 'text-[10px] text-muted-800 dark:text-muted-200/70 font-bold'
                            "
                          >
                            <span v-if="item.label === 'Montant TTC'"
                              >{{
                                new Intl.NumberFormat('fr-FR').format(
                                  item.value,
                                )
                              }}
                              XAF</span
                            >
                            <span v-else
                              >{{
                                new Intl.NumberFormat('fr-FR').format(
                                  item.value,
                                )
                              }}
                              XAF</span
                            >
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </div>

                <BaseHeading
                  v-if="
                    pageValue == 'invoice' &&
                    isPrint &&
                    currentOrderInvoice?.transactions?.length > 0
                  "
                  as="h4"
                  size="sm"
                  weight="medium"
                  lead="tight"
                  class="text-primary-500 dark:text-primary-500 px-6 py-1"
                >
                  Historique des paiements
                </BaseHeading>
                <BaseHeading
                  v-if="
                    pageValue == 'invoice' &&
                    !isPrint &&
                    currentOrderInvoice?.transactions?.length > 0
                  "
                  as="h1"
                  size="lg"
                  weight="medium"
                  lead="tight"
                  class="text-primary-500 dark:text-primary-500 px-6 py-1"
                >
                  Historique des paiements
                </BaseHeading>

                <div
                  v-if="
                    pageValue == 'invoice' &&
                    currentOrderInvoice?.transactions?.length > 0
                  "
                  class="px-2 py-1 sm:p-4"
                >
                  <div class="flex flex-col px-2">
                    <table
                      class="divide-muted-200 dark:divide-muted-700 w-full divide-y"
                    >
                      <thead class="font-sans">
                        <tr>
                          <th
                            v-if="!isPrint"
                            scope="col"
                            class="text-muted-800 dark:text-muted-400 py-2 pe-3 ps-4 text-center text-[9px] font-bold sm:ps-6 md:ps-0"
                          >
                            <Icon name="lucide:settings" class="h-4 w-4" />
                          </th>
                          <th
                            scope="col"
                            class="text-muted-800 dark:text-muted-400 py-2 pe-3 ps-4 text-center text-[9px] font-bold sm:ps-6 md:ps-0"
                          >
                            #
                          </th>
                          <th
                            scope="col"
                            class="text-muted-800 dark:text-muted-400 py-2 pe-3 ps-4 text-center text-[9px] font-bold sm:ps-6 md:ps-0"
                          >
                            Date
                          </th>
                          <th
                            scope="col"
                            class="text-muted-800 dark:text-muted-400 py-2 pe-3 ps-4 text-center text-[9px] font-bold sm:ps-6 md:ps-0"
                          >
                            Montant
                          </th>
                          <th
                            scope="col"
                            class="text-muted-800 dark:text-muted-400 py-2 pe-3 ps-4 text-center text-[9px] font-bold sm:ps-6 md:ps-0"
                          >
                            Moyen
                          </th>
                          <th
                            scope="col"
                            class="text-muted-800 dark:text-muted-400 py-2 pe-3 ps-4 text-center text-[9px] font-bold sm:ps-6 md:ps-0"
                          >
                            Référence
                          </th>
                        </tr>
                      </thead>
                      <tbody class="font-sans">
                        <tr
                          v-for="(item, i) in currentOrderInvoice?.transactions"
                          :key="i"
                          class="border-muted-200 dark:border-muted-700 border-b"
                        >
                          <td
                            v-if="!isPrint"
                            class="py-2 pe-3 ps-4 text-center text-sm sm:ps-6 md:ps-0"
                          >
                            <div
                              class="text-muted-800 dark:text-muted-100 font-medium"
                            >
                              <BaseButtonAction
                                disabled
                                @click="deleteOrderItem(i)"
                              >
                                <Icon
                                  name="lucide:trash"
                                  class="h-4 w-4 text-red-500"
                                />
                              </BaseButtonAction>
                            </div>
                          </td>
                          <td
                            class="text-muted-800 dark:text-muted-400 px-3 py-2 text-center text-[9px] sm:table-cell"
                          >
                            {{ i + 1 }}
                          </td>
                          <td
                            class="text-muted-800 dark:text-muted-400 px-3 py-2 text-center text-[9px] sm:table-cell"
                          >
                            {{
                              new Date(
                                item.date ?? item.createdAt,
                              ).toLocaleDateString('fr-FR')
                            }}
                          </td>
                          <td
                            class="text-muted-800 dark:text-muted-400 px-3 py-2 text-center text-[9px] sm:table-cell"
                          >
                            {{
                              new Intl.NumberFormat('fr-FR').format(item.amount)
                            }}
                            XAF
                          </td>
                          <td
                            class="px-3 py-2 text-center text-[9px] sm:table-cell"
                          >
                            {{ item.paymentAccount?.label ?? '-' }}
                          </td>
                          <td
                            class="px-3 py-2 text-center text-[9px] sm:table-cell"
                          >
                            {{ item.code ?? '-' }}
                          </td>
                        </tr>
                        <tr
                          v-if="currentOrderInvoice?.taxes?.length > 0"
                          :key="i"
                          class="border-muted-200 dark:border-muted-700 border-b"
                        >
                          <td
                            v-if="!isPrint"
                            class="py-2 pe-3 ps-4 text-center text-sm sm:ps-6 md:ps-0"
                          >
                            <div
                              class="text-muted-800 dark:text-muted-100 font-medium"
                            >
                              <BaseButtonAction
                                disabled
                                @click="deleteOrderItem(i)"
                              >
                                <Icon
                                  name="lucide:trash"
                                  class="h-4 w-4 text-red-500"
                                />
                              </BaseButtonAction>
                            </div>
                          </td>
                          <td
                            class="text-muted-800 dark:text-muted-400 px-3 py-2 text-center text-[9px] sm:table-cell"
                          >
                            {{ currentOrderInvoice?.transactions?.length + 1 }}
                          </td>
                          <td
                            class="text-muted-800 dark:text-muted-400 px-3 py-2 text-center text-[9px] sm:table-cell"
                          >
                            {{
                              new Date(
                                currentOrderInvoice?.taxes[0].date,
                              ).toLocaleDateString('fr-FR')
                            }}
                          </td>
                          <td
                            class="text-muted-800 dark:text-muted-400 px-3 py-2 text-center text-[9px] sm:table-cell"
                          >
                            {{
                              new Intl.NumberFormat('fr-FR').format(
                                currentOrderInvoice?.taxes.length > 2
                                  ? currentOrderInvoice?.taxes[0].amount +
                                      currentOrderInvoice?.taxes[1].amount +
                                      currentOrderInvoice?.taxes[2].amount
                                  : currentOrderInvoice?.taxes.length > 1
                                  ? currentOrderInvoice?.taxes[0].amount +
                                    currentOrderInvoice?.taxes[1].amount
                                  : currentOrderInvoice?.taxes[0].amount,
                              )
                            }}
                            XAF
                          </td>
                          <td
                            class="px-3 py-2 text-center text-[9px] sm:table-cell"
                          >
                            Impots et taxes retenus à la source
                          </td>
                          <td
                            class="px-3 py-2 text-center text-[9px] sm:table-cell"
                          >
                            {{ currentOrderInvoice.taxes[0]?.label ?? '-' }}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                <div v-if="isPrint" class="py-2 px-8">
                  <div class="!py-2 dark:text-muted-400" size="xs">
                    <span class="font-bold text-[10px]">Total en lettre</span> :
                    <span class="font-normal text-[10px]"
                      >{{
                        new ToWords({ localeCode: 'fr-FR' }).convert(
                          currentOrderInvoice?.amount,
                        )
                      }}
                      Francs CFA.</span
                    >
                  </div>
                  <div
                    class="border-muted-200 dark:border-muted-700 border-t pt-2"
                  >
                    <div class="dark:text-muted-400">
                      <BaseParagraph class="!text-[10px]" size="xs">
                        <span class="!font-bold">Termes de paiement : </span>
                        <span class="!font-normal">
                          {{
                            currentOrderInvoice?.paymentCondition?.label
                          }}</span
                        >
                      </BaseParagraph>
                      <BaseParagraph class="!text-[10px]" size="xs">
                        <span class="!font-bold">Commentaire : </span>

                        <span class="!font-normal">
                          Condiftions générales de ventes.
                        </span>
                      </BaseParagraph>
                    </div>
                  </div>
                </div>
                <div class="mt-2 p-8 flex justify-end">
                  <div class="dark:text-muted-400 font-bold">
                    <BaseParagraph size="sm">
                      La Direction commerciale
                    </BaseParagraph>
                  </div>
                </div>
                <footer
                  v-if="isPrint"
                  class="flex items-end justif-center w-full absolute inset-x-0 bottom-0"
                >
                  <div class="w-full pb-1">
                    <div
                      class="dark:text-muted-400 border-primary-500 pb-1 text-center dark:border-primary-700 border-b-2"
                    >
                      <BaseParagraph size="xs" class="text-[10px] font-medium">
                        {{ currentOrderInvoice?.org?.footerTitle }}
                      </BaseParagraph>
                    </div>
                    <div class="dark:text-muted-400 py-1 text-center">
                      <BaseParagraph size="xs" class="text-[10px] font-medium">
                        Téléphone : (+237)
                        {{ currentOrderInvoice?.org?.phone }}
                        {{
                          currentOrderInvoice?.org?.phone2
                            ? '/ ' + currentOrderInvoice?.org?.phone2
                            : ''
                        }}
                        . {{ currentOrderInvoice?.org?.website }}
                      </BaseParagraph>
                      <BaseParagraph size="xs" class="text-[10px] font-medium">
                        N° Contribuable:
                        {{ currentOrderInvoice?.org?.nc }} - RC:
                        {{ currentOrderInvoice?.org?.rc }};
                      </BaseParagraph>
                    </div>
                  </div>
                </footer>
              </div>
            </div>
          </div>
        </div>
      </form>
    </TairoContentWrapper>

    <!-- Modal confirm sale order / invoice -->
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

    <!-- Modal confirm sale order / invoice -->
    <TairoModal
      :open="isModalConfirmInvoiceOpen"
      size="sm"
      @close="isModalConfirmInvoiceOpen = false"
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

          <BaseButtonClose @click="isModalConfirmInvoiceOpen = false" />
        </div>
      </template>

      <!-- Body -->
      <div class="p-4 md:p-6">
        <div class="mx-auto w-full max-w-xs text-center">
          <h3
            class="font-heading text-muted-800 text-lg font-medium leading-6 dark:text-white"
          >
            Voulez-vous confirmer en tant que DAF
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
            <BaseButton @click="isModalConfirmInvoiceOpen = false"
              >Annuler</BaseButton
            >

            <BaseButton color="primary" flavor="solid" @click="confirmInvoice()"
              >Valider</BaseButton
            >
          </div>
        </div>
      </template>
    </TairoModal>

    <!-- Modal create campaign -->
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
                        :items="accounts"
                        :properties="{
                          value: '_id',
                          label: 'label',
                          sublabel: 'code',
                        }"
                        v-model="curInvoicePaymentForm.paymentAccount"
                        :error="errorMessage"
                        :disabled="isSubmitting || pendingAccounts"
                        @update:model-value="handleChange"
                        @blur="handleBlur"
                      />
                    </div>
                    <div class="ltablet:col-span-12 col-span-12 lg:col-span-6">
                      <DatePicker
                        v-model="curInvoicePaymentForm.date"
                        :min-date="new Date('2022-01-01')"
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
                                  :value="inputValue"
                                  v-on="inputEvents"
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
                        label="Reference"
                        icon="ph:note"
                        placeholder="Ex: cheque N_001"
                        v-model="curInvoicePaymentForm.label"
                        :error="errorMessage"
                        :disabled="isSubmitting"
                        type="text"
                        @update:model-value="handleChange"
                        @blur="handleBlur"
                      />
                    </Field>
                  </div>
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
              :disabled="isLoading"
              :loading="isLoading"
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

    <!-- Modal create Tax -->
    <TairoModal
      :open="isModalCreateTaxOpen"
      size="xl"
      @close="isModalCreateTaxOpen = false"
    >
      <template #header>
        <!-- Header -->
        <div class="flex w-full items-center justify-between p-4 md:p-6">
          <h3
            class="font-heading text-muted-900 text-lg font-medium leading-6 dark:text-white"
          >
            Nouvelle retenue
          </h3>

          <BaseButtonClose @click="isModalCreateTaxOpen = false" />
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
                        v-model="curInvoiceTaxForm.account"
                        label="Taxes"
                        :items="taxes.data"
                        placeholder=""
                        :multiple-label="
                              (value: any[], labelProperty?: string) => { 
                                if (value.length === 0) { return 'Vide'; } else if (value.length > 2) { return `${value.length} elements`; } else if (value.length > 1) { return labelProperty ? String(value?.[0]?.[labelProperty]) +'; '+String(value?.[1]?.[labelProperty]) :  String(value?.[0])+' : '+String(value?.[1]);  } 
                                return labelProperty ? String(value?.[0]?.[labelProperty]) :  String(value?.[0])+' : '+String(value?.[1]); }"
                        :properties="{
                          value: '_id',
                          label: 'code',
                          sublabel: 'value',
                        }"
                      />
                    </div>
                    <div class="ltablet:col-span-12 col-span-12 lg:col-span-6">
                      <DatePicker
                        v-model="curInvoiceTaxForm.date"
                        :min-date="new Date('2022-01-01')"
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
                                  :value="inputValue"
                                  v-on="inputEvents"
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
                        label="Reference"
                        icon="ph:note"
                        placeholder="Ex: CSH/2023/0001"
                        v-model="curInvoiceTaxForm.label"
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
                        v-model="curInvoiceTaxForm.amount"
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
            <BaseButton @click="isModalCreateTaxOpen = false"
              >Annuler</BaseButton
            >

            <BaseButton
              color="primary"
              flavor="solid"
              @click="addInvoiceTaxes()"
            >
              Créer
            </BaseButton>
          </div>
        </div>
      </template>
    </TairoModal>
  </div>
</template>
