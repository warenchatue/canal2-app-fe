<script setup lang="ts">
definePageMeta({
  title: 'Project Details',
  preview: {
    title: 'Project details',
    description: 'For displaying project details',
    categories: ['orgs', 'projects'],
    src: '/img/screens/layouts-projects-details.png',
    srcDark: '/img/screens/layouts-projects-details-dark.png',
  },
  layout: 'empty',
})

import TabOverview from './TabOverview'

const { open } = usePanels()

const route = useRoute()
const slug = computed(() => route.params.pslug)
const query = computed(() => {
  return {
    slug: slug.value,
  }
})

const { data, pending, error, refresh } = await useFetch('/api/funds-raising', {
  query,
})

const contributors = ref()

if (data?.value) {
  contributors.value = data.value.project.contributors
}

// if (!data.value?.project) {
//   await navigateTo('/orgs/projects')
// }

const currentTask = ref()
const { y } = useNinjaWindowScroll()

function openTaskPanel(id: number, tasks: any) {
  currentTask.value = tasks.find((task: any) => task.id === id)
  open('task', { task: currentTask })
}
</script>

<template>
  <div
    class="group/landing relative overflow-hidden"
    :class="y > 60 ? 'scrolled' : ''"
  >
    <InnerPageHero
      class="inset-0"
      :title="'Nos Projets - ' + slug"
      :image-url="'https://img.freepik.com/premium-photo/office-blue-desk-equipment-working-top-view-flat-lay-blue-background_38937-393.jpg'"
    />
    <LandingOrgNavbar :org-slug="data?.project.owner.slug" />
    <div class="p-6">
      <div v-if="data?.project === undefined">
        <BasePlaceholderPage
          title="Project not found"
          subtitle="We couldn't find a project matching this namespace."
        >
          <template #image>
            <img
              class="block dark:hidden"
              src="/img/illustrations/placeholders/flat/placeholder-projects.svg"
              alt="Placeholder image"
            />
            <img
              class="hidden dark:block"
              src="/img/illustrations/placeholders/flat/placeholder-projects-dark.svg"
              alt="Placeholder image"
            />
          </template>
        </BasePlaceholderPage>
      </div>
      <div v-else class="h-full text-lg">
        <BaseTabs
          selected="overview"
          :tabs="[
            {
              label: 'Details',
              value: 'overview',
            },
            {
              label: 'Contributeurs',
              value: 'contributors',
            },
            {
              label: 'Resultats',
              value: 'tasks',
            },
          ]"
        >
          <template #tab="{ activeValue }">
            <!-- Overview -->
            <div v-if="activeValue === 'overview'">
              <TabOverview :data="data" />
            </div>
            <!-- contributors -->
            <div v-else-if="activeValue === 'contributors'">
              <div class="mx-auto w-full max-w-4xl pt-12">
                <div v-if="contributors.length === 0"></div>
                <div v-else class="">
                  <div
                    v-for="item in contributors"
                    :key="item.id"
                    class="ltablet:after:start-[104px] after:border-muted-300 dark:after:border-muted-800 relative flex items-center gap-4 after:absolute after:start-[8px] after:top-3 after:h-full after:w-px after:border-e-2 after:content-[''] lg:after:start-[104px] [&:not(:first-child)]:pt-3"
                  >
                    <div class="ltablet:block hidden w-24 text-right lg:block">
                      <BaseText size="xs" class="text-muted-400">
                        {{ item.date }}
                      </BaseText>
                    </div>
                    <div
                      class="dark:bg-muted-800 relative z-10 h-4 w-4 shrink-0 rounded-full bg-white"
                    >
                      <div
                        class="h-4 w-4 rounded-full border-2 border-current"
                        :class="getRandomColor()"
                      ></div>
                    </div>

                    <BaseCard class="p-4">
                      <div class="flex w-full items-center gap-4">
                        <div
                          class="h-2 w-2 shrink-0 rounded-full"
                          :class="
                            item.status === 0
                              ? 'bg-primary-500'
                              : 'bg-muted-300 dark:bg-muted-700/50'
                          "
                        ></div>
                        <BaseAvatar :src="item.src" size="sm" />
                        <div>
                          <BaseText size="sm" lead="tight">
                            <span class="text-primary-800 dark:text-primary-500"
                              >{{ item.amount }}&nbsp;</span
                            >
                          </BaseText>
                          <BaseText size="xs" class="text-muted-400">
                            <span class="ltablet:hidden lg:hidden">{{
                              item.date
                            }}</span>
                            <span class="ltablet:hidden px-2 lg:hidden"
                              >&middot;</span
                            >
                            <span>{{ item.name }}</span>
                          </BaseText>
                        </div>
                        <div class="ms-auto hidden items-center gap-3 sm:flex">
                          <!-- <BaseAvatar
                            v-for="user in item.people"
                            :key="user.name"
                            :src="user.src"
                            size="xxs"
                          /> -->
                        </div>
                      </div>
                    </BaseCard>
                  </div>
                </div>
              </div>
            </div>
            <!-- Tasks -->
            <div v-else-if="activeValue === 'tasks'"></div>
          </template>
        </BaseTabs>
      </div>
    </div>
    <LandingFooter />
  </div>
</template>
