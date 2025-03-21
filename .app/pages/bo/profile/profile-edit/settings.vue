<script setup lang="ts">
import { toTypedSchema } from '@vee-validate/zod'
import IMask from 'imask'
import { Field, useForm } from 'vee-validate'
import { z } from 'zod'

const VALIDATION_TEXT = {
  OLD_PASSWORD_REQUIRED: 'Your current password is required',
  NEW_PASSWORD_LENGTH: 'Password must be at least 8 characters',
  NEW_PASSWORD_MATCH: 'Passwords do not match',
}

definePageMeta({
  title: 'Settings',
  preview: {
    title: 'Edit profile - password',
    description: 'For editing a user profile',
    categories: ['profile', 'profile-edit', 'forms'],
    src: '/img/screens/layouts-subpages-profile-edit-4.png',
    srcDark: '/img/screens/layouts-subpages-profile-edit-4-dark.png',
    order: 79,
  },
})

// This is the Zod schema for the form input
// It's used to define the shape that the form data will have
const zodSchema = z
  .object({
    currentPassword: z.string().min(1, VALIDATION_TEXT.OLD_PASSWORD_REQUIRED),
    newPassword: z.string(),
    confirmPassword: z.string(),
    twoFactor: z.object({
      enabled: z.boolean(),
      phoneNumber: z.string().optional(),
    }),
    notifications: z
      .object({
        enabled: z.boolean(),
        marketing: z.boolean(),
      })
      .optional(),
  })
  .superRefine((data, ctx) => {
    // This is a custom validation function that will be called
    // before the form is submitted

    if (data.newPassword) {
      if (data.newPassword.length < 8) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: VALIDATION_TEXT.NEW_PASSWORD_LENGTH,
          path: ['newPassword'],
        })
      }
      if (data.newPassword !== data.confirmPassword) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: VALIDATION_TEXT.NEW_PASSWORD_MATCH,
          path: ['confirmPassword'],
        })
      }
    }

    if (data.twoFactor.enabled) {
      if (!data.twoFactor.phoneNumber) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'A phone number is required',
          path: ['twoFactor.phoneNumber'],
        })
      }
    }
  })

// Zod has a great infer method that will
// infer the shape of the schema into a TypeScript type
type FormInput = z.infer<typeof zodSchema>
const authStore = useAuthStore()
const token = useCookie('token')
const { data, pending, error, refresh } = await useFetch('/api/profile')

