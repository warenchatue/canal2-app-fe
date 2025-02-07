<script setup lang="ts">
import { toTypedSchema } from '@vee-validate/zod'
import { Field, useForm } from 'vee-validate'
import { z } from 'zod'
import { UserRole } from '~/types/user'

definePageMeta({
  title: 'Broadcast Authorizations',
  preview: {
    title: 'Broadcast Authorizations',
    description: 'Gestion des autorisations de diffusion',
    categories: ['bo', 'broadcast'],
    src: '/img/screens/layouts-table-list-1.png',
    srcDark: '/img/screens/layouts-table-list-1-dark.png',
    order: 45,
  },
})

const authStore = useAuthStore()
const route = useRoute()
const router = useRouter()
const appStore = useAppStore()
const page = computed(() => parseInt((route.query.page as string) ?? '1'))
const filter = ref('')
const perPage = ref(10)
const isEdit = ref(false)
const showForm = ref(false) // Controls whether the form is visible
const showNatureModal = ref(true)

const toaster = useToaster()
// Check if can have access
if (
  authStore.user.appRole?.name != UserRole.admin &&
  authStore.user.appRole?.name != UserRole.superAdmin
) {
  toaster.clearAll()
  toaster.show({
    title: 'Désolé',
    message: `Vous n'avez pas accès à cette page!`,
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

const { data, pending, error, refresh } = await useFetch('/api/broadcast-aut', {
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
    selected.value = data.value?.data.map((item) => item.id) ?? []
  }
}

const currentBroadcastAuth = ref({})
const chatEl = ref<HTMLElement>()
const expanded = ref(true)
const loading = ref(false)

// Validation messages
const VALIDATION_TEXT = {
  NATURE_REQUIRED: "Nature can't be empty",
  DATE_REQUIRED: "Date can't be empty",
  LOCATION_REQUIRED: "Location can't be empty",
}

// Zod schema for the form
const zodSchema = z.object({
  broadcastAuthorization: z.object({
    _id: z.string().optional(),
    announcer: z.string().min(1, VALIDATION_TEXT.NATURE_REQUIRED),
    invoice: z.string().optional(),
    campaign: z.string().optional(),
    nature: z.string().min(1, VALIDATION_TEXT.NATURE_REQUIRED),
    natureDescription: z.string().optional(),
    date: z.date(),
    startDate: z.date(),
    endDate: z.date(),
    paymentMethod: z.string().optional(),
    duration: z.number().optional(),
    hour: z.string().optional(),
    hours: z.array(z.string()).optional(),
    realHours: z.array(z.string()).optional(),
    realHour: z.string().optional(),
    description: z.string().optional(),
    participants: z.array(z.string()).optional(),
    questions: z.array(z.string()).optional(),
    note: z.string().optional(),
    serviceInCharge: z.string().optional(),
    validator: z.string().optional(),
    admiValidator: z.string().optional(),
    location: z.string().min(1, VALIDATION_TEXT.LOCATION_REQUIRED),
    commercials: z.array(z.string()).optional(),
    contactDetails: z.string().optional(),
    productionPartner: z.string().optional(),
    otherProductionPartner: z.string().optional(),
    keyContact: z.string().optional(),
    otherKeyContact: z.string().optional(),
    contactDetailsToShow: z.string().optional(),
  }),
})

type FormInput = z.infer<typeof zodSchema>

const validationSchema = toTypedSchema(zodSchema)
const initialValues = computed<FormInput>(() => ({
  broadcastAuthorization: {
    announcer: '',
    invoice: '',
    campaign: '',
    nature: '',
    natureDescription: '',
    date: new Date(),
    startDate: new Date(),
    endDate: new Date(),
    paymentMethod: '',
    duration: 0,
    hour: '',
    hours: [],
    realHours: [],
    realHour: '',
    description: '',
    participants: [],
    questions: [],
    note: '',
    serviceInCharge: '',
    validator: '',
    admiValidator: '',
    location: '',
    commercials: [],
    contactDetails: '',
    productionPartner: '',
    otherProductionPartner: '',
    keyContact: '',
    otherKeyContact: '',
    contactDetailsToShow: '',
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

function editBroadcastAuth(auth: any) {
  showForm.value = true
  isEdit.value = true
  setFieldValue('broadcastAuthorization._id', auth._id)
  setFieldValue('broadcastAuthorization.announcer', auth.announcer)
  setFieldValue('broadcastAuthorization.invoice', auth.invoice)
  setFieldValue('broadcastAuthorization.campaign', auth.campaign)
  setFieldValue('broadcastAuthorization.nature', auth.nature)
  setFieldValue(
    'broadcastAuthorization.natureDescription',
    auth.natureDescription,
  )
  setFieldValue('broadcastAuthorization.date', auth.date)
  setFieldValue('broadcastAuthorization.startDate', auth.startDate)
  setFieldValue('broadcastAuthorization.endDate', auth.endDate)
  setFieldValue('broadcastAuthorization.paymentMethod', auth.paymentMethod)
  setFieldValue('broadcastAuthorization.duration', auth.duration)
  setFieldValue('broadcastAuthorization.hour', auth.hour)
  setFieldValue('broadcastAuthorization.hours', auth.hours)
  setFieldValue('broadcastAuthorization.realHours', auth.realHours)
  setFieldValue('broadcastAuthorization.realHour', auth.realHour)
  setFieldValue('broadcastAuthorization.description', auth.description)
  setFieldValue('broadcastAuthorization.participants', auth.participants)
  setFieldValue('broadcastAuthorization.questions', auth.questions)
  setFieldValue('broadcastAuthorization.note', auth.note)
  setFieldValue('broadcastAuthorization.serviceInCharge', auth.serviceInCharge)
  setFieldValue('broadcastAuthorization.validator', auth.validator)
  setFieldValue('broadcastAuthorization.admiValidator', auth.admiValidator)
  setFieldValue('broadcastAuthorization.location', auth.location)
  setFieldValue('broadcastAuthorization.commercials', auth.commercials)
  setFieldValue('broadcastAuthorization.contactDetails', auth.contactDetails)
  setFieldValue(
    'broadcastAuthorization.productionPartner',
    auth.productionPartner,
  )
  setFieldValue(
    'broadcastAuthorization.otherProductionPartner',
    auth.otherProductionPartner,
  )
  setFieldValue('broadcastAuthorization.keyContact', auth.keyContact)
  setFieldValue('broadcastAuthorization.otherKeyContact', auth.otherKeyContact)
  setFieldValue(
    'broadcastAuthorization.contactDetailsToShow',
    auth.contactDetailsToShow,
  )
}

function selectBroadcastAuth(auth: any) {
  currentBroadcastAuth.value = auth
  expanded.value = false
}

async function deleteBroadcastAuth(auth: any) {
  const query2 = computed(() => {
    return {
      action: 'delete',
      token: token.value,
      id: auth._id,
    }
  })

  const response = await useFetch('/api/broadcast-auth', {
    method: 'delete',
    headers: { 'Content-Type': 'application/json' },
    query: query2,
  })

  if (response.data?.value?.success) {
    success.value = true
    toaster.clearAll()
    toaster.show({
      title: 'Success',
      message: `Authorization supprimée !`,
      color: 'success',
      icon: 'ph:check',
      closable: true,
    })
    filter.value = 'broadcast'
    filter.value = ''
    refresh() // Refresh the table data
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

const onSubmit = handleSubmit(
  async (values) => {
    try {
      const response = await useFetch('/api/broadcast-auth', {
        method: isEdit.value ? 'put' : 'post',
        headers: { 'Content-Type': 'application/json' },
        body: values.broadcastAuthorization,
      })

      if (response.data.value?.success) {
        success.value = true
        toaster.clearAll()
        toaster.show({
          title: 'Success',
          message: isEdit.value
            ? `Authorization mise à jour !`
            : `Authorization créée !`,
          color: 'success',
          icon: 'ph:check',
          closable: true,
        })
        showForm.value = false // Return to the table view
        refresh() // Refresh the table data
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
      toaster.clearAll()
      toaster.show({
        title: 'Désolé!',
        message: 'Veuillez examiner les erreurs dans le formulaire',
        color: 'danger',
        icon: 'lucide:alert-triangle',
        closable: true,
      })
    }
  },
  (error) => {
    success.value = false
    console.log('broadcast-auth-create-error', error)
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
          placeholder="Filtrer les autorisations..."
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
          v-if="!showForm"
          @click="showForm = true"
          color="primary"
          class="w-full sm:w-48"
          :disabled="
            authStore.user.appRole.name != UserRole.admin &&
            authStore.user.appRole.name != UserRole.superAdmin
          "
        >
          <Icon name="lucide:plus" class="h-4 w-4" />
          <span>Nouvelle Autorisation</span>
        </BaseButton>
        <BaseButton
          v-else
          @click="showForm = false"
          color="muted"
          class="w-full sm:w-48"
        >
          <Icon name="lucide:arrow-left" class="h-4 w-4" />
          <span>Retour à la liste</span>
        </BaseButton>

        <!-- Add this button to open the nature registration modal -->
        <BaseButton
          @click="showNatureModal = true"
          color="info"
          class="w-full sm:w-48 ml-2"
        >
          <Icon name="lucide:plus" class="h-4 w-4" />
          <span>Ajouter une Nature</span>
        </BaseButton>

      </template>

      <div v-if="!showForm">
        <!-- Table View -->
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
                  Announcer
                </TairoTableHeading>
                <TairoTableHeading uppercase spaced> Nature </TairoTableHeading>
                <TairoTableHeading uppercase spaced> Date </TairoTableHeading>
                <TairoTableHeading uppercase spaced>
                  Location
                </TairoTableHeading>
                <TairoTableHeading uppercase spaced> Action </TairoTableHeading>
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
                      {{ item.announcer }}
                    </span>
                  </div>
                </TairoTableCell>
                <TairoTableCell spaced>
                  <div class="flex items-center">
                    <span class="text-muted-400 font-sans text-xs">
                      {{ item.nature }}
                    </span>
                  </div>
                </TairoTableCell>
                <TairoTableCell spaced>
                  <div class="flex items-center">
                    <span class="text-muted-400 font-sans text-xs">
                      {{ item.date }}
                    </span>
                  </div>
                </TairoTableCell>
                <TairoTableCell spaced>
                  <div class="flex items-center">
                    <span class="text-muted-400 font-sans text-xs">
                      {{ item.location }}
                    </span>
                  </div>
                </TairoTableCell>

                <TairoTableCell spaced>
                  <div class="flex">
                    <BaseButtonAction
                      class="mx-2"
                      @click.prevent="selectBroadcastAuth(item)"
                      muted
                    >
                      <Icon name="lucide:eye" class="h-4 w-4"
                    /></BaseButtonAction>
                    <BaseButtonAction
                      :disabled="
                        authStore.user.appRole.name != UserRole.admin &&
                        authStore.user.appRole.name != UserRole.superAdmin
                      "
                      @click="editBroadcastAuth(item)"
                    >
                      <Icon name="lucide:edit" class="h-4 w-4"
                    /></BaseButtonAction>
                    <BaseButtonAction
                      @click="deleteBroadcastAuth(item)"
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

      <div v-else>
        <!-- Form View -->
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
                    <!-- Announcer -->
                    <div class="col-span-12 md:col-span-6">
                      <Field
                        v-slot="{
                          field,
                          errorMessage,
                          handleChange,
                          handleBlur,
                        }"
                        name="broadcastAuthorization.announcer"
                      >
                        <BaseListbox
                          label="Annonceur"
                          :items="announcers"
                          :properties="{ value: '_id', label: 'name' }"
                          :model-value="field.value"
                          :error="errorMessage"
                          :disabled="isSubmitting"
                          @update:model-value="handleChange"
                          @blur="handleBlur"
                        />
                      </Field>
                    </div>

                    <!-- Invoice -->
                    <div class="col-span-12 md:col-span-6">
                      <Field
                        v-slot="{
                          field,
                          errorMessage,
                          handleChange,
                          handleBlur,
                        }"
                        name="broadcastAuthorization.invoice"
                      >
                        <BaseInput
                          label="Facture"
                          icon="ph:receipt-duotone"
                          placeholder=""
                          :model-value="field.value"
                          :error="errorMessage"
                          :disabled="isSubmitting"
                          @update:model-value="handleChange"
                          @blur="handleBlur"
                        />
                      </Field>
                    </div>

                    <!-- Campaign -->
                    <div class="col-span-12 md:col-span-6">
                      <Field
                        v-slot="{
                          field,
                          errorMessage,
                          handleChange,
                          handleBlur,
                        }"
                        name="broadcastAuthorization.campaign"
                      >
                        <BaseInput
                          label="Campagne"
                          icon="ph:megaphone-duotone"
                          placeholder=""
                          :model-value="field.value"
                          :error="errorMessage"
                          :disabled="isSubmitting"
                          @update:model-value="handleChange"
                          @blur="handleBlur"
                        />
                      </Field>
                    </div>

                    <!-- Nature -->
                    <div class="col-span-12 md:col-span-6">
                      <Field
                        v-slot="{
                          field,
                          errorMessage,
                          handleChange,
                          handleBlur,
                        }"
                        name="broadcastAuthorization.nature"
                      >
                        <BaseListbox
                          label="Nature"
                          :items="natures"
                          :properties="{ value: '_id', label: 'name' }"
                          :model-value="field.value"
                          :error="errorMessage"
                          :disabled="isSubmitting"
                          @update:model-value="handleChange"
                          @blur="handleBlur"
                        />
                      </Field>
                    </div>

                    <!-- Nature Description -->
                    <div class="col-span-12 md:col-span-6">
                      <Field
                        v-slot="{
                          field,
                          errorMessage,
                          handleChange,
                          handleBlur,
                        }"
                        name="broadcastAuthorization.natureDescription"
                      >
                        <BaseInput
                          label="Description de la nature"
                          icon="ph:note-duotone"
                          placeholder=""
                          :model-value="field.value"
                          :error="errorMessage"
                          :disabled="isSubmitting"
                          @update:model-value="handleChange"
                          @blur="handleBlur"
                        />
                      </Field>
                    </div>

                    <!-- Date -->
                    <div class="col-span-12 md:col-span-6">
                      <Field
                        v-slot="{
                          field,
                          errorMessage,
                          handleChange,
                          handleBlur,
                        }"
                        name="broadcastAuthorization.date"
                      >
                        <BaseInput
                          label="Date"
                          type="date"
                          icon="ph:calendar-duotone"
                          placeholder=""
                          :model-value="field.value"
                          :error="errorMessage"
                          :disabled="isSubmitting"
                          @update:model-value="handleChange"
                          @blur="handleBlur"
                        />
                      </Field>
                    </div>

                    <!-- Start Date -->
                    <div class="col-span-12 md:col-span-6">
                      <Field
                        v-slot="{
                          field,
                          errorMessage,
                          handleChange,
                          handleBlur,
                        }"
                        name="broadcastAuthorization.startDate"
                      >
                        <BaseInput
                          label="Date de début"
                          type="date"
                          icon="ph:calendar-duotone"
                          placeholder=""
                          :model-value="field.value"
                          :error="errorMessage"
                          :disabled="isSubmitting"
                          @update:model-value="handleChange"
                          @blur="handleBlur"
                        />
                      </Field>
                    </div>

                    <!-- End Date -->
                    <div class="col-span-12 md:col-span-6">
                      <Field
                        v-slot="{
                          field,
                          errorMessage,
                          handleChange,
                          handleBlur,
                        }"
                        name="broadcastAuthorization.endDate"
                      >
                        <BaseInput
                          label="Date de fin"
                          type="date"
                          icon="ph:calendar-duotone"
                          placeholder=""
                          :model-value="field.value"
                          :error="errorMessage"
                          :disabled="isSubmitting"
                          @update:model-value="handleChange"
                          @blur="handleBlur"
                        />
                      </Field>
                    </div>

                    <!-- Payment Method -->
                    <div class="col-span-12 md:col-span-6">
                      <Field
                        v-slot="{
                          field,
                          errorMessage,
                          handleChange,
                          handleBlur,
                        }"
                        name="broadcastAuthorization.paymentMethod"
                      >
                        <BaseListbox
                          label="Méthode de paiement"
                          :items="paymentMethods"
                          :properties="{ value: '_id', label: 'name' }"
                          :model-value="field.value"
                          :error="errorMessage"
                          :disabled="isSubmitting"
                          @update:model-value="handleChange"
                          @blur="handleBlur"
                        />
                      </Field>
                    </div>

                    <!-- Duration -->
                    <div class="col-span-12 md:col-span-6">
                      <Field
                        v-slot="{
                          field,
                          errorMessage,
                          handleChange,
                          handleBlur,
                        }"
                        name="broadcastAuthorization.duration"
                      >
                        <BaseInput
                          label="Durée (en minutes)"
                          type="number"
                          icon="ph:clock-duotone"
                          placeholder=""
                          :model-value="field.value"
                          :error="errorMessage"
                          :disabled="isSubmitting"
                          @update:model-value="handleChange"
                          @blur="handleBlur"
                        />
                      </Field>
                    </div>

                    <!-- Hour -->
                    <div class="col-span-12 md:col-span-6">
                      <Field
                        v-slot="{
                          field,
                          errorMessage,
                          handleChange,
                          handleBlur,
                        }"
                        name="broadcastAuthorization.hour"
                      >
                        <BaseInput
                          label="Heure"
                          type="time"
                          icon="ph:clock-duotone"
                          placeholder=""
                          :model-value="field.value"
                          :error="errorMessage"
                          :disabled="isSubmitting"
                          @update:model-value="handleChange"
                          @blur="handleBlur"
                        />
                      </Field>
                    </div>

                    <!-- Hours -->
                    <div class="col-span-12 md:col-span-6">
                      <Field
                        v-slot="{
                          field,
                          errorMessage,
                          handleChange,
                          handleBlur,
                        }"
                        name="broadcastAuthorization.hours"
                      >
                        <BaseInput
                          label="Heures"
                          icon="ph:clock-duotone"
                          placeholder=""
                          :model-value="field.value"
                          :error="errorMessage"
                          :disabled="isSubmitting"
                          @update:model-value="handleChange"
                          @blur="handleBlur"
                        />
                      </Field>
                    </div>

                    <!-- Real Hours -->
                    <div class="col-span-12 md:col-span-6">
                      <Field
                        v-slot="{
                          field,
                          errorMessage,
                          handleChange,
                          handleBlur,
                        }"
                        name="broadcastAuthorization.realHours"
                      >
                        <BaseInput
                          label="Heures réelles"
                          icon="ph:clock-duotone"
                          placeholder=""
                          :model-value="field.value"
                          :error="errorMessage"
                          :disabled="isSubmitting"
                          @update:model-value="handleChange"
                          @blur="handleBlur"
                        />
                      </Field>
                    </div>

                    <!-- Real Hour -->
                    <div class="col-span-12 md:col-span-6">
                      <Field
                        v-slot="{
                          field,
                          errorMessage,
                          handleChange,
                          handleBlur,
                        }"
                        name="broadcastAuthorization.realHour"
                      >
                        <BaseInput
                          label="Heure réelle"
                          type="time"
                          icon="ph:clock-duotone"
                          placeholder=""
                          :model-value="field.value"
                          :error="errorMessage"
                          :disabled="isSubmitting"
                          @update:model-value="handleChange"
                          @blur="handleBlur"
                        />
                      </Field>
                    </div>

                    <!-- Description -->
                    <div class="col-span-12 md:col-span-12">
                      <Field
                        v-slot="{
                          field,
                          errorMessage,
                          handleChange,
                          handleBlur,
                        }"
                        name="broadcastAuthorization.description"
                      >
                        <BaseTextarea
                          label="Description"
                          icon="ph:note-duotone"
                          placeholder=""
                          :model-value="field.value"
                          :error="errorMessage"
                          :disabled="isSubmitting"
                          @update:model-value="handleChange"
                          @blur="handleBlur"
                        />
                      </Field>
                    </div>

                    <!-- Participants -->
                    <div class="col-span-12 md:col-span-12">
                      <Field
                        v-slot="{
                          field,
                          errorMessage,
                          handleChange,
                          handleBlur,
                        }"
                        name="broadcastAuthorization.participants"
                      >
                        <BaseInput
                          label="Participants"
                          icon="ph:users-duotone"
                          placeholder=""
                          :model-value="field.value"
                          :error="errorMessage"
                          :disabled="isSubmitting"
                          @update:model-value="handleChange"
                          @blur="handleBlur"
                        />
                      </Field>
                    </div>

                    <!-- Questions -->
                    <div class="col-span-12 md:col-span-12">
                      <Field
                        v-slot="{
                          field,
                          errorMessage,
                          handleChange,
                          handleBlur,
                        }"
                        name="broadcastAuthorization.questions"
                      >
                        <BaseTextarea
                          label="Questions"
                          icon="ph:question-duotone"
                          placeholder=""
                          :model-value="field.value"
                          :error="errorMessage"
                          :disabled="isSubmitting"
                          @update:model-value="handleChange"
                          @blur="handleBlur"
                        />
                      </Field>
                    </div>

                    <!-- Note -->
                    <div class="col-span-12 md:col-span-12">
                      <Field
                        v-slot="{
                          field,
                          errorMessage,
                          handleChange,
                          handleBlur,
                        }"
                        name="broadcastAuthorization.note"
                      >
                        <BaseTextarea
                          label="Note"
                          icon="ph:note-duotone"
                          placeholder=""
                          :model-value="field.value"
                          :error="errorMessage"
                          :disabled="isSubmitting"
                          @update:model-value="handleChange"
                          @blur="handleBlur"
                        />
                      </Field>
                    </div>

                    <!-- Service in Charge -->
                    <div class="col-span-12 md:col-span-6">
                      <Field
                        v-slot="{
                          field,
                          errorMessage,
                          handleChange,
                          handleBlur,
                        }"
                        name="broadcastAuthorization.serviceInCharge"
                      >
                        <BaseInput
                          label="Service en charge"
                          icon="ph:buildings-duotone"
                          placeholder=""
                          :model-value="field.value"
                          :error="errorMessage"
                          :disabled="isSubmitting"
                          @update:model-value="handleChange"
                          @blur="handleBlur"
                        />
                      </Field>
                    </div>

                    <!-- Validator -->
                    <div class="col-span-12 md:col-span-6">
                      <Field
                        v-slot="{
                          field,
                          errorMessage,
                          handleChange,
                          handleBlur,
                        }"
                        name="broadcastAuthorization.validator"
                      >
                        <BaseListbox
                          label="Validateur"
                          :items="validators"
                          :properties="{ value: '_id', label: 'name' }"
                          :model-value="field.value"
                          :error="errorMessage"
                          :disabled="isSubmitting"
                          @update:model-value="handleChange"
                          @blur="handleBlur"
                        />
                      </Field>
                    </div>

                    <!-- Admin Validator -->
                    <div class="col-span-12 md:col-span-6">
                      <Field
                        v-slot="{
                          field,
                          errorMessage,
                          handleChange,
                          handleBlur,
                        }"
                        name="broadcastAuthorization.admiValidator"
                      >
                        <BaseListbox
                          label="Validateur Admin"
                          :items="adminValidators"
                          :properties="{ value: '_id', label: 'name' }"
                          :model-value="field.value"
                          :error="errorMessage"
                          :disabled="isSubmitting"
                          @update:model-value="handleChange"
                          @blur="handleBlur"
                        />
                      </Field>
                    </div>

                    <!-- Location -->
                    <div class="col-span-12 md:col-span-6">
                      <Field
                        v-slot="{
                          field,
                          errorMessage,
                          handleChange,
                          handleBlur,
                        }"
                        name="broadcastAuthorization.location"
                      >
                        <BaseInput
                          label="Location"
                          icon="ph:map-pin-duotone"
                          placeholder=""
                          :model-value="field.value"
                          :error="errorMessage"
                          :disabled="isSubmitting"
                          @update:model-value="handleChange"
                          @blur="handleBlur"
                        />
                      </Field>
                    </div>

                    <!-- Commercials -->
                    <div class="col-span-12 md:col-span-6">
                      <Field
                        v-slot="{
                          field,
                          errorMessage,
                          handleChange,
                          handleBlur,
                        }"
                        name="broadcastAuthorization.commercials"
                      >
                        <BaseListbox
                          label="Commerciaux"
                          :items="commercials"
                          :properties="{ value: '_id', label: 'name' }"
                          :model-value="field.value"
                          :error="errorMessage"
                          :disabled="isSubmitting"
                          @update:model-value="handleChange"
                          @blur="handleBlur"
                        />
                      </Field>
                    </div>

                    <!-- Contact Details -->
                    <div class="col-span-12 md:col-span-6">
                      <Field
                        v-slot="{
                          field,
                          errorMessage,
                          handleChange,
                          handleBlur,
                        }"
                        name="broadcastAuthorization.contactDetails"
                      >
                        <BaseInput
                          label="Coordonnées"
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

                    <!-- Production Partner -->
                    <div class="col-span-12 md:col-span-6">
                      <Field
                        v-slot="{
                          field,
                          errorMessage,
                          handleChange,
                          handleBlur,
                        }"
                        name="broadcastAuthorization.productionPartner"
                      >
                        <BaseListbox
                          label="Partenaire de production"
                          :items="productionPartners"
                          :properties="{ value: '_id', label: 'name' }"
                          :model-value="field.value"
                          :error="errorMessage"
                          :disabled="isSubmitting"
                          @update:model-value="handleChange"
                          @blur="handleBlur"
                        />
                      </Field>
                    </div>

                    <!-- Other Production Partner -->
                    <div class="col-span-12 md:col-span-6">
                      <Field
                        v-slot="{
                          field,
                          errorMessage,
                          handleChange,
                          handleBlur,
                        }"
                        name="broadcastAuthorization.otherProductionPartner"
                      >
                        <BaseInput
                          label="Autre partenaire de production"
                          icon="ph:handshake-duotone"
                          placeholder=""
                          :model-value="field.value"
                          :error="errorMessage"
                          :disabled="isSubmitting"
                          @update:model-value="handleChange"
                          @blur="handleBlur"
                        />
                      </Field>
                    </div>

                    <!-- Key Contact -->
                    <div class="col-span-12 md:col-span-6">
                      <Field
                        v-slot="{
                          field,
                          errorMessage,
                          handleChange,
                          handleBlur,
                        }"
                        name="broadcastAuthorization.keyContact"
                      >
                        <BaseListbox
                          label="Contact clé"
                          :items="keyContacts"
                          :properties="{ value: '_id', label: 'name' }"
                          :model-value="field.value"
                          :error="errorMessage"
                          :disabled="isSubmitting"
                          @update:model-value="handleChange"
                          @blur="handleBlur"
                        />
                      </Field>
                    </div>

                    <!-- Other Key Contact -->
                    <div class="col-span-12 md:col-span-6">
                      <Field
                        v-slot="{
                          field,
                          errorMessage,
                          handleChange,
                          handleBlur,
                        }"
                        name="broadcastAuthorization.otherKeyContact"
                      >
                        <BaseInput
                          label="Autre contact clé"
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

                    <!-- Contact Details to Show -->
                    <div class="col-span-12 md:col-span-6">
                      <Field
                        v-slot="{
                          field,
                          errorMessage,
                          handleChange,
                          handleBlur,
                        }"
                        name="broadcastAuthorization.contactDetailsToShow"
                      >
                        <BaseInput
                          label="Coordonnées à afficher"
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
                </div>
              </div>
            </div>
          </form>
        </BaseCard>
      </div>
    </TairoContentWrapper>

    <TairoModal 
      :show="true" 
      :open="showNatureModal" 
      @close="showNatureModal = false"
      >

      <template #header>
        <h3 class="text-lg font-semibold">Ajouter une Nature</h3>
      </template>

      <template #body>
  <div class="max-h-[70vh] overflow-y-auto">
    <form @submit.prevent="onSubmitNature">
        <div class="space-y-4">
          <!-- Name Field -->
          <Field
            v-slot="{ field, errorMessage, handleChange, handleBlur }"
            name="name"
          >
            <BaseInput
              label="Nom"
              placeholder="Entrez le nom"
              :model-value="field.value"
              :error="errorMessage"
              @update:model-value="handleChange"
              @blur="handleBlur"
            />
          </Field>

          <!-- Type Field -->
          <Field
            v-slot="{ field, errorMessage, handleChange, handleBlur }"
            name="type"
          >
            <BaseListbox
              label="Type"
              :items="natureTypes"
              :properties="{ value: '_id', label: 'name' }"
              :model-value="field.value"
              :error="errorMessage"
              @update:model-value="handleChange"
              @blur="handleBlur"
            />
          </Field>

          <!-- Program Field -->
          <Field
            v-slot="{ field, errorMessage, handleChange, handleBlur }"
            name="program"
          >
            <BaseListbox
              label="Programme"
              :items="programs"
              :properties="{ value: '_id', label: 'name' }"
              :model-value="field.value"
              :error="errorMessage"
              @update:model-value="handleChange"
              @blur="handleBlur"
            />
          </Field>
        </div>
      </form>
    </div>
  </template>

      
    </TairoModal>

  </div>
</template>
