<script setup lang="ts">
import { Field } from 'vee-validate';
import { UserRole } from '~/types/user';

definePageMeta({
  title: 'Conducteur - Programme',
  preview: {
    title: 'Conducteur - Programme',
    description: 'Conducteur - Programme',
    categories: ['bo', 'tv-programs', 'planning'],
    src: '/img/screens/layouts-table-list-1.png',
    srcDark: '/img/screens/layouts-table-list-1-dark.png',
    order: 44,
  },
})

const authStore = useAuthStore()
const route = useRoute()
const router = useRouter()
const page = computed(() => parseInt((route.query.page as string) ?? '1'))
const filter = ref('')
const curProgramContent = ref('')
const perPage = ref(10)
const token = useCookie('token')
const toaster = useToaster()
// Check if can have access
if (
  authStore.user.appRole.name != UserRole.sale &&
  authStore.user.appRole.name != UserRole.superAdmin
) {
  toaster.clearAll()
  toaster.show({
    title: 'Désolé',
    message: `Vous n'avez pas access à cette page!`,
    color: 'danger',
    icon: 'ph:check',
    closable: true,
  })
  router.back()
}

const queryHours = computed(() => {
  return {
    filter: filter.value,
    perPage: perPage.value,
    page: page.value,
    action: 'findAll',
    token: token.value,
  }
})

const isModalNewActionOpen = ref(false)
const isModalDeleteActionOpen = ref(false)
const isEdit = ref(false)
const isPrint = ref(false)

watch([filter, perPage], () => {
  router.push({
    query: {
      page: undefined,
    },
  })
})

const app = useAppStore()
const recoveryProcedureId = computed(() => route.params.id)
const query = computed(() => {
  return {
    action: 'findOne',
    id: recoveryProcedureId.value,
    token: token.value,
  }
})

const { data, pending, error, refresh } = await useFetch(
  '/api/tv-programs/plannings',
  {
    query,
  },
)

if (data.value?.data) {
  curProgramContent.value = data?.value.data?.content ?? ''
}

async function printProcedures() {
  isPrint.value = true
  setTimeout(() => {
    var printContents = document.getElementById('print-procedures').innerHTML
    var originalContents = document.body.innerHTML
    document.body.innerHTML = printContents
    window.print()
    document.body.innerHTML = originalContents
    isPrint.value = false
    location.reload()
  }, 500)
}

const selected = ref<number[]>([])
const isAllVisibleSelected = computed(() => {
  return selected.value.length === data.value?.data?.procedures?.length
})

function toggleAllVisibleSelection() {
  if (isAllVisibleSelected.value) {
    selected.value = []
  } else {
    selected.value = data.value?.data?.procedures?.map((item) => item._id) ?? []
  }
}

async function addProcedureAction() {
  data.value.data.procedures.push({
    ...curProcedureAction.value,
    _id: Math.floor(Math.random() * 1000),
  })
  curProcedureAction.value = {
    _id: Math.floor(Math.random() * 1000),
  }

  await updateProcedure()
}

function confirmDeleteProcedureAction(procedureAction: any) {
  isModalDeleteActionOpen.value = true
  isEdit.value = false
  curProcedureAction.value = procedureAction
}

async function deleteProcedureAction(id: number) {
  data.value.data.procedures = data.value.data.procedures?.filter((e: any) => {
    return e._id != id
  })
  isModalDeleteActionOpen.value = false

  //
  await updateProcedure()
}

function editProcedureAction(item: any) {
  isEdit.value = true
  curProcedureAction.value = { ...item }
  isModalNewActionOpen.value = true
}

async function updateProcedureAction(item: any) {
  for (let index = 0; index < data.value.data.procedures?.length; index++) {
    if (data.value.data.procedures[index]._id == item._id) {
      data.value.data.procedures[index] = { ...item }
      isEdit.value = false
      //
      await updateProcedure()
    }
  }
}

const curProcedureAction = ref({
  _id: 0,
  title: '',
  description: '',
})

