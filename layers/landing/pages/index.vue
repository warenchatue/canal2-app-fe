<script setup lang="ts">
definePageMeta({
  title: 'DInoES',
  description: 'Plateforme Digitale du Groupe CHATUE',
  breadcrumb: {
    label: 'DInoES',
  },
  layout: 'empty',
})
const { y } = useNinjaWindowScroll()
</script>

<template>
  <div class="group/landing overflow-hidden" :class="y > 60 ? 'scrolled' : ''">
    <LandingNavbar />
    <LandingHero />
    <LandingFooter />
  </div>
</template>
