<script setup lang="ts">
definePageMeta({
  title: 'Project List',
  description: 'The Digital Innova Funding platform',
  breadcrumb: {
    label: 'Dinno-Fund',
  },
  layout: 'empty',
})

const route = useRoute()
const router = useRouter()
const page = computed(() => parseInt((route.query.page as string) ?? '1'))
const slug = computed(() => route.params.org)
const filter = ref('')
const perPage = ref(25)
const { y } = useNinjaWindowScroll()
const progress = ref(25)

watch([filter, perPage], () => {
  router.push({
    query: {
      page: undefined,
    },
  })
})

const query = computed(() => {
  return {
    filter: filter.value,
    perPage: perPage.value,
    page: page.value,
    slug: slug.value,
    action: 'getForOrg',
  }
})

const { data, pending, error, refresh } = await useFetch('/api/funds-raising', {
  query,
})
</script>

<template>
  <div class="group/landing overflow-hidden" :class="y > 60 ? 'scrolled' : ''">
    <InnerPageHero
      class="inset-0"
      :title="'Nos Projets'"
      :image-url="'https://img.freepik.com/premium-photo/office-blue-desk-equipment-working-top-view-flat-lay-blue-background_38937-393.jpg'"
    />
    <LandingOrgNavbar :org-slug="slug" />
    <div class="p-6">
      <TairoContentWrapper>
        <template #left>
          <BaseInput
            v-model="filter"
            icon="lucide:search"
            shape="curved"
            placeholder="Filter projects..."
            :classes="{
              wrapper: 'w-full sm:w-auto',
            }"
          />
        </template>
        <template #right>
          <BaseCard shape="curved" class="min-w-[340px]">
            <div class="grid grid-cols-4 p-4">
              <div class="relative flex flex-col text-center">
                <span
                  class="text-muted-800 dark:text-muted-100 font-sans text-2xl font-bold"
                >
                  12
                </span>
                <p class="text-muted-400 font-sans text-xs">On Track</p>
                <span
                  class="bg-primary-500 absolute end-0 top-0 h-2 w-2 rounded-full"
                ></span>
              </div>
              <div class="relative flex flex-col text-center">
                <span
                  class="text-muted-800 dark:text-muted-100 font-sans text-2xl font-bold"
                >
                  4
                </span>
                <p class="text-muted-400 font-sans text-xs">Overdue</p>
                <span
                  class="absolute end-0 top-0 h-2 w-2 rounded-full bg-amber-500"
                ></span>
              </div>
              <div class="relative flex flex-col text-center">
                <span
                  class="text-muted-800 dark:text-muted-100 font-sans text-2xl font-bold"
                >
                  {{ data?.data.length || '0' }}
                </span>
                <p class="text-muted-400 font-sans text-xs">Total</p>
                <span
                  class="bg-success-500 absolute end-0 top-0 h-2 w-2 rounded-full"
                ></span>
              </div>
              <div class="flex items-center justify-center">
                <BaseButtonIcon muted>
                  <Icon name="lucide:plus" />
                </BaseButtonIcon>
              </div>
            </div>
          </BaseCard>
        </template>
        <div class="space-y-10">
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
            <div v-else>
              <div>
                <h4
                  class="text-muted-400 mb-4 font-sans text-xs font-semibold uppercase"
                >
                  All Projects
                </h4>
              </div>
              <div
                class="ltablet:grid-cols-3 grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
              >
                <TransitionGroup
                  enter-active-class="transform-gpu"
                  enter-from-class="opacity-0 -translate-x-full"
                  enter-to-class="opacity-100 translate-x-0"
                  leave-active-class="absolute transform-gpu"
                  leave-from-class="opacity-100 translate-x-0"
                  leave-to-class="opacity-0 -translate-x-full"
                >
                  <BaseCard
                    v-for="(item, index) in data?.data"
                    :key="index"
                    shape="curved"
                    elevated-hover
                    class="hover:!border-primary-500"
                  >
                    <NuxtLink
                      class="group"
                      :to="`/org/projects/details/${item.slug}`"
                    >
                      <div class="p-5">
                        <div class="relative mb-4">
                          <img
                            :src="item.image"
                            :alt="item.name"
                            class="w-full rounded-lg"
                          />
                        </div>
                        <div class="mb-6 flex gap-2">
                          <BaseAvatar
                            :src="item.owner.medias.logo"
                            size="sm"
                            :data-tooltip="item.name"
                            class="bg-muted-100 dark:bg-muted-700"
                          />
                          <div>
                            <BaseHeading
                              tag="h5"
                              size="sm"
                              weight="medium"
                              class="line-clamp-1"
                            >
                              {{ item.name }}
                            </BaseHeading>
                            <BaseParagraph size="xs" class="text-muted-400">
                              {{ item.owner.name }}</BaseParagraph
                            >
                          </div>
                        </div>
                        <div class="flex items-center justify-between">
                          <div class="flex items-center gap-2">
                            <div class="max-w-xs space-y-4">
                              <BaseProgress
                                title="Default progress bar"
                                size="xs"
                                :value="progress"
                                color="primary"
                              />

                              <div class="flex justify-between gap-2">
                                <BaseButtonAction
                                  :class="
                                    progress === 25 &&
                                    '!border-primary-500 !text-primary-500'
                                  "
                                  @click="progress = 25"
                                >
                                  25%
                                </BaseButtonAction>

                                <BaseButtonAction
                                  :class="
                                    progress === 50 &&
                                    '!border-primary-500 !text-primary-500'
                                  "
                                  @click="progress = 50"
                                >
                                  50%
                                </BaseButtonAction>

                                <BaseButtonAction
                                  :class="
                                    progress === 75 &&
                                    '!border-primary-500 !text-primary-500'
                                  "
                                  @click="progress = 75"
                                >
                                  75%
                                </BaseButtonAction>

                                <BaseButtonAction
                                  :class="
                                    progress === 100 &&
                                    '!border-primary-500 !text-primary-500'
                                  "
                                  @click="progress = 100"
                                >
                                  100%
                                </BaseButtonAction>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div class="flex items-center justify-between px-5 pb-4">
                        <p class="text-muted-400 font-sans text-xs">
                          500 000 XAF sur 630 000 XAF
                        </p>
                      </div>
                      <div
                        class="border-muted-200 dark:border-muted-700 bg-muted-50 dark:bg-muted-700/50 flex items-center justify-between rounded-b-xl border-t px-5 py-3"
                      >
                        <div>
                          <p class="text-muted-400 font-sans text-sm">
                            {{ item.contributors.length }} contributor(s)
                          </p>
                        </div>
                        <div>
                          <BaseAvatarGroup
                            :avatars="item.contributors"
                            size="xs"
                            :limit="3"
                          />
                        </div>
                      </div>
                    </NuxtLink>
                  </BaseCard>
                </TransitionGroup>
              </div>
            </div>
          </div>
        </div>
      </TairoContentWrapper>
    </div>
    <LandingFooter />
  </div>
</template>
