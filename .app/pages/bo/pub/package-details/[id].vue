<script setup lang="ts">
import { toTypedSchema } from '@vee-validate/zod'
import { Field, useFieldError, useForm } from 'vee-validate'
import { z } from 'zod'
import { UserRole } from '~/types/user'
import moment from 'moment'

definePageMeta({
  title: 'Produits - Annonceur',
  preview: {
    title: 'Produits - Annonceur',
    description: 'Contribution and withdrawal',
    categories: ['bo', 'pub', 'orders'],
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
const perPage = ref(20)
const token = useCookie('token')

const toaster = useToaster()
// Check if can have access
if (
  authStore.user.appRole.name != UserRole.mediaPlanner &&
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

const { data: hoursData } = await useFetch('/api/pub/hours', {
  query: queryHours,
})

const isModalNewSpotOpen = ref(false)
const isModalDeleteSpotOpen = ref(false)
const isModalPlanningOpen = ref(false)
const isModalNewSpotPlanningOpen = ref(false)
const isModalConfirmPlanningOpen = ref(false)
const isModalUploadProductFileOpen = ref(false)
const isEdit = ref(false)
const isPrintPlanning = ref(false)
const isPrintCertificate = ref(false)
const activeProduct = ref({ _id: '', product: '', tag: '', flag: '' })
const currentProduct = ref({})
const phoneNumber = ref('')
const formatter = new Intl.DateTimeFormat('fr', { month: 'long' })
const activeDate = ref(new Date())
const activeDay = ref('')
const activeHour = ref({})
var activeDays = ref(
  new Date(
    activeDate.value.getFullYear(),
    activeDate.value.getMonth() + 1,
    0,
  ).getDate(),
)
const initDate = ref(false)

function addMonth() {
  const date = new Date(activeDate.value)
  initDate.value = false
  date.setMonth(date.getMonth() + 1)
  activeDate.value = date
  activeDays.value = new Date(
    date.getFullYear(),
    date.getMonth() + 1,
    0,
  ).getDate()

  console.log(date.getMonth() + 1)
  console.log(activeDays)
}

function removeMonth() {
  const date = new Date(activeDate.value)
  date.setMonth(date.getMonth() - 1)
  activeDate.value = date
  activeDays.value = new Date(
    date.getFullYear(),
    date.getMonth() + 1,
    0,
  ).getDate()
  console.log(date.getMonth())
  console.log(activeDays)
}

function dayOfWeek(d: number) {
  var date = new Date(
    activeDate.value.getFullYear(),
    activeDate.value.getMonth(),
    d,
  )
  return new Date(
    activeDate.value.getFullYear(),
    activeDate.value.getMonth(),
    d,
  )
    .toLocaleDateString('fr-FR', {
      weekday: 'long',
    })
    .toString()
    .toLocaleUpperCase()
}

function openSpotPlanningModal(day: string, hour: any) {
  activeDay.value = day
  activeHour.value = hour
  isModalNewSpotPlanningOpen.value = true
}
async function addSpotToPlanning() {
  console.log('Adding product to the planning')
  const hourArray = activeHour.value?.code.split(':')
  var date = new Date(
    activeDate.value.getFullYear(),
    activeDate.value.getMonth(),
    parseInt(activeDay.value),
    parseInt(hourArray[0]),
    parseInt(hourArray[1]),
  )

  console.log(date.toISOString())

  const spotPlanning = {
    product: activeProduct.value._id,
    hour: activeHour.value._id,
    date: date.toISOString(),
    isManualPlay: false,
    isAutoPlay: false,
  }

  try {
    const isSuccess = ref(false)
    const response = await $fetch(
      '/api/pub/plannings?action=createPlanning&token=' +
        token.value +
        '&packageId=' +
        data.value?.data?._id +
        '&orderCode=' +
        data.value?.data?.code,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: {
          ...spotPlanning,
          _id: undefined,
        },
      },
    )

    console.log(response)
    isSuccess.value = response?.success
    if (isSuccess.value == true) {
      success.value = true
      data.value?.data?.plannings.push(response.data)
      toaster.clearAll()
      toaster.show({
        title: 'Success',
        message:
          isEdit.value == false
            ? `Produit ajouté au planning !`
            : `Produit mis à jour`,
        color: 'success',
        icon: 'ph:check',
        closable: true,
      })
    } else {
      toaster.clearAll()
      toaster.show({
        title: 'Oops',
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
      title: 'Oops!',
      message: 'Veuillez examiner les erreurs dans le formulaire',
      color: 'danger',
      icon: 'lucide:alert-triangle',
      closable: true,
    })
    // return
  }
  console.log(data.value?.data?.plannings)

  isModalNewSpotPlanningOpen.value = false
}

function checkEmptyPlanning(h: any) {
  if (isPrintPlanning.value == true || isPrintCertificate.value == true) {
    var plannedSpots = data.value?.data?.plannings?.filter(
      (p: any) => moment(p.date).format('HH:mm') == h.name,
    )
    if (plannedSpots.length == 0) {
      return false
    } else {
      return true
    }
  } else {
    return true
  }
}

function checkSpot(d: number, hour: string) {
  const hourArray = hour.split(':')
  var date = new Date(
    activeDate.value.getFullYear(),
    activeDate.value.getMonth(),
    d,
    parseInt(hourArray[0]),
    parseInt(hourArray[1]),
  )

  var plannedSpots = data.value?.data?.plannings?.filter(
    (p: any) =>
      new Date(p.date).toLocaleString('fr-FR') == date?.toLocaleString('fr-FR'),
  )
  if (plannedSpots.length == 0) {
    return ['+', 'default']
  } else {
    const dateNow = new Date().toLocaleString('fr-FR')
    const dateNowTime = new Date().getTime()
    var dateP = new Date(plannedSpots[0].date).toLocaleString('fr-FR')
    var datePTime = new Date(plannedSpots[0].date).getTime()
    // console.log(plannedSpots[0])
    if (isPrintPlanning.value == true) {
      return [plannedSpots[0].product.tag, 'warning']
    }

    console.log(dateP)
    console.log(dateNow)
    console.log('')
    if (datePTime < dateNowTime) {
      console.log('danger')
    } else {
      console.log('pas danger')
    }

    if (
      datePTime < dateNowTime &&
      plannedSpots[0].isManualPlay == false &&
      plannedSpots[0].isAutoPlay == false &&
      isPrintCertificate.value == false
    ) {
      return [plannedSpots[0].product.tag, 'danger']
    } else if (
      datePTime < dateNowTime &&
      (plannedSpots[0].isManualPlay == true ||
        plannedSpots[0].isAutoPlay == true)
    ) {
      return [plannedSpots[0].product.tag, 'primary']
    } else if (datePTime > dateNowTime && isPrintCertificate.value == false) {
      // console.log(dateP)
      // console.log(dateNow)
      return [plannedSpots[0].product.tag, 'warning']
    } else {
      return ['+', 'default']
    }
  }
}

watch([filter, perPage], () => {
  router.push({
    query: {
      page: undefined,
    },
  })
})

const app = useAppStore()
const packageId = computed(() => route.params.id)
const query = computed(() => {
  return {
    action: 'findOne',
    id: packageId.value,
    token: token.value,
  }
})

const { data, pending, error, refresh } = await useFetch('/api/pub/packages', {
  query,
})

if (data.value) {
  console.log(data.value)
}

function editSpot(product: any) {
  isModalNewSpotOpen.value = true
  isEdit.value = true
  setFieldValue('product._id', product._id)
  setFieldValue('product.product', product.product)
  setFieldValue('product.message', product.message)
  setFieldValue('product.duration', product.duration)
  setFieldValue('product.package', product.package)
}

function confirmDeleteSpot(product: any) {
  isModalDeleteSpotOpen.value = true
  isEdit.value = false
  currentProduct.value = product
}

async function deleteSpot(product: any) {
  const query2 = computed(() => {
    return {
      action: 'delete',
      token: token.value,
      id: product._id,
    }
  })

  const response = await useFetch('/api/pub', {
    method: 'delete',
    headers: { 'Content-Type': 'application/json' },
    query: query2,
  })

  if (response.data?.value?.success) {
    success.value = true
    toaster.clearAll()
    toaster.show({
      title: 'Success',
      message: `Produit supprimé !`,
      color: 'success',
      icon: 'ph:check',
      closable: true,
    })
    isModalDeleteSpotOpen.value = false
    filter.value = 'product'
    filter.value = ''
  } else {
    toaster.clearAll()
    toaster.show({
      title: 'Oops',
      message: `Une erreur est survenue !`,
      color: 'danger',
      icon: 'ph:check',
      closable: true,
    })
  }
}

function printPlanning(typeDoc: string) {
  console.log(typeDoc)
  if (typeDoc == 'planning') {
    isPrintPlanning.value = true
  } else if (typeDoc == 'certificate') {
    isPrintCertificate.value = true
  }

  setTimeout(() => {
    var printContents = document.getElementById('planningPrint').innerHTML
    var originalContents = document.body.innerHTML
    document.body.innerHTML = printContents
    window.print()
    document.body.innerHTML = originalContents
    location.reload()
  }, 500)
}

function openProductFileModal(item: any) {
  currentProduct.value = item
  isModalUploadProductFileOpen.value = true
}

async function importProductFile() {
  const slug = ref('null')
  try {
    const fd = new FormData()
    fd.append('0', productFile.value)
    const query3 = computed(() => {
      return {
        action: 'import-product-file',
        token: token.value,
        dir: 'uploads/productsFiles',
      }
    })

    const { data: uploadData, refresh } = await useFetch('/api/files/upload', {
      method: 'POST',
      query: query3,
      body: fd,
    })
    console.log(uploadData)
    if (uploadData.value?.success == true) {
      const query4 = computed(() => {
        return {
          action: 'updateSpot',
          token: token.value,
          id: currentProduct.value._id,
        }
      })

      const response = await useFetch('/api/pub', {
        method: 'put',
        headers: { 'Content-Type': 'application/json' },
        query: query4,
        body: {
          ...currentProduct.value,
          file: uploadData.value?.fileName,
        },
      })
      if (response.data.value?.success) {
        toaster.clearAll()
        toaster.show({
          title: 'Success',
          message: `Mise à jour terminé !`,
          color: 'success',
          icon: 'ph:check',
          closable: true,
        })
        location.reload()
      } else {
        toaster.clearAll()
        toaster.show({
          title: 'Oops',
          message: `Une erreur est survenue lors de la mise à jour du produit !`,
          color: 'danger',
          icon: 'ph:check',
          closable: true,
        })
      }
    } else {
      slug.value = ''
      toaster.clearAll()
      toaster.show({
        title: 'Oops',
        message: `Une erreur est survenue lors de l'importation du fichier !`,
        color: 'danger',
        icon: 'ph:check',
        closable: true,
      })
    }
  } catch (error) {}
  isModalUploadProductFileOpen.value = false
}

const selected = ref<number[]>([])
const isAllVisibleSelected = computed(() => {
  return selected.value.length === data.value?.data?.products?.length
})

function toggleAllVisibleSelection() {
  if (isAllVisibleSelected.value) {
    selected.value = []
  } else {
    selected.value = data.value?.data?.products?.map((item) => item.id) ?? []
  }
}

const activeOperation = ref('1')
const selectedSpot = computed(() => {
  return data.value?.data?.products.find(
    (item) => item.id === activeOperation.value,
  )
})

const chatEl = ref<HTMLElement>()
const expanded = ref(true)
const loading = ref(false)

// This is the object that will contain the validation messages
const ONE_MB = 1000000
const VALIDATION_TEXT = {
  LABEL_REQUIRED: "Product can't be empty",
  PHONE_REQUIRED: "Phone number can't be empty",
  EMAIL_REQUIRED: "Email address can't be empty",
  COUNTRY_REQUIRED: 'Please select a country',
}

// This is the Zod schema for the form input
// It's used to define the shape that the form data will have
const zodSchema = z
  .object({
    product: z.object({
      _id: z.string().optional(),
      product: z.string().min(1, VALIDATION_TEXT.LABEL_REQUIRED),
      message: z.string().optional(),
      duration: z.string().optional(),
      tag: z.string().optional(),
      type: z.union([z.literal('SPOT'), z.literal('BA')]).optional(),
      package: z.string().optional(),
    }),
  })
  .superRefine((data, ctx) => {
    if (!data.product.product) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: VALIDATION_TEXT.LABEL_REQUIRED,
        path: ['product.product'],
      })
    }
  })

async function confirmPlanning() {
  const query4 = computed(() => {
    return {
      action: 'updatePackage',
      token: token.value,
      id: data.value.data._id,
    }
  })

  let slug = ref(
    `/uploads/signatures/${authStore.user._id}_${Math.floor(
      Math.random() * 100,
    )}.png`,
  )
  if (signatureFile.value != null) {
    console.log(slug)
    try {
      const fd = new FormData()
      fd.append('0', signatureFile.value)
      const query = computed(() => {
        return {
          action: 'new-signature',
          slug: slug.value,
        }
      })

      const { data: uploadData, refresh } = await useFetch(
        '/api/files/upload',
        {
          method: 'post',
          query,
          body: fd,
        },
      )
      if (!uploadData.value?.success) {
        slug.value = ''
        toaster.clearAll()
        toaster.show({
          title: 'Oops',
          message: `Une erreur est survenue lors de l'importation de la signature !`,
          color: 'danger',
          icon: 'ph:check',
          closable: true,
        })
      }
    } catch (error) {}
  }

  const response = await useFetch('/api/pub/packages', {
    method: 'put',
    headers: { 'Content-Type': 'application/json' },
    query: query4,
    body: {
      ...data.value.data,
      validator: authStore.user._id,
      validatorSignature: slug.value,
    },
  })

  if (response.data?.value?.success) {
    success.value = true
    data.value.data.validator = authStore.user._id
    data.value.data.validatorSignature = slug.value
    toaster.clearAll()
    toaster.show({
      title: 'Success',
      message: `Planning confirmé !`,
      color: 'success',
      icon: 'ph:check',
      closable: true,
    })
    isModalConfirmPlanningOpen.value = false
    filter.value = 'planning'
    filter.value = ''
  } else {
    toaster.clearAll()
    toaster.show({
      title: 'Oops',
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

// Zod has a great infer method that will
// infer the shape of the schema into a TypeScript type
type FormInput = z.infer<typeof zodSchema>

const validationSchema = toTypedSchema(zodSchema)
const initialValues = computed<FormInput>(() => ({
  logo: null,
  product: {
    product: '',
    message: '',
    type: 'SPOT',
    duration: '0',
    tag: '',
    order: '',
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

// This is where you would send the form data to the server
const onSubmit = handleSubmit(
  async (values) => {
    success.value = false

    // here you have access to the validated form values
    console.log('spot-product-success', values)

    try {
      const isSuccess = ref(false)
      if (isEdit.value == true) {
        const query2 = computed(() => {
          return {
            action: 'updateSpot',
            token: token.value,
            id: values.product._id,
          }
        })

        const response = await useFetch('/api/pub', {
          method: 'put',
          headers: { 'Content-Type': 'application/json' },
          query: query2,
          body: {
            ...values.product,
          },
        })
        isSuccess.value = response.data.value?.success
      } else {
        const query2 = computed(() => {
          return {
            action: 'createSpot',
            token: token.value,
          }
        })

        const response = await useFetch('/api/pub', {
          method: 'post',
          headers: { 'Content-Type': 'application/json' },
          query: query2,
          body: {
            ...values.product,
            package: data.value?.data?._id,
            _id: undefined,
          },
        })
        isSuccess.value = response.data.value?.success
      }
      if (isSuccess) {
        success.value = true
        toaster.clearAll()
        toaster.show({
          title: 'Success',
          message:
            isEdit.value == false ? `Produit créé !` : `Produit mis à jour`,
          color: 'success',
          icon: 'ph:check',
          closable: true,
        })
        isModalNewSpotOpen.value = false
        resetForm()
        location.reload()
        filter.value = 'product'
        filter.value = ''
      } else {
        toaster.clearAll()
        toaster.show({
          title: 'Oops',
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
        title: 'Oops!',
        message: 'Veuillez examiner les erreurs dans le formulaire',
        color: 'danger',
        icon: 'lucide:alert-triangle',
        closable: true,
      })
      // return
    }
    success.value = true
  },
  (error) => {
    // this callback is optional and called only if the form has errors
    success.value = false

    // here you have access to the error
    console.log('spot-create-error', error)

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
    <div>
      <div class="flex w-full flex-col mb-10">
        <BaseAvatar
          :src="data?.data?.announcer?.logo ?? '/img/avatars/company.svg'"
          :badge-src="data?.data?.announcer?.logo"
          size="2xl"
          class="mx-auto"
        />
        <div class="mx-auto w-full max-w-4xl text-center">
          <BaseHeading tag="h2" size="xl" weight="medium" class="mt-4">
            {{ data?.data?.announcer?.name }}
          </BaseHeading>
          <div
            class="divide-muted-200 dark:divide-muted-800 flex items-center justify-center divide-x"
          >
            <div class="text-muted-400 flex h-8 items-center gap-1 px-4">
              <Icon name="ph:globe" class="h-5 w-5" />
              <BaseText size="sm"
                >Email: {{ data?.data?.announcer?.email }}</BaseText
              >
            </div>

            <div class="text-muted-400 flex h-8 items-center gap-1 px-4">
              <Icon name="ph:globe" class="h-5 w-5" />
              <BaseText size="sm">Pays: Cameroun</BaseText>
            </div>

            <div class="text-muted-400 flex h-8 items-center gap-1 px-4">
              <Icon name="ph:globe" class="h-5 w-5" />
              <BaseText size="sm">Adresse: Dla - Bonapriso</BaseText>
            </div>

            <div class="text-muted-400 flex h-8 items-center gap-1 px-4">
              <Icon name="ph:phone" class="h-5 w-5" />
              <BaseText size="sm">{{
                data?.data?.order?.announcer?.phone
              }}</BaseText>
            </div>
          </div>
        </div>
      </div>
    </div>
    <TairoContentWrapper>
      <template #left>
        <BaseInput
          v-model="filter"
          icon="lucide:search"
          placeholder="Filtre produit..."
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
          @click="isModalPlanningOpen = true"
          color="primary"
          class="w-full sm:w-40"
        >
          <Icon name="lucide:calendar" class="h-4 w-4" />
          <span>Planning</span>
        </BaseButton>
        <BaseButton
          @click=";(isModalNewSpotOpen = true), (isEdit = false)"
          color="primary"
          class="w-full sm:w-48"
          :disabled="
            authStore.user.appRole.name != UserRole.sale &&
            authStore.user.appRole.name != UserRole.mediaPlanner &&
            authStore.user.appRole.name != UserRole.superAdmin
          "
        >
          <Icon name="lucide:plus" class="h-4 w-4" />
          <span>Nouveau Produit</span>
        </BaseButton>
        <BaseButton
          @click="router.push('/bo/pub/package-details/' + data.data?._id)"
          color="primary"
          class="w-full sm:w-8"
        >
          <Icon name="carbon:tropical-storm-tracks" class="h-4 w-4" />
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
                <span>Total Commandés</span>
              </BaseHeading>
              <BaseIconBox
                size="xs"
                class="bg-success-100 text-success-500 dark:bg-success-500/20 dark:text-success-400 dark:border-success-500 dark:border-2"
                shape="full"
              >
                <Icon name="ph:money" class="h-5 w-5" />
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
                <span>{{ data?.data?.quantities }}</span>
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
                <span>Total diffusés</span>
              </BaseHeading>
              <BaseIconBox
                size="xs"
                class="bg-yellow-100 text-yellow-500 dark:border-2 dark:border-yellow-500 dark:bg-yellow-500/20 dark:text-yellow-400"
                shape="full"
              >
                <Icon name="ph:money" class="h-5 w-5" />
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
                <span>{{ data?.data?.numberPlay ?? 0 }}</span>
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
                <span>Total attentes</span>
              </BaseHeading>
              <BaseIconBox
                size="xs"
                class="bg-yellow-100 text-yellow-500 dark:border-2 dark:border-yellow-500 dark:bg-yellow-500/20 dark:text-yellow-400"
                shape="full"
              >
                <Icon name="ph:money" class="h-5 w-5" />
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
                <span>0</span>
              </BaseHeading>
            </div>
            <div
              class="text-danger-500 flex items-center gap-1 font-sans text-sm"
            >
              <span>0%</span>
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
                <span>Total non diffusés</span>
              </BaseHeading>
              <BaseIconBox
                size="xs"
                class="bg-primary-100 text-primary-500 dark:bg-primary-500/20 dark:text-primary-400 dark:border-primary-500 dark:border-2"
                shape="full"
              >
                <Icon name="ph:money" class="h-5 w-5" />
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
                <span>0</span>
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
      <div>
        <div v-if="!pending && data?.data?.products?.length === 0">
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
                <TairoTableHeading uppercase spaced> Date </TairoTableHeading>
                <TairoTableHeading uppercase spaced>
                  Produit
                </TairoTableHeading>
                <TairoTableHeading uppercase spaced
                  >Titre du message</TairoTableHeading
                >

                <TairoTableHeading uppercase spaced>Tag</TairoTableHeading>

                <TairoTableHeading uppercase spaced>Type</TairoTableHeading>

                <TairoTableHeading uppercase spaced>Durée(S)</TairoTableHeading>

                <TairoTableHeading uppercase spaced>Fichier</TairoTableHeading>

                <TairoTableHeading uppercase spaced>Action</TairoTableHeading>
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

              <TairoTableRow
                v-for="item in data?.data?.products"
                :key="item.id"
              >
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
                      {{ item.date }}
                    </span>
                  </div>
                </TairoTableCell>
                <TairoTableCell spaced>
                  <div class="flex items-center">
                    <span class="text-muted-400 font-sans text-xs">
                      {{ item.product }}
                    </span>
                  </div>
                </TairoTableCell>
                <TairoTableCell spaced>
                  <div class="flex items-center">
                    <span class="text-muted-400 font-sans text-xs">
                      {{ item.message }}
                    </span>
                  </div>
                </TairoTableCell>

                <TairoTableCell spaced>
                  <div class="flex items-center">
                    <BaseTag
                      color="info"
                      flavor="pastel"
                      shape="full"
                      condensed
                      class="font-medium"
                    >
                      {{ item.tag }}
                    </BaseTag>
                  </div>
                </TairoTableCell>
                <TairoTableCell spaced>
                  <div class="flex items-center">
                    <BaseTag
                      color="info"
                      flavor="pastel"
                      shape="full"
                      condensed
                      class="font-medium"
                    >
                      {{ item.type }}
                    </BaseTag>
                  </div>
                </TairoTableCell>

                <TairoTableCell spaced>
                  <div class="flex items-center">
                    <span class="text-muted-400 font-sans text-xs">
                      {{ item.duration ?? '50s' }}
                    </span>
                  </div>
                </TairoTableCell>
                <TairoTableCell light spaced>
                  <a
                    v-if="item.file"
                    class="mx-1 text-white bg-muted-600 p-2 rounded"
                    :href="'/' + item.file"
                    target="_blank"
                    >Visualiser</a
                  >
                </TairoTableCell>
                <TairoTableCell spaced>
                  <div class="flex">
                    <BaseButtonAction
                      :disabled="
                        authStore.user.appRole.name != UserRole.sale &&
                        authStore.user.appRole.name != UserRole.broadcast &&
                        authStore.user.appRole.name != UserRole.superAdmin
                      "
                      @click="openProductFileModal(item)"
                      class="mx-2"
                      muted
                    >
                      <Icon name="lucide:upload" class="h-4 w-4"
                    /></BaseButtonAction>
                    <BaseButtonAction
                      :disabled="
                        authStore.user.appRole.name != UserRole.sale &&
                        authStore.user.appRole.name != UserRole.mediaPlanner &&
                        authStore.user.appRole.name != UserRole.superAdmin
                      "
                      @click="editSpot(item)"
                    >
                      <Icon name="lucide:edit" class="h-4 w-4"
                    /></BaseButtonAction>
                    <BaseButtonAction
                      @click="confirmDeleteSpot(item)"
                      class="mx-2"
                      :disabled="
                        authStore.user.appRole.name != UserRole.sale &&
                        authStore.user.appRole.name != UserRole.mediaPlanner &&
                        authStore.user.appRole.name != UserRole.superAdmin
                      "
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
              :total-items="data?.products?.length ?? 0"
              :item-per-page="perPage"
              :current-page="page"
              shape="curved"
            />
          </div>
        </div>
      </div>
    </TairoContentWrapper>

    <!-- Modal new Spot -->
    <TairoModal
      :open="isModalNewSpotOpen"
      size="xl"
      @close="isModalNewSpotOpen = false"
    >
      <template #header>
        <!-- Header -->
        <div class="flex w-full items-center justify-between p-4 md:p-6">
          <h3
            class="font-heading text-muted-900 text-lg font-medium leading-6 dark:text-white"
          >
            {{ isEdit == true ? 'Editer' : 'Nouveau' }} produit
          </h3>

          <BaseButtonClose @click="isModalNewSpotOpen = false" />
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
                  <div class="col-span-12 md:col-span-12">
                    <Field
                      v-slot="{ field, errorMessage, handleChange, handleBlur }"
                      name="product.product"
                    >
                      <BaseInput
                        label="Produit *"
                        icon="ph:user-duotone"
                        placeholder="produit xxxx"
                        :model-value="field.value"
                        :error="errorMessage"
                        :disabled="isSubmitting"
                        @update:model-value="handleChange"
                        @blur="handleBlur"
                      />
                    </Field>
                  </div>
                  <div class="col-span-12 md:col-span-12">
                    <Field
                      v-slot="{ field, errorMessage, handleChange, handleBlur }"
                      name="product.message"
                    >
                      <BaseInput
                        label="Message"
                        icon="ph:chat-duotone"
                        placeholder="message xxxx"
                        :model-value="field.value"
                        :error="errorMessage"
                        :disabled="isSubmitting"
                        @update:model-value="handleChange"
                        @blur="handleBlur"
                      />
                    </Field>
                  </div>
                  <div class="ltablet:col-span-6 col-span-12 lg:col-span-12">
                    <Field
                      v-slot="{ field, errorMessage, handleChange, handleBlur }"
                      name="product.type"
                    >
                      <BaseSelect
                        label="Type de produit *"
                        icon="ph:funnel"
                        :model-value="field.value"
                        :error="errorMessage"
                        :disabled="isSubmitting"
                        @update:model-value="handleChange"
                        @blur="handleBlur"
                      >
                        <option value="SPOT">SPOT</option>
                        <option value="BA">Bande d'annonce</option>
                        <option value="BA">Intervention Canal Matin</option>
                        <option value="BA">Intervention Jambo</option>
                        <option value="BA">Publi reportage</option>
                      </BaseSelect>
                    </Field>
                  </div>
                </div>
                <div class="grid grid-cols-12 gap-4 mt-4">
                  <div class="col-span-12 md:col-span-6">
                    <Field
                      v-slot="{ field, errorMessage, handleChange, handleBlur }"
                      name="product.tag"
                    >
                      <BaseInput
                        label="Tag"
                        icon="ph:chat-duotone"
                        placeholder="A"
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
                      name="product.duration"
                    >
                      <BaseInput
                        label="Durée(seconde)"
                        icon="ph:chat-duotone"
                        placeholder="50"
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
        <!-- Footer -->
        <div class="p-4 md:p-6">
          <div class="flex gap-x-2">
            <BaseButton @click="isModalNewSpotOpen = false">Annuler</BaseButton>

            <BaseButton color="primary" flavor="solid" @click="onSubmit">
              {{ isEdit == true ? 'Modifier' : 'Créer' }}
            </BaseButton>
          </div>
        </div>
      </template>
    </TairoModal>

    <!-- Modal delete -->
    <TairoModal
      :open="isModalDeleteSpotOpen"
      size="sm"
      @close="isModalDeleteSpotOpen = false"
    >
      <template #header>
        <!-- Header -->
        <div class="flex w-full items-center justify-between p-4 md:p-6">
          <h3
            class="font-heading text-muted-900 text-lg font-medium leading-6 dark:text-white"
          >
            Suppression d'un produit
          </h3>

          <BaseButtonClose @click="isModalDeleteSpotOpen = false" />
        </div>
      </template>

      <!-- Body -->
      <div class="p-4 md:p-6">
        <div class="mx-auto w-full max-w-xs text-center">
          <h3
            class="font-heading text-muted-800 text-lg font-medium leading-6 dark:text-white"
          >
            Supprimer
            <span class="text-red-500">{{ currentProduct?.product }}</span> ?
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
            <BaseButton @click="isModalDeleteSpotOpen = false"
              >Annuler</BaseButton
            >

            <BaseButton
              color="primary"
              flavor="solid"
              @click="deleteSpot(currentProduct)"
              >Suppimer</BaseButton
            >
          </div>
        </div>
      </template>
    </TairoModal>

    <!-- Modal Product -->
    <TairoModal
      :open="isModalNewSpotPlanningOpen"
      size="xl"
      @close="isModalNewSpotPlanningOpen = false"
    >
      <template #header>
        <!-- Header -->
        <div class="flex w-full items-center justify-between p-4 md:p-6">
          <h3
            class="font-heading text-muted-900 text-lg font-medium leading-6 dark:text-white"
          >
            Choix du Produit
          </h3>

          <BaseButtonClose @click="isModalNewSpotPlanningOpen = false" />
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
                  <BaseText size="base" class="pb-2"
                    >Date de diffusion:
                    <span class="text-primary-500">
                      {{ dayOfWeek(parseInt(activeDay)) }} le {{ activeDay }}
                      {{ formatter.format(activeDate) }}
                      {{ activeDate.getFullYear() }} à
                      {{ activeHour.code }}</span
                    ></BaseText
                  >
                  <div class="grid grid-cols-12 gap-4">
                    <div class="ltablet:col-span-12 col-span-12 lg:col-span-12">
                      <Field
                        v-slot="{
                          field,
                          errorMessage,
                          handleChange,
                          handleBlur,
                        }"
                        name="planning.product"
                      >
                        <BaseListbox
                          label="Spot"
                          :items="data?.data?.products"
                          :properties="{
                            value: '_id',
                            label: 'product',
                            sublabel: 'tag',
                            media: 'flag',
                          }"
                          v-model="activeProduct"
                          :error="errorMessage"
                          :disabled="isSubmitting"
                          @update:model-value="handleChange"
                          @blur="handleBlur"
                        />
                      </Field>
                    </div>
                  </div>

                  <div
                    v-if="activeProduct._id != ''"
                    class="grid grid-cols-12 gap-4 mt-4"
                  >
                    <div class="col-span-12 md:col-span-12">
                      <Field
                        v-slot="{
                          field,
                          errorMessage,
                          handleChange,
                          handleBlur,
                        }"
                        name="planning.obs"
                      >
                        <BaseInput
                          label="Observation"
                          icon="ph:chat"
                          placeholder=""
                          v-model="phoneNumber"
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
          </div>
        </form>
      </BaseCard>
      <template #footer>
        <!-- Footer -->
        <div class="p-4 md:p-6">
          <div class="flex gap-x-2">
            <BaseButton @click="isModalNewSpotPlanningOpen = false"
              >Annuler</BaseButton
            >

            <BaseButton
              color="primary"
              flavor="solid"
              @click="addSpotToPlanning()"
            >
              Valider
            </BaseButton>
          </div>
        </div>
      </template>
    </TairoModal>

    <!-- Modal Planning -->
    <TairoModal
      :open="isModalPlanningOpen"
      size="4xl"
      :classes="{
        wrapper: 'h-full overflow-y-auto',
      }"
      @close="isModalPlanningOpen = false"
    >
      <template #header>
        <!-- Header -->
        <div class="flex w-full items-center justify-between px-4 md:px-6 py-2">
          <h3
            class="font-heading text-muted-900 text-lg font-medium leading-6 dark:text-white"
          >
            PLANNING DE DIFFUSION
          </h3>

          <BaseButtonClose @click="isModalPlanningOpen = false" />
        </div>
      </template>

      <!-- Body -->
      <div id="planningPrint" class="overflow-auto">
        <div
          v-if="isPrintPlanning == true || isPrintCertificate == true"
          class="items-center border-b-2 py-1"
        >
          <div shape="straight" class="">
            <img class="h-32 fit-content" src="/uploads/logos/c2.png" />
          </div>
          <div shape="straight" class="border border-t-1"></div>
          <h3
            class="font-heading text-muted-900 text-base font-medium py-2 leading-6 dark:text-white"
          >
            {{
              isPrintPlanning == true
                ? 'PLANNING DE DIFFUSION'
                : 'CERTIFICAT DE DIFFUSION'
            }}
          </h3>
        </div>
        <div class="flex justify-between items-center p-2">
          <BaseText size="sm"
            >Annonceur :
            <span class="text-primary-500">{{
              data?.data?.announcer?.name
            }}</span>
          </BaseText>
          <BaseText size="sm"
            >Produit :
            <span class="text-primary-500">{{ data?.data?.label ?? '-' }}</span>
          </BaseText>
          <BaseText size="sm"
            >Mois :
            <span class="text-primary-500"
              >{{ formatter.format(activeDate) }}
              {{ activeDate.getFullYear() }}</span
            ></BaseText
          >

          <BaseText size="sm"
            >Total Commandés :
            <span class="text-primary-500">{{ data?.data?.quantities }} </span>
          </BaseText>

          <BaseText size="sm"
            >Période :
            <span class="text-primary-500">{{ data.data?.period }}</span>
          </BaseText>

          <div v-if="isPrintPlanning == false && isPrintCertificate == false">
            <BaseButton
              @click="removeMonth()"
              color="primary"
              class="w-full sm:w-20"
            >
              <Icon name="lucide:chevron-left" class="h-6 w-6" />
              <span></span>
            </BaseButton>
            <BaseButton
              @click="addMonth()"
              color="primary"
              class="w-full sm:w-20 mx-2"
            >
              <Icon name="lucide:chevron-right" class="h-6 w-6" />
              <span></span>
            </BaseButton>
          </div>
        </div>

        <div class="flex justify-start text-sm px-2 pb-2">
          LEGENDE :
          <div v-for="(product, i) in data.data.products" :key="product._id">
            <span class="px-2">
              {{ product.tag }} : {{ product.type }} {{ product.message }}
            </span>
            |
          </div>
        </div>

        <div
          class="grid grid-cols-12 gap-2 pb-5 px-2"
          :class="
            isPrintPlanning == false && isPrintCertificate == false
              ? 'h-[550px]'
              : ''
          "
        >
          <!-- Stat tile -->
          <div class="col-span-6 md:col-span-1">
            <BaseCard class="space-y-2 items-center">
              <div class="border-b-2">
                <BaseHeading
                  as="h4"
                  size="sm"
                  weight="light"
                  lead="tight"
                  class="text-muted-800 dark:text-white pb-2 pt-2 text-center"
                >
                  <span>Jours</span>
                </BaseHeading>
              </div>

              <div class="border-b-2">
                <BaseHeading
                  as="h4"
                  size="sm"
                  weight="light"
                  lead="tight"
                  class="text-muted-800 dark:text-white pb-3 pt-2 text-center"
                >
                  <span class="py-auto">Dates</span>
                </BaseHeading>
              </div>

              <div class="border-b-2">
                <BaseHeading
                  as="h4"
                  size="sm"
                  weight="light"
                  lead="tight"
                  class="text-muted-800 dark:text-white pb-2 pt-2 text-center"
                >
                  <span>Horaires</span>
                </BaseHeading>
              </div>
              <div v-for="h in hoursData.data" :key="h._id">
                <div v-if="checkEmptyPlanning(h)" class="border-b-2">
                  <BaseHeading
                    as="h4"
                    size="sm"
                    weight="light"
                    lead="tight"
                    class="text-muted-800 dark:text-white pb-2 pt-2 text-center"
                  >
                    <span>{{ h.name }}</span>
                  </BaseHeading>
                </div>
              </div>
            </BaseCard>
          </div>
          <div class="col-span-6 md:col-span-11">
            <BaseCard class="space-y-0 items-center">
              <div class="border-b-2 flex justify-start">
                <BaseHeading
                  v-for="d in activeDays"
                  :key="d"
                  as="h4"
                  size="sm"
                  weight="light"
                  lead="tight"
                  class="text-muted-800 dark:text-white pb-2 pt-2 !w-10 flex justify-center border-r"
                >
                  <span class="text-center px-auto pr-2"
                    >{{ dayOfWeek(d)[0] }}
                  </span>
                </BaseHeading>
              </div>
              <div class="border-b-2 flex justify-start py-0">
                <BaseHeading
                  v-for="d in activeDays"
                  :key="d"
                  as="h4"
                  size="sm"
                  weight="light"
                  lead="tight"
                  class="text-muted-800 dark:text-white pb-2 pt-1 !w-10 border-r flex justify-center"
                >
                  <span class="text-center py-2">{{ d }}</span>
                </BaseHeading>
              </div>

              <div class="border-b-2 flex justify-start">
                <BaseHeading
                  v-for="d in activeDays"
                  :key="d"
                  as="h4"
                  size="sm"
                  weight="light"
                  lead="tight"
                  class="text-muted-800 dark:text-white pb-2 !w-10 flex justify-center border-r"
                >
                  <span class="text-center py-2"> # </span>
                </BaseHeading>
              </div>

              <div v-for="h in hoursData.data" :key="h._id" class="">
                <div
                  v-if="checkEmptyPlanning(h)"
                  class="border-b-2 flex justify-start"
                >
                  <div
                    v-for="d in activeDays"
                    :key="d"
                    class="text-muted-800 dark:text-white -mt-1 !w-10 flex justify-center items-center border-r"
                  >
                    <BaseButton
                      :title="dayOfWeek(d) + ' LE ' + d + ' A ' + h.name"
                      @click="openSpotPlanningModal(d.toString(), h)"
                      :color="checkSpot(d, h.code)[1]"
                      class="!w-6 !h-[2.106em] rounded-full !px-1 !my-2"
                    >
                      <!-- <span
                        v-if="dayOfWeek(d)"
                        class="hover:text-primary-500/90 text-base"
                        >+</span
                      > -->
                      <span class="hover:text-primary-500/90 text-base">{{
                        checkSpot(d, h.code)[0]
                      }}</span>
                    </BaseButton>
                  </div>
                </div>
              </div>
            </BaseCard>
            <div v-if="true" class="flex justify-between py-4">
              <div class="text-xs">
                <p class="py-2">
                  NB: (Difusé:
                  <span class="px-1 text-primary-500"> SPOT </span>; En attente
                  de diffusion:
                  <span class="px-1 text-yellow-500"> SPOT </span>; Non difusé:
                  <span class="px-1 text-red-500"> SPOT </span>)
                </p>
                <p class="pt-2">
                  Ce document dûment signé et cacheté par le support tient lieu
                  de justificatif.
                </p>
                <p>
                  Douala le,
                  {{ new Date(Date.now()).toLocaleDateString('fr-FR') }}
                </p>
              </div>
              <div class="flex px-2">
                <div shape="straight" class="pr-10">
                  <BaseHeading
                    as="h4"
                    size="sm"
                    weight="semibold"
                    lead="tight"
                    class="text-muted-800 mb-2 text-center dark:text-white"
                  >
                    VISA RC
                  </BaseHeading>
                  <img
                    v-if="
                      data.data.validatorSignature &&
                      (isPrintPlanning || isPrintCertificate)
                    "
                    class="h-28 fit-content"
                    :src="data.data.validatorSignature"
                  />
                </div>
                <div
                  v-if="data.data.validatorSignature"
                  shape="straight"
                  class="mx-2"
                >
                  <BaseHeading
                    as="h4"
                    size="sm"
                    weight="semibold"
                    lead="tight"
                    class="text-muted-800 mb-2 text-center dark:text-white"
                  >
                    VISA MP
                  </BaseHeading>
                  <img
                    v-if="
                      data.data.validatorSignature &&
                      (isPrintPlanning || isPrintCertificate)
                    "
                    class="h-28 fit-content"
                    :src="data.data.planningValidatorSignature"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <template #footer>
        <!-- Footer -->
        <div class="p-4 md:p-6">
          <div class="flex gap-x-2">
            <BaseButton @click="isModalPlanningOpen = false">Fermer</BaseButton>
            <BaseButton @click="printPlanning('planning')">
              <Icon
                name="lucide:printer"
                class="pointer-events-none h-4 w-4 mx-2"
              />
              Imprimer le planning</BaseButton
            >
            <BaseButton @click="printPlanning('certificate')">
              <Icon
                name="lucide:printer"
                class="pointer-events-none h-4 w-4 mx-2"
              />
              Imprimer le certificat de diffusion</BaseButton
            >
            <BaseButton
              :color="data.data?.validator ? 'success' : 'warning'"
              flavor="solid"
              :disabled="
                authStore.user?.appRole?.name != UserRole.superAdmin &&
                authStore.user?.appRole?.name != UserRole.mediaPlanner
              "
              @click="isModalConfirmPlanningOpen = true"
            >
              {{
                data.data?.validator ? 'Planning validé' : 'Valider le planning'
              }}
            </BaseButton>
          </div>
        </div>
      </template>
    </TairoModal>

    <!-- Modal confirm planning -->
    <TairoModal
      :open="isModalConfirmPlanningOpen"
      size="sm"
      @close="isModalConfirmPlanningOpen = false"
    >
      <template #header>
        <!-- Header -->
        <div class="flex w-full items-center justify-between p-4 md:p-6">
          <h3
            class="font-heading text-muted-900 text-lg font-medium leading-6 dark:text-white"
          >
            Confirmation du planning
          </h3>

          <BaseButtonClose @click="isModalConfirmPlanningOpen = false" />
        </div>
      </template>

      <!-- Body -->
      <div class="p-4 md:p-6">
        <div class="mx-auto w-full max-w-xs text-center">
          <h4
            class="font-heading text-muted-800 text-lg font-medium leading-6 pb-2 dark:text-white"
          >
            Veuillez ajouter une signature
          </h4>
          <form
            action=""
            class="flex justify-center pb-2"
            method="POST"
            @submit.prevent=""
          >
            <BaseInputFileHeadless
              accept="image/*"
              v-model="inputFileSignature"
              v-slot="{ open, remove, preview, files }"
            >
              <div class="relative h-40 w-40">
                <img
                  v-if="signatureFilePreview"
                  :src="signatureFilePreview"
                  alt="Upload preview"
                  class="bg-muted-200 dark:bg-muted-700/60 h-40 w-40 rounded-lg object-cover object-center"
                />

                <img
                  v-else
                  :src="currentAvatar"
                  alt="Upload preview"
                  class="bg-muted-200 dark:bg-muted-700/60 h-40 w-40 rounded-lg object-cover object-center dark:invert"
                />

                <div
                  v-if="signatureFilePreview"
                  class="absolute bottom-0 end-0 z-20"
                >
                  <BaseButtonIcon
                    size="sm"
                    shape="full"
                    @click="signatureFile = null"
                    data-nui-tooltip="Remove image"
                    class="scale-90"
                  >
                    <Icon name="lucide:x" class="h-4 w-4" />
                  </BaseButtonIcon>
                </div>

                <div v-else class="absolute bottom-0 end-0 z-20">
                  <div class="relative" data-nui-tooltip="Upload image">
                    <BaseButtonIcon size="sm" shape="full" @click="open">
                      <Icon name="lucide:plus" class="h-4 w-4" />
                    </BaseButtonIcon>
                  </div>
                </div>
              </div>
            </BaseInputFileHeadless>
          </form>

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
            <BaseButton @click="isModalConfirmPlanningOpen = false"
              >Annuler</BaseButton
            >

            <BaseButton
              color="primary"
              flavor="solid"
              @click="confirmPlanning()"
              >Valider</BaseButton
            >
          </div>
        </div>
      </template>
    </TairoModal>

    <!-- Modal upload product file -->
    <TairoModal
      :open="isModalUploadProductFileOpen"
      size="sm"
      @close="isModalUploadProductFileOpen = false"
    >
      <template #header>
        <!-- Header -->
        <div class="flex w-full items-center justify-between p-4 md:p-6">
          <h3
            class="font-heading text-muted-900 text-lg font-medium leading-6 dark:text-white"
          >
            Upload du fichier produit
          </h3>

          <BaseButtonClose @click="isModalUploadProductFileOpen = false" />
        </div>
      </template>

      <!-- Body -->
      <div class="p-4 md:p-6">
        <div class="mx-auto w-full text-center">
          <form action="" class="pb-2" method="POST" @submit.prevent="">
            <BaseInputFile
              accept=".jpg, .png, .mp4, .avi"
              v-model="inputFileProduct"
              shape="rounded"
              label="Fichier"
            />
          </form>

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
            <BaseButton @click="isModalUploadProductFileOpen = false"
              >Annuler</BaseButton
            >

            <BaseButton
              color="primary"
              flavor="solid"
              @click="importProductFile()"
              >Valider</BaseButton
            >
          </div>
        </div>
      </template>
    </TairoModal>

    <!-- Current user -->
    <div
      class="ltablet:w-[310px] dark:bg-muted-800 fixed end-0 top-0 z-50 h-full w-[390px] bg-white transition-transform duration-300"
      :class="expanded ? 'translate-x-full' : 'translate-x-0'"
    >
      <div class="flex h-16 w-full items-center justify-between px-8">
        <BaseHeading tag="h3" size="lg" class="text-muted-800 dark:text-white">
          <span>Détails Operationn</span>
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
            <BaseAvatar :src="selectedSpot?.product" size="2xl" />
          </div>
          <div class="text-center">
            <BaseHeading tag="h3" size="lg" class="mt-4">
              <span>{{ selectedSpot?.product }}</span>
            </BaseHeading>
            <BaseParagraph size="sm" class="text-muted-400">
              <span>{{ selectedSpot?.message }}</span>
            </BaseParagraph>
            <div class="my-4">
              <BaseParagraph
                size="sm"
                class="text-muted-500 dark:text-muted-400"
              >
                <span>{{ selectedSpot?.type }}</span>
              </BaseParagraph>
              <BaseParagraph
                size="sm"
                class="text-muted-500 dark:text-muted-400"
              >
                <span
                  >{{ selectedSpot?.file }} {{ selectedSpot?.duration }}</span
                >
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
                <span>
                  Consulter le planning du produit
                  {{ selectedSpot?.product }}
                </span>
              </BaseButton>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
