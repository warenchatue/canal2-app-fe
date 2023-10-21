<script setup lang="ts">
import { Calendar } from 'v-calendar'

import 'v-calendar/dist/style.css'
import '~/assets/css/vcalendar.css'

definePageMeta({
  title: 'Dashboard',
  preview: {
    title: 'Main',
    description: 'Rapport general',
    categories: ['dashboards'],
    src: '/img/screens/dashboards-personal-2.png',
    srcDark: '/img/screens/dashboards-personal-2-dark.png',
    order: 1,
  },
})

const route = useRoute()
const router = useRouter()
const page = computed(() => parseInt((route.query.page as string) ?? '1'))

const filter = ref('')
const perPage = ref(10)
const token = useCookie('token')
const success = ref(false)

watch([filter, perPage], () => {
  router.push({
    query: {
      page: undefined,
    },
  })
})

const query = computed(() => {
  return {
    action: 'findAll',
    token: token.value,
    filter: filter.value,
    perPage: perPage.value,
    page: page.value,
  }
})

const { data, pending, error, refresh } = await useFetch('/api/users', {
  query,
})

const auth = useAuthStore()
</script>

<template>
  <div>
    <!-- Grid -->
    <div class="grid grid-cols-12 gap-6">
      <!--Grid column-->
      <div class="col-span-12">
        <!-- Header -->
        <BaseCard class="p-5">
          <div class="flex flex-col items-center md:flex-row">
            <div
              class="ltablet:flex-row ltablet:items-center flex flex-col items-center gap-4 text-center md:items-start md:text-left lg:flex-row lg:items-center"
            >
              <BaseAvatar
                src="/img/avatars/2.svg"
                size="xl"
                badge-src="/img/icons/flags/cmr.svg"
              />
              <div class="text-center md:text-left">
                <BaseHeading
                  as="h2"
                  size="xl"
                  weight="light"
                  lead="tight"
                  class="text-muted-800 dark:text-white"
                >
                  <span
                    >Bon retour,
                    {{
                      auth.user?.firstName?.length > 0
                        ? auth.user?.firstName
                        : auth.user?.lastName
                    }}</span
                  >
                </BaseHeading>
                <BaseParagraph>
                  <span class="text-muted-400"
                    >C'est un plaisir de vous revoir</span
                  >
                </BaseParagraph>
              </div>
            </div>

            <div
              class="ltablet:flex-row ltablet:items-center ms-auto flex flex-col gap-6 text-center md:text-left lg:flex-row lg:items-center"
            >
              <div class="flex-1">
                <BaseHeading
                  as="h3"
                  size="2xl"
                  weight="semibold"
                  lead="tight"
                  class="text-muted-800 dark:text-white"
                >
                  <span>
                    <small class="text-base font-medium">
                      {{ auth.user?.appRole.name }}</small
                    >
                  </span>
                </BaseHeading>
                <BaseParagraph>
                  <span class="text-muted-400 text-sm">
                    {{ auth.user?.appRole.tag }}
                  </span>
                </BaseParagraph>
              </div>
              <BaseCard
                class="from-primary-600 to-primary-700 shadow-primary-500/20 relative flex flex-1 items-center justify-center bg-gradient-to-br p-5 shadow-xl"
              >
                <div class="relative z-20 flex flex-col gap-3">
                  <BaseParagraph size="sm">
                    <span class="text-white/80"> Groupe TV+ </span>
                  </BaseParagraph>
                  <NuxtLink
                    class="font-sans text-sm text-white underline-offset-4 hover:underline"
                    to="#"
                  >
                    En savoir plus
                  </NuxtLink>
                </div>
                <div
                  class="absolute bottom-0 end-2 z-10 flex h-14 w-14 items-center justify-center"
                >
                  <Icon
                    name="ph:crown-duotone"
                    class="text-primary-900/50 h-10 w-10"
                  ></Icon>
                </div>
              </BaseCard>
            </div>
          </div>
        </BaseCard>
      </div>
      <!--Grid column-->
      <div class="ltablet:col-span-8 col-span-12 lg:col-span-8">
        <!-- Inner grid -->
        <div class="flex flex-col gap-6">
          <!-- Project list widget -->
          <BaseCard class="p-6">
            <div class="mb-8 flex items-center justify-between">
              <BaseHeading
                as="h3"
                size="md"
                weight="semibold"
                lead="tight"
                class="text-muted-800 dark:text-white"
              >
                <span>Les Evènements système</span>
              </BaseHeading>
              <NuxtLink
                to="#"
                class="bg-muted-100 hover:bg-muted-200 dark:bg-muted-700 dark:hover:bg-muted-900 text-primary-500 rounded-lg px-4 py-2 font-sans text-sm font-medium underline-offset-4 transition-colors duration-300 hover:underline"
              >
                Tout Consulter
              </NuxtLink>
            </div>
            <DemoProjectListCompact />
          </BaseCard>
          <!-- Chart -->
          <BaseCard class="p-6">
            <div class="mb-6 flex items-center justify-between">
              <BaseHeading
                as="h3"
                size="md"
                weight="semibold"
                lead="tight"
                class="text-muted-800 dark:text-white"
              >
                <span>Mes actions</span>
              </BaseHeading>
              <NuxtLink
                to="#"
                class="bg-muted-100 hover:bg-muted-200 dark:bg-muted-700 dark:hover:bg-muted-900 text-primary-500 rounded-lg px-4 py-2 font-sans text-sm font-medium underline-offset-4 transition-colors duration-300 hover:underline"
              >
                Tous consulter
              </NuxtLink>
            </div>
            <DemoProjectListCompact />
          </BaseCard>
          <!-- Chart -->
        </div>
      </div>
      <!--Grid column-->
      <div class="ltablet:col-span-4 col-span-12 lg:col-span-4">
        <!-- Inner grid -->
        <div class="ptablet:grid-cols-2 grid gap-6 lg:flex lg:flex-col">
          <!-- Widget -->
          <BaseCard class="p-6">
            <!-- Title -->
            <div class="mb-8 flex items-center justify-between">
              <BaseHeading
                as="h3"
                size="md"
                weight="semibold"
                lead="tight"
                class="text-muted-800 dark:text-white"
              >
                <span>Utilisateurs</span>
              </BaseHeading>
              <NuxtLink
                to="#"
                :disabled="true"
                class="bg-muted-100 hover:bg-muted-200 dark:bg-muted-700 dark:hover:bg-muted-900 text-primary-500 rounded-lg px-4 py-2 font-sans text-sm font-medium underline-offset-4 transition-colors duration-300 hover:underline"
              >
                Tout Consulter
              </NuxtLink>
            </div>
            <div class="mb-2 space-y-5">
              <div
                v-for="member in data.data"
                :key="member._id"
                class="flex items-center gap-3"
              >
                <BaseAvatar
                  :src="member.image"
                  :text="member.text"
                  class="bg-primary-100 dark:bg-primary-500/20 text-primary-500 shrink-0"
                />
                <div>
                  <BaseHeading
                    as="h4"
                    size="sm"
                    weight="light"
                    lead="tight"
                    class="text-muted-800 dark:text-white"
                  >
                    <span
                      >{{ member.firstName }}
                      {{ member.lastName.slice(0, 1) }}.</span
                    >
                  </BaseHeading>
                  <BaseParagraph size="xs">
                    <span class="text-muted-400">
                      {{ member.email }}
                    </span>
                  </BaseParagraph>
                </div>
                <div class="ms-auto flex items-center">
                  <BaseButtonIcon shape="curved" muted class="scale-75">
                    <Icon name="lucide:settings" class="h-5 w-5" />
                  </BaseButtonIcon>
                </div>
              </div>
            </div>
          </BaseCard>
          <!-- Widget -->
          <BaseCard shape="curved" class="p-2">
            <Calendar
              :attributes="[
                {
                  key: 'today',
                  dot: true,
                  dates: new Date(),
                },
              ]"
              title-position="left"
              expanded
              borderless
              transparent
              trim-weeks
              class="max-w-full rounded-xl"
            />
          </BaseCard>
        </div>
      </div>
    </div>
  </div>
</template>
