<script setup lang="ts">
definePageMeta({
  title: 'Prebuilt dashboards pages',
  description:
    'Explore 100+ prebuilt pages, including dashboards and app examples. Kickstart your project with Nuxt and Tailwind CSS.',
  layout: 'empty',
})

const { y } = useNinjaWindowScroll()
</script>

<template>
  <div class="group/landing overflow-hidden" :class="y > 60 ? 'scrolled' : ''">
    <InnerPageHero
      class="inset-0"
      :title="'Contact'"
      :image-url="'https://img.freepik.com/premium-photo/office-blue-desk-equipment-working-top-view-flat-lay-blue-background_38937-393.jpg'"
    />
    <div class="dark:bg-muted-900 bg-white pt-16">
      <LandingNavbar />
      <!-- <LandingDemos :cta="true" />
      <LandingCta /> -->
      <LandingFooter />
    </div>
  </div>
</template>