async function updateProcedure() {
  const response = await $fetch(
    `/api/tv-programs/plannings?action=updatePlanning&token=` +
      token.value +
      '&id=' +
      (data.value?.data._id ?? '') +
      '&orderCode=' +
      data.value?.data?.code,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: data.value?.data,
    },
  )
  if (response.success) {
    success.value = true
    toaster.clearAll()
    toaster.show({
      title: 'Success',
      message: `Element mis a jour !`,
      color: 'success',
      icon: 'ph:check',
      closable: true,
    })
    isModalNewActionOpen.value = false
    // location.reload()
    filter.value = 'actions'
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

async function updateProgramContent() {
  const response = await $fetch(
    `/api/tv-programs/plannings?action=updatePlanningContent&token=` +
      token.value +
      '&id=' +
      (data.value?.data._id ?? '') +
      '&orderCode=' +
      data.value?.data?.code,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: { content: curProgramContent.value },
    },
  )
  if (response.success) {
    success.value = true
    toaster.clearAll()
    toaster.show({
      title: 'Success',
      message: `Element mis a jour !`,
      color: 'success',
      icon: 'ph:check',
      closable: true,
    })
    isModalNewActionOpen.value = false
    // location.reload()
    filter.value = 'actions'
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

const currentAvatar = computed(() => '/img/avatars/10.svg')
const signatureFile = ref<File | null>(null)
const inputFileSignature = ref<FileList | null>(null)
const signatureFilePreview = useNinjaFilePreview(() => signatureFile.value)
watch(inputFileSignature, (value) => {
  const file = value?.item(0) || null
  signatureFile.value = file
})

const productFile = ref<File | null>(null)
const inputFileProduct = ref<FileList | null>(null)
const ProductFilePreview = useNinjaFilePreview(() => productFile.value)
watch(inputFileProduct, (value) => {
  const file = value?.item(0) || null
  productFile.value = file
})

const success = ref(false)
</script>

<template>
  <div id="print-procedures" :class="isPrint == true ? '!p-4' : ''">
    <div class="flex w-full flex-col mt-2 mx-2 mb-10">
      <div class="flex justify-center">
        <Icon name="lucide:tv" class="h-10 w-10" />
      </div>
      <div class="mx-auto w-full max-w-4xl text-center">
        <BaseHeading tag="h1" size="xl" weight="medium" class="mt-4">
          {{ data?.data?.tvProgram?.name }}
        </BaseHeading>
        <div
          class="divide-muted-400 dark:divide-muted-600 flex items-center justify-center divide-x"
        >
          <div class="text-muted-400 flex h-8 items-center gap-1 px-4">
            <Icon name="ph:clock" class="h-5 w-5" />
            <BaseText class="text-primary-500" size="lg"
              >Date:

              {{ new Date(data?.data?.date).toLocaleDateString('fr-FR') }}

              De
              {{
                new Date(data?.data?.date)
                  .toLocaleTimeString('fr-FR')
                  .replace(':00', '')
                  .replace(':', 'H')
              }}

              <span v-if="data?.data?.date">
                À
                {{
                  new Date(
                    new Date(data?.data?.date).getTime() +
                      (data?.data?.tvProgram?.duration ?? 0) * 60000,
                  )
                    .toLocaleTimeString('fr-FR')
                    .replace(':00', '')
                    .replace(':', 'H')
                }}</span
              ></BaseText
            >
          </div>

          <div class="text-muted-400 flex h-8 items-center gap-1 px-4">
            <Icon name="ph:clock" class="h-5 w-5" />
            <BaseText class="text-primary-500" size="lg"
              >Durée:
              {{
                formattedDuration(
                  data?.data?.tvProgram ? data?.data?.tvProgram.duration : '',
                )
              }}
            </BaseText>
          </div>
        </div>
      </div>
    </div>

    <TairoContentWrapper>
      <template #left>
        <BaseInput
          v-if="!isPrint"
          v-model="filter"
          icon="lucide:search"
          placeholder="Filtre element..."
          :classes="{
            wrapper: 'w-full sm:w-auto',
          }"
        />
      </template>
      <template #right>
        <!-- <BaseSelect
          v-if="!isPrint"
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
        </BaseSelect> -->
        <!-- <BaseButton
          v-if="!isPrint"
          @click=";(isModalNewActionOpen = true), (isEdit = false)"
          color="primary"
          class="w-full sm:w-48"
          :disabled="
            authStore.user.appRole?.name != UserRole.programPlanner &&
            authStore.user.appRole?.name != UserRole.admin &&
            authStore.user.appRole?.name != UserRole.superAdmin
          "
        >
          <Icon name="lucide:plus" class="h-4 w-4" />
          <span>Nouvelle action</span>
        </BaseButton> -->
        <BaseButton
          v-if="!isPrint"
          @click="updateProgramContent()"
          color="primary"
          class="w-full sm:w-48"
          :disabled="
            authStore.user.appRole?.name != UserRole.programPlanner &&
            authStore.user.appRole?.name != UserRole.admin &&
            authStore.user.appRole?.name != UserRole.superAdmin
          "
        >
          <Icon name="lucide:save" class="h-4 w-4" />
          <span>Enregistrer</span>
        </BaseButton>
        <BaseButton
          v-if="!isPrint"
          color="primary"
          @click="printProcedures"
          class="w-full sm:w-48"
        >
          <Icon name="carbon:printer" class="h-4 w-4" /> Exporter
        </BaseButton>
        <BaseButton
          v-if="!isPrint"
          @click="
            router.push('/bo/tv-programs/planning-details/' + data.data?._id)
          "
          color="primary"
          class="w-full sm:w-8"
        >
          <Icon name="carbon:tropical-storm-tracks" class="h-4 w-4" />
        </BaseButton>
      </template>

      <div>
        <div v-if="pending">
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
            <Editor
              class="!z-10001"
              api-key="28vhdlyfnzs83pxfpaj979iljxwg6tviaz2y4gri6drif9ak"
              v-model="curProgramContent"
              :init="{
                selector: 'textarea#basic-example',
                height: 500,
                with: 1500,
                plugins: [
                  'advlist',
                  'autolink',
                  'lists',
                  'link',
                  'image',
                  'charmap',
                  'preview',
                  'anchor',
                  'searchreplace',
                  'visualblocks',
                  'code',
                  'fullscreen',
                  'insertdatetime',
                  'media',
                  'table',
                  'help',
                  'wordcount',
                ],
                toolbar:
                  'undo redo | blocks | ' +
                  'bold italic backcolor | alignleft aligncenter ' +
                  'alignright alignjustify | bullist numlist outdent indent | ' +
                  'removeformat | help',
                content_style:
                  'body { font-family:Helvetica,Arial,sans-serif; font-size:16px }',
              }"
            />
          </div>
        </div>
      </div>
    </TairoContentWrapper>

    <!-- Modal new action -->
    <TairoModal
      :open="isModalNewActionOpen"
      size="xl"
      @close="isModalNewActionOpen = false"
    >
      <template #header>
        <!-- Header -->
        <div class="flex w-full items-center justify-between p-4 md:p-6">
          <h3
            class="font-heading text-muted-900 text-lg font-medium leading-6 dark:text-white"
          >
            {{ isEdit == true ? 'Editer' : 'Nouvelle' }} Action
          </h3>

          <BaseButtonClose @click="isModalNewActionOpen = false" />
        </div>
      </template>

      <!-- Body -->
      <BaseCard class="w-full">
        <form
          method="POST"
          action=""
          class="divide-muted-200 dark:divide-muted-700"
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
                    >
                      <BaseInput
                        label="Heure"
                        icon="ph:clock"
                        placeholder="Heure ou titre"
                        v-model="curProcedureAction.title"
                        :error="errorMessage"
                        :disabled="isSubmitting"
                        @update:model-value="handleChange"
                        @blur="handleBlur"
                      />
                    </Field>
                  </div>
                  <!-- <div class="ltablet:col-span-6 col-span-12 lg:col-span-12">
                    <Field
                      v-slot="{ field, errorMessage, handleChange, handleBlur }"
                    >
                      <BaseSelect
                        label="Type d'élément"
                        icon="ph:funnel"
                        v-model="curProcedureAction.type"
                        :error="errorMessage"
                        :disabled="isSubmitting"
                        @update:model-value="handleChange"
                        @blur="handleBlur"
                      >
                        <option value="contact">Contact</option>
                        <option value="rapport">Rapport réunion</option>
                        <option value="transaction">Transaction</option>
                        <option value="reminder">Lettre de relance</option>
                      </BaseSelect>
                    </Field>
                  </div> -->
                </div>
                <div
                  class="ltablet:col-span-12 col-span-12 pt-5 lg:col-span-12"
                ></div>
              </div>
            </div>
          </div>
        </form>
      </BaseCard>
      <template #footer>
        <!-- Footer -->
        <div class="p-4 md:p-6">
          <div class="flex gap-x-2">
            <BaseButton @click="isModalNewActionOpen = false"
              >Annuler</BaseButton
            >

            <BaseButton
              v-if="isEdit == true"
              color="primary"
              flavor="solid"
              @click="updateProcedureAction(curProcedureAction)"
            >
              {{ 'Modifier' }}
            </BaseButton>
            <BaseButton
              v-if="isEdit == false"
              color="primary"
              flavor="solid"
              @click="addProcedureAction()"
            >
              {{ 'Créer' }}
            </BaseButton>
          </div>
        </div>
      </template>
    </TairoModal>

    <!-- Modal delete -->
    <TairoModal
      :open="isModalDeleteActionOpen"
      size="sm"
      @close="isModalDeleteActionOpen = false"
    >
      <template #header>
        <!-- Header -->
        <div class="flex w-full items-center justify-between p-4 md:p-6">
          <h3
            class="font-heading text-muted-900 text-lg font-medium leading-6 dark:text-white"
          >
            Suppression d'une action
          </h3>

          <BaseButtonClose @click="isModalDeleteActionOpen = false" />
        </div>
      </template>

      <!-- Body -->
      <div class="p-4 md:p-6">
        <div class="mx-auto w-full max-w-xs text-center">
          <h3
            class="font-heading text-muted-800 text-lg font-medium leading-6 dark:text-white"
          >
            Supprimer
            <span
              v-html="curProcedureAction?.description"
              class="text-red-500"
            ></span>
            ?
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
            <BaseButton @click="isModalDeleteActionOpen = false"
              >Annuler</BaseButton
            >

            <BaseButton
              color="primary"
              flavor="solid"
              @click="deleteProcedureAction(curProcedureAction?._id)"
              >Suppimer</BaseButton
            >
          </div>
        </div>
      </template>
    </TairoModal>
  </div>
</template>
