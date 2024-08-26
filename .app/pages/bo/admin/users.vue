<script setup lang="ts">
import { toTypedSchema } from '@vee-validate/zod'
import { Field, useForm } from 'vee-validate'
import { z } from 'zod'

definePageMeta({
  title: 'Users',
  preview: {
    title: 'Users',
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
const perPage = ref(25)
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

const query2 = computed(() => {
  return {
    action: 'findAll',
    token: token.value,
    filter: filter.value,
    perPage: 50,
    page: page.value,
  }
})


const { data, pending, error, refresh } = await useFetch('/api/users', {
  query,
})

const { data:rolesData } = await useFetch('/api/users/roles', {
  query : query2,
})

const selected = ref<number[]>([])
const isAllVisibleSelected = computed(() => {
  return selected.value.length === data.value?.data.length
})

function toggleAllVisibleSelection() {
  if (isAllVisibleSelected.value) {
    selected.value = []
  } else {
    selected.value = data.value?.data.map((item: any) => item._id) ?? []
  }
}

const isModalNewUserOpen = ref(false)
const isModalDeleteUserOpen = ref(false)
const isModalUpdatePasswordOpen = ref(false)
const newPassword = ref()
const passwordError = ref<string | boolean | undefined>(false)
const isEdit = ref(false)
const { registerUser, updateUser } = useAuthStore()

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
    user: z.object({
      _id: z.string().optional(),
      firstName: z.string(),
      lastName: z.string().min(1, VALIDATION_TEXT.NAME_REQUIRED),
      email: z.string(),
      team: z.union([z.literal('douala'), z.literal('yaounde')]),
      status: z
        .union([z.literal('active'), z.literal('inactive')])
        .optional()
        .nullable(),
      phone: z.string(),
      appRole: z.object({
        _id: z.string(),
        name: z.string(),
        tag: z.string(),
        flag: z.string().optional(),
        description: z.string(),
      }),
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
    if (!data.user.lastName) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: VALIDATION_TEXT.NAME_REQUIRED,
        path: ['user.lastName'],
      })
    }

    if (!data.user.email) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: VALIDATION_TEXT.EMAIL_REQUIRED,
        path: ['user.email'],
      })
    }
  })

// Zod has a great infer method that will
// infer the shape of the schema into a TypeScript type
type FormInput = z.infer<typeof zodSchema>

