<!-- components/BroadcastAuthForm.vue -->
<script setup lang="ts">
import { toTypedSchema } from '@vee-validate/zod'
import { Field, useForm } from 'vee-validate'
import { z } from 'zod'

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

const emit = defineEmits(['submit'])

const onSubmit = handleSubmit(
  async (values) => {
    emit('submit', values)
  },
  (error) => {
    console.log('broadcast-auth-create-error', error)
  },
)

defineExpose({
  setFieldValue,
  resetForm,
})
</script>

<template>
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
                  <BaseListbox
                    label="Facture"
                    icon="ph:receipt-duotone"
                    :items="invoice"
                    :properties="{ value: '_id', label: 'name' }"
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
                    :items="campaingn"
                    :properties="{ value: '_id', label: 'name' }"
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
                    :items="paymentMethods.data"
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
                  <BaseListbox
                    label="Participants"
                    :items="users.data"
                    :properties="{ value: 'name', label: 'name' }"
                    v-model="field.value"
                    :error="errorMessage"
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
                    :items="users.data"
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
                    :items="users.data"
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
                    :items="users.data"
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
                  <BaseInput
                    label="Partenaire de production"
                    placeholder="Entrez Partenaire de production"
                    v-model="field.value"
                    :error="errorMessage"
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
</template>