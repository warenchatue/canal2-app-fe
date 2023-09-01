<script setup lang="ts">
import { toTypedSchema } from '@vee-validate/zod'
import { Field, useFieldError, useForm } from 'vee-validate'
import { z } from 'zod'
import type { Donation } from '~/types/donation'

definePageMeta({
  title: 'Contribution',
  description: 'The Digital Innova Funding platform',
  breadcrumb: {
    label: 'Dinno-Fund',
  },
  layout: 'empty',
})
const { y } = useNinjaWindowScroll()
const auth = useAuthStore()
const app = useAppStore()

// This is the object that will contain the validation messages
const ONE_MB = 1000000
const VALIDATION_TEXT = {
  AMOUNT_REQUIRED: "First name can't be empty",
  TYPE_REQUIRED: 'Vous devez préciser la visibilité de votre don',
  FIRSTNAME_REQUIRED: "First name can't be empty",
  LASTNAME_REQUIRED: "Last name can't be empty",
  EMAIL_REQUIRED: "Email address can't be empty",
  OPTION_REQUIRED: 'Please select an option',
  ADDRESS_REQUIRED: 'Please enter an address',
  CITY_REQUIRED: 'Please enter a city',
  STATE_REQUIRED: 'Please enter a state',
  ZIPCODE_REQUIRED: 'Please enter a zipcode',
  STATUS_REQUIRED: 'Pick a status',
  AVATAR_TOO_BIG: `Avatar size must be less than 1MB`,
}

// This is the Zod schema for the form input
// It's used to define the shape that the form data will have
const zodSchema = z
  .object({
    amount: z.number().positive(),
    comments: z.string().optional(),
    status: z.string().optional(),
    type: z.union([
      z.literal('public'),
      z.literal('anonymous'),
      z.literal('private'),
    ]),
    donor: z.object({
      firstName: z.string(),
      lastName: z.string(),
      email: z.string(),
      address: z.string(),
      city: z.string(),
      country: z.object({
        abbr: z.string(),
        name: z.string(),
        flag: z.string(),
      }),
      medias: z.object({
        cover: z.string().optional(),
        logo: z.string().optional(),
      }),
    }),
  })
  .superRefine((data, ctx) => {
    // This is a custom validation function that will be called
    // before the form is submitted
    // if (data.donor.medias.logo && data.donor.media.logo.size > ONE_MB) {
    //   ctx.addIssue({
    //     code: z.ZodIssueCode.custom,
    //     message: VALIDATION_TEXT.AVATAR_TOO_BIG,
    //     path: ['avatar'],
    //   })
    // }
    if (!data.amount) {
      isShowAmount.value = true
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: VALIDATION_TEXT.AMOUNT_REQUIRED,
        path: ['amount'],
      })
    }

    if (!data.type) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: VALIDATION_TEXT.TYPE_REQUIRED,
        path: ['type'],
      })
    }
  })

// Zod has a great infer method that will
// infer the shape of the schema into a TypeScript type
type FormInput = z.infer<typeof zodSchema>

