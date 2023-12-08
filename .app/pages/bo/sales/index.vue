<script setup lang="ts">
import { Calendar } from 'v-calendar'
import { Field } from 'vee-validate'

import 'v-calendar/dist/style.css'
import '~/assets/css/vcalendar.css'
import { UserRole } from '~/types/user'

definePageMeta({
  title: 'Tableau de bord Ventes',
  preview: {
    title: 'Analytics dashboard',
    description: 'Analytic',
    categories: ['bo', 'spots'],
    src: '/img/screens/dashboards-analytics.png',
    srcDark: '/img/screens/dashboards-analytics-dark.png',
    order: 2,
  },
})

const authStore = useAuthStore()
const route = useRoute()
const router = useRouter()
const page = computed(() => parseInt((route.query.page as string) ?? '1'))
const filter = ref('')
const perPage = ref(10)
const token = useCookie('token')

const toaster = useToaster()
// Check if can have access
if (
  authStore.user.appRole?.name != UserRole.billing &&
  authStore.user.appRole?.name != UserRole.admin &&
  authStore.user.appRole?.name != UserRole.accountancy &&
  authStore.user.appRole?.name != UserRole.superAdmin
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
    filter: filter.value,
    perPage: perPage.value,
    page: page.value,
    action: 'findAllStats',
    token: token.value,
  }
})

const { data, pending, error, refresh } = await useFetch('/api/pub/plannings', {
  query,
})

const query2 = computed(() => {
  return {
    filter: filter.value,
    perPage: perPage.value,
    page: page.value,
    action: 'findAll',
    token: token.value,
  }
})

const { data: announcersData } = await useFetch('/api/sales/announcers', {
  query: query2,
})

const lineSpots = reactive(useLineSpots())
const radialGoal = reactive(useRadialGoal())
const radialGrowth = reactive(useRadialGrowth())

const years = [
  {
    id: '2023',
    name: '2023',
  },
]

const months = [
  {
    id: '01',
    name: 'Jan',
  },
  {
    id: '02',
    name: 'Fev',
  },
  {
    id: '03',
    name: 'Mars',
  },
  {
    id: '04',
    name: 'Avril',
  },
  {
    id: '05',
    name: 'Mai',
  },
  {
    id: '06',
    name: 'Juin',
  },
  {
    id: '07',
    name: 'Juil',
  },
  {
    id: '08',
    name: 'Aôut',
  },
  {
    id: '09',
    name: 'Sept',
  },
  {
    id: '10',
    name: 'Oct',
  },
  {
    id: '11',
    name: 'Nov',
  },
  {
    id: '12',
    name: 'Dec',
  },
]

const pubCategories = [
  {
    id: 'SPOT',
    name: 'SPOT',
  },
  {
    id: 'BA',
    name: "Bande d'annonce",
  },
  {
    id: 'ALL',
    name: 'Tout',
  },
]
const activeYear = ref()
const activeMonth = ref()
const activeCategory = ref()

function useLineSpots() {
  const { primary } = useTailwindColors()
  const type = 'line'
  const height = 250

  const options = {
    chart: {
      zoom: {
        enabled: true,
      },
      toolbar: {
        show: true,
      },
    },
    colors: [primary.value],
    dataLabels: {
      enabled: true,
    },
    stroke: {
      width: [2, 2, 2],
      curve: 'smooth',
    },
    grid: {
      row: {
        colors: ['transparent', 'transparent'], // takes an array which will be repeated on columns
        opacity: 0.5,
      },
    },
    xaxis: {
      categories: [
        'Jan',
        'Feb',
        'Mar',
        'Apr',
        'May',
        'Jun',
        'Jul',
        'Aug',
        'Sep',
        'Oct',
        'Nov',
        'Dec',
      ],
    },
    tooltip: {
      y: {
        formatter: function (val: string) {
          return '' + val
        },
      },
    },
  }

  const series = ref([
    {
      name: 'Diffusés',
      data: data.value?.metaData?.statsValues,
    },
  ])

  return {
    type,
    height,
    options,
    series,
  }
}

