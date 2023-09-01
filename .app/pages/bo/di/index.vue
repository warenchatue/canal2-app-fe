<script setup lang="ts">
import { Calendar } from 'v-calendar'
import { Field } from 'vee-validate'

import 'v-calendar/dist/style.css'
import '~/assets/css/vcalendar.css'

definePageMeta({
  title: 'Dashboard',
  preview: {
    title: 'Analytics',
    description: 'Analytic',
    categories: ['dashboards'],
    src: '/img/screens/dashboards-analytics.png',
    srcDark: '/img/screens/dashboards-analytics-dark.png',
    order: 2,
  },
})

const orgStore = useOrgStore()
const app = useAppStore()
const lineRevenue = reactive(useLineRevenue())
const radialGoal = reactive(useRadialGoal())
const radialGrowth = reactive(useRadialGrowth())
const barSalesProfit = reactive(useBarSalesProfit())

const people = [
  {
    id: 1,
    name: 'Clarissa Perez',
    text: 'Sales Manager',
    media: '/img/avatars/19.svg',
  },
  {
    id: 2,
    name: 'Aaron Splatter',
    text: 'Project Manager',
    media: '/img/avatars/16.svg',
  },
  {
    id: 3,
    name: 'Mike Miller',
    text: 'UI/UX Designer',
    media: '/img/avatars/3.svg',
  },
  {
    id: 4,
    name: 'Benedict Kessler',
    text: 'Mobile Developer',
    media: '/img/avatars/22.svg',
  },
  {
    id: 5,
    name: 'Maya Rosselini',
    text: 'Product Manager',
    media: '/img/avatars/2.svg',
  },
]

