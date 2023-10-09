<script setup lang="ts">
const projects = [
  {
    id: 0,
    name: "Création d'un package",
    image: '/img/icons/logos/flashlite.svg',
    badge: '/img/stacks/pricing/free.svg',
    updated: '30m ago',
    members: [
      {
        tooltip: 'Clarissa Gheller',
        src: '/img/avatars/5.svg',
      },
    ],
  },
  {
    id: 1,
    name: "Creation d'un nouvel annonceur",
    image: '/img/icons/logos/flashlite.svg',
    badge: '/img/stacks/pricing/free.svg',
    updated: '30m ago',
    members: [
      {
        tooltip: 'Maya (You)',
        src: '/img/avatars/2.svg',
      },
      {
        tooltip: 'Maggie Pitts',
        src: '/img/avatars/9.svg',
      },
    ],
  },
  {
    id: 2,
    name: "Validation d'une commande par Alvine",
    image: '/img/icons/logos/flashlite.svg',
    badge: '/img/stacks/pricing/free.svg',
    updated: '30m ago',
    members: [
      {
        tooltip: 'Chris Welling',
        src: '/img/avatars/8.svg',
      },
      {
        tooltip: 'Ruth Raminov',
        src: '/img/avatars/19.svg',
      },
    ],
  },
  {
    id: 3,
    name: 'Génération rapport par Dada',
    image: '/img/icons/logos/flashlite.svg',
    badge: '/img/stacks/pricing/free.svg',
    updated: '30m ago',
    members: [
      {
        tooltip: 'Maya (You)',
        src: '/img/avatars/2.svg',
      },
    ],
  },
]
</script>

<template>
  <div class="space-y-6">
    <!-- Projects -->
    <div
      v-for="project in projects"
      :key="project.id"
      class="flex items-center gap-4"
    >
      <BaseAvatar
        :src="project.image"
        :badge-src="project.badge"
        class="shrink-0"
      />
      <div>
        <BaseHeading
          as="h4"
          size="md"
          weight="light"
          lead="tight"
          class="text-muted-800 dark:text-white"
        >
          <span>{{ project.name }}</span>
        </BaseHeading>
        <BaseParagraph size="xs">
          <span class="text-muted-400">Last updated {{ project.updated }}</span>
        </BaseParagraph>
      </div>
      <div class="ms-auto hidden md:block">
        <BaseAvatarGroup :avatars="project.members" size="sm" :limit="3" />
      </div>
    </div>
  </div>
</template>
