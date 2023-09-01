<script setup lang="ts">
definePageMeta({
  title: 'ERP SOFOMEUTEX',
  description: 'Système de gestion des processus interne de SOFOMEUTEX',
  breadcrumb: {
    label: 'ERP SOFO',
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
