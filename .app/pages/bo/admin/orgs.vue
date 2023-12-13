<script setup lang="ts">
import { toTypedSchema } from '@vee-validate/zod'
import { Field, useFieldError, useForm } from 'vee-validate'
import { z } from 'zod'

definePageMeta({
  title: 'Entreprises',
  preview: {
    title: 'Entreprises',
    description: 'For list views and collections',
    categories: ['bo', 'admin'],
    src: '/img/screens/layouts-table-list-1.png',
    srcDark: '/img/screens/layouts-table-list-1-dark.png',
    order: 44,
  },
})

const route = useRoute()
const router = useRouter()
const appStore = useAppStore()
const page = computed(() => parseInt((route.query.page as string) ?? '1'))

const filter = ref('')
const perPage = ref(10)
const token = useCookie('token')
const success = ref(false)

watch([filter, perPage], () => {
  router.push({
    query: {
      page: undefined,
    },
  })
})

const query = computed(() => {
  return {
    action: 'findAll',
    token: token.value,
    filter: filter.value,
    perPage: perPage.value,
    page: page.value,
  }
})

const { data, pending, error, refresh } = await useFetch('/api/admin/orgs', {
  query,
})

const selected = ref<number[]>([])
const isAllVisibleSelected = computed(() => {
  return selected.value.length === data.value?.data.length
})

function toggleAllVisibleSelection() {
  if (isAllVisibleSelected.value) {
    selected.value = []
  } else {
    selected.value = data.value?.data.map((item: any) => item.id) ?? []
  }
}

const isModalNewOrgOpen = ref(false)
const isModalDeleteOrgOpen = ref(false)
const isModalUpdatePasswordOpen = ref(false)
const newPassword = ref()
const passwordError = ref<string | boolean | undefined>(false)
const isEdit = ref(false)

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
    org: z.object({
      _id: z.string().optional(),
      name: z.string(),
      email: z.string(),
      footerTitle: z.string().optional(),
      rc: z.string(),
      nc: z.string(),
      phone: z.string(),
      phone2: z.string().optional(),
      address: z.string(),
      city: z.string(),
      country: z
        .object({
          _id: z.string(),
          abbr: z.string(),
          name: z.string(),
          flag: z.string().optional(),
        })
        .optional()
        .nullable(),
    }),
  })
  .superRefine((data, ctx) => {
    if (!data.org.name) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: VALIDATION_TEXT.NAME_REQUIRED,
        path: ['org.name'],
      })
    }

    if (!data.org.email) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: VALIDATION_TEXT.EMAIL_REQUIRED,
        path: ['org.email'],
      })
    }
  })

// Zod has a great infer method that will
// infer the shape of the schema into a TypeScript type
type FormInput = z.infer<typeof zodSchema>

