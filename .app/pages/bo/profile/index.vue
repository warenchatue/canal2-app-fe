<script setup lang="ts">
definePageMeta({
  title: 'Profile',
  preview: {
    title: 'Profile',
    description: 'For displaying a user profile',
    categories: ['bo', 'profile'],
    src: '/img/screens/layouts-subpages-profile.png',
    srcDark: '/img/screens/layouts-subpages-profile-dark.png',
    order: 75,
  },
})
const authStore = useAuthStore()
const { data, pending, error, refresh } = await useFetch('/api/profile')
</script>

<template>
  <div class="mx-auto w-full max-w-5xl">
    <div v-if="!data"></div>
    <div v-else class="relative w-full">
      <div class="absolute end-0 top-2 z-20">
        <BaseDropdown
          flavor="context"
          label="Dropdown"
          orientation="end"
          condensed
          class="z-20"
          shape="curved"
        >
          <BaseDropdownDivide />
          <BaseDropdownItem
            to="/bo/profile/profile-edit"
            title="Edit"
            text="Edit profile"
          >
            <template #start>
              <Icon name="ph:pencil-duotone" class="me-2 block h-5 w-5" />
            </template>
          </BaseDropdownItem>
          <BaseDropdownDivide />
          <BaseDropdownItem to="#" title="Security" text="Security settings">
            <template #start>
              <Icon name="ph:lock-duotone" class="me-2 block h-5 w-5" />
            </template>
          </BaseDropdownItem>
          <BaseDropdownDivide />
          <BaseDropdownItem to="#" title="Share" text="Share profile">
            <template #start>
              <Icon name="ph:link-duotone" class="me-2 block h-5 w-5" />
            </template>
          </BaseDropdownItem>
        </BaseDropdown>
      </div>
      <div class="flex w-full flex-col">
        <BaseAvatar
          :src="data?.personalInfo.picture"
          :badge-src="'/img/icons/flags/cmr.svg'"
          size="2xl"
          class="mx-auto"
        />
        <div class="mx-auto w-full max-w-md text-center">
          <BaseHeading tag="h2" size="xl" weight="medium" class="mt-4">
            {{ authStore.user.firstName }} {{ authStore.user.lastName }}
          </BaseHeading>
          <BaseParagraph size="sm" class="text-muted-400 mb-3 mt-1">
            {{ authStore.user.shortBio }}
          </BaseParagraph>
          <div
            class="divide-muted-200 dark:divide-muted-800 flex items-center justify-center divide-x"
          >
            <div class="text-muted-400 flex h-8 items-center gap-1 px-4">
              <Icon name="ph:user-duotone" class="h-5 w-5" />
              <BaseText size="sm">{{ authStore.user.email }}</BaseText>
            </div>
            <div
              class="text-muted-400 hidden h-8 items-center gap-1 px-4 sm:flex"
            >
              <Icon name="ph:phone-duotone" class="h-5 w-5" />
              <BaseText size="sm">{{ authStore.user.phone }}</BaseText>
            </div>
            <div
              class="text-muted-400 hidden h-8 items-center gap-1 px-4 sm:flex"
            >
              <Icon name="ph:user-duotone" class="h-5 w-5" />
              <BaseText size="sm">{{ authStore.user.appRole.tag }}</BaseText>
            </div>
          </div>
        </div>
      </div>

      <div class="mt-6 grid grid-cols-12 gap-6">
        <div class="col-span-12 sm:col-span-8">
          <div class="flex flex-col gap-6">
            <BaseCard class="p-8">
              <!-- Bio -->
              <div class="border-muted-200 dark:border-muted-700 border-b pb-8">
                <div class="mb-4 flex items-center gap-2">
                  <h4
                    class="text-muted-400 font-sans text-xs font-semibold uppercase"
                  >
                    About me
                  </h4>
                </div>
                <div class="relative">
                  <BaseParagraph
                    size="sm"
                    class="text-muted-500 dark:text-muted-400"
                  >
                    {{ authStore.user.longBio }}
                  </BaseParagraph>
                </div>
              </div>
            </BaseCard>
          </div>
        </div>
        <div class="col-span-12 sm:col-span-4">
          <div class="flex flex-col gap-6">
            <!-- Notifications -->
            <BaseCard class="p-8">
              <div class="mb-8 flex items-center gap-2">
                <h4
                  class="text-muted-400 font-sans text-xs font-semibold uppercase"
                >
                  Notifications
                </h4>
                <div class="ms-auto">
                  <BaseSwitchBall v-model="data.notifications" />
                </div>
              </div>
              <div>
                <BaseParagraph size="xs" class="text-muted-400">
                  Enable or disable this setting to manage if your network
                  should be notified when you make changes to your profile.
                </BaseParagraph>
              </div>
            </BaseCard>
            <!-- Tools -->
            <!-- <BaseCard class="p-8">
              <div class="mb-8 flex items-center gap-2">
                <h4
                  class="text-muted-400 font-sans text-xs font-semibold uppercase"
                >
                  Tools
                </h4>
              </div>
              <div class="space-y-6">
                <div
                  v-for="item in data.personalInfo.tools"
                  :key="item.name"
                  class="flex w-full items-center gap-2"
                >
                  <div
                    class="border-muted-200 dark:border-muted-600 dark:bg-muted-700 relative flex h-[50px] w-[50px] shrink-0 items-center justify-center rounded-full border bg-white"
                  >
                    <img
                      :src="item.logo"
                      :alt="item.name"
                      class="h-8 w-8 rounded-full"
                    />
                    <BaseProgressCircle
                      :size="68"
                      :thickness="1.5"
                      :value="item.level"
                      class="text-primary-500 absolute -start-2.5 -top-2.5"
                    />
                  </div>
                  <div>
                    <BaseHeading tag="h3" size="sm" weight="medium">
                      {{ item.name }}
                    </BaseHeading>
                    <BaseParagraph size="xs" class="text-muted-400">
                      <span>{{ item.mastery }}</span>
                    </BaseParagraph>
                  </div>
                </div>
              </div>
            </BaseCard> -->
            <!-- Recent Views -->
            <!-- <BaseCard class="p-8">
              <div class="mb-8 flex items-center gap-2">
                <h4
                  class="text-muted-400 font-sans text-xs font-semibold uppercase"
                >
                  Recent Views
                </h4>
              </div>
              <div class="space-y-6">
                <div
                  v-for="item in data.personalInfo.viewed"
                  :key="item.name"
                  class="flex w-full items-center gap-2"
                >
                  <BaseAvatar
                    :src="item.src"
                    :text="item.text"
                    size="xs"
                    :badge-src="item.badge"
                    :class="getRandomColor()"
                  />
                  <div>
                    <BaseHeading tag="h3" size="sm" weight="medium">
                      {{ item.name }}
                    </BaseHeading>
                    <BaseParagraph size="xs" class="text-muted-400">
                      <span>{{ item.role }}</span>
                    </BaseParagraph>
                  </div>
                  <div class="ms-auto">
                    <BaseButtonIcon
                      to="#"
                      condensed
                      shape="full"
                      data-tooltip="View Profile"
                    >
                      <Icon name="lucide:arrow-right" class="h-4 w-4" />
                    </BaseButtonIcon>
                  </div>
                </div>
              </div>
            </BaseCard> -->
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
