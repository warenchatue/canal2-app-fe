<script setup lang="ts">
import { toTypedSchema } from '@vee-validate/zod'
import { Field, useForm } from 'vee-validate'
import 'vue-select/dist/vue-select.css'
import { z } from 'zod'
import { UserRole } from '~/types/user'

definePageMeta({
  title: 'Emissions TV',
  preview: {
    title: 'Emissions TV',
    description: '',
    categories: ['bo', 'tv-programs', 'programs'],
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
const perPage = ref(50)
const isModalNewTvProgramOpen = ref(false)
const isModalDeleteTvProgramOpen = ref(false)
const isModalConfirmOrderOpen = ref(false)
const isEdit = ref(false)
const toaster = useToaster()
// Check if can have access
if (
  authStore.user.appRole.name != UserRole.programPlanner &&
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
    perPage: 1000,
    page: page.value,
    action: 'findAll',
    token: token.value,
  }
})

const queryLight = computed(() => {
  return {
    filter: filter.value,
    perPage: 12000,
    page: page.value,
    action: 'findAllLight',
    token: token.value,
  }
})

const { data, pending, refresh } = await useFetch('/api/tv-programs/programs', {
  query,
  lazy: true,
})

const { data: orgs } = await useFetch('/api/admin/orgs', {
  query,
})

const { data: categories } = await useFetch(
  '/api/tv-programs/program-categories',
  {
    query,
  },
)

function editTvProgram(tvProgram: any) {
  isModalNewTvProgramOpen.value = true
  isEdit.value = true
  currentTvProgram.value = tvProgram
  setFieldValue('tvProgram._id', tvProgram._id)
  setFieldValue('tvProgram.name', tvProgram.name)
  setFieldValue('tvProgram.code', tvProgram.code)
  setFieldValue('tvProgram.category', tvProgram.category)
  setFieldValue('tvProgram.description', tvProgram.description)
  setFieldValue('tvProgram.org', tvProgram.org)
}

function confirmDeleteTvProgram(tvProgram: any) {
  isModalDeleteTvProgramOpen.value = true
  isEdit.value = false
  currentTvProgram.value = tvProgram
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

async function deleteTvProgram(tvProgram: any) {
  const query2 = computed(() => {
    return {
      action: 'delete',
      token: token.value,
      id: tvProgram._id,
    }
  })

  const response = await useFetch('/api/tv-programs/programs', {
    method: 'delete',
    headers: { 'Content-Type': 'application/json' },
    query: query2,
  })

  if (response.data?.value?.success) {
    success.value = true
    toaster.clearAll()
    toaster.show({
      title: 'Success',
      message: `Emission supprimé !`,
      color: 'success',
      icon: 'ph:check',
      closable: true,
    })
    isModalDeleteTvProgramOpen.value = false
    filter.value = 'tvProgram'
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

const currentTvProgram = ref({})

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
    tvProgram: z.object({
      _id: z.string().optional(),
      code: z.string().optional(),
      name: z.string().optional(),
      description: z.string().optional(),
      status: z
        .union([
          z.literal('onHold'),
          z.literal('confirmed'),
          z.literal('paid'),
          z.literal('closed'),
        ])
        .optional(),
      category: z
        .object({
          _id: z.string(),
          name: z.string(),
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
    if (!data.tvProgram.name) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: VALIDATION_TEXT.LABEL_REQUIRED,
        path: ['tvProgram.name'],
      })
    }
  })

// Zod has a great infer method that will
// infer the shape of the schema into a TypeScript type
type FormInput = z.infer<typeof zodSchema>

const validationSchema = toTypedSchema(zodSchema)
const initialValues = computed<FormInput>(() => ({
  avatar: null,
  tvProgram: {
    label: '',
    code: '',
    description: '',
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
      action: 'updateTvProgram',
      token: token.value,
      id: currentTvProgram.value._id,
    }
  })
  currentTvProgram.value.adminValidated = true

  const response = await useFetch('/api/tv-programs/programs', {
    method: 'put',
    headers: { 'Content-Type': 'application/json' },
    query: query4,
    body: { ...currentTvProgram.value },
  })

  if (response.data?.value?.success) {
    success.value = true
    toaster.clearAll()
    toaster.show({
      title: 'Success',
      message: `Emission validée !`,
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
    console.log('package-create-success', values)

    try {
      const isSuccess = ref(false)

      if (isEdit.value == true) {
        const query2 = computed(() => {
          return {
            action: 'updateTvProgram',
            token: token.value,
            id: values.tvProgram._id,
          }
        })

        const response = await useFetch('/api/tv-programs/programs', {
          method: 'put',
          headers: { 'Content-Type': 'application/json' },
          query: query2,
          body: {
            ...values.tvProgram,
            category: values.tvProgram?.category?._id ?? undefined,
            adminValidator: values.tvProgram?.adminValidator?._id ?? undefined,
          },
        })
        isSuccess.value = response.data.value?.success
      } else {
        const query2 = computed(() => {
          return {
            action: 'createTvProgram',
            token: token.value,
          }
        })

        const response = await useFetch('/api/tv-programs/programs', {
          method: 'post',
          headers: { 'Content-Type': 'application/json' },
          query: query2,
          body: {
            ...values.tvProgram,
            category: values.tvProgram?.category?._id ?? undefined,
            adminValidator: values.tvProgram?.adminValidator?._id ?? undefined,
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
            isEdit.value == false ? `Emission crée !` : `Emission mise à jour`,
          color: 'success',
          icon: 'ph:check',
          closable: true,
        })
        isModalNewTvProgramOpen.value = false
        resetForm()
        filter.value = 'tvProgram'
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
    console.log('package-create-error', error)

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
          @click=";(isModalNewTvProgramOpen = true), (isEdit = false)"
        >
          <Icon name="ph:plus" class="h-4 w-4" />
          <span>Nouvelle Emission</span>
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
                <span v-if="!pending">{{ 0 }}</span>
                <span v-else
                  ><BasePlaceload class="h-3 w-10 rounded-lg"
                /></span>
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
                <span>Présentateurs</span>
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
                <span v-if="!pending">{{ 0 }}</span>
                <span v-else
                  ><BasePlaceload class="h-3 w-10 rounded-lg"
                /></span>
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
                <span>Catégories</span>
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
                <span v-if="!pending">{{ 0 }}</span>
                <span v-else
                  ><BasePlaceload class="h-3 w-10 rounded-lg"
                /></span>
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
                <span>X</span>
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
                <span v-if="!pending">{{ 0 }}</span>
                <span v-else
                  ><BasePlaceload class="h-3 w-10 rounded-lg"
                /></span>
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
        <div v-else-if="pending">
          <TairoTableRow v-for="index in 5" :key="index">
            <TairoTableCell spaced>
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

                <TairoTableHeading uppercase spaced>Nom</TairoTableHeading>

                <TairoTableHeading uppercase spaced
                  >Catégorie</TairoTableHeading
                >

                <TairoTableHeading uppercase spaced>Couleur</TairoTableHeading>

                <TairoTableHeading uppercase spaced>Planning</TairoTableHeading>
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
                  <NuxtLink
                    class="text-primary-500 underline-offset-4 hover:underline"
                    :to="'/bo/pub/package-details/' + item._id"
                  >
                    {{ item.code }}
                  </NuxtLink>
                </TairoTableCell>
                <TairoTableCell light spaced>
                  {{ item.name }}
                </TairoTableCell>
                <TairoTableCell light spaced>
                  {{ item.category?.name }}
                </TairoTableCell>
                <TairoTableCell light spaced>
                  <div class="flex items-center">
                    <span
                      :style="
                        'background-color:' + item.category?.colorCode + ';'
                      "
                      class="text-muted-400 w-14 h-6 rounded font-sans text-xs"
                    >
                    </span></div
                ></TairoTableCell>
                <TairoTableCell light spaced> </TairoTableCell>
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
                    color="success"
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
                      :to="'/bo/tv-programs/program-details/' + item._id"
                      muted
                    >
                      <Icon name="lucide:settings" class="h-4 w-4"
                    /></BaseButtonAction>
                    <BaseButtonAction @click="editTvProgram(item)">
                      <Icon name="lucide:edit" class="h-4 w-4"
                    /></BaseButtonAction>
                    <BaseButtonAction
                      @click="confirmDeleteTvProgram(item)"
                      class="mx-2"
                      :disabled="
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

    <!-- Modal new TvProgram -->
    <TairoModal
      :open="isModalNewTvProgramOpen"
      size="3xl"
      @close="isModalNewTvProgramOpen = false"
    >
      <template #header>
        <!-- Header -->
        <div class="flex w-full items-center justify-between p-4 md:p-6">
          <h3
            class="font-heading text-muted-900 text-lg font-medium leading-6 dark:text-white"
          >
            {{ isEdit == true ? 'Editer' : 'Nouvelle' }} Emission
          </h3>

          <BaseButtonClose @click="isModalNewTvProgramOpen = false" />
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
                      name="tvProgram.name"
                    >
                      <BaseInput
                        label="Nom"
                        icon="ph:file-duotone"
                        placeholder="ex: Canal matin"
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
                      name="tvProgram.category"
                    >
                      <BaseListbox
                        label="Catégorie"
                        :items="categories?.data"
                        :properties="{
                          value: '_id',
                          label: 'name',
                          sublabel: 'color',
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
                      name="tvProgram.description"
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

                  <div class="ltablet:col-span-6 col-span-12 lg:col-span-6">
                    <Field
                      v-slot="{ field, errorMessage, handleChange, handleBlur }"
                      name="tvProgram.org"
                    >
                      <BaseListbox
                        label="Société"
                        :items="orgs.data"
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
            <BaseButton @click="isModalNewTvProgramOpen = false"
              >Annuler</BaseButton
            >
            <div v-if="isEdit == true" class="flex">
              <BaseButton
                :color="
                  currentTvProgram?.adminValidated ? 'success' : 'warning'
                "
                class="!mx-2"
                flavor="solid"
                @click="confirmOrder()"
                :disabled="
                  authStore.user?._id != currentTvProgram?.adminValidator
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
      :open="isModalDeleteTvProgramOpen"
      size="sm"
      @close="isModalDeleteTvProgramOpen = false"
    >
      <template #header>
        <!-- Header -->
        <div class="flex w-full items-center justify-between p-4 md:p-6">
          <h3
            class="font-heading text-muted-900 text-lg font-medium leading-6 dark:text-white"
          >
            Suppression d'une émission
          </h3>

          <BaseButtonClose @click="isModalDeleteTvProgramOpen = false" />
        </div>
      </template>

      <!-- Body -->
      <div class="p-4 md:p-6">
        <div class="mx-auto w-full max-w-xs text-center">
          <h3
            class="font-heading text-muted-800 text-lg font-medium leading-6 dark:text-white"
          >
            Supprimer
            <span class="text-red-500">{{ currentTvProgram?.label }}</span> ?
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
            <BaseButton @click="isModalDeleteTvProgramOpen = false"
              >Annuler</BaseButton
            >

            <BaseButton
              color="primary"
              flavor="solid"
              @click="deleteTvProgram(currentTvProgram)"
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
            <span class="text-primary-500">{{ currentTvProgram.label }}</span>
            de
            <span class="text-primary-500"
              >{{ currentTvProgram?.announcer?.name }}
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
