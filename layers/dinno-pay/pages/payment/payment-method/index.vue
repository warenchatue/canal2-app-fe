<script setup lang="ts">
import { toTypedSchema } from '@vee-validate/zod'
import { Field, useFieldError, useForm } from 'vee-validate'
import { z } from 'zod'
import { Transaction } from '~/types/transaction'

definePageMeta({
  title: 'Messaging',
  layout: 'empty',
  preview: {
    title: 'Messaging app',
    description: 'For chat and messaging apps',
    categories: ['dashboards'],
    src: '/img/screens/dashboards-messaging.png',
    srcDark: '/img/screens/dashboards-messaging-dark.png',
    order: 26,
  },
})

const { open } = usePanels()

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

const chatEl = ref<HTMLElement>()
const expanded = ref(true)
const loading = ref(false)
const search = ref('')
const message = ref('')
const messageLoading = ref(false)
const activePaymentMethod = ref(0)
const activeCountry = ref({ id: '', abbr: '', name: '', flag: '' })
const activeOperator = ref({ abbr: '', name: '', logo: '' })
const phoneNumber = ref('')

const auth = useAuthStore()
const txnStore = useTransactionStore()
const router = useRouter()

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

// This is the computed value that will be used to display the current avatar
const currentAvatar = computed(() => '/img/avatars/payment.svg')

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
const fieldsWithErrors = computed(() => Object.keys(errors.value).length)

// BaseInputFileHeadless gives us a listfile input, but we need to
// extract the file from the list and set it to the form
const inputFile = ref<FileList | null>(null)
const fileError = useFieldError('avatar')
watch(inputFile, (value) => {
  const file = value?.item(0) || null
  setFieldValue('avatar', file)
})

// Ask the user for confirmation before leaving the page if the form has unsaved changes
// onBeforeRouteLeave(() => {
//   if (meta.value.dirty) {
//     return confirm('You have unsaved changes. Are you sure you want to leave?')
//   }
// })

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

const selectedPaymentMethod = computed(() => {
  return paymentMethods.value.find(
    (paymentMethod) => paymentMethod.id === activePaymentMethod.value,
  )
})

onMounted(() => {
  setTimeout(() => {
    if (chatEl.value) {
      chatEl.value.scrollTo({
        top: chatEl.value.scrollHeight,
        behavior: 'smooth',
      })
    }
  }, 300)
})

function selectPaymentMethod(index: number) {
  if (messageLoading.value) return

  loading.value = true
  message.value = ''

  setTimeout(() => {
    activePaymentMethod.value = index
    loading.value = false
    console.log(activePaymentMethod.value)
  }, 10)
}

function selectCountry(id: string) {
  if (messageLoading.value) return

  loading.value = true
  message.value = ''

  setTimeout(() => {
    activeCountry.value = id
    loading.value = false
    console.log(activeCountry.value)
  }, 10)
}

async function gotoNext() {
  // console.log(paymentMethods.value[activePaymentMethod.value])
  // console.log(activeCountry.value)
  // console.log(activeOperator.value)
  // console.log(phoneNumber.value)
  const paymentMethod = {
    id: paymentMethods.value[activePaymentMethod.value].id,
    name: paymentMethods.value[activePaymentMethod.value].name,
    logo: paymentMethods.value[activePaymentMethod.value].logo,
    country: { ...activeCountry.value },
    operator: { ...activeOperator.value, phone: phoneNumber.value },
  }
  await txnStore.updateActiveTransaction({
    ...txnStore.activeTransaction,
    paymentMethod: paymentMethod,
  } as Transaction)
  console.log(txnStore.activeTransaction)
  const timer = setTimeout(async () => {
    router.push('/payment/process')
    clearTimeout(timer)
  }, 100)
}
</script>