const validationSchema = toTypedSchema(zodSchema)
const initialValues = computed<FormInput>(() => ({
  amount: 0,
  comments: '',
  status: 'pending',
  type: 'public',
  donor: {
    firstName: '',
    lastName: '',
    email: '',
    address: '',
    city: '',
    country: {
      abbr: '',
      name: '',
      flag: '',
    },
    medias: {
      cover: '',
      logo: '',
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

const router = useRouter()
const route = useRoute()
const orgStore = useOrgStore()
const txnStore = useTransactionStore()
const success = ref(false)
const isShowAmount = ref(false)
const fieldsWithErrors = computed(() => Object.keys(errors.value).length)
const slug = computed(() => route.params.slug)
const query = computed(() => {
  return {
    slug: slug.value,
    action: 'get',
  }
})

const { data, pending, error, refresh } = await useFetch('/api/orgs', {
  method: 'get',
  headers: { 'Content-Type': 'application/json' },
  query: query,
})

const type = ref('')
const org = ref({ id: '' })
const projectInfo = ref({ id: '' })

console.log(data?.value)
if (data?.value?.org) {
  await orgStore.setActiveOrg({ ...data?.value?.org } as Org)
  org.value = orgStore.activeOrg
  console.log(orgStore.activeOrg)
  type.value = 'donation'
} else {
  const { data: projectData, pending: projectPending } = await useFetch(
    '/api/funds-raising',
    {
      query,
    },
  )

  if (projectData?.value?.project) {
    await orgStore.setActiveOrg({ ...projectData?.value?.project.owner } as Org)
    org.value = projectData?.value?.project.owner
    projectInfo.value = projectData?.value?.project
    console.log(projectData.value)
    type.value = 'fund-raising'
  }
}
const amounts = [500, 1000, 5000, 10000, 25000, 50000, 75000, 100000]
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

// BaseInputFileHeadless gives us a list file input, but we need to
// extract the file from the list and set it to the form
const inputFile = ref<FileList | null>()
const fileError = useFieldError('donor.medias.logo')
// watch(inputFile, (value) => {
//   const file = value?.item(0) || null
//   setFieldValue('donor.medias.logo', file)
// })

// Ask the user for confirmation before leaving the page if the form has unsaved changes
onBeforeRouteLeave(() => {
  if (meta.value.dirty) {
    return confirm('You have unsaved changes. Are you sure you want to leave?')
  }
})

const toaster = useToaster()

// This is where you would send the form data to the server
const onSubmit = handleSubmit(
  async (values) => {
    success.value = false

    // here you have access to the validated form values
    console.log('donor-create-success', values)

    try {
      // fake delay, this will make isSubmitting value to be true
      values.status = 'pending'
      const donationId = Math.random().toString(36).substring(2, 7)
      const txnId = 'txn-' + Math.random().toString(36).substring(2, 7)
      // create donation
      // const donation = ref<Donation>({
      //   ...values,
      //   id: donationId,
      //   orgId: orgStore.activeOrg.id,
      // })
      await orgStore.addDonation({
        ...values,
        id: donationId,
        orgId: orgStore.activeOrg.id,
      } as Donation)

      if (type.value.toString() == 'donation') {
        // create txn
        await txnStore.addTxn({
          id: txnId,
          amount: values.amount,
          status: 'pending',
          date: new Date().toLocaleDateString('en-GB'),
          type: 'donation',
          typeId: donationId,
        })
      } else if (type.value.toString() == 'fund-raising') {
        values.status = 'pending'
        // create donation
        await orgStore.addCampaignDonation(projectInfo.value.id, {
          ...values,
          id: donationId,
          orgId: orgStore.activeOrg.id,
        } as Donation)
        // create txn
        await txnStore.addTxn({
          id: txnId,
          amount: values.amount,
          status: 'pending',
          date: new Date().toLocaleDateString('en-GB'),
          type: 'fund-raising',
          typeId: donationId,
        })
      }
      console.log(orgStore.activeOrg)

      await new Promise((resolve, reject) => {
        if (false) {
          // simulate a backend error
          setTimeout(
            () => reject(new Error('Fake backend validation error')),
            2000,
          )
        }
        setTimeout(resolve, 500)
      })

      toaster.clearAll()
      toaster.show({
        title: 'Success',
        message: `Redirection vers la plateforme de paiement!`,
        color: 'success',
        icon: 'ph:check',
        closable: true,
      })
      router.push('/payment/' + txnId)
      // redirect to the payment platform
    } catch (error: any) {
      console.log(error)
      // this will set the error on the form
      if (error.message === 'Fake backend validation error') {
        // @ts-expect-error - vee validate typing bug with nested keys
        setFieldError('donor.type', 'We have too many cardiologists')

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
    console.log('donor-create-error', error)

    // you can use it to scroll to the first error
    document.documentElement.scrollTo({
      top: 0,
      behavior: 'smooth',
    })
  },
)
</script>

<template>
  <div class="group/landing overflow-hidden" :class="y > 60 ? 'scrolled' : ''">
    <InnerPageHero
      class="inset-0"
      :title="'Contribution'"
      :image-url="'https://img.freepik.com/premium-photo/office-blue-desk-equipment-working-top-view-flat-lay-blue-background_38937-393.jpg'"
    />
    <LandingOrgNavbar :org-slug="app.activeOrg?.slug ?? data?.org?.slug" />
    <TairoContentWrapper
      class="mx-5 mb-5 flex flex-col justify-center md:mx-10"
    >
      <BaseText size="xl" class="dark:text-muted-200 py-5 text-center">
        Choisissez le montant que vous souhaitez contribuer

        <span class="text-primary-600" v-if="org.name"
          >pour {{ org.name }}</span
        >
      </BaseText>

      <BaseText
        size="md"
        v-if="type == 'fund-raising'"
        class="dark:text-muted-200 pb-2 text-center"
      >
        Collecte de fonds pour :
        <span class="text-primary-600">{{ projectInfo.name }}</span>
      </BaseText>

      <div class="flex justify-center">
        <div class="py-5">
          <div>
            <div :text="'Choisir le montant'" class="capitalize" />
            <div
              class="ptablet:grid-cols-4 ltablet:grid-cols-8 grid grid-cols-4 gap-4 lg:grid-cols-8"
            >
              <Field
                v-for="(item, index) in amounts"
                :key="index"
                v-slot="{ field, errorMessage, handleChange, handleBlur }"
                name="amount"
              >
                <BaseRadioHeadless
                  :value="item"
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
                    <div class="flex flex-col items-center gap-2 text-center">
                      <Icon name="ph:money" class="child mx-auto h-5 w-5" />

                      <div>
                        <BaseHeading
                          as="h4"
                          size="sm"
                          weight="medium"
                          lead="none"
                        >
                          {{
                            new Intl.NumberFormat('fr-FR', {
                              maximumSignificantDigits: 3,
                            }).format(item)
                          }}
                        </BaseHeading>

                        <BaseText size="xs" class="text-muted-400"
                          >XAF</BaseText
                        >
                      </div>

                      <div
                        class="child text-muted-300 absolute right-2 top-2 ms-auto"
                      >
                        <div class="h-2 w-2 rounded-full bg-current"></div>
                      </div>
                    </div>
                  </BaseCard>
                </BaseRadioHeadless>
              </Field>
            </div>
            <div class="my-2 flex justify-center pt-5">
              <BaseButton
                @click.prevent="isShowAmount = true"
                shape="rounded"
                class="py-4"
              >
                <span>Autre montant</span>
              </BaseButton>
            </div>
            <div class="flex justify-center py-5">
              <Field
                v-if="isShowAmount"
                v-slot="{ field, errorMessage, handleChange, handleBlur }"
                name="amount"
              >
                <BaseInput
                  icon="ph:money"
                  placeholder="25 000"
                  :model-value="field.value"
                  :error="errorMessage"
                  :disabled="isSubmitting"
                  type="number"
                  @update:model-value="handleChange"
                  @blur="handleBlur"
                />
              </Field>
            </div>
          </div>
        </div>
      </div>
      <form
        action=""
        method="POST"
        @submit.prevent="onSubmit"
        class="grid grid-cols-12 gap-6"
      >
        <div class="ltablet:col-span-8 col-span-12 lg:col-span-8">
          <BaseCard shape="rounded" class="p-4 md:p-8">
            <div class="grid grid-cols-1 gap-4 gap-y-2 text-sm lg:grid-cols-12">
              <div
                class="ltablet:col-span-9 col-span-9 space-y-10 lg:col-span-9"
              >
                <TairoFormGroup
                  label="Informations Générales"
                  sublabel="NB: Les champs succedés de ' * ' sont obligatoires.'"
                >
                  <div class="grid grid-cols-12 gap-4">
                    <div class="col-span-12 md:col-span-6">
                      <Field
                        v-slot="{
                          field,
                          errorMessage,
                          handleChange,
                          handleBlur,
                        }"
                        name="donor.lastName"
                      >
                        <BaseInput
                          label="Nom *"
                          icon="ph:user-duotone"
                          placeholder="Ex: Doe"
                          :model-value="field.value"
                          :error="errorMessage"
                          :disabled="isSubmitting"
                          type="text"
                          @update:model-value="handleChange"
                          @blur="handleBlur"
                        />
                      </Field>
                    </div>
                    <div class="col-span-12 md:col-span-6">
                      <Field
                        v-slot="{
                          field,
                          errorMessage,
                          handleChange,
                          handleBlur,
                        }"
                        name="donor.firstName"
                      >
                        <BaseInput
                          label="Prenom"
                          icon="ph:user-duotone"
                          placeholder="Ex: John"
                          :model-value="field.value"
                          :error="errorMessage"
                          :disabled="isSubmitting"
                          type="text"
                          @update:model-value="handleChange"
                          @blur="handleBlur"
                        />
                      </Field>
                    </div>

                    <div class="col-span-12 md:col-span-6">
                      <Field
                        v-slot="{
                          field,
                          errorMessage,
                          handleChange,
                          handleBlur,
                        }"
                        name="donor.email"
                      >
                        <BaseInput
                          label="Adresse email"
                          icon="ph:envelope-duotone"
                          placeholder="Ex: johndoe@gmail.com"
                          :model-value="field.value"
                          :error="errorMessage"
                          :disabled="isSubmitting"
                          type="email"
                          @update:model-value="handleChange"
                          @blur="handleBlur"
                        />
                      </Field>
                    </div>

                    <div class="col-span-12 md:col-span-6">
                      <Field
                        v-slot="{
                          field,
                          errorMessage,
                          handleChange,
                          handleBlur,
                        }"
                        name="type"
                      >
                        <BaseSelect
                          label="Visibilité du don *"
                          icon="ph:funnel"
                          :model-value="field.value"
                          :error="errorMessage"
                          :disabled="isSubmitting"
                          @update:model-value="handleChange"
                          @blur="handleBlur"
                        >
                          <option value="" hidden></option>
                          <option value="public">Publique</option>
                          <option value="anonymous">Anonyme</option>
                          <option value="private">Privé</option>
                        </BaseSelect>
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
                        name="comments"
                      >
                        <BaseTextarea
                          label="Commentaires"
                          placeholder="Ex: pour soutenir ma communauté"
                          rows="3"
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

                <TairoFormGroup
                  label="Autres Informations"
                  sublabel="Nous voulons  en savoir plus  sur vous"
                >
                  <div class="grid grid-cols-12 gap-4">
                    <div class="col-span-12">
                      <Field
                        v-slot="{
                          field,
                          errorMessage,
                          handleChange,
                          handleBlur,
                        }"
                        name="donor.address"
                      >
                        <BaseInput
                          label="Adresse / Qaurtier"
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
                        name="donor.city"
                      >
                        <BaseInput
                          label="Ville"
                          icon="ph:buildings-duotone"
                          placeholder="Ex: Douaa"
                          :model-value="field.value"
                          :error="errorMessage"
                          :disabled="isSubmitting"
                          type="text"
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
                        name="donor.country"
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
                </TairoFormGroup>

                <div class="text-right md:col-span-5">
                  <div
                    class="-mt-4 inline-flex w-full items-center justify-end gap-2 sm:w-auto"
                  >
                    <BaseButton
                      type="submit"
                      color="primary"
                      class="!h-12 w-full sm:w-40"
                    >
                      Proceder
                    </BaseButton>
                  </div>
                </div>
              </div>
            </div>
          </BaseCard>
        </div>
        <div class="ltablet:col-span-4 col-span-12 lg:col-span-4">
          <BaseCard class="ptablet:p-8 p-6 lg:p-8">
            <BaseText
              size="xs"
              weight="medium"
              class="text-muted-400 mb-6 block uppercase tracking-wider"
              >Carte de don #2023_07_02_45</BaseText
            >
            <div class="mb-2 flex">
              <div class="grow">
                <BaseHeading as="h3" weight="medium"
                  >{{ values.donor?.firstName }}
                  {{ values.donor?.lastName }}
                </BaseHeading>
                <BaseText size="sm" class="text-muted-400"
                  >{{ values.donor?.city === '' ? '' : values.donor?.city }},
                  {{
                    values.donor?.country?.name === ''
                      ? ''
                      : values.donor?.country?.name
                  }}</BaseText
                >
                <div class="text-muted-400 mb-4 mt-2 flex items-center gap-2">
                  <Icon name="lucide:mail" class="h-4 w-4" />
                  <BaseText size="xs">{{
                    values.donor?.email === ''
                      ? 'adresse email'
                      : values.donor?.email
                  }}</BaseText>
                </div>
              </div>
              <div class="shrink-0">
                <BaseAvatar size="lg" src="/img/avatars/20.svg" />
              </div>
            </div>

            <div
              class="divide-muted-200 dark:divide-muted-700 flex w-full items-center divide-x py-4"
            >
              <div class="xxl:pe-6 flex flex-1 flex-col gap-1 pe-4">
                <BaseHeading as="h3" size="sm" weight="medium" lead="none"
                  >{{ values.amount }} XAF</BaseHeading
                >
                <BaseText size="xs" class="text-muted-400"> Montant </BaseText>
              </div>
              <div class="xxl:px-6 flex flex-1 flex-col gap-1 px-4">
                <BaseHeading as="h3" size="sm" weight="medium" lead="none">{{
                  values.type === null ? 'Public' : values.type
                }}</BaseHeading>
                <BaseText size="xs" class="text-muted-400"> Type </BaseText>
              </div>
              <div class="xxl:ps-6 flex flex-1 flex-col gap-1 ps-4">
                <BaseHeading as="h3" size="sm" weight="medium" lead="none"
                  >Online</BaseHeading
                >
                <BaseText size="xs" class="text-muted-400"> Method </BaseText>
              </div>
            </div>
            <BaseHeading as="h3" size="md" weight="medium"
              >Organisation</BaseHeading
            >
            <BaseText size="sm" class="text-muted-400">
              <span class="" v-if="auth.authenticated">{{
                app.activeOrg.name
              }}</span>
              <span class="" v-else-if="data.org">{{ data?.org.name }}</span>
            </BaseText>
            <div class="my-2">
              <BaseHeading as="h3" size="md" weight="medium">
                Commentaires
              </BaseHeading>
              <BaseText size="sm" class="text-muted-400">
                {{
                  values.comments === ''
                    ? 'Observations will be shown here'
                    : values.comments
                }}
              </BaseText>
            </div>
          </BaseCard>
        </div>
      </form>
    </TairoContentWrapper>
    <LandingFooter />
  </div>
</template>
