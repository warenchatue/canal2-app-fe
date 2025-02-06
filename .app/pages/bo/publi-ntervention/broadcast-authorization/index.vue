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
const isModalNewBroadcastAuthOpen = ref(false)
const isModalDeleteBroadcastAuthOpen = ref(false)
const isEdit = ref(false)

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

const { data, pending, error, refresh } = await useFetch(
  '/api/broadcast/authorizations',
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
  isModalNewBroadcastAuthOpen.value = true
  isEdit.value = true
  setFieldValue('broadcastAuthorization._id', auth._id)
  setFieldValue('broadcastAuthorization.announcer', auth.announcer)
  setFieldValue('broadcastAuthorization.invoice', auth.invoice)
  setFieldValue('broadcastAuthorization.campaign', auth.campaign)
  setFieldValue('broadcastAuthorization.nature', auth.nature)
  setFieldValue('broadcastAuthorization.natureDescription', auth.natureDescription)
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
  setFieldValue('broadcastAuthorization.productionPartner', auth.productionPartner)
  setFieldValue('broadcastAuthorization.otherProductionPartner', auth.otherProductionPartner)
  setFieldValue('broadcastAuthorization.keyContact', auth.keyContact)
  setFieldValue('broadcastAuthorization.otherKeyContact', auth.otherKeyContact)
  setFieldValue('broadcastAuthorization.contactDetailsToShow', auth.contactDetailsToShow)
}

function selectBroadcastAuth(auth: any) {
  currentBroadcastAuth.value = auth
  expanded.value = false
}

function confirmDeleteBroadcastAuth(auth: any) {
  isModalDeleteBroadcastAuthOpen.value = true
  isEdit.value = false
  currentBroadcastAuth.value = auth
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
    isModalDeleteBroadcastAuthOpen.value = false
    filter.value = 'broadcast'
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

const onSubmit = handleSubmit(
  async (values) => {
    success.value = false
    console.log('broadcast-auth-create-success', values)

    try {
      const isSuccess = ref(false)
      if (isEdit.value == true) {
        const query2 = computed(() => {
          return {
            action: 'updateBroadcastAuth',
            token: token.value,
            id: values.broadcastAuthorization._id,
          }
        })

        const response = await useFetch('/api/broadcast-auth', {
          method: 'put',
          headers: { 'Content-Type': 'application/json' },
          query: query2,
          body: values.broadcastAuthorization,
        })
        isSuccess.value = response.data.value?.success
      } else {
        const query2 = computed(() => {
          return {
            action: 'createBroadcastAuth',
            token: token.value,
          }
        })

        const response = await useFetch('/api/broadcast-auth', {
          method: 'post',
          headers: { 'Content-Type': 'application/json' },
          query: query2,
          body: values.broadcastAuthorization,
        })
        isSuccess.value = response.data.value?.success
      }
      if (isSuccess) {
        success.value = true
        toaster.clearAll()
        toaster.show({
          title: 'Success',
          message:
            isEdit.value == false
              ? `Authorization créée !`
              : `Authorization mise à jour`,
          color: 'success',
          icon: 'ph:check',
          closable: true,
        })
        isModalNewBroadcastAuthOpen.value = false
        resetForm()
        filter.value = 'broadcast'
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
    }
    success.value = true
  },
  (error) => {
    success.value = false
    console.log('broadcast-auth-create-error', error)
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
          @click=";(isModalNewBroadcastAuthOpen = true), (isEdit = false)"
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
                <TairoTableHeading uppercase spaced> Announcer </TairoTableHeading>
                <TairoTableHeading uppercase spaced> Nature </TairoTableHeading>
                <TairoTableHeading uppercase spaced> Date </TairoTableHeading>
                <TairoTableHeading uppercase spaced> Location </TairoTableHeading>
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
                      @click="confirmDeleteBroadcastAuth(item)"
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
    </TairoContentWrapper>

    <!-- Modal new Broadcast Authorization -->
    <TairoModal
      :open="isModalNewBroadcastAuthOpen"
      size="xl"
      @close="isModalNewBroadcastAuthOpen = false"
    >
      <template #header>
        <div class="flex w-full items-center justify-between p-4 md:p-6">
          <h3
            class="font-heading text-muted-900 text-lg font-medium leading-6 dark:text-white"
          >
            {{ isEdit == true ? 'Mise à jour' : 'Nouvelle' }} Autorisation
          </h3>

          <BaseButtonClose @click="isModalNewBroadcastAuthOpen = false" />
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
                      name="broadcastAuthorization.announcer"
                    >
                      <BaseInput
                        label="Annonceur"
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
                      name="broadcastAuthorization.nature"
                    >
                      <BaseInput
                        label="Nature"
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
                  <div class="col-span-12 md:col-span-6">
                    <Field
                      v-slot="{ field, errorMessage, handleChange, handleBlur }"
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
                  <div class="col-span-12 md:col-span-6">
                    <Field
                      v-slot="{ field, errorMessage, handleChange, handleBlur }"
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
                </div>
              </div>
            </div>
          </div>
        </form>
      </BaseCard>
      <template #footer>
        <div class="p-4 md:p-6">
          <div class="flex gap-x-2">
            <BaseButton @click="isModalNewBroadcastAuthOpen = false"
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
      :open="isModalDeleteBroadcastAuthOpen"
      size="sm"
      @close="isModalDeleteBroadcastAuthOpen = false"
    >
      <template #header>
        <div class="flex w-full items-center justify-between p-4 md:p-6">
          <h3
            class="font-heading text-muted-900 text-lg font-medium leading-6 dark:text-white"
          >
            Suppression d'une autorisation
          </h3>

          <BaseButtonClose @click="isModalDeleteBroadcastAuthOpen = false" />
        </div>
      </template>

      <!-- Body -->
      <div class="p-4 md:p-6">
        <div class="mx-auto w-full max-w-xs text-center">
          <h3
            class="font-heading text-muted-800 text-lg font-medium leading-6 dark:text-white"
          >
            Supprimer
            <span class="text-red-500">{{ currentBroadcastAuth?.name }}</span> ?
          </h3>

          <p
            class="font-alt text-muted-500 dark:text-muted-400 text-sm leading-5"
          >
            Cette action est irreversible
          </p>
        </div>
      </div>

      <template #footer>
        <div class="p-4 md:p-6">
          <div class="flex gap-x-2">
            <BaseButton @click="isModalDeleteBroadcastAuthOpen = false"
              >Annuler</BaseButton
            >

            <BaseButton
              color="primary"
              flavor="solid"
              @click="deleteBroadcastAuth(currentBroadcastAuth)"
              >Supprimer</BaseButton
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
          <span>Détails Autorisation</span>
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
              :src="currentBroadcastAuth?.logo"
              :text="currentBroadcastAuth.initials"
              :class="getRandomColor()"
              size="2xl"
            />
          </div>
          <div class="text-center">
            <BaseHeading tag="h3" size="lg" class="mt-4">
              <span>{{ currentBroadcastAuth?.name }}</span>
            </BaseHeading>
            <BaseParagraph size="sm" class="text-muted-400">
              <span>{{ currentBroadcastAuth?.description }}</span>
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