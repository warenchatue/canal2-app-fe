<script setup lang="ts">
const route = useRoute()
const router = useRouter()
const page = computed(() => parseInt((route.query.page as string) ?? '1'))
const filter = ref('')
const perPage = ref(10)
const token = useCookie('token')
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

const { data, pending, error, refresh } = await useFetch(
  '/api/profile/notifications',
  {
    query,
  },
)
</script>

<template>
  <div class="space-y-6">
    <!-- -->
    <div
      v-for="notification in data.data"
      :key="notification._id"
      class="flex items-center gap-4"
    >
      <BaseAvatar
        :src="notification.image"
        :initials="notification.data.memberName"
        :badge-src="notification.badge"
        class="bg-primary-100 dark:bg-primary-500/20 text-primary-500 shrink-0"
      />
      <div>
        <BaseHeading
          as="h4"
          size="md"
          weight="light"
          lead="tight"
          class="text-muted-800 dark:text-white"
        >
          <BaseText
            v-if="notification.type == 'newOrder'"
            size="sm"
            lead="tight"
          >
            <span class="text-muted-800 dark:text-muted-100"
              >{{ notification.data.memberName }}&nbsp;</span
            >
            <span class="text-muted-500 dark:text-muted-400"
              >a créer une nouvelle commande, code&nbsp;
            </span>

            <NuxtLink
              :to="notification.link"
              class="text-primary-500 underline-offset-4 hover:underline"
            >
              {{ notification.data?.code }}</NuxtLink
            >
            <span class="text-muted-500 dark:text-muted-400"
              >&nbsp;{{ notification.target?.type }}</span
            >
          </BaseText>
        </BaseHeading>
        <BaseParagraph size="xs">
          <span class="text-muted-400"
            >Le
            {{ new Date(notification.createdAt).toLocaleDateString('fr-FR') }} à
            {{ new Date(notification.createdAt).toLocaleTimeString('fr-FR') }}
          </span>
        </BaseParagraph>
      </div>
      <div class="ms-auto hidden md:block">
        <!-- <BaseAvatarGroup :avatars="notification.members" size="sm" :limit="3" /> -->
      </div>
    </div>
  </div>
</template>
