<script setup lang="ts">
import { toTypedSchema } from '@vee-validate/zod'
import { Field, useForm } from 'vee-validate'
import { z } from 'zod'
import { UserRole } from '~/types/user'
import NatureModal from '~/components/NatureModal.vue'

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
const page = computed(() => parseInt((route.query.page as string) ?? '1'))
const filter = ref('')
const perPage = ref(10)
const showForm = ref(false) // Controls whether the form is visible
const showNatureModal = ref(false) // Fixed typo: 'flase' -> 'false'

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

const queryNF = computed(() => ({
  perPage: 1000,
  page: 1,
  action: 'findAll',
  token: token.value,
}));




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

const parseDate = (dateStr: string) => {
  if (!dateStr) return undefined;
  const date = new Date(dateStr);
  return isNaN(date.getTime()) ? undefined : date;
};

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
    announcer: z.object({
      _id: z.string().min(1, VALIDATION_TEXT.NATURE_REQUIRED)}),
    invoice: z.object({
      _id: z.string().min(1, VALIDATION_TEXT.NATURE_REQUIRED)}),
    campaign: z.object({
      _id: z.string().min(1, VALIDATION_TEXT.NATURE_REQUIRED)}),
    nature: z.object({
      _id: z.string().min(1, VALIDATION_TEXT.NATURE_REQUIRED)}),
    natureDescription: z.string().optional(),
    date: z.string().transform((str) => parseDate(str)),
    startDate: z.string().transform((str) => parseDate(str)),
    endDate: z.string().transform((str) => parseDate(str)),
    paymentMethod: z.object({
      _id: z.string().min(1, VALIDATION_TEXT.NATURE_REQUIRED)}),
    duration: z.number().optional(),
    hour: z.string().optional(),
    hours: z.array(z.string()).optional(),
    realHours: z.array(z.string()).optional(),
    realHour: z.string().optional(),
    description: z.string().optional(),
    participants: z.array(z.string()).default([]),
    questions: z.array(z.string()).default([]).optional(),
    note: z.string().optional(),
    serviceInCharge: z.string().optional(),
    validator: z.object({
      _id: z.string().min(1, VALIDATION_TEXT.NATURE_REQUIRED)}),
    admiValidator: z.object({
      _id: z.string().min(1, VALIDATION_TEXT.NATURE_REQUIRED)}),
    location: z.string().min(1, VALIDATION_TEXT.LOCATION_REQUIRED),
    commercials: z.array(z.string().min(1, 'At least one commercial must be selected')).default([]),
    contactDetails: z.string().optional(),
    productionPartner: z.string().optional(),
    otherProductionPartner: z.string().optional(),
    keyContact: z.string().optional(),
    otherKeyContact: z.string().optional(),
    contactDetailsToShow: z.string().optional(),
  }),
})


//announcer
const { data: announcers } = await useFetch('/api/sales/announcers', {
  query: queryNF,
});
const announcersList = computed(() => {
  if (!announcers.value || !Array.isArray(announcers.value.data)) {
    return [];
  }
  return announcers.value.data.map(item => ({
    _id: item._id, // Ensure this field exists in the API response
    name: item.name,
    code: item.code
  }));
});

//invoices
const { data: invoices } = await useFetch('/api/sales/invoices', {
  query: queryNF,
});
const invoicesList = computed(() => {
  if (!invoices.value || !Array.isArray(invoices.value.data)) {
    return [];
  }
  return invoices.value.data.map(item => ({
    _id: item._id, // Ensure this field exists in the API response
    code: item.code
  }));
});

// campaingn
const { data: campaingn } = await useFetch('/api/pub/packages', {
  query: queryNF,
});
const campaingnList = computed(() => {
  if (!campaingn.value || !Array.isArray(campaingn.value.data)) {
    return [];
  }
  return campaingn.value.data.map(item => ({
    _id: item._id, // Ensure this field exists in the API response
    code: item.code
  }));
});

// nature
const { data: natures } = await useFetch('/api/broadcast-auth/broadcast-na', {
  query: queryNF,
});
const naturesList = computed(() => {
  if (!natures.value || !natures.value.data || !Array.isArray(natures.value.data)) {
    console.warn('Natures data is not available or invalid:', natures.value);
    return [];
  }
  return natures.value.data.map(item => ({
    _id: item._id, // Ensure this field exists in the API response
    name: item.name
  }));
});

