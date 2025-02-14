<script setup lang="ts">
import { toTypedSchema } from '@vee-validate/zod'
import { ToWords } from 'to-words'
import { DatePicker } from 'v-calendar'
import { Field, useForm } from 'vee-validate'
import { z } from 'zod'
import { UserRole } from '~/types/user'

definePageMeta({
  title: 'Bons de Caisses',
  preview: {
    title: 'Bons de Caisses',
    description: 'Gestion des Bons de Caisses',
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
const perPage = ref(10000)
const isEdit = ref(false)
const isPrint = ref(false)
const currentAccountingDoc = ref({})
const token = useCookie('token')
const isModalConfirmOrderOpen = ref(false)
const isModalCreatePaymentOpen = ref(false)
const currentOrg = ref({})
const selectedOrder = ref({})
const dates = ref({
  start: new Date(),
  end: new Date(),
})
// Check if can have access
if (
  authStore.user.appRole?.name != UserRole.sale &&
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

const { data: orgs } = await useFetch('/api/admin/orgs', {
  query,
})

const { data: allJournals } = await useFetch('/api/accountancy/journals', {
  query,
})

const { data: allAccounts, pending: pendingAccounts } = await useFetch(
  '/api/accountancy/accounts',
  {
    query: queryLight,
    lazy: true,
    transform: (els) => {
      return els.data?.map((el: any) => {
        return { id: el._id, name: el.code + ' : ' + el.label }
      })
    },
  },
)

const { data: allDocTypes } = await useFetch('/api/accountancy/doc-types', {
  query,
})

const { data: allUsers } = await useFetch('/api/users', {
  query,
})

const { data: allExpensesCategories } = await useFetch(
  '/api/accountancy/expense-categories',
  {
    query,
  },
)

const transformedExpensesCategories = allExpensesCategories.value?.data.map(
  (e: any) => {
    const user = {
      id: e._id,
      name: e.name + ' (' + (e.parent?.name ?? '') + ')',
    }
    return user
  },
)

const transformedUsers = allUsers.value?.data.map((e: any) => {
  const user = {
    id: e._id,
    name: e.firstName + ' ' + e.lastName,
  }
  return user
})

const transformedDocTypes = allDocTypes.value?.data.map((e: any) => {
  const docType = {
    id: e._id,
    name: e.code + ' : ' + e.label,
  }
  return docType
})

const transformedJournals = allJournals.value?.data.map((e: any) => {
  const journal = {
    id: e._id,
    name: e.code + ' : ' + e.label,
  }
  return journal
})

const pageType = computed(() => route.params.type)
const pageId = computed(() => route.params.id)

let pageTitle = ''
if (pageType.value == 'new') {
  pageTitle = 'Nouvelle pièce comptable'
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

  pageTitle = 'Mise à jour Pièce comptable'
  const { data: singleAccountingDoc } = await useFetch(
    '/api/accountancy/accounting-docs',
    {
      query,
    },
  )
  if (singleAccountingDoc.value?.success) {
    currentAccountingDoc.value = singleAccountingDoc.value?.data
    editAccountingDoc(currentAccountingDoc.value)
  }

  if (pageType.value == 'view') {
    isPrint.value = true
  } else {
    isEdit.value = true
  }
}

watch(selectedOrder, (value) => {
  setTimeout(() => {
    editAccountingDoc(value)
  }, 1000)
})

function printAccountingDoc() {
  isPrint.value = true
  setTimeout(() => {
    var printContents = document.getElementById(
      'print-accounting-doc',
    ).innerHTML
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
    editAccountingDoc(currentAccountingDoc.value)
  }, 1000)
}

const selected = ref<number[]>([])
const isAllVisibleSelected = computed(() => {
  return selected.value.length === data.value?.data.length
})

function filterItems(query?: string, items?: any[]) {
  if (query.length < 2) {
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

function toggleAllVisibleSelection() {
  if (isAllVisibleSelected.value) {
    selected.value = []
  } else {
    selected.value = data.value?.data.map((item) => item.id) ?? []
  }
}

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
    accountingDoc: z.object({
      _id: z.string().optional(),
      label: z.string(),
      amount: z.number().optional(),
      team: z.string().optional(),
      invoiceNumber: z.string().optional(),
      ref: z.string().optional(),
      extBeneficiary: z.string().optional(),
      journal: z
        .object({
          id: z.string(),
          name: z.string(),
        })
        .optional()
        .nullable(),
      category: z
        .object({
          id: z.string(),
          name: z.string(),
        })
        .optional()
        .nullable(),
      docType: z
        .object({
          id: z.string(),
          name: z.string(),
        })
        .optional()
        .nullable(),
      beneficiary: z
        .object({
          id: z.string(),
          name: z.string(),
          email: z.string().optional(),
        })
        .optional()
        .nullable(),
      authorizer: z
        .object({
          id: z.string(),
          name: z.string(),
          email: z.string().optional(),
        })
        .optional()
        .nullable(),
    }),
  })
  .superRefine((data, ctx) => {
    if (!data.accountingDoc.label) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: VALIDATION_TEXT.LABEL_REQUIRED,
        path: ['accountingDoc.label'],
      })
    }
  })

// Zod has a great infer method that will
// infer the shape of the schema into a TypeScript type
type FormInput = z.infer<typeof zodSchema>

const validationSchema = toTypedSchema(zodSchema)
const initialValues = computed<FormInput>(() => ({
  avatar: null,
  accountingDoc: {
    label: '',
    amount: 0,
    team: authStore.user?.team ?? 'douala',
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

function editAccountingDoc(currentAccountingDoc: any) {
  dates.value.start = new Date(currentAccountingDoc.date)
  dates.value.end = new Date(currentAccountingDoc.date)
  setTimeout(() => {
    setFieldValue('accountingDoc._id', currentAccountingDoc._id)
    setFieldValue('accountingDoc.label', currentAccountingDoc.label)
    setFieldValue('accountingDoc.amount', currentAccountingDoc.amount)
    setFieldValue('accountingDoc.team', currentAccountingDoc.team)
    setFieldValue('accountingDoc.ref', currentAccountingDoc.ref)
    setFieldValue(
      'accountingDoc.invoiceNumber',
      currentAccountingDoc.invoiceNumber,
    )
    setFieldValue(
      'accountingDoc.extBeneficiary',
      currentAccountingDoc.extBeneficiary,
    )
    if (currentAccountingDoc.beneficiary) {
      setFieldValue('accountingDoc.beneficiary', {
        id: currentAccountingDoc.beneficiary?._id,
        name:
          currentAccountingDoc.beneficiary?.firstName +
          ' ' +
          currentAccountingDoc.beneficiary?.lastName,
        email: currentAccountingDoc.beneficiary?.email,
      })
    }

    if (currentAccountingDoc.category) {
      setFieldValue('accountingDoc.category', {
        id: currentAccountingDoc.category?._id,
        name:
          currentAccountingDoc.category?.name +
          ' (' +
          (currentAccountingDoc.category?.parent?.name ?? '') +
          ')',
      })
    }

    setFieldValue('accountingDoc.authorizer', {
      id: currentAccountingDoc.authorizer?._id,
      name:
        currentAccountingDoc.authorizer?.firstName +
        ' ' +
        currentAccountingDoc.authorizer?.lastName,
      email: currentAccountingDoc.authorizer?.email,
    })
    setFieldValue('accountingDoc.journal', {
      id: currentAccountingDoc.journal?._id,
      name: currentAccountingDoc.journal?.label,
    })
    setFieldValue('accountingDoc.docType', {
      id: currentAccountingDoc.docType?._id,
      name: currentAccountingDoc.docType?.label,
    })
    currentOrg.value = currentAccountingDoc.org
    accountingDocData.value = currentAccountingDoc.items
  }, 500)
}

async function confirmAccountingDoc() {
  const query4 = computed(() => {
    return {
      action: 'updateAccountingDoc',
      token: token.value,
      id: currentAccountingDoc.value._id,
    }
  })
  const userValidator = authStore.user._id

  const response = await useFetch('/api/accountancy/accounting-docs', {
    method: 'put',
    headers: { 'Content-Type': 'application/json' },
    query: query4,
    body: {
      ...currentAccountingDoc.value,
      validator: userValidator,
      beneficiary: values.accountingDoc?.beneficiary?.id ?? undefined,
      authorizer: values.accountingDoc?.authorizer?.id ?? undefined,
    },
  })

  if (response.data?.value?.success) {
    success.value = true
    toaster.clearAll()
    toaster.show({
      title: 'Success',
      message: 'Pièce comptable confirmée',
      color: 'success',
      icon: 'ph:check',
      closable: true,
    })
    isModalConfirmOrderOpen.value = false
    currentAccountingDoc.value.validator = authStore.user._id
    // location.reload()
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

function addOrderItem() {
  accountingDocData.value.push({
    ...curAccountingDocItem.value,
    id: accountingDocData.value.length,
  })
  curAccountingDocItem.value = {
    id: 0,
    description: '',
    account: '',
    debit: 0,
    credit: 0,
  }
}

function deleteOrderItem(id: number) {
  accountingDocData.value = accountingDocData.value?.filter((e: any) => {
    return e.id != id
  })
}

function editOrderItem(item: any) {
  curAccountingDocItem.value = { ...item }
  isEditOrderItem.value = true
}

function updateOrderItem(item: any) {
  accountingDocData.value[item.id] = item
  isEditOrderItem.value = false
}

const accountingDocData = ref([])
const isEditOrderItem = ref(false)
const curAccountingDocItem = ref({
  id: 0,
  description: '',
  account: '',
  quantity: 0,
  rate: 0,
  debit: 0,
  credit: 0,
})

watch(curAccountingDocItem, (value) => {
  setTimeout(() => {
    console.log('value')
    console.log(value)
    if (curAccountingDocItem.value.article != value.article) {
      curAccountingDocItem.value.rate = value.article.price
    }
  }, 500)
})

const totalData = computed(() => {
  const debit = accountingDocData.value.reduce((acc, item) => {
    return acc + item.debit ?? 0
  }, 0)

  const credit = accountingDocData.value.reduce((acc, item) => {
    return acc + item.credit ?? 0
  }, 0)

  return [
    {
      label: 'Total',
      debit: Math.ceil(debit),
      credit: Math.ceil(credit),
    },
  ]
})

// This is where you would send the form data to the server
const onSubmit = handleSubmit(
  async (values) => {
    success.value = false

    // here you have access to the validated form values
    console.log('accounting-doc-create-success', values)
    const contractUrl =
      isEdit.value == true
        ? ref(currentAccountingDoc?.contractUrl ?? '')
        : ref('')

    try {
      const isSuccess = ref(false)
      const accountingDocId = ref(undefined)

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

      if (isEdit.value == true) {
        const query2 = computed(() => {
          return {
            action: 'updateAccountingDoc',
            token: token.value,
            id: values.accountingDoc._id,
          }
        })

        const response = await useFetch('/api/accountancy/accounting-docs', {
          method: 'put',
          headers: { 'Content-Type': 'application/json' },
          query: query2,
          body: {
            ...values.accountingDoc,
            beneficiary: values.accountingDoc?.beneficiary?.id ?? undefined,
            category: values.accountingDoc?.category?.id ?? undefined,
            authorizer: values.accountingDoc?.authorizer?.id ?? undefined,
            journal: values.accountingDoc?.journal?.id,
            docType: values.accountingDoc?.docType?.id,
            org: currentOrg.value,
            contractUrl,
            items: accountingDocData.value,
            date: dates.value?.start ?? new Date(),
            amount:
              currentAccountingDoc.value?.length > 0
                ? totalData.value[totalData.value.length - 1].value
                : values.accountingDoc.amount,
          },
        })
        isSuccess.value = response.data.value?.success
        accountingDocId.value = response.data.value?.data._id
      } else {
        const query2 = computed(() => {
          return {
            action: 'createAccountingDoc',
            token: token.value,
          }
        })

        const response = await useFetch('/api/accountancy/accounting-docs', {
          method: 'post',
          headers: { 'Content-Type': 'application/json' },
          query: query2,
          body: {
            ...values.accountingDoc,
            beneficiary: values.accountingDoc?.beneficiary?.id ?? undefined,
            category: values.accountingDoc?.category?.id ?? undefined,
            authorizer: values.accountingDoc?.authorizer?.id ?? undefined,
            journal: values.accountingDoc?.journal?.id,
            docType: values.accountingDoc?.docType?.id,
            org: currentOrg.value,
            contractUrl,
            items: accountingDocData.value,
            date: dates.value?.start ?? new Date(),
            amount:
              currentAccountingDoc.value.length > 0
                ? totalData.value[totalData.value.length - 1].value
                : values.accountingDoc.amount,
          },
        })
        isSuccess.value = response.data.value?.success
        accountingDocId.value = response.data.value?.data._id
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
          router.push(
            '/bo/accountancy/accounting-docs/edit-' + accountingDocId.value,
          )
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

        <BaseButton
          v-if="isEdit"
          :disabled="currentAccountingDoc.validator ? true : false"
          color="warning"
          class="w-full sm:w-32"
          @click="isModalConfirmOrderOpen = true"
        >
          <Icon name="ph:check" class="h-4 w-4" />
          <span>Valider</span>
        </BaseButton>
      </template>
      <form method="POST" action="" @submit.prevent="onSubmit">
        <div class="mx-auto max-w-8xl py-5">
          <div class="mb-4 flex items-center justify-between">
            <div>
              <BaseHeading as="h2" size="xl" weight="medium" lead="none">
                Pièce comptable
                {{
                  currentAccountingDoc.validator
                    ? pageValue == 'order'
                      ? 'Confirmé'
                      : 'Confirmée'
                    : 'Brouillon'
                }}
                {{ isEdit ? ' - ' + currentAccountingDoc?.code : '' }}
              </BaseHeading>
            </div>
            <div class="flex items-center justify-end gap-3">
              <BaseButtonIcon
                v-if="pageValue == 'invoice' && pageType == 'edit'"
                @click="isModalCreatePaymentOpen = true"
                condensed
                shape="xl"
                class="!w-48"
                data-tooltip="Ajouter un règlement"
              >
                <Icon name="ph:money-duotone" class="h-4 w-4 px-1" /> Ajouter un
                reglement
              </BaseButtonIcon>
              <BaseButtonIcon
                v-if="
                  (authStore.user.appRole?.name == UserRole.accountancy ||
                    authStore.user.appRole?.name == UserRole.billing ||
                    authStore.user.appRole?.name == UserRole.admin ||
                    authStore.user.appRole?.name == UserRole.superAdmin) &&
                  pageType == 'view'
                "
                :to="
                  '/bo/accountancy/accounting-docs/edit-' +
                  currentAccountingDoc?._id
                "
                condensed
                class="!w-32"
                shape="xl"
                data-tooltip="Modifier"
              >
                <Icon name="ph:eye-duotone" class="h-4 w-4 px-1" />
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
                  '/bo/sales/orders/edit-invoice-' + currentAccountingDoc?._id
                "
                condensed
                class="!w-32"
                shape="xl"
                data-tooltip="Modifier"
              >
                <Icon name="ph:eye-duotone" class="h-4 w-4 px-1" />
                Modifier
              </BaseButtonIcon>
              <BaseButtonIcon
                @click="viewOrder()"
                condensed
                class="!w-32"
                shape="xl"
                data-tooltip="Prévisualiser"
              >
                <Icon name="ph:eye-duotone" class="h-4 w-4 px-1" />
                Prévisualiser
              </BaseButtonIcon>
              <BaseButtonIcon
                condensed
                class="!w-32"
                shape="xl"
                @click="printAccountingDoc()"
                data-tooltip="Imprimer"
              >
                <Icon name="ph:printer-duotone" class="h-4 w-4 px-1" /> Imprimer
              </BaseButtonIcon>
            </div>
          </div>
          <div id="print-accounting-doc">
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
                      class="text-muted-800 dark:text-muted-400 text-sm font-light"
                    >
                      <p
                        class="text-muted-800 dark:text-muted-100 text-right text-sm font-normal"
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
                          weight="medium"
                          lead="none"
                        >
                          Bon de caisse No:
                        </BaseHeading>
                      </div>
                    </div>
                    <div class="flex gap-12">
                      <div
                        class="text-muted-500 dark:text-muted-400 text-sm font-light"
                      >
                        <p
                          class="text-muted-800 dark:text-muted-100 text-xl font-bold"
                        >
                          {{ currentAccountingDoc?.code }}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div
                  v-if="isPrint"
                  class="border-muted-200 dark:border-muted-700 flex justify-between gap-y-8 px-6 py-4 items-center"
                >
                  <div>
                    <div class="flex gap-2 mt-2">
                      <div
                        class="text-muted-500 dark:text-muted-400 text-sm font-light"
                      >
                        <p
                          v-if="
                            currentAccountingDoc?.beneficiary ||
                            currentAccountingDoc?.extBeneficiary
                          "
                          class="text-muted-700 dark:text-muted-100 text-xs font-normal"
                        >
                          Beneficiare
                        </p>

                        <p
                          class="text-muted-700 dark:text-muted-100 mt-1 text-xs font-normal"
                        >
                          Motif :
                        </p>
                        <p
                          class="text-muted-700 dark:text-muted-100 mt-1 text-xs font-normal"
                        >
                          Créateur :
                        </p>

                        <p
                          class="text-muted-700 dark:text-muted-100 mt-1 text-xs font-normal"
                        >
                          Ordonateur :
                        </p>
                        <p
                          class="text-muted-700 dark:text-muted-100 mt-1 text-xs font-normal"
                        >
                          Société :
                        </p>
                      </div>
                      <div
                        class="text-muted-800 dark:text-muted-400 text-sm font-light"
                      >
                        <p
                          v-if="currentAccountingDoc?.beneficiary"
                          class="text-xs"
                        >
                          {{
                            currentAccountingDoc?.beneficiary?.firstName +
                            ' ' +
                            currentAccountingDoc?.beneficiary?.lastName
                          }}
                        </p>
                        <p v-else class="text-xs">
                          {{ currentAccountingDoc?.extBeneficiary }}
                        </p>
                        <p class="mt-1 text-xs">
                          {{ currentAccountingDoc?.label }}
                        </p>
                        <p class="mt-1 text-xs">
                          {{
                            currentAccountingDoc?.creator?.firstName +
                            ' ' +
                            currentAccountingDoc?.creator?.lastName
                          }}
                        </p>
                        <p class="mt-1 text-xs">
                          {{
                            currentAccountingDoc?.authorizer?.firstName +
                            ' ' +
                            currentAccountingDoc?.authorizer?.lastName
                          }}
                        </p>
                        <p class="mt-1 text-xs">
                          {{ currentAccountingDoc?.org?.name }}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div class="flex gap-2 bg-primary-500/20 p-2 mt-2">
                    <div
                      class="text-muted-500 dark:text-muted-400 text-sm font-light"
                    >
                      <p
                        v-if="currentAccountingDoc.journal"
                        class="text-muted-700 dark:text-muted-100 text-sm font-normal"
                      >
                        Journal:
                      </p>
                      <p
                        class="text-muted-700 dark:text-muted-100 text-sm mt-2 font-normal"
                      >
                        Date:
                      </p>
                      <p
                        class="text-muted-700 dark:text-muted-100 text-sm mt-2 font-normal"
                      >
                        Montant:
                      </p>
                    </div>
                    <div
                      class="text-muted-800 dark:text-muted-400 text-sm font-light"
                    >
                      <p v-if="currentAccountingDoc.journal" class="text-sm">
                        {{ currentAccountingDoc.journal?.label }}
                      </p>
                      <p class="text-sm mt-2">
                        {{
                          new Date(
                            currentAccountingDoc.date,
                          ).toLocaleDateString('fr-FR')
                        }}
                      </p>
                      <p class="text-sm mt-2">
                        {{ currentAccountingDoc.amount }} XAF
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
                        <div class="col-span-12 md:col-span-6">
                          <Field
                            v-slot="{
                              field,
                              errorMessage,
                              handleChange,
                              handleBlur,
                            }"
                            name="accountingDoc.journal"
                          >
                            <BaseAutocomplete
                              :model-value="field.value"
                              :error="errorMessage"
                              :disabled="isSubmitting"
                              @update:model-value="handleChange"
                              @blur="handleBlur"
                              :items="transformedJournals"
                              :display-value="(item: any) => item.name || ''"
                              :filter-items="filterItems"
                              icon="ph:file-duotone"
                              placeholder="Ex: Jounal de caisse dépense"
                              label="Journal"
                              clearable
                              :clear-value="''"
                            >
                              <template #empty="value">
                                <!-- Use destruct to keep what you need -->
                                <div v-if="value.query.length < 2">
                                  Saisissez au-moins 2 caractères
                                </div>
                                <div v-else>Aucun resultat.</div>
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
                            name="accountingDoc.docType"
                          >
                            <BaseAutocomplete
                              :model-value="field.value"
                              :error="errorMessage"
                              :disabled="isSubmitting"
                              @update:model-value="handleChange"
                              @blur="handleBlur"
                              :items="transformedDocTypes"
                              :display-value="(item: any) => item.name || ''"
                              :filter-items="filterItems"
                              icon="ph:file-duotone"
                              placeholder="Ex: Pice de caisse dépense"
                              label="Type de document"
                              clearable
                              :clear-value="''"
                            >
                              <template #empty="value">
                                <!-- Use destruct to keep what you need -->
                                <div v-if="value.query.length < 2">
                                  Saisissez au-moins 2 caractères
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
                            name="accountingDoc.category"
                          >
                            <BaseAutocomplete
                              :model-value="field.value"
                              :error="errorMessage"
                              :disabled="isSubmitting"
                              @update:model-value="handleChange"
                              @blur="handleBlur"
                              :items="transformedExpensesCategories"
                              :display-value="(item: any) => item.name || ''"
                              :filter-items="filterItems"
                              icon="lucide:filter"
                              placeholder="Ex: carburant"
                              label="Catégorie dépense"
                              clearable
                              :clear-value="''"
                            >
                              <template #empty="value">
                                <!-- Use destruct to keep what you need -->
                                <div v-if="value.query.length < 2">
                                  Saisissez au-moins 2 caractères
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
                            name="accountingDoc.beneficiary"
                          >
                            <BaseAutocomplete
                              :model-value="field.value"
                              :error="errorMessage"
                              :disabled="isSubmitting"
                              @update:model-value="handleChange"
                              @blur="handleBlur"
                              :items="transformedUsers"
                              :display-value="(item: any) => item.name || ''"
                              :filter-items="filterItems"
                              icon="lucide:user"
                              placeholder="Ex: nom"
                              label="Bénéficiaire"
                              clearable
                              :clear-value="''"
                            >
                              <template #empty="value">
                                <!-- Use destruct to keep what you need -->
                                <div v-if="value.query.length < 2">
                                  Saisissez au-moins 2 caractères
                                </div>
                                <div v-else>Aucun resultat.</div>
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
                            name="accountingDoc.extBeneficiary"
                          >
                            <BaseInput
                              label="Bénéficiaire externe"
                              icon="ph:user-duotone"
                              placeholder="ex: nom"
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
                            name="accountingDoc.label"
                          >
                            <BaseInput
                              label="Motif"
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

                        <div class="col-span-12 md:col-span-6">
                          <Field
                            v-slot="{
                              field,
                              errorMessage,
                              handleChange,
                              handleBlur,
                            }"
                            name="accountingDoc.amount"
                          >
                            <BaseInput
                              label="Montant"
                              icon="ph:money-duotone"
                              placeholder=""
                              type="number"
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
                            name="accountingDoc.authorizer"
                          >
                            <BaseAutocomplete
                              :model-value="field.value"
                              :error="errorMessage"
                              :disabled="isSubmitting"
                              @update:model-value="handleChange"
                              @blur="handleBlur"
                              :items="transformedUsers"
                              :display-value="(item: any) => item.name || ''"
                              :filter-items="filterItems"
                              icon="lucide:user"
                              placeholder="Ex: nom"
                              label="Ordonateur"
                              clearable
                              :clear-value="''"
                            >
                              <template #empty="value">
                                <!-- Use destruct to keep what you need -->
                                <div v-if="value.query.length < 2">
                                  Saisissez au-moins 2 caractères
                                </div>
                                <div v-else>Aucun resultat.</div>
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
                            name="accountingDoc.team"
                          >
                            <BaseSelect
                              label="Equipe"
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
                            :masks="masks"
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
                        <div class="col-span-12 md:col-span-6">
                          <Field
                            v-slot="{
                              field,
                              errorMessage,
                              handleChange,
                              handleBlur,
                            }"
                            name="accountingDoc.invoiceNumber"
                          >
                            <BaseInput
                              label="Numéro Facture"
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
                        <div class="col-span-12 md:col-span-6">
                          <Field
                            v-slot="{
                              field,
                              errorMessage,
                              handleChange,
                              handleBlur,
                            }"
                            name="accountingDoc.ref"
                          >
                            <BaseInput
                              label="Reference"
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
                <div class="px-2 py-4 sm:p-4 w-full">
                  <div class="px-2 w-full">
                    <table
                      v-if="
                        (!isPrint &&
                          currentAccountingDoc?.items?.length != 0) ||
                        !isPrint
                      "
                      class="divide-muted-200 dark:divide-muted-700 min-w-full divide-y"
                    >
                      <thead class="font-sans">
                        <tr class="bg-primary-500/20 px-2">
                          <th
                            v-if="!isPrint"
                            scope="col"
                            class="text-muted-800 dark:text-muted-400 py-2 pe-3 ps-4 text-left text-xs font-medium uppercase sm:ps-6 md:ps-0"
                          >
                            <Icon name="lucide:settings" class="h-4 w-4" />
                          </th>
                          <th
                            scope="col"
                            class="text-muted-800 dark:text-muted-400 py-2 pe-3 ps-4 text-center text-xs font-medium sm:ps-6 md:ps-0"
                          >
                            #
                          </th>
                          <th
                            v-if="!isPrint"
                            scope="col"
                            class="text-muted-800 dark:text-muted-400 py-2 pe-3 ps-4 text-center text-xs font-medium sm:ps-6 md:ps-0"
                          >
                            Compte
                          </th>
                          <th
                            scope="col"
                            class="text-muted-800 dark:text-muted-400 py-2 pe-3 ps-4 text-center text-xs font-medium sm:ps-6 md:ps-0"
                          >
                            Libellé
                          </th>
                          <th
                            scope="col"
                            class="text-muted-800 dark:text-muted-400 py-2 pe-4 ps-3 px-2 text-right text-xs font-medium sm:pe-6 md:pe-0"
                          >
                            Debit
                          </th>
                          <th
                            scope="col"
                            class="text-muted-800 dark:text-muted-400 py-2 pe-4 ps-3 px-2 text-right text-xs font-medium sm:pe-6 md:pe-0"
                          >
                            Crédit
                          </th>
                        </tr>
                      </thead>
                      <tbody class="font-sans">
                        <tr
                          v-for="(item, i) in accountingDocData"
                          :key="i"
                          class="border-muted-200 dark:border-muted-700 border-b"
                        >
                          <td
                            v-if="!isPrint"
                            class="py-4 pe-3 ps-4 text-sm sm:ps-6 md:ps-0"
                          >
                            <div
                              class="flex text-muted-800 dark:text-muted-100 font-medium"
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
                            class="text-muted-800 dark:text-muted-400 px-3 py-4 text-left text-xs sm:table-cell"
                          >
                            {{ item.id + 1 }}
                          </td>

                          <td
                            v-if="!isPrint"
                            class="px-3 py-4 text-center text-xs sm:table-cell"
                          >
                            {{ item.account.name }}
                          </td>
                          <td
                            class="text-muted-800 dark:text-muted-400 !w-48 px-3 py-4 text-center text-xs sm:table-cell"
                          >
                            <p class="w-48 break-words">
                              {{ item.description }}
                            </p>
                          </td>
                          <td
                            class="text-muted-800 dark:text-muted-100 py-4 pe-4 ps-3 text-right text-sm sm:pe-6 md:pe-0"
                          >
                            {{
                              new Intl.NumberFormat('fr-FR').format(
                                item.debit ?? 0,
                              )
                            }}
                          </td>
                          <td
                            class="text-muted-800 dark:text-muted-100 py-4 pe-4 ps-3 text-right text-sm sm:pe-6 md:pe-0"
                          >
                            {{
                              new Intl.NumberFormat('fr-FR').format(
                                item.credit ?? 0,
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
                              <BaseButtonAction
                                v-if="isEditOrderItem == true"
                                @click="updateOrderItem(curAccountingDocItem)"
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
                                  ? curAccountingDocItem.id + 1
                                  : accountingDocData.length + 1
                              }}
                            </div>
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
                                  <BaseAutocomplete
                                    v-model="curAccountingDocItem.account"
                                    :error="errorMessage"
                                    :disabled="isSubmitting || pendingAccounts"
                                    @update:model-value="handleChange"
                                    @blur="handleBlur"
                                    :items="allAccounts"
                                    :display-value="(item: any) => item.name || ''"
                                    :filter-items="filterItems"
                                    icon="ph:money-duotone"
                                    placeholder="Ex: Compte de charge"
                                    clearable
                                    :clear-value="''"
                                  >
                                    <template #empty="value">
                                      <!-- Use destruct to keep what you need -->
                                      <div v-if="value.query.length < 2">
                                        Saisissez au-moins 2 caractères
                                      </div>
                                      <div v-else>Aucun resultat.</div>
                                    </template>
                                  </BaseAutocomplete>
                                </Field>
                              </div>
                            </div>
                          </td>
                          <td
                            class="text-muted-500 dark:text-muted-400 hidden px-3 py-4 text-right text-sm sm:table-cell"
                          >
                            <BaseTextarea
                              v-model="curAccountingDocItem.description"
                              label=""
                              shape="rounded"
                              placeholder="..."
                              rows="1"
                              :classes="{
                                wrapper: 'w-64',
                              }"
                              autogrow
                            />
                          </td>
                          <td
                            class="text-muted-500 dark:text-muted-400 hidden px-3 py-4 text-right text-sm sm:table-cell"
                          >
                            <BaseInput
                              v-model="curAccountingDocItem.debit"
                              label=""
                              shape="rounded"
                              type="number"
                              placeholder=""
                              :classes="{
                                wrapper: 'w-32',
                              }"
                              autogrow
                            />
                          </td>
                          <td
                            class="text-muted-500 dark:text-muted-400 hidden px-3 py-4 text-right text-sm sm:table-cell"
                          >
                            <BaseInput
                              v-model="curAccountingDocItem.credit"
                              label=""
                              shape="rounded"
                              type="number"
                              placeholder=""
                              :classes="{
                                wrapper: 'w-32',
                              }"
                              autogrow
                            />
                          </td>
                        </tr>
                      </tbody>
                      <tfoot>
                        <tr clas="" v-for="item in totalData" :key="item.label">
                          <th
                            scope="row"
                            :colspan="isPrint ? '2' : '4'"
                            class="text-muted-800 dark:text-muted-400 pe-3 ps-6 pt-2 text-right text-xs font-light"
                          >
                            {{ item.label }}
                          </th>
                          <td
                            scope="row"
                            colspan="1"
                            class="pe-4 ps-3 pt-2 text-right sm:pe-6 text-xs text-muted-800 dark:text-muted-200/70"
                          >
                            {{
                              new Intl.NumberFormat('fr-FR').format(item.debit)
                            }}
                            XAF
                          </td>
                          <td
                            scope="row"
                            colspan="1"
                            class="pe-4 ps-3 pt-2 text-right sm:pe-6 text-xs text-muted-800 dark:text-muted-200/70"
                          >
                            {{
                              new Intl.NumberFormat('fr-FR').format(item.credit)
                            }}
                            XAF
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </div>

                <div v-if="isPrint" class="p-2">
                  <BaseParagraph class="!py-2 dark:text-muted-400" size="xs">
                    Montant en lettre :
                    <span class="font-bold"
                      >{{
                        new ToWords({ localeCode: 'fr-FR' }).convert(
                          currentAccountingDoc?.amount,
                        )
                      }}
                      Francs CFA.</span
                    >
                  </BaseParagraph>
                  <div
                    class="border-muted-200 dark:border-muted-700 border-t pt-2"
                  >
                    <div class="dark:text-muted-400">
                      <BaseParagraph size="xs">
                        Mode de règlement :
                        {{ currentAccountingDoc?.paymentMethod?.label }}
                      </BaseParagraph>
                    </div>
                  </div>
                </div>
                <div class="mt-2 p-8 flex justify-between">
                  <div class="dark:text-muted-400">
                    <BaseParagraph size="xs">
                      Signature Bénéficiaire
                    </BaseParagraph>
                  </div>
                  <div class="dark:text-muted-400">
                    <BaseParagraph size="xs"> Signature Caisse </BaseParagraph>
                  </div>
                </div>
                <footer
                  v-if="isPrint"
                  class="flex items-end justif-center w-full absolute inset-x-0 bottom-0"
                >
                  <div class="w-full pb-2">
                    <div
                      class="dark:text-muted-400 border-primary-500 pb-1 text-center dark:border-primary-700 border-b-2"
                    >
                      <BaseParagraph size="xs">
                        {{ currentAccountingDoc?.org?.footerTitle }}
                      </BaseParagraph>
                    </div>
                    <div class="dark:text-muted-400 py-1 text-center">
                      <BaseParagraph size="xs">
                        Contact : {{ currentAccountingDoc?.org?.phone }}
                        {{
                          currentAccountingDoc?.org?.phone2
                            ? '/ ' + currentAccountingDoc?.org?.phone2
                            : ''
                        }}; {{ currentAccountingDoc?.org?.address }}
                      </BaseParagraph>
                      <BaseParagraph size="xs">
                        RC : {{ currentAccountingDoc?.org?.rc }}; NC :
                        {{ currentAccountingDoc?.org?.nc }}
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
            Confirmation PC
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
            Voulez-vous confirmer la pièce
            <span class="text-primary-500">{{
              currentAccountingDoc.code
            }}</span>
            créer par
            <span class="text-primary-500"
              >{{ currentAccountingDoc?.creator?.firstName }}
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

            <BaseButton
              color="primary"
              flavor="solid"
              @click="confirmAccountingDoc()"
              >Valider</BaseButton
            >
          </div>
        </div>
      </template>
    </TairoModal>
  </div>
</template>
