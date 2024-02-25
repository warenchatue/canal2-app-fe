<script setup lang="ts">
import { toTypedSchema } from '@vee-validate/zod'
import { Field, useForm } from 'vee-validate'
import { DatePicker } from 'v-calendar'
import { z } from 'zod'
import { UserRole } from '~/types/user'
import moment from 'moment'
import { ToWords } from 'to-words'

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
const currentOrderInvoice = ref({})
const token = useCookie('token')
const isModalCreatePackageOpen = ref(false)
const isModalDeletePackageOpen = ref(false)
const isModalConfirmOrderOpen = ref(false)
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

const transformedAnnouncers = announcers.value?.data.map((e: any) => {
  const invoice = {
    id: e._id,
    name: e.name,
  }
  return invoice
})

const commercials = allUsers.value?.data.filter((e: any) => {
  return (
    e.appRole?.name == UserRole.sale ||
    e.appRole?.name == UserRole.billing ||
    e.appRole?.name == UserRole.admin
  )
})

const finalOrders = allOrders.value?.data.filter((e: any) => {
  return e.validator
})

const paymentAccounts = accounts.value?.data.filter((e: any) => {
  return e.position == 'd'
})

// const saleAccounts = accounts.value?.data.filter((e: any) => {
//   return e.code == '7011'
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
    pageTitle = 'Mise à jour Facture'
    const { data: singleOrder } = await useFetch('/api/sales/invoices', {
      query,
    })
    if (singleOrder.value?.success) {
      currentOrderInvoice.value = singleOrder.value?.data
      packageId.value =
        currentOrderInvoice.value.order?.package?._id ?? undefined
      selectedOrder.value = currentOrderInvoice.value.order
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
  setTimeout(() => {
    editOrderInvoiceFile(value, true)
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
    filter.value = 'payment'
    filter.value = ''
    location.reload()
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

function filterItems(query?: string, items?: any[]) {
  if (query.length < 3) {
    return []
  }

  if (!query || !items) {
    return items ?? []
  }

  // search by name
  return items.filter((item) => {
    const nameMatches = item?.name?.toLowerCase().includes(query.toLowerCase())
    // const textMatches = item?.text?.toLowerCase().includes(query.toLowerCase())
    return nameMatches
  })
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
    location.reload()
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
    location.reload()
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
    console.log(value)
    if (curOrderItem.value.article != value.article) {
      curOrderItem.value.rate = value.article.price
    }
  }, 500)
})

const curInvoicePaymentForm = ref({
  paymentAccount: {},
  label: '',
  amount:
    currentOrderInvoice.value?.amount ??
    0 - currentOrderInvoice.value?.paid ??
    0,
  date: '',
  currency: '',
})

const curInvoiceTaxForm = ref({
  account: {},
  label: '',
  amount:
    (currentOrderInvoice.value?.tva ?? 0) +
    (currentOrderInvoice.value?.tsp ?? 0),
  date: '',
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

  // const vatValue = orderData.value.reduce((acc, item: any) => {
  //   const baseAmount =
  //     item.quantity * item.rate * (1 - item.discount / 100 ?? 0)
  //   let tspAmount = 0
  //   let tvaAmount = 0
  //   let totalTaxes = 0
  //   const tsp = item.taxes.filter((el: any) => el.code == 'TSP')
  //   if (tsp.length == 1) {
  //     tspAmount = baseAmount * (tsp[0].value / 100 ?? 0)
  //     totalTaxes += tspAmount
  //   }

  //   const tva = item.taxes.filter((el: any) => el.code == 'TVA')
  //   if (tva.length == 1) {
  //     tvaAmount = (baseAmount + tspAmount) * (tva[0].value / 100 ?? 0)
  //     totalTaxes += tvaAmount
  //   }

  //   const otherTaxes = item.taxes.filter(
  //     (el: any) => el.code != 'TSP' && el.code != 'TVA',
  //   )
  //   for (let index = 0; index < otherTaxes.length; index++) {
  //     totalTaxes += baseAmount * (otherTaxes[index].value / 100 ?? 0)
  //   }
  //   return acc + totalTaxes
  // }, 0)

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
                  ? totalData.value[totalData.value.length - 3].value
                  : 0,
              amount:
                totalData.value.length > 0
                  ? totalData.value[totalData.value.length - 1].value
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
                  ? totalData.value[totalData.value.length - 3].value
                  : 0,
              amount:
                totalData.value.length > 0
                  ? totalData.value[totalData.value.length - 1].value
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
              order: selectedOrder.value?._id ?? undefined,
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
                  ? totalData.value[totalData.value.length - 4].value
                  : 0,
              tsp:
                totalData.value.length > 0
                  ? totalData.value[totalData.value.length - 3].value
                  : 0,
              tva:
                totalData.value.length > 0
                  ? totalData.value[totalData.value.length - 2].value
                  : 0,
              amount:
                totalData.value.length > 0
                  ? totalData.value[totalData.value.length - 1].value
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
              order: selectedOrder.value?._id ?? undefined,
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
                  ? totalData.value[totalData.value.length - 4].value
                  : 0,
              tsp:
                totalData.value.length > 0
                  ? totalData.value[totalData.value.length - 3].value
                  : 0,
              tva:
                totalData.value.length > 0
                  ? totalData.value[totalData.value.length - 2].value
                  : 0,
              amount:
                totalData.value.length > 0
                  ? totalData.value[totalData.value.length - 1].value
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
        <div class="mx-auto max-w-7xl py-5">
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
          <div id="print-invoice">
            <div
              :class="
                isPrint == false
                  ? 'bg-muted-50 dark:bg-muted-800/60 rounded'
                  : ''
              "
            ></div>
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
                        :items="paymentAccounts"
                        :properties="{
                          value: '_id',
                          label: 'label',
                          sublabel: 'code',
                        }"
                        v-model="curInvoicePaymentForm.paymentAccount"
                        :error="errorMessage"
                        :disabled="isSubmitting"
                        @update:model-value="handleChange"
                        @blur="handleBlur"
                      />
                    </div>
                    <div class="ltablet:col-span-12 col-span-12 lg:col-span-6">
                      <DatePicker
                        v-model.range="dates"
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
                        v-model.range="dates"
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
