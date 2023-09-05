<script setup lang="ts">
import { toTypedSchema } from '@vee-validate/zod'
import { Field, useFieldError, useForm } from 'vee-validate'
import { DatePicker } from 'v-calendar'
import { z } from 'zod'

definePageMeta({
  title: 'Package - Annonceur',
  preview: {
    title: 'Package - Annonceur',
    description: 'Contribution and withdrawal',
    categories: ['bo', 'finances'],
    src: '/img/screens/layouts-table-list-1.png',
    srcDark: '/img/screens/layouts-table-list-1-dark.png',
    order: 44,
  },
})

const route = useRoute()
const router = useRouter()
const page = computed(() => parseInt((route.query.page as string) ?? '1'))

const hours = [
  { code: '06:25', name: '6H25' },
  { code: '07:25', name: '7H25' },
  { code: '08:25', name: '8H25' },
  { code: '09:25', name: '9H25' },
  { code: '10:25', name: '10H25' },
  { code: '11:25', name: '11H25' },
]
const filter = ref('')
const perPage = ref(10)
const isModalNewTxnOpen = ref(false)
const isModalPlanningOpen = ref(false)
const isModalNewSpotPlanningOpen = ref(false)
const activeSpot = ref({ id: '', product: '', tag: '', flag: '' })
const phoneNumber = ref('')
const formatter = new Intl.DateTimeFormat('fr', { month: 'long' })
const activeDate = ref(new Date())
const activeDay = ref('')
const activeHour = ref('')
var activeDays = ref(
  new Date(
    activeDate.value.getFullYear(),
    activeDate.value.getMonth() + 1,
    0,
  ).getDate(),
)
const initDate = ref(false)

function addMonth() {
  const date = new Date(activeDate.value)
  initDate.value = false
  date.setMonth(date.getMonth() + 1)
  activeDate.value = date
  activeDays.value = new Date(
    date.getFullYear(),
    date.getMonth() + 1,
    0,
  ).getDate()

  console.log(date.getMonth() + 1)
  console.log(activeDays)
}

function removeMonth() {
  const date = new Date(activeDate.value)
  date.setMonth(date.getMonth() - 1)
  activeDate.value = date
  activeDays.value = new Date(
    date.getFullYear(),
    date.getMonth() + 1,
    0,
  ).getDate()
  console.log(date.getMonth())
  console.log(activeDays)
}

function dayOfWeek(d: number) {
  var date = new Date(
    activeDate.value.getFullYear(),
    activeDate.value.getMonth(),
    d,
  )
  return new Date(
    activeDate.value.getFullYear(),
    activeDate.value.getMonth(),
    d,
  )
    .toLocaleDateString('fr-FR', {
      weekday: 'long',
    })
    .toString()
    .toLocaleUpperCase()
}

function openSpotPlanningModal(day: string, hour: string) {
  activeDay.value = day
  activeHour.value = hour
  isModalNewSpotPlanningOpen.value = true
}
function addSpotToPlanning() {
  console.log('Adding spot to the planning')
  const hourArray = activeHour.value.split(':')
  var date = new Date(
    activeDate.value.getFullYear(),
    activeDate.value.getMonth(),
    parseInt(activeDay.value),
    parseInt(hourArray[0]),
    parseInt(hourArray[1]),
  )

  console.log(date.toISOString())

  data.value?.package?.planning.push({
    spot: { ...activeSpot.value },
    date: date.toISOString(),
    isManualPlay: false,
    isAutoPlay: false,
  })

  console.log(data.value?.package?.planning)

  isModalNewSpotPlanningOpen.value = false
}

function checkSpot(d: number, hour: string) {
  const hourArray = hour.split(':')
  var date = new Date(
    activeDate.value.getFullYear(),
    activeDate.value.getMonth(),
    d,
    parseInt(hourArray[0]),
    parseInt(hourArray[1]),
  )
  const plannedSpots = data.value?.package?.planning?.filter(
    (p) => p.date == date.toISOString(),
  )
  if (plannedSpots.length == 0) {
    return ['+', 'secondary']
  } else {
    return [plannedSpots[0].spot.tag, 'primary']
  }
}

