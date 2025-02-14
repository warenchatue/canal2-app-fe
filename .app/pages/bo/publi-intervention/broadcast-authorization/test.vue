<script setup lang="ts">
import BroadcastAuthForm from '~/components/BroadcastAuthForm.vue'
import NatureModal from '~/components/NatureModal.vue'
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

const success = ref(false)

function editBroadcastAuth(auth: any) {
  showForm.value = true
  isEdit.value = true
  form.setFieldValue('broadcastAuthorization._id', auth._id)
  form.setFieldValue('broadcastAuthorization.announcer', auth.announcer)
  form.setFieldValue('broadcastAuthorization.invoice', auth.invoice)
  form.setFieldValue('broadcastAuthorization.campaign', auth.campaign)
  form.setFieldValue('broadcastAuthorization.nature', auth.nature)
  form.setFieldValue(
    'broadcastAuthorization.natureDescription',
    auth.natureDescription,
  )
  form.setFieldValue('broadcastAuthorization.date', auth.date)
  form.setFieldValue('broadcastAuthorization.startDate', auth.startDate)
  form.setFieldValue('broadcastAuthorization.endDate', auth.endDate)
  form.setFieldValue('broadcastAuthorization.paymentMethod', auth.paymentMethod)
  form.setFieldValue('broadcastAuthorization.duration', auth.duration)
  form.setFieldValue('broadcastAuthorization.hour', auth.hour)
  form.setFieldValue('broadcastAuthorization.hours', auth.hours)
  form.setFieldValue('broadcastAuthorization.realHours', auth.realHours)
  form.setFieldValue('broadcastAuthorization.realHour', auth.realHour)
  form.setFieldValue('broadcastAuthorization.description', auth.description)
  form.setFieldValue('broadcastAuthorization.participants', auth.participants)
  form.setFieldValue('broadcastAuthorization.questions', auth.questions)
  form.setFieldValue('broadcastAuthorization.note', auth.note)
  form.setFieldValue(
    'broadcastAuthorization.serviceInCharge',
    auth.serviceInCharge,
  )
  form.setFieldValue('broadcastAuthorization.validator', auth.validator)
  form.setFieldValue('broadcastAuthorization.admiValidator', auth.admiValidator)
  form.setFieldValue('broadcastAuthorization.location', auth.location)
  form.setFieldValue('broadcastAuthorization.commercials', auth.commercials)
  form.setFieldValue(
    'broadcastAuthorization.contactDetails',
    auth.contactDetails,
  )
  form.setFieldValue(
    'broadcastAuthorization.productionPartner',
    auth.productionPartner,
  )
  form.setFieldValue(
    'broadcastAuthorization.otherProductionPartner',
    auth.otherProductionPartner,
  )
  form.setFieldValue('broadcastAuthorization.keyContact', auth.keyContact)
  form.setFieldValue(
    'broadcastAuthorization.otherKeyContact',
    auth.otherKeyContact,
  )
  form.setFieldValue(
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

const onSubmit = async (values: any) => {
  try {
    const response = await useFetch('/api/broadcast-auth/broadcast-aut', {
      // Fixed typo: 'broadcase-aut' -> 'broadcast-aut'
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
        <BroadcastAuthForm :is-edit="isEdit" @submit="onSubmit" ref="form" />
      </div>
    </TairoContentWrapper>

    <!-- Nature Modal -->
    <NatureModal :open="showNatureModal" @close="showNatureModal = false" />
  </div>
</template>
