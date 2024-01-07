<script setup lang="ts">
import { toTypedSchema } from '@vee-validate/zod'
import { Field, useFieldError, useForm } from 'vee-validate'
import { z } from 'zod'
import { UserRole } from '~/types/user'

definePageMeta({
  title: 'Taxes',
  preview: {
    title: 'Taxes',
    description: 'Gestion des Taxes',
    categories: ['bo', 'Taxes'],
    src: '/img/screens/layouts-table-list-1.png',
    srcDark: '/img/screens/layouts-table-list-1-dark.png',
    order: 44,
  },
})

const authStore = useAuthStore()
const route = useRoute()
const router = useRouter()
const appStore = useAppStore()
const page = computed(() => parseInt((route.query.page as string) ?? '1'))
const filter = ref('')
const perPage = ref(10)
const isModalNewTaxOpen = ref(false)
const isModalDeleteTaxOpen = ref(false)
const isEdit = ref(false)

const toaster = useToaster()
// Check if can have access
if (
  authStore.user.appRole.name != UserRole.billing &&
  authStore.user.appRole.name != UserRole.accountancy &&
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

const { data, pending, error, refresh } = await useFetch(
  '/api/accountancy/taxes',
  {
    query,
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

const currentTax = ref({})
const chatEl = ref<HTMLElement>()
const expanded = ref(true)
const loading = ref(false)

// This is the object that will contain the validation messages
const VALIDATION_TEXT = {
  CODE_REQUIRED: "Code can't be empty",
}

// This is the Zod schema for the form input
// It's used to define the shape that the form data will have
const zodSchema = z
  .object({
    tax: z.object({
      _id: z.string().optional(),
      code: z.string().min(1, VALIDATION_TEXT.CODE_REQUIRED),
      value: z.number(),
      name: z.string(),
      description: z.string(),
      category: z
        .object({
          _id: z.string(),
          name: z.string(),
          description: z.string(),
        })
        .optional()
        .nullable(),
    }),
  })
  .superRefine((data, ctx) => {
    if (!data.tax.name) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: VALIDATION_TEXT.CODE_REQUIRED,
        path: ['tax.code'],
      })
    }
  })

// Zod has a great infer method that will
// infer the shape of the schema into a TypeScript type
type FormInput = z.infer<typeof zodSchema>

