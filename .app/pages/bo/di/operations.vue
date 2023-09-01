<script setup lang="ts">
import { toTypedSchema } from '@vee-validate/zod'
import { Field, useFieldError, useForm } from 'vee-validate'
import { DatePicker } from 'v-calendar'
import { z } from 'zod'

definePageMeta({
  title: 'DI',
  preview: {
    title: 'DI',
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
const activePaymentMethod = ref(0)
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
    slug: app.activeOrg.slug,
    action: 'get',
  }
})

const { data, pending, error, refresh } = await useFetch('/api/di', {
  query,
})

const { data: entitiesData, pending: entitiesPending } = await useFetch(
  '/api/admin/entities',
  {
    query,
  },
)

const { data: supplierData, pending: supplierPending } = await useFetch(
  '/api/admin/suppliers',
  {
    query,
  },
)

if (entitiesData?.value) {
  console.log(entitiesData.value.data)
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

const operationTypes = [
  {
    id: '1',
    name: 'VIREMENT',
  },
  {
    id: '2',
    name: 'DEPOT',
  },
]

const mouvementTypes = [
  {
    id: '1',
    name: 'DEBIT',
  },
  {
    id: '2',
    name: 'CREDIT',
  },
]

const banks = [
  {
    id: '1',
    name: 'CBC',
    logo: '/img/avatars/company.svg',
  },
  {
    id: '2',
    name: 'AFB',
    logo: '/img/avatars/company.svg',
  },
]

const currencies = [
  {
    id: '1',
    name: 'EURO',
  },
  {
    id: '2',
    name: 'DOLLAR USD',
  },
  {
    id: '3',
    name: 'XAF',
  },
  {
    id: '4',
    name: 'LIVRE STERLING',
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
    <TairoContentWrapper>
      <template #left>
        <BaseInput
          v-model="filter"
          icon="lucide:search"
          placeholder="Filtrer di..."
          :classes="{
            wrapper: 'w-full sm:w-auto',
          }"
        />
        <Field
          v-slot="{ field, errorMessage, handleChange, handleBlur }"
          name="payment.country"
        >
          <BaseListbox
            label=""
            :items="entitiesData.data"
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
          <span>Nouvelle DI</span>
        </BaseButton>
      </template>
      <div class="grid grid-cols-12 gap-4 pb-5">
        <!-- Stat tile -->
        <div class="col-span-12 md:col-span-4">
          <BaseCard class="p-4">
            <div class="mb-1 flex items-center justify-between">
              <BaseHeading
                as="h5"
                size="sm"
                weight="medium"
                lead="tight"
                class="text-muted-500 dark:text-muted-400"
              >
                <span>Total DI</span>
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
                <span>7 000</span>
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
        <div class="col-span-12 md:col-span-4">
          <BaseCard class="p-4">
            <div class="mb-1 flex items-center justify-between">
              <BaseHeading
                as="h5"
                size="sm"
                weight="medium"
                lead="tight"
                class="text-muted-500 dark:text-muted-400"
              >
                <span>Total Importations</span>
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
                <span>15 000</span>
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
        <div class="col-span-12 md:col-span-4">
          <BaseCard class="p-4">
            <div class="mb-1 flex items-center justify-between">
              <BaseHeading
                as="h5"
                size="sm"
                weight="medium"
                lead="tight"
                class="text-muted-500 dark:text-muted-400"
              >
                <span>Total Transferts</span>
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
                <span>1 200</span>
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
                <TairoTableHeading uppercase spaced> Entité </TairoTableHeading>
                <TairoTableHeading uppercase spaced> Code </TairoTableHeading>
                <TairoTableHeading uppercase spaced> Date </TairoTableHeading>
                <TairoTableHeading uppercase spaced> Pr </TairoTableHeading>
                <TairoTableHeading uppercase spaced>
                  Fournisseur
                </TairoTableHeading>
                <TairoTableHeading uppercase spaced> Banque </TairoTableHeading>
                <TairoTableHeading uppercase spaced> Devise </TairoTableHeading>
                <TairoTableHeading uppercase spaced>Montant</TairoTableHeading>
                <TairoTableHeading uppercase spaced>Status</TairoTableHeading>
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
                    <!-- <BaseAvatar
                      :src="item.entity.logo"
                      :text="item.initials"
                      :class="getRandomColor()"
                    /> -->
                    <div class="ms-3 leading-none">
                      <h4 class="font-sans text-sm font-medium">
                        {{ item.entity.name }}
                      </h4>
                      <!-- <p class="text-muted-400 font-sans text-xs">
                        {{ item.entity.email }}
                      </p> -->
                    </div>
                  </div>
                </TairoTableCell>
                <TairoTableCell light spaced>
                  {{ item.code }}
                </TairoTableCell>
                <TairoTableCell light spaced>
                  Du {{ item.start }} au {{ item.end }}
                </TairoTableCell>
                <TairoTableCell light spaced>
                  {{ item.pr }}
                </TairoTableCell>
                <TairoTableCell spaced>
                  <div class="flex items-center">
                    <BaseAvatar
                      :src="item.supplier.logo"
                      :text="item.initials"
                      :class="getRandomColor()"
                    />
                    <div class="ms-3 leading-none">
                      <h4 class="font-sans text-sm font-medium">
                        {{ item.supplier.name }}
                      </h4>
                      <p class="text-muted-400 font-sans text-xs">
                        {{ item.supplier.email }}
                      </p>
                    </div>
                  </div>
                </TairoTableCell>
                <TairoTableCell spaced>
                  <div class="flex items-center">
                    <BaseAvatar
                      :src="item.bank.logo"
                      :text="item.initials"
                      :class="getRandomColor()"
                    />
                    <div class="ms-3 leading-none">
                      <h4 class="font-sans text-sm font-medium">
                        {{ item.bank.name }}
                      </h4>
                      <p class="text-muted-400 font-sans text-xs">
                        {{ item.bank.email }}
                      </p>
                    </div>
                  </div>
                </TairoTableCell>
                <TairoTableCell light spaced>
                  {{ item.amount }}
                </TairoTableCell>
                <TairoTableCell light spaced>
                  {{ item.currency?.name }}
                </TairoTableCell>
                <TairoTableCell spaced class="capitalize">
                  <BaseTag
                    v-if="item.status === 'active'"
                    color="success"
                    flavor="pastel"
                    shape="full"
                    condensed
                    class="font-medium"
                  >
                    En cours
                  </BaseTag>
                  <BaseTag
                    v-else-if="item.status === 'success'"
                    color="info"
                    flavor="pastel"
                    shape="full"
                    condensed
                    class="font-medium"
                  >
                    {{ item.status }}
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
                <TairoTableCell spaced>
                  <BaseButtonAction muted>Manage</BaseButtonAction>
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
            Nouvelle DI
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
                    <div class="ltablet:col-span-12 col-span-12 lg:col-span-6">
                      <Field
                        v-slot="{
                          field,
                          errorMessage,
                          handleChange,
                          handleBlur,
                        }"
                        name="entity"
                      >
                        <BaseListbox
                          label="Entité"
                          :items="entitiesData.data"
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
                    <div class="ltablet:col-span-12 col-span-12 lg:col-span-6">
                      <Field
                        v-slot="{
                          field,
                          errorMessage,
                          handleChange,
                          handleBlur,
                        }"
                        name="label"
                      >
                        <BaseInput
                          label="Code"
                          icon="ph:note"
                          placeholder="Ex: SG.."
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
                  <div class="grid grid-cols-12 gap-4 mt-2">
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
                                  label="Date de debut"
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
                                  label="Date de fin"
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

                  <div class="grid grid-cols-12 gap-4 mt-2">
                    <div class="ltablet:col-span-12 col-span-12 lg:col-span-6">
                      <Field
                        v-slot="{
                          field,
                          errorMessage,
                          handleChange,
                          handleBlur,
                        }"
                        name="supplier"
                      >
                        <BaseListbox
                          label="Fournisseur"
                          :items="supplierData.data"
                          :properties="{
                            value: 'id',
                            label: 'name',
                            sublabel: 'email',
                            media: 'logo',
                          }"
                          v-model="field.value"
                          :error="errorMessage"
                          :disabled="isSubmitting"
                          @update:model-value="handleChange"
                          @blur="handleBlur"
                        />
                      </Field>
                    </div>
                    <div class="ltablet:col-span-12 col-span-12 lg:col-span-6">
                      <Field
                        v-slot="{
                          field,
                          errorMessage,
                          handleChange,
                          handleBlur,
                        }"
                        name="currency"
                      >
                        <BaseListbox
                          label="Devise"
                          :items="currencies"
                          :properties="{
                            value: 'id',
                            label: 'name',
                            sublabel: '',
                            media: '',
                          }"
                          v-model="field.value"
                          :error="errorMessage"
                          :disabled="isSubmitting"
                          @update:model-value="handleChange"
                          @blur="handleBlur"
                        />
                      </Field>
                    </div>
                  </div>
                  <div class="col-span-12 sm:col-span-6 mt-2">
                    <Field
                      v-slot="{ field, errorMessage, handleChange, handleBlur }"
                      name="montant"
                    >
                      <BaseInput
                        label="Montant"
                        icon="ph:money"
                        placeholder="Ex: 500 000 000"
                        :model-value="field.value"
                        :error="errorMessage"
                        :disabled="isSubmitting"
                        type="text"
                        @update:model-value="handleChange"
                        @blur="handleBlur"
                      />
                    </Field>
                  </div>
                  <div class="grid grid-cols-12 gap-4 mt-2">
                    <div class="ltablet:col-span-12 col-span-12 lg:col-span-6">
                      <Field
                        v-slot="{
                          field,
                          errorMessage,
                          handleChange,
                          handleBlur,
                        }"
                        name="bank"
                      >
                        <BaseListbox
                          label="Banque"
                          :items="banks"
                          :properties="{
                            value: 'id',
                            label: 'name',
                            sublabel: '',
                            media: 'logo',
                          }"
                          v-model="field.value"
                          :error="errorMessage"
                          :disabled="isSubmitting"
                          @update:model-value="handleChange"
                          @blur="handleBlur"
                        />
                      </Field>
                    </div>
                    <div class="ltablet:col-span-12 col-span-12 lg:col-span-6">
                      <Field
                        v-slot="{
                          field,
                          errorMessage,
                          handleChange,
                          handleBlur,
                        }"
                        name="pr"
                      >
                        <BaseInput
                          label="PR"
                          icon="ph:note"
                          placeholder="Ex: PR.."
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
              Créer
            </BaseButton>
          </div>
        </div>
      </template>
    </TairoModal>
  </div>
</template>