function useRadialGoal() {
  const { success, danger } = useTailwindColors()
  const type = 'radialBar'
  const height = 250

  const options = {
    chart: {
      offsetY: -10,
    },
    colors: [success.value, danger.value],
    plotOptions: {
      radialBar: {
        startAngle: -135,
        endAngle: 135,
        inverseOrder: false,
        dataLabels: {
          show: true,
          name: {
            show: true,
            fontSize: '14px',
            fontWeight: 500,
            offsetY: -10,
          },
          value: {
            show: true,
            fontWeight: 600,
            fontSize: '16px',
            offsetY: -5,
          },
          total: {
            show: false,
            fontSize: '20px',
            fontWeight: 500,
          },
        },
        hollow: {
          margin: 30,
          size: '75%',
        },
        track: {
          strokeWidth: '100%',
        },
      },
    },

    stroke: {
      lineCap: 'round',
    },
    labels: ['Diffusés', 'Non Diffusés'],
  }

  const series = ref([
    (
      (data.value?.metaData?.totalDiffused / data.value?.metaData?.totalItems) *
      100
    ).toFixed(),
    (
      (data.value?.metaData?.totalNotDiffused /
        data.value?.metaData?.totalItems) *
      100
    ).toFixed(),
  ])

  return {
    type,
    height,
    options,
    series,
  }
}

function useRadialGrowth() {
  const { success } = useTailwindColors()
  const height = 250
  const type = 'radialBar'

  const options = {
    chart: {
      toolbar: {
        show: false,
      },
    },
    colors: [success.value],
    plotOptions: {
      radialBar: {
        hollow: {
          size: '75%',
        },
        dataLabels: {
          show: true,
          name: {
            show: true,
            fontSize: '0.9rem',
            fontFamily: 'Roboto',
            fontWeight: 400,
            offsetY: -10,
          },
          value: {
            show: true,
            fontWeight: 600,
            fontSize: '16px',
            fontFamily: 'Roboto',
            offsetY: -5,
          },
        },
      },
    },
    labels: ['Diffusés'],
  }

  const series = ref([
    (
      (data.value?.metaData?.totalDiffused / data.value?.metaData?.totalItems) *
      100
    ).toFixed(),
  ])

  return {
    type,
    height,
    options,
    series,
  }
}

function useBarSalesProfit() {
  const { primary, info, success } = useTailwindColors()
  const type = 'bar'
  const height = 250

  const options = {
    chart: {
      toolbar: {
        show: false,
      },
    },
    colors: [primary.value, info.value, success.value],
    legend: {
      position: 'top',
    },
    plotOptions: {
      bar: {
        horizontal: false,
        endingShape: 'rounded',
        columnWidth: '55%',
      },
    },
    dataLabels: {
      enabled: false,
    },
    stroke: {
      show: true,
      width: 2,
      colors: ['transparent'],
    },
    xaxis: {
      categories: [
        'Feb',
        'Mar',
        'Apr',
        'May',
        'Jun',
        'Jul',
        'Aug',
        'Sep',
        'Oct',
      ],
    },
    yaxis: {
      labels: {
        formatter: function (val: string) {
          return val + 70
        },
      },
    },
    fill: {
      opacity: 1,
    },
    tooltip: {
      y: {
        formatter: function (val: string) {
          return val + 70
        },
      },
    },
  }

  const series = ref([
    {
      name: 'Net Profit',
      data: [-26, -15, -13, -14, -9, -12, -7, -10, -4],
    },
    {
      name: 'Revenue',
      data: [6, 15, 31, 28, 17, 35, 21, 44, 24],
    },
    {
      name: 'Free Cash Flow',
      data: [-35, -29, -34, -44, -25, -22, -18, -17, -29],
    },
  ])

  return {
    type,
    height,
    options,
    series,
  }
}
</script>

