<script setup lang="ts">
import { toTypedSchema } from '@vee-validate/zod'
import { Field, useForm } from 'vee-validate'
import { z } from 'zod'
import { UserRole } from '~/types/user'

definePageMeta({
  title: 'Fournisseurs',
  preview: {
    title: 'Fournisseurs',
    description: 'Contribution and withdrawal',
    categories: ['bo', 'suppliers'],
    src: '/img/screens/layouts-table-list-1.png',
    srcDark: '/img/screens/layouts-table-list-1-dark.png',
    order: 44,
  },
})

const fakeItems = ref([])

const authStore = useAuthStore()
const route = useRoute()
const router = useRouter()
const appStore = useAppStore()
const page = computed(() => parseInt((route.query.page as string) ?? '1'))
const filter = ref('')
const perPage = ref(10)
const isModalNewSupplierOpen = ref(false)
const isModalDeleteSupplierOpen = ref(false)
const isModalImportSupplierOpen = ref(false)
const isEdit = ref(false)

const toaster = useToaster()
// Check if can have access
if (
  authStore.user.appRole?.name != UserRole.rh &&
  authStore.user.appRole?.name != UserRole.billing &&
  authStore.user.appRole?.name != UserRole.sale &&
  authStore.user.appRole?.name != UserRole.adminSale &&
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
  '/api/purchases/suppliers',
  {
    query,
    lazy: true,
  },
)

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

const inputSupplierFile = ref<FileList | null>(null)
const supplierFile = ref<File | null>(null)
watch(inputSupplierFile, (value) => {
  const file = value?.item(0) || null
  supplierFile.value = file
})

async function importSuppliers() {
  const slug = ref('null')
  const token = useCookie('token')
  try {
    const fd = new FormData()
    fd.append('0', supplierFile.value)
    const query3 = computed(() => {
      return {
        action: 'import-supplier',
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
        message: `Une erreur est survenue lors de l'importation des fournisseurs !`,
        color: 'danger',
        icon: 'ph:check',
        closable: true,
      })
    }
  } catch (error) {}
  isModalImportSupplierOpen.value = false
}

const currentSupplier = ref({})
const chatEl = ref<HTMLElement>()
const expanded = ref(true)
const loading = ref(false)

// This is the object that will contain the validation messages
const ONE_MB = 1000000
const VALIDATION_TEXT = {
  NAME_REQUIRED: "Name can't be empty",
  PHONE_REQUIRED: "Phone number can't be empty",
  EMAIL_REQUIRED: "Email address can't be empty",
  COUNTRY_REQUIRED: 'Please select a country',
}

// This is the Zod schema for the form input
// It's used to define the shape that the form data will have
const zodSchema = z
  .object({
    supplier: z.object({
      _id: z.string().optional(),
      name: z.string().min(1, VALIDATION_TEXT.NAME_REQUIRED),
      email: z.string().optional(),
      rc: z.string().optional(),
      nc: z.string().optional(),
      niu: z.string().optional(),
      phone: z.string().optional(),
      city: z.string().optional(),
      address: z.string().optional(),
      type: z.string().optional(),
      status: z.string().optional(),
      category: z.string().optional(),
      country: z
        .object({
          _id: z.string().optional(),
          abbr: z.string(),
          name: z.string(),
          flag: z.string().optional(),
        })
        .optional()
        .nullable(),
    }),
  })
  .superRefine((data, ctx) => {
    if (!data.supplier.name) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: VALIDATION_TEXT.NAME_REQUIRED,
        path: ['supplier.name'],
      })
    }
  })

// Zod has a great infer method that will
// infer the shape of the schema into a TypeScript type
type FormInput = z.infer<typeof zodSchema>

