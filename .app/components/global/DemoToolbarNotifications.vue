<script setup lang="ts">
import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/vue'

const route = useRoute()
const router = useRouter()
const page = computed(() => parseInt((route.query.page as string) ?? '1'))
const filter = ref('')
const perPage = ref(10)
const token = useCookie('token')
const isEdit = ref(false)
const currentRole = ref({})
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
  <div class="group inline-flex items-center justify-center text-right">
    <Menu as="div" class="relative h-9 w-9 text-left" v-slot="{ close }">
      <MenuButton as="div">
        <button
          type="button"
          class="group-hover:ring-muted-200 dark:group-hover:ring-muted-700 dark:ring-offset-muted-900 inline-flex h-9 w-9 items-center justify-center rounded-full ring-1 ring-transparent transition-all duration-300 group-hover:ring-offset-4"
        >
          <span
            class="border-muted-200 dark:border-muted-700 dark:bg-muted-800 flex h-9 w-9 items-center justify-center rounded-full border bg-white"
          >
            <!-- <BaseAvatar :src="''" :badge-src="''" size="2xl" class="mx-auto" /> -->
            <Icon
              name="ph:bell-duotone"
              class="text-muted-400 animate-pulse h-5 w-5"
            />
          </span>
        </button>
      </MenuButton>

      <Transition
        enter-active-class="transition duration-100 ease-out"
        enter-from-class="transform scale-95 opacity-0"
        enter-to-class="transform scale-100 opacity-100"
        leave-active-class="transition duration-75 ease-in"
        leave-from-class="transform scale-100 opacity-100"
        leave-to-class="transform scale-95 opacity-0"
      >
        <MenuItems
          class="divide-muted-100 border-muted-200 dark:divide-muted-700 dark:border-muted-700 dark:bg-muted-800 absolute end-0 mt-2 w-72 origin-top-right divide-y rounded-md border bg-white shadow-lg focus:outline-none"
        >
          <div class="p-4">
            <div class="relative flex items-center justify-between">
              <h4
                class="font-heading text-muted-500 dark:text-muted-200 text-xs uppercase"
              >
                Notifications
              </h4>
              <NuxtLink
                to="/bo/profile/profile-notifications"
                class="font-alt text-primary-500 text-sm font-semibold"
                @click.passive="close"
              >
                View All
              </NuxtLink>
            </div>
          </div>
          <div class="p-4">
            <MenuItem
              v-for="item in data.data"
              :key="item._id"
              as="div"
              v-slot="{ active }"
            >
              <NuxtLink
                to="#"
                class="group flex w-full items-center rounded-md p-2 text-sm transition-colors duration-300"
                :class="[
                  active
                    ? 'bg-muted-100 dark:bg-muted-700 text-primary-500'
                    : 'text-muted-500',
                ]"
                @click.passive="close"
              >
                <div
                  class="relative inline-flex h-9 w-9 items-center justify-center rounded-full"
                >
                  <img
                    src="/img/avatars/8.svg"
                    class="max-w-full rounded-full object-cover shadow-sm dark:border-transparent"
                    alt=""
                  />
                </div>
                <div class="ms-2">
                  <h6
                    class="font-heading text-muted-800 text-xs font-semibold leading-tight dark:text-white"
                  >
                    {{ item.data?.memberName }}
                    <span
                      v-if="item.type == 'newOrder'"
                      class="text-muted-500 dark:text-muted-400 font-normal"
                    >
                      a créer une commande
                    </span>
                  </h6>
                  <p class="text-muted-400 font-sans text-xs">
                    {{ new Date(item.createdAt).toLocaleDateString('fr-FR') }}
                    {{ new Date(item.createdAt).toLocaleTimeString('fr-FR') }}
                  </p>
                </div>
              </NuxtLink>
            </MenuItem>
          </div>
        </MenuItems>
      </Transition>
    </Menu>
  </div>
</template>
