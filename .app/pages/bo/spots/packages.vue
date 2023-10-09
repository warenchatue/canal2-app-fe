<script setup lang="ts">
import { toTypedSchema } from '@vee-validate/zod'
import { Field, useFieldError, useForm } from 'vee-validate'
import { z } from 'zod'

definePageMeta({
  title: 'Commandes',
  preview: {
    title: 'Commandes',
    description: 'Contribution and withdrawal',
    categories: ['bo', 'spots', 'packages'],
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
    action: 'findAll',
    token: token.value,
  }
})

const { data, pending, error, refresh } = await useFetch(
  '/api/spots/packages',
  {
    query,
  },
)

const { data: announcers } = await useFetch('/api/spots/announcers', {
  query,
})
function editPackage(spotPackage: any) {
  isModalNewPackageOpen.value = true
  isEdit.value = true
  setFieldValue('spotPackage._id', spotPackage._id)
  setFieldValue('spotPackage.label', spotPackage.label)
  setFieldValue('spotPackage.numberSpots', spotPackage.numberSpots)
  setFieldValue('spotPackage.numberProducts', spotPackage.numberProducts)
  setFieldValue('spotPackage.period', spotPackage.period)
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

  const response = await useFetch('/api/spots/packages', {
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
      numberSpots: z.number(),
      numberProducts: z.number(),
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
    numberSpots: 0,
    numberProducts: 0,
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

const toaster = useToaster()
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

        const response = await useFetch('/api/spots/packages', {
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

        const response = await useFetch('/api/spots/packages', {
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
        <BaseInput
          v-model="filter"
          icon="lucide:search"
          placeholder="Filtrer package..."
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
          @click=";(isModalNewPackageOpen = true), (isEdit = false)"
        >
          <Icon name="ph:plus" class="h-4 w-4" />
          <span>Nouvelle commande</span>
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
                <span>{{ data.metaData?.totalItems }}</span>
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
                <span>Annonceurs</span>
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
                <span>{{ data.metaData?.totalAnnouncers }}</span>
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
                <span>Spots</span>
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
                <span>{{ data.metaData?.totalSpots }}</span>
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
                <span>Produits</span>
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
                <span>{{ data.metaData?.totalFiles }}</span>
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
                  Annonceur
                </TairoTableHeading>

                <TairoTableHeading uppercase spaced>Libellé</TairoTableHeading>

                <TairoTableHeading uppercase spaced
                  >Commandés</TairoTableHeading
                >

                <TairoTableHeading uppercase spaced>Diffusés</TairoTableHeading>
                <TairoTableHeading uppercase spaced>Produits</TairoTableHeading>

                <TairoTableHeading uppercase spaced>Période</TairoTableHeading>
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
                <TairoTableCell spaced>
                  <div class="flex items-center">
                    <BaseAvatar
                      :src="item.announcer?.logo"
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
                  {{ item.label }}
                </TairoTableCell>
                <TairoTableCell light spaced>
                  {{ item.numberSpots }} spots
                </TairoTableCell>
                <TairoTableCell light spaced>
                  {{ item.numberPlay ?? 0 }} spots
                </TairoTableCell>
                <TairoTableCell light spaced>
                  {{ item.numberProducts }}
                </TairoTableCell>
                <TairoTableCell light spaced>
                  {{ item.period }}
                </TairoTableCell>
                <TairoTableCell spaced class="capitalize">
                  <BaseTag
                    v-if="item.state === 'trashed'"
                    color="muted"
                    flavor="pastel"
                    shape="full"
                    condensed
                    class="font-medium"
                  >
                    {{ item.state }}
                  </BaseTag>
                  <BaseTag
                    v-else-if="item.state === 'active'"
                    color="warning"
                    flavor="pastel"
                    shape="full"
                    condensed
                    class="font-medium"
                  >
                    {{ item.state }}
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
                    <BaseButtonAction @click="editPackage(item)">
                      <Icon name="lucide:edit" class="h-4 w-4"
                    /></BaseButtonAction>
                    <BaseButtonAction
                      @click="confirmDeletePackage(item)"
                      class="mx-2"
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

                  <div class="col-span-12 md:col-span-6">
                    <Field
                      v-slot="{ field, errorMessage, handleChange, handleBlur }"
                      name="spotPackage.numberSpots"
                    >
                      <BaseInput
                        label="Nombre de spots"
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

                  <div class="col-span-12 md:col-span-6">
                    <Field
                      v-slot="{ field, errorMessage, handleChange, handleBlur }"
                      name="spotPackage.totalAmount"
                    >
                      <BaseInput
                        label="Montant total Facture"
                        icon="ph:file-duotone"
                        type="number"
                        placeholder=""
                        :model-value="field.value"
                        :error="errorMessage"
                        :disabled="
                          isSubmitting ||
                          (authStore.user?.appRole?.name != 'Admin' &&
                            authStore.user?.appRole?.name != 'Billing')
                        "
                        @update:model-value="handleChange"
                        @blur="handleBlur"
                      />
                    </Field>
                  </div>
                  <div class="col-span-12 md:col-span-6">
                    <Field
                      v-slot="{ field, errorMessage, handleChange, handleBlur }"
                      name="spotPackage.totalAmount"
                    >
                      <BaseInput
                        label="Nombre de spots payés"
                        icon="ph:file-duotone"
                        type="number"
                        placeholder=""
                        :model-value="field.value"
                        :error="errorMessage"
                        :disabled="
                          isSubmitting ||
                          (authStore.user?.appRole?.name != 'Admin' &&
                            authStore.user?.appRole?.name != 'Billing')
                        "
                        @update:model-value="handleChange"
                        @blur="handleBlur"
                      />
                    </Field>
                  </div>
                  <div class="col-span-12 md:col-span-6">
                    <Field
                      v-slot="{ field, errorMessage, handleChange, handleBlur }"
                      name="spotPackage.period"
                    >
                      <BaseInput
                        label="Periode"
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
                <div class="grid grid-cols-12 gap-4 mt-4">
                  <div class="ltablet:col-span-6 col-span-12 lg:col-span-6">
                    <Field
                      v-slot="{ field, errorMessage, handleChange, handleBlur }"
                      name="spotPackage.announcer"
                    >
                      <BaseListbox
                        label="Annonceur"
                        :items="announcers?.data"
                        :properties="{
                          value: '_id',
                          label: 'name',
                          sublabel: 'email',
                          media: 'flag',
                        }"
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
                      name="spotPackage.status"
                    >
                      <BaseSelect
                        label="Statut *"
                        icon="ph:funnel"
                        :model-value="field.value"
                        :error="errorMessage"
                        :disabled="
                          isSubmitting ||
                          (authStore.user?.appRole?.name != 'Admin' &&
                            authStore.user?.appRole?.name != 'Billing')
                        "
                        @update:model-value="handleChange"
                        @blur="handleBlur"
                      >
                        <option value="onHold">En attente de validation</option>
                        <option value="confirmed">Validéé</option>
                        <option value="completed">Soldée</option>
                        <option value="closed">Cloturées</option>
                      </BaseSelect>
                    </Field>
                  </div>
                  <div
                    class="mt-2 ltablet:col-span-6 col-span-12 lg:col-span-6"
                  >
                    <div class="relative mx-auto max-w-3xl">
                      <BaseInputFileHeadless
                        multiple
                        v-model="orderContracts"
                        v-slot="{ open, remove, preview, drop, files }"
                        :disabled="
                          authStore.user?.appRole?.name != 'Admin' &&
                          authStore.user?.appRole?.name != 'Billing'
                        "
                      >
                        <!-- Controls -->
                        <div class="mb-4 flex items-center gap-2">
                          <button
                            type="button"
                            class="nui-focus border-muted-200 hover:border-primary-500 text-muted-700 dark:text-muted-200 hover:text-primary-600 dark:border-muted-700 dark:bg-muted-800 dark:hover:border-primary-500 dark:hover:text-primary-600 relative flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border bg-white transition-colors duration-300"
                            tooltip="Select files"
                            @click="open"
                          >
                            <Icon
                              name="lucide:plus"
                              class="absolute start-1/2 top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2"
                            />
                            <span class="sr-only">Select files</span>
                          </button>
                          <button
                            type="button"
                            class="nui-focus border-muted-200 hover:border-primary-500 text-muted-700 dark:text-muted-200 hover:text-primary-600 dark:border-muted-700 dark:bg-muted-800 dark:hover:border-primary-500 dark:hover:text-primary-600 relative flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border bg-white transition-colors duration-300"
                            tooltip="Start Upload"
                          >
                            <Icon name="lucide:arrow-up" class="h-4 w-4" />

                            <span class="sr-only">Start Upload</span>
                          </button>
                        </div>

                        <div
                          class=""
                          @dragenter.stop.prevent
                          @dragover.stop.prevent
                          @drop="drop"
                        >
                          <div
                            v-if="!orderContracts?.length"
                            class="nui-focus border-muted-300 dark:border-muted-800 hover:border-muted-400 focus:border-muted-400 dark:hover:border-muted-700 dark:focus:border-muted-700 group cursor-pointer rounded-lg border-[3px] border-dashed p-4 transition-colors duration-300"
                            tabindex="0"
                            role="button"
                            @click="open"
                            @keydown.enter.prevent="open"
                          >
                            <div class="p-5 text-center">
                              <Icon
                                name="mdi-light:cloud-upload"
                                class="text-muted-400 group-hover:text-primary-500 group-focus:text-primary-500 mb-2 h-12 w-12 transition-colors duration-300"
                              />
                              <h4 class="text-muted-400 font-sans text-sm">
                                Glissez et déposer
                              </h4>
                              <div>
                                <span
                                  class="text-muted-400 font-sans text-xs font-semibold uppercase"
                                >
                                  Ou
                                </span>
                              </div>
                              <label
                                for="file"
                                class="text-muted-400 group-hover:text-primary-500 group-focus:text-primary-500 cursor-pointer font-sans text-sm underline underline-offset-4 transition-colors duration-300"
                              >
                                Selectionnez le contrat
                              </label>
                            </div>
                          </div>
                          <ul v-else class="mt-6 space-y-2">
                            <li v-for="file in orderContracts" :key="file.name">
                              <div
                                class="border-muted-200 dark:border-muted-700 dark:bg-muted-800 relative flex items-center justify-end gap-2 rounded-xl border bg-white p-3"
                              >
                                <div class="flex items-center gap-2">
                                  <div class="shrink-0">
                                    <img
                                      class="h-14 w-14 rounded-xl object-cover object-center"
                                      v-if="file.type.startsWith('image')"
                                      src="/img/avatars/placeholder-file.png"
                                      alt="Image preview"
                                    />
                                    <img
                                      v-else
                                      class="h-14 w-14 rounded-xl object-cover object-center"
                                      src="/img/avatars/placeholder-file.png"
                                      alt="Image preview"
                                    />
                                  </div>
                                  <div class="font-sans">
                                    <span
                                      class="text-muted-800 dark:text-muted-100 line-clamp-1 block text-sm"
                                    >
                                      {{ file.name }}
                                    </span>
                                    <span class="text-muted-400 block text-xs">
                                      {{ formatFileSize(file.size) }}
                                    </span>
                                  </div>
                                </div>

                                <div
                                  class="ms-auto w-32 px-4 transition-opacity duration-300"
                                  :class="'opacity-100'"
                                >
                                  <BaseProgress
                                    :value="0"
                                    size="xs"
                                    :color="'success'"
                                  />
                                </div>
                                <div class="flex gap-2">
                                  <button
                                    class="border-muted-200 hover:border-primary-500 text-muted-700 dark:text-muted-200 hover:text-primary-600 dark:border-muted-700 dark:bg-muted-900 dark:hover:border-primary-500 dark:hover:text-primary-600 relative flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border bg-white transition-colors duration-300 disabled:cursor-not-allowed disabled:opacity-60"
                                    disabled
                                    type="button"
                                    tooltip="Cancel"
                                  >
                                    <Icon name="lucide:slash" class="h-4 w-4" />
                                    <span class="sr-only">Cancel</span>
                                  </button>

                                  <button
                                    class="border-muted-200 hover:border-primary-500 text-muted-700 dark:text-muted-200 hover:text-primary-600 dark:border-muted-700 dark:bg-muted-900 dark:hover:border-primary-500 dark:hover:text-primary-600 relative flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border bg-white transition-colors duration-300"
                                    type="button"
                                    tooltip="Upload"
                                  >
                                    <Icon
                                      name="lucide:arrow-up"
                                      class="h-4 w-4"
                                    />
                                    <span class="sr-only">Upload</span>
                                  </button>
                                  <button
                                    class="border-muted-200 hover:border-primary-500 text-muted-700 dark:text-muted-200 hover:text-primary-600 dark:border-muted-700 dark:bg-muted-900 dark:hover:border-primary-500 dark:hover:text-primary-600 relative flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border bg-white transition-colors duration-300"
                                    type="button"
                                    tooltip="Remove"
                                    @click.prevent="remove(file)"
                                  >
                                    <Icon name="lucide:x" class="h-4 w-4" />
                                    <span class="sr-only">Remove</span>
                                  </button>
                                </div>
                              </div>
                            </li>
                          </ul>
                        </div>
                      </BaseInputFileHeadless>
                    </div>
                  </div>
                  <div
                    class="mt-2 ltablet:col-span-6 col-span-12 lg:col-span-6"
                  >
                    <div class="relative mx-auto max-w-3xl">
                      <BaseInputFileHeadless
                        multiple
                        v-model="orderInvoices"
                        v-slot="{ open, remove, preview, drop, files }"
                        :disabled="
                          authStore.user?.appRole?.name != 'Admin' &&
                          authStore.user?.appRole?.name != 'Billing'
                        "
                      >
                        <!-- Controls -->
                        <div class="mb-4 flex items-center gap-2">
                          <button
                            type="button"
                            class="nui-focus border-muted-200 hover:border-primary-500 text-muted-700 dark:text-muted-200 hover:text-primary-600 dark:border-muted-700 dark:bg-muted-800 dark:hover:border-primary-500 dark:hover:text-primary-600 relative flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border bg-white transition-colors duration-300"
                            tooltip="Select files"
                            @click="open"
                          >
                            <Icon
                              name="lucide:plus"
                              class="absolute start-1/2 top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2"
                            />
                            <span class="sr-only">Select files</span>
                          </button>
                          <button
                            type="button"
                            class="nui-focus border-muted-200 hover:border-primary-500 text-muted-700 dark:text-muted-200 hover:text-primary-600 dark:border-muted-700 dark:bg-muted-800 dark:hover:border-primary-500 dark:hover:text-primary-600 relative flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border bg-white transition-colors duration-300"
                            tooltip="Start Upload"
                          >
                            <Icon name="lucide:arrow-up" class="h-4 w-4" />

                            <span class="sr-only">Start Upload</span>
                          </button>
                        </div>

                        <div
                          class=""
                          @dragenter.stop.prevent
                          @dragover.stop.prevent
                          @drop="drop"
                        >
                          <div
                            v-if="!orderInvoices?.length"
                            class="nui-focus border-muted-300 dark:border-muted-800 hover:border-muted-400 focus:border-muted-400 dark:hover:border-muted-700 dark:focus:border-muted-700 group cursor-pointer rounded-lg border-[3px] border-dashed p-4 transition-colors duration-300"
                            tabindex="0"
                            role="button"
                            @click="open"
                            @keydown.enter.prevent="open"
                          >
                            <div class="p-5 text-center">
                              <Icon
                                name="mdi-light:cloud-upload"
                                class="text-muted-400 group-hover:text-primary-500 group-focus:text-primary-500 mb-2 h-12 w-12 transition-colors duration-300"
                              />
                              <h4 class="text-muted-400 font-sans text-sm">
                                Glissez et déposer
                              </h4>
                              <div>
                                <span
                                  class="text-muted-400 font-sans text-xs font-semibold uppercase"
                                >
                                  Ou
                                </span>
                              </div>
                              <label
                                for="file"
                                class="text-muted-400 group-hover:text-primary-500 group-focus:text-primary-500 cursor-pointer font-sans text-sm underline underline-offset-4 transition-colors duration-300"
                              >
                                Selectionnez la facture
                              </label>
                            </div>
                          </div>
                          <ul v-else class="mt-6 space-y-2">
                            <li v-for="file in orderInvoices" :key="file.name">
                              <div
                                class="border-muted-200 dark:border-muted-700 dark:bg-muted-800 relative flex items-center justify-end gap-2 rounded-xl border bg-white p-3"
                              >
                                <div class="flex items-center gap-2">
                                  <div class="shrink-0">
                                    <img
                                      class="h-14 w-14 rounded-xl object-cover object-center"
                                      v-if="file.type.startsWith('image')"
                                      src="/img/avatars/placeholder-file.png"
                                      alt="Image preview"
                                    />
                                    <img
                                      v-else
                                      class="h-14 w-14 rounded-xl object-cover object-center"
                                      src="/img/avatars/placeholder-file.png"
                                      alt="Image preview"
                                    />
                                  </div>
                                  <div class="font-sans">
                                    <span
                                      class="text-muted-800 dark:text-muted-100 line-clamp-1 block text-sm"
                                    >
                                      {{ file.name }}
                                    </span>
                                    <span class="text-muted-400 block text-xs">
                                      {{ formatFileSize(file.size) }}
                                    </span>
                                  </div>
                                </div>

                                <div
                                  class="ms-auto w-32 px-4 transition-opacity duration-300"
                                  :class="'opacity-100'"
                                >
                                  <BaseProgress
                                    :value="0"
                                    size="xs"
                                    :color="'success'"
                                  />
                                </div>
                                <div class="flex gap-2">
                                  <button
                                    class="border-muted-200 hover:border-primary-500 text-muted-700 dark:text-muted-200 hover:text-primary-600 dark:border-muted-700 dark:bg-muted-900 dark:hover:border-primary-500 dark:hover:text-primary-600 relative flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border bg-white transition-colors duration-300 disabled:cursor-not-allowed disabled:opacity-60"
                                    disabled
                                    type="button"
                                    tooltip="Cancel"
                                  >
                                    <Icon name="lucide:slash" class="h-4 w-4" />
                                    <span class="sr-only">Cancel</span>
                                  </button>

                                  <button
                                    class="border-muted-200 hover:border-primary-500 text-muted-700 dark:text-muted-200 hover:text-primary-600 dark:border-muted-700 dark:bg-muted-900 dark:hover:border-primary-500 dark:hover:text-primary-600 relative flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border bg-white transition-colors duration-300"
                                    type="button"
                                    tooltip="Upload"
                                  >
                                    <Icon
                                      name="lucide:arrow-up"
                                      class="h-4 w-4"
                                    />
                                    <span class="sr-only">Upload</span>
                                  </button>
                                  <button
                                    class="border-muted-200 hover:border-primary-500 text-muted-700 dark:text-muted-200 hover:text-primary-600 dark:border-muted-700 dark:bg-muted-900 dark:hover:border-primary-500 dark:hover:text-primary-600 relative flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border bg-white transition-colors duration-300"
                                    type="button"
                                    tooltip="Remove"
                                    @click.prevent="remove(file)"
                                  >
                                    <Icon name="lucide:x" class="h-4 w-4" />
                                    <span class="sr-only">Remove</span>
                                  </button>
                                </div>
                              </div>
                            </li>
                          </ul>
                        </div>
                      </BaseInputFileHeadless>
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