const validationSchema = toTypedSchema(zodSchema)
const initialValues = computed<FormInput>(() => ({
  avatar: null,
  supplier: {
    name: '',
    email: '',
    address: '',
    phone: '',
    rc: '',
    nc: '',
    niu: '',
    status: '',
    type: '',
    category: '',
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

function editSupplier(supplier: any) {
  isModalNewSupplierOpen.value = true
  isEdit.value = true
  setFieldValue('supplier._id', supplier._id)
  setFieldValue('supplier.name', supplier.name)
  setFieldValue('supplier.email', supplier.email)
  setFieldValue('supplier.phone', supplier.phone)
  setFieldValue('supplier.country', supplier.country)
  setFieldValue('supplier.city', supplier.city)
  setFieldValue('supplier.address', supplier.address)
  setFieldValue('supplier.rc', supplier.rc)
  setFieldValue('supplier.nc', supplier.nc)
  setFieldValue('supplier.niu', supplier.niu)
  setFieldValue('supplier.type', supplier.type)
  setFieldValue('supplier.status', supplier.status)
  setFieldValue('supplier.category', supplier.category)
}

function selectSupplier(supplier: any) {
  currentSupplier.value = supplier
  expanded.value = false
}

function confirmDeleteSupplier(supplier: any) {
  isModalDeleteSupplierOpen.value = true
  isEdit.value = false
  currentSupplier.value = supplier
}

async function deleteSupplier(supplier: any) {
  const query2 = computed(() => {
    return {
      action: 'delete',
      token: token.value,
      id: supplier._id,
    }
  })

  const response = await useFetch('/api/purchases/suppliers', {
    method: 'delete',
    headers: { 'Content-Type': 'application/json' },
    query: query2,
  })

  if (response.data?.value?.success) {
    success.value = true
    toaster.clearAll()
    toaster.show({
      title: 'Success',
      message: `Fournisseur supprimé !`,
      color: 'success',
      icon: 'ph:check',
      closable: true,
    })
    isModalDeleteSupplierOpen.value = false
    filter.value = 'supplier'
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
    console.log('supplier-create-success', values)

    try {
      const isSuccess = ref(false)
      if (isEdit.value == true) {
        const query2 = computed(() => {
          return {
            action: 'updateSupplier',
            token: token.value,
            id: values.supplier._id,
          }
        })

        const response = await useFetch('/api/purchases/suppliers', {
          method: 'put',
          headers: { 'Content-Type': 'application/json' },
          query: query2,
          body: {
            ...values.supplier,
            country: values.supplier.country?._id,
          },
        })
        isSuccess.value = response.data.value?.success
      } else {
        const query2 = computed(() => {
          return {
            action: 'createSupplier',
            token: token.value,
          }
        })

        const response = await useFetch('/api/purchases/suppliers', {
          method: 'post',
          headers: { 'Content-Type': 'application/json' },
          query: query2,
          body: {
            ...values.supplier,
            country: values.supplier.country?._id,
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
            isEdit.value == false
              ? `Fournisseur créé !`
              : `Fournisseur mis à jour`,
          color: 'success',
          icon: 'ph:check',
          closable: true,
        })
        isModalNewSupplierOpen.value = false
        resetForm()
        filter.value = 'supplier'
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
    console.log('supplier-create-error', error)

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
          placeholder="Filtrer fournisseurs..."
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
          <option :value="250">250 per page</option>
          <option :value="500">500 per page</option>
        </BaseSelect>
        <BaseButton
          @click=";(isModalNewSupplierOpen = true), (isEdit = false)"
          color="primary"
          class="w-full sm:w-52"
          :disabled="
            authStore.user.appRole.name != UserRole.sale &&
            authStore.user.appRole.name != UserRole.accountancy &&
            authStore.user.appRole.name != UserRole.billing &&
            authStore.user.appRole.name != UserRole.admin &&
            authStore.user.appRole.name != UserRole.superAdmin
          "
        >
          <Icon name="lucide:plus" class="h-4 w-4" />
          <span>Nouveau Fournisseur</span>
        </BaseButton>
        <BaseButton
          :disabled="
            authStore.user.appRole.name != UserRole.sale &&
            authStore.user.appRole.name != UserRole.billing &&
            authStore.user.appRole.name != UserRole.superAdmin
          "
          @click="isModalImportSupplierOpen = true"
          color="primary"
          class="w-full sm:w-52"
        >
          <Icon name="lucide:import" class="h-4 w-4" />
          <span>Importer fournisseurs</span>
        </BaseButton>
      </template>

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
        <div class="w-full" v-else-if="pending">
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
              <BasePlaceload class="h-3 w-16 rounded-lg" />
            </TairoTableCell>
            <TairoTableCell light spaced>
              <BasePlaceload class="h-3 w-16 rounded-lg" />
            </TairoTableCell>
            <TairoTableCell light spaced>
              <BasePlaceload class="h-3 w-16 rounded-lg" />
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
                <TairoTableHeading uppercase spaced> Code </TairoTableHeading>

                <TairoTableHeading uppercase spaced>
                  Fournisseur
                </TairoTableHeading>

                <TairoTableHeading uppercase spaced> Tel </TairoTableHeading>
                <!-- <TairoTableHeading uppercase spaced> R/C </TairoTableHeading>
                <TairoTableHeading uppercase spaced> N/C </TairoTableHeading> -->
                <TairoTableHeading uppercase spaced>
                  Categorie
                </TairoTableHeading>
                <TairoTableHeading uppercase spaced> Statut </TairoTableHeading>
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
                      {{ item.code }}
                    </span>
                  </div>
                </TairoTableCell>
                <TairoTableCell spaced>
                  <div
                    style="white-space: pre-wrap; word-wrap: break-word"
                    class="flex items-center"
                  >
                    <!-- <BaseAvatar
                      :src="item.logo ?? '/img/avatars/company.svg'"
                      :text="item.initials"
                      :class="getRandomColor()"
                    /> -->
                    <div class="ms-3 leading-none">
                      <h4 class="font-sans !w-48 text-sm font-medium">
                        {{ item.name }}
                      </h4>
                      <p class="text-muted-400 font-sans text-xs">
                        {{ item.email }}
                      </p>
                    </div>
                  </div>
                </TairoTableCell>

                <TairoTableCell spaced>
                  <div class="flex items-center">
                    <span class="text-muted-400 font-sans text-xs">
                      {{ item.phone }}
                    </span>
                  </div>
                </TairoTableCell>
                <!-- <TairoTableCell spaced>
                  <div class="flex items-center">
                    <span class="text-muted-400 font-sans text-xs">
                      {{ item.rc }}
                    </span>
                  </div>
                </TairoTableCell>
                <TairoTableCell light spaced>
                  <div class="flex items-center">
                    <span class="text-muted-400 font-sans text-xs">
                      {{ item.nc }}
                    </span>
                  </div>
                </TairoTableCell> -->
                <TairoTableCell light spaced>
                  <div class="flex items-center">
                    <span class="text-muted-400 font-sans text-xs">
                      {{
                        item.category == 'largeAccount'
                          ? 'Grand Compte'
                          : item.category == 'bank'
                          ? 'Institution Bancaire'
                          : item.category == 'school'
                          ? 'Ecole'
                          : item.category == 'PME'
                          ? 'PME'
                          : item.category == 'TPE'
                          ? 'TPE'
                          : ''
                      }}
                    </span>
                  </div>
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
                    Actif
                  </BaseTag>
                  <BaseTag
                    v-else-if="item.status === 'inactive'"
                    color="warning"
                    flavor="pastel"
                    shape="full"
                    condensed
                    class="font-medium"
                  >
                    Dormant
                  </BaseTag>
                </TairoTableCell>
                <TairoTableCell spaced>
                  <div class="flex">
                    <!-- <BaseButtonAction to="/bo/spots/orders" muted
                      >commandes</BaseButtonAction
                    > -->
                    <BaseButtonAction
                      class="mx-2"
                      @click.prevent="selectSupplier(item)"
                      muted
                    >
                      <Icon name="lucide:eye" class="h-4 w-4"
                    /></BaseButtonAction>
                    <BaseButtonAction
                      :disabled="
                        authStore.user.appRole.name != UserRole.sale &&
                        authStore.user.appRole.name != UserRole.accountancy &&
                        authStore.user.appRole.name != UserRole.billing &&
                        authStore.user.appRole.name != UserRole.superAdmin
                      "
                      @click="editSupplier(item)"
                    >
                      <Icon name="lucide:edit" class="h-4 w-4"
                    /></BaseButtonAction>
                    <BaseButtonAction
                      @click="confirmDeleteSupplier(item)"
                      :disabled="
                        authStore.user.appRole.name != UserRole.superAdmin
                      "
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

    <!-- Modal new Supplier -->
    <TairoModal
      :open="isModalNewSupplierOpen"
      size="3xl"
      @close="isModalNewSupplierOpen = false"
    >
      <template #header>
        <!-- Header -->
        <div class="flex w-full items-center justify-between p-4 md:p-6">
          <h3
            class="font-heading text-muted-900 text-lg font-medium leading-6 dark:text-white"
          >
            {{ isEdit == true ? 'Mise à jour' : 'Nouveau' }} Fournisseur
          </h3>

          <BaseButtonClose @click="isModalNewSupplierOpen = false" />
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
                  <div class="col-span-12 md:col-span-12">
                    <Field
                      v-slot="{ field, errorMessage, handleChange, handleBlur }"
                      name="supplier.name"
                    >
                      <BaseInput
                        label="Nom"
                        icon="ph:user-duotone"
                        placeholder=""
                        :model-value="field.value"
                        :error="errorMessage"
                        :disabled="isSubmitting"
                        @update:model-value="handleChange"
                        @blur="handleBlur"
                      />
                    </Field>
                  </div>
                  <div class="col-span-12 md:col-span-4">
                    <Field
                      v-slot="{ field, errorMessage, handleChange, handleBlur }"
                      name="supplier.email"
                    >
                      <BaseInput
                        label="Email"
                        icon="ph:globe-duotone"
                        placeholder=""
                        :model-value="field.value"
                        :error="errorMessage"
                        :disabled="isSubmitting"
                        @update:model-value="handleChange"
                        @blur="handleBlur"
                      />
                    </Field>
                  </div>
                  <div class="col-span-12 md:col-span-4">
                    <Field
                      v-slot="{ field, errorMessage, handleChange, handleBlur }"
                      name="supplier.phone"
                    >
                      <BaseInput
                        label="Numéro de téléphone"
                        icon="ph:phone-duotone"
                        placeholder=""
                        :model-value="field.value"
                        :error="errorMessage"
                        :disabled="isSubmitting"
                        @update:model-value="handleChange"
                        @blur="handleBlur"
                      />
                    </Field>
                  </div>
                  <div class="col-span-12 md:col-span-4">
                    <Field
                      v-slot="{ field, errorMessage, handleChange, handleBlur }"
                      name="supplier.rc"
                    >
                      <BaseInput
                        label="Registre de commerce"
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
                  <div class="col-span-12 md:col-span-6">
                    <Field
                      v-slot="{ field, errorMessage, handleChange, handleBlur }"
                      name="supplier.nc"
                    >
                      <BaseInput
                        label="Numéro de contribuable"
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
                  <div class="col-span-12 md:col-span-6">
                    <Field
                      v-slot="{ field, errorMessage, handleChange, handleBlur }"
                      name="supplier.niu"
                    >
                      <BaseInput
                        label="Numéro d'Identifiant Unique"
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
                  <div class="ltablet:col-span-4 col-span-12 lg:col-span-4">
                    <Field
                      v-slot="{ field, errorMessage, handleChange, handleBlur }"
                      name="supplier.country"
                    >
                      <BaseListbox
                        label="Pays"
                        :items="appStore.countries"
                        :properties="{
                          value: '_id',
                          label: 'name',
                          sublabel: 'abbr',
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
                  <div class="col-span-12 md:col-span-4">
                    <Field
                      v-slot="{ field, errorMessage, handleChange, handleBlur }"
                      name="supplier.city"
                    >
                      <BaseInput
                        label="Ville"
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
                  <div class="col-span-12 md:col-span-4">
                    <Field
                      v-slot="{ field, errorMessage, handleChange, handleBlur }"
                      name="supplier.address"
                    >
                      <BaseInput
                        label="Adresse"
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
                  <div class="ltablet:col-span-4 col-span-12 lg:col-span-4">
                    <Field
                      v-slot="{ field, errorMessage, handleChange, handleBlur }"
                      name="supplier.type"
                    >
                      <BaseSelect
                        label="Type *"
                        icon="ph:funnel"
                        :model-value="field.value"
                        :error="errorMessage"
                        :disabled="isSubmitting"
                        @update:model-value="handleChange"
                        @blur="handleBlur"
                      >
                        <option value="personal">Particulier</option>
                        <option value="corporate">Entreprise</option>
                      </BaseSelect>
                    </Field>
                  </div>
                  <div class="ltablet:col-span-4 col-span-12 lg:col-span-4">
                    <Field
                      v-slot="{ field, errorMessage, handleChange, handleBlur }"
                      name="supplier.status"
                    >
                      <BaseSelect
                        label="Status*"
                        icon="ph:funnel"
                        :model-value="field.value"
                        :error="errorMessage"
                        :disabled="isSubmitting"
                        @update:model-value="handleChange"
                        @blur="handleBlur"
                      >
                        <option value="active">Actif</option>
                        <option value="inactive">Dormand</option>
                      </BaseSelect>
                    </Field>
                  </div>
                  <div class="ltablet:col-span-4 col-span-4 lg:col-span-4">
                    <Field
                      v-slot="{ field, errorMessage, handleChange, handleBlur }"
                      name="supplier.category"
                    >
                      <BaseSelect
                        label="Categorie *"
                        icon="ph:funnel"
                        :model-value="field.value"
                        :error="errorMessage"
                        :disabled="isSubmitting"
                        @update:model-value="handleChange"
                        @blur="handleBlur"
                      >
                        <option value="largeAccount">Grand Compte</option>
                        <option value="bank">Institution Bancaire</option>
                        <option value="school">Ecole</option>
                        <option value="PME">PME</option>
                        <option value="TPE">TPE</option>
                        <option value="ONG">ONG</option>
                        <option value="ASSOCIATION">Association</option>
                        <option value="INSTRELIG">
                          Institution Religieuse
                        </option>
                      </BaseSelect>
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
            <BaseButton @click="isModalNewSupplierOpen = false"
              >Annuler</BaseButton
            >

            <BaseButton color="primary" flavor="solid" @click="onSubmit">
              {{ isEdit == true ? 'Modifier' : 'Créer' }}
            </BaseButton>
          </div>
        </div>
      </template>
    </TairoModal>

    <!-- Modal import supplier file -->
    <TairoModal
      :open="isModalImportSupplierOpen"
      size="xl"
      @close="isModalImportSupplierOpen = false"
    >
      <template #header>
        <!-- Header -->
        <div class="flex w-full items-center justify-between p-4 md:p-6">
          <h3
            class="font-heading text-muted-900 text-lg font-medium leading-6 dark:text-white"
          >
            Import des fournisseurs
          </h3>

          <BaseButtonClose @click="isModalImportSupplierOpen = false" />
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
                    <BaseInputFile
                      v-model="inputSupplierFile"
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
            <BaseButton @click="isModalImportSupplierOpen = false"
              >Annuler</BaseButton
            >

            <BaseButton
              color="primary"
              flavor="solid"
              @click="importSuppliers()"
            >
              Importer
            </BaseButton>
          </div>
        </div>
      </template>
    </TairoModal>

    <!-- Modal delete -->
    <TairoModal
      :open="isModalDeleteSupplierOpen"
      size="sm"
      @close="isModalDeleteSupplierOpen = false"
    >
      <template #header>
        <!-- Header -->
        <div class="flex w-full items-center justify-between p-4 md:p-6">
          <h3
            class="font-heading text-muted-900 text-lg font-medium leading-6 dark:text-white"
          >
            Suppression d'un fournisseur
          </h3>

          <BaseButtonClose @click="isModalDeleteSupplierOpen = false" />
        </div>
      </template>

      <!-- Body -->
      <div class="p-4 md:p-6">
        <div class="mx-auto w-full max-w-xs text-center">
          <h3
            class="font-heading text-muted-800 text-lg font-medium leading-6 dark:text-white"
          >
            Supprimer
            <span class="text-red-500">{{ currentSupplier?.name }}</span> ?
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
            <BaseButton @click="isModalDeleteSupplierOpen = false"
              >Annuler</BaseButton
            >

            <BaseButton
              color="primary"
              flavor="solid"
              @click="deleteSupplier(currentSupplier)"
              >Suppimer</BaseButton
            >
          </div>
        </div>
      </template>
    </TairoModal>

    <!-- Current Operation -->
    <div
      class="ltablet:w-[310px] dark:bg-muted-800 fixed end-0 top-0 z-50 h-full w-[390px] bg-white transition-transform duration-300"
      :class="expanded ? 'translate-x-full' : 'translate-x-0'"
    >
      <div class="flex h-16 w-full items-center justify-between px-8">
        <BaseHeading tag="h3" size="lg" class="text-muted-800 dark:text-white">
          <span>Détails Fournisseur</span>
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
            <BaseAvatar
              :src="currentSupplier?.logo"
              :text="currentSupplier.initials"
              :class="getRandomColor()"
              size="2xl"
            />
          </div>
          <div class="text-center">
            <BaseHeading tag="h3" size="lg" class="mt-4">
              <span>{{ currentSupplier?.name }}</span>
            </BaseHeading>
            <BaseParagraph size="sm" class="text-muted-400">
              <span>{{ currentSupplier?.email }}</span>
            </BaseParagraph>
            <div class="my-4">
              <BaseParagraph
                size="sm"
                class="text-muted-500 dark:text-muted-400"
              >
                <span></span>
              </BaseParagraph>
              <BaseParagraph
                size="sm"
                class="text-muted-500 dark:text-muted-400"
              >
                <span></span>
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
                <span> Consulter l'état </span>
              </BaseButton>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
