<script setup lang="ts">
definePageMeta({
  title: '2SPOT',
  description: 'Système de plannification des spots publicitaires',
  breadcrumb: {
    label: '2SPOT',
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