function useLineRevenue() {
  const { primary } = useTailwindColors()
  const type = 'line'
  const height = 250

  const options = {
    chart: {
      zoom: {
        enabled: false,
      },
      toolbar: {
        show: false,
      },
    },
    colors: [primary.value],
    dataLabels: {
      enabled: false,
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
    tooltip: {
      y: {
        formatter: function (val: string) {
          return '$' + val
        },
      },
    },
  }

  const series = ref([
    {
      name: 'Revenue',
      data: [
        1000835, 4000214, 3620057, 5100411, 4569007, 6120021, 6529005, 9151200,
        756048,
      ],
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
  const { primary, success } = useTailwindColors()
  const type = 'radialBar'
  const height = 220

  const options = {
    chart: {
      offsetY: -10,
    },
    colors: [primary.value, success.value],
    plotOptions: {
      radialBar: {
        startAngle: -135,
        endAngle: 135,
        inverseOrder: true,
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
            show: true,
            fontSize: '14px',
            fontWeight: 500,
          },
        },
        hollow: {
          margin: 15,
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
    labels: ['Efficiency', 'Productivity'],
  }

  const series = ref([57, 86])

  return {
    type,
    height,
    options,
    series,
  }
}

function useRadialGrowth() {
  const { success } = useTailwindColors()
  const height = 180
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
            fontSize: '0.7rem',
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
    labels: ['Growth'],
  }

  const series = ref([65])

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

const route = useRoute()
const router = useRouter()
const page = computed(() => parseInt((route.query.page as string) ?? '1'))
const filter = ref('')
const perPage = ref(10)
const query = computed(() => {
  return {
    filter: filter.value,
    perPage: perPage.value,
    page: page.value,
    slug: app.activeOrg.slug,
    action: 'getForOrg',
  }
})
const activeFundRaising = ref({ id: '', name: '', category: '', image: '' })
const { data: fundsRaisingData, pending: fundsRaisingPending } = await useFetch(
  '/api/funds-raising',
  {
    query,
  },
)
</script>

<template>
  <div class="grid grid-cols-12 gap-4">
    <!-- Grid column -->
    <div class="ltablet:col-span-9 col-span-12 lg:col-span-12">
      <!-- Inner grid -->
      <div class="grid grid-cols-12 gap-4">
        <!-- Stat tile -->
        <div class="col-span-12 md:col-span-4">
          <BaseCard class="p-4">
            <div class="mb-1 flex items-center justify-between">
              <BaseHeading
                as="h5"
                size="sm"
                weight="medium"
                lead="tight"
                class="text-muted-500 dark:text-muted-400"
              >
                <span>Total DI</span>
              </BaseHeading>
              <BaseIconBox
                size="xs"
                class="bg-success-100 text-success-500 dark:bg-success-500/20 dark:text-success-400 dark:border-success-500 dark:border-2"
                shape="full"
              >
                <Icon name="ph:rocket-duotone" class="h-5 w-5" />
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
                <span>2,549</span>
              </BaseHeading>
            </div>
            <div
              class="text-success-500 flex items-center gap-1 font-sans text-sm"
            >
              <span>+7.8%</span>
              <Icon name="lucide:trending-up" class="h-5 w-5" />
              <span class="text-muted-400 text-xs"
                >depuis l'année derniere</span
              >
            </div>
          </BaseCard>
        </div>

        <!-- Stat tile -->
        <div class="col-span-12 md:col-span-4">
          <BaseCard class="p-4">
            <div class="mb-1 flex items-center justify-between">
              <BaseHeading
                as="h5"
                size="sm"
                weight="medium"
                lead="tight"
                class="text-muted-500 dark:text-muted-400"
              >
                <span>Total Importations</span>
              </BaseHeading>
              <BaseIconBox
                size="xs"
                class="bg-primary-100 text-primary-500 dark:bg-primary-500/20 dark:text-primary-400 dark:border-primary-500 dark:border-2"
                shape="full"
              >
                <Icon name="ph:rocket-duotone" class="h-5 w-5" />
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
                <span>8062</span>
              </BaseHeading>
            </div>
            <div
              class="text-success-500 flex items-center gap-1 font-sans text-sm"
            >
              <span>+4.5%</span>
              <Icon name="lucide:trending-up" class="h-5 w-5" />
              <span class="text-muted-400 text-xs">en hausse</span>
            </div>
          </BaseCard>
        </div>
           <!-- Stat tile -->
           <div class="col-span-12 md:col-span-4">
          <BaseCard class="p-4">
            <div class="mb-1 flex items-center justify-between">
              <BaseHeading
                as="h5"
                size="sm"
                weight="medium"
                lead="tight"
                class="text-muted-500 dark:text-muted-400"
              >
                <span>Entités</span>
              </BaseHeading>
              <BaseIconBox
                size="xs"
                class="bg-yellow-100 text-yellow-500 dark:border-2 dark:border-yellow-500 dark:bg-yellow-500/20 dark:text-yellow-400"
                shape="full"
              >
                <Icon name="ph:rocket-duotone" class="h-5 w-5" />
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
                <span>15</span>
              </BaseHeading>
            </div>
            <div
              class="text-danger-500 flex items-center gap-1 font-sans text-sm"
            >
              <span>2</span>
              <Icon name="lucide:trending-down" class="h-5 w-5" />
              <span class="text-muted-400 text-xs">en baisse</span>
            </div>
          </BaseCard>
        </div>
        <!-- Chart -->
        <div class="col-span-12 md:col-span-12">
          <BaseCard class="p-6">
            <div class="mb-2 flex items-center justify-between">
              <BaseHeading
                as="h3"
                size="md"
                weight="semibold"
                lead="tight"
                class="text-muted-800 dark:text-white"
              >
                <span>DI</span>
              </BaseHeading>
              <Field
                v-slot="{ field, errorMessage, handleChange, handleBlur }"
                name="payment.country"
              >
                <BaseListbox
                  class="px-10"
                  label=""
                  :items="fundsRaisingData?.data"
                  :properties="{
                    value: 'id',
                    label: 'name',
                    sublabel: 'category',
                    media: 'image',
                  }"
                  v-model="activeFundRaising"
                  :error="errorMessage"
                  :disabled="isSubmitting"
                  @update:model-value="handleChange"
                  @blur="handleBlur"
                />
              </Field>
              <NuxtLink
                to="#"
                class="bg-muted-100 hover:bg-muted-200 dark:bg-muted-700 dark:hover:bg-muted-900 text-primary-500 rounded-lg px-4 py-2 font-sans text-sm font-medium underline-offset-4 transition-colors duration-300 hover:underline"
              >
                Details
              </NuxtLink>
            </div>
            <div class="flex gap-8">
              <div>
                <span class="text-muted-400 font-sans text-xs">Ce mois</span>
                <p class="text-primary-500 font-sans text-lg font-medium">
                  650 000 XAF
                </p>
              </div>
              <div>
                <span class="text-muted-400 font-sans text-xs"
                  >Le mois dernier</span
                >
                <p
                  class="text-muted-800 dark:text-muted-100 font-sans text-lg font-medium"
                >
                  350 000 XAF
                </p>
              </div>
            </div>
            <AddonApexcharts v-bind="lineRevenue" />
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
                <span>Vue d'ensemble</span>
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
                    Completed
                  </span>
                  <p
                    class="text-muted-800 dark:text-muted-100 font-sans text-lg font-medium"
                  >
                    1431
                  </p>
                </div>
                <div class="flex-1 px-2">
                  <span class="text-muted-400 font-sans text-xs">
                    In Progress
                  </span>
                  <p
                    class="text-muted-800 dark:text-muted-100 font-sans text-lg font-medium"
                  >
                    219
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
                <span>Evolution des dons</span>
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
                    <span>{{ orgStore?.activeOrg?.name }}</span>
                  </BaseHeading>
                  <BaseParagraph size="xs">
                    <span class="text-muted-400">Indicateur global</span>
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
