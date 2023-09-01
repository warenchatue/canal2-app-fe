<script setup lang="ts">
const props = defineProps({
  data: {
    type: Object,
    required: true,
  },
})
const { data } = props
const selectedStyle = ref('classic')
const toggled = ref(false)
const progress = ref(25)
const router = useRouter()

async function goToContribution() {
  router.push('/org/contribution/' + data.project.slug)
}

watch(selectedStyle, (value) => {
  if (value) {
    toggled.value = true
    const timeout = setTimeout(() => {
      toggled.value = false
      clearTimeout(timeout)
    }, 1750)
  }
})
</script>

<template>
  <div class="grid grid-cols-12 gap-6">
    <div class="ltablet:col-span-8 col-span-12 lg:col-span-8">
      <BaseCard class="space-y-12 p-10">
        <div
          class="border-muted-200 dark:border-muted-700 flex flex-col items-center justify-between gap-8 border-b pb-12 sm:flex-row"
        >
          <div>
            <BaseHeading tag="h2" size="2xl" weight="medium">
              {{ data?.project.name }}
            </BaseHeading>
            <BaseParagraph size="lg" class="text-muted-600 dark:text-muted-400">
              {{ data?.project.category }}
            </BaseParagraph>
            <BaseParagraph size="md" class="text-muted-300 py-4">
              {{ data?.project.description }}
            </BaseParagraph>
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2">
                <BaseAvatar
                  :src="data?.project.owner.medias?.logo"
                  :data-tooltip="`${data?.project.owner.name} owns this project`"
                />
                <div>
                  <BaseHeading tag="h3" size="sm" weight="medium">
                    {{ data?.project.owner.name }}
                  </BaseHeading>
                  <BaseParagraph size="xs" class="text-muted-400">
                    {{ data?.project.owner.description }} | Initiateur du projet
                  </BaseParagraph>
                </div>
              </div>
            </div>
          </div>
          <div class="w-full shrink-0 sm:w-72">
            <img
              :src="data?.project.image"
              :alt="data?.project.name"
              class="rounded-lg"
            />
          </div>
        </div>
        <div
          class="border-muted-200 dark:border-muted-700 grid gap-4 border-b pb-12 sm:grid-cols-4"
        >
          <div>
            <Icon
              name="ph:calendar-blank-duotone"
              class="text-primary-500 mb-2 h-6 w-6"
            />
            <div>
              <BaseHeading tag="h3" size="sm" weight="medium">
                22-05-2023
              </BaseHeading>
              <BaseParagraph size="xs" lead="tight" class="text-muted-400">
                Date de création
              </BaseParagraph>
            </div>
          </div>
          <div>
            <Icon name="ph:money" class="text-primary-500 mb-2 h-6 w-6" />
            <div>
              <BaseHeading tag="h3" size="sm" weight="medium">
                6 300 000 XAF
              </BaseHeading>
              <BaseParagraph size="xs" lead="tight" class="text-muted-400">
                Budget prévu
              </BaseParagraph>
            </div>
          </div>
          <div>
            <Icon name="ph:money" class="text-primary-500 mb-2 h-6 w-6" />
            <div>
              <BaseHeading tag="h3" size="sm" weight="medium">
                Libre
              </BaseHeading>
              <BaseParagraph size="xs" lead="tight" class="text-muted-400">
                Type de contribution
              </BaseParagraph>
            </div>
          </div>
          <div>
            <Icon name="ph:target" class="text-primary-500 mb-2 h-6 w-6" />
            <div>
              <BaseHeading tag="h3" size="sm" weight="medium">
                Education
              </BaseHeading>
              <BaseParagraph size="xs" lead="tight" class="text-muted-400">
                Type de projet
              </BaseParagraph>
            </div>
          </div>
        </div>
        <div>
          <h4
            class="text-muted-400 mb-6 font-sans text-xs font-semibold uppercase"
          >
            Fichiers
          </h4>
          <div class="grid gap-8 pb-6 md:grid-cols-2">
            <div
              v-for="(url, index) in data?.project.files"
              :key="index"
              shape="curved"
            >
              <div class="flex w-full items-center gap-2">
                <img
                  :src="url"
                  alt="image"
                  class="max-w-[200px] rounded-lg md:max-w-[350px]"
                />
              </div>
            </div>
          </div>
        </div>
      </BaseCard>
    </div>
    <div class="ltablet:col-span-4 col-span-12 lg:col-span-4">
      <div class="space-y-6">
        <!-- Customer -->
        <BaseCard class="p-8">
          <h4
            class="text-muted-400 mb-6 font-sans text-xs font-semibold uppercase"
          >
            Info
          </h4>

          <div class="mb-4 flex items-center gap-2">
            <BaseAvatar
              :src="data?.project.image"
              size="md"
              :data-tooltip="data?.project.owner.name"
              class="bg-muted-100 dark:bg-muted-700"
            />
            <div>
              <BaseHeading
                tag="h5"
                size="lg"
                weight="medium"
                lead="none"
                class="line-clamp-1"
              >
                Etat des contributions
              </BaseHeading>
              <BaseParagraph size="sm" class="text-muted-400">
                {{ data?.project.name }}
              </BaseParagraph>
            </div>
          </div>
          <div class="w-full space-y-1">
            <div class="flex items-center justify-between">
              <h4
                class="text-muted-700 dark:text-muted-100 font-sans text-sm font-medium"
              >
                Progress
              </h4>
              <div>
                <span class="text-muted-400 font-sans text-sm">
                  {{ data?.project.completed }}%
                </span>
              </div>
            </div>
            <BaseProgress
              size="xs"
              color="primary"
              :value="data?.project.completed"
            />
            <BaseParagraph size="xs" class="text-muted-400">
              Montant cible: 6 300 000 XAF
            </BaseParagraph>
          </div>
          <div class="flex justify-between py-2">
            <div class="bg-primary rounded px-1 py-2">
              <BaseParagraph size="lg" class="text-muted-400">
                2 000 000 XAF
              </BaseParagraph>
              <BaseParagraph size="xs" class="text-muted-400">
                Montant levé
              </BaseParagraph>
            </div>

            <div class="bg-primary rounded px-1 py-2">
              <BaseParagraph size="lg" class="text-muted-400">
                90
              </BaseParagraph>
              <BaseParagraph size="xs" class="text-muted-400">
                Contributeurs
              </BaseParagraph>
            </div>
          </div>

          <div class="flex items-center gap-2 py-2">
            <BaseButton
              @click="goToContribution()"
              shape="curved"
              class="w-full"
            >
              <Icon name="ph:user-duotone" class="h-4 w-4" />
              <span>Contribuer</span>
            </BaseButton>
            <BaseButton shape="curved" class="">
              <Icon name="ph:heart" class="h-4 w-4" />
              <span></span>
            </BaseButton>
            <BaseButton shape="curved" class="">
              <Icon name="ph:chat-circle-duotone" class="h-4 w-4" />
              <span></span>
            </BaseButton>
            <BaseButton shape="curved" class="">
              <Icon name="ph:share" class="h-4 w-4" />
              <span></span>
            </BaseButton>
          </div>
        </BaseCard>
        <!-- Tools -->
        <BaseCard class="p-8">
          <h4
            class="text-muted-400 mb-6 font-sans text-xs font-semibold uppercase"
          >
            Partager
          </h4>
          <div class="space-y-8">
            <div
              v-for="tool in data?.project.tools"
              :key="tool.name"
              class="flex items-center gap-2"
            >
              <BaseAvatar
                :src="tool.icon"
                size="xs"
                :data-tooltip="tool.name"
                class="bg-muted-100 dark:bg-muted-700"
              />
              <div>
                <BaseHeading
                  tag="h5"
                  size="sm"
                  weight="medium"
                  lead="none"
                  class="line-clamp-1"
                >
                  {{ tool.name }}
                </BaseHeading>
                <BaseParagraph size="xs" class="text-muted-400">
                  {{ tool.description }}
                </BaseParagraph>
              </div>
            </div>
          </div>
        </BaseCard>
        <!-- Stacks -->
      </div>
    </div>
  </div>
