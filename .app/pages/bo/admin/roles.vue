<script setup lang="ts">
import { toTypedSchema } from '@vee-validate/zod'
import { Field, useForm } from 'vee-validate'
import { z } from 'zod'

definePageMeta({
  title: 'Roles',
  preview: {
    title: 'Roles',
    description: 'For item grids and collections',
    categories: ['bo', 'admin'],
    src: '/img/screens/layouts-tile-grid-1.png',
    srcDark: '/img/screens/layouts-tile-grid-1-dark.png',
    order: 61,
  },
})

const route = useRoute()
const router = useRouter()
const page = computed(() => parseInt((route.query.page as string) ?? '1'))

const filter = ref('')
const perPage = ref(18)
const token = useCookie('token')
const isEdit = ref(false)
const currentRole = ref({})
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

const { data, pending, error, refresh } = await useFetch('/api/users/roles', {
  query,
})

const isModalNewRoleOpen = ref(false)
const isModalDeleteRoleOpen = ref(false)

function editRole(role: any) {
  isModalNewRoleOpen.value = true
  isEdit.value = true
  setFieldValue('role._id', role._id)
  setFieldValue('role.name', role.name)
  setFieldValue('role.tag', role.tag)
  setFieldValue('role.description', role.description)
}

function confirmDeleteRole(role: any) {
  isModalDeleteRoleOpen.value = true
  isEdit.value = false
  currentRole.value = role
}

async function deleteRole(role: any) {
  const query2 = computed(() => {
    return {
      action: 'deleteRole',
      token: token.value,
      id: role?._id,
    }
  })

  const response = await useFetch('/api/users/roles', {
    method: 'delete',
    headers: { 'Content-Type': 'application/json' },
    query: query2,
  })

  if (response.data?.value?.success) {
    success.value = true
    toaster.clearAll()
    toaster.show({
      title: 'Success',
      message: `Role supprimé !`,
      color: 'success',
      icon: 'ph:check',
      closable: true,
    })
    isModalDeleteRoleOpen.value = false
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

// This is the object that will contain the validation messages
const VALIDATION_TEXT = {
  NAME_REQUIRED: "Name can't be empty",
  TAG_REQUIRED: "Tag can't be empty",
}

// This is the Zod schema for the form input
// It's used to define the shape that the form data will have
const zodSchema = z
  .object({
    role: z.object({
      _id: z.string().optional(),
      name: z.string().min(1, VALIDATION_TEXT.NAME_REQUIRED),
      tag: z.string().min(1, VALIDATION_TEXT.TAG_REQUIRED),
      description: z.string().optional(),
    }),
  })
  .superRefine((data, ctx) => {
    if (!data.role.name) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: VALIDATION_TEXT.NAME_REQUIRED,
        path: ['role.name'],
      })
    }

    if (!data.role.tag) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: VALIDATION_TEXT.TAG_REQUIRED,
        path: ['role.tag'],
      })
    }
  })

