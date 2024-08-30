<script setup lang="ts">
import { toTypedSchema } from '@vee-validate/zod'
import moment from 'moment'
import { DatePicker } from 'v-calendar'
import { Field, useForm } from 'vee-validate'
import { z } from 'zod'
import { UserRole } from '~/types/user'

definePageMeta({
  title: 'Conducteur PUB',
  preview: {
    title: 'Conducteur PUB',
    description: '',
    categories: ['bo', 'pub', 'diffusion-list'],
    src: '/img/screens/layouts-table-list-1.png',
    srcDark: '/img/screens/layouts-table-list-1-dark.png',
    order: 44,
  },
})

const fakeItems = ref([])

const authStore = useAuthStore()
const route = useRoute()
const router = useRouter()
const page = computed(() => parseInt((route.query.page as string) ?? '1'))
const filter = ref('')
const perPage = ref(100)
const isModalImportPlaylistOpen = ref(false)
const isModalConfirmDiffusionOpen = ref(false)
const isModalDiffusionListOpen = ref(false)
const isModalDiffusionElementOpen = ref(false)
const isModalNewPlanningOpen = ref(false)
const isModalDeletePlanningOpen = ref(false)
const playedHour = ref('')
const currentHour = ref({})
const currentYear = ref()
const currentMonth = ref()
const currentDay = ref()
const currentCampaign = ref({})
const currentProduct = ref({})
const currentOrg = ref('')
const isEdit = ref(false)
const isPrint = ref(false)
const isActionLoading = ref(false)
const initialDates = {
  start: new Date(),
  end: new Date(),
}

const startDate = ref(new Date())
const endDate = ref(new Date())

const dates = ref(initialDates)

const planningDates = ref(initialDates)

watch([filter, perPage, dates], () => {
  router.push({
    query: {
      page: undefined,
    },
  })
})

if (filter.value == '') {
  dates.value = initialDates
  filter.value = ''
}

const token = useCookie('token')
const query = computed(() => {
  return {
    filter: filter.value,
    startDate: dates.value?.start.toLocaleDateString(),
    endDate: dates.value?.end.toLocaleDateString(),
    perPage: perPage.value,
    page: page.value,
    action: 'findAll',
    token: token.value,
  }
})

const query2 = computed(() => {
  return {
    filter: filter.value,
    perPage: 1000,
    page: page.value,
    action: 'findAll',
    token: token.value,
  }
})

const {
  data,
  pending,
  refresh: refreshPlanning,
} = await useFetch('/api/pub/plannings', {
  query,
  lazy: true,
})

const { data: allHours } = await useFetch('/api/pub/hours', {
  query: query,
  lazy: false,
  transform: (els) => {
    return els.data?.filter((el: any) => {
      return el.type != 'TvProgram'
    })
  },
})

const { data: orgs } = await useFetch('/api/admin/orgs', {
  query,
})

const transformedAllHours = allHours.value?.map((e: any) => {
  const hour = {
    id: e._id,
    name: e.code,
  }
  return hour
})

const { data: allPackages } = await useFetch('/api/pub/packages', {
  query: query2,
  lazy: true,
  transform: (els) => {
    return els.data?.map((el) => ({
      name: el.label,
      id: el._id,
      text: el.code,
      products: el.products,
    }))
  },
})

function openElementModal() {
  setTimeout(() => {
    isModalDiffusionElementOpen.value = true
  }, 500)
}

function openReportModal() {
  setTimeout(() => {
    isModalDiffusionListOpen.value = true
  }, 500)
}

