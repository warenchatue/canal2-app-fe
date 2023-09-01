<script setup lang="ts">
defineProps({
  orgName: {
    type: String,
    default: '',
  },

  orgSlug: {
    type: String,
    default: '',
  },

  orgDescription: {
    type: String,
    default: '',
  },
  orgBackGroundUrl: {
    type: String,
    default: '',
  },
})
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
    <div class="absolute inset-0 z-0 h-screen w-full">
      <img
        class="absolute h-screen w-full object-cover"
        src="https://upload.wikimedia.org/wikipedia/commons/thumb/8/8c/Cour_du_Palais_de_Bandjoun.jpg/1024px-Cour_du_Palais_de_Bandjoun.jpg"
        alt=""
      />
      <div
        class="dark:to-muted-900/75 dark:from-muted-900/95 to-muted-900/90 absolute h-screen w-full bg-gradient-to-b from-transparent"
      ></div>
    </div>
    <div class="gridlines absolute inset-x-0 z-10 -mt-8 py-20"></div>
    <div class="absolute inset-x-0 z-20 -mt-24 py-20">
      <div
        class="mt-12 grid grid-cols-2 -space-x-52 opacity-60 dark:opacity-75 2xl:mx-auto 2xl:max-w-6xl"
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
          class="xs:!text-2xl mx-auto mb-4 max-w-4xl text-white"
        >
          Bienvenue sur la plateforme de
          <span
            class="text-primary-500 font-hairline underline decoration-dotted underline-offset-4"
            >Collecte de fonds
          </span>
          et de

          <span
            class="text-primary-500 font-hairline underline decoration-dotted underline-offset-4"
            >dons</span
          >
          de la {{ orgName }}
        </BaseHeading>
        <BaseParagraph size="lg" class="text-muted-100 mx-auto mb-4 max-w-2xl">
          {{ orgDescription }}
        </BaseParagraph>
        <div class="flex items-center justify-center">
          <BaseButton
            shape="curved"
            color="primary"
            :to="'/org/contribution/' + orgSlug"
            shadow="hover"
            class="w-55 !h-12 text-sm md:text-base"
          >
            Faire un don
          </BaseButton>
          <BaseButton
            shape="curved"
            color="primary"
            :to="'/org/projects/' + orgSlug"
            shadow="hover"
            class="w-55 mx-4 !h-12 text-sm md:text-base"
          >
            Contribuer à un projet
          </BaseButton>
        </div>
      </div>
    </div>
    <!-- Widget -->
    <div class="mt-4 flex justify-center md:mt-2 md:justify-end">
      <BaseCard shape="curved" class="mx-2 !w-40 p-2">
        <DemoInfoImage
          shape="curved"
          image="https://chart.googleapis.com/chart?cht=qr&chl=http%3A%2F%2F192.168.0.101%3A3000%2Forg%2Fcontribution%2Fbandjoun&chs=180x180&choe=UTF-8&chld=L|2"
          title=""
          :text="'Scannez pour faire un don'"
        />
      </BaseCard>
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
