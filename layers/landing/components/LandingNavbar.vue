<script setup lang="ts">
const { x, y } = useWindowScroll()
const isSearchOpen = useState('search-open', () => false)
const isMobileOpen = ref(false)
const auth = useAuthStore()
const metaKey = useMetaKey()
</script>

<template>
  <div
    class="group/nav ltablet:max-w-[1000px] ptablet:max-w-[47rem] fixed inset-x-0 top-0 z-50 mx-auto max-w-[350px] group-[&.scrolled]/landing:mt-2 group-[&:not(.scrolled)]/landing:mt-4 motion-safe:transition-all motion-safe:duration-200 lg:max-w-7xl"
  >
    <div
      class="group-[&.scrolled]/landing:dark:bg-muted-950/95 group-[&.scrolled]/landing:border-muted-200 group-[&.scrolled]/landing:dark:border-muted-700 group-[&.scrolled]/landing:motion-safe:shadow-muted-300/30 group-[&.scrolled]/landing:motion-safe:dark:shadow-muted-800/20 flex items-center justify-between rounded-2xl border p-4 group-[&:not(.scrolled)]/landing:border-transparent group-[&.scrolled]/landing:bg-white/95 motion-safe:transition-all motion-safe:duration-200 group-[&.scrolled]/landing:motion-safe:shadow-xl"
    >
      <div class="flex w-1/5 items-center gap-2">
        <NuxtLink
          to="/"
          class="ms-2 inline-flex"
          aria-label="Go to Tairo homepage"
        >
          <TairoLogoText
            class="text-primary-500 group-[&.scrolled]/landing:h-6 group-[&:not(.scrolled)]/landing:h-7 motion-safe:transition-all motion-safe:duration-200"
          />
        </NuxtLink>
      </div>
      <div
        class="ltablet:static ltablet:w-auto ltablet:flex ltablet:flex-row dark:bg-muted-950 ltablet:!bg-transparent ltablet:mx-0 fixed inset-x-0 top-20 mx-auto w-[calc(100%_-_2rem)] items-center justify-center bg-white lg:static lg:mx-0 lg:flex lg:w-auto lg:flex-row lg:!bg-transparent"
        :class="[
          isMobileOpen
            ? 'shadow-muted-300/30 dark:shadow-muted-900/20 group-[&.scrolled]/landing:ltablet:mt-0 group-[&:not(.scrolled)]/landing:ltablet:mt-0 flex flex-col space-y-4 rounded-xl p-6 shadow-xl group-[&.scrolled]/landing:mt-2 group-[&:not(.scrolled)]/landing:mt-4 motion-safe:transition-all motion-safe:duration-200 group-[&.scrolled]/landing:lg:mt-0 group-[&:not(.scrolled)]/landing:lg:mt-0'
            : 'hidden',
        ]"
      >
        <NuxtLink
          to="/contact"
          class="inline-flex items-center justify-center px-6"
        >
          Contact
        </NuxtLink>

        <NuxtLink
          to="/contact"
          class="inline-flex items-center justify-center px-6"
        >
          A-propos
        </NuxtLink>
      </div>
      <div class="flex w-1/5 items-center justify-end gap-4">
        <BaseThemeToggle aria-label="Toggle darkmode" />
        <BaseButton
          v-if="!auth.authenticated"
          shape="curved"
          color="primary"
          to="/auth/login"
          class="ltablet:!flex !hidden lg:!flex"
        >
          Login
        </BaseButton>

        <DemoToolbarAccountMenu v-else />
        <button
          type="button"
          class="ltablet:hidden flex items-center justify-center lg:hidden"
          @click="isMobileOpen = !isMobileOpen"
          :aria-label="isMobileOpen ? 'Close menu' : 'Open menu'"
        >
          <div class="space-y-1.5">
            <span
              class="bg-primary-600 block h-0.5 motion-safe:transition-all motion-safe:duration-300"
              :class="isMobileOpen ? 'w-2' : 'w-6'"
            ></span>
            <span
              class="bg-primary-600 block h-0.5 motion-safe:transition-all motion-safe:duration-300"
              :class="isMobileOpen ? 'w-6' : 'w-6'"
            ></span>
            <span
              class="bg-primary-600 block h-0.5 motion-safe:transition-all motion-safe:duration-300"
              :class="isMobileOpen ? 'w-4' : 'w-6'"
            ></span>
          </div>
        </button>
      </div>
    </div>
  </div>
</template>