const validationSchema = toTypedSchema(zodSchema)
const initialValues = computed<FormInput>(() => ({
  avatar: null,
  tax: {
    code: '',
    name: '',
    value: 0,
    description: '',
    category: {
      _id: '',
      name: '',
      description: '',
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

function editTax(tax: any) {
  isModalNewTaxOpen.value = true
  isEdit.value = true
  setFieldValue('tax._id', tax._id)
  setFieldValue('tax.code', tax.code)
  setFieldValue('tax.name', tax.name)
  setFieldValue('tax.value', tax.value)
  setFieldValue('tax.description', tax.description)
}

function selectTax(tax: any) {
  currentTax.value = tax
  expanded.value = false
}

function confirmDeleteTax(tax: any) {
  isModalDeleteTaxOpen.value = true
  isEdit.value = false
  currentTax.value = tax
}

async function deleteTax(tax: any) {
  const query2 = computed(() => {
    return {
      action: 'delete',
      token: token.value,
      id: tax._id,
    }
  })

  const response = await useFetch('/api/accountancy/taxes', {
    method: 'delete',
    headers: { 'Content-Type': 'application/json' },
    query: query2,
  })

  if (response.data?.value?.success) {
    success.value = true
    toaster.clearAll()
    toaster.show({
      title: 'Success',
      message: `Taxe supprimée !`,
      color: 'success',
      icon: 'ph:check',
      closable: true,
    })
    isModalDeleteTaxOpen.value = false
    filter.value = 'tax'
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
    console.log('tax-create-success', values)

    try {
      const isSuccess = ref(false)
      if (isEdit.value == true) {
        const query2 = computed(() => {
          return {
            action: 'updateTax',
            token: token.value,
            id: values.tax._id,
          }
        })

        const response = await useFetch('/api/accountancy/taxes', {
          method: 'put',
          headers: { 'Content-Type': 'application/json' },
          query: query2,
          body: {
            ...values.tax,
            category: undefined,
          },
        })
        isSuccess.value = response.data.value?.success
      } else {
        const query2 = computed(() => {
          return {
            action: 'createTax',
            token: token.value,
          }
        })

        const response = await useFetch('/api/accountancy/taxes', {
          method: 'post',
          headers: { 'Content-Type': 'application/json' },
          query: query2,
          body: {
            ...values.tax,
            _id: undefined,
            category: undefined,
          },
        })
        isSuccess.value = response.data.value?.success
      }
      if (isSuccess) {
        success.value = true
        toaster.clearAll()
        toaster.show({
          title: 'Success',
          message: isEdit.value == false ? `Taxe créé !` : `Taxe mis à jour`,
          color: 'success',
          icon: 'ph:check',
          closable: true,
        })
        isModalNewTaxOpen.value = false
        resetForm()
        filter.value = 'tax'
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
    console.log('tax-create-error', error)

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
          @click=";(isModalNewTaxOpen = true), (isEdit = false)"
          color="primary"
          class="w-full sm:w-48"
          :disabled="
            authStore.user.appRole.name != UserRole.sale &&
            authStore.user.appRole.name != UserRole.mediaPlanner &&
            authStore.user.appRole.name != UserRole.superAdmin
          "
        >
          <Icon name="lucide:plus" class="h-4 w-4" />
          <span>Nouvelle Taxe</span>
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
                <TairoTableHeading uppercase spaced> Code </TairoTableHeading>

                <TairoTableHeading uppercase spaced> Nom </TairoTableHeading>

                <TairoTableHeading uppercase spaced> Valeur </TairoTableHeading>

                <TairoTableHeading uppercase spaced>
                  Description
                </TairoTableHeading>

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
                  <div class="flex items-center">
                    <span class="text-muted-400 font-sans text-xs">
                      {{ item.name }}
                    </span>
                  </div>
                </TairoTableCell>
                <TairoTableCell light spaced>
                  <div class="flex items-center">
                    <span class="text-muted-400 font-sans text-xs">
                      {{ item.value }}
                    </span>
                  </div>
                </TairoTableCell>
                <TairoTableCell spaced>
                  <div class="flex items-center">
                    <span class="text-muted-400 font-sans text-xs">
                      {{ item.description ?? '-' }}
                    </span>
                  </div>
                </TairoTableCell>

                <TairoTableCell spaced>
                  <div class="flex">
                    <BaseButtonAction
                      class="mx-2"
                      @click.prevent="selectTax(item)"
                      muted
                    >
                      <Icon name="lucide:eye" class="h-4 w-4"
                    /></BaseButtonAction>
                    <BaseButtonAction
                      :disabled="
                        authStore.user.appRole.name != UserRole.sale &&
                        authStore.user.appRole.name != UserRole.mediaPlanner &&
                        authStore.user.appRole.name != UserRole.superAdmin
                      "
                      @click="editTax(item)"
                    >
                      <Icon name="lucide:edit" class="h-4 w-4"
                    /></BaseButtonAction>
                    <BaseButtonAction
                      @click="confirmDeleteTax(item)"
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

    <!-- Modal new Taxe -->
    <TairoModal
      :open="isModalNewTaxOpen"
      size="xl"
      @close="isModalNewTaxOpen = false"
    >
      <template #header>
        <!-- Header -->
        <div class="flex w-full items-center justify-between p-4 md:p-6">
          <h3
            class="font-heading text-muted-900 text-lg font-medium leading-6 dark:text-white"
          >
            {{ isEdit == true ? 'Mise à jour' : 'Nouvelle' }} Taxe
          </h3>

          <BaseButtonClose @click="isModalNewTaxOpen = false" />
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
                      name="tax.code"
                    >
                      <BaseInput
                        label="Code"
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

                  <div class="col-span-12 md:col-span-12">
                    <Field
                      v-slot="{ field, errorMessage, handleChange, handleBlur }"
                      name="tax.name"
                    >
                      <BaseInput
                        label="Nom"
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
                  <div class="col-span-12 md:col-span-12">
                    <Field
                      v-slot="{ field, errorMessage, handleChange, handleBlur }"
                      name="tax.value"
                    >
                      <BaseInput
                        label="Valeur"
                        icon="ph:file-duotone"
                        placeholder=""
                        type="number"
                        :model-value="field.value"
                        :error="errorMessage"
                        :disabled="isSubmitting"
                        @update:model-value="handleChange"
                        @blur="handleBlur"
                      />
                    </Field>
                  </div>
                  <div class="col-span-12 md:col-span-12">
                    <Field
                      v-slot="{ field, errorMessage, handleChange, handleBlur }"
                      name="tax.description"
                    >
                      <BaseInput
                        label="Description"
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
            <BaseButton @click="isModalNewTaxOpen = false">Annuler</BaseButton>

            <BaseButton color="primary" flavor="solid" @click="onSubmit">
              {{ isEdit == true ? 'Modifier' : 'Créer' }}
            </BaseButton>
          </div>
        </div>
      </template>
    </TairoModal>

    <!-- Modal delete -->
    <TairoModal
      :open="isModalDeleteTaxOpen"
      size="sm"
      @close="isModalDeleteTaxOpen = false"
    >
      <template #header>
        <!-- Header -->
        <div class="flex w-full items-center justify-between p-4 md:p-6">
          <h3
            class="font-heading text-muted-900 text-lg font-medium leading-6 dark:text-white"
          >
            Suppression d'une taxe
          </h3>

          <BaseButtonClose @click="isModalDeleteTaxOpen = false" />
        </div>
      </template>

      <!-- Body -->
      <div class="p-4 md:p-6">
        <div class="mx-auto w-full max-w-xs text-center">
          <h3
            class="font-heading text-muted-800 text-lg font-medium leading-6 dark:text-white"
          >
            Supprimer
            <span class="text-red-500">{{ currentTax?.name }}</span> ?
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
            <BaseButton @click="isModalDeleteTaxOpen = false"
              >Annuler</BaseButton
            >

            <BaseButton
              color="primary"
              flavor="solid"
              @click="deleteTax(currentTax)"
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
          <span>Détails Taxe</span>
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
              :src="currentTax?.logo"
              :text="currentTax.initials"
              :class="getRandomColor()"
              size="2xl"
            />
          </div>
          <div class="text-center">
            <BaseHeading tag="h3" size="lg" class="mt-4">
              <span>{{ currentTax?.name }}</span>
            </BaseHeading>
            <BaseParagraph size="sm" class="text-muted-400">
              <span>{{ currentTax?.description }}</span>
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
                <span> Consulter </span>
              </BaseButton>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
