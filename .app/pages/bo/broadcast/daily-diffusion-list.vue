<script setup lang="ts">
import { toTypedSchema } from '@vee-validate/zod'
import { DatePicker } from 'v-calendar'
import { Field, useForm } from 'vee-validate'
import { z } from 'zod'
import { UserRole } from '~/types/user'

definePageMeta({
  title: 'Conducteur Journalier des Publicités & Programmes',
  preview: {
    title: 'Conducteur Journalier des Publicités & Programmes',
    description: '',
    categories: ['bo', 'pub', 'diffusion-list'],
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
const perPage = ref(50)
const isModalImportPlaylistOpen = ref(false)
const isModalConfirmDiffusionOpen = ref(false)
const playedHour = ref('')

const initialDates = {
  start: new Date(),
  end: new Date(),
}

const planningDates = ref(initialDates)

watch([filter, perPage], () => {
  router.push({
    query: {
      page: undefined,
    },
  })
})

const app = useAppStore()
const token = useCookie('token')
const query = computed(() => {
  return {
    filter: filter.value,
    perPage: perPage.value,
    page: page.value,
    action: 'findToday',
    token: token.value,
  }
})

const { data, pending, error, refresh } = await useFetch(
  '/api/broadcast/plannings',
  {
    query,
  },
)

const inputPlayListFile = ref<FileList | null>(null)
const payListFile = ref<File | null>(null)
watch(inputPlayListFile, (value) => {
  const file = value?.item(0) || null
  payListFile.value = file
})

const selected = ref<number[]>([])
const isAllVisibleSelected = computed(() => {
  return selected.value.length === data.value?.data.length
})

function toggleAllVisibleSelection() {
  if (isAllVisibleSelected.value) {
    selected.value = []
  } else {
    selected.value = data.value?.data.map((item) => item._id) ?? []
  }
}

const { text, copy, copied, isSupported } = useClipboard()
const toaster = useToaster()
const handleClipboard = (textLink: string) => {
  copy(textLink)
  if (copied) {
    toaster.clearAll()
    toaster.show({
      title: 'Success',
      message: textLink + ` copié !`,
      color: 'success',
      icon: 'ph:check',
      closable: true,
    })
  }
}

const currentPlanning = ref({})
const chatEl = ref<HTMLElement>()
const expanded = ref(true)
const loading = ref(false)
const success = ref(false)

function selectPlanning(planning: any) {
  isModalConfirmDiffusionOpen.value = true
  loading.value = true
  setTimeout(() => {
    currentPlanning.value = planning
    loading.value = false
  }, 10)
}

async function confirmDiffusion(planning: any) {
  const query2 = computed(() => {
    return {
      action: 'updatePlanning',
      token: token.value,
      id: currentPlanning.value._id,
    }
  })
  const pathP = currentPlanning.value.product ? 'pub' : 'tv-programs'
  const response = await useFetch(`/api/${pathP}/plannings`, {
    method: 'put',
    headers: { 'Content-Type': 'application/json' },
    query: query2,
    body: {
      ...currentPlanning.value._id,
      isManualPlay: true,
      playedHour: playedHour.value ?? '',
    },
  })

  if (response.data?.value?.success) {
    success.value = true
    toaster.clearAll()
    toaster.show({
      title: 'Success',
      message: `Diffusion confirmée !`,
      color: 'success',
      icon: 'ph:check',
      closable: true,
    })
    isModalConfirmDiffusionOpen.value = false
    filter.value = 'planning'
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

function downloadProductFile(uri: string, item: any) {
  const link = document.createElement('a')
  link.href = '/' + uri
  const fileElements = item.product?.file.split('.')
  link.download =
    item.product.message + '.' + fileElements[fileElements.length - 1]
  link.click()
  document.body.removeChild(link)
}

async function importPlayList() {
  const slug = ref('null')
  const token = useCookie('token')
  try {
    const fd = new FormData()
    fd.append('0', payListFile.value)
    const query3 = computed(() => {
      return {
        action: 'import-playlist',
        startDate: encodeURIComponent(planningDates.value.start.toJSON()),
        endDate: encodeURIComponent(planningDates.value.end.toJSON()),
        token: token.value,
      }
    })

    const { data: uploadData, refresh } = await useFetch('/api/files/upload', {
      method: 'POST',
      query: query3,
      body: fd,
    })
    console.log(uploadData)
    if (uploadData.value?.success == true) {
      slug.value = ''
      toaster.clearAll()
      toaster.show({
        title: 'Success',
        message: `Vérification terminée !`,
        color: 'success',
        icon: 'ph:check',
        closable: true,
      })
    } else {
      slug.value = ''
      toaster.clearAll()
      toaster.show({
        title: 'Désolé',
        message: `Une erreur est survenue lors de l'importation de la playlist !`,
        color: 'danger',
        icon: 'ph:check',
        closable: true,
      })
    }
  } catch (error) {}
  isModalImportPlaylistOpen.value = false
}

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

// This is where you would send the form data to the server
const onSubmit = handleSubmit(
  async (values) => {
    success.value = false

    // here you have access to the validated form values
    console.log('planning-create-success', values)

    try {
      toaster.clearAll()
      toaster.show({
        title: 'Success',
        message: `Record has been created!`,
        color: 'success',
        icon: 'ph:check',
        closable: true,
      })
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
          title: 'Désolé!',
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
          placeholder="Filtre programme..."
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
          :disabled="
            authStore.user.appRole.name != UserRole.broadcast &&
            authStore.user.appRole.name != UserRole.superAdmin
          "
          @click="isModalImportPlaylistOpen = true"
          color="primary"
          class="w-full sm:w-48"
        >
          <Icon name="lucide:import" class="h-4 w-4" />
          <span>Importer playlist</span>
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
                <span>Total Diffusés</span>
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
                <span>-</span>
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
                <span>Total non diffusés</span>
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
                <span>-</span>
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
                <span>Total en attente</span>
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
                <span>-</span>
              </BaseHeading>
            </div>
            <div
              class="text-success-500 flex items-center gap-1 font-sans text-sm"
            >
              <span>+O% </span>
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
                <span>Total du jour</span>
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
                <span>{{ data?.metaData?.totalToday ?? 0 }}</span>
              </BaseHeading>
            </div>
            <div
              class="text-success-500 flex items-center gap-1 font-sans text-sm"
            >
              <span>- %</span>
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
                <TairoTableHeading uppercase spaced> Heures </TairoTableHeading>
                <TairoTableHeading uppercase spaced> Type </TairoTableHeading>

                <TairoTableHeading uppercase spaced>
                  Emission / Produit
                </TairoTableHeading>
                <TairoTableHeading uppercase spaced>
                  Description / Message
                </TairoTableHeading>

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
                :style="{
                  backgroundColor: getBackgroundColor(
                    item.tvProgram?.category?.colorCode,
                  ),
                }"
                v-for="item in data?.data"
                :key="item._id"
              >
                <TairoTableCell spaced>
                  <div class="flex items-center">
                    <BaseCheckbox
                      v-model="selected"
                      :value="item._id"
                      :name="`item-checkbox-${item._id}`"
                      shape="rounded"
                      class="text-primary-500"
                    />
                  </div>
                </TairoTableCell>
                <TairoTableCell spaced>
                  <div class="flex items-center">
                    <span
                      class="text-muted-600 dark:text-muted-300 font-sans text-base"
                    >
                      {{ new Date(item.date).toLocaleDateString('fr-FR') }}
                    </span>
                  </div>
                </TairoTableCell>
                <TairoTableCell spaced>
                  <div class="flex items-center">
                    <span
                      class="text-muted-600 dark:text-muted-300 font-sans text-base"
                    >
                      {{
                        new Date(item.date)
                          .toLocaleTimeString('fr-FR')
                          .replace(':00', '')
                          .replace(':', 'H')
                      }}

                      <span v-if="item.date">
                        -
                        {{
                          new Date(
                            new Date(item.date).getTime() +
                              (item.tvProgram?.duration ?? 0) * 60000,
                          )
                            .toLocaleTimeString('fr-FR')
                            .replace(':00', '')
                            .replace(':', 'H')
                        }}</span
                      >
                    </span>
                  </div>
                </TairoTableCell>
                <TairoTableCell spaced>
                  <BaseTag
                    v-if="item.tvProgram"
                    color="info"
                    flavor="pastel"
                    shape="full"
                    condensed
                    class="font-medium"
                  >
                    EMISSION
                  </BaseTag>
                  <BaseTag
                    v-else-if="item.product"
                    color="warning"
                    flavor="pastel"
                    shape="full"
                    condensed
                    class="font-medium"
                  >
                    PUB
                  </BaseTag>
                </TairoTableCell>
                <TairoTableCell light spaced>
                  <div class="flex items-center">
                    <BaseText
                      size="sm"
                      class="hover:cursor-pointer"
                      @click="
                        handleClipboard(
                          (item.tvProgram
                            ? item.tvProgram?.name
                            : item.product
                            ? item.product.product
                            : '') +
                            ' [' +
                            item.code +
                            ']',
                        )
                      "
                    >
                      <span
                        class="text-muted-600 dark:text-muted-300 font-sans text-base px-1"
                      >
                        {{
                          (item.tvProgram
                            ? item.tvProgram?.name
                            : item.product
                            ? item.product?.product
                            : '') +
                          ' [' +
                          item.code +
                          ']'
                        }}
                      </span></BaseText
                    >
                    <Icon name="ph:link-duotone" class="h-5 w-5" />
                  </div>
                </TairoTableCell>
                <TairoTableCell spaced>
                  <div
                    style="white-space: pre-wrap; word-wrap: break-word"
                    class=""
                  >
                    <h4
                      v-html="
                        item.tvProgram
                          ? item.description
                          : item.product
                          ? item.product.message
                          : ''
                      "
                      class="font-sans !w-80 text-sm text-justify font-medium"
                    ></h4>
                  </div>
                </TairoTableCell>

                <TairoTableCell spaced>
                  <div class="flex items-center">
                    <span
                      class="text-muted-600 dark:text-muted-300 font-sans text-base"
                    >
                      {{
                        formattedDuration(
                          item.tvProgram
                            ? item.tvProgram.duration
                            : item.product
                            ? (item.product.duration / 60).toFixed(2)
                            : '',
                        )
                      }}
                    </span>
                  </div>
                </TairoTableCell>

                <TairoTableCell spaced class="capitalize">
                  <BaseTag
                    v-if="item.isManualPlay == true || item.isAutoPlay == true"
                    color="success"
                    flavor="pastel"
                    shape="full"
                    condensed
                    class="font-medium"
                  >
                    Diffusé
                  </BaseTag>
                  <BaseTag
                    v-else-if="
                      item.isManualPlay == false && item.isAutoPlay == false
                    "
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
                  <BaseButtonAction
                    @click.prevent="selectPlanning(item)"
                    muted
                    :disabled="
                      authStore.user.appRole.name != UserRole.broadcast &&
                      authStore.user.appRole.name != UserRole.superAdmin
                    "
                    :class="{
                      '!text-orange-400':
                        item.isManualPlay == false && item.isAutoPlay == false,
                      '!text-success-500':
                        item.isManualPlay == true || item.isAutoPlay == true,
                    }"
                  >
                    <Icon name="lucide:check" class="h-4 w-4" />
                    valider</BaseButtonAction
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

    <!-- Modal import playlist -->
    <TairoModal
      :open="isModalImportPlaylistOpen"
      size="xl"
      @close="isModalImportPlaylistOpen = false"
    >
      <template #header>
        <!-- Header -->
        <div class="flex w-full items-center justify-between p-4 md:p-6">
          <h3
            class="font-heading text-muted-900 text-lg font-medium leading-6 dark:text-white"
          >
            Import playlist
          </h3>

          <BaseButtonClose @click="isModalImportPlaylistOpen = false" />
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
                  <div class="col-span-12 sm:col-span-6 mt-2">
                    <Field
                      v-slot="{ field, errorMessage, handleChange, handleBlur }"
                      name="montant"
                    >
                      <BaseInput
                        label="Message"
                        icon="ph:file"
                        placeholder=""
                        :model-value="field.value"
                        :error="errorMessage"
                        :disabled="isSubmitting"
                        type="text"
                        @update:model-value="handleChange"
                        @blur="handleBlur"
                      />
                    </Field>
                  </div>
                  <div class="col-span-12 mx-2 mt-2">
                    <DatePicker
                      v-model.range="planningDates"
                      :masks="masks"
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
                              v-slot="{
                                field,
                                errorMessage,
                                handleChange,
                                handleBlur,
                              }"
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
                  <div class="col-span-12 sm:col-span-6 mt-2">
                    <BaseInputFile
                      v-model="inputPlayListFile"
                      shape="rounded"
                      label="Fichier"
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
            <BaseButton @click="isModalImportPlaylistOpen = false"
              >Annuler</BaseButton
            >

            <BaseButton
              color="primary"
              flavor="solid"
              @click="importPlayList()"
            >
              Importer
            </BaseButton>
          </div>
        </div>
      </template>
    </TairoModal>

    <!-- Modal confirm diffusion -->
    <TairoModal
      :open="isModalConfirmDiffusionOpen"
      size="sm"
      @close="isModalConfirmDiffusionOpen = false"
    >
      <template #header>
        <!-- Header -->
        <div class="flex w-full items-center justify-between p-4 md:p-6">
          <h3
            class="font-heading text-muted-900 text-lg font-medium leading-6 dark:text-white"
          >
            Confirmation de diffusion
          </h3>

          <BaseButtonClose @click="isModalConfirmDiffusionOpen = false" />
        </div>
      </template>

      <!-- Body -->
      <div class="p-4 md:p-6">
        <div class="mx-auto w-full max-w-xs text-center">
          <h3
            class="font-heading text-muted-800 text-lg font-medium leading-6 dark:text-white"
          >
            Voulez-vous confirmer la diffusion de
            <span class="text-primary-500">{{
              currentPlanning.product
                ? currentPlanning?.product.product
                : currentPlanning.tvProgram
                ? currentPlanning?.tvProgram?.name
                : ''
            }}</span>
            à
            <span class="text-primary-500">{{
              currentPlanning?.hour?.code
            }}</span>
            ?
          </h3>
          <div class="col-span-12 sm:col-span-6 my-2">
            <BaseInput
              label="Préciser une autre heure: ex: 08:25"
              icon="ph:clock"
              placeholder=""
              v-model="playedHour"
              :error="errorMessage"
              :disabled="isSubmitting"
              type="text"
              @update:model-value="handleChange"
              @blur="handleBlur"
            />
          </div>

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
            <BaseButton @click="isModalConfirmDiffusionOpen = false"
              >Annuler</BaseButton
            >

            <BaseButton
              color="primary"
              flavor="solid"
              @click="confirmDiffusion(currentPlanning)"
              >Valider</BaseButton
            >
          </div>
        </div>
      </template>
    </TairoModal>
  </div>
</template>
