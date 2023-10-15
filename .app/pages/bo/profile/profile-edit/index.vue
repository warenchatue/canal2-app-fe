<script setup lang="ts">
import { toTypedSchema } from '@vee-validate/zod'
import { Field, useFieldError, useForm } from 'vee-validate'
import { z } from 'zod'

definePageMeta({
  title: 'Mise à jour du Profile',
  preview: {
    title: 'Edit profile 1',
    description: 'For editing a user profile',
    categories: ['profile', 'profile-edit', 'forms'],
    src: '/img/screens/layouts-subpages-profile-edit-1.png',
    srcDark: '/img/screens/layouts-subpages-profile-edit-1-dark.png',
    order: 76,
  },
})

const autStore = useAuthStore()
const appStore = useAppStore()
// This is the object that will contain the validation messages
const ONE_MB = 1000000
const VALIDATION_TEXT = {
  FIRST_REQUIRED: "Your first name can't be empty",
  LAST_NAME_REQUIRED: "Your last name can't be empty",
  EMAIL_REQUIRED: "Your last name can't be empty",
  OPTION_REQUIRED: 'Please select an option',
  AVATAR_TOO_BIG: `Avatar size must be less than 1MB`,
}

// This is the Zod schema for the form input
// It's used to define the shape that the form data will have
const zodSchema = z
  .object({
    avatar: z.custom<File>((v) => v instanceof File).nullable(),
    profile: z.object({
      _id: z.string().optional(),
      firstName: z.string().min(1, VALIDATION_TEXT.FIRST_REQUIRED),
      lastName: z.string().min(1, VALIDATION_TEXT.LAST_NAME_REQUIRED),
      email: z.string().min(1, VALIDATION_TEXT.EMAIL_REQUIRED),
      role: z.string().optional(),
      location: z.string().optional(),
      bio: z.string().optional(),
      status: z.union([z.literal('active'), z.literal('inactive')]),
      phone: z.string(),
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
    // This is a custom validation function that will be called
    // before the form is submitted
    if (!data.profile.email) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: VALIDATION_TEXT.EMAIL_REQUIRED,
        path: ['profile.email'],
      })
    }
    if (data.avatar && data.avatar.size > ONE_MB) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: VALIDATION_TEXT.AVATAR_TOO_BIG,
        path: ['avatar'],
      })
    }
  })

// Zod has a great infer method that will
// infer the shape of the schema into a TypeScript type
type FormInput = z.infer<typeof zodSchema>

const validationSchema = toTypedSchema(zodSchema)
const initialValues = computed<FormInput>(() => ({
  avatar: null,
  profile: {
    _id: autStore.user?._id || '',
    firstName: autStore.user?.firstName || '',
    lastName: autStore.user?.lastName || '',
    email: autStore.user?.email || '',
    phone: autStore.user?.phone || '',
    role: autStore.user?.appRole?.name || '',
    country: autStore.user?.country,
    status: autStore.user?.status || 'active',
    location: '',
    bio: '',
  },
}))

// This is the computed value that will be used to display the current avatar
const currentAvatar = computed(
  () => autStore.user?.photo ?? '/img/avatars/2.svg',
)

const { updateUser } = useAuthStore()

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
    console.log('profile-edit-success', values)

    try {
      const isSuccess = ref(false)
      isSuccess.value = await updateUser(
        {
          ...values.profile,
        },
        false,
      )

      if (isSuccess.value) {
        success.value = true
        resetForm()
        toaster.clearAll()
        toaster.show({
          title: 'Success',
          message: `Profile mis à jour!`,
          color: 'success',
          icon: 'ph:user-circle-fill',
          closable: true,
        })
        //refresh
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
          title: 'Oops!',
          message: 'Please review the errors in the form',
          color: 'danger',
          icon: 'lucide:alert-triangle',
          closable: true,
        })
      }
      return
    }

    document.documentElement.scrollTo({
      top: 0,
      behavior: 'smooth',
    })
  },
  (error) => {
    // this callback is optional and called only if the form has errors
    success.value = false

    // here you have access to the error
    console.log('profile-edit-error', error)

    // you can use it to scroll to the first error
    document.documentElement.scrollTo({
      top: 0,
      behavior: 'smooth',
    })
  },
)
</script>