<template>
  <div class="relative">
    <div class="bg-muted-100 dark:bg-muted-900 flex min-h-screen">
      <!-- Sidebar -->

      <!-- Conversations -->
      <div
        class="ltablet:border-r border-muted-200 dark:border-muted-700 dark:bg-muted-800 relative z-[9] h-screen w-28 bg-white sm:w-64 lg:border-r"
      >
        <div class="flex h-full flex-col mt-5">
          <!-- List -->
          <a
            v-for="(paymentMethod, index) in paymentMethods"
            :key="paymentMethod.id"
            href="#"
            class="flex h-16 w-28 py-11 px-2 shrink-0 items-center justify-center border-e-2 sm:w-64"
            :class="
              activePaymentMethod === index
                ? 'border-primary-500'
                : 'border-transparent'
            "
            @click.prevent="selectPaymentMethod(index)"
          >
            <!-- <BaseAvatar :src="paymentMethod.user.photo" size="xl" /> -->
            <DemoFlexTableStart
              label="user"
              hide-label="false"
              :title="paymentMethod.name"
              :subtitle="paymentMethod.description"
              :avatar="paymentMethod.logo"
              class="hidden sm:flex"
              size="xl"
            />
            <DemoFlexTableStart
              label="user"
              hide-label="false"
              :picture="paymentMethod.logo"
              class="flex sm:hidden justify-start"
              size="sm"
            />
          </a>
        </div>
      </div>
      <!-- Current paymentMethod -->
      <div
        class="relative w-full transition-all duration-300"
        :class="
          expanded
            ? 'ltablet:max-w-[calc(100%_-_160px)] lg:max-w-[calc(100%_-_160px)]'
            : 'ltablet:max-w-[calc(100%_-_470px)] lg:max-w-[calc(100%_-_550px)]'
        "
      >
        <div class="flex w-full flex-col">
          <!-- Header -->
          <div
            class="flex h-14 w-full items-center justify-between px-4 py-2 sm:px-8"
          >
            <div class="flex items-center gap-2">
              <div
                class="ltablet:w-full flex h-16 w-20 shrink-0 items-center justify-center lg:w-full"
              >
                <NuxtLink to="#" class="flex items-center justify-center">
                  <TairoLogo class="text-primary-600 h-10 w-10" />
                </NuxtLink>
              </div>
            </div>
            <div class="flex items-center gap-4">
              <BaseThemeToggle />
              <BaseText
                size="xs"
                class="text-muted-400 hover:cursor-pointer"
                @click="auth.logUserOut()"
                >{{ auth.user.firstName }} {{ auth.user.lastName }}</BaseText
              >
            </div>
          </div>
          <!-- Body -->
          <div
            ref="chatEl"
            class="relative h-[calc(100vh_-_128px)] w-full p-4 sm:p-8"
            :class="loading ? 'overflow-hidden' : 'overflow-y-auto slimscroll'"
          >
            <div v-if="activePaymentMethod == 0" class="mx-auto max-w-7xl px-4">
              <div
                class="mb-4 flex flex-col justify-between md:flex-row md:items-center"
              >
                <div
                  class="ltablet:max-w-full flex max-w-[425px] flex-col items-center gap-4 text-center md:flex-row md:text-left lg:max-w-full"
                >
                  <div>
                    <BaseHeading
                      as="h2"
                      size="xl"
                      weight="light"
                      lead="tight"
                      class="text-muted-800 !text-base !md:text-xl dark:text-white"
                    >
                      <span>Moyens de payments mobile</span>
                    </BaseHeading>
                    <BaseParagraph size="sm">
                      <span class="text-muted-500"> OM, MOMO </span>
                    </BaseParagraph>
                  </div>
                </div>
                <div
                  class="mt-4 flex items-center justify-center gap-2 md:mt-0 md:justify-start"
                >
                  <BaseButtonAction @click.prevent="$router.back()">
                    <Icon name="lucide:arrow-left" class="h-3 w-3" />
                    <span>Retour</span>
                  </BaseButtonAction>
                </div>
              </div>
              <BaseCard class="max-w-2xl">
                <form
                  method="POST"
                  action=""
                  class="divide-muted-200 dark:divide-muted-700"
                  @submit.prevent="onSubmit"
                >
                  <div
                    shape="curved"
                    class="bg-muted-50 dark:bg-muted-800/60 space-y-8 p-5 md:p-10"
                  >
                    <div class="mx-auto flex w-full flex-col">
                      <div>
                        <div>
                          <div class="grid grid-cols-12 gap-4 mt-4">
                            <div
                              class="ltablet:col-span-12 col-span-12 lg:col-span-12"
                            >
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
                              >Moyens de paiment disponible</label
                            >
                            <div
                              class="ptablet:grid-cols-2 ltablet:grid-cols-2 grid gap-4 lg:grid-cols-2"
                              v-if="activeCountry.id != ''"
                            >
                              <Field
                                v-for="operator in paymentMethods[0]
                                  .countries[0].operators"
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
                                        class="h-32 md:h-40 w-full rounded-lg object-cover"
                                      />
                                    </div>
                                    <div>
                                      <div class="mt-3">
                                        <BaseHeading
                                          tag="h3"
                                          size="md"
                                          weight="medium"
                                          lead="snug"
                                          class="line-clamp-2 text-gray-800 dark:text-gray-100"
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
                            <div class="col-span-12">
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
            </div>
          </div>
          <!-- Compose -->
          <form
            method="POST"
            action=""
            @submit.prevent="gotoNext"
            class="bg-muted-100 dark:bg-muted-900 flex h-16 w-full items-center px-4 sm:px-8"
          >
            <div class="relative flex justify-end w-full">
              <BaseButton
                type="submit"
                color="primary"
                class="!h-12 w-full mx-4 !bg-muted-600 sm:w-40"
              >
                Retour
              </BaseButton>
              <BaseButton
                type="submit"
                color="primary"
                class="!h-12 w-full mx-2 sm:w-40"
              >
                Suivant
              </BaseButton>
            </div>
          </form>
        </div>
      </div>
    </div>

    <TairoPanels />
  </div>
</template>
