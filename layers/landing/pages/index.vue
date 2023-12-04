<script setup lang="ts">
definePageMeta({
  title: 'DInoES',
  description: 'Système de plannification des spots publicitaires',
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
