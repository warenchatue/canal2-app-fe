<script setup lang="ts">
definePageMeta({
  title: 'C2PUB',
  description: 'Système de plannification des spots publicitaires',
  breadcrumb: {
    label: 'C2PUB',
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
