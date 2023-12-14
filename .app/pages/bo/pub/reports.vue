<script setup lang="ts">
import { toTypedSchema } from '@vee-validate/zod'
import { Field, useFieldError, useForm } from 'vee-validate'
import { DatePicker } from 'v-calendar'
import { z } from 'zod'
import { UserRole } from '~/types/user'

definePageMeta({
  title: 'Rapports',
  preview: {
    title: 'Rapports',
    description: 'Contribution and withdrawal',
    categories: ['bo', 'pub'],
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
const isEdit = ref(false)

const toaster = useToaster()
// Check if can have access
if (
  authStore.user.appRole.name != UserRole.sale &&
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

const orderContracts = ref<FileList | null>()
const orderInvoices = ref<FileList | null>()

watch(orderContracts, (value) => {
  console.log('orderContracts')
  console.log(orderContracts.value)
})

watch(orderInvoices, (value) => {
  console.log('orderInvoices')
  console.log(orderInvoices.value)
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
    action: 'findAllReport',
    token: token.value,
  }
})

const dates = ref({
  start: new Date(),
  end: new Date(),
})

const { data, pending, error, refresh } = await useFetch('/api/pub/packages', {
  query,
})

function editPackage(spotPackage: any) {
  isModalNewPackageOpen.value = true
  isEdit.value = true
  setFieldValue('spotPackage._id', spotPackage._id)
  setFieldValue('spotPackage.label', spotPackage.label)
  setFieldValue('spotPackage.announcer', spotPackage.announcer)
  setFieldValue('spotPackage.status', spotPackage.status)
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
      totalAmount: z.number(),
      status: z
        .union([
          z.literal('onHold'),
          z.literal('confirmed'),
          z.literal('paid'),
          z.literal('closed'),
        ])
        .optional(),
      period: z.string(),
      announcer: z
        .object({
          _id: z.string(),
          email: z.string(),
          name: z.string(),
          flag: z.string().optional(),
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
    totalAmount: 0,
    period: '',
    status: 'onHold',
    announcer: {
      _id: '',
      email: '',
      name: '',
      flag: '',
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

    try {
      const isSuccess = ref(false)
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
        <div class="col-span-12 mx-2 -mt-6">
          <DatePicker
            v-model.range="dates"
            :masks="masks"
            mode="date"
            hide-time-header
            trim-weeks
          >
            <template #default="{ inputValue, inputEvents }">
              <div class="flex w-full flex-col gap-4 sm:flex-row">
                <div class="relative grow">
                  <Field
                    v-slot="{ field, errorMessage, handleChange, handleBlur }"
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
                    v-slot="{ field, errorMessage, handleChange, handleBlur }"
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

        <BaseInput
          v-model="filter"
          icon="lucide:search"
          placeholder="Filtre raport..."
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
          class="w-full sm:w-32"
          @click=";(isModalNewPackageOpen = true), (isEdit = false)"
        >
          <span>Actualiser</span>
          <Icon name="lucide:search" class="h-4 w-4" />
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
                <span>Total Commandes</span>
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
              <span>+7.8%</span>
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
                <span>Quantité totale</span>
              </BaseHeading>
              <BaseIconBox
                size="xs"
                class="bg-yellow-100 text-yellow-500 dark:border-2 dark:border-yellow-500 dark:bg-yellow-500/20 dark:text-yellow-400"
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
                <span>{{ data?.metaData?.totalAnnouncers }}</span>
              </BaseHeading>
            </div>
            <div
              class="text-danger-500 flex items-center gap-1 font-sans text-sm"
            >
              <span>-2.7%</span>
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
                <span>Total Diffusés</span>
              </BaseHeading>
              <BaseIconBox
                size="xs"
                class="bg-primary-100 text-primary-500 dark:bg-primary-500/20 dark:text-primary-400 dark:border-primary-500 dark:border-2"
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
                <span>{{ data?.metaData?.totalSpots }}</span>
              </BaseHeading>
            </div>
            <div
              class="text-success-500 flex items-center gap-1 font-sans text-sm"
            >
              <span>+4.5%</span>
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
                <span>Total restant a payer</span>
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
                      data?.data[0]?.globalPending ?? 0,
                    )
                  }}
                  XAF</span
                >
              </BaseHeading>
            </div>
            <div
              class="text-success-500 flex items-center gap-1 font-sans text-sm"
            >
              <span>+4.5%</span>
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
                <TairoTableHeading uppercase spaced>
                  Campagne
                </TairoTableHeading>

                <TairoTableHeading uppercase spaced
                  >Annonceur</TairoTableHeading
                >

                <TairoTableHeading uppercase spaced>Nature</TairoTableHeading>

                <TairoTableHeading uppercase spaced>Durée</TairoTableHeading>
                <TairoTableHeading uppercase spaced
                  >Date Début</TairoTableHeading
                >
                <TairoTableHeading uppercase spaced>Date Fin</TairoTableHeading>
                <TairoTableHeading uppercase spaced
                  >Nombre de diffusion par jour</TairoTableHeading
                >
                <TairoTableHeading uppercase spaced
                  >Total commandés</TairoTableHeading
                >
                <TairoTableHeading uppercase spaced
                  >Total diffusés</TairoTableHeading
                >
                <TairoTableHeading uppercase spaced
                  >Formule d'achat</TairoTableHeading
                >
                <TairoTableHeading uppercase spaced
                  >Commercial en charge</TairoTableHeading
                >
                <TairoTableHeading uppercase spaced
                  >Montant global
                </TairoTableHeading>
                <TairoTableHeading uppercase spaced
                  >MOntant payé
                </TairoTableHeading>
                <TairoTableHeading uppercase spaced
                  >Montant restant
                </TairoTableHeading>
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
                      :value="item.id"
                      :name="`item-checkbox-${item.id}`"
                      shape="rounded"
                      class="text-primary-500"
                    />
                  </div>
                </TairoTableCell>
                <TairoTableCell light spaced>
                  <p v-if="item.products.length > 0">
                    1- {{ item.products[0].product }}
                  </p>
                  <p v-if="item.products.length > 1">
                    2- {{ item.products[1].product }}
                  </p>
                  <p v-if="item.products.length > 2">
                    3- {{ item.products[2].product }}
                  </p>
                  <p v-if="item.products.length > 3">
                    4- {{ item.products[3].product }}
                  </p>
                  <p v-if="item.products.length > 4">
                    5- {{ item.products[4].product }}
                  </p>
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
                  <p v-if="item.products.length > 0">
                    1- {{ item.products[0].type }}
                  </p>
                  <p v-if="item.products.length > 1">
                    2- {{ item.products[1].type }}
                  </p>
                  <p v-if="item.products.length > 2">
                    3- {{ item.products[2].type }}
                  </p>
                  <p v-if="item.products.length > 3">
                    4- {{ item.products[3].type }}
                  </p>
                  <p v-if="item.products.length > 4">
                    5- {{ item.products[4].type }}
                  </p>
                </TairoTableCell>
                <TairoTableCell light spaced>
                  <span class="text-base">
                    {{ item.durationDays ?? 0 }} jour(s)</span
                  >
                </TairoTableCell>
                <TairoTableCell light spaced>
                  {{ item.startDate ?? '' }}
                </TairoTableCell>
                <TairoTableCell light spaced>
                  {{ item.endDate ?? '' }}
                </TairoTableCell>
                <TairoTableCell light spaced>
                  <span class="text-base"> {{ item.numberProducts }}</span>
                </TairoTableCell>
                <TairoTableCell light spaced>
                  <span class="text-base"> {{ item.quantities }}</span>
                </TairoTableCell>
                <TairoTableCell light spaced>
                  <span class="text-base"> {{ item.totalDiffused }}</span>
                </TairoTableCell>
                <TairoTableCell light spaced>
                  {{ item.label }}
                </TairoTableCell>
                <TairoTableCell light spaced>
                  {{ item.order?.manager?.firstName ?? item.creator?.firstName }}
                  {{ item.order?.manager?.lastName ?? item.creator?.lastName }}
                </TairoTableCell>
                <TairoTableCell light spaced>
                  {{
                    new Intl.NumberFormat().format(item.invoice?.amount ?? 0)
                  }}
                  XAF
                </TairoTableCell>
                <TairoTableCell light spaced>
                  {{ new Intl.NumberFormat().format(item.invoice?.paid ?? 0) }}
                  XAF
                </TairoTableCell>
                <TairoTableCell light spaced>
                  {{
                    new Intl.NumberFormat().format(
                      (item.invoice?.amount ?? 0) - (item.invoice?.paid ?? 0),
                    )
                  }}
                  XAF
                </TairoTableCell>
                <TairoTableCell spaced class="capitalize">
                  <BaseTag
                    v-if="item.status === 'closed'"
                    color="muted"
                    flavor="pastel"
                    shape="full"
                    condensed
                    class="font-medium"
                  >
                    Cloturée
                  </BaseTag>
                  <BaseTag
                    v-else-if="
                      item.status === 'onHold' ||
                      item.status === 'confirmed' ||
                      item.status == 'paid'
                    "
                    color="warning"
                    flavor="pastel"
                    shape="full"
                    condensed
                    class="font-medium"
                  >
                    En cours
                  </BaseTag>
                </TairoTableCell>
                <TairoTableCell spaced>
                  <div class="flex">
                    <BaseButtonAction
                      class="mx-2"
                      :to="'/bo/spots/package-details/' + item._id"
                      muted
                    >
                      <Icon name="lucide:settings" class="h-4 w-4"
                    /></BaseButtonAction>
                    <!-- <BaseButtonAction @click="editPackage(item)">
                      <Icon name="lucide:edit" class="h-4 w-4"
                    /></BaseButtonAction> -->
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
      size="xl"
      @close="isModalNewPackageOpen = false"
    >
      <template #header>
        <!-- Header -->
        <div class="flex w-full items-center justify-between p-4 md:p-6">
          <h3
            class="font-heading text-muted-900 text-lg font-medium leading-6 dark:text-white"
          >
            {{ isEdit == true ? 'Editer' : 'Nouvelle' }} commande
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
                  <div class="col-span-12 md:col-span-6">
                    <Field
                      v-slot="{ field, errorMessage, handleChange, handleBlur }"
                      name="spotPackage.label"
                    >
                      <BaseInput
                        label="Libéllé"
                        icon="ph:user-duotone"
                        placeholder="ref facture : FACT N_ XXXXXX"
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
                      name="spotPackage.numberProducts"
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
  </div>
</template>
