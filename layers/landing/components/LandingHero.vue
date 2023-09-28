<script setup lang="ts">
const { y } = useNinjaWindowScroll()

const gaugePersonal = reactive(useGaugePersonal())

function useGaugePersonal() {
  const { primary } = useTailwindColors()
  const type = 'radialBar'
  const height = 220

  const options = {
    title: {
      text: undefined,
    },
    chart: {
      sparkline: {
        enabled: true,
      },
      toolbar: {
        show: false,
      },
    },
    colors: [primary.value],
    plotOptions: {
      radialBar: {
        startAngle: -90,
        endAngle: 90,
        track: {
          background: '#e7e7e7',
          strokeWidth: '97%',
          margin: 5, // margin is in pixels
          dropShadow: {
            enabled: false,
            top: 2,
            left: 0,
            color: '#999',
            opacity: 1,
            blur: 2,
          },
        },
        hollow: {
          margin: 0,
          size: '35%',
        },
        dataLabels: {
          name: {
            show: false,
          },
          value: {
            offsetY: -2,
            fontSize: '22px',
          },
        },
      },
    },
    fill: {
      type: 'gradient',
      gradient: {
        shade: 'light',
        shadeIntensity: 0.1,
        inverseColors: false,
        opacityFrom: 1,
        opacityTo: 1,
        stops: [0, 50, 53, 91],
      },
    },
    labels: ['Average Results'],
  }

  const series = ref([76])

  return {
    type,
    height,
    options,
    series,
  }
}
</script>

<template>
  <div
    class="dark:to-muted-900 relative min-h-screen overflow-hidden bg-gradient-to-b from-transparent to-white"
  >
    <div class="gridlines absolute inset-x-0 z-10 -mt-8 py-20"></div>
    <div class="absolute inset-x-0 z-20 -mt-24 py-20">
      <div
        class="mt-12 grid grid-cols-2 -space-x-52 opacity-60 dark:opacity-50 2xl:mx-auto 2xl:max-w-6xl"
      >
        <div
          class="from-primary-200 to-primary-400 h-40 bg-gradient-to-br blur-3xl dark:from-blue-700"
        ></div>
        <div
          class="dark:to-primary-600 h-24 bg-gradient-to-r from-indigo-400 to-indigo-700 blur-3xl"
        ></div>
      </div>
    </div>
    <div class="mx-auto w-full max-w-7xl px-4">
      <div class="relative z-30 pt-32 text-center md:pt-60">
        <BaseHeading
          as="h1"
          size="5xl"
          weight="light"
          lead="tight"
          class="text-muted-800 xs:!text-4xl mx-auto mb-4 max-w-4xl dark:text-white"
        >
          Bienvenue sur le conducteur publicitaire de
          <span
            class="text-primary-500 font-hairline underline decoration-dotted underline-offset-4"
            >Canal2 International
          </span>
        </BaseHeading>
        <BaseParagraph
          size="lg"
          class="text-muted-500 dark:text-muted-100 mx-auto mb-4 max-w-2xl"
        >
          C2PUB
        </BaseParagraph>
        <div class="flex items-center justify-center">
          <BaseButton
            shape="curved"
            color="primary"
            to="/auth/login"
            shadow="hover"
            class="w-55 !h-12"
          >
            Démarrer
          </BaseButton>
        </div>
      </div>
      <!-- Components -->
    </div>
  </div>
</template>

<style scoped>
.gridlines {
  background-image: url(/img/illustrations/gridlines.svg);
}

.dark .gridlines {
  background-image: url(/img/illustrations/gridlines-dark.svg);
}
</style>
