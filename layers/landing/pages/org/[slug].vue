<script setup lang="ts">
import projects from './FOProjects'
import features from './FOFeatures'
import benefits from './FOBenefits'
definePageMeta({
  title: 'The Digital Innova Funding platform',
  description: 'The Digital Innova Funding platform',
  breadcrumb: {
    label: 'Dinno-Fund',
  },
  layout: 'empty',
})
const { y } = useNinjaWindowScroll()

const route = useRoute()
const slug = computed(() => route.params.slug)
const query = computed(() => {
  return {
    slug: slug.value,
    action: 'get',
  }
})

const { data, pending, error, refresh } = await useFetch('/api/orgs', {
  method: 'get',
  headers: { 'Content-Type': 'application/json' },
  query: query,
})

console.log(data)
if (!data.value?.org) {
  await navigateTo('/')
}
</script>

<template>
  <div
    v-if="!pending && data.org"
    class="group/landing overflow-hidden"
    :class="y > 60 ? 'scrolled' : ''"
  >
    <LandingOrgNavbar :org-slug="data.org.slug" />
    <LandingOrgHero
      :org-name="data.org.name"
      :org-slug="data.org.slug"
      :org-description="data.org.description"
    />
    <projects />
    <features />
    <benefits />
    <LandingFooter />
  </div>
</template>