</template>

<style scoped>
.gridlines {
  background-image: url(/img/illustrations/gridlines.svg);
}

.dark .gridlines {
  background-image: url(/img/illustrations/gridlines-predark.svg);
}

.shuriken-1 {
  animation: shurikenFirst 0.75s 0s forwards;
}

.shuriken-2 {
  top: 190px;
  transform: translateX(-20px);
  animation: shurikenSecond 0.5s 0s forwards;
}
.shuriken-3 {
  top: 110px;
  transform: translateX(-20px) rotate(20deg);
  animation: shurikenThird 1.75s 0s forwards;
}
@keyframes shurikenFirst {
  0% {
    transform: translateX(0);
    opacity: 0;
  }
  10% {
    opacity: 1;
  }
  100% {
    transform: translateX(600px);
    opacity: 0;
  }
}

@keyframes shurikenSecond {
  0% {
    transform: translateX(0);
    opacity: 0;
  }
  10% {
    opacity: 1;
  }
  100% {
    transform: translateX(500px);
    opacity: 0;
  }
}

@keyframes shurikenThird {
  0% {
    transform: translateX(0);
    opacity: 0;
  }
  10% {
    opacity: 1;
  }
  100% {
    transform: translateX(400px);
    opacity: 0;
  }
}
</style>