// Zod has a great infer method that will
// infer the shape of the schema into a TypeScript type
type FormInput = z.infer<typeof zodSchema>
const success = ref(false)
const fieldsWithErrors = computed(() => Object.keys(errors.value).length)
const validationSchema = toTypedSchema(zodSchema)
const initialValues = computed<FormInput>(() => ({
  role: {
    name: '',
    tag: '',
    description: '',
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
    console.log('role-create-success', values)

    try {
      const isSuccess = ref(false)
      if (isEdit.value == true) {
        const query2 = computed(() => {
          return {
            action: 'updateRole',
            token: token.value,
            id: values.role?._id,
          }
        })

        const response = await useFetch('/api/users/roles', {
          method: 'put',
          headers: { 'Content-Type': 'application/json' },
          query: query2,
          body: {
            ...values.role,
          },
        })
        isSuccess.value = response.data?.value?.success
      } else {
        const query2 = computed(() => {
          return {
            action: 'createRole',
            token: token.value,
          }
        })

        const { data: response } = await useFetch('/api/users/roles', {
          method: 'post',
          query: query2,
          body: { ...values.role },
        })

        isSuccess.value = response.data?.value?.success
      }
      if (isSuccess) {
        toaster.clearAll()
        toaster.show({
          title: 'Success',
          message: `Role ${isEdit.value == true ? 'mis à jour' : 'créer'}!`,
          color: 'success',
          icon: 'ph:check',
          closable: true,
        })
        isModalNewRoleOpen.value = false
        resetForm()
        filter.value = 'role'
        filter.value = ''
      } else {
        toaster.clearAll()
        toaster.show({
          title: 'Error',
          message: `Une érreur est survenue!`,
          color: 'warning',
          icon: 'lucide:alert-triangle',
          closable: true,
        })
      }
    } catch (error: any) {
      console.log(error)
      // this will set the error on the form
      if (error.message === 'Fake backend validation error') {
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
          shape="full"
          placeholder="Rechercher..."
          :classes="{
            wrapper: 'w-full sm:w-auto',
          }"
        />
      </template>
      <template #right>
        <BaseButton
          @click=";(isModalNewRoleOpen = true), (isEdit = false), resetForm()"
          color="primary"
          class="w-full sm:w-38"
        >
          <Icon name="lucide:plus" class="h-4 w-4" />
          <span>Ajouter un rôle</span>
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
                src="/img/illustrations/placeholders/flat/placeholder-search-5.svg"
                alt="Placeholder image"
              />
              <img
                class="hidden dark:block"
                src="/img/illustrations/placeholders/flat/placeholder-search-5-dark.svg"
                alt="Placeholder image"
              />
            </template>
          </BasePlaceholderPage>
        </div>
        <div
          v-else
          class="ltablet:grid-cols-3 grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
        >
          <TransitionGroup
            enter-active-class="transform-gpu"
            enter-from-class="opacity-0 -translate-x-full"
            enter-to-class="opacity-100 translate-x-0"
            leave-active-class="absolute transform-gpu"
            leave-from-class="opacity-100 translate-x-0"
            leave-to-class="opacity-0 -translate-x-full"
          >
            <BaseCard
              v-for="(item, index) in data?.data"
              :key="index"
              shape="curved"
              class="p-3"
            >
              <div class="flex w-full items-center gap-2">
                <BaseAvatar
                  size="md"
                  :src="item.medias?.avatar"
                  :badge-src="item.badge"
                  :text="item.initials"
                  class="bg-success-100 text-success-400"
                />
                <div>
                  <BaseHeading tag="h3" size="sm" weight="medium">
                    {{ item.name }}
                  </BaseHeading>
                  <BaseParagraph size="xs" class="text-muted-400">
                    {{ item.tag }} | {{ item.description }}
                  </BaseParagraph>
                </div>
                <div class="ms-auto">
                  <BaseDropdown
                    flavor="context"
                    label="Dropdown"
                    orientation="end"
                    condensed
                    class="z-20"
                    shape="curved"
                  >
                    <BaseDropdownItem
                      @click="editRole(item)"
                      title="Editer"
                      text="Mêttre à jour"
                    >
                      <template #start>
                        <Icon
                          name="ph:pencil-duotone"
                          class="me-2 block h-5 w-5"
                        />
                      </template>
                    </BaseDropdownItem>
                    <BaseDropdownDivide />
                    <BaseDropdownItem
                      @click="confirmDeleteRole(item)"
                      title="Remove"
                      text="Supprimer"
                    >
                      <template #start>
                        <Icon
                          name="ph:trash-duotone"
                          class="me-2 block h-5 w-5"
                        />
                      </template>
                    </BaseDropdownItem>
                  </BaseDropdown>
                </div>
              </div>
            </BaseCard>
          </TransitionGroup>
        </div>
        <div v-if="!pending && data?.data.length !== 0" class="mt-4">
          <BasePagination
            :total-items="data?.total ?? 0"
            :item-per-page="perPage"
            :current-page="page"
            shape="curved"
          />
        </div>
      </div>
    </TairoContentWrapper>
    <!-- Modal New Role -->
    <TairoModal
      :open="isModalNewRoleOpen"
      size="xl"
      @close="isModalNewRoleOpen = false"
    >
      <template #header>
        <!-- Header -->
        <div class="flex w-full items-center justify-between p-4 md:p-6">
          <h3
            class="font-heading text-muted-900 text-lg font-medium leading-6 dark:text-white"
          >
            {{ isEdit == true ? 'Mêttre à jour' : 'Nouveau' }} rôle
          </h3>

          <BaseButtonClose @click="isModalNewRoleOpen = false" />
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
                      name="role.name"
                    >
                      <BaseInput
                        label="Nom"
                        icon="ph:user-duotone"
                        placeholder=""
                        :model-value="field.value"
                        type="text"
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
                      name="role.tag"
                    >
                      <BaseInput
                        label="Tag"
                        icon="ph:user-duotone"
                        placeholder=""
                        :model-value="field.value"
                        type="text"
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
                      name="role.description"
                    >
                      <BaseInput
                        label="Description"
                        icon="ph:chat-duotone"
                        placeholder=""
                        :model-value="field.value"
                        type="text"
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
            <BaseButton @click="isModalNewRoleOpen = false">Annuler</BaseButton>

            <BaseButton
              color="primary"
              flavor="solid"
              @click="onSubmit"
              type="submit"
            >
              Valider
            </BaseButton>
          </div>
        </div>
      </template>
    </TairoModal>

    <!-- Modal delete -->
    <TairoModal
      :open="isModalDeleteRoleOpen"
      size="sm"
      @close="isModalDeleteRoleOpen = false"
    >
      <template #header>
        <!-- Header -->
        <div class="flex w-full items-center justify-between p-4 md:p-6">
          <h3
            class="font-heading text-muted-900 text-lg font-medium leading-6 dark:text-white"
          >
            Suppression d'un rôle
          </h3>

          <BaseButtonClose @click="isModalDeleteRoleOpen = false" />
        </div>
      </template>

      <!-- Body -->
      <div class="p-4 md:p-6">
        <div class="mx-auto w-full max-w-xs text-center">
          <h3
            class="font-heading text-muted-800 text-lg font-medium leading-6 dark:text-white"
          >
            Supprimer
            <span class="text-red-500">{{ currentRole?.name }}</span> ?
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
            <BaseButton @click="isModalDeleteRoleOpen = false"
              >Annuler</BaseButton
            >

            <BaseButton
              color="primary"
              flavor="solid"
              @click="deleteRole(currentRole)"
              >Supprimer</BaseButton
            >
          </div>
        </div>
      </template>
    </TairoModal>
  </div>
</template>