//Payment methods
const { data: paymentMethod } = await useFetch('/api/accountancy/payment-methods', {
  query: queryNF,
});
const paymentMethodList = computed(() => {
  if (!paymentMethod.value || !Array.isArray(paymentMethod.value.data)) {
    return [];
  }
  return paymentMethod.value.data.map(item => ({
    _id: item._id, // Ensure this field exists in the API response
    label: item.label
  }));
});

//Validatur
const { data: validatur } = await useFetch('/api/admin/orgs', {
  query: queryNF,
});
const validaturList = computed(() => {
  if (!validatur.value || !Array.isArray(validatur.value.data)) {
    return [];
  }
  return validatur.value.data.map(item => ({
    _id: item._id, // Ensure this field exists in the API response
    name: item.name
  }));
});


//ValidaturAdmin
const { data: validaturAdmin } = await useFetch('/api/admin/orgs', {
  query: queryNF,
});
const validaturAdminList = computed(() => {
  if (!validaturAdmin.value || !Array.isArray(validaturAdmin.value.data)) {
    return [];
  }
  return validaturAdmin.value.data.map(item => ({
    _id: item._id, // Ensure this field exists in the API response
    name: item.name
  }));
});




//Hours
const hours = ref([])
const inputValue2 = ref('')
const updateInputValue2 = (value) => {
  inputValue2.value = value
}
const addHour1 = (hour, handleChange) => {
  if (!hour?.trim()) return
  const newHours = [...hours.value, hour.trim()]
  hours.value = newHours
  handleChange(newHours)
  inputValue2.value = ''
}
const removeHour1 = (index, handleChange) => {
  const newHours = hours.value.filter((_, i) => i !== index)
  hours.value = newHours
  handleChange(newHours)
}

//RealHours
const realHours = ref([])
const inputValue3 = ref('')
const updateInputValue3 = (value) => {
  inputValue3.value = value
}
const addrealHour1 = (realHour, handleChange) => {
  if (!realHour?.trim()) return
  const newrealHours = [...realHours.value, realHour.trim()]
  realHours.value = newrealHours
  handleChange(newrealHours)
  inputValue3.value = ''
}
const removerealHour1 = (index, handleChange) => {
  const newrealHours = realHours.value.filter((_, i) => i !== index)
  realHours.value = newrealHours
  handleChange(newrealHours)
}


//partisipant
const participants = ref([])
const inputValue = ref('')
const updateInputValue = (value) => {
  inputValue.value = value
}
const addParticipant1 = (participant, handleChange) => {
  if (!participant?.trim()) return
  const newParticipants = [...participants.value, participant.trim()]
  participants.value = newParticipants
  handleChange(newParticipants)
  inputValue.value = ''
}
const removeParticipant1 = (index, handleChange) => {
  const newParticipants = participants.value.filter((_, i) => i !== index)
  participants.value = newParticipants
  
  handleChange(newParticipants)
}


//Questions
const questions = ref([])
const inputValue1 = ref('')
const updateInputValue1 = (value) => {
  inputValue1.value = value
}
const addQuestion1 = (question, handleChange) => {
  if (!question?.trim()) return
  const newQuestions = [...questions.value, question.trim()]
  questions.value = newQuestions
  handleChange(newQuestions)
  inputValue1.value = ''
}
const removeQuestion1 = (index, handleChange) => {
  const newQuestions = questions.value.filter((_, i) => i !== index)
  questions.value = newQuestions
  handleChange(newQuestions)
}



//commercials
const { data: commercials } = await useFetch('/api/users/', {
  query: queryNF,
});
console.log('Commercials API Response:', commercials.value);
const commercialsList = computed(() => {
  if (!commercials.value || !Array.isArray(commercials.value.data)) {
    return [];
  }
  return commercials.value.data.map(item => ({
    _id: item._id,
    name: item.lastName
  }));
});
const selectedCommercials = ref([]);
function handleCommercialChange(event, handleChange) {
  const selectedOptions = Array.from(event.target.selectedOptions).map(
    option => option.value
  );
  selectedCommercials.value = [...new Set([...selectedCommercials.value, ...selectedOptions])];
  handleChange(selectedCommercials.value);
}
function removeCommercial(commercialId, handleChange) {
  selectedCommercials.value = selectedCommercials.value.filter(id => id !== commercialId);
  handleChange(selectedCommercials.value);
}


const { data, pending, error, refresh } = await useFetch('/api/broadcast-auth/braodcast-aut', {
  query,
})