watch([filter, perPage], () => {
  router.push({
    query: {
      page: undefined,
    },
  })
})

const app = useAppStore()
const orgStore = useOrgStore()

const packageId = computed(() => route.params.id)
const query = computed(() => {
  return {
    id: packageId.value,
    action: 'get',
  }
})

const { data, pending, error, refresh } = await useFetch(
  '/api/spots/packages',
  {
    query,
  },
)

if (data.value) {
  console.log(data.value)
}

const selected = ref<number[]>([])
const isAllVisibleSelected = computed(() => {
  return selected.value.length === data.value?.package?.spots?.length
})

function toggleAllVisibleSelection() {
  if (isAllVisibleSelected.value) {
    selected.value = []
  } else {
    selected.value = data.value?.package?.spots?.map((item) => item.id) ?? []
  }
}

const activeOperation = ref('1')
const selectedSpot = computed(() => {
  return data.value.package?.spots.find(
    (item) => item.id === activeOperation.value,
  )
})

const chatEl = ref<HTMLElement>()
const expanded = ref(true)
const loading = ref(false)

function selectOperation(id: string) {
  loading.value = true
  setTimeout(() => {
    activeOperation.value = id
    loading.value = false
    setTimeout(() => {
      expanded.value = false
      if (chatEl.value) {
        chatEl.value.scrollTo({
          top: chatEl.value.scrollHeight,
          behavior: 'smooth',
        })
      }
    }, 100)
  }, 150)
}

const people = [
  {
    id: 1,
    name: 'Clarissa Perez',
    text: 'Sales Manager',
    media: '/img/avatars/19.svg',
  },
  {
    id: 2,
    name: 'Aaron Splatter',
    text: 'Project Manager',
    media: '/img/avatars/16.svg',
  },
  {
    id: 3,
    name: 'Mike Miller',
    text: 'UI/UX Designer',
    media: '/img/avatars/3.svg',
  },
  {
    id: 4,
    name: 'Benedict Kessler',
    text: 'Mobile Developer',
    media: '/img/avatars/22.svg',
  },
  {
    id: 5,
    name: 'Maya Rosselini',
    text: 'Product Manager',
    media: '/img/avatars/2.svg',
  },
]
const paymentMethods = ref([
  {
    id: 1,
    name: 'Mobile',
    logo: '/img/payment/imgs/mobile_wallet_2.png',
    description: 'Paiemens mobiles',
    countries: [
      {
        id: 'CMR',
        operators: [
          {
            abbr: 'om',
            name: ' Orange Money | CMR',
            logo: '/img/payment/imgs/orange_money_cmr.jpg',
          },
          {
            abbr: 'momo',
            name: ' Mobile Money | CMR',
            logo: '/img/payment/imgs/mobile_money_cmr.jpg',
          },
        ],
      },
    ],
  },
  {
    id: 2,
    name: 'Visa',
    logo: '/img/payment/imgs/visa_mastercard.jpg',
    description: 'Paiements par carte',
  },
  {
    id: 3,
    name: 'Paypal',
    logo: '/img/payment/imgs/paypal.png',
    description: 'Payments par paypal',
  },
])

const countries = [
  {
    id: '1',
    abbr: 'CMR',
    name: 'Cameroun',
    flag: '/img/icons/flags/cmr.svg',
  },
  {
    id: '2',
    abbr: 'CIV',
    name: "Côte d'ivoire",
    flag: '/img/icons/flags/civ.svg',
  },
  {
    id: '3',
    abbr: 'FR',
    name: 'France',
    flag: '/img/icons/flags/france.svg',
  },
]

