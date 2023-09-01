<script setup lang="ts">
import { toTypedSchema } from '@vee-validate/zod'
import { Field, useFieldError, useForm } from 'vee-validate'
import { MaybeRefOrGetter } from 'vue'
import { z } from 'zod'

definePageMeta({
  title: 'Nouvelle Organisation',
  layout: 'empty',
  preview: {
    title: 'Nouvelle Organisation',
    description: 'For forms and input fields',
    categories: ['org', 'forms'],
    src: '/img/screens/layouts-form-1.png',
    srcDark: '/img/screens/layouts-form-1-dark.png',
    order: 47,
  },
})

const router = useRouter()

const countries = [
  {
    id: '1',
    abbr: 'CMR',
    name: 'Cameroun',
    flag: '/img/icons/flags/cmr.svg',
  },
  {
    id: '2',
    abbr: 'CIV',
    name: "Côte d'ivoire",
    flag: '/img/icons/flags/civ.svg',
  },
  {
    id: '3',
    abbr: 'FR',
    name: 'France',
    flag: '/img/icons/flags/france.svg',
  },
]

// This is the object that will contain the validation messages
const ONE_MB = 1000000
const VALIDATION_TEXT = {
  NAME_REQUIRED: "Company name can't be empty",
  EMAIL_REQUIRED: "Email address can't be empty",
  OPTION_REQUIRED: 'Please select an option',
  MANAGER_REQUIRED: 'Please select a manager',
  STATUS_REQUIRED: 'Pick a status',
  AVATAR_TOO_BIG: `Avatar size must be less than 1MB`,
}

// This is the Zod schema for the form input
// It's used to define the shape that the form data will have
const zodSchema = z
  .object({
    company: z.object({
      name: z.string().min(1, VALIDATION_TEXT.NAME_REQUIRED),
      email: z.string().min(1, VALIDATION_TEXT.EMAIL_REQUIRED),
      website: z.string().optional(),
      city: z.string().optional(),
      address: z.string().optional(),
      status: z.union([z.literal('active'), z.literal('inactive')]).nullable(),
      type: z.union([z.literal('npo'), z.literal('po')]).nullable(),
      country: z.object({
        abbr: z.string(),
        name: z.string(),
        flag: z.string(),
      }),
      description: z.string().optional(),
      medias: z.object({
        logo: z.string(),
        cover: z.string(),
      }),
      active: z.boolean(),
    }),
  })
  .superRefine((data, ctx) => {
    // This is a custom validation function that will be called
    // before the form is submitted
    if (!data.company.name) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: VALIDATION_TEXT.NAME_REQUIRED,
        path: ['company.name'],
      })
    }
  })

// Zod has a great infer method that will
// infer the shape of the schema into a TypeScript type
type FormInput = z.infer<typeof zodSchema>

const validationSchema = toTypedSchema(zodSchema)
const initialValues = computed<FormInput>(() => ({
  company: {
    name: '',
    email: '',
    website: '',
    status: null,
    type: null,
    country: {
      abbr: '',
      name: '',
      flag: '',
    },
    description: '',
    medias: {
      logo: '',
      cover: '',
    },
    active: false,
  },
}))

// This is the computed value that will be used to display the current avatar
const currentAvatar = computed(() => '/img/avatars/company.svg')
const companyLogo = ref<File | null>(null)
const companyCover = ref<File | null>(null)
const filePreview = useNinjaFilePreview(() => companyLogo.value)
const companyCoverPreview = useNinjaFilePreview(() => companyCover.value)
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
const inputFileCover = ref<FileList | null>(null)
const fileError = useFieldError('avatar')
watch(inputFile, (value) => {
  const file = value?.item(0) || null
  companyLogo.value = file
  console.log('companyLogo.value')
  console.log(companyLogo.value)
})

watch(inputFileCover, (value) => {
  const file = value?.item(0) || null
  companyCover.value = file
  console.log('companyCover.value')
  console.log(companyCover.value)
})

// Ask the user for confirmation before leaving the page if the form has unsaved changes
onBeforeRouteLeave(() => {
  if (meta.value.dirty) {
    return confirm('You have unsaved changes. Are you sure you want to leave?')
  }
})

const slugify = (str) =>
  str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')

const toaster = useToaster()

