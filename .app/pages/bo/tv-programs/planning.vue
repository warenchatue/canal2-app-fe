<script setup lang="ts">
import { toTypedSchema } from '@vee-validate/zod'
import moment from 'moment'
import { Field, useForm } from 'vee-validate'
import { z } from 'zod'
import { UserRole } from '~/types/user'

definePageMeta({
  title: 'Planning Programmes TV',
  preview: {
    title: 'Planning Programmes TV',
    description: 'Contribution and withdrawal',
    categories: ['bo', 'tv-programs', 'orders'],
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
const perPage = ref(50)
const token = useCookie('token')
const packageId = computed(() => '661289857d622410a87c50ad')
const toaster = useToaster()
// Check if can have access
if (
  authStore.user.appRole.name != UserRole.programPlanner &&
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

const query = computed(() => {
  return {
    action: 'findOne',
    id: packageId.value,
    token: token.value,
  }
})

const queryHours = computed(() => {
  return {
    filter: filter.value,
    perPage: perPage.value,
    page: page.value,
    action: 'findAll',
    token: token.value,
  }
})

const queryPlanning = computed(() => {
  return {
    filter: filter.value,
    perPage: perPage.value,
    page: page.value,
    action: 'findAllPlanning',
    token: token.value,
  }
})

const { data, pending, error, refresh } = await useFetch(
  '/api/tv-programs/plannings',
  {
    query: queryPlanning,
  },
)

const { data: hoursData } = await useFetch('/api/pub/hours', {
  query: queryHours,
  lazy: false,
  transform: (els) => {
    return els.data?.filter((el: any) => {
      return el.type == 'TvProgram'
    })
  },
})

const { data: allTvPrograms, pending: pendingTvPrograms } = await useFetch(
  '/api/tv-programs/programs',
  {
    query: queryHours,
    lazy: true,
    transform: (els) => {
      return els.data?.map((el) => ({
        name: el.name,
        id: el._id,
        text: el.code,
      }))
    },
  },
)

const { data: allUsers, pending: pendingUsers } = await useFetch('/api/users', {
  query: queryHours,
  lazy: true,
  transform: (els) => {
    return els.data?.map((el) => ({
      name: el.firstName + ' ' + el.lastName,
      id: el._id,
      text: el.email,
    }))
  },
})

watch([filter, perPage], () => {
  router.push({
    query: {
      page: undefined,
    },
  })
})

const isModalNewSpotOpen = ref(false)
const isModalAddDefaultProgramOpen = ref(false)
const isModalUseDefaultProgramOpen = ref(false)
const isModalPlanningOpen = ref(false)
const isModalNewSpotPlanningOpen = ref(false)
const isModalConfirmPlanningOpen = ref(false)
const isModalUploadProductFileOpen = ref(false)
const isEdit = ref(false)
const isTvProgram = ref(false)
const isPrintPlanning = ref(false)
const isPrintCertificate = ref(false)
const currentProduct = ref({})
const currentTvProgram = ref({})
const currentTvProgramHost = ref({})
const currentDescription = ref('')
const currentHours = ref([])
const formatter = new Intl.DateTimeFormat('fr', { month: 'long' })
const activeDate = ref(new Date())
const currentDate = ref(new Date())
const activeDay = ref('')
const activePlanningId = ref('')
const activePlanning = ref({})
const activeHour = ref({})
const isActionLoading = ref(false)
const activeEnd = ref({ day: undefined, step: 1, total: 1 })
const isCapturePagePlanning = ref(false)
const isCapturePageCertificate = ref(false)
const contentToPrint = ref('')
var activeDays = ref(7)
const initDate = ref(false)

const spotData = computed(() => {
  let data = {}
  hoursData.value.forEach((h: any) => {
    data[h.code] = {}
    weekDates(activeDate.value).forEach((d: Date) => {
      data[h.code][d.getDay()] = checkProgram(d.getDate(), h.code, true, '')
    })
  })

  return data
})

function filterItems(query?: string, items?: any[]) {
  if (query.length < 1) {
    return []
  }

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

function captureContent(type: string) {
  if (type == 'Planning') {
    isCapturePagePlanning.value = true
    isPrintPlanning.value = true
  } else if ((type = 'Certificate')) {
    isCapturePageCertificate.value = true
    isPrintCertificate.value = true
  }
  setTimeout(() => {
    contentToPrint.value += document.getElementById('planningPrint').innerHTML
  }, 500)
}

function weekDates(current: Date) {
  var week = []
  var localDate = new Date(current)
  // Starting Monday not Sunday
  var first = localDate.getDate() - ((localDate.getDay() + 6) % 7)

  for (var i = 0; i < 7; i++) {
    let tempDate = new Date(localDate) // Create a copy of the date
    tempDate.setDate(first + i)

    week.push(tempDate)
  }

  return week
}

function addWeek() {
  var date = new Date(activeDate.value)
  initDate.value = false
  date = new Date(date.setDate(date.getDate() + 7))
  activeDate.value = date
  setTimeout(() => {
    if (isCapturePagePlanning.value || isCapturePageCertificate.value) {
      contentToPrint.value += document.getElementById('planningPrint').innerHTML
    }
  }, 500)
}

function removeWeek() {
  var date = new Date(activeDate.value)
  initDate.value = false
  date = new Date(date.setDate(date.getDate() - 7))
  activeDate.value = date
}

function dayOfWeek(curDate: any, d: number) {
  return new Date(curDate)
    .toLocaleDateString('fr-FR', {
      weekday: 'short',
    })
    .toString()
    .toLocaleUpperCase()
}

function openSpotPlanningModal(
  day: string,
  date: Date,
  hour: any,
  planningId: string,
  planning: any,
) {
  activeDay.value = day
  currentDate.value = date
  activeHour.value = hour
  activePlanningId.value = planningId
  console.log(planning)
  if (planning) {
    activePlanning.value = planning
    currentTvProgram.value = planning.tvProgram
    currentTvProgramHost.value = {
      ...planning.tvProgramHost,
      name:
        planning.tvProgramHost.firstName +
        ' ' +
        planning.tvProgramHost.lastName,
    }
    currentDescription.value = planning.description
    planning.hours.pop()
    console.log(planning.hours)
    currentHours.value = planning.hours.map((h) => {
      return { date: h.date, hour: h.hour, _id: h.hour, code: h.code }
    })
  } else {
    currentTvProgram.value = {}
    currentTvProgramHost.value = {}
    currentDescription.value = ''
    currentHours.value = []
  }

  activeEnd.value.day = parseInt(day)
  isTvProgram.value = false
  isModalNewSpotPlanningOpen.value = true
}

async function addProgramToPlanning(planningId: string) {
  console.log('Adding program to the planning')
  isActionLoading.value = true
  const hourArray = activeHour.value?.code.split(':')

  let newPlannings = []
  const myActiveDay = parseInt(activeDay.value)
  const myActiveEndDay = parseInt(activeEnd.value.day)
  const myActiveEndStep = parseInt(activeEnd.value.step)
  const myActiveEndTotal = parseInt(activeEnd.value.total)

  for (
    let myDay = myActiveDay;
    myDay <= myActiveEndDay;
    myDay += myActiveEndStep
  ) {
    // console.log(myDay)
    var date = new Date(
      activeDate.value.getFullYear(),
      activeDate.value.getMonth(),
      myDay,
      parseInt(hourArray[0]),
      parseInt(hourArray[1]),
    )
    const hours = []
    for (let index = 0; index < currentHours.value.length; index++) {
      const hourArrayT = currentHours.value[index]?.code.split(':')

      var dateT = new Date(
        activeDate.value.getFullYear(),
        activeDate.value.getMonth(),
        myDay,
        parseInt(hourArrayT[0]),
        parseInt(hourArrayT[1]),
      )
      hours.push({
        date: dateT.toISOString(),
        code: currentHours.value[index].code,
        hour: currentHours.value[index]._id,
      })
    }

    // console.log(date.toISOString())
    for (let i = 0; i < myActiveEndTotal; i++) {
      if (planningId) {
        newPlannings.push({
          _id: planningId,
          hour: activeHour.value._id,
          hours: hours,
          tvProgram: currentTvProgram.value.id,
          tvProgramHost: currentTvProgramHost.value.id,
          description: currentDescription.value,
          date: date.toISOString(),
          position: date.toISOString(),
        })
      } else {
        newPlannings.push({
          _id: undefined,
          hour: activeHour.value._id,
          hours: hours,
          tvProgram: currentTvProgram.value.id,
          tvProgramHost: currentTvProgramHost.value.id,
          description: currentDescription.value,
          date: date.toISOString(),
          position: date.toISOString(),
          isManualPlay: false,
          isAutoPlay: false,
        })
      }
    }
  }

  try {
    const isSuccess = ref(false)
    const action = planningId ? 'updatePlanning' : 'createPlannings'
    const response = await $fetch(
      `/api/tv-programs/plannings?action=${action}&token=` +
        token.value +
        '&id=' +
        (planningId ?? '') +
        '&orderCode=' +
        data.value?.data?.code,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: planningId
          ? newPlannings[0]
          : {
              plannings: newPlannings,
            },
      },
    )

    // console.log(response)
    isSuccess.value = response?.success
    if (isSuccess.value == true) {
      success.value = true
      if (!planningId) {
        data.value?.data?.push(...response.data)
      } else {
        data.value.data = data.value?.data.filter((p) => p._id != planningId)
        data.value?.data?.push({
          _id: planningId,
          hour: activeHour.value,
          hours: newPlannings[0].hours,
          tvProgram: currentTvProgram.value,
          tvProgramHost: currentTvProgramHost.value,
          description: currentDescription.value,
          date: newPlannings[0].date,
          position: newPlannings[0].date,
        })
      }
      toaster.clearAll()
      toaster.show({
        title: 'Success',
        message:
          isEdit.value == false
            ? `Emission(s) ajouté(s) au planning !`
            : `Emission mis à jour`,
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

  isModalNewSpotPlanningOpen.value = false
  isActionLoading.value = false
}

async function deleteSpotToPlanning() {
  console.log('Deleting product from the planning')

  try {
    const isSuccess = ref(false)
    const response = await $fetch(
      '/api/tv-programs/plannings?action=delete&token=' +
        token.value +
        '&id=' +
        activePlanningId.value,
      {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
      },
    )

    console.log(response)

    isSuccess.value = response?.success
    if (isSuccess.value == true) {
      success.value = true
      data.value.data = data.value?.data?.filter(
        (p: any) => p._id != activePlanningId.value,
      )
      activePlanningId.value = ''
      toaster.clearAll()
      toaster.show({
        title: 'Success',
        message: 'Emission supprimé du planning !',
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
  console.log(data.value?.data?.plannings)

  isModalNewSpotPlanningOpen.value = false
}

function checkEmptyPlanning(h: any) {
  if (isPrintPlanning.value == true || isPrintCertificate.value == true) {
    var plannedSpots = data.value?.data?.filter(
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

function checkProgram(
  d: number,
  hour: string,
  isProg: boolean,
  progId: string,
) {
  var plannedSpots = []

  const hourArray = hour.split(':')
  var date = new Date(
    activeDate.value.getFullYear(),
    activeDate.value.getMonth(),
    d,
    parseInt(hourArray[0]),
    parseInt(hourArray[1]),
  )

  plannedSpots = data.value?.data?.filter((p: any) => {
    if (!Array.isArray(p.hours)) {
      p.hours = []
    }
    if (!p.hours.some((hourObj) => hourObj.date === p.date)) {
      p.hours.push({ date: p.date, hour: p.hour._id, code: p.hour.code })
    }
    // console.log(p.hours)
    for (let index = 0; index < p.hours.length; index++) {
      if (
        new Date(p.hours[index].date).toLocaleString('fr-FR') ==
        date?.toLocaleString('fr-FR')
      ) {
        return true
      }
    }
    return false
  })

  if (plannedSpots.length == 0) {
    return ['+', 'default', undefined, 0, undefined]
  } else {
    const numberSpots = plannedSpots.length == 1 ? 1 : 2
    const dateNow = new Date().toLocaleString('fr-FR')
    const dateNowTime = new Date().getTime()
    var dateP = new Date(plannedSpots[0].date).toLocaleString('fr-FR')
    var datePTime = new Date(plannedSpots[0].date).getTime()
    // console.log(plannedSpots[0])
    if (isPrintPlanning.value == true) {
      return [
        plannedSpots[0].tvProgram?.name ?? '',
        'warning',
        plannedSpots[0]._id,
        numberSpots,
      ]
    }

    // console.log(dateP)
    // console.log(dateNow)
    // console.log('')
    if (datePTime < dateNowTime) {
      // console.log('danger')
    } else {
      // console.log('pas danger')
    }

    if (
      datePTime < dateNowTime &&
      plannedSpots[0].isManualPlay == false &&
      plannedSpots[0].isAutoPlay == false &&
      isPrintCertificate.value == false
    ) {
      //danger
      return [
        plannedSpots[0].tvProgram?.name ?? '',
        plannedSpots[0].tvProgram?.category?.colorCode ?? '',
        plannedSpots[0]._id,
        plannedSpots[0],
        numberSpots,
      ]
    } else if (
      datePTime < dateNowTime &&
      (plannedSpots[0].isManualPlay == true ||
        plannedSpots[0].isAutoPlay == true)
    ) {
      //primary
      return [
        plannedSpots[0].tvProgram?.name ?? '',
        plannedSpots[0].tvProgram?.category?.colorCode ?? '',
        plannedSpots[0]._id,
        plannedSpots[0],
        numberSpots,
      ]
    } else if (datePTime > dateNowTime && isPrintCertificate.value == false) {
      //warning
      return [
        plannedSpots[0].tvProgram?.name ?? '',
        plannedSpots[0].tvProgram?.category?.colorCode ?? '',
        plannedSpots[0]._id,
        plannedSpots[0],
        numberSpots,
      ]
    } else {
      return ['+', 'default', undefined]
    }
  }
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
  isModalAddDefaultProgramOpen.value = true
  isEdit.value = false
  currentProduct.value = product
}

async function updateDefaultPlannings() {
  // detect all programs of the week.
  const planningIds: string[] = []
  weekDates(activeDate.value).forEach((d: Date) => {
    var date = new Date(
      activeDate.value.getFullYear(),
      activeDate.value.getMonth(),
      d.getDate(),
    )

    const plannedSpots = data.value?.data?.filter((p: any) => {
      const plannedDate = new Date(p.date)
      return (
        plannedDate.getFullYear() === date.getFullYear() &&
        plannedDate.getMonth() === date.getMonth() &&
        plannedDate.getDate() === date.getDate()
      )
    })

    if (plannedSpots.length > 0) {
      planningIds.push(...plannedSpots.map((p: any) => p._id))
    }
  })

  const response = await $fetch(
    '/api/tv-programs/plannings?action=updateDefaultPlannings&token=' +
      token.value +
      '&orderCode=' +
      data.value?.data?.code,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: {
        _ids: planningIds,
      },
    },
  )

  if (response?.success) {
    success.value = true
    toaster.clearAll()
    toaster.show({
      title: 'Success',
      message: `Opération éffectuée !`,
      color: 'success',
      icon: 'ph:check',
      closable: true,
    })
    isModalAddDefaultProgramOpen.value = false
    filter.value = 'program'
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

async function useDefaultPlannings() {
  const response = await $fetch(
    '/api/tv-programs/plannings?action=useDefaultPlannings&token=' +
      token.value +
      '&orderCode=' +
      data.value?.data?.code,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    },
  )

  if (response?.success) {
    success.value = true
    toaster.clearAll()
    toaster.show({
      title: 'Success',
      message: `Opération éffectuée !`,
      color: 'success',
      icon: 'ph:check',
      closable: true,
    })
    isModalUseDefaultProgramOpen.value = false
    filter.value = 'program'
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
    if (contentToPrint.value) {
      document.body.innerHTML = contentToPrint.value
    } else {
      document.body.innerHTML = printContents
    }
    window.print()
    document.body.innerHTML = originalContents
    isCapturePagePlanning.value = false
    isCapturePageCertificate.value = false
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

    const { data: uploadData } = await useFetch('/api/files/upload', {
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
          title: 'Désolé',
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
        title: 'Désolé',
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
  return selected.value.length === data.value?.data?.length
})

function toggleAllVisibleSelection() {
  if (isAllVisibleSelected.value) {
    selected.value = []
  } else {
    selected.value = data.value?.data?.map((item) => item.id) ?? []
  }
}

const activeOperation = ref('1')
// const selectedSpot = computed(() => {
//   return data.value?.data?.products.find(
//     (item) => item.id === activeOperation.value,
//   )
// })

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
      type: z
        .union([
          z.literal('SPOT'),
          z.literal('BA'),
          z.literal('INT-E'),
          z.literal('PAD'),
        ])
        .optional(),
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

      const { data: uploadData } = await useFetch('/api/files/upload', {
        method: 'post',
        query,
        body: fd,
      })
      if (!uploadData.value?.success) {
        slug.value = ''
        toaster.clearAll()
        toaster.show({
          title: 'Désolé',
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
    console.log('campaign-product-success', values)

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
        // location.reload()
        refresh()
        filter.value = 'product'
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
    <TairoContentWrapper>
      <div id="planningPrint" class="overflow-auto">
        <div
          v-if="isPrintPlanning == true || isPrintCertificate == true"
          class="items-center border-b-2 py-1"
        >
          <div shape="straight" class="">
            <img class="h-32 fit-content" :src="data?.data?.org?.logo ?? ''" />
          </div>
          <div shape="straight" class="border border-t-1"></div>
          <h3
            class="font-heading text-muted-900 text-base font-medium py-2 leading-6 dark:text-white"
          >
            {{
              isPrintPlanning == true
                ? 'PLANNING DES PROGRAMMES'
                : 'CERTIFICAT DE DIFFUSION'
            }}
          </h3>
        </div>
        <div class="flex justify-between items-center p-2">
          <BaseText size="md"
            >MOIS :
            <span class="text-primary-500 uppercase"
              >{{ formatter.format(activeDate) }}
              {{ activeDate.getFullYear() }}</span
            ></BaseText
          >

          <div v-if="isPrintPlanning == false && isPrintCertificate == false">
            <BaseButton
              @click="removeWeek()"
              color="primary"
              class="w-full sm:w-20"
            >
              <Icon name="lucide:chevron-left" class="h-6 w-6" />
              <span></span>
            </BaseButton>
            <BaseButton
              @click="addWeek()"
              color="primary"
              class="w-full sm:w-20 mx-2"
            >
              <Icon name="lucide:chevron-right" class="h-6 w-6" />
              <span></span>
            </BaseButton>
          </div>
        </div>

        <div
          class="grid grid-cols-12 gap-2 pb-5 px-2"
          :class="
            isPrintPlanning == false && isPrintCertificate == false ? '' : ''
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
                  class="text-muted-800 dark:text-white pb-2 pt-2 text-center"
                >
                  <span>Horaires</span>
                </BaseHeading>
              </div>
              <div v-for="h in hoursData" :key="h._id">
                <div v-if="checkEmptyPlanning(h)" class="border-b-2">
                  <BaseHeading
                    as="h4"
                    size="sm"
                    weight="light"
                    lead="tight"
                    class="flex items-center justify-center text-muted-800 !h-20 dark:text-white pb-2 pt-2 text-center"
                  >
                    <span>{{ h.name }}</span>
                  </BaseHeading>
                </div>
              </div>
              <div>
                <div class="border-b-2">
                  <BaseHeading
                    as="h4"
                    size="sm"
                    weight="light"
                    lead="tight"
                    class="text-muted-800 dark:text-white pb-2 pt-2 text-center"
                  >
                    <span>Total</span>
                  </BaseHeading>
                </div>
              </div>
            </BaseCard>
          </div>
          <div class="col-span-6 md:col-span-11">
            <BaseCard class="space-y-0 items-center">
              <div class="border-b-2 flex justify-start">
                <BaseHeading
                  v-for="curDate in weekDates(activeDate)"
                  :key="curDate"
                  as="h5"
                  size="sm"
                  weight="light"
                  lead="tight"
                  class="text-muted-800 dark:text-white pb-2 pt-2 !w-40 flex justify-center border-r"
                >
                  <span class="text-center px-auto pr-2"
                    >{{ dayOfWeek(curDate, curDate.getDate()) }}
                    {{ curDate.getDate() }} {{ formatter.format(curDate) }}
                  </span>
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
                  class="text-muted-800 dark:text-white pb-2 !w-40 flex justify-center border-r"
                >
                  <span class="text-center py-2"> # </span>
                </BaseHeading>
              </div>

              <div v-for="h in hoursData" :key="h._id" class="">
                <div
                  v-if="checkEmptyPlanning(h)"
                  class="border-b-2 flex justify-start"
                >
                  <div
                    v-for="d in weekDates(activeDate)"
                    :key="d.getDay()"
                    class="text-muted-800 dark:text-white -mt-1 !h-[92px] !w-40 flex justify-center items-center border-r"
                    :style="
                      'background-color:' +
                      spotData[h.code][d.getDay()][1] +
                      ';'
                    "
                  >
                    <BaseButton
                      :title="
                        dayOfWeek(d) +
                        ' LE ' +
                        d.getDate() +
                        ' ' +
                        formatter.format(d) +
                        ' A ' +
                        h.name
                      "
                      @click="
                        openSpotPlanningModal(
                          d.getDate().toString(),
                          d,
                          h,
                          spotData[h.code][d.getDay()][2],
                          spotData[h.code][d.getDay()][3],
                        )
                      "
                      class="!w-6 !h-[2.106em] !bg-muted-100 rounded-full !px-1 !my-2"
                    >
                      <span
                        class="hover:text-primary-500/90 text-muted-800 text-sm"
                        >{{ spotData[h.code][d.getDay()][0] }}
                      </span>
                      <span
                        v-if="spotData[h.code][d.getDay()][3] > 1"
                        class="text-[10px] pr-1 text-gray-900"
                        >{{ spotData[h.code][d.getDay()][3] }}
                      </span>
                    </BaseButton>
                  </div>
                </div>
              </div>
              <div class="border-b-2 flex justify-start">
                <BaseHeading
                  v-for="d in activeDays"
                  :key="d"
                  as="h4"
                  size="sm"
                  weight="light"
                  lead="tight"
                  class="text-muted-800 dark:text-white pb-2 !w-40 flex justify-center border-r"
                >
                  <span class="text-center py-2"> # </span>
                </BaseHeading>
              </div>
            </BaseCard>
            <div v-if="true" class="flex justify-between py-4">
              <div class="text-xs">
                <p class="py-2">
                  NB: (Difusé:
                  <span class="px-1 text-primary-500"> E </span>; En attente de
                  diffusion: <span class="px-1 text-yellow-500"> E </span>; Non
                  difusé: <span class="px-1 text-red-500"> E </span>)
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
                    VISA RP
                  </BaseHeading>
                  <img
                    v-if="isPrintPlanning || isPrintCertificate"
                    class="h-28 fit-content"
                    src=""
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div>
        <!-- Footer -->
        <div class="fixed bottom-0 left-0 right-0 p-4 shadow-md">
          <div class="flex gap-x-2 justify-center">
            <BaseButton @click="captureContent('Planning')">
              <Icon
                name="lucide:camera"
                class="pointer-events-none h-4 w-4 mx-2"
              />
              Début Capture Emission
            </BaseButton>
            <BaseButton @click="printPlanning('planning')">
              <Icon
                name="lucide:printer"
                class="pointer-events-none h-4 w-4 mx-2"
              />
              Imprimer
            </BaseButton>
            <BaseButton
              :color="data?.data?.validator ? 'success' : 'warning'"
              flavor="solid"
              :disabled="
                authStore.user?.appRole?.name != UserRole.superAdmin &&
                authStore.user?.appRole?.name != UserRole.mediaPlanner
              "
              @click="isModalConfirmPlanningOpen = true"
            >
              {{
                data?.data?.validator
                  ? 'Planning validé'
                  : 'Valider le planning'
              }}
            </BaseButton>
            <BaseButton
              :color="'danger'"
              @click="isModalUseDefaultProgramOpen = true"
            >
              <Icon name="lucide:tv" class="pointer-events-none h-4 w-4 mx-2" />
              Utiliser les programmes par défaut
            </BaseButton>
            <BaseButton
              :color="'danger'"
              @click="isModalAddDefaultProgramOpen = true"
            >
              <Icon name="lucide:tv" class="pointer-events-none h-4 w-4 mx-2" />
              Définir comme par défaut
            </BaseButton>
            <div
              v-if="
                isCapturePageCertificate == true ||
                isCapturePagePlanning == true
              "
            >
              <BaseButton
                @click="removeWeek()"
                color="primary"
                class="w-full sm:w-20"
              >
                <Icon name="lucide:chevron-left" class="h-6 w-6" />
                <span></span>
              </BaseButton>
              <BaseButton
                @click="addWeek()"
                color="primary"
                class="w-full sm:w-20 mx-2"
              >
                <Icon name="lucide:chevron-right" class="h-6 w-6" />
                <span></span>
              </BaseButton>
            </div>
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
                        <option value="BA">Bande d'Annonce</option>
                        <option value="INT-E">Intervention Emission</option>
                        <option value="PUB-R">Publi Reportage</option>
                        <option value="PAD">Prêt à Diffuser</option>
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

    <!-- Modal default planning -->
    <TairoModal
      :open="isModalAddDefaultProgramOpen"
      size="sm"
      @close="isModalAddDefaultProgramOpen = false"
    >
      <template #header>
        <!-- Header -->
        <div class="flex w-full items-center justify-between p-4 md:p-6">
          <h3
            class="font-heading text-muted-900 text-lg font-medium leading-6 dark:text-white"
          >
            Planning par Défaut
          </h3>

          <BaseButtonClose @click="isModalAddDefaultProgramOpen = false" />
        </div>
      </template>

      <!-- Body -->
      <div class="p-4 md:p-6">
        <div class="mx-auto w-full max-w-xs text-center">
          <h3
            class="font-heading text-muted-800 text-lg font-medium leading-6 dark:text-white"
          >
            Voulez-vous définir le planning de cette semaine comme par défaut
            pour les autres semaines ?
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
            <BaseButton @click="isModalAddDefaultProgramOpen = false"
              >Non</BaseButton
            >

            <BaseButton
              color="warning"
              flavor="solid"
              @click="updateDefaultPlannings()"
              >Oui</BaseButton
            >
          </div>
        </div>
      </template>
    </TairoModal>

    <!-- Modal use default planning -->
    <TairoModal
      :open="isModalUseDefaultProgramOpen"
      size="sm"
      @close="isModalUseDefaultProgramOpen = false"
    >
      <template #header>
        <!-- Header -->
        <div class="flex w-full items-center justify-between p-4 md:p-6">
          <h3
            class="font-heading text-muted-900 text-lg font-medium leading-6 dark:text-white"
          >
            Integration Planning par Défaut
          </h3>

          <BaseButtonClose @click="isModalUseDefaultProgramOpen = false" />
        </div>
      </template>

      <!-- Body -->
      <div class="p-4 md:p-6">
        <div class="mx-auto w-full max-w-xs text-center">
          <h3
            class="font-heading text-muted-800 text-lg font-medium leading-6 dark:text-white"
          >
            Voulez-vous utiliser le planning par defaut pour cette semaine ?
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
            <BaseButton @click="isModalUseDefaultProgramOpen = false"
              >Non</BaseButton
            >

            <BaseButton
              color="warning"
              flavor="solid"
              @click="useDefaultPlannings()"
              >Oui</BaseButton
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
      class="!z-1000"
    >
      <template #header>
        <!-- Header -->
        <div class="flex w-full items-center justify-between p-4 md:p-6">
          <h3
            class="font-heading text-muted-900 text-lg font-medium leading-6 dark:text-white"
          >
            Choix de l'émission
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
                      {{ dayOfWeek(currentDate) }}
                      le
                      {{ activeDay }}
                      {{ formatter.format(currentDate) }}
                      {{ currentDate.getFullYear() }}
                      {{ 'à' }}
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
                        <BaseAutocomplete
                          v-model="currentTvProgram"
                          :error="errorMessage"
                          :disabled="isSubmitting"
                          :items="allTvPrograms"
                          :display-value="(item: any) => item.name || ''"
                          :filter-items="filterItems"
                          icon="lucide:tv"
                          placeholder="e.g. Canal Matin"
                          label="Emission"
                          clearable
                          :clear-value="''"
                        >
                          <template #empty="value"> Aucun resultat </template>
                        </BaseAutocomplete>
                      </Field>
                    </div>
                  </div>

                  <div class="grid grid-cols-12 gap-4">
                    <div class="ltablet:col-span-12 col-span-12 lg:col-span-12">
                      <Field
                        v-slot="{
                          field,
                          errorMessage,
                          handleChange,
                          handleBlur,
                        }"
                        name="planning.host"
                      >
                        <BaseAutocomplete
                          v-model="currentTvProgramHost"
                          :error="errorMessage"
                          :disabled="isSubmitting"
                          :items="allUsers"
                          :display-value="(item: any) => item.name || ''"
                          :filter-items="filterItems"
                          icon="lucide:user"
                          placeholder="e.g. Monique"
                          label="Présentateur"
                          clearable
                          :clear-value="''"
                        >
                          <template #empty="value"> Aucun resultat </template>
                        </BaseAutocomplete>
                      </Field>
                    </div>
                  </div>

                  <div class="grid grid-cols-12 gap-4 mt-4">
                    <div class="col-span-12 md:col-span-12">
                      <BaseListbox
                        v-model="currentHours"
                        label=""
                        :items="hoursData"
                        placeholder=""
                        :multiple-label="multipleLabel"
                        :properties="{
                          value: '_id',
                          label: 'code',
                          sublabel: 'value',
                        }"
                        multiple
                      />
                    </div>

                    <!-- <div class="col-span-12 md:col-span-4">
                      <Field
                        v-slot="{
                          field,
                          errorMessage,
                          handleChange,
                          handleBlur,
                        }"
                        name="planning.step"
                      >
                        <BaseInput
                          label="Pas"
                          type="number"
                          icon="ph:file"
                          placeholder=""
                          v-model="activeEnd.step"
                          :error="errorMessage"
                          :disabled="isSubmitting"
                          @update:model-value="handleChange"
                          @blur="handleBlur"
                        />
                      </Field>
                    </div>
                    <div class="col-span-12 md:col-span-4">
                      <Field
                        v-slot="{
                          field,
                          errorMessage,
                          handleChange,
                          handleBlur,
                        }"
                        name="planning.total"
                      >
                        <BaseInput
                          label="Nombre"
                          type="number"
                          icon="ph:file"
                          placeholder=""
                          v-model="activeEnd.total"
                          :error="errorMessage"
                          :disabled="isSubmitting"
                          @update:model-value="handleChange"
                          @blur="handleBlur"
                        />
                      </Field>
                    </div> -->
                  </div>
                  <div class="grid grid-cols-12 gap-4 mt-4">
                    <div class="col-span-12 md:col-span-12">
                      <Editor
                        class="!z-10001"
                        api-key="28vhdlyfnzs83pxfpaj979iljxwg6tviaz2y4gri6drif9ak"
                        v-model="currentDescription"
                        :init="{
                          height: 300,
                          menubar: true,
                          plugins: 'link image code',
                          toolbar:
                            'undo redo | formatselect | bold italic | forecolor backcolor | \
          alignleft aligncenter alignright | \
          bullist numlist outdent indent | removeformat | help',
                        }"
                      />
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
              v-if="activePlanningId"
              :to="'/bo/tv-programs/planning-details-' + activePlanningId"
              >Details</BaseButton
            >

            <BaseButton
              color="primary"
              flavor="solid"
              :disabled="isActionLoading || activePlanningId"
              :loading="isActionLoading"
              @click="addProgramToPlanning(null)"
            >
              Valider
            </BaseButton>
            <BaseButton
              v-if="activePlanningId"
              color="warning"
              flavor="solid"
              :disabled="isActionLoading"
              :loading="isActionLoading"
              @click="addProgramToPlanning(activePlanningId)"
            >
              Modifier
            </BaseButton>
            <BaseButton
              v-if="activePlanningId"
              color="danger"
              flavor="solid"
              @click="deleteSpotToPlanning()"
            >
              Supprimer
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
            PLANNING DES PROGRAMMES
          </h3>

          <BaseButtonClose @click="isModalPlanningOpen = false" />
        </div>
      </template>

      <!-- Body -->
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
        <div v-else class="mt-8">
          <div class="flex items-center justify-center">
            <!-- <BaseAvatar :src="selectedSpot?.product" size="2xl" /> -->
          </div>
          <div class="text-center">
            <BaseHeading tag="h3" size="lg" class="mt-4"> </BaseHeading>
            <BaseParagraph size="sm" class="text-muted-400"> </BaseParagraph>
            <div class="my-4">
              <BaseParagraph
                size="sm"
                class="text-muted-500 dark:text-muted-400"
              >
              </BaseParagraph>
              <BaseParagraph
                size="sm"
                class="text-muted-500 dark:text-muted-400"
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
                <span> Consulter le planning du produit </span>
              </BaseButton>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