// Ask the user for confirmation before leaving the page if the form has unsaved changes
// onBeforeRouteLeave(() => {
//   if (meta.value.dirty) {
//     return confirm('You have unsaved changes. Are you sure you want to leave?')
//   }
// })

// This is the object that will contain the validation messages
const ONE_MB = 1000000
const VALIDATION_TEXT = {
  OPERATOR_REQUIRED: "Operator can't be empty",
  PHONE_REQUIRED: "Phone number can't be empty",
  EMAIL_REQUIRED: "Email address can't be empty",
  COUNTRY_REQUIRED: 'Please select a country',
}

// This is the Zod schema for the form input
// It's used to define the shape that the form data will have
const zodSchema = z
  .object({
    payment: z.object({
      operator: z.string().min(1, VALIDATION_TEXT.OPERATOR_REQUIRED),
      name: z.string(),
      email: z.string(),
      phone: z.string().min(1, VALIDATION_TEXT.PHONE_REQUIRED),
      country: z
        .object({
          id: z.string(),
          abbr: z.string(),
          name: z.string(),
          flag: z.string(),
        })
        .nullable(),
    }),
  })
  .superRefine((data, ctx) => {
    if (!data.payment.country) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: VALIDATION_TEXT.PHONE_REQUIRED,
        path: ['payment.country'],
      })
    }

    if (!data.payment.country) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: VALIDATION_TEXT.COUNTRY_REQUIRED,
        path: ['payment.phone'],
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
    name: '',
    email: '',
    phone: '',
    operator: '',
    type: '',
    country: {
      id: '',
      abbr: '',
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

const toaster = useToaster()

// This is where you would send the form data to the server
const onSubmit = handleSubmit(
  async (values) => {
    success.value = false

    // here you have access to the validated form values
    console.log('payment-create-success', values)

    try {
      // fake delay, this will make isSubmitting value to be true
      await new Promise((resolve, reject) => {
        if (values.payment.name === 'Airbnb') {
          // simulate a backend error
          setTimeout(
            () => reject(new Error('Fake backend validation error')),
            2000,
          )
        }
        setTimeout(resolve, 4000)
      })

      toaster.clearAll()
      toaster.show({
        title: 'Success',
        message: `Record has been created!`,
        color: 'success',
        icon: 'ph:check',
        closable: true,
      })
      router.push('/select-org')
    } catch (error: any) {
      // this will set the error on the form
      if (error.message === 'Fake backend validation error') {
        // @ts-expect-error - vee validate typing bug with nested keys
        setFieldError('payment.name', 'This name is not allowed')

        document.documentElement.scrollTo({
          top: 0,
          behavior: 'smooth',
        })

        toaster.clearAll()
        toaster.show({
          title: 'Oops!',
          message: 'Please review the errors in the form',
          color: 'danger',
          icon: 'lucide:alert-triangle',
          closable: true,
        })
      }
      return
    }

    resetForm()

    document.documentElement.scrollTo({
      top: 0,
      behavior: 'smooth',
    })

    success.value = true
    setTimeout(() => {
      success.value = false
    }, 3000)
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
    <div>
      <div class="flex w-full flex-col mb-10">
        <BaseAvatar
          :src="data?.package?.announcer?.logo"
          :badge-src="data?.package?.announcer?.logo"
          size="2xl"
          class="mx-auto"
        />
        <div class="mx-auto w-full max-w-4xl text-center">
          <BaseHeading tag="h2" size="xl" weight="medium" class="mt-4">
            {{ data?.package?.announcer.name }}
          </BaseHeading>
          <div
            class="divide-muted-200 dark:divide-muted-800 flex items-center justify-center divide-x"
          >
            <div class="text-muted-400 flex h-8 items-center gap-1 px-4">
              <Icon name="ph:globe" class="h-5 w-5" />
              <BaseText size="sm"
                >Email: {{ data?.package?.announcer.email }}</BaseText
              >
            </div>

            <div class="text-muted-400 flex h-8 items-center gap-1 px-4">
              <Icon name="ph:globe" class="h-5 w-5" />
              <BaseText size="sm">Pays: Cameroun</BaseText>
            </div>

            <div class="text-muted-400 flex h-8 items-center gap-1 px-4">
              <Icon name="ph:globe" class="h-5 w-5" />
              <BaseText size="sm">Adresse: Dla - Bonapriso</BaseText>
            </div>

            <div class="text-muted-400 flex h-8 items-center gap-1 px-4">
              <Icon name="ph:phone" class="h-5 w-5" />
              <BaseText size="sm">Tel: +237 694 685 781</BaseText>
            </div>
          </div>
        </div>
      </div>
    </div>
    <TairoContentWrapper>
      <template #left>
        <BaseInput
          v-model="filter"
          icon="lucide:search"
          placeholder="Filtrer opera..."
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
          @click="isModalPlanningOpen = true"
          color="primary"
          class="w-full sm:w-40"
        >
          <Icon name="lucide:calendar" class="h-4 w-4" />
          <span>Planning</span>
        </BaseButton>
        <BaseButton
          @click="isModalNewTxnOpen = true"
          color="primary"
          class="w-full sm:w-48"
        >
          <Icon name="lucide:plus" class="h-4 w-4" />
          <span>Nouveau Fichier</span>
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
                <span>Total Spots Commandés</span>
              </BaseHeading>
              <BaseIconBox
                size="xs"
                class="bg-success-100 text-success-500 dark:bg-success-500/20 dark:text-success-400 dark:border-success-500 dark:border-2"
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
                <span>{{ data?.package?.numberSpots }}</span>
              </BaseHeading>
            </div>
            <div
              class="text-success-500 flex items-center gap-1 font-sans text-sm"
            >
              <span>+7.8%</span>
              <Icon name="lucide:trending-up" class="h-5 w-5" />
              <span class="text-muted-400 text-xs">depuis le mois dernier</span>
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
                <span>Total Spots diffusés</span>
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
                <span>{{ data?.package?.numberPlay }}</span>
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
                <span>Spots en attentes</span>
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
                <span>4</span>
              </BaseHeading>
            </div>
            <div
              class="text-danger-500 flex items-center gap-1 font-sans text-sm"
            >
              <span>2.7%</span>
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
                <span>Spots non diffusés</span>
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
                <span>1</span>
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
        <div v-if="!pending && data?.package?.spots?.length === 0">
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
                <TairoTableHeading uppercase spaced> Date </TairoTableHeading>
                <TairoTableHeading uppercase spaced>
                  Produit
                </TairoTableHeading>
                <TairoTableHeading uppercase spaced
                  >Titre du message</TairoTableHeading
                >

                <TairoTableHeading uppercase spaced>Tag</TairoTableHeading>

                <TairoTableHeading uppercase spaced>Type</TairoTableHeading>

                <TairoTableHeading uppercase spaced>Durée</TairoTableHeading>

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

              <TairoTableRow
                v-for="item in data?.package?.spots"
                :key="item.id"
              >
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

                <TairoTableCell spaced>
                  <div class="flex items-center">
                    <span class="text-muted-400 font-sans text-xs">
                      {{ item.date }}
                    </span>
                  </div>
                </TairoTableCell>
                <TairoTableCell spaced>
                  <div class="flex items-center">
                    <span class="text-muted-400 font-sans text-xs">
                      {{ item.product }}
                    </span>
                  </div>
                </TairoTableCell>
                <TairoTableCell spaced>
                  <div class="flex items-center">
                    <span class="text-muted-400 font-sans text-xs">
                      {{ item.message }}
                    </span>
                  </div>
                </TairoTableCell>

                <TairoTableCell spaced>
                  <div class="flex items-center">
                    <BaseTag
                      color="info"
                      flavor="pastel"
                      shape="full"
                      condensed
                      class="font-medium"
                    >
                      {{ item.tag }}
                    </BaseTag>
                  </div>
                </TairoTableCell>
                <TairoTableCell spaced>
                  <div class="flex items-center">
                    <BaseTag
                      color="info"
                      flavor="pastel"
                      shape="full"
                      condensed
                      class="font-medium"
                    >
                      {{ item.type }}
                    </BaseTag>
                  </div>
                </TairoTableCell>
                <TairoTableCell spaced>
                  <div class="flex items-center">
                    <span class="text-muted-400 font-sans text-xs">
                      {{ item.duration }}
                    </span>
                  </div>
                </TairoTableCell>
                <TairoTableCell spaced class="capitalize">
                  <BaseTag
                    v-if="item.isPlay === true"
                    color="success"
                    flavor="pastel"
                    shape="full"
                    condensed
                    class="font-medium"
                  >
                    Diffusé
                  </BaseTag>
                  <BaseTag
                    v-else-if="item.isPlay === false"
                    color="warning"
                    flavor="pastel"
                    shape="full"
                    condensed
                    class="font-medium"
                  >
                    Non Diffusé
                  </BaseTag>
                </TairoTableCell>

                <TairoTableCell spaced>
                  <BaseButtonAction muted>Upload fichier</BaseButtonAction>
                </TairoTableCell>
              </TairoTableRow>
            </TairoTable>
          </div>
          <div class="mt-6">
            <BasePagination
              :total-items="data?.package?.spots?.length ?? 0"
              :item-per-page="perPage"
              :current-page="page"
              shape="curved"
            />
          </div>
        </div>
      </div>
    </TairoContentWrapper>

    <!-- Modal File -->
    <TairoModal
      :open="isModalNewTxnOpen"
      size="xl"
      @close="isModalNewTxnOpen = false"
    >
      <template #header>
        <!-- Header -->
        <div class="flex w-full items-center justify-between p-4 md:p-6">
          <h3
            class="font-heading text-muted-900 text-lg font-medium leading-6 dark:text-white"
          >
            Nouvelle Opération
          </h3>

          <BaseButtonClose @click="isModalNewTxnOpen = false" />
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
                  <div class="grid grid-cols-12 gap-4"></div>
                  <div class="grid grid-cols-12 gap-4">
                    <div class="ltablet:col-span-12 col-span-12 lg:col-span-12">
                      <Field
                        v-slot="{
                          field,
                          errorMessage,
                          handleChange,
                          handleBlur,
                        }"
                        name="payment.country"
                      >
                        <BaseListbox
                          label="Pays"
                          :items="countries"
                          :properties="{
                            value: 'id',
                            label: 'abbr',
                            sublabel: 'name',
                            media: 'flag',
                          }"
                          v-model="activeSpot"
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
          </div>
        </form>
      </BaseCard>
      <template #footer>
        <!-- Footer -->
        <div class="p-4 md:p-6">
          <div class="flex gap-x-2">
            <BaseButton @click="isModalNewTxnOpen = false">Annuler</BaseButton>

            <BaseButton
              color="primary"
              flavor="solid"
              @click="isModalNewTxnOpen = false"
            >
              Valider
            </BaseButton>
          </div>
        </div>
      </template>
    </TairoModal>

    <!-- Modal Spot -->
    <TairoModal
      :open="isModalNewSpotPlanningOpen"
      size="xl"
      @close="isModalNewSpotPlanningOpen = false"
    >
      <template #header>
        <!-- Header -->
        <div class="flex w-full items-center justify-between p-4 md:p-6">
          <h3
            class="font-heading text-muted-900 text-lg font-medium leading-6 dark:text-white"
          >
            Choix du SPOT
          </h3>

          <BaseButtonClose @click="isModalNewSpotPlanningOpen = false" />
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
                  <BaseText size="base" class="pb-2"
                    >Date de diffusion:
                    <span class="text-primary-500">
                      {{ dayOfWeek(parseInt(activeDay)) }} le {{ activeDay }}
                      {{ formatter.format(activeDate) }}
                      {{ activeDate.getFullYear() }} à {{ activeHour }}</span
                    ></BaseText
                  >
                  <div class="grid grid-cols-12 gap-4">
                    <div class="ltablet:col-span-12 col-span-12 lg:col-span-12">
                      <Field
                        v-slot="{
                          field,
                          errorMessage,
                          handleChange,
                          handleBlur,
                        }"
                        name="planning.spot"
                      >
                        <BaseListbox
                          label="Spot"
                          :items="data?.package?.spots"
                          :properties="{
                            value: 'id',
                            label: 'product',
                            sublabel: 'tag',
                            media: 'flag',
                          }"
                          v-model="activeSpot"
                          :error="errorMessage"
                          :disabled="isSubmitting"
                          @update:model-value="handleChange"
                          @blur="handleBlur"
                        />
                      </Field>
                    </div>
                  </div>

                  <div
                    v-if="activeSpot.id != ''"
                    class="grid grid-cols-12 gap-4 mt-4"
                  >
                    <div class="col-span-12 md:col-span-12">
                      <Field
                        v-slot="{
                          field,
                          errorMessage,
                          handleChange,
                          handleBlur,
                        }"
                        name="planning.obs"
                      >
                        <BaseInput
                          label="Observation"
                          icon="ph:chat"
                          placeholder=""
                          v-model="phoneNumber"
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
          </div>
        </form>
      </BaseCard>
      <template #footer>
        <!-- Footer -->
        <div class="p-4 md:p-6">
          <div class="flex gap-x-2">
            <BaseButton @click="isModalNewSpotPlanningOpen = false"
              >Annuler</BaseButton
            >

            <BaseButton
              color="primary"
              flavor="solid"
              @click="addSpotToPlanning()"
            >
              Valider
            </BaseButton>
          </div>
        </div>
      </template>
    </TairoModal>

    <!-- Modal Planning -->
    <TairoModal
      :open="isModalPlanningOpen"
      size="4xl"
      @close="isModalPlanningOpen = false"
    >
      <template #header>
        <!-- Header -->
        <div class="flex w-full items-center justify-between p-4 md:p-6">
          <h3
            class="font-heading text-muted-900 text-lg font-medium leading-6 dark:text-white"
          >
            Planning des Spots
          </h3>

          <BaseButtonClose @click="isModalPlanningOpen = false" />
        </div>
      </template>

      <!-- Body -->
      <div class="flex justify-between items-center p-2">
        <BaseText size="base"
          >Mois:
          <span class="text-primary-500"
            >{{ formatter.format(activeDate) }}
            {{ activeDate.getFullYear() }}</span
          ></BaseText
        >

        <BaseText size="base"
          >Annonceur:
          <span class="text-primary-500">{{
            data?.package?.announcer?.name
          }}</span>
        </BaseText>

        <BaseText size="base"
          >Période:
          <span class="text-primary-500">{{ data?.package?.period }}</span>
        </BaseText>

        <div>
          <BaseButton
            @click="removeMonth()"
            color="primary"
            class="w-full sm:w-20"
          >
            <Icon name="lucide:chevron-left" class="h-6 w-6" />
            <span></span>
          </BaseButton>
          <BaseButton
            @click="addMonth()"
            color="primary"
            class="w-full sm:w-20 mx-2"
          >
            <Icon name="lucide:chevron-right" class="h-6 w-6" />
            <span></span>
          </BaseButton>
        </div>
      </div>
      <div class="grid grid-cols-12 gap-4 pb-5 px-2">
        <!-- Stat tile -->
        <div class="col-span-6 md:col-span-1">
          <BaseCard class="space-y-4 items-center">
            <div class="border-b-2">
              <BaseHeading
                as="h4"
                size="sm"
                weight="light"
                lead="tight"
                class="text-muted-800 dark:text-white pb-4 pt-2 text-center"
              >
                <span>Jours</span>
              </BaseHeading>
            </div>

            <div class="border-b-2">
              <BaseHeading
                as="h4"
                size="sm"
                weight="light"
                lead="tight"
                class="text-muted-800 dark:text-white pb-4 text-center"
              >
                <span>Dates</span>
              </BaseHeading>
            </div>

            <div class="border-b-2">
              <BaseHeading
                as="h4"
                size="sm"
                weight="light"
                lead="tight"
                class="text-muted-800 dark:text-white pb-4 text-center"
              >
                <span>Horaires</span>
              </BaseHeading>
            </div>
            <div v-for="h in hours" :key="h.code" class="border-b-2">
              <BaseHeading
                as="h4"
                size="sm"
                weight="light"
                lead="tight"
                class="text-muted-800 dark:text-white pb-4 text-center"
              >
                <span>{{ h.name }}</span>
              </BaseHeading>
            </div>
          </BaseCard>
        </div>
        <div class="col-span-6 md:col-span-11 overflow-x-auto">
          <BaseCard class="space-y-4 items-center">
            <div class="border-b-2 flex justify-start">
              <BaseHeading
                v-for="d in activeDays"
                :key="d"
                as="h4"
                size="sm"
                weight="light"
                lead="tight"
                class="text-muted-800 dark:text-white pb-4 pt-2 !w-10 flex justify-center border-r"
              >
                <span class="text-center px-auto pr-2"
                  >{{ dayOfWeek(d)[0] }}
                </span>
              </BaseHeading>
            </div>
            <div class="border-b-2 flex justify-start py-0">
              <BaseHeading
                v-for="d in activeDays"
                :key="d"
                as="h4"
                size="sm"
                weight="light"
                lead="tight"
                class="text-muted-800 dark:text-white pb-4 !w-10 flex justify-center border-r"
              >
                <span class="text-center pr-2">{{ d }}</span>
              </BaseHeading>
            </div>

            <div class="border-b-2 flex justify-start">
              <BaseHeading
                v-for="d in activeDays"
                :key="d"
                as="h4"
                size="sm"
                weight="light"
                lead="tight"
                class="text-muted-800 dark:text-white pb-4 !w-10 flex justify-center border-r"
              >
                <span class="text-center pr-2"> # </span>
              </BaseHeading>
            </div>

            <div v-for="h in hours" :key="h.code" class="">
              <div class="border-b-2 flex justify-start">
                <div
                  v-for="d in activeDays"
                  :key="d"
                  class="text-muted-800 dark:text-white -mt-1 !w-10 flex justify-center items-center border-r"
                >
                  <BaseButton
                    @click="openSpotPlanningModal(d.toString(), h.code)"
                    :color="checkSpot(d, h.code)[1]"
                    flavor="solid"
                    class="!w-8 !h-[38px] rounded-full !p-1 dark:bg-muted-700 bg-gray-200"
                  >
                    <!-- <span
                      v-if="dayOfWeek(d)"
                      class="hover:text-primary-500/90 text-base"
                      >+</span
                    > -->
                    <span class="hover:text-primary-500/90 text-base">{{
                      checkSpot(d, h.code)[0]
                    }}</span>
                  </BaseButton>
                </div>
              </div>
            </div>
          </BaseCard>
        </div>
      </div>
      <template #footer>
        <!-- Footer -->
        <div class="p-4 md:p-6">
          <div class="flex gap-x-2">
            <BaseButton @click="isModalNewTxnOpen = false">Annuler</BaseButton>
            <BaseButton
              color="primary"
              flavor="solid"
              @click="isModalNewTxnOpen = false"
            >
              Valider
            </BaseButton>
          </div>
        </div>
      </template>
    </TairoModal>

    <!-- Current user -->
    <div
      class="ltablet:w-[310px] dark:bg-muted-800 fixed end-0 top-0 z-50 h-full w-[390px] bg-white transition-transform duration-300"
      :class="expanded ? 'translate-x-full' : 'translate-x-0'"
    >
      <div class="flex h-16 w-full items-center justify-between px-8">
        <BaseHeading tag="h3" size="lg" class="text-muted-800 dark:text-white">
          <span>Détails Operationn</span>
        </BaseHeading>
        <BaseButtonIcon small @click="expanded = true">
          <Icon name="lucide:arrow-right" class="pointer-events-none h-4 w-4" />
        </BaseButtonIcon>
      </div>
      <div class="relative flex w-full flex-col px-8">
        <!-- Loader -->
        <div v-if="loading" class="mt-8">
          <div class="mb-3 flex items-center justify-center">
            <BasePlaceload
              class="h-24 w-24 shrink-0 rounded-full"
              :width="96"
              :height="96"
            />
          </div>
          <div class="flex flex-col items-center">
            <BasePlaceload class="mb-2 h-3 w-full max-w-[10rem] rounded" />
            <BasePlaceload class="mb-2 h-3 w-full max-w-[6rem] rounded" />
            <div class="my-4 flex w-full flex-col items-center">
              <BasePlaceload class="mb-2 h-2 w-full max-w-[15rem] rounded" />
              <BasePlaceload class="mb-2 h-2 w-full max-w-[13rem] rounded" />
            </div>
            <div class="mb-6 flex w-full items-center justify-center">
              <div class="px-4">
                <BasePlaceload class="h-3 w-[3.5rem] rounded" />
              </div>
              <div class="px-4">
                <BasePlaceload class="h-3 w-[3.5rem] rounded" />
              </div>
            </div>
            <div class="w-full">
              <BasePlaceload class="h-10 w-full rounded-xl" />
              <BasePlaceload class="mx-auto mt-3 h-3 w-[7.5rem] rounded" />
            </div>
          </div>
        </div>
        <!-- Operation details -->
        <div v-else class="mt-8" @click.>
          <div class="flex items-center justify-center">
            <BaseAvatar :src="selectedSpot?.product" size="2xl" />
          </div>
          <div class="text-center">
            <BaseHeading tag="h3" size="lg" class="mt-4">
              <span>{{ selectedSpot?.product }}</span>
            </BaseHeading>
            <BaseParagraph size="sm" class="text-muted-400">
              <span>{{ selectedSpot?.message }}</span>
            </BaseParagraph>
            <div class="my-4">
              <BaseParagraph
                size="sm"
                class="text-muted-500 dark:text-muted-400"
              >
                <span>{{ selectedSpot?.type }}</span>
              </BaseParagraph>
              <BaseParagraph
                size="sm"
                class="text-muted-500 dark:text-muted-400"
              >
                <span
                  >{{ selectedSpot?.file }} {{ selectedSpot?.duration }}</span
                >
              </BaseParagraph>
            </div>
            <div
              class="divide-muted-200 dark:divide-muted-700 flex items-center justify-center divide-x"
            >
              <div class="flex items-center justify-center gap-2 px-4">
                <Icon name="ph:pen" class="text-muted-400 h-4 w-4" />
                <span class="text-muted-400 font-sans text-xs">
                  Mêttre à jour
                </span>
              </div>
              <div class="flex items-center justify-center gap-2 px-4">
                <Icon name="ph:trash" class="text-muted-400 h-4 w-4" />
                <span class="text-muted-400 font-sans text-xs">
                  Supprimer
                </span>
              </div>
            </div>
            <div class="mt-6">
              <BaseButton shape="curved" class="w-full">
                <span>
                  Consulter le planning du spot
                  {{ selectedSpot?.product }}
                </span>
              </BaseButton>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