async function printDiffusionList() {
  isPrint.value = true
  setTimeout(() => {
    var printContents = document.getElementById(
      'print-diffusion-list',
    ).innerHTML
    var originalContents = document.body.innerHTML
    document.body.innerHTML = printContents
    window.print()
    document.body.innerHTML = originalContents
    location.reload()
  }, 500)
}
async function addSpotToPlanning() {
  console.log('Adding product to the planning')
  isActionLoading.value = true
  const hourArray = currentHour.value?.name.split(':')

  let newPlannings = []
  const myActiveDay = parseInt(currentDay.value)
  const myActiveEndDay = parseInt(currentDay.value)
  const myActiveEndStep = 1

  for (
    let myDay = myActiveDay;
    myDay <= myActiveEndDay;
    myDay += myActiveEndStep
  ) {
    console.log(myDay)
    var date = new Date(
      parseInt(currentYear.value),
      currentMonth.value,
      myDay,
      parseInt(hourArray[0]),
      parseInt(hourArray[1]),
    )

    // console.log(date.toISOString())

    newPlannings.push({
      _id: undefined,
      product: currentProduct.value._id,
      hour: currentHour.value._id,
      date: date.toISOString(),
      position: date.toISOString(),
      isManualPlay: false,
      isAutoPlay: false,
    })
  }

  try {
    const isSuccess = ref(false)
    const response = await $fetch(
      '/api/pub/plannings?action=createPlannings&token=' +
        token.value +
        '&packageId=' +
        currentCampaign.value?.id +
        '&orderCode=' +
        currentCampaign.value?.text,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: {
          plannings: newPlannings,
        },
      },
    )

    // console.log(response)
    isSuccess.value = response?.success
    if (isSuccess.value == true) {
      success.value = true
      refreshPlanning()
      toaster.clearAll()
      toaster.show({
        title: 'Success',
        message: `Produit(s) ajouté(s) au conducteur !`,
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
    console.log(error)
    toaster.clearAll()
    toaster.show({
      title: 'Désolé!',
      message: 'Veuillez examiner les erreurs dans le formulaire',
      color: 'danger',
      icon: 'lucide:alert-triangle',
      closable: true,
    })
    // return
  }
  // console.log(data.value?.data?.plannings)

  isModalDiffusionElementOpen.value = false
  isActionLoading.value = false
}
function filterItems(query?: string, items?: any[]) {
  if (!query || !items) {
    return items ?? []
  }

  // search by name or text
  return items.filter((item) => {
    const nameMatches = item?.name?.toLowerCase().includes(query.toLowerCase())
    // const textMatches = item?.text?.toLowerCase().includes(query.toLowerCase())
    return nameMatches
  })
}

const inputPlayListFile = ref<FileList | null>(null)
const payListFile = ref<File | null>(null)
watch(inputPlayListFile, (value) => {
  const file = value?.item(0) || null
  payListFile.value = file
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

const { copy, copied } = useClipboard()
const toaster = useToaster()
const handleClipboard = (textLink: string) => {
  copy(textLink)
  if (copied) {
    toaster.clearAll()
    toaster.show({
      title: 'Success',
      message: textLink + ` copié !`,
      color: 'success',
      icon: 'ph:check',
      closable: true,
    })
  }
}

const currentPlanning = ref({})
const loading = ref(false)
const success = ref(false)

function selectPlanning(planning: any) {
  isModalConfirmDiffusionOpen.value = true
  loading.value = true
  setTimeout(() => {
    currentPlanning.value = planning
    loading.value = false
  }, 10)
}

function editPlanning(planning: any) {
  isModalNewPlanningOpen.value = true
  loading.value = true
  isEdit.value = true
  setTimeout(() => {
    currentPlanning.value = planning
    loading.value = false
  }, 10)
}

function confirmDeletePlanning(planning: any) {
  isModalDeletePlanningOpen.value = true
  loading.value = true
  isEdit.value = false
  setTimeout(() => {
    currentPlanning.value = planning
    loading.value = false
  }, 10)
}

async function deletePlanning() {
  isActionLoading.value = true
  try {
    const isSuccess = ref(false)
    const response = await $fetch(
      '/api/pub/plannings?action=delete&token=' +
        token.value +
        '&id=' +
        currentPlanning.value._id,
      {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
      },
    )

    isSuccess.value = response?.success
    if (isSuccess.value == true) {
      success.value = true
      refreshPlanning()
      toaster.clearAll()
      toaster.show({
        title: 'Success',
        message: 'Planning supprimé du conducteur !',
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
    console.log(error)
    toaster.clearAll()
    toaster.show({
      title: 'Désolé!',
      message: 'Veuillez examiner les erreurs dans le formulaire',
      color: 'danger',
      icon: 'lucide:alert-triangle',
      closable: true,
    })
    // return
  }
  isActionLoading.value = false
  isModalDeletePlanningOpen.value = false
}

async function confirmDiffusion(planning: any) {
  const query2 = computed(() => {
    return {
      action: 'updatePlanning',
      token: token.value,
      id: currentPlanning.value._id,
    }
  })

  const response = await useFetch('/api/pub/plannings', {
    method: 'put',
    headers: { 'Content-Type': 'application/json' },
    query: query2,
    body: {
      ...currentPlanning.value._id,
      isManualPlay: true,
      playedHour: playedHour.value ?? '',
    },
  })

  if (response.data?.value?.success) {
    success.value = true
    toaster.clearAll()
    toaster.show({
      title: 'Success',
      message: `Diffusion confirmée !`,
      color: 'success',
      icon: 'ph:check',
      closable: true,
    })
    isModalConfirmDiffusionOpen.value = false
    filter.value = 'planning'
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
async function updatePosition(curP: any, isInc: boolean) {
  const query2 = computed(() => {
    return {
      action: 'updatePlanning',
      token: token.value,
      id: curP._id,
    }
  })

  const response = await useFetch('/api/pub/plannings', {
    method: 'put',
    headers: { 'Content-Type': 'application/json' },
    query: query2,
    body: {
      ...curP._id,
      position: isInc
        ? moment(curP?.position).add(1, 'seconds')
        : moment(curP?.position).subtract(1, 'seconds'),
    },
  })

  if (response.data?.value?.success) {
    success.value = true
    toaster.clearAll()
    toaster.show({
      title: 'Success',
      message: `Position mise à jour !`,
      color: 'success',
      icon: 'ph:check',
      closable: true,
    })
    filter.value = 'planning'
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

async function updateHour() {
  isActionLoading.value = true
  const query2 = computed(() => {
    return {
      action: 'updatePlanning',
      token: token.value,
      id: currentPlanning.value._id,
    }
  })
  const hourArray = currentHour.value?.name.split(':')
  var date = new Date(
    new Date(currentPlanning.value?.date).getFullYear(),
    new Date(currentPlanning.value?.date).getMonth(),
    parseInt(new Date(currentPlanning.value?.date).getDate()),
    parseInt(hourArray[0]),
    parseInt(hourArray[1]),
  )

  const response = await useFetch('/api/pub/plannings', {
    method: 'put',
    headers: { 'Content-Type': 'application/json' },
    query: query2,
    body: {
      ...currentPlanning.value,
      hour: currentHour.value.id,
      product: currentPlanning.value.product._id,
      date: date.toISOString(),
      position: date.toISOString(),
    },
  })

  if (response.data?.value?.success) {
    success.value = true
    isModalNewPlanningOpen.value = false
    toaster.clearAll()
    toaster.show({
      title: 'Success',
      message: `Heure mise à jour !`,
      color: 'success',
      icon: 'ph:check',
      closable: true,
    })
    filter.value = 'planning'
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
  isActionLoading.value = false
}

function downloadProductFile(uri: string, item: any) {
  const link = document.createElement('a')
  link.href = '/' + uri
  const fileElements = item.product?.file.split('.')
  link.download =
    item.product.message + '.' + fileElements[fileElements.length - 1]
  link.click()
  document.body.removeChild(link)
  // fetch('/'+uri)
  //   .then((response) => response.blob())
  //   .then((blobresp) => {
  //     var url = window.URL.createObjectURL(blobresp)
  //     var link = document.createElement('a')
  //     const fileElements = item.product?.file.split('.')
  //     link.download =
  //       item.product.message + '.' + fileElements[fileElements.length - 1]
  //     link.href = url
  //     document.body.appendChild(link)
  //     link.click()
  //     document.body.removeChild(link)
  //     // delete link
  //   })
}

async function importPlayList() {
  const slug = ref('null')
  const token = useCookie('token')
  try {
    const fd = new FormData()
    fd.append('0', payListFile.value)
    const query3 = computed(() => {
      return {
        action: 'import-playlist',
        startDate: encodeURIComponent(planningDates.value.start.toJSON()),
        endDate: encodeURIComponent(planningDates.value.end.toJSON()),
        token: token.value,
      }
    })

    const { data: uploadData } = await useFetch('/api/files/upload', {
      method: 'POST',
      query: query3,
      body: fd,
    })
    console.log(uploadData)
    if (uploadData.value?.success == true) {
      slug.value = ''
      toaster.clearAll()
      toaster.show({
        title: 'Success',
        message: `Vérification terminée !`,
        color: 'success',
        icon: 'ph:check',
        closable: true,
      })
    } else {
      slug.value = ''
      toaster.clearAll()
      toaster.show({
        title: 'Désolé',
        message: `Une erreur est survenue lors de l'importation de la playlist !`,
        color: 'danger',
        icon: 'ph:check',
        closable: true,
      })
    }
  } catch (error) {}
  isModalImportPlaylistOpen.value = false
}

// Ask the user for confirmation before leaving the page if the form has unsaved changes
// onBeforeRouteLeave(() => {
//   if (meta.value.dirty) {
//     return confirm('You have unsaved changes. Are you sure you want to leave?')
//   }
// })

// This is the object that will contain the validation messages
const VALIDATION_TEXT = {
  OPERATOR_REQUIRED: "Operator can't be empty",
  PHONE_REQUIRED: "Phone number can't be empty",
  EMAIL_REQUIRED: "Email address can't be empty",
  COUNTRY_REQUIRED: 'Please select a country',
}

// This is the Zod schema for the form input
// It's used to define the shape that the form data will have
const zodSchema = z
  .object({
    payment: z.object({
      operator: z.string().min(1, VALIDATION_TEXT.OPERATOR_REQUIRED),
      name: z.string(),
      email: z.string(),
      phone: z.string().min(1, VALIDATION_TEXT.PHONE_REQUIRED),
      country: z
        .object({
          id: z.string(),
          abbr: z.string(),
          name: z.string(),
          flag: z.string(),
        })
        .nullable(),
    }),
  })
  .superRefine((data, ctx) => {
    if (!data.payment.country) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: VALIDATION_TEXT.PHONE_REQUIRED,
        path: ['payment.country'],
      })
    }

    if (!data.payment.country) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: VALIDATION_TEXT.COUNTRY_REQUIRED,
        path: ['payment.phone'],
      })
    }
  })

// Zod has a great infer method that will
// infer the shape of the schema into a TypeScript type
type FormInput = z.infer<typeof zodSchema>

const validationSchema = toTypedSchema(zodSchema)
const initialValues = computed<FormInput>(() => ({
  avatar: null,
  payment: {
    name: '',
    email: '',
    phone: '',
    operator: '',
    type: '',
    country: {
      id: '',
      abbr: '',
      name: '',
      flag: '',
    },
  },
}))

const { handleSubmit, isSubmitting, setFieldError, resetForm } = useForm({
  validationSchema,
  initialValues,
})

// This is where you would send the form data to the server
const onSubmit = handleSubmit(
  async (values) => {
    success.value = false

    // here you have access to the validated form values
    console.log('planning-create-success', values)

    try {
      toaster.clearAll()
      toaster.show({
        title: 'Success',
        message: `Record has been created!`,
        color: 'success',
        icon: 'ph:check',
        closable: true,
      })
    } catch (error: any) {
      // this will set the error on the form
      if (error.message === 'Fake backend validation error') {
        // @ts-expect-error - vee validate typing bug with nested keys
        setFieldError('payment.name', 'This name is not allowed')

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
    console.log('payment-create-error', error)

    // you can use it to scroll to the first error
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
          placeholder="Filtre pub..."
          :classes="{
            wrapper: 'w-full sm:w-auto',
          }"
        />
        <div class="col-span-12 mx-1 -mt-6">
          <DatePicker
            v-model.range="dates"
            mode="date"
            hide-time-header
            trim-weeks
          >
            <template #default="{ inputValue, inputEvents }">
              <div class="flex w-full flex-col gap-4 sm:flex-row">
                <div class="relative grow">
                  <Field
                    v-slot="{ field, errorMessage, handleChange, handleBlur }"
                    name="event.startDateTime"
                  >
                    <BaseInput
                      shape="rounded"
                      label="Date debut"
                      icon="ph:calendar-blank-duotone"
                      :value="inputValue.start"
                      v-on="inputEvents.start"
                      :classes="{
                        input: '!h-11 !ps-11',
                        icon: '!h-11 !w-11',
                      }"
                      :model-value="field.value"
                      :error="errorMessage"
                      :disabled="isSubmitting"
                      type="text"
                      @update:model-value="handleChange"
                      @blur="handleBlur"
                    />
                  </Field>
                </div>
                <div class="relative grow">
                  <Field
                    v-slot="{ field, errorMessage, handleChange, handleBlur }"
                    name="event.endDateTime"
                  >
                    <BaseInput
                      shape="rounded"
                      label="Date fin"
                      icon="ph:calendar-blank-duotone"
                      :value="inputValue.end"
                      v-on="inputEvents.end"
                      :classes="{
                        input: '!h-11 !ps-11',
                        icon: '!h-11 !w-11',
                      }"
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
            </template>
          </DatePicker>
        </div>
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
          <option :value="250">250 per page</option>
          <option :value="500">500 per page</option>
        </BaseSelect>
        <BaseButton
          :disabled="
            authStore.user.appRole.name != UserRole.broadcast &&
            authStore.user.appRole.name != UserRole.superAdmin
          "
          @click="openElementModal()"
          color="primary"
          class="w-full sm:w-20"
        >
          <Icon name="lucide:plus" class="h-4 w-4" />
          <span>Elt</span>
        </BaseButton>
        <BaseButton
          data-tooltip="Exporter le conducteur"
          :disabled="
            authStore.user.appRole.name != UserRole.broadcast &&
            authStore.user.appRole.name != UserRole.superAdmin
          "
          @click="openReportModal()"
          color="primary"
          class="w-full sm:w-28"
        >
          <Icon name="lucide:printer" class="h-4 w-4" />
          <span>Exporter</span>
        </BaseButton>
        <BaseButton
          data-tooltip="Importer une playlist"
          :disabled="
            authStore.user.appRole.name != UserRole.broadcast &&
            authStore.user.appRole.name != UserRole.superAdmin
          "
          @click="isModalImportPlaylistOpen = true"
          color="primary"
          class="w-full sm:w-20"
        >
          <Icon name="lucide:import" class="h-4 w-4" />
          <span>PL</span>
        </BaseButton>
      </template>
      <div class="grid grid-cols-12 gap-4 pb-5">
        <!-- Stat tile -->
        <div class="col-span-12 md:col-span-3">
          <BaseCard class="p-4">
            <div class="mb-1 flex items-center justify-between">
              <BaseHeading
                as="h5"
                size="sm"
                weight="medium"
                lead="tight"
                class="text-muted-500 dark:text-muted-400"
              >
                <span>Total Diffusés</span>
              </BaseHeading>
              <BaseIconBox
                size="xs"
                class="bg-success-100 text-success-500 dark:bg-success-500/20 dark:text-success-400 dark:border-success-500 dark:border-2"
                shape="full"
              >
                <Icon name="ph:target" class="h-5 w-5" />
              </BaseIconBox>
            </div>
            <div class="mb-2">
              <BaseHeading
                as="h4"
                size="2xl"
                weight="bold"
                lead="tight"
                class="text-muted-800 dark:text-white"
              >
                <span v-if="!pending">{{ data?.metaData?.totalDiffused }}</span>
                <span v-else
                  ><BasePlaceload class="h-3 w-10 rounded-lg"
                /></span>
              </BaseHeading>
            </div>
            <div
              class="text-success-500 flex items-center gap-1 font-sans text-sm"
            >
              <span>+0%</span>
              <Icon name="lucide:trending-up" class="h-5 w-5" />
              <span class="text-muted-400 text-xs">en hausse</span>
            </div>
          </BaseCard>
        </div>
        <!-- Stat tile -->
        <div class="col-span-12 md:col-span-3">
          <BaseCard class="p-4">
            <div class="mb-1 flex items-center justify-between">
              <BaseHeading
                as="h5"
                size="sm"
                weight="medium"
                lead="tight"
                class="text-muted-500 dark:text-muted-400"
              >
                <span>Total non diffusés</span>
              </BaseHeading>
              <BaseIconBox
                size="xs"
                class="bg-yellow-100 text-yellow-500 dark:border-2 dark:border-yellow-500 dark:bg-yellow-500/20 dark:text-yellow-400"
                shape="full"
              >
                <Icon name="ph:target" class="h-5 w-5" />
              </BaseIconBox>
            </div>
            <div class="mb-2">
              <BaseHeading
                as="h4"
                size="2xl"
                weight="bold"
                lead="tight"
                class="text-muted-800 dark:text-white"
              >
                <span v-if="!pending">{{
                  data?.metaData?.totalNotDiffused
                }}</span>
                <span v-else
                  ><BasePlaceload class="h-3 w-10 rounded-lg"
                /></span>
              </BaseHeading>
            </div>
            <div
              class="text-danger-500 flex items-center gap-1 font-sans text-sm"
            >
              <span>-0%</span>
              <Icon name="lucide:trending-down" class="h-5 w-5" />
              <span class="text-muted-400 text-xs">en baisse</span>
            </div>
          </BaseCard>
        </div>
        <!-- Stat tile -->
        <div class="col-span-12 md:col-span-3">
          <BaseCard class="p-4">
            <div class="mb-1 flex items-center justify-between">
              <BaseHeading
                as="h5"
                size="sm"
                weight="medium"
                lead="tight"
                class="text-muted-500 dark:text-muted-400"
              >
                <span>Total en attente</span>
              </BaseHeading>
              <BaseIconBox
                size="xs"
                class="bg-primary-100 text-primary-500 dark:bg-primary-500/20 dark:text-primary-400 dark:border-primary-500 dark:border-2"
                shape="full"
              >
                <Icon name="ph:target" class="h-5 w-5" />
              </BaseIconBox>
            </div>
            <div class="mb-2">
              <BaseHeading
                as="h4"
                size="2xl"
                weight="bold"
                lead="tight"
                class="text-muted-800 dark:text-white"
              >
                <span v-if="!pending">{{ data?.metaData?.totalPending }}</span>
                <span v-else
                  ><BasePlaceload class="h-3 w-10 rounded-lg"
                /></span>
              </BaseHeading>
            </div>
            <div
              class="text-success-500 flex items-center gap-1 font-sans text-sm"
            >
              <span>+0%</span>
              <Icon name="lucide:trending-up" class="h-5 w-5" />
              <span class="text-muted-400 text-xs">en hausse</span>
            </div>
          </BaseCard>
        </div>
        <!-- Stat tile -->
        <div class="col-span-12 md:col-span-3">
          <BaseCard class="p-4">
            <div class="mb-1 flex items-center justify-between">
              <BaseHeading
                as="h5"
                size="sm"
                weight="medium"
                lead="tight"
                class="text-muted-500 dark:text-muted-400"
              >
                <span>Total du jour</span>
              </BaseHeading>
              <BaseIconBox
                size="xs"
                class="bg-primary-100 text-primary-500 dark:bg-primary-500/20 dark:text-primary-400 dark:border-primary-500 dark:border-2"
                shape="full"
              >
                <Icon name="ph:target" class="h-5 w-5" />
              </BaseIconBox>
            </div>
            <div class="mb-2">
              <BaseHeading
                as="h4"
                size="2xl"
                weight="bold"
                lead="tight"
                class="text-muted-800 dark:text-white"
              >
                <span v-if="!pending">{{ data?.metaData?.totalToday }}</span>
                <span v-else
                  ><BasePlaceload class="h-3 w-10 rounded-lg"
                /></span>
              </BaseHeading>
            </div>
            <div
              class="text-success-500 flex items-center gap-1 font-sans text-sm"
            >
              <span>+0%</span>
              <Icon name="lucide:trending-up" class="h-5 w-5" />
              <span class="text-muted-400 text-xs">en hausse</span>
            </div>
          </BaseCard>
        </div>
      </div>
      <div id="print-diffusion-list" class="mx-1">
        <div
          v-if="isPrint"
          class="flex justify-between items-center border-b-2 py-1"
        >
          <div shape="straight" class="">
            <img
              v-if="currentOrg?.logo?.includes('r2')"
              class="h-16 pb-1 fit-content"
              :src="currentOrg.logo"
            />
            <img v-else class="h-32 max fit-content" :src="currentOrg.logo" />
          </div>
          <div class="flex justify-end">
            <div>
              <h5
                class="font-heading text-right text-muted-900 text-xs font-medium leading-6 dark:text-white"
              >
                {{ currentOrg?.name ?? '' }}
              </h5>
              <h5
                class="font-heading text-right text-muted-900 text-xs font-medium leading-6 dark:text-white"
              >
                {{ currentOrg?.email ?? '' }}
              </h5>
              <h5
                class="font-heading text-right text-muted-900 text-xs font-medium leading-6 dark:text-white"
              >
                {{ currentOrg?.address ?? '' }}
              </h5>
            </div>
          </div>
        </div>
        <div class="justify-center">
          <h1
            v-if="isPrint"
            class="font-heading text-muted-900 text-xl text-center font-bold pb-2 pt-1 px-2 leading-6 dark:text-white"
          >
            Conducteur Publicitaire
          </h1>
          <h4
            v-if="isPrint"
            class="font-heading text-muted-900 text-md font-medium text-center pb-2 pt-1 px-2 leading-6 dark:text-white"
          >
            Periode de l'export: du
            {{ new Date(initialDates.start).toLocaleDateString('fr-FR') }} au
            {{ new Date(initialDates.end).toLocaleDateString('fr-FR') }}
          </h4>
          <h5
            v-if="isPrint"
            class="font-heading text-muted-900 text-xs font-medium text-center leading-6 py-1 px-2 dark:text-white"
          >
            Fait par {{ authStore.user.firstName }}
            {{ authStore.user.lastName }}
          </h5>
        </div>
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
          <div v-else-if="pending">
            <TairoTableRow v-for="index in 5" :key="index">
              <TairoTableCell spaced>
                <div class="flex items-center">
                  <BaseCheckbox
                    v-model="fakeItems"
                    :value="`placeload-item-checkbox-${index}`"
                    rounded="full"
                    color="primary"
                  />
                </div>
              </TairoTableCell>
              <TairoTableCell spaced>
                <BasePlaceload class="h-3 w-24 rounded-lg" />
              </TairoTableCell>
              <TairoTableCell spaced>
                <div class="flex items-center gap-2">
                  <BasePlaceload class="size-8 shrink-0 rounded-full" />
                  <div class="space-y-1">
                    <BasePlaceload class="h-2 w-[70px] rounded-lg" />
                    <BasePlaceload class="h-2 w-[50px] rounded-lg" />
                  </div>
                </div>
              </TairoTableCell>
              <TairoTableCell light spaced>
                <BasePlaceload class="h-3 w-12 rounded-lg" />
              </TairoTableCell>
              <TairoTableCell light spaced>
                <BasePlaceload class="h-3 w-12 rounded-lg" />
              </TairoTableCell>
              <TairoTableCell light spaced>
                <BasePlaceload class="h-3 w-12 rounded-lg" />
              </TairoTableCell>
              <TairoTableCell light spaced>
                <BasePlaceload class="h-3 w-12 rounded-lg" />
              </TairoTableCell>
              <TairoTableCell light spaced>
                <BasePlaceload class="h-3 w-12 rounded-lg" />
              </TairoTableCell>
              <TairoTableCell light spaced>
                <BasePlaceload class="h-3 w-12 rounded-lg" />
              </TairoTableCell>
              <TairoTableCell light spaced>
                <BasePlaceload class="h-3 w-12 rounded-lg" />
              </TairoTableCell>
              <TairoTableCell spaced>
                <BasePlaceload class="h-8 w-16 rounded-lg" />
              </TairoTableCell>
            </TairoTableRow>
          </div>
          <div v-else>
            <div class="w-full">
              <TairoTable shape="rounded">
                <template #header>
                  <TairoTableHeading
                    v-if="!isPrint"
                    uppercase
                    spaced
                    class="p-4"
                  >
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
                  <TairoTableHeading v-if="!isPrint" uppercase spaced>
                    Pos
                  </TairoTableHeading>
                  <TairoTableHeading uppercase spaced> Date </TairoTableHeading>
                  <TairoTableHeading uppercase spaced>
                    Heure
                  </TairoTableHeading>
                  <!-- <TairoTableHeading uppercase spaced> Pos </TairoTableHeading> -->
                  <TairoTableHeading uppercase spaced>
                    Annonceur
                  </TairoTableHeading>

                  <TairoTableHeading uppercase spaced>
                    Produit
                  </TairoTableHeading>
                  <TairoTableHeading uppercase spaced
                    >Titre du message</TairoTableHeading
                  >
                  <TairoTableHeading uppercase spaced>Durée</TairoTableHeading>
                  <TairoTableHeading v-if="!isPrint" uppercase spaced
                    >Fichier</TairoTableHeading
                  >
                  <TairoTableHeading v-if="!isPrint" uppercase spaced
                    >Statut</TairoTableHeading
                  >
                  <TairoTableHeading v-if="!isPrint" uppercase spaced
                    >Action</TairoTableHeading
                  >
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
                  <TairoTableCell v-if="!isPrint" spaced>
                    <div class="flex items-center">
                      <BaseCheckbox
                        v-model="selected"
                        :value="item._id"
                        :name="`item-checkbox-${item._id}`"
                        shape="rounded"
                        class="text-primary-500"
                      />
                    </div>
                  </TairoTableCell>
                  <TairoTableCell v-if="!isPrint" spaced>
                    <BaseButtonAction
                      class="mx-1 !p-1"
                      @click.prevent="updatePosition(item, false)"
                    >
                      <Icon name="lucide:arrow-up" class="h-4 w-4" />
                    </BaseButtonAction>
                    <BaseButtonAction
                      class="mx-1 !p-1"
                      @click.prevent="updatePosition(item, true)"
                    >
                      <Icon name="lucide:arrow-down" class="h-4 w-4" />
                    </BaseButtonAction>
                  </TairoTableCell>
                  <TairoTableCell spaced>
                    <div class="flex items-center">
                      <span
                        class="text-muted-600 dark:text-muted-300 font-sans text-base"
                      >
                        {{ new Date(item.date).toLocaleDateString('fr-FR') }}
                      </span>
                    </div>
                  </TairoTableCell>
                  <TairoTableCell spaced>
                    <div class="flex items-center">
                      <span
                        class="text-muted-600 dark:text-muted-300 font-sans text-base"
                      >
                        {{ new Date(item.date).toLocaleTimeString('fr-FR') }}
                      </span>
                    </div>
                  </TairoTableCell>
                  <!-- <TairoTableCell spaced>
                  <div class="flex items-center">
                    <span
                      class="text-muted-600 dark:text-muted-300 font-sans text-base"
                    >
                    </span>
                  </div>
                </TairoTableCell> -->

                  <TairoTableCell spaced>
                    <div
                      style="white-space: pre-wrap; word-wrap: break-word"
                      class="flex items-center"
                    >
                      <!-- <BaseAvatar
                        :src="
                          item.product?.announcer?.logo ??
                          '/img/avatars/company.svg'
                        "
                        :text="item.initials"
                        :class="getRandomColor()"
                      /> -->
                      <div class="ms-3 !w-44 leading-none">
                        <h4 class="font-sans text-sm font-medium">
                          {{ item.product?.package?.announcer?.name }}
                        </h4>
                        <p class="text-muted-400 font-sans text-xs">
                          {{ item.product?.package?.announcer?.email }}
                        </p>
                      </div>
                    </div>
                  </TairoTableCell>

                  <TairoTableCell spaced>
                    <div
                      style="white-space: pre-wrap; word-wrap: break-word"
                      class="flex items-center"
                    >
                      <NuxtLink
                        class="text-primary-500 !w-40 underline-offset-4 hover:underline"
                        :to="
                          '/bo/pub/package-details/' +
                          item.product?.package?._id
                        "
                      >
                        {{ item.product.product }}
                      </NuxtLink>
                    </div>
                  </TairoTableCell>
                  <TairoTableCell light spaced>
                    <div
                      style="white-space: pre-wrap; word-wrap: break-word"
                      class=""
                    >
                      <BaseText
                        size="sm"
                        class="hover:cursor-pointer !w-40"
                        @click="
                          handleClipboard(
                            item.product.message + '[' + item.code + ']',
                          )
                        "
                      >
                        <span
                          class="text-muted-600 dark:text-muted-300 font-sans !w-40 !text-sm px-1"
                        >
                          {{ item.product.message }} [{{ item.code }}]
                        </span>
                        <Icon
                          v-if="!isPrint"
                          name="ph:link-duotone"
                          class="h-5 w-5"
                      /></BaseText>
                    </div>
                  </TairoTableCell>
                  <TairoTableCell spaced>
                    <div class="flex items-center">
                      <span
                        class="text-muted-600 dark:text-muted-300 font-sans text-base"
                      >
                        {{ item.product.duration ?? '50s' }}
                      </span>
                    </div>
                  </TairoTableCell>
                  <TairoTableCell v-if="!isPrint" spaced>
                    <div class="flex">
                      <a
                        v-if="item.product?.file"
                        class="text-white bg-muted-600 px-2 py-1 rounded"
                        :href="'/' + item.product?.file"
                        target="_blank"
                      >
                        <Icon name="lucide:eye" class="h-4 w-4"
                      /></a>

                      <BaseButtonAction
                        v-if="item.product?.file"
                        class="mx-4"
                        @click.prevent="
                          downloadProductFile(item.product?.file, item)
                        "
                      >
                        <Icon name="lucide:download" class="h-4 w-4" />
                      </BaseButtonAction>
                    </div>
                  </TairoTableCell>
                  <TairoTableCell v-if="!isPrint" spaced class="capitalize">
                    <BaseTag
                      v-if="
                        item.isManualPlay == true || item.isAutoPlay == true
                      "
                      color="success"
                      flavor="pastel"
                      shape="full"
                      condensed
                      class="font-medium"
                    >
                      Diffusé
                    </BaseTag>
                    <BaseTag
                      v-else-if="
                        item.isManualPlay == false && item.isAutoPlay == false
                      "
                      color="warning"
                      flavor="pastel"
                      shape="full"
                      condensed
                      class="font-medium"
                    >
                      Non Diffusé
                    </BaseTag>
                    <!-- <BaseTag
                    v-else-if="item.status === 'offline'"
                    color="muted"
                    flavor="pastel"
                    shape="full"
                    condensed
                    class="font-medium"
                  >
                    {{ item.status }}
                  </BaseTag> -->
                  </TairoTableCell>

                  <TairoTableCell v-if="!isPrint" spaced>
                    <div class="flex justify-center">
                      <BaseButtonAction
                        @click.prevent="selectPlanning(item)"
                        muted
                        :disabled="
                          authStore.user.appRole.name != UserRole.broadcast &&
                          authStore.user.appRole.name != UserRole.superAdmin
                        "
                        :class="{
                          '!text-orange-400':
                            item.isManualPlay == false &&
                            item.isAutoPlay == false,
                          '!text-success-500':
                            item.isManualPlay == true ||
                            item.isAutoPlay == true,
                        }"
                      >
                        <Icon name="lucide:check" class="h-4 w-4" />
                        valider</BaseButtonAction
                      >
                      <BaseButtonAction
                        class="mx-2"
                        @click.prevent="editPlanning(item)"
                      >
                        <Icon name="lucide:edit" class="h-4 w-4" />
                      </BaseButtonAction>
                      <BaseButtonAction
                        class="mx-2"
                        @click.prevent="confirmDeletePlanning(item)"
                      >
                        <Icon
                          name="lucide:trash"
                          class="h-4 w-4 text-danger-500"
                        />
                      </BaseButtonAction>
                    </div>
                  </TairoTableCell>
                </TairoTableRow>
              </TairoTable>
            </div>
            <div v-if="!isPrint" class="mt-6">
              <BasePagination
                :total-items="data?.total ?? 0"
                :item-per-page="perPage"
                :current-page="page"
                shape="curved"
              />
            </div>
          </div>
        </div>
      </div>
    </TairoContentWrapper>

    <!-- Modal export diffusion list -->
    <TairoModal
      :open="isModalDiffusionListOpen"
      size="xl"
      @close="isModalDiffusionListOpen = false"
    >
      <template #header>
        <!-- Header -->
        <div class="flex w-full items-center justify-between p-4 md:p-6">
          <h3
            class="font-heading text-muted-900 text-lg font-medium leading-6 dark:text-white"
          >
            Conducteur publicitaire
          </h3>

          <BaseButtonClose @click="isModalDiffusionListOpen = false" />
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
                <div class="col-span-12 sm:col-span-6 mt-2">
                  <Field
                    v-slot="{ errorMessage, handleChange, handleBlur }"
                    name="report.org"
                  >
                    <BaseListbox
                      label="Société"
                      :items="orgs.data"
                      :classes="{
                        wrapper: '!w-60',
                      }"
                      :properties="{
                        value: '_id',
                        label: 'name',
                        sublabel: 'email',
                        media: '',
                      }"
                      v-model="currentOrg"
                      :error="errorMessage"
                      @update:model-value="handleChange"
                      @blur="handleBlur"
                    />
                  </Field>
                </div>
                <div class="flex justify-between pt-5">
                  <div class="col-span-12 md:col-span-6 mt-2">
                    <label for="start">Date debut: </label>
                    <input
                      type="date"
                      id="start"
                      name="report-start"
                      v-model="startDate"
                    />
                  </div>
                  <div class="col-span-12 md:col-span-6 mt-2">
                    <label for="start">Date de fin: </label>
                    <input
                      type="date"
                      id="end"
                      name="report-start"
                      v-model="endDate"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </form>
      </BaseCard>
      <template #footer>
        <!-- Footer -->
        <div class="p-4 md:p-6">
          <div class="flex gap-x-2">
            <BaseButton @click="isModalDiffusionListOpen = false"
              >Annuler</BaseButton
            >

            <BaseButton
              color="primary"
              flavor="solid"
              @click="printDiffusionList()"
            >
              Imprimer
            </BaseButton>
          </div>
        </div>
      </template>
    </TairoModal>

    <!-- Modal new diffusion element -->
    <TairoModal
      :open="isModalDiffusionElementOpen"
      size="xl"
      @close="isModalDiffusionElementOpen = false"
    >
      <template #header>
        <!-- Header -->
        <div class="flex w-full items-center justify-between p-4 md:p-6">
          <h3
            class="font-heading text-muted-900 text-lg font-medium leading-6 dark:text-white"
          >
            Nouvel Element du Conducteur
          </h3>

          <BaseButtonClose @click="isModalDiffusionElementOpen = false" />
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
              <div class="grid grid-cols-12 gap-4">
                <div class="ltablet:col-span-6 col-span-12 lg:col-span-6">
                  <BaseAutocomplete
                    v-model="currentCampaign"
                    :disabled="isSubmitting"
                    :items="allPackages"
                    :display-value="(item: any) => item.name || ''"
                    :filter-items="filterItems"
                    icon="lucide:target"
                    placeholder="e.g. Diffusion spot"
                    label="Campagne"
                    clearable
                    :clear-value="''"
                  >
                    <template #empty="value"> Aucun resultat </template>
                  </BaseAutocomplete>
                </div>

                <div
                  v-if="currentCampaign.id"
                  class="col-span-12 sm:col-span-6"
                >
                  <Field
                    v-slot="{ errorMessage, handleChange, handleBlur }"
                    name="report.product"
                  >
                    <BaseListbox
                      label="Produit"
                      :items="currentCampaign?.products"
                      :classes="{
                        wrapper: '!w-60',
                      }"
                      :properties="{
                        value: '_id',
                        label: 'message',
                        sublabel: 'tag',
                        media: '',
                      }"
                      v-model="currentProduct"
                      :error="errorMessage"
                      @update:model-value="handleChange"
                      @blur="handleBlur"
                    />
                  </Field>
                </div>
                <div class="ltablet:col-span-6 col-span-12 lg:col-span-6">
                  <Field
                    v-slot="{ errorMessage, handleChange, handleBlur }"
                    name="campaign.year"
                  >
                    <BaseSelect
                      v-model="currentYear"
                      label="Année *"
                      icon="ph:funnel"
                      :error="errorMessage"
                      @update:model-value="handleChange"
                      @blur="handleBlur"
                    >
                      <option value="2024">2024</option>
                      <option value="2023">2023</option>
                    </BaseSelect>
                  </Field>
                </div>
                <div class="ltablet:col-span-6 col-span-12 lg:col-span-6">
                  <Field
                    v-slot="{ errorMessage, handleChange, handleBlur }"
                    name="campaign.month"
                  >
                    <BaseSelect
                      v-model="currentMonth"
                      label="Mois *"
                      icon="ph:funnel"
                      :error="errorMessage"
                      @update:model-value="handleChange"
                      @blur="handleBlur"
                    >
                      <option value="00">Janvier</option>
                      <option value="01">Fevrier</option>
                      <option value="02">Mars</option>
                      <option value="03">Avril</option>
                      <option value="04">Mai</option>
                      <option value="05">Juin</option>
                      <option value="06">Juillet</option>
                      <option value="07">Aûut</option>
                      <option value="08">Septembre</option>
                      <option value="09">Octobre</option>
                      <option value="10">Novembre</option>
                      <option value="11">Décembre</option>
                    </BaseSelect>
                  </Field>
                </div>

                <div
                  v-if="currentCampaign.id"
                  class="ltablet:col-span-6 col-span-12 lg:col-span-6"
                >
                  <BaseAutocomplete
                    v-model="currentHour"
                    :disabled="isSubmitting"
                    :items="transformedAllHours"
                    :display-value="(item: any) => item.name || ''"
                    :filter-items="filterItems"
                    icon="lucide:clock"
                    placeholder="e.g. 07:25"
                    label="Heure"
                    clearable
                    :clear-value="''"
                  >
                    <template #empty="value"> Aucun resultat </template>
                  </BaseAutocomplete>
                </div>
                <div
                  v-if="currentCampaign.id"
                  class="ltablet:col-span-6 col-span-12 lg:col-span-6"
                >
                  <Field
                    v-slot="{ errorMessage, handleChange, handleBlur }"
                    name="jour"
                  >
                    <BaseInput
                      v-model="currentDay"
                      label="Jour"
                      icon="ph:file"
                      placeholder=""
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
        </form>
      </BaseCard>
      <template #footer>
        <!-- Footer -->
        <div class="p-4 md:p-6">
          <div class="flex gap-x-2">
            <BaseButton @click="isModalDiffusionElementOpen = false"
              >Annuler</BaseButton
            >

            <BaseButton
              :disabled="isActionLoading"
              :loading="isActionLoading"
              color="primary"
              flavor="solid"
              @click="addSpotToPlanning()"
            >
              Créer
            </BaseButton>
          </div>
        </div>
      </template>
    </TairoModal>

    <!-- Modal import playlist -->
    <TairoModal
      :open="isModalImportPlaylistOpen"
      size="xl"
      @close="isModalImportPlaylistOpen = false"
    >
      <template #header>
        <!-- Header -->
        <div class="flex w-full items-center justify-between p-4 md:p-6">
          <h3
            class="font-heading text-muted-900 text-lg font-medium leading-6 dark:text-white"
          >
            Import playlist
          </h3>

          <BaseButtonClose @click="isModalImportPlaylistOpen = false" />
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
                <div>
                  <div class="col-span-12 sm:col-span-6 mt-2">
                    <Field
                      v-slot="{ field, errorMessage, handleChange, handleBlur }"
                      name="montant"
                    >
                      <BaseInput
                        label="Message"
                        icon="ph:file"
                        placeholder=""
                        :model-value="field.value"
                        :error="errorMessage"
                        :disabled="isSubmitting"
                        type="text"
                        @update:model-value="handleChange"
                        @blur="handleBlur"
                      />
                    </Field>
                  </div>
                  <div class="col-span-12 mx-2 mt-2">
                    <DatePicker
                      v-model.range="planningDates"
                      mode="date"
                      hide-time-header
                      trim-weeks
                    >
                      <template #default="{ inputValue, inputEvents }">
                        <div class="flex w-full flex-col gap-4 sm:flex-row">
                          <div class="relative grow">
                            <Field
                              v-slot="{
                                field,
                                errorMessage,
                                handleChange,
                                handleBlur,
                              }"
                              name="event.startDateTime"
                            >
                              <BaseInput
                                shape="curved"
                                label="Date debut"
                                icon="ph:calendar-blank-duotone"
                                :value="inputValue.start"
                                v-on="inputEvents.start"
                                :classes="{
                                  input: '!h-11 !ps-11',
                                  icon: '!h-11 !w-11',
                                }"
                                :model-value="field.value"
                                :error="errorMessage"
                                :disabled="isSubmitting"
                                type="text"
                                @update:model-value="handleChange"
                                @blur="handleBlur"
                              />
                            </Field>
                          </div>
                          <div class="relative grow">
                            <Field
                              v-slot="{
                                field,
                                errorMessage,
                                handleChange,
                                handleBlur,
                              }"
                              name="event.endDateTime"
                            >
                              <BaseInput
                                shape="curved"
                                label="Date fin"
                                icon="ph:calendar-blank-duotone"
                                :value="inputValue.end"
                                v-on="inputEvents.end"
                                :classes="{
                                  input: '!h-11 !ps-11',
                                  icon: '!h-11 !w-11',
                                }"
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
                      </template>
                    </DatePicker>
                  </div>
                  <div class="col-span-12 sm:col-span-6 mt-2">
                    <BaseInputFile
                      v-model="inputPlayListFile"
                      shape="rounded"
                      label="Fichier"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </form>
      </BaseCard>
      <template #footer>
        <!-- Footer -->
        <div class="p-4 md:p-6">
          <div class="flex gap-x-2">
            <BaseButton @click="isModalImportPlaylistOpen = false"
              >Annuler</BaseButton
            >

            <BaseButton
              color="primary"
              flavor="solid"
              @click="importPlayList()"
            >
              Importer
            </BaseButton>
          </div>
        </div>
      </template>
    </TairoModal>

    <!-- Modal confirm diffusion -->
    <TairoModal
      :open="isModalConfirmDiffusionOpen"
      size="sm"
      @close="isModalConfirmDiffusionOpen = false"
    >
      <template #header>
        <!-- Header -->
        <div class="flex w-full items-center justify-between p-4 md:p-6">
          <h3
            class="font-heading text-muted-900 text-lg font-medium leading-6 dark:text-white"
          >
            Confirmation de diffusion
          </h3>

          <BaseButtonClose @click="isModalConfirmDiffusionOpen = false" />
        </div>
      </template>

      <!-- Body -->
      <div class="p-4 md:p-6">
        <div class="mx-auto w-full max-w-xs text-center">
          <h3
            class="font-heading text-muted-800 text-lg font-medium leading-6 dark:text-white"
          >
            Voulez-vous confirmer la diffusion de
            <span class="text-primary-500">{{
              currentPlanning?.product?.message
            }}</span>
            à
            <span class="text-primary-500">{{
              currentPlanning?.hour?.code
            }}</span>
            ?
          </h3>
          <div class="col-span-12 sm:col-span-6 my-2">
            <BaseInput
              label="Préciser une autre heure: ex: 08:25"
              icon="ph:clock"
              placeholder=""
              v-model="playedHour"
              :error="errorMessage"
              :disabled="isSubmitting"
              type="text"
              @update:model-value="handleChange"
              @blur="handleBlur"
            />
          </div>

          <p
            class="font-alt text-muted-500 dark:text-muted-400 text-sm leading-5"
          >
            Cette action est reversible
          </p>
        </div>
      </div>

      <template #footer>
        <!-- Footer -->
        <div class="p-4 md:p-6">
          <div class="flex gap-x-2">
            <BaseButton @click="isModalConfirmDiffusionOpen = false"
              >Annuler</BaseButton
            >

            <BaseButton
              color="primary"
              flavor="solid"
              @click="confirmDiffusion(currentPlanning)"
              >Valider</BaseButton
            >
          </div>
        </div>
      </template>
    </TairoModal>

    <!-- Modal Edit planning -->
    <TairoModal
      :open="isModalNewPlanningOpen"
      size="sm"
      @close="isModalNewPlanningOpen = false"
    >
      <template #header>
        <!-- Header -->
        <div class="flex w-full items-center justify-between p-4 md:p-6">
          <h3
            class="font-heading text-muted-900 text-lg font-medium leading-6 dark:text-white"
          >
            {{ isEdit ? 'Mise à jour planning' : 'Nouveau planning' }}
          </h3>

          <BaseButtonClose @click="isModalNewPlanningOpen = false" />
        </div>
      </template>

      <!-- Body -->
      <div class="p-4 md:p-6">
        <div class="mx-auto w-full max-w-xs text-center">
          <h3
            class="font-heading text-muted-800 text-lg font-medium leading-6 dark:text-white"
          >
            Diffusion de:
            <span class="text-primary-500">{{
              currentPlanning?.product?.message
            }}</span>
            à
            <span class="text-primary-500">{{
              currentPlanning?.hour?.code
            }}</span>
            ?
          </h3>
          <div class="ltablet:col-span-6 col-span-12 lg:col-span-6 my-2">
            <BaseAutocomplete
              v-model="currentHour"
              :error="errorMessage"
              :disabled="isSubmitting"
              :items="transformedAllHours"
              :display-value="(item: any) => item.name || ''"
              :filter-items="filterItems"
              icon="lucide:clock"
              placeholder="e.g. 07:25"
              label="Heure"
              clearable
              :clear-value="''"
            >
              <template #empty="value"> Aucun resultat </template>
            </BaseAutocomplete>
          </div>

          <p
            class="font-alt text-muted-500 dark:text-muted-400 text-sm leading-5"
          >
            Cette action est reversible
          </p>
        </div>
      </div>

      <template #footer>
        <!-- Footer -->
        <div class="p-4 md:p-6">
          <div class="flex gap-x-2">
            <BaseButton @click="isModalNewPlanningOpen = false"
              >Annuler</BaseButton
            >

            <BaseButton
              :disabled="isActionLoading"
              :loading="isActionLoading"
              color="primary"
              flavor="solid"
              @click="updateHour()"
              >Valider</BaseButton
            >
          </div>
        </div>
      </template>
    </TairoModal>

    <!-- Modal delete spot -->
    <TairoModal
      :open="isModalDeletePlanningOpen"
      size="sm"
      @close="isModalDeletePlanningOpen = false"
    >
      <template #header>
        <!-- Header -->
        <div class="flex w-full items-center justify-between p-4 md:p-6">
          <h3
            class="font-heading text-muted-900 text-lg font-medium leading-6 dark:text-white"
          >
            Delete Planning
          </h3>

          <BaseButtonClose @click="isModalDeletePlanningOpen = false" />
        </div>
      </template>

      <!-- Body -->
      <div class="p-4 md:p-6">
        <div class="mx-auto w-full max-w-xs text-center">
          <h3
            class="font-heading text-muted-800 text-lg font-medium leading-6 dark:text-white"
          >
            Voulez-vous supprimer la diffusion de
            <span class="text-primary-500">{{
              currentPlanning?.product?.message
            }}</span>
            à
            <span class="text-primary-500">{{
              new Date(currentPlanning?.date).toLocaleTimeString('fr-FR')
            }}</span>
            ?
          </h3>
          <p
            class="font-alt text-muted-500 dark:text-muted-400 text-sm leading-5"
          >
            Cette action est reversible
          </p>
        </div>
      </div>

      <template #footer>
        <!-- Footer -->
        <div class="p-4 md:p-6">
          <div class="flex gap-x-2">
            <BaseButton @click="isModalDeletePlanningOpen = false"
              >Annuler</BaseButton
            >

            <BaseButton
              :disabled="isActionLoading"
              :loading="isActionLoading"
              color="danger"
              flavor="solid"
              @click="deletePlanning(currentPlanning)"
              >Valider</BaseButton
            >
          </div>
        </div>
      </template>
    </TairoModal>
  </div>
</template>