const validationSchema = toTypedSchema(zodSchema)
const initialValues = computed<FormInput>(() => ({
  avatar: null,
  user: {
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    team: 'douala',
    status: 'active',
    appRole: {
      _id: '',
      name: '',
      tag: '',
      description: '',
      flag: '',
    },
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
const currentUser = ref({})

function editUser(user: any) {
  isModalNewUserOpen.value = true
  isEdit.value = true
  currentUser.value = user
  setFieldValue('user._id', user._id)
  setFieldValue('user.firstName', user.firstName)
  setFieldValue('user.lastName', user.lastName)
  setFieldValue('user.email', user.email)
  setFieldValue('user.phone', user.phone)
  setFieldValue('user.team', user.team)
  setFieldValue('user.appRole', user.appRole)
  setFieldValue('user.country', user.country)
  setFieldValue('user.status', user.status)
}

function editUserPassword(user: any) {
  isModalUpdatePasswordOpen.value = true
  isEdit.value = false
  currentUser.value = user
  setFieldValue('user._id', user._id)
  setFieldValue('user.firstName', user.firstName)
  setFieldValue('user.lastName', user.lastName)
}

function confirmDeleteUser(user: any) {
  isModalDeleteUserOpen.value = true
  isEdit.value = false
  currentUser.value = user
}

async function updatePassword() {
  if (newPassword.value.length === 0) {
    passwordError.value = 'Le mot de passe ne peut etre vide'
    return
  }
  const query2 = computed(() => {
    return {
      action: 'updatePassword',
      token: token.value,
      id: currentUser.value?._id,
    }
  })

  const response = await useFetch('/api/users', {
    method: 'put',
    headers: { 'Content-Type': 'application/json' },
    query: query2,
    body: { email: currentUser.value?.email, password: newPassword },
  })

  if (response.data?.value?.success) {
    success.value = true
    toaster.clearAll()
    toaster.show({
      title: 'Success',
      message: `Mot de passe mis à jour !`,
      color: 'success',
      icon: 'ph:check',
      closable: true,
    })
    isModalUpdatePasswordOpen.value = false
    filter.value = 'user'
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

async function deleteUser(user: any) {
  const query2 = computed(() => {
    return {
      action: 'deleteUser',
      token: token.value,
      id: user?._id,
    }
  })

  const response = await useFetch('/api/users', {
    method: 'delete',
    headers: { 'Content-Type': 'application/json' },
    query: query2,
  })

  if (response.data?.value?.success) {
    success.value = true
    toaster.clearAll()
    toaster.show({
      title: 'Success',
      message: `Utilisateur supprimé !`,
      color: 'success',
      icon: 'ph:check',
      closable: true,
    })
    isModalDeleteUserOpen.value = false
    filter.value = 'role'
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
    console.log('user-create-success', values)

    try {
      const isSuccess = ref(false)
      if (isEdit.value == true) {
        isSuccess.value = await updateUser(
          {
            ...values.user,
          },
          true,
        )
      } else {
        isSuccess.value = await registerUser(
          {
            ...values.user,
            password: '12345678',
          },
          true,
        )
      }

      if (isSuccess.value) {
        success.value = true
        resetForm()
        toaster.clearAll()
        toaster.show({
          title: 'Success',
          message: `User created!`,
          color: 'success',
          icon: 'ph:user-circle-fill',
          closable: true,
        })

        isModalNewUserOpen.value = false
        //refresh
        filter.value = 'user'
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
      // this will set the error on the form
      if (error.message === 'Fake backend validation error') {
        // @ts-expect-error - vee validate typing bug with nested keys
        setFieldError('user.name', 'This name is not allowed')

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
  },
  (error) => {
    // this callback is optional and called only if the form has errors
    success.value = false

    // here you have access to the error
    console.log('user-create-error', error)

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
          placeholder="Filter users..."
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
          @click="resetForm(), ((isModalNewUserOpen = true), (isEdit = false))"
          color="primary"
          class="w-full sm:w-44"
        >
          <Icon name="lucide:plus" class="h-4 w-4" />
          <span>Nouvel utilisateur</span>
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
                  Utilisateur
                </TairoTableHeading>
                <TairoTableHeading uppercase spaced>Equipe</TairoTableHeading>
                <TairoTableHeading uppercase spaced>Tel</TairoTableHeading>
                <TairoTableHeading uppercase spaced>Role</TairoTableHeading>
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

              <TairoTableRow v-for="item in data?.data" :key="item._id">
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
                    <BaseAvatar
                      :src="item.picture"
                      :text="item.initials"
                      :class="getRandomColor()"
                    />
                    <div class="ms-3 leading-none">
                      <h4 class="font-sans text-sm font-medium">
                        {{ item.firstName }} {{ item.lastName }}
                      </h4>
                      <p class="text-muted-400 font-sans text-xs">
                        {{ item.email }}
                      </p>
                    </div>
                  </div>
                </TairoTableCell>
                <TairoTableCell light spaced>
                  {{ item.team }}
                </TairoTableCell>
                <TairoTableCell light spaced>
                  {{ item.phone }}
                </TairoTableCell>
                <TairoTableCell light spaced>
                  {{ item.appRole?.tag ?? 'Not specified' }}
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
                    <BaseButtonAction @click="editUser(item)">
                      <Icon name="lucide:edit" class="h-4 w-4"
                    /></BaseButtonAction>
                    <BaseButtonAction
                      @click="editUserPassword(item)"
                      class="!mx-3"
                    >
                      <Icon name="lucide:settings" class="h-4 w-4"
                    /></BaseButtonAction>
                    <BaseButtonAction @click="confirmDeleteUser(item)">
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

    <!-- Modal new user -->
    <TairoModal
      :open="isModalNewUserOpen"
      size="xl"
      @close="isModalNewUserOpen = false"
    >
      <template #header>
        <!-- Header -->
        <div class="flex w-full items-center justify-between p-4 md:p-6">
          <h3
            class="font-heading text-muted-900 text-lg font-medium leading-6 dark:text-white"
          >
            {{ isEdit == true ? 'Mêttre à jour ' : 'Nouvel' }} Utilisateur
          </h3>

          <BaseButtonClose @click="isModalNewUserOpen = false" />
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
                      name="user.lastName"
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
                  <div class="col-span-12 md:col-span-6">
                    <Field
                      v-slot="{ field, errorMessage, handleChange, handleBlur }"
                      name="user.firstName"
                    >
                      <BaseInput
                        label="Prénom"
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
                  <div class="col-span-12 md:col-span-6">
                    <Field
                      v-slot="{ field, errorMessage, handleChange, handleBlur }"
                      name="user.email"
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
                      name="user.phone"
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
                  <div class="ltablet:col-span-6 col-span-12 lg:col-span-6">
                    <Field
                      v-slot="{ field, errorMessage, handleChange, handleBlur }"
                      name="user.country"
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
                  <div class="ltablet:col-span-6 col-span-12 lg:col-span-6">
                    <Field
                      v-slot="{ field, errorMessage, handleChange, handleBlur }"
                      name="user.team"
                    >
                      <BaseSelect
                        label="Equipe"
                        icon="ph:funnel"
                        :model-value="field.value"
                        :error="errorMessage"
                        :disabled="isSubmitting"
                        @update:model-value="handleChange"
                        @blur="handleBlur"
                      >
                        <option value="douala">Douala</option>
                        <option value="yaounde">Yaoundé</option>
                      </BaseSelect>
                    </Field>
                  </div>
                  <div class="ltablet:col-span-6 col-span-12 lg:col-span-6">
                    <Field
                      v-slot="{ field, errorMessage, handleChange, handleBlur }"
                      name="user.appRole"
                    >
                      <BaseListbox
                        label="Role"
                        :items="rolesData.data"
                        :properties="{
                          value: '_id',
                          label: 'name',
                          sublabel: 'tag',
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
                      name="user.status"
                    >
                      <BaseSelect
                        label="Statut *"
                        icon="ph:funnel"
                        :model-value="field.value"
                        :error="errorMessage"
                        :disabled="isSubmitting"
                        @update:model-value="handleChange"
                        @blur="handleBlur"
                      >
                        <option value="active">Actif</option>
                        <option value="inactive">Inactif</option>
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
            <BaseButton @click="isModalNewUserOpen = false">Annuler</BaseButton>

            <BaseButton color="primary" flavor="solid" @click="onSubmit">
              {{ isEdit == true ? 'Modifier' : 'Créer' }}
            </BaseButton>
          </div>
        </div>
      </template>
    </TairoModal>

    <!-- Modal update user password -->
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
                      name="user.password"
                    >
                      <BaseInput
                        label="Nouveau mot de passe"
                        icon="ph:user-duotone"
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
      :open="isModalDeleteUserOpen"
      size="sm"
      @close="isModalDeleteUserOpen = false"
    >
      <template #header>
        <!-- Header -->
        <div class="flex w-full items-center justify-between p-4 md:p-6">
          <h3
            class="font-heading text-muted-900 text-lg font-medium leading-6 dark:text-white"
          >
            Suppression d'un utilisateur
          </h3>

          <BaseButtonClose @click="isModalDeleteUserOpen = false" />
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
              >{{ currentUser?.firstName }} {{ currentUser?.lastName }}</span
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
            <BaseButton @click="isModalDeleteUserOpen = false"
              >Annuler</BaseButton
            >

            <BaseButton
              color="primary"
              flavor="solid"
              @click="deleteUser(currentUser)"
              >Supprimer</BaseButton
            >
          </div>
        </div>
      </template>
    </TairoModal>
  </div>
</template>