<template>
  <div class="grid grid-cols-12 gap-4">
    <!-- Grid column -->
    <div class="ltablet:col-span-9 col-span-12 lg:col-span-12">
      <!-- Inner grid -->
      <div class="mb-4 flex items-center justify-between">
        <BaseHeading
          as="h3"
          size="md"
          weight="semibold"
          lead="tight"
          class="text-muted-800 dark:text-white"
        >
          <span>Année</span>
        </BaseHeading>
        <Field
          v-slot="{ field, errorMessage, handleChange, handleBlur }"
          name="year"
        >
          <BaseListbox
            class="px-10"
            label=""
            :items="years"
            :properties="{
              value: 'id',
              label: 'name',
              sublabel: 'name',
              media: 'image',
            }"
            v-model="activeYear"
            :error="errorMessage"
            :disabled="isSubmitting"
            @update:model-value="handleChange"
            @blur="handleBlur"
          />
        </Field>

        <BaseHeading
          as="h3"
          size="md"
          weight="semibold"
          lead="tight"
          class="text-muted-800 dark:text-white"
        >
          <span>Mois</span>
        </BaseHeading>
        <Field
          v-slot="{ field, errorMessage, handleChange, handleBlur }"
          name="month"
        >
          <BaseListbox
            class="px-10"
            label=""
            :items="months"
            :properties="{
              value: 'id',
              label: 'name',
              sublabel: 'name',
              media: 'image',
            }"
            v-model="activeMonth"
            :error="errorMessage"
            :disabled="isSubmitting"
            @update:model-value="handleChange"
            @blur="handleBlur"
          />
        </Field>

        <BaseHeading
          as="h3"
          size="md"
          weight="semibold"
          lead="tight"
          class="text-muted-800 dark:text-white"
        >
          <span>Categorie</span>
        </BaseHeading>

        <Field
          v-slot="{ field, errorMessage, handleChange, handleBlur }"
          name="category"
        >
          <BaseListbox
            class="px-10"
            label=""
            :items="pubCategories"
            :properties="{
              value: 'id',
              label: 'name',
              sublabel: 'name',
              media: 'image',
            }"
            v-model="activeCategory"
            :error="errorMessage"
            :disabled="isSubmitting"
            @update:model-value="handleChange"
            @blur="handleBlur"
          />
        </Field>
        <NuxtLink
          to="#"
          class="bg-muted-200 hover:bg-muted-300 flex dark:bg-muted-700 dark:hover:bg-muted-900 text-primary-500 rounded-lg px-4 py-2 font-sans text-sm font-medium underline-offset-4 transition-colors duration-300 hover:underline"
        >
          Rechercher
          <Icon name="lucide:search" class="h-5 w-10" />
        </NuxtLink>
      </div>

      <div class="grid grid-cols-12 gap-4">
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
                <span>Total devis</span>
              </BaseHeading>
              <BaseIconBox
                size="xs"
                class="bg-success-100 text-success-500 dark:bg-success-500/20 dark:text-success-400 dark:border-success-500 dark:border-2"
                shape="full"
              >
                <Icon name="ph:play" class="h-5 w-5" />
              </BaseIconBox>
            </div>
            <div class="mb-2">
              <BaseHeading
                as="h4"
                size="3xl"
                weight="bold"
                lead="tight"
                class="text-muted-800 dark:text-white"
              >
                <span>{{ data?.metaData?.totalDiffused }}</span>
              </BaseHeading>
            </div>
            <div
              class="text-success-500 flex items-center gap-1 font-sans text-sm"
            >
              <span>+7.8%</span>
              <Icon name="lucide:trending-up" class="h-5 w-5" />
              <span class="text-muted-400 text-xs">en hause</span>
            </div>
          </BaseCard>
        </div>
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
                <span>Total factures</span>
              </BaseHeading>
              <BaseIconBox
                size="xs"
                class="bg-danger-100 text-danger-500 dark:bg-danger-500/20 dark:text-danger-400 dark:border-danger-500 dark:border-2"
                shape="full"
              >
                <Icon name="ph:warning" class="h-5 w-5" />
              </BaseIconBox>
            </div>
            <div class="mb-2">
              <BaseHeading
                as="h4"
                size="3xl"
                weight="bold"
                lead="tight"
                class="text-muted-800 dark:text-white"
              >
                <span>{{ data?.metaData?.totalNotDiffused }}</span>
              </BaseHeading>
            </div>
            <div
              class="text-success-500 flex items-center gap-1 font-sans text-sm"
            >
              <span>+7.8%</span>
              <Icon name="lucide:trending-up" class="h-5 w-5" />
              <span class="text-muted-400 text-xs">en hause</span>
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
                <span>Total Annonceurs</span>
              </BaseHeading>
              <BaseIconBox
                size="xs"
                class="bg-yellow-100 text-yellow-500 dark:bg-yellow-500/20 dark:text-yellow-400 dark:border-yellow-500 dark:border-2"
                shape="full"
              >
                <Icon name="ph:package" class="h-5 w-5" />
              </BaseIconBox>
            </div>
            <div class="mb-2">
              <BaseHeading
                as="h4"
                size="3xl"
                weight="bold"
                lead="tight"
                class="text-muted-800 dark:text-white"
              >
                <span>{{ data?.metaData?.totalPackages }}</span>
              </BaseHeading>
            </div>
            <div
              class="text-success-500 flex items-center gap-1 font-sans text-sm"
            >
              <span>+7.8%</span>
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
                <span>Total Articles</span>
              </BaseHeading>
              <BaseIconBox
                size="xs"
                class="bg-yellow-100 text-yellow-500 dark:border-2 dark:border-yellow-500 dark:bg-yellow-500/20 dark:text-yellow-400"
                shape="full"
              >
                <Icon name="ph:user" class="h-5 w-5" />
              </BaseIconBox>
            </div>
            <div class="mb-2">
              <BaseHeading
                as="h4"
                size="3xl"
                weight="bold"
                lead="tight"
                class="text-muted-800 dark:text-white"
              >
                <span>{{ announcersData?.total }}</span>
              </BaseHeading>
            </div>
            <div
              class="text-danger-500 flex items-center gap-1 font-sans text-sm"
            >
              <span>-20%</span>
              <Icon name="lucide:trending-down" class="h-5 w-5" />
              <span class="text-muted-400 text-xs">en baisse</span>
            </div>
          </BaseCard>
        </div>
        <!-- Stat tile -->
        <!-- Chart -->
        <div class="col-span-12 md:col-span-12">
          <BaseCard class="p-6">
            <div class="flex gap-8">
              <div>
                <span class="text-muted-400 font-sans text-xs">Ce mois</span>
                <p class="text-primary-500 font-sans text-lg font-medium">
                  {{ data.metaData?.resumeValues[1] ?? 0 }} XAF
                </p>
              </div>
              <div>
                <span class="text-muted-400 font-sans text-xs"
                  >Le mois dernier</span
                >
                <p
                  class="text-muted-800 dark:text-muted-100 font-sans text-lg font-medium"
                >
                  {{ data.metaData?.resumeValues[0] ?? 0 }} XAF
                </p>
              </div>
            </div>
            <AddonApexcharts v-bind="lineSpots" />
          </BaseCard>
        </div>
        <!-- Chart -->
        <div class="col-span-12 md:col-span-6">
          <BaseCard class="flex h-full flex-col p-6">
            <div class="mb-10 flex items-center justify-between">
              <BaseHeading
                as="h3"
                size="md"
                weight="semibold"
                lead="tight"
                class="text-muted-800 dark:text-white"
              >
                <span>Bilan total des spots</span>
              </BaseHeading>
            </div>
            <div class="mb-6">
              <AddonApexcharts v-bind="radialGoal" />
            </div>
            <div class="mt-auto">
              <div
                class="border-muted-200 dark:border-muted-700 flex w-full border-t pt-4 text-center"
              >
                <div
                  class="border-muted-200 dark:border-muted-700 flex-1 border-r px-2"
                >
                  <span class="text-muted-400 font-sans text-xs">
                    Spots diffusés
                  </span>
                  <p
                    class="text-muted-800 dark:text-muted-100 font-sans text-lg font-medium"
                  >
                    {{ data.metaData?.totalDiffused }}
                  </p>
                </div>
                <div class="flex-1 px-2">
                  <span class="text-muted-400 font-sans text-xs">
                    Spots non diffusés
                  </span>
                  <p
                    class="text-muted-800 dark:text-muted-100 font-sans text-lg font-medium"
                  >
                    {{ data.metaData?.totalNotDiffused }}
                  </p>
                </div>
              </div>
            </div>
          </BaseCard>
        </div>
        <!-- Chart -->
        <div class="col-span-12 md:col-span-6">
          <BaseCard class="flex h-full flex-col p-6">
            <div class="mb-5 flex items-center justify-between">
              <BaseHeading
                as="h3"
                size="md"
                weight="semibold"
                lead="tight"
                class="text-muted-800 dark:text-white"
              >
                <span>Indice de fiabilité</span>
              </BaseHeading>
            </div>
            <div class="mb-6">
              <AddonApexcharts v-bind="radialGrowth" />
            </div>
            <div class="mt-auto">
              <div class="flex justify-center gap-2">
                <!-- <Icon name="logos:tairo" class="h-8 w-8" /> -->
                <div>
                  <BaseHeading
                    as="h5"
                    size="sm"
                    weight="light"
                    lead="tight"
                    class="text-muted-800 dark:text-white"
                  >
                    <span>Indicateur global</span>
                  </BaseHeading>
                  <BaseParagraph size="xs">
                    <span class="text-muted-400"></span>
                  </BaseParagraph>
                </div>
              </div>
            </div>
          </BaseCard>
        </div>
        <!-- Chart -->
      </div>
    </div>
  </div>
</template>
