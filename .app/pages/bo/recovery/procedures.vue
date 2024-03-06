<script setup lang="ts">
import { toTypedSchema } from '@vee-validate/zod'
import { DatePicker } from 'v-calendar'
import { Field, useForm } from 'vee-validate'
import 'vue-select/dist/vue-select.css'
import { z } from 'zod'
import { UserRole } from '~/types/user'

definePageMeta({
  title: 'Recouvrements',
  preview: {
    title: 'Recouvrements',
    description: 'Recouvrements',
    categories: ['bo', 'recovery', 'procedures'],
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
const perPage = ref(100)
const isModalNewRecoveryProcedureOpen = ref(false)
const isModalDeletePackageOpen = ref(false)
const isModalConfirmOrderOpen = ref(false)
const isEdit = ref(false)
const toaster = useToaster()
const dates = ref({
  start: new Date(),
  end: new Date(),
})
// Check if can have access
if (
  authStore.user.appRole.name != UserRole.accountancy &&
  authStore.user.appRole.name != UserRole.billing &&
  authStore.user.appRole.name != UserRole.sale &&
  authStore.user.appRole.name != UserRole.accountancy &&
  authStore.user.appRole.name != UserRole.admin &&
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
    filter: filter.value,
    perPage: 12000,
    page: page.value,
    action: 'findAll',
    token: token.value,
  }
})

const { data, pending } = await useFetch('/api/recovery/recovery-procedures', {
  query,
})

const { data: announcers } = await useFetch('/api/sales/announcers', {
  query: query2,
})

const transformedAnnouncers = announcers.value?.data.map((e: any) => {
  const invoice = {
    id: e._id,
    name: e.name,
  }
  return invoice
})

const { data: allUsers } = await useFetch('/api/users', {
  query,
})

const transformedUsers = allUsers.value?.data.map((e: any) => {
  const invoice = {
    id: e._id,
    name: e.firstName + ' ' + e.lastName,
    text: e.email,
  }
  return invoice
})

const adminsUser = allUsers.value?.data.filter((e: any) => {
  return e.appRole?.name == UserRole.admin
})

function editRecoveryProcedure(recoveryProcedure: any) {
  isModalNewRecoveryProcedureOpen.value = true
  isEdit.value = true
  currentRecoveryProcedure.value = recoveryProcedure
  setFieldValue('recoveryProcedure._id', recoveryProcedure._id)
  setFieldValue('recoveryProcedure.code', recoveryProcedure.code)
  setFieldValue('recoveryProcedure.description', recoveryProcedure.description)
  setFieldValue('recoveryProcedure.amount', recoveryProcedure.amount)
  setFieldValue('recoveryProcedure.status', recoveryProcedure.status)
  setFieldValue('recoveryProcedure.validator', recoveryProcedure.validator)
  setFieldValue('recoveryProcedure.announcer', {
    id: recoveryProcedure.announcer._id,
    name: recoveryProcedure.announcer.name,
    text: recoveryProcedure.announcer.phone,
  })
  setFieldValue('recoveryProcedure.agent1', {
    id: recoveryProcedure.agent1._id,
    name:
      recoveryProcedure.agent1.firstName +
      ' ' +
      recoveryProcedure.agent1.lastName,
    text: recoveryProcedure.announcer.email,
  })
  setFieldValue('recoveryProcedure.agent2', {
    id: recoveryProcedure.agent2._id,
    name:
      recoveryProcedure.agent2.firstName +
      ' ' +
      recoveryProcedure.agent2.lastName,
    text: recoveryProcedure.agent2.email,
  })
  setFieldValue('recoveryProcedure.agent3', {
    id: recoveryProcedure.agent3._id,
    name:
      recoveryProcedure.agent3.firstName +
      ' ' +
      recoveryProcedure.agent3.lastName,
    text: recoveryProcedure.agent3.email,
  })
  setFieldValue('recoveryProcedure.agent4', {
    id: recoveryProcedure.agent4._id,
    name:
      recoveryProcedure.agent4.firstName +
      ' ' +
      recoveryProcedure.agent4.lastName,
    text: recoveryProcedure.agent4.email,
  })
}

function confirmDeletePackage(recoveryProcedure: any) {
  isModalDeletePackageOpen.value = true
  isEdit.value = false
  currentRecoveryProcedure.value = recoveryProcedure
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

async function deletePackage(recoveryProcedure: any) {
  const query2 = computed(() => {
    return {
      action: 'delete',
      token: token.value,
      id: recoveryProcedure._id,
    }
  })

  const response = await useFetch('/api/recovery/recovery-procedures', {
    method: 'delete',
    headers: { 'Content-Type': 'application/json' },
    query: query2,
  })

  if (response.data?.value?.success) {
    success.value = true
    toaster.clearAll()
    toaster.show({
      title: 'Success',
      message: `Dossier supprimé !`,
      color: 'success',
      icon: 'ph:check',
      closable: true,
    })
    isModalDeletePackageOpen.value = false
    filter.value = 'recoveryProcedure'
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

const currentRecoveryProcedure = ref({})

// This is the object that will contain the validation messages
const ONE_MB = 1000000
const VALIDATION_TEXT = {
  AMOUNT_REQUIRED: "Amount can't be empty",
  ANNOUNCER_REQUIRED: "Announcer can't be empty",
  EMAIL_REQUIRED: "Email address can't be empty",
  COUNTRY_REQUIRED: 'Please select a country',
}

// This is the Zod schema for the form input
// It's used to define the shape that the form data will have
const zodSchema = z
  .object({
    recoveryProcedure: z.object({
      _id: z.string().optional(),
      code: z.string().optional(),
      description: z.string().optional(),
      amount: z.number().optional(),
      status: z
        .union([
          z.literal('onHold'),
          z.literal('inProgress'),
          z.literal('closed'),
        ])
        .optional(),
      announcer: z
        .object({
          id: z.string(),
          name: z.string(),
          text: z.string().optional(),
        })
        .optional()
        .nullable(),
      agent1: z
        .object({
          id: z.string(),
          name: z.string(),
          text: z.string().optional(),
        })
        .optional()
        .nullable(),
      agent2: z
        .object({
          id: z.string(),
          name: z.string(),
          text: z.string().optional(),
        })
        .optional()
        .nullable(),

      agent3: z
        .object({
          id: z.string(),
          name: z.string(),
          text: z.string().optional(),
        })
        .optional()
        .nullable(),
      agent4: z
        .object({
          id: z.string(),
          name: z.string(),
          text: z.string().optional(),
        })
        .optional()
        .nullable(),
      validator: z
        .object({
          _id: z.string(),
          firstName: z.string(),
          lastName: z.string(),
          email: z.string().optional(),
        })
        .optional()
        .nullable(),
    }),
  })
  .superRefine((data, ctx) => {
    if (!data.recoveryProcedure.announcer) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: VALIDATION_TEXT.ANNOUNCER_REQUIRED,
        path: ['recoveryProcedure.announcer'],
      })
    }
  })

// Zod has a great infer method that will
// infer the shape of the schema into a TypeScript type
type FormInput = z.infer<typeof zodSchema>

const validationSchema = toTypedSchema(zodSchema)
const initialValues = computed<FormInput>(() => ({
  avatar: null,
  recoveryProcedure: {
    code: '',
    amount: 0,
    status: 'onHold',
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
      id: currentRecoveryProcedure.value._id,
    }
  })
  currentRecoveryProcedure.value.adminValidated = true

  const response = await useFetch('/api/pub/packages', {
    method: 'put',
    headers: { 'Content-Type': 'application/json' },
    query: query4,
    body: { ...currentRecoveryProcedure.value },
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
    console.log('recovery-procedure-create-success', values)

    try {
      const isSuccess = ref(false)

      if (isEdit.value == true) {
        const query2 = computed(() => {
          return {
            action: 'updateRecoveryProcedure',
            token: token.value,
            id: values.recoveryProcedure._id,
          }
        })

        const response = await useFetch('/api/recovery/recovery-procedures', {
          method: 'put',
          headers: { 'Content-Type': 'application/json' },
          query: query2,
          body: {
            ...values.recoveryProcedure,
            announcer: values.recoveryProcedure?.announcer?.id ?? undefined,
            agent1: values.recoveryProcedure?.agent1?.id ?? undefined,
            agent2: values.recoveryProcedure?.agent2?.id ?? undefined,
            agent3: values.recoveryProcedure?.agent3?.id ?? undefined,
            agent4: values.recoveryProcedure?.agent4?.id ?? undefined,
            validator: values.recoveryProcedure?.validator?._id ?? undefined,
            date: dates.value?.start ?? new Date(),
          },
        })
        isSuccess.value = response.data.value?.success
      } else {
        const query2 = computed(() => {
          return {
            action: 'createRecoveryProcedure',
            token: token.value,
          }
        })

        const response = await useFetch('/api/recovery/recovery-procedures', {
          method: 'post',
          headers: { 'Content-Type': 'application/json' },
          query: query2,
          body: {
            ...values.recoveryProcedure,
            announcer: values.recoveryProcedure?.announcer?.id ?? undefined,
            agent1: values.recoveryProcedure?.agent1?.id ?? undefined,
            agent2: values.recoveryProcedure?.agent2?.id ?? undefined,
            agent3: values.recoveryProcedure?.agent3?.id ?? undefined,
            agent4: values.recoveryProcedure?.agent4?.id ?? undefined,
            validator: values.recoveryProcedure?.validator?._id ?? undefined,
            _id: undefined,
            date: dates.value?.start ?? new Date(),
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
            isEdit.value == false ? `Dossier crée !` : `Dossier mis à jour`,
          color: 'success',
          icon: 'ph:check',
          closable: true,
        })
        isModalNewRecoveryProcedureOpen.value = false
        resetForm()
        filter.value = 'recoveryProcedure'
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
    }

    success.value = true
  },
  (error) => {
    // this callback is optional and called only if the form has errors
    success.value = false

    // here you have access to the error
    console.log('recovery-procedure-create-error', error)

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
          placeholder="Filtrer dossier..."
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
          @click=";(isModalNewRecoveryProcedureOpen = true), (isEdit = false)"
        >
          <Icon name="ph:plus" class="h-4 w-4" />
          <span>Nouveau dossier</span>
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
                <span>Montant Total</span>
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
                <span
                  >{{
                    new Intl.NumberFormat().format(
                      Math.ceil(data?.metaData?.totalAmount ?? 0),
                    )
                  }}
                  XAF</span
                >
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
                <span>Montant recouvré</span>
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
                <span
                  >{{
                    new Intl.NumberFormat().format(
                      Math.ceil(data?.metaData?.totalPaid ?? 0),
                    )
                  }}
                  XAF</span
                >
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
                <span>Montant restant</span>
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
                <span>
                  {{
                    new Intl.NumberFormat().format(
                      Math.ceil(
                        (data?.metaData?.totalAmount ?? 0) -
                          (data?.metaData?.totalPaid ?? 0),
                      ),
                    )
                  }}
                  XAF</span
                >
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
                <span>Total Annonceurs</span>
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
                <span>{{ data?.metaData?.totalAnnouncers }}</span>
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
                  Annonceur</TairoTableHeading
                >

                <TairoTableHeading uppercase spaced>
                  Description</TairoTableHeading
                >

                <TairoTableHeading uppercase spaced>Montant</TairoTableHeading>

                <TairoTableHeading uppercase spaced>Payé</TairoTableHeading>
                <TairoTableHeading uppercase spaced>Solde</TairoTableHeading>

                <TairoTableHeading uppercase spaced>Statut</TairoTableHeading>
                <TairoTableHeading uppercase spaced>Agents</TairoTableHeading>

                <TairoTableHeading uppercase spaced>Docs</TairoTableHeading>

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
                    :to="'/bo/recovery/procedure-details-' + item._id"
                  >
                    {{ item.code }}
                  </NuxtLink>
                </TairoTableCell>
                <TairoTableCell light spaced>
                  {{ new Date(item.date).toLocaleDateString('fr-FR') }}
                </TairoTableCell>
                <TairoTableCell spaced>
                  <div class="flex items-center">
                    <BaseAvatar
                      :src="item.announcer?.logo ?? '/img/avatars/company.svg'"
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
                  {{ item.description }}
                </TairoTableCell>
                <TairoTableCell light spaced>
                  {{
                    new Intl.NumberFormat().format(Math.ceil(item.amount ?? 0))
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
                      Math.ceil((item.amount ?? 0) - (item.paid ?? 0)),
                    )
                  }}
                  XAF
                </TairoTableCell>

                <TairoTableCell spaced class="capitalize">
                  <BaseTag
                    v-if="item.status === 'onHold'"
                    color="warning"
                    flavor="pastel"
                    shape="full"
                    condensed
                    class="font-medium"
                  >
                    En attente
                  </BaseTag>
                  <BaseTag
                    v-else-if="item.status === 'inProgress'"
                    color="success"
                    flavor="pastel"
                    shape="full"
                    condensed
                    class="font-medium"
                  >
                    En cours
                  </BaseTag>
                  <BaseTag
                    v-else-if="item.status === 'closed'"
                    color="muted"
                    flavor="pastel"
                    shape="full"
                    condensed
                    class="font-medium"
                  >
                    Cloturé
                  </BaseTag>
                </TairoTableCell>
                <TairoTableCell light spaced>
                  <p v-if="item.agent1">
                    Agent 1-
                    {{ item.agent1.firstName + ' ' + item.agent1.lastName }}
                  </p>
                  <p v-if="item.agent2">
                    Agent 2-
                    {{ item.agent2.firstName + ' ' + item.agent2.lastName }}
                  </p>
                  <p v-if="item.agent3">
                    Agent 3-
                    {{ item.agent3.firstName + ' ' + item.agent3.lastName }}
                  </p>
                  <p v-if="item.agent4">
                    Agent 4-
                    {{ item.agent4.firstName + ' ' + item.agent4.lastName }}
                  </p>
                </TairoTableCell>

                <TairoTableCell light spaced>
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
                    <BaseButtonAction
                      @click="editRecoveryProcedure(item)"
                      :disabled="
                        authStore.user._id != item.agent1?._id &&
                        authStore.user._id != item.agent2?._id &&
                        authStore.user._id != item.agent3?._id &&
                        authStore.user._id != item.agent4?._id &&
                        authStore.user.appRole?.name != UserRole.accountancy &&
                        authStore.user.appRole?.name != UserRole.superAdmin
                      "
                    >
                      <Icon name="lucide:edit" class="h-4 w-4"
                    /></BaseButtonAction>
                    <BaseButtonAction
                      @click="confirmDeletePackage(item)"
                      class="mx-2"
                      :disabled="
                        authStore.user.appRole?.name != UserRole.accountancy &&
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
      :open="isModalNewRecoveryProcedureOpen"
      size="3xl"
      @close="isModalNewRecoveryProcedureOpen = false"
    >
      <template #header>
        <!-- Header -->
        <div class="flex w-full items-center justify-between p-4 md:p-6">
          <h3
            class="font-heading text-muted-900 text-lg font-medium leading-6 dark:text-white"
          >
            {{ isEdit == true ? 'Editer' : 'Nouveau' }} Dossier
          </h3>

          <BaseButtonClose @click="isModalNewRecoveryProcedureOpen = false" />
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
                      name="recoveryProcedure.announcer"
                    >
                      <BaseAutocomplete
                        :model-value="field.value"
                        :error="errorMessage"
                        :disabled="isSubmitting"
                        @update:model-value="handleChange"
                        @blur="handleBlur"
                        :items="transformedAnnouncers"
                        :display-value="(item: any) => item.name || ''"
                        :filter-items="filterItems"
                        icon="lucide:file"
                        placeholder="e.g. Nom"
                        label="Annonceur"
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
                  <div class="col-span-12 md:col-span-6">
                    <Field
                      v-slot="{ field, errorMessage, handleChange, handleBlur }"
                      name="recoveryProcedure.amount"
                    >
                      <BaseInput
                        label="Montant"
                        type="number"
                        icon="ph:file-duotone"
                        placeholder="ex: 10 000"
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
                      name="recoveryProcedure.agent1"
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
                        icon="lucide:file"
                        placeholder="e.g. Nom"
                        label="Agent 1"
                        clearable
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
                      name="recoveryProcedure.agent2"
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
                        icon="lucide:file"
                        placeholder="e.g. Nom"
                        label="Agent 2"
                        clearable
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
                      name="recoveryProcedure.agent3"
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
                        icon="lucide:file"
                        placeholder="e.g. Nom"
                        label="Agent 3"
                        clearable
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
                      name="recoveryProcedure.agent4"
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
                        icon="lucide:file"
                        placeholder="e.g. Nom"
                        label="Agent 4"
                        clearable
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
                              name="order.date"
                            >
                              <BaseInput
                                shape="rounded"
                                label="Date"
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

                  <div class="ltablet:col-span-6 col-span-12 lg:col-span-6">
                    <Field
                      v-slot="{ field, errorMessage, handleChange, handleBlur }"
                      name="recoveryProcedure.status"
                    >
                      <BaseSelect
                        label="Statut *"
                        icon="ph:funnel"
                        :model-value="field.value"
                        :error="errorMessage"
                        :disabled="isSubmitting"
                        @update:model-value="handleChange"
                        @blur="handleBlur"
                      >
                        <option value="onHold">En attente de démarrage</option>
                        <option value="inProgress">En cours</option>
                        <option value="closed">Cloturées</option>
                      </BaseSelect>
                    </Field>
                  </div>
                  <div class="ltablet:col-span-6 col-span-12 lg:col-span-6">
                    <Field
                      v-slot="{ field, errorMessage, handleChange, handleBlur }"
                      name="recoveryProcedure.validator"
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
                      name="recoveryProcedure.description"
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
            <BaseButton @click="isModalNewRecoveryProcedureOpen = false"
              >Annuler</BaseButton
            >
            <div v-if="isEdit == true" class="flex">
              <BaseButton
                :color="
                  currentRecoveryProcedure?.adminValidated
                    ? 'success'
                    : 'warning'
                "
                class="!mx-2"
                flavor="solid"
                @click="confirmOrder()"
                :disabled="
                  authStore.user?._id !=
                  currentRecoveryProcedure?.adminValidator
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
            Suppression d'un dossier
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
            <span class="text-red-500">{{
              currentRecoveryProcedure?.label
            }}</span>
            ?
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
              @click="deletePackage(currentRecoveryProcedure)"
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
            <span class="text-primary-500">{{
              currentRecoveryProcedure.label
            }}</span>
            de
            <span class="text-primary-500"
              >{{ currentRecoveryProcedure?.announcer?.name }}
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
