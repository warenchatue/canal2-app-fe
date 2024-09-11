<script setup lang="ts">
import { toTypedSchema } from '@vee-validate/zod'
import { DatePicker } from 'v-calendar'
import { Field, useForm } from 'vee-validate'
import { z } from 'zod'
import { UserRole } from '~/types/user'

definePageMeta({
  title: 'Règlements',
  preview: {
    title: 'Règlements',
    description: 'Règlements factures',
    categories: ['bo', 'sales', 'payments'],
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
const isPrint = ref(false)
const isModalNewPaymentOpen = ref(false)
const isModalDeletePaymentOpen = ref(false)
const isModalPaymentsReportOpen = ref(false)
const isEdit = ref(false)
const toaster = useToaster()
const currentPayment = ref({})
const currentOrg = ref('')
const currentTeam = ref('')
const startDate = ref(new Date())
const endDate = ref(new Date())
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

const token = useCookie('token')
const queryNoFilter = computed(() => {
  return {
    filter: '',
    perPage: perPage.value,
    page: page.value,
    action: 'findAll',
    token: token.value,
  }
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

const { data, pending, refresh } = await useFetch('/api/transactions', {
  query,
  lazy: true,
})

const { data: orgs } = await useFetch('/api/admin/orgs', {
  query: queryNoFilter,
})

function openReportModal() {
  setTimeout(() => {
    isModalPaymentsReportOpen.value = true
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

  const { data: reportData } = await useFetch('/api/transactions', {
    query: queryP,
  })
  data.value = reportData.value
  isPrint.value = true
  setTimeout(() => {
    var printContents = document.getElementById(
      'print-payments-report',
    )!.innerHTML
    var originalContents = document.body.innerHTML
    document.body.innerHTML = printContents
    window.print()
    document.body.innerHTML = originalContents
    location.reload()
  }, 500)
}

function confirmEditPayment(payment: any) {
  isModalNewPaymentOpen.value = true
  isEdit.value = true
  currentPayment.value = payment
  setFieldValue('payment._id', payment._id)
  setFieldValue('payment.code', payment.code)
  setFieldValue('payment.amount', payment.amount)
  setFieldValue('payment.status', payment.status)
  setFieldValue('payment.message', payment.message)
  setFieldValue('payment.announcer', payment.announcer)
  setFieldValue('payment.org', payment.org)
  setFieldValue('payment.author', payment.author)
  setFieldValue('payment.data.invoiceId', payment.data.invoiceId)
  setFieldValue('payment.data.invoiceCode', payment.data.invoiceCode)
  setFieldValue('payment.data.city', payment.data.city)
  startDate.value = payment.date
}

function confirmDeletePayment(payment: any) {
  isModalDeletePaymentOpen.value = true
  isEdit.value = false
  currentPayment.value = payment
}

async function deletePayment(payment: any) {
  const query2 = computed(() => {
    return {
      action: 'deleteWithInvoice',
      token: token.value,
      id: payment._id,
    }
  })

  const response = await useFetch('/api/transactions', {
    method: 'delete',
    headers: { 'Content-Type': 'application/json' },
    query: query2,
  })

  if (response.data?.value?.success) {
    success.value = true
    toaster.clearAll()
    toaster.show({
      title: 'Success',
      message: `Transaction supprimée !`,
      color: 'success',
      icon: 'ph:check',
      closable: true,
    })
    isModalDeletePaymentOpen.value = false
    filter.value = 'payment'
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
    payment: z.object({
      _id: z.string().optional(),
      code: z.string().optional(),
      date: z.string().optional(),
      amount: z.number(),
      status: z.string(),
      message: z.string().optional(),
      data: z
        .object({
          invoiceId: z.string(),
          invoiceCode: z.string(),
          city: z.string(),
        })
        .optional()
        .nullable(),
      announcer: z
        .object({
          _id: z.string(),
          email: z.string().optional(),
          name: z.string(),
        })
        .optional()
        .nullable(),
      author: z
        .object({
          _id: z.string(),
          email: z.string().optional(),
          lastName: z.string(),
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
    }),
  })
  .superRefine((data, ctx) => {
    if (!data.payment.amount) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: VALIDATION_TEXT.LABEL_REQUIRED,
        path: ['payment.label'],
      })
    }
  })

// Zod has a great infer method that will
// infer the shape of the schema into a TypeScript type
type FormInput = z.infer<typeof zodSchema>

const validationSchema = toTypedSchema(zodSchema)
const initialValues = computed<FormInput>(() => ({
  avatar: null,
  payment: {
    amount: 0,
    status: 'onHold',
    announcer: {
      _id: '',
      email: '',
      name: '',
    },
    author: {
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
    console.log('payment-create-success', values)
    try {
      const isSuccess = ref(false)

      if (isEdit.value == true) {
        const query2 = computed(() => {
          return {
            action: 'updatePayment',
            token: token.value,
            id: values.payment._id,
          }
        })

        const response = await useFetch('/api/transactions', {
          method: 'post',
          headers: { 'Content-Type': 'application/json' },
          query: query2,
          body: {
            ...currentPayment.value,
            announcer: currentPayment.value?.announcer?._id,
            author: currentPayment.value?.author?._id,
            org: currentPayment.value?.org?._id,
            paymentAccount: currentPayment.value?.paymentAccount?._id,
            status: values.payment.status,
            message: values.payment.message,
            date: startDate.value,
            data: {
              ...currentPayment.value.data,
              city: values.payment.data?.city,
            },
          },
        })
        isSuccess.value = response.data.value?.success
      } else {
        const query2 = computed(() => {
          return {
            action: 'createPayment',
            token: token.value,
          }
        })

        const response = await useFetch('/api/transactions', {
          method: 'post',
          headers: { 'Content-Type': 'application/json' },
          query: query2,
          body: {
            ...currentPayment.value,
            announcer: currentPayment.value?.announcer?._id,
            author: currentPayment.value?.author?._id,
            org: currentPayment.value?.org?._id,
            paymentAccount: currentPayment.value?.paymentAccount?._id,
            status: values.payment.status,
            message: values.payment.message,
            data: {
              ...currentPayment.value.data,
              city: values.payment.data?.city,
            },
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
            isEdit.value == false ? `Payment créé !` : `Payment mis à jour`,
          color: 'success',
          icon: 'ph:check',
          closable: true,
        })
        isModalNewPaymentOpen.value = false
        resetForm()
        filter.value = 'payment'
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
          class="w-full sm:w-40"
          @click="openReportModal()"
        >
          <Icon name="ph:file" class="h-4 w-4" />
          <span>Rapports</span>
        </BaseButton>
        <BaseButton :disabled="true" color="primary" class="w-full sm:w-52">
          <Icon name="ph:plus" class="h-4 w-4" />
          <span>Nouveau</span>
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
                <span v-if="!pending">{{ data?.data?.length ?? 0 }}</span>
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
                <span>En Especes</span>
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
                <span v-if="!pending">0</span>
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
                <span>Par Chèque</span>
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
                <span v-if="!pending">0</span>
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
                <span v-if="!pending">0</span>
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

      <div id="print-payments-report" class="mx-2">
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
          class="font-heading text-muted-900 text-xs font-medium pb-1 pt-1 px-2 leading-6 dark:text-white"
        >
          Etat des paiments du
          {{ new Date(startDate).toLocaleDateString('fr-FR') }} au
          {{ new Date(endDate).toLocaleDateString('fr-FR') }} Pour la ville de
          {{ currentTeam ? currentTeam.toUpperCase() : 'Douala et Yaounde' }} de
          la société
          {{ currentOrg?.name ?? '' }}
        </h4>
        <h5
          v-if="isPrint"
          class="font-heading text-muted-900 text-xs font-medium py-1 leading-6 px-2 dark:text-white"
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
                  <TairoTableHeading uppercase spaced>Date</TairoTableHeading>
                  <TairoTableHeading uppercase spaced>
                    Annonceur
                  </TairoTableHeading>
                  <TairoTableHeading uppercase spaced>
                    Numéro facture
                  </TairoTableHeading>
                  <TairoTableHeading uppercase spaced>
                    Societé
                  </TairoTableHeading>
                  <TairoTableHeading uppercase spaced>
                    Journal
                  </TairoTableHeading>
                  <TairoTableHeading uppercase spaced>
                    Vendeur
                  </TairoTableHeading>
                  <TairoTableHeading uppercase spaced>
                    Montant règlement
                  </TairoTableHeading>
                  <TairoTableHeading uppercase spaced>
                    Ville
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
                    {{
                      new Date(item.date ?? item.createdAt).toLocaleDateString(
                        'fr-FR',
                      )
                    }}
                  </TairoTableCell>
                  <TairoTableCell spaced>
                    <div
                      style="white-space: pre-wrap; word-wrap: break-word"
                      class="flex items-center"
                    >
                      <BaseAvatar
                        :src="item.author?.logo ?? '/img/avatars/company.svg'"
                        :text="item.initials"
                        :class="getRandomColor()"
                      />
                      <div class="!w-48 ms-3">
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
                    <NuxtLink
                      class="text-primary-500 underline-offset-4 hover:underline"
                      :to="
                        '/bo/sales/orders/view-invoice-' + item.data?.invoiceId
                      "
                    >
                      {{ item.data?.invoiceCode }}
                    </NuxtLink>
                  </TairoTableCell>

                  <TairoTableCell light spaced>
                    {{ item.org.name }}
                  </TairoTableCell>
                  <TairoTableCell light spaced>
                    {{ item.paymentAccount?.label }}
                  </TairoTableCell>
                  <TairoTableCell light spaced>
                    {{ item.author?.firstName }}
                  </TairoTableCell>
                  <TairoTableCell light spaced>
                    {{
                      new Intl.NumberFormat().format(
                        Math.ceil(item.amount ?? 0),
                      )
                    }}
                    XAF
                  </TairoTableCell>
                  <TairoTableCell light spaced
                    >{{ item.data?.city?.toUpperCase() ?? 'DOUALA' }}
                  </TairoTableCell>

                  <TairoTableCell v-if="!isPrint" spaced class="capitalize">
                    <BaseTag
                      v-if="item.status === 'completed'"
                      color="success"
                      flavor="pastel"
                      shape="full"
                      condensed
                      class="font-medium"
                    >
                      {{ item.status }}
                    </BaseTag>
                    <BaseTag
                      v-else-if="item.status === 'onHold'"
                      color="warning"
                      flavor="pastel"
                      shape="full"
                      condensed
                      class="font-medium"
                    >
                      {{ item.status }}
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
                        :disabled="
                          authStore.user.appRole?.name != UserRole.billing &&
                          authStore.user.appRole?.name !=
                            UserRole.accountancy &&
                          authStore.user.appRole?.name != UserRole.admin &&
                          authStore.user.appRole?.name != UserRole.superAdmin
                        "
                        @click="confirmEditPayment(item)"
                      >
                        <Icon name="lucide:edit" class="h-4 w-4"
                      /></BaseButtonAction>
                      <BaseButtonAction
                        @click="confirmDeletePayment(item)"
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
                  <TairoTableCell light spaced> </TairoTableCell>
                  <TairoTableCell v-if="!isPrint" light spaced>
                  </TairoTableCell>
                  <TairoTableCell light spaced> </TairoTableCell>
                  <TairoTableCell light spaced> </TairoTableCell>
                  <TairoTableCell light spaced>
                    <span class="text-bold">Total:</span>
                  </TairoTableCell>
                  <TairoTableCell light spaced>
                    <span class="text-bold">
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
                      XAF</span
                    >
                  </TairoTableCell>

                  <TairoTableCell v-if="!isPrint" light spaced>
                  </TairoTableCell>
                  <TairoTableCell v-if="!isPrint" spaced> </TairoTableCell>
                </TairoTableRow>
              </TairoTable>
            </div>
            <div class="mt-6">
              <BasePagination
                v-if="!isPrint"
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

    <!-- Modal delete -->
    <TairoModal
      :open="isModalDeletePaymentOpen"
      size="sm"
      @close="isModalDeletePaymentOpen = false"
    >
      <template #header>
        <!-- Header -->
        <div class="flex w-full items-center justify-between p-4 md:p-6">
          <h3
            class="font-heading text-muted-900 text-lg font-medium leading-6 dark:text-white"
          >
            Suppression d'un paiement
          </h3>

          <BaseButtonClose @click="isModalDeletePaymentOpen = false" />
        </div>
      </template>

      <!-- Body -->
      <div class="p-4 md:p-6">
        <div class="mx-auto w-full max-w-xs text-center">
          <h3
            class="font-heading text-muted-800 text-lg font-medium leading-6 dark:text-white"
          >
            Supprimer le payment pour la facture
            <span class="text-red-500">{{
              currentPayment.data.invoiceCode ?? ''
            }}</span>
            ?
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
            <BaseButton @click="isModalDeletePaymentOpen = false"
              >Annuler</BaseButton
            >

            <BaseButton
              color="primary"
              flavor="solid"
              @click="deletePayment(currentPayment)"
              >Suppimer</BaseButton
            >
          </div>
        </div>
      </template>
    </TairoModal>

    <!-- Modal import new report -->
    <TairoModal
      :open="isModalPaymentsReportOpen"
      size="xl"
      @close="isModalPaymentsReportOpen = false"
    >
      <template #header>
        <!-- Header -->
        <div class="flex w-full items-center justify-between p-4 md:p-6">
          <h3
            class="font-heading text-muted-900 text-lg font-medium leading-6 dark:text-white"
          >
            Rapport des ventes
          </h3>

          <BaseButtonClose @click="isModalPaymentsReportOpen = false" />
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
                      @update:model-value="handleChange"
                      @blur="handleBlur"
                    />
                  </Field>
                </div>
                <div class="col-span-12 md:col-span-6">
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
            <BaseButton @click="isModalPaymentsReportOpen = false"
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

    <!-- Modal import edit payment -->
    <TairoModal
      :open="isModalNewPaymentOpen"
      size="xl"
      @close="isModalNewPaymentOpen = false"
    >
      <template #header>
        <!-- Header -->
        <div class="flex w-full items-center justify-between p-4 md:p-6">
          <h3
            class="font-heading text-muted-900 text-lg font-medium leading-6 dark:text-white"
          >
            Mise à jour paiment
          </h3>

          <BaseButtonClose @click="isModalNewPaymentOpen = false" />
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
              <div class="grid grid-cols-12 gap-4 mt-4">
                <div class="col-span-12 md:col-span-6">
                  <Field
                    v-slot="{ field, errorMessage, handleChange, handleBlur }"
                    name="payment.code"
                  >
                    <BaseInput
                      label="Reference"
                      icon="ph:money-duotone"
                      placeholder=""
                      :model-value="field.value"
                      :error="errorMessage"
                      :disabled="true"
                      @update:model-value="handleChange"
                      @blur="handleBlur"
                    />
                  </Field>
                </div>
                <div class="col-span-12 md:col-span-6">
                  <Field
                    v-slot="{ field, errorMessage, handleChange, handleBlur }"
                    name="payment.amount"
                  >
                    <BaseInput
                      label="Montant"
                      icon="ph:money-duotone"
                      placeholder=""
                      :model-value="field.value"
                      :error="errorMessage"
                      :disabled="true"
                      @update:model-value="handleChange"
                      @blur="handleBlur"
                    />
                  </Field>
                </div>
                <div class="col-span-12 md:col-span-6">
                  <Field
                    v-slot="{ field, errorMessage, handleChange, handleBlur }"
                    name="payment.data.invoiceCode"
                  >
                    <BaseInput
                      label="Numéro de Facture"
                      icon="ph:file-duotone"
                      placeholder=""
                      :model-value="field.value"
                      :error="errorMessage"
                      :disabled="true"
                      @update:model-value="handleChange"
                      @blur="handleBlur"
                    />
                  </Field>
                </div>
                <div class="col-span-12 md:col-span-6">
                  <Field
                    v-slot="{ field, errorMessage, handleChange, handleBlur }"
                    name="payment.data.city"
                  >
                    <BaseSelect
                      label="Ville"
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
                <div class="col-span-12 md:col-span-6">
                  <DatePicker
                    v-model="startDate"
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
                            name="payment.date"
                          >
                            <BaseInput
                              label="Date"
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

                <div class="col-span-12 md:col-span-6">
                  <Field
                    v-slot="{ field, errorMessage, handleChange, handleBlur }"
                    name="payment.status"
                  >
                    <BaseSelect
                      label="Statut"
                      icon="ph:funnel"
                      :model-value="field.value"
                      :error="errorMessage"
                      @update:model-value="handleChange"
                      @blur="handleBlur"
                    >
                      <option value="onHold">En Attente</option>
                      <option value="completed">Success</option>
                      <option value="failed">Echec</option>
                    </BaseSelect>
                  </Field>
                </div>
                <div class="col-span-12 md:col-span-12">
                  <Field
                    v-slot="{ field, errorMessage, handleChange, handleBlur }"
                    name="payment.message"
                  >
                    <BaseTextarea
                      :model-value="field.value"
                      label="Notes importantes"
                      shape="rounded"
                      placeholder="..."
                      rows="4"
                      autogrow
                    />
                  </Field>
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
            <BaseButton @click="isModalNewPaymentOpen = false"
              >Annuler</BaseButton
            >

            <BaseButton color="primary" flavor="solid" @click="onSubmit">
              {{ isEdit == true ? 'Modifier' : 'Créer' }}
            </BaseButton>
          </div>
        </div>
      </template>
    </TairoModal>
  </div>
</template>
