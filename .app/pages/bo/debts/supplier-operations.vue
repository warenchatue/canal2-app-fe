<script setup lang="ts">
import { toTypedSchema } from '@vee-validate/zod'
import { Field, useFieldError, useForm } from 'vee-validate'
import { DatePicker } from 'v-calendar'
import { z } from 'zod'

definePageMeta({
  title: 'Operations - Fournisseur',
  preview: {
    title: 'Operations - Fournisseur',
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

const filter = ref('')
const perPage = ref(10)
const isModalNewTxnOpen = ref(false)
const activeFundRaising = ref({ id: '', name: '', category: '', image: '' })
const activeCountry = ref({ id: '', abbr: '', name: '', flag: '' })
const activeOperator = ref({ abbr: '', name: '', logo: '' })
const phoneNumber = ref('')

watch([filter, perPage], () => {
  router.push({
    query: {
      page: undefined,
    },
  })
})

const app = useAppStore()
const orgStore = useOrgStore()
const query = computed(() => {
  return {
    filter: filter.value,
    perPage: perPage.value,
    page: page.value,
    action: 'get',
    id: '0',
  }
})

const { data, pending, error, refresh } = await useFetch(
  '/api/debts/supplier-operations',
  {
    query,
  },
)

if (data.value) {
  console.log(data.value)
}

const { data: fundsRaisingData, pending: fundsRaisingPending } = await useFetch(
  '/api/funds-raising',
  {
    query,
  },
)

if (fundsRaisingData?.value) {
  console.log(fundsRaisingData.value.data)
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

const activeOperation = ref('1')
const selectedOperation = computed(() => {
  return data.value.data.find((op) => op.id === activeOperation.value)
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
          :src="data?.supplier.logo"
          :badge-src="data?.supplier.logo"
          size="2xl"
          class="mx-auto"
        />
        <div class="mx-auto w-full max-w-4xl text-center">
          <BaseHeading tag="h2" size="xl" weight="medium" class="mt-4">
            {{ data?.supplier.name }}
          </BaseHeading>
          <div
            class="divide-muted-200 dark:divide-muted-800 flex items-center justify-center divide-x"
          >
            <div class="text-muted-400 flex h-8 items-center gap-1 px-4">
              <Icon name="ph:globe" class="h-5 w-5" />
              <BaseText size="sm">Email: {{ data?.supplier.email }}</BaseText>
            </div>

            <div class="text-muted-400 flex h-8 items-center gap-1 px-4">
              <Icon name="ph:globe" class="h-5 w-5" />
              <BaseText size="sm">Pays: Allemagne</BaseText>
            </div>

             <div class="text-muted-400 flex h-8 items-center gap-1 px-4">
              <Icon name="ph:globe" class="h-5 w-5" />
              <BaseText size="sm">Adresse: fd4fdfdfd445</BaseText>
            </div>

            <div class="text-muted-400 flex h-8 items-center gap-1 px-4">
              <Icon name="ph:phone" class="h-5 w-5" />
              <BaseText size="sm">Tel: 694545 5454545 5</BaseText>
            </div>
          </div>
          <div
            class="divide-muted-200 dark:divide-muted-800 flex items-center justify-center divide-x"
          >
            <div class="text-muted-400 flex h-8 items-center gap-1 px-4">
              <Icon name="ph:money" class="h-5 w-5" />
              <BaseText size="sm">Devise: EURO</BaseText>
            </div>

            <div class="text-muted-400 flex h-8 items-center gap-1 px-4">
              <Icon name="ph:money" class="h-5 w-5" />
              <BaseText size="sm">IBAN: DE545 54545 5454 5455</BaseText>
            </div>

            <div class="text-muted-400 flex h-8 items-center gap-1 px-4">
              <Icon name="ph:money" class="h-5 w-5" />
              <BaseText size="sm">BANK: SPARKASSDE ZEZEZEZEZEZ</BaseText>
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
        <div class="col-span-12 mx-2 -mt-6">
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
          @click="isModalNewTxnOpen = true"
          color="primary"
          class="w-full sm:w-48"
        >
          <Icon name="lucide:plus" class="h-4 w-4" />
          <span>Nouvelle Operation</span>
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
                <span>Total Debbit</span>
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
                <span>70 000 000 XAF</span>
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
                <span>Total Credit</span>
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
                <span>40 500 000 XAF</span>
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
                <span>Solde</span>
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
                <span>10 500 000 XAF</span>
              </BaseHeading>
            </div>
            <div
              class="text-danger-500 flex items-center gap-1 font-sans text-sm"
            >
              <span>2.7%</span>
              <Icon name="lucide:trending-down" class="h-5 w-5" />
              <span class="text-muted-400 text-xs">débiteur</span>
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
                <span>Total Operations</span>
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
                <span>15</span>
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
                <TairoTableHeading uppercase spaced> Date </TairoTableHeading>
                <TairoTableHeading uppercase spaced>
                  Libellé
                </TairoTableHeading>
                <TairoTableHeading uppercase spaced>Type Op.</TairoTableHeading>
                <TairoTableHeading uppercase spaced> Banque </TairoTableHeading>
                <TairoTableHeading uppercase spaced>Devise</TairoTableHeading>
                <TairoTableHeading uppercase spaced>Debit</TairoTableHeading>
                <TairoTableHeading uppercase spaced>Credit</TairoTableHeading>
                 <TairoTableHeading uppercase spaced>Solde XAF</TairoTableHeading>
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
                      {{ item.label }}
                    </span>
                  </div>
                </TairoTableCell>
                <TairoTableCell spaced>
                  <div class="flex items-center">
                    <span class="text-muted-400 font-sans text-xs">
                      {{ item.type }}
                    </span>
                  </div>
                </TairoTableCell>
                <TairoTableCell spaced>
                  <div class="flex items-center">
                    <BaseAvatar
                      :src="item.bank?.logo"
                      :text="item.bank?.name"
                      :class="getRandomColor()"
                    />
                    <div class="ms-3 leading-none">
                      <h4 class="font-sans text-sm font-medium">
                        {{ item.bank?.name }}
                      </h4>
                      <p class="text-muted-400 font-sans text-xs">
                        {{ item.bank?.email }}
                      </p>
                    </div>
                  </div>
                </TairoTableCell>
                <TairoTableCell spaced class="capitalize">
                  <BaseTag
                    v-if="item.status === 'available'"
                    color="success"
                    flavor="pastel"
                    shape="full"
                    condensed
                    class="font-medium"
                  >
                    {{ item.status }}
                  </BaseTag>
                  <BaseTag
                    v-else-if="item.currency.name"
                    color="success"
                    flavor="pastel"
                    shape="full"
                    condensed
                    class="font-medium"
                  >
                    {{ item.currency.name }}
                  </BaseTag>
                  <BaseTag
                    v-else-if="item.status === 'pending'"
                    color="warning"
                    flavor="pastel"
                    shape="full"
                    condensed
                    class="font-medium"
                  >
                    {{ item.status }}
                  </BaseTag>
                  <BaseTag
                    v-else-if="item.status === 'offline'"
                    color="muted"
                    flavor="pastel"
                    shape="full"
                    condensed
                    class="font-medium"
                  >
                    {{ item.status }}
                  </BaseTag>
                </TairoTableCell>
                <TairoTableCell light spaced>
                  <span v-if="item.position == 'in'"> {{ item.amount }}</span>
                  <span v-else> - </span>
                </TairoTableCell>
                <TairoTableCell light spaced>
                  <span v-if="item.position == 'out'"> {{ item.amount }}</span>
                  <span v-else> - </span>
                </TairoTableCell>
                 <TairoTableCell light spaced>
                  {{ item.amount }}
                </TairoTableCell>
                <TairoTableCell spaced>
                  <BaseButtonAction
                    @click.prevent="selectOperation(item.id)"
                    muted
                    >Détails</BaseButtonAction
                  >
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

    <!-- Modal component -->
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
                          label="Source des fonds"
                          :items="fundsRaisingData.data"
                          :properties="{
                            value: 'id',
                            label: 'name',
                            sublabel: 'category',
                            media: 'image',
                          }"
                          v-model="activeFundRaising"
                          :error="errorMessage"
                          :disabled="isSubmitting"
                          @update:model-value="handleChange"
                          @blur="handleBlur"
                        />
                      </Field>
                    </div>
                  </div>
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
                          v-model="activeCountry"
                          :error="errorMessage"
                          :disabled="isSubmitting"
                          @update:model-value="handleChange"
                          @blur="handleBlur"
                        />
                      </Field>
                    </div>
                  </div>

                  <div class="mb-6 mt-4">
                    <label class="nui-label pb-2 text-[0.825rem]"
                      >Moyens de retrait disponible</label
                    >
                    <div
                      class="ptablet:grid-cols-2 grid-cols-2 ltablet:grid-cols-2 grid gap-4 lg:grid-cols-3"
                      v-if="activeCountry.id != ''"
                    >
                      <Field
                        v-for="operator in paymentMethods[0].countries[0]
                          .operators"
                        :key="operator.abbr"
                        v-slot="{
                          field,
                          errorMessage,
                          handleChange,
                          handleBlur,
                        }"
                        name="payment.type"
                      >
                        <BaseRadioHeadless
                          :value="operator"
                          v-model="activeOperator"
                          :error="errorMessage"
                          :disabled="isSubmitting"
                          @update:model-value="handleChange"
                          @blur="handleBlur"
                        >
                          <BaseCard
                            shape="rounded"
                            class="text-muted-400 peer-checked:!border-primary-500 peer-checked:[&_.child]:!text-primary-500 relative border-2 px-2 py-4 grayscale peer-checked:grayscale-0"
                          >
                            <div class="relative">
                              <img
                                :src="operator.logo"
                                class="h-28 md:h-32 w-full rounded-lg object-cover"
                              />
                            </div>
                            <div>
                              <div class="mt-3">
                                <BaseHeading
                                  tag="h3"
                                  size="md"
                                  weight="medium"
                                  lead="snug"
                                  class="line-clamp-2 text-gray-800 text-sm !md:text:xl dark:text-gray-100"
                                >
                                  {{ operator.name }}
                                </BaseHeading>
                              </div>
                            </div>
                          </BaseCard>
                        </BaseRadioHeadless>
                      </Field>
                    </div>
                  </div>

                  <div
                    v-if="activeCountry.id != ''"
                    class="grid grid-cols-12 gap-4 mt-4"
                  >
                    <div class="col-span-12 md:col-span-6">
                      <Field
                        v-slot="{
                          field,
                          errorMessage,
                          handleChange,
                          handleBlur,
                        }"
                        name="doctor.address"
                      >
                        <BaseInput
                          label="Montant du retrait"
                          icon="ph:money"
                          placeholder="50 000"
                          v-model="phoneNumber"
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
                        name="doctor.address"
                      >
                        <BaseInput
                          label="Numéro de téléphone"
                          icon="ph:phone"
                          placeholder="+237694682713"
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
            <BaseAvatar :src="selectedOperation?.supplier.logo" size="2xl" />
          </div>
          <div class="text-center">
            <BaseHeading tag="h3" size="lg" class="mt-4">
              <span>{{ selectedOperation?.supplier.name }}</span>
            </BaseHeading>
            <BaseParagraph size="sm" class="text-muted-400">
              <span>{{ selectedOperation?.supplier.email }}</span>
            </BaseParagraph>
            <div class="my-4">
              <BaseParagraph
                size="sm"
                class="text-muted-500 dark:text-muted-400"
              >
                <span>{{ selectedOperation?.label }}</span>
              </BaseParagraph>
              <BaseParagraph
                size="sm"
                class="text-muted-500 dark:text-muted-400"
              >
                <span
                  >{{ selectedOperation?.amount }}
                  {{ selectedOperation?.currency.name }}</span
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
                  Consulter les operations de
                  {{ selectedOperation?.supplier.name }}
                </span>
              </BaseButton>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