type FormInput = z.infer<typeof zodSchema>
const validationSchema = toTypedSchema(zodSchema)

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
})

const success = ref(false)

function selectBroadcastAuth(auth: any) {
  currentBroadcastAuth.value = auth
  expanded.value = false
}




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
        :disabled="
            authStore.user.appRole.name != UserRole.admin &&
            authStore.user.appRole.name != UserRole.superAdmin
          "
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
                        :items="announcersList"
                        :properties="{ value: '_id', label: 'name' }"
                        :model-value="field.value"
                        :error="errorMessage"
                        :disabled="isSubmitting"
                        placeholder="Sélectionnez un annonceur"
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
                        <BaseListbox
                          label="Facture"
                          :items="invoicesList"
                          :properties="{ value: '_id', label: 'code' }"
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
                        <BaseListbox
                          label="Campagne"
                          :items="campaingnList"
                          :properties="{ value: '_id', label: 'code' }"
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
                          :items="naturesList"
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
                          :items="paymentMethodList"
                          :properties="{ value: '_id', label: 'label' }"
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
                        v-slot="{ field, errorMessage, handleChange, handleBlur }"
                        name="broadcastAuthorization.hours"
                      >
                        <div>
                          <BaseInput
                            label="Hours"
                            icon="ph:clock-duotone"
                            placeholder="Type a Hours  and press Enter"
                            :model-value="inputValue2"
                            :error="errorMessage"
                            :disabled="isSubmitting"
                            @update:model-value="updateInputValue2"
                            @keyup.enter="(e) => {
                              if (inputValue2) {
                                addHour1(inputValue2, handleChange)
                                inputValue2 = ''
                              }
                              
                            }"
                            @blur="(e) => handleBlur(e)"
                          />
                          
                          <!-- Display Hours -->
                          <div class="mt-4">
                            <TransitionGroup name="list" tag="ul">
                              <li
                                v-for="(hour, index) in hours"
                                :key="hour"
                                class="inline-flex items-center px-2 py-1 mr-2 mb-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-full"
                              >
                                <span>{{ hour }}</span>
                                <button 
                                  @click="() => removeHour1(index, handleChange)"
                                  class="text-red-500 hover:text-red-700 ml-2"
                                  type="button"
                                >
                                  ×
                                </button>
                              </li>
                            </TransitionGroup>
                          </div>
                        </div>
                      </Field>
                    </div>

                    <!-- Real Hour -->
                    <div class="col-span-12 md:col-span-6">
                      <Field
                        v-slot="{ field, errorMessage, handleChange, handleBlur }"
                        name="broadcastAuthorization.realHours"
                      >
                        <div>
                          <BaseInput
                            label="Real Hours"
                            icon="ph:clock-duotone"
                            placeholder="Type a Real Hours  and press Enter"
                            :model-value="inputValue3"
                            :error="errorMessage"
                            :disabled="isSubmitting"
                            @update:model-value="updateInputValue3"
                            @keyup.enter="(e) => {
                              if (inputValue3) {
                                addrealHour1(inputValue3, handleChange)
                                inputValue3 = ''
                              }
                              
                            }"
                            @blur="(e) => handleBlur(e)"
                          />
                          
                          <!-- Display Real  Hours -->
                          <div class="mt-4">
                            <TransitionGroup name="list" tag="ul">
                              <li
                                v-for="(realHour, index) in realHours"
                                :key="realHour"
                                class="inline-flex items-center px-2 py-1 mr-2 mb-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-full"
                              >
                                <span>{{ realHour }}</span>
                                <button 
                                  @click="() => removerealHour1(index, handleChange)"
                                  class="text-red-500 hover:text-red-700 ml-2"
                                  type="button"
                                >
                                  ×
                                </button>
                              </li>
                            </TransitionGroup>
                          </div>
                        </div>
                      </Field>
                    </div>

                    <!-- Description -->
                    <div class="col-span-12 md:col-span-6">
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

                    <div class="col-span-12 md:col-span-6">
                      <Field
                        v-slot="{ field, errorMessage, handleChange, handleBlur }"
                        name="broadcastAuthorization.participants"
                      >
                        <div>
                          <BaseInput
                            label="Participants"
                            icon="ph:user"
                            placeholder="Type a Participants Names and press Enter"
                            :model-value="inputValue"
                            :error="errorMessage"
                            :disabled="isSubmitting"
                            @update:model-value="updateInputValue"
                            @keyup.enter="(e) => {
                              if (inputValue) {
                                addParticipant1(inputValue, handleChange)
                                inputValue = ''
                              }
                              
                            }"
                            @blur="(e) => handleBlur(e)"
                          />
                          
                          <!-- Display Participants -->
                          <div class="mt-4">
                            <TransitionGroup name="list" tag="ul">
                              <li
                                v-for="(participant, index) in participants"
                                :key="participant"
                                class="inline-flex items-center px-2 py-1 mr-2 mb-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-full"
                              >
                                <span>{{ participant }}</span>
                                <button 
                                  @click="() => removeParticipant1(index, handleChange)"
                                  class="text-red-500 hover:text-red-700 ml-2"
                                  type="button"
                                >
                                  ×
                                </button>
                              </li>
                            </TransitionGroup>
                          </div>
                        </div>
                      </Field>
                    </div>
                        
                                        
                     <!-- Questions Input -->
                     <div class="col-span-12 md:col-span-6">
                      <Field
                        v-slot="{ field, errorMessage, handleChange, handleBlur }"
                        name="broadcastAuthorization.questions"
                      >
                        <div>
                          <BaseInput
                            label="Questions"
                            icon="ph:question-duotone"
                            placeholder="Type a Questions  and press Enter"
                            :model-value="inputValue1"
                            :error="errorMessage"
                            :disabled="isSubmitting"
                            @update:model-value="updateInputValue1"
                            @keyup.enter="(e) => {
                              if (inputValue1) {
                                addQuestion1(inputValue1, handleChange)
                                inputValue1 = ''
                              }
                              
                            }"
                            @blur="(e) => handleBlur(e)"
                          />
                          
                          <!-- Display Questions -->
                          <div class="mt-4">
                            <TransitionGroup name="list" tag="ul">
                              <li
                                v-for="(question, index) in questions"
                                :key="question"
                                class="inline-flex items-center px-2 py-1 mr-2 mb-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-full"
                              >
                                <span>{{ question }}</span>
                                <button 
                                  @click="() => removeQuestion1(index, handleChange)"
                                  class="text-red-500 hover:text-red-700 ml-2"
                                  type="button"
                                >
                                  ×
                                </button>
                              </li>
                            </TransitionGroup>
                          </div>
                        </div>
                      </Field>
                    </div>


                    <!-- Note -->
                    <div class="col-span-12 md:col-span-6">
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
                          :items="validaturList"
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
                          :items="validaturAdminList"
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
                        v-slot="{ field, errorMessage, handleChange, handleBlur }"
                        name="broadcastAuthorization.commercials"
                        :value="selectedCommercials"
                      >
                        <div>
                          <label class="block text-sm font-medium text-gray-700">Commercials</label>
                          <div class="mt-1">
                            <select
                              :value="selectedCommercials"
                              multiple
                              class="mt-1 block w-full rounded-md bg-[#0f172a] border border--color-[#64748b] focus:ring-indigo-500 sm:text-sm burder-muted-30"
                              @change="(e) => handleCommercialChange(e, handleChange)"
                              @blur="handleBlur"
                            >
                              <option
                                v-for="commercial in commercialsList"
                                :key="commercial._id"
                                :value="commercial._id"
                              >
                                {{ commercial.name }}
                              </option>
                            </select>
                          </div>
                          <!-- Display selected Commercials -->
                          <div class="mt-2">
                            <div
                              v-for="commercialId in selectedCommercials"
                              :key="commercialId"
                              class="inline-flex items-center px-2 py-1 mr-2 mb-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-full"
                            >
                              {{ commercialsList.find(commercial => commercial._id === commercialId)?.name }}
                              <button
                                type="button"
                                class="ml-2 text-gray-500 hover:text-gray-700"
                                @click="() => removeCommercial(commercialId, handleChange)"
                              >
                                ×
                              </button>
                            </div>
                          </div>
                          <!-- Error message -->
                          <p v-if="errorMessage" class="mt-2 text-sm text-red-600">
                            {{ errorMessage }}
                          </p>
                        </div>
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
                        <BaseInput
                          label="Partenaire de production"
                          icon="ph:handshake-duotone"
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
                        <BaseInput
                          label="Contact clé"
                          icon="ph:phone-duotone"
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
    
     <!-- Nature Modal -->
     <NatureModal :open="showNatureModal" @close="showNatureModal = false" />

  </div>
</template>