// This is where you would send the form data to the server
const onSubmit = handleSubmit(
  async (values) => {
    success.value = false

    // here you have access to the validated form values
    console.log('company-create-success', values)
    //create org

    //upload files
    try {
      const fd = new FormData()
      fd.append('0', companyLogo.value)
      fd.append('1', companyCover.value)
      const slug = slugify(values.company.name)
      console.log(slug)

      const query = computed(() => {
        return {
          action: 'new-org',
          slug: slug
        }
      })

      const { data, pending, error, refresh } = await useFetch(
        '/api/files/upload',
        {
          method: 'POST',
          query,
          body: fd,
        },
      )

      if (data.value) {
        console.log(data)
      }

      // fake delay, this will make isSubmitting value to be true
      await new Promise((resolve, reject) => {
        if (values.company.name === 'Airbnb') {
          // simulate a backend error
          setTimeout(
            () => reject(new Error('Fake backend validation error')),
            2000,
          )
        }
        setTimeout(resolve, 4000)
      })

      toaster.clearAll()
      toaster.show({
        title: 'Success',
        message: `Record has been created!`,
        color: 'success',
        icon: 'ph:check',
        closable: true,
      })
      // router.push('/select-org')
    } catch (error: any) {
      console.log(error)
      // this will set the error on the form
      if (error.message === 'Fake backend validation error') {
        // @ts-expect-error - vee validate typing bug with nested keys
        setFieldError('company.name', 'This name is not allowed')

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

    resetForm()

    document.documentElement.scrollTo({
      top: 0,
      behavior: 'smooth',
    })

    success.value = true
    setTimeout(() => {
      success.value = false
    }, 3000)
  },
  (error) => {
    // this callback is optional and called only if the form has errors
    success.value = false

    // here you have access to the error
    console.log('company-create-error', error)

    // you can use it to scroll to the first error
    document.documentElement.scrollTo({
      top: 0,
      behavior: 'smooth',
    })
  },
)
</script>

<template>
  <div class="bg-muted-100 dark:bg-muted-900 min-h-screen">
    <div
      class="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-4"
    >
      <NuxtLink
        to="/"
        class="text-muted-400 hover:text-primary-500 dark:text-muted-700 dark:hover:text-primary-500 transition-colors duration-300"
      >
        <TairoLogo class="h-10 w-10" />
      </NuxtLink>
      <div class="flex items-center gap-4">
        <BaseThemeToggle />
      </div>
    </div>
    <div class="mx-auto max-w-7xl px-4 py-10">
      <div
        class="mb-4 flex flex-col justify-between md:flex-row md:items-center"
      >
        <div
          class="ltablet:max-w-full flex max-w-[425px] flex-col items-center gap-4 text-center md:flex-row md:text-left lg:max-w-full"
        >
          <div>
            <BaseHeading
              as="h2"
              size="xl"
              weight="light"
              lead="tight"
              class="text-muted-800 dark:text-white"
            >
              <span>Nouvelle Organisation</span>
            </BaseHeading>
            <BaseParagraph size="sm">
              <span class="text-muted-500">
                Création d'une nouvelle oorganisation
              </span>
            </BaseParagraph>
          </div>
        </div>
        <div
          class="mt-4 flex items-center justify-center gap-2 md:mt-0 md:justify-start"
        >
          <BaseButtonAction @click.prevent="$router.back()">
            <Icon name="lucide:arrow-left" class="h-3 w-3" />
            <span>Retour</span>
          </BaseButtonAction>
        </div>
      </div>
      <BaseCard>
        <form
          method="POST"
          action=""
          class="divide-muted-200 dark:divide-muted-700 grid divide-x sm:grid-cols-2"
          @submit.prevent="onSubmit"
        >
          <div
            shape="curved"
            class="bg-muted-50 dark:bg-muted-800/60 space-y-8 p-10"
          >
            <div class="mx-auto flex w-full max-w-[410px] flex-col">
              <div>
                <div>
                  <div
                    class="relative mb-5 flex flex-col items-center justify-center gap-4"
                  >
                    <BaseFullscreenDropfile
                      icon="ph:image-duotone"
                      :filter-file-dropped="
                        (file) => file.type.startsWith('image')
                      "
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
                      <div class="relative h-20 w-20">
                        <img
                          v-if="filePreview"
                          :src="filePreview"
                          alt="Upload preview"
                          class="bg-muted-200 dark:bg-muted-700/60 h-20 w-20 rounded-full object-cover object-center"
                        />
                        <img
                          v-else
                          :src="currentAvatar"
                          alt="Upload preview"
                          class="bg-muted-200 dark:bg-muted-700/60 h-20 w-20 rounded-full object-cover object-center dark:invert"
                        />
                        <div
                          v-if="companyLogo?.name"
                          class="absolute bottom-0 end-0 z-20"
                        >
                          <BaseButtonIcon
                            condensed
                            shape="full"
                            @click="companyLogo = null"
                            data-tooltip="Remove image"
                            class="scale-90"
                          >
                            <Icon name="lucide:x" class="h-4 w-4" />
                          </BaseButtonIcon>
                        </div>
                        <div v-else class="absolute bottom-0 end-0 z-20">
                          <div class="relative" data-tooltip="Upload image">
                            <BaseButtonIcon
                              condensed
                              shape="full"
                              @click="open"
                            >
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
                  <div class="grid grid-cols-12 gap-4">
                    <div class="ltablet:col-span-6 col-span-12 lg:col-span-6">
                      <Field
                        v-slot="{
                          field,
                          errorMessage,
                          handleChange,
                          handleBlur,
                        }"
                        name="company.name"
                      >
                        <BaseInput
                          label="Nom de l'organisation"
                          placeholder="Communauté Bandjoun"
                          :model-value="field.value"
                          :error="errorMessage"
                          :disabled="isSubmitting"
                          type="text"
                          @update:model-value="handleChange"
                          @blur="handleBlur"
                        />
                      </Field>
                    </div>
                    <div class="ltablet:col-span-6 col-span-12 lg:col-span-6">
                      <Field
                        v-slot="{
                          field,
                          errorMessage,
                          handleChange,
                          handleBlur,
                        }"
                        name="company.email"
                      >
                        <BaseInput
                          label="Email de l'organisation"
                          placeholder="Ex: cb@acme.co"
                          :model-value="field.value"
                          :error="errorMessage"
                          :disabled="isSubmitting"
                          type="email"
                          @update:model-value="handleChange"
                          @blur="handleBlur"
                        />
                      </Field>
                    </div>
                    <div class="col-span-12">
                      <Field
                        v-slot="{
                          field,
                          errorMessage,
                          handleChange,
                          handleBlur,
                        }"
                        name="company.website"
                      >
                        <BaseInput
                          icon="lucide:globe"
                          label="Site web de l'organisation"
                          placeholder="Ex: https://cb.co"
                          :model-value="field.value"
                          :error="errorMessage"
                          :disabled="isSubmitting"
                          type="text"
                          @update:model-value="handleChange"
                          @blur="handleBlur"
                        />
                      </Field>
                    </div>
                  </div>
                  <div class="grid grid-cols-12 gap-4 mt-4">
                    <div class="col-span-12 sm:col-span-6">
                      <Field
                        v-slot="{
                          field,
                          errorMessage,
                          handleChange,
                          handleBlur,
                        }"
                        name="doctor.address"
                      >
                        <BaseInput
                          label="Adresse"
                          icon="ph:map-pin-duotone"
                          placeholder="Ex: Bonapriso"
                          :model-value="field.value"
                          :error="errorMessage"
                          :disabled="isSubmitting"
                          @update:model-value="handleChange"
                          @blur="handleBlur"
                        />
                      </Field>
                    </div>
                    <div class="col-span-12 sm:col-span-6">
                      <Field
                        v-slot="{
                          field,
                          errorMessage,
                          handleChange,
                          handleBlur,
                        }"
                        name="doctor.city"
                      >
                        <BaseInput
                          label="Ville"
                          icon="ph:buildings-duotone"
                          placeholder="Ex: Douala"
                          :model-value="field.value"
                          :error="errorMessage"
                          :disabled="isSubmitting"
                          type="text"
                          @update:model-value="handleChange"
                          @blur="handleBlur"
                        />
                      </Field>
                    </div>
                    <div class="col-span-12">
                      <Field
                        v-slot="{
                          field,
                          errorMessage,
                          handleChange,
                          handleBlur,
                        }"
                        name="company.country"
                      >
                        <BaseListbox
                          label="Pays"
                          :items="countries"
                          :properties="{
                            value: 'id',
                            label: 'abbr',
                            sublabel: 'name',
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
                  <div class="mb-6 mt-4">
                    <label class="nui-label pb-2 text-[0.825rem]"
                      >Type d'organiation</label
                    >
                    <div
                      class="ptablet:grid-cols-2 ltablet:grid-cols-2 grid gap-4 lg:grid-cols-2"
                    >
                      <Field
                        v-slot="{
                          field,
                          errorMessage,
                          handleChange,
                          handleBlur,
                        }"
                        name="company.type"
                      >
                        <BaseRadioHeadless
                          value="npo"
                          :model-value="field.value"
                          :error="errorMessage"
                          :disabled="isSubmitting"
                          @update:model-value="handleChange"
                          @blur="handleBlur"
                        >
                          <BaseCard
                            shape="rounded"
                            class="text-muted-400 peer-checked:!border-primary-500 peer-checked:[&_.child]:!text-primary-500 relative border-2 px-2 py-4 grayscale peer-checked:grayscale-0"
                          >
                            <div
                              class="flex w-full flex-col items-center gap-2 text-center"
                            >
                              <Icon
                                name="ph:house-simple-duotone"
                                class="child mx-auto h-5 w-5"
                              />

                              <div>
                                <BaseHeading
                                  as="h4"
                                  size="sm"
                                  weight="medium"
                                  lead="none"
                                >
                                  OBNL
                                </BaseHeading>

                                <BaseText size="xs" class="text-muted-400"
                                  >Organisation à But Non Lucratif</BaseText
                                >
                              </div>

                              <div
                                class="child text-muted-300 absolute right-2 top-2 ms-auto"
                              >
                                <div
                                  class="h-2 w-2 rounded-full bg-current"
                                ></div>
                              </div>
                            </div>
                          </BaseCard>
                        </BaseRadioHeadless>
                      </Field>

                      <Field
                        v-slot="{
                          field,
                          errorMessage,
                          handleChange,
                          handleBlur,
                        }"
                        name="company.type"
                      >
                        <BaseRadioHeadless
                          value="po"
                          :model-value="field.value"
                          :error="errorMessage"
                          :disabled="isSubmitting"
                          @update:model-value="handleChange"
                          @blur="handleBlur"
                        >
                          <BaseCard
                            shape="rounded"
                            class="text-muted-400 peer-checked:!border-primary-500 peer-checked:[&_.child]:!text-primary-500 relative border-2 px-2 py-4 grayscale peer-checked:grayscale-0"
                          >
                            <div
                              class="flex w-full flex-col items-center gap-2 text-center"
                            >
                              <Icon
                                name="ph:buildings-duotone"
                                class="child mx-auto h-5 w-5"
                              />

                              <div>
                                <BaseHeading
                                  as="h4"
                                  size="sm"
                                  weight="medium"
                                  lead="none"
                                >
                                  OBL
                                </BaseHeading>

                                <BaseText size="xs" class="text-muted-400"
                                  >Organisation à But Lucratif</BaseText
                                >
                              </div>

                              <div
                                class="child text-muted-300 absolute right-2 top-2 ms-auto"
                              >
                                <div
                                  class="h-2 w-2 rounded-full bg-current"
                                ></div>
                              </div>
                            </div>
                          </BaseCard>
                        </BaseRadioHeadless>
                      </Field>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div shape="curved" class="w-full space-y-8 p-10">
            <div class="mx-auto w-full max-w-[410px]">
              <div class="col-span-12 grid grid-cols-12">
                <div class="col-span-12 sm:col-span-12">
                  <BaseInputFileHeadless
                    accept="image/*"
                    v-model="inputFileCover"
                    v-slot="{ open, remove, preview, drop, files }"
                  >
                    <!-- Controls -->
                    <div class="mb-4 flex items-center gap-2">
                      <label class="nui-label text-[0.825rem]"
                        >Image de couverture</label
                      >
                      <button
                        type="button"
                        class="nui-focus border-muted-200 hover:border-primary-500 text-muted-700 dark:text-muted-200 hover:text-primary-600 dark:border-muted-700 dark:bg-muted-800 dark:hover:border-primary-500 dark:hover:text-primary-600 relative flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border bg-white transition-colors duration-300"
                        tooltip="Select files"
                        @click="open"
                      >
                        <Icon
                          name="lucide:plus"
                          class="absolute start-1/2 top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2"
                        />
                        <span class="sr-only">Selectionner les fichiers</span>
                      </button>
                      <button
                        type="button"
                        class="nui-focus border-muted-200 hover:border-primary-500 text-muted-700 dark:text-muted-200 hover:text-primary-600 dark:border-muted-700 dark:bg-muted-800 dark:hover:border-primary-500 dark:hover:text-primary-600 relative flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border bg-white transition-colors duration-300"
                        tooltip="Start Upload"
                      >
                        <Icon name="lucide:arrow-up" class="h-4 w-4" />

                        <span class="sr-only">Importer</span>
                      </button>
                    </div>
                    <div
                      class=""
                      @dragenter.stop.prevent
                      @dragover.stop.prevent
                      @drop="drop"
                    >
                      <div
                        v-if="!companyCover?.name"
                        class="nui-focus border-muted-300 dark:border-muted-700 hover:border-muted-400 focus:border-muted-400 dark:hover:border-muted-600 dark:focus:border-muted-700 group cursor-pointer rounded-lg border-[3px] border-dashed p-8 transition-colors duration-300"
                        tabindex="0"
                        role="button"
                        @click="open"
                        @keydown.enter.prevent="open"
                      >
                        <div class="p-5 text-center">
                          <Icon
                            name="mdi-light:cloud-upload"
                            class="text-muted-400 group-hover:text-primary-500 group-focus:text-primary-500 mb-2 h-10 w-10 transition-colors duration-300"
                          />
                          <h4 class="text-muted-400 font-sans text-sm">
                            Drop files to upload
                          </h4>
                          <div>
                            <span
                              class="text-muted-400 font-sans text-[0.7rem] font-semibold uppercase"
                            >
                              Or
                            </span>
                          </div>
                          <label
                            for="file"
                            class="text-muted-400 group-hover:text-primary-500 group-focus:text-primary-500 cursor-pointer font-sans text-sm underline underline-offset-4 transition-colors duration-300"
                          >
                            Select files
                          </label>
                        </div>
                      </div>

                      <ul v-else class="mt-6 space-y-2">
                        <li v-if="companyCoverPreview">
                          <div
                            class="border-muted-200 dark:border-muted-700 dark:bg-muted-800 relative gap-2 rounded-xl border bg-white p-3"
                          >
                            <div class="flex items-center gap-2">
                              <div class="shrink-0">
                                <img
                                  class="h-40 w-40 rounded-xl object-cover object-center"
                                  v-if="companyCoverPreview"
                                  :src="companyCoverPreview"
                                  alt="Image preview"
                                />
                                <img
                                  v-else
                                  class="h-40 w-40 rounded-xl object-cover object-center"
                                  src="/img/avatars/placeholder-file.png"
                                  alt="Image preview"
                                />
                              </div>
                              <div class="font-sans">
                                <span
                                  class="text-muted-800 dark:text-muted-100 line-clamp-1 block text-sm"
                                >
                                  {{ companyCover?.name }}
                                </span>
                                <span class="text-muted-400 block text-xs">
                                  {{ formatFileSize(companyCover?.size) }}
                                </span>
                              </div>
                            </div>
                            <div class="flex mt-4 justify-between">
                              <div
                                class="w-32 mt-4 px-4 transition-opacity duration-300"
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
                                  @click.prevent="companyCover = null"
                                >
                                  <Icon name="lucide:x" class="h-4 w-4" />
                                  <span class="sr-only">Remove</span>
                                </button>
                              </div>
                            </div>
                          </div>
                        </li>
                      </ul>
                    </div>
                  </BaseInputFileHeadless>
                </div>
              </div>
              <div class="grid grid-cols-12 gap-4 mt-4">
                <div class="col-span-12">
                  <Field
                    v-slot="{ field, errorMessage, handleChange, handleBlur }"
                    name="company.description"
                  >
                    <BaseTextarea
                      label="Description"
                      placeholder="Ecrivez quelque chose..."
                      :model-value="field.value"
                      :error="errorMessage"
                      :disabled="isSubmitting"
                      @update:model-value="handleChange"
                      @blur="handleBlur"
                    />
                  </Field>
                </div>
              </div>
              <div
                class="mt-5 flex flex-col-reverse text-right md:block md:space-x-3"
              >
                <BaseButton
                  type="submit"
                  color="primary"
                  class="!h-12 w-full sm:w-44"
                >
                  Créer l'organiation
                </BaseButton>
              </div>
            </div>
          </div>
        </form>
      </BaseCard>
    </div>
  </div>
</template>