const validationSchema = toTypedSchema(zodSchema)
const initialValues = computed<FormInput>(() => ({
  currentPassword: '',
  newPassword: '',
  confirmPassword: '',
  twoFactor: {
    enabled: false,
    phoneNumber: '',
  },
  notifications: {
    enabled: true,
    flushLowPriority: true,
    marketing: false,
    partners: false,
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
const fieldsWithErrors = computed(() => Object.keys(errors.value).length)

// Here we register the phone number input with IMask
const phoneInput = ref<any>()
const mask = shallowRef<IMask.InputMask<{ mask: string }> | undefined>(
  undefined,
)
onMounted(() => {
  mask.value = IMask(phoneInput.value?.el, {
    mask: '(000) 000-0000',
  })
})
onBeforeUnmount(() => {
  mask.value?.destroy()
  mask.value = undefined
})

// Reset notifications when the user disables them
watch(
  () => values.notifications?.enabled,
  (value) => {
    if (!value) {
      // @ts-expect-error - vee validate typing bug with nested keys
      setFieldValue('notifications.flushLowPriority', false)
      // @ts-expect-error - vee validate typing bug with nested keys
      setFieldValue('notifications.marketing', false)
      // @ts-expect-error - vee validate typing bug with nested keys
      setFieldValue('notifications.partners', false)
    }
  },
)

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
    console.log('profile-settings-password-success', values)

    try {
      if (values.newPassword != values.confirmPassword) {
        setFieldValue('confirmPassword', 'Passwords do not match')
        return
      }
      const query2 = computed(() => {
        return {
          action: 'updateUserPassword',
          token: token.value,
          id: authStore.user?._id,
        }
      })

      const response = await useFetch('/api/users', {
        method: 'put',
        headers: { 'Content-Type': 'application/json' },
        query: query2,
        body: {
          email: authStore.user?.email,
          oldPassword: values.currentPassword,
          password: values.newPassword,
        },
      })

      if (response.data?.value?.success) {
        success.value = true
        resetForm()
        toaster.clearAll()
        toaster.show({
          title: 'Success',
          message: `Mot de passe mis à jour !`,
          color: 'success',
          icon: 'ph:check',
          closable: true,
        })
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
      // this will set the error on the form
      if (error.message === 'Fake backend validation error') {
        setFieldError('currentPassword', 'Your current password is incorrect')

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
    document.documentElement.scrollTo({
      top: 0,
      behavior: 'smooth',
    })
  },
  (error) => {
    // this callback is optional and called only if the form has errors
    success.value = false

    // here you have access to the error
    console.log('profile-settings-error', error)

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
            Sécurité
          </BaseHeading>
          <BaseText size="xs" class="text-muted-400">
            Modifier les préférences et les paramètres de votre compte
          </BaseText>
        </div>
        <div class="flex items-center gap-2">
          <BaseButton class="w-24" to="/bo/profile">Annuler</BaseButton>
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
            Your settings has been saved!
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
            label="Changer de mot de passe"
            sublabel="Pour une meilleure sécurité du compte"
          >
            <div class="grid grid-cols-12 gap-4">
              <div class="col-span-12">
                <Field
                  v-slot="{ field, errorMessage, handleChange, handleBlur }"
                  name="currentPassword"
                >
                  <BaseInput
                    :model-value="field.value"
                    :error="errorMessage"
                    :disabled="isSubmitting"
                    type="password"
                    icon="ph:lock-duotone"
                    placeholder="Old password"
                    autocomplete="current-password"
                    @update:model-value="handleChange"
                    @blur="handleBlur"
                  />
                </Field>
              </div>
              <div class="col-span-12">
                <Field
                  v-slot="{ field, errorMessage, handleChange, handleBlur }"
                  name="newPassword"
                >
                  <BaseInput
                    :model-value="field.value"
                    :error="errorMessage"
                    :disabled="isSubmitting"
                    type="password"
                    icon="ph:lock-duotone"
                    placeholder="New password"
                    autocomplete="new-password"
                    @update:model-value="handleChange"
                    @blur="handleBlur"
                  />
                </Field>
              </div>
              <div class="col-span-12">
                <Field
                  v-slot="{ field, errorMessage, handleChange, handleBlur }"
                  name="confirmPassword"
                >
                  <BaseInput
                    :model-value="field.value"
                    :error="errorMessage"
                    :disabled="isSubmitting"
                    type="password"
                    icon="ph:lock-duotone"
                    placeholder="Repeat new password"
                    @update:model-value="handleChange"
                    @blur="handleBlur"
                  />
                </Field>
              </div>
            </div>
          </TairoFormGroup>
          <TairoFormGroup
            label="Auth à 2 facteurs"
            sublabel="Authentification à double facteur"
          >
            <div class="grid grid-cols-12 gap-4">
              <div class="col-span-12">
                <Field
                  v-slot="{ field, handleChange, handleBlur }"
                  name="twoFactor.enabled"
                >
                  <BaseSwitchThin
                    :model-value="field.value"
                    :disabled="isSubmitting"
                    label="Enabled"
                    sublabel="Toggle 2 factor authentication"
                    color="primary"
                    @update:model-value="handleChange"
                    @blur="handleBlur"
                  />
                </Field>
              </div>
              <div v-show="values.twoFactor?.enabled" class="col-span-12">
                <Field
                  v-slot="{ field, errorMessage, handleChange, handleBlur }"
                  name="twoFactor.phoneNumber"
                >
                  <BaseInput
                    ref="phoneInput"
                    :model-value="field.value"
                    :error="errorMessage"
                    :disabled="isSubmitting"
                    type="tel"
                    icon="ph:phone-duotone"
                    placeholder="Phone number"
                    autocomplete="tel"
                    @update:model-value="handleChange"
                    @blur="handleBlur"
                  />
                </Field>
              </div>
            </div>
          </TairoFormGroup>
          <TairoFormGroup
            label="Notifications"
            sublabel="Configure how you receive notifications"
          >
            <div class="grid grid-cols-12 gap-4">
              <div class="col-span-12">
                <Field
                  v-slot="{ field, handleChange, handleBlur }"
                  name="notifications.enabled"
                >
                  <BaseSwitchBall
                    :model-value="field.value"
                    :disabled="isSubmitting"
                    label="Enabled"
                    sublabel="Receive emails notifications from the app"
                    color="primary"
                    @update:model-value="handleChange"
                    @blur="handleBlur"
                  />
                </Field>
              </div>
              <div v-show="values.notifications?.enabled" class="col-span-12">
                <Field
                  v-slot="{ field, handleChange, handleBlur }"
                  name="notifications.marketing"
                >
                  <BaseSwitchBall
                    :model-value="field.value"
                    :disabled="isSubmitting"
                    label="Marketing"
                    sublabel="Enable marketing emails"
                    color="primary"
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
