<script setup lang="ts">
import { toTypedSchema } from '@vee-validate/zod'
import { Field, useForm } from 'vee-validate'
import { z } from 'zod'
import { UserRole } from '~/types/user'

definePageMeta({
  title: 'Comptes',
  preview: {
    title: 'Comptes',
    description: 'Gestion des Comptes',
    categories: ['bo', 'accountancy'],
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
const isModalNewAccountOpen = ref(false)
const isModalDeleteAccountOpen = ref(false)
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
  '/api/accountancy/accounts',
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

const currentAccount = ref({})
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
    account: z.object({
      _id: z.string().optional(),
      code: z.string().min(1, VALIDATION_TEXT.CODE_REQUIRED),
      label: z.string(),
      position: z.union([z.literal('d'), z.literal('c')]),
      description: z.string(),
    }),
  })
  .superRefine((data, ctx) => {
    if (!data.account.code) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: VALIDATION_TEXT.CODE_REQUIRED,
        path: ['account.code'],
      })
    }
  })

// Zod has a great infer method that will
// infer the shape of the schema into a TypeScript type
type FormInput = z.infer<typeof zodSchema>

const validationSchema = toTypedSchema(zodSchema)
const initialValues = computed<FormInput>(() => ({
  avatar: null,
  account: {
    code: '',
    label: '',
    description: '',
    position: 'c',
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

function editAccount(account: any) {
  isModalNewAccountOpen.value = true
  isEdit.value = true
  setFieldValue('account._id', account._id)
  setFieldValue('account.code', account.code)
  setFieldValue('account.position', account.position)
  setFieldValue('account.label', account.label)
  setFieldValue('account.description', account.description)
}

function selectAccount(tax: any) {
  currentAccount.value = tax
  expanded.value = false
}

function confirmDeleteAccount(tax: any) {
  isModalDeleteAccountOpen.value = true
  isEdit.value = false
  currentAccount.value = tax
}

async function deleteAccount(account: any) {
  const query2 = computed(() => {
    return {
      action: 'delete',
      token: token.value,
      id: account._id,
    }
  })

  const response = await useFetch('/api/accountancy/accounts', {
    method: 'delete',
    headers: { 'Content-Type': 'application/json' },
    query: query2,
  })

  if (response.data?.value?.success) {
    success.value = true
    toaster.clearAll()
    toaster.show({
      title: 'Success',
      message: `Compte supprimé !`,
      color: 'success',
      icon: 'ph:check',
      closable: true,
    })
    isModalDeleteAccountOpen.value = false
    filter.value = 'account'
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
    console.log('accounnt-create-success', values)

    try {
      const isSuccess = ref(false)
      if (isEdit.value == true) {
        const query2 = computed(() => {
          return {
            action: 'updateAccount',
            token: token.value,
            id: values.account._id,
          }
        })

        const response = await useFetch('/api/accountancy/accounts', {
          method: 'put',
          headers: { 'Content-Type': 'application/json' },
          query: query2,
          body: {
            ...values.account,
            category: undefined,
          },
        })
        isSuccess.value = response.data.value?.success
      } else {
        const query2 = computed(() => {
          return {
            action: 'createAccount',
            token: token.value,
          }
        })

        const response = await useFetch('/api/accountancy/accounts', {
          method: 'post',
          headers: { 'Content-Type': 'application/json' },
          query: query2,
          body: {
            ...values.account,
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
          message:
            isEdit.value == false ? `Compte créé !` : `Compte mis à jour`,
          color: 'success',
          icon: 'ph:check',
          closable: true,
        })
        isModalNewAccountOpen.value = false
        resetForm()
        filter.value = 'tax'
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
          placeholder="Filtrer comptes..."
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
          @click=";(isModalNewAccountOpen = true), (isEdit = false)"
          color="primary"
          class="w-full sm:w-48"
          :disabled="
            authStore.user.appRole.name != UserRole.billing &&
            authStore.user.appRole.name != UserRole.accountancy &&
            authStore.user.appRole.name != UserRole.superAdmin
          "
        >
          <Icon name="lucide:plus" class="h-4 w-4" />
          <span>Nouveau Compte</span>
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
                <TairoTableHeading uppercase spaced>
                  Numéro de compte
                </TairoTableHeading>

                <TairoTableHeading uppercase spaced>
                  Libellé
                </TairoTableHeading>

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
                      {{ item.label }}
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
                      @click.prevent="selectAccount(item)"
                      muted
                    >
                      <Icon name="lucide:eye" class="h-4 w-4"
                    /></BaseButtonAction>
                    <BaseButtonAction
                      :disabled="
                        authStore.user.appRole.name != UserRole.billing &&
                        authStore.user.appRole.name != UserRole.accountancy &&
                        authStore.user.appRole.name != UserRole.superAdmin
                      "
                      @click="editAccount(item)"
                    >
                      <Icon name="lucide:edit" class="h-4 w-4"
                    /></BaseButtonAction>
                    <BaseButtonAction
                      @click="confirmDeleteAccount(item)"
                      :disabled="
                        authStore.user.appRole.name != UserRole.billing &&
                        authStore.user.appRole.name != UserRole.accountancy &&
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

    <!-- Modal new Account -->
    <TairoModal
      :open="isModalNewAccountOpen"
      size="xl"
      @close="isModalNewAccountOpen = false"
    >
      <template #header>
        <!-- Header -->
        <div class="flex w-full items-center justify-between p-4 md:p-6">
          <h3
            class="font-heading text-muted-900 text-lg font-medium leading-6 dark:text-white"
          >
            {{ isEdit == true ? 'Mise à jour' : 'Nouveau' }} Compte
          </h3>

          <BaseButtonClose @click="isModalNewAccountOpen = false" />
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
                      name="account.code"
                    >
                      <BaseInput
                        label="Numéro de compte"
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
                      name="account.label"
                    >
                      <BaseInput
                        label="Libellé"
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
                  <div class="ltablet:col-span-6 col-span-12 lg:col-span-12">
                    <Field
                      v-slot="{ field, errorMessage, handleChange, handleBlur }"
                      name="account.position"
                    >
                      <BaseSelect
                        label="Position *"
                        icon="ph:funnel"
                        :model-value="field.value"
                        :error="errorMessage"
                        :disabled="isSubmitting"
                        @update:model-value="handleChange"
                        @blur="handleBlur"
                      >
                        <option value="d">Debit</option>
                        <option value="c">Credit</option>
                      </BaseSelect>
                    </Field>
                  </div>
                  <div class="col-span-12 md:col-span-12">
                    <Field
                      v-slot="{ field, errorMessage, handleChange, handleBlur }"
                      name="account.description"
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
            <BaseButton @click="isModalNewAccountOpen = false"
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
      :open="isModalDeleteAccountOpen"
      size="sm"
      @close="isModalDeleteAccountOpen = false"
    >
      <template #header>
        <!-- Header -->
        <div class="flex w-full items-center justify-between p-4 md:p-6">
          <h3
            class="font-heading text-muted-900 text-lg font-medium leading-6 dark:text-white"
          >
            Suppression d'un compte
          </h3>

          <BaseButtonClose @click="isModalDeleteAccountOpen = false" />
        </div>
      </template>

      <!-- Body -->
      <div class="p-4 md:p-6">
        <div class="mx-auto w-full max-w-xs text-center">
          <h3
            class="font-heading text-muted-800 text-lg font-medium leading-6 dark:text-white"
          >
            Supprimer
            <span class="text-red-500">{{ currentAccount?.label }}</span> ?
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
            <BaseButton @click="isModalDeleteAccountOpen = false"
              >Annuler</BaseButton
            >

            <BaseButton
              color="primary"
              flavor="solid"
              @click="deleteAccount(currentAccount)"
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
          <span>Détails Comptes</span>
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
              :src="currentAccount?.logo"
              :text="currentAccount.initials"
              :class="getRandomColor()"
              size="2xl"
            />
          </div>
          <div class="text-center">
            <BaseHeading tag="h3" size="lg" class="mt-4">
              <span>{{ currentAccount?.name }}</span>
            </BaseHeading>
            <BaseParagraph size="sm" class="text-muted-400">
              <span>{{ currentAccount?.description }}</span>
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