const validationSchema = toTypedSchema(zodSchema)
const initialValues = computed<FormInput>(() => ({
  avatar: null,
  org: {
    name: '',
    email: '',
    footerTitle: '',
    phone: '',
    phone2: '',
    nc: '',
    status: 'active',
    rc: '',
    city: '',
    address: '',
    country: {
      _id: '',
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
const currentOrg = ref({})

function editOrg(org: any) {
  isModalNewOrgOpen.value = true
  isEdit.value = true
  currentOrg.value = org
  setFieldValue('org._id', org._id)
  setFieldValue('org.name', org.name)
  setFieldValue('org.email', org.email)
  setFieldValue('org.nc', org.nc)
  setFieldValue('org.phone', org.phone)
  setFieldValue('org.phone2', org.phone2)
  setFieldValue('org.rc', org.rc)
  setFieldValue('org.rc', org.rc)
  setFieldValue('org.address', org.address)
  setFieldValue('org.city', org.city)
  setFieldValue('org.country', org.country)
  setFieldValue('org.footerTitle', org.footerTitle)
}

function confirmDeleteOrg(org: any) {
  isModalDeleteOrgOpen.value = true
  isEdit.value = false
  currentOrg.value = org
}

async function deleteOrg(org: any) {
  const query2 = computed(() => {
    return {
      action: 'deleteOrg',
      token: token.value,
      id: org?._id,
    }
  })

  const response = await useFetch('/api/admin/orgs', {
    method: 'delete',
    headers: { 'Content-Type': 'application/json' },
    query: query2,
  })

  if (response.data?.value?.success) {
    success.value = true
    toaster.clearAll()
    toaster.show({
      title: 'Success',
      message: `Organisation supprimée !`,
      color: 'success',
      icon: 'ph:check',
      closable: true,
    })
    isModalDeleteOrgOpen.value = false
    filter.value = 'org'
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

// This is where you would send the form data to the server
const onSubmit = handleSubmit(
  async (values) => {
    success.value = false
    // here you have access to the validated form values
    console.log('org-create-success', values)

    try {
      const isSuccess = ref(false)
      if (isEdit.value == true) {
        const query2 = computed(() => {
          return {
            action: 'updateOrg',
            token: token.value,
            id: values.org._id,
          }
        })

        const response = await useFetch('/api/admin/orgs', {
          method: 'put',
          headers: { 'Content-Type': 'application/json' },
          query: query2,
          body: {
            ...values.org,
          },
        })
        isSuccess.value = response.data.value?.success
      } else {
        const query2 = computed(() => {
          return {
            action: 'createOrg',
            token: token.value,
            id: values.org._id,
          }
        })

        const response = await useFetch('/api/admin/orgs', {
          method: 'post',
          headers: { 'Content-Type': 'application/json' },
          query: query2,
          body: {
            ...values.org,
          },
        })
        isSuccess.value = response.data.value?.success
      }

      if (isSuccess.value) {
        success.value = true
        resetForm()
        toaster.clearAll()
        toaster.show({
          title: 'Success',
          message: `Org created!`,
          color: 'success',
          icon: 'ph:user-circle-fill',
          closable: true,
        })

        isModalNewOrgOpen.value = false
        //refresh
        filter.value = 'org'
        filter.value = ''
      } else {
        toaster.clearAll()
        toaster.show({
          title: 'Error',
          message: `An error occured!`,
          color: 'warning',
          icon: 'ph:check',
          closable: true,
        })
      }
    } catch (error: any) {
      console.log(error)
      toaster.clearAll()
      toaster.show({
        title: 'Oops!',
        message: 'Please review the errors in the form',
        color: 'danger',
        icon: 'lucide:alert-triangle',
        closable: true,
      })
      return
    }
  },
  (error) => {
    // this callback is optional and called only if the form has errors
    success.value = false

    // here you have access to the error
    console.log('org-create-error', error)

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
          placeholder="Filter orgs..."
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
          @click="resetForm(), ((isModalNewOrgOpen = true), (isEdit = false))"
          color="primary"
          class="w-full sm:w-52"
        >
          <Icon name="lucide:plus" class="h-4 w-4" />
          <span>Nouvelle entreprise</span>
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
                <TairoTableHeading uppercase spaced> Nom </TairoTableHeading>
                <TairoTableHeading uppercase spaced>Tel</TairoTableHeading>
                <TairoTableHeading uppercase spaced>Pays</TairoTableHeading>
                <TairoTableHeading uppercase spaced>Adresse</TairoTableHeading>
                <TairoTableHeading uppercase spaced>RC</TairoTableHeading>
                <TairoTableHeading uppercase spaced>NC</TairoTableHeading>
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
                    <BaseAvatar
                      :src="item.picture"
                      :text="item.initials"
                      :class="getRandomColor()"
                    />
                    <div class="ms-3 leading-none">
                      <h4 class="font-sans text-sm font-medium">
                        {{ item.name }}
                      </h4>
                      <p class="text-muted-400 font-sans text-xs">
                        {{ item.email }}
                      </p>
                    </div>
                  </div>
                </TairoTableCell>
                <TairoTableCell light spaced>
                  {{ item.phone ?? 'Not specified' }}
                </TairoTableCell>
                <TairoTableCell spaced>
                  <div class="flex items-center">
                    <BaseAvatar
                      :src="item.country?.flag"
                      :text="item.initials"
                      :class="getRandomColor()"
                    />
                    <div class="ms-3 leading-none">
                      <h4 class="font-sans text-sm font-medium">
                        {{ item.country?.name }}
                      </h4>
                      <p class="text-muted-400 font-sans text-xs">
                        {{ item.country?.abbr }}
                      </p>
                    </div>
                  </div>
                </TairoTableCell>

                <TairoTableCell light spaced>
                  {{ item.address ?? 'Not specified' }}
                </TairoTableCell>
                <TairoTableCell light spaced>
                  {{ item.rc ?? 'Not specified' }}
                </TairoTableCell>
                <TairoTableCell light spaced>
                  {{ item.nc ?? 'Not specified' }}
                </TairoTableCell>
                <TairoTableCell spaced class="capitalize">
                  <BaseTag
                    v-if="item.state === 'active'"
                    color="success"
                    flavor="pastel"
                    shape="full"
                    condensed
                    class="font-medium"
                  >
                    {{ item.state }}
                  </BaseTag>
                  <BaseTag
                    v-else-if="item.state === 'inactive'"
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
                    <BaseButtonAction @click="editOrg(item)" class="!mx-2">
                      <Icon name="lucide:edit" class="h-4 w-4"
                    /></BaseButtonAction>
                    <BaseButtonAction @click="confirmDeleteOrg(item)">
                      <Icon name="lucide:trash" class="h-4 w-4"
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

    <!-- Modal new org -->
    <TairoModal
      :open="isModalNewOrgOpen"
      size="xl"
      @close="isModalNewOrgOpen = false"
    >
      <template #header>
        <!-- Header -->
        <div class="flex w-full items-center justify-between p-4 md:p-6">
          <h3
            class="font-heading text-muted-900 text-lg font-medium leading-6 dark:text-white"
          >
            {{ isEdit == true ? 'Mêttre à jour ' : 'Nouvelle' }} entreprise
          </h3>

          <BaseButtonClose @click="isModalNewOrgOpen = false" />
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
                      name="org.name"
                    >
                      <BaseInput
                        label="Nom"
                        icon="lucide:building"
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
                      name="org.email"
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
                  <div class="col-span-12 md:col-span-6">
                    <Field
                      v-slot="{ field, errorMessage, handleChange, handleBlur }"
                      name="org.phone"
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
                </div>
                <div class="grid grid-cols-12 gap-4 mt-4">
                  <div class="col-span-12 md:col-span-6">
                    <Field
                      v-slot="{ field, errorMessage, handleChange, handleBlur }"
                      name="org.phone2"
                    >
                      <BaseInput
                        label="Numéro de téléphone 2"
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
                  <div class="ltablet:col-span-6 col-span-12 lg:col-span-6">
                    <Field
                      v-slot="{ field, errorMessage, handleChange, handleBlur }"
                      name="org.country"
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
                  <div class="col-span-12 md:col-span-6">
                    <Field
                      v-slot="{ field, errorMessage, handleChange, handleBlur }"
                      name="org.city"
                    >
                      <BaseInput
                        label="Ville"
                        icon="lucide:globe"
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
                      name="org.address"
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
                  <div class="col-span-12 md:col-span-6">
                    <Field
                      v-slot="{ field, errorMessage, handleChange, handleBlur }"
                      name="org.rc"
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
                      name="org.nc"
                    >
                      <BaseInput
                        label="Numéro contribuable"
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
                      name="org.footerTitle"
                    >
                      <BaseInput
                        label="Titre du pied de page"
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
            <BaseButton @click="isModalNewOrgOpen = false">Annuler</BaseButton>

            <BaseButton color="primary" flavor="solid" @click="onSubmit">
              {{ isEdit == true ? 'Modifier' : 'Créer' }}
            </BaseButton>
          </div>
        </div>
      </template>
    </TairoModal>

    <!-- Modal update org password -->
    <TairoModal
      :open="isModalUpdatePasswordOpen"
      size="xl"
      @close="isModalUpdatePasswordOpen = false"
    >
      <template #header>
        <!-- Header -->
        <div class="flex w-full items-center justify-between p-4 md:p-6">
          <h3
            class="font-heading text-muted-900 text-lg font-medium leading-6 dark:text-white"
          >
            Mise à jour du Mot de passe
          </h3>

          <BaseButtonClose @click="isModalUpdatePasswordOpen = false" />
        </div>
      </template>

      <!-- Body -->
      <BaseCard class="w-full">
        <form
          method="POST"
          action=""
          class="divide-muted-200 dark:divide-muted-700"
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
                      name="org.password"
                    >
                      <BaseInput
                        label="Nouveau mot de passe"
                        icon="ph:org-duotone"
                        placeholder="*********************"
                        v-model="newPassword"
                        :error="passwordError"
                        :disabled="isSubmitting"
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
            <BaseButton @click="isModalUpdatePasswordOpen = false"
              >Annuler</BaseButton
            >

            <BaseButton
              color="primary"
              flavor="solid"
              @click="updatePassword()"
            >
              Modifier
            </BaseButton>
          </div>
        </div>
      </template>
    </TairoModal>
    <!-- Modal delete -->
    <TairoModal
      :open="isModalDeleteOrgOpen"
      size="sm"
      @close="isModalDeleteOrgOpen = false"
    >
      <template #header>
        <!-- Header -->
        <div class="flex w-full items-center justify-between p-4 md:p-6">
          <h3
            class="font-heading text-muted-900 text-lg font-medium leading-6 dark:text-white"
          >
            Suppression d'une entreprise
          </h3>

          <BaseButtonClose @click="isModalDeleteOrgOpen = false" />
        </div>
      </template>

      <!-- Body -->
      <div class="p-4 md:p-6">
        <div class="mx-auto w-full max-w-xs text-center">
          <h3
            class="font-heading text-muted-800 text-lg font-medium leading-6 dark:text-white"
          >
            Supprimer
            <span class="text-red-500"
              >{{ currentOrg?.firstName }} {{ currentOrg?.lastName }}</span
            >
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
            <BaseButton @click="isModalDeleteOrgOpen = false"
              >Annuler</BaseButton
            >

            <BaseButton
              color="primary"
              flavor="solid"
              @click="deleteOrg(currentOrg)"
              >Supprimer</BaseButton
            >
          </div>
        </div>
      </template>
    </TairoModal>
  </div>
</template>