<template>
  <form method="POST" action="" class="w-full pb-16" @submit.prevent="onSubmit">
    <BaseCard>
      <div class="flex items-center justify-between p-4">
        <div>
          <BaseHeading
            tag="h2"
            size="sm"
            weight="medium"
            lead="normal"
            class="uppercase tracking-wider"
          >
            INFORMATIONS GÉNÉRALE
          </BaseHeading>
          <BaseText size="xs" class="text-muted-400">
            Modifier les informations générales de votre compte
          </BaseText>
        </div>
        <div class="flex items-center gap-2">
          <BaseButton class="w-24" to="/bo/profile">Cancel</BaseButton>
          <BaseButton
            type="submit"
            color="primary"
            class="w-24"
            :disabled="isSubmitting"
            :loading="isSubmitting"
            >Save</BaseButton
          >
        </div>
      </div>
      <div class="p-4">
        <div class="mx-auto max-w-lg space-y-12 py-8">
          <BaseMessage v-if="success" @close="success = false">
            Your profile has been updated!
          </BaseMessage>
          <BaseMessage
            v-if="fieldsWithErrors"
            type="danger"
            @close="() => setErrors({})"
          >
            This form has {{ fieldsWithErrors }} errors, please check them
            before submitting
          </BaseMessage>

          <TairoFormGroup
            label="Photo de profile"
            sublabel="C'est ainsi que les autres vous reconnaîtront"
          >
            <div
              class="relative flex flex-col items-center justify-center gap-4"
            >
              <BaseFullscreenDropfile
                icon="ph:image-duotone"
                :filter-file-dropped="(file) => file.type.startsWith('image')"
                @drop="
                  (value) => {
                    inputFile = value
                  }
                "
              />

              <BaseInputFileHeadless
                accept="image/*"
                v-model="inputFile"
                v-slot="{ open, remove, preview, files }"
              >
                <div class="relative h-24 w-24">
                  <img
                    v-if="files?.length && files.item(0)"
                    :src="preview(files.item(0)!).value"
                    alt="Upload preview"
                    class="bg-muted-200 dark:bg-muted-700/60 h-24 w-24 rounded-full object-cover object-center"
                  />
                  <img
                    v-else
                    :src="currentAvatar"
                    alt="Upload preview"
                    class="bg-muted-200 dark:bg-muted-700/60 h-24 w-24 rounded-full object-cover object-center"
                  />
                  <div
                    v-if="files?.length && files.item(0)"
                    class="absolute bottom-0 end-0 z-20"
                  >
                    <BaseButtonIcon
                      condensed
                      shape="full"
                      @click="remove(files.item(0)!)"
                      data-tooltip="Remove image"
                    >
                      <Icon name="lucide:x" class="h-4 w-4" />
                    </BaseButtonIcon>
                  </div>
                  <div v-else class="absolute bottom-0 end-0 z-20">
                    <div class="relative" data-tooltip="Upload image">
                      <BaseButtonIcon condensed shape="full" @click="open">
                        <Icon name="lucide:plus" class="h-4 w-4" />
                      </BaseButtonIcon>
                    </div>
                  </div>
                </div>
              </BaseInputFileHeadless>
              <div
                v-if="fileError"
                class="text-danger-600 inline-block font-sans text-[.8rem]"
              >
                {{ fileError }}
              </div>
            </div>
          </TairoFormGroup>

          <TairoFormGroup
            label="Informations personnelles"
            sublabel="Nom, email"
          >
            <div class="grid grid-cols-12 gap-4">
              <div class="col-span-12 sm:col-span-6">
                <Field
                  v-slot="{ field, errorMessage, handleChange, handleBlur }"
                  name="profile.firstName"
                >
                  <BaseInput
                    :model-value="field.value"
                    :error="errorMessage"
                    :disabled="isSubmitting"
                    type="text"
                    icon="ph:user-duotone"
                    placeholder="First name"
                    @update:model-value="handleChange"
                    @blur="handleBlur"
                  />
                </Field>
              </div>
              <div class="col-span-12 sm:col-span-6">
                <Field
                  v-slot="{ field, errorMessage, handleChange, handleBlur }"
                  name="profile.lastName"
                >
                  <BaseInput
                    :model-value="field.value"
                    :error="errorMessage"
                    :disabled="isSubmitting"
                    type="text"
                    icon="ph:user-duotone"
                    placeholder="Last name"
                    @update:model-value="handleChange"
                    @blur="handleBlur"
                  />
                </Field>
              </div>
              <div class="col-span-12 sm:col-span-6">
                <Field
                  v-slot="{ field, errorMessage, handleChange, handleBlur }"
                  name="profile.email"
                >
                  <BaseInput
                    :model-value="field.value"
                    :error="errorMessage"
                    :disabled="isSubmitting"
                    type="text"
                    icon="ph:user-duotone"
                    placeholder="Email"
                    @update:model-value="handleChange"
                    @blur="handleBlur"
                  />
                </Field>
              </div>
              <div class="col-span-12 sm:col-span-6">
                <Field
                  v-slot="{ field, errorMessage, handleChange, handleBlur }"
                  name="profile.phone"
                >
                  <BaseInput
                    :model-value="field.value"
                    :error="errorMessage"
                    :disabled="isSubmitting"
                    type="text"
                    icon="ph:phone-duotone"
                    placeholder="Phone"
                    @update:model-value="handleChange"
                    @blur="handleBlur"
                  />
                </Field>
              </div>
              <div class="col-span-12">
                <Field
                  v-slot="{ field, errorMessage, handleChange, handleBlur }"
                  name="profile.role"
                >
                  <BaseInput
                    :model-value="field.value"
                    :error="errorMessage"
                    :disabled="true"
                    type="text"
                    icon="ph:suitcase-duotone"
                    placeholder="Job title"
                    @update:model-value="handleChange"
                    @blur="handleBlur"
                  />
                </Field>
              </div>
              <div class="col-span-12">
                <Field
                  v-slot="{ field, errorMessage, handleChange, handleBlur }"
                  name="profile.bio"
                >
                  <BaseTextarea
                    :model-value="field.value"
                    :error="errorMessage"
                    :disabled="isSubmitting"
                    rows="4"
                    placeholder="A-propos / petite description."
                    @update:model-value="handleChange"
                    @blur="handleBlur"
                  />
                </Field>
              </div>
            </div>
          </TairoFormGroup>

          <TairoFormGroup label="Adresse" sublabel="Pays, ville">
            <div class="grid grid-cols-12 gap-4">
              <div class="col-span-12 sm:col-span-12">
                <Field
                  v-slot="{ field, errorMessage, handleChange, handleBlur }"
                  name="info.flexible"
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
            </div>
          </TairoFormGroup>
        </div>
      </div>
    </BaseCard>
    <TairoFormSave
      :disabled="isSubmitting"
      :loading="isSubmitting"
      @reset="resetForm"
    />
  </form>
</template>
