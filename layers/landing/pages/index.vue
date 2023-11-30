<script setup lang="ts">
definePageMeta({
  title: 'TV+ES',
  description: 'Système de plannification des spots publicitaires',
  breadcrumb: {
    label: 'TV+ES',
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
