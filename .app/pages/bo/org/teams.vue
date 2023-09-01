<script setup lang="ts">
definePageMeta({
  title: 'Membres',
  preview: {
    title: 'Membres',
    description: 'For item grids and collections',
    categories: ['bo', 'teams'],
    src: '/img/screens/layouts-user-grid-4.png',
    srcDark: '/img/screens/layouts-user-grid-4-dark.png',
    order: 67,
  },
})

const route = useRoute()
const router = useRouter()
const page = computed(() => parseInt((route.query.page as string) ?? '1'))

const filter = ref('')
const perPage = ref(18)

watch([filter, perPage], () => {
  router.push({
    query: {
      page: undefined,
    },
  })
})

const app = useAppStore()
const query = computed(() => {
  return {
    filter: filter.value,
    perPage: perPage.value,
    page: page.value,
    slug: app.activeOrg.slug,
  }
})

const { data, pending, error, refresh } = await useFetch('/api/orgs', {
  query,
})

const members = ref()

if (data.value) {
  members.value = data.value.org.members
}

</script>

<template>
  <div>
    <TairoContentWrapper>
      <template #left>
        <BaseInput
          v-model="filter"
          icon="lucide:search"
          shape="curved"
          placeholder="Filter users..."
          :classes="{
            wrapper: 'w-full sm:w-auto',
          }"
        />
      </template>
      <template #right>
        <BaseButton class="w-full sm:w-32" shape="curved">Manage</BaseButton>
        <BaseButton color="primary" class="w-full sm:w-38" shape="curved">
          <Icon name="lucide:plus" class="h-4 w-4" />
          <span>Add Member</span>
        </BaseButton>
      </template>
      <div>
        <div v-if="!pending && members.length == 0">
          <BasePlaceholderPage
            title="No matching results"
            subtitle="Looks like we couldn't find any matching results for your search terms. Try other search terms."
          >
            <template #image>
              <img
                class="block dark:hidden"
                src="/img/illustrations/placeholders/flat/placeholder-search-2.svg"
                alt="Placeholder image"
              />
              <img
                class="hidden dark:block"
                src="/img/illustrations/placeholders/flat/placeholder-search-2-dark.svg"
                alt="Placeholder image"
              />
            </template>
          </BasePlaceholderPage>
        </div>
        <div
          v-else
          class="ltablet:grid-cols-3 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
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
              v-for="(item, index) in members"
              :key="index"
              shape="curved"
              elevated-hover
              class="overflow-hidden"
            >
              <div class="nui-bg-50 p-6">
                <div class="flex items-center justify-between">
                  <div>
                    <BaseHeading
                      v-if="item.status == 'active'"
                      tag="h3"
                      size="md"
                      weight="medium"
                      lead="none"
                    >
                      Actif
                    </BaseHeading>
                    <BaseHeading
                      v-else
                      tag="h3"
                      size="md"
                      weight="medium"
                      lead="none"
                    >
                      {{ item.status === 1 ? 'Overdue' : 'Blocked' }}
                    </BaseHeading>
                    <BaseParagraph size="xs" class="text-muted-400">
                      {{ item.pending }} tasks remaining
                    </BaseParagraph>
                  </div>
                  <div>
                    <Icon
                      v-if="item.status == 'active'"
                      name="ph:check-circle-duotone"
                      class="text-success-500 h-7 w-7"
                    />
                    <Icon
                      v-else-if="item.status === 1"
                      name="ph:warning-circle-duotone"
                      class="text-warning-500 h-7 w-7"
                    />
                    <Icon
                      v-else-if="item.status === 2"
                      name="ph:x-circle-duotone"
                      class="text-danger-500 h-7 w-7"
                    />
                  </div>
                </div>
                <div>
                  <NuxtLink
                    to="#"
                    class="text-primary-500 font-sans text-xs underline-offset-4 hover:underline"
                  >
                    View {{ item.firstName }}'s info
                  </NuxtLink>
                </div>
              </div>
              <div class="p-6">
                <div class="mb-3 flex w-full items-center justify-center">
                  <BaseAvatar
                    size="xl"
                    shape="curved"
                    :src="item.medias.avatar"
                    :badge-src="item.medias.flag"
                    :text="item.initials"
                    :class="getRandomColor()"
                  />
                </div>
                <div class="text-center">
                  <BaseHeading tag="h3" size="md" weight="medium" lead="none">
                    {{ item.username }}
                  </BaseHeading>
                  <BaseParagraph size="xs" class="text-muted-400">
                    {{ item.position }}
                  </BaseParagraph>
                </div>
                <div class="mb-6 mt-4 flex items-center justify-center gap-3">
                  <!-- <BaseAvatar
                    v-for="relation in item.relations.slice(0, 3)"
                    :key="relation"
                    size="xs"
                    shape="curved"
                    :src="relation.src"
                    :text="relation.text"
                    :class="getRandomColor()"
                  /> -->
                </div>
                <div class="flex items-center gap-2">
                  <BaseButton shape="curved" class="w-full">
                    <Icon name="ph:user-duotone" class="h-4 w-4" />
                    <span>Profile</span>
                  </BaseButton>
                  <BaseButton shape="curved" class="w-full">
                    <Icon name="ph:chat-circle-duotone" class="h-4 w-4" />
                    <span>Talk</span>
                  </BaseButton>
                </div>
              </div>
            </BaseCard>
          </TransitionGroup>
        </div>
        <div v-if="!pending && members.length !== 0" class="mt-4">
          <BasePagination
            :total-items="data?.total ?? 0"
            :item-per-page="perPage"
            :current-page="page"
            shape="curved"
          />
        </div>
      </div>
    </TairoContentWrapper>
  </div>
</template>
