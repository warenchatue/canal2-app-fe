<script setup lang="ts">
const year = new Date().getFullYear()
</script>

<template>
  <footer
    class="dark:bg-muted-900 border-muted-200 dark:border-muted-700 relative border-t bg-white"
  >
    <NuxtLink
      to="https://cssninja.io"
      class="dark:bg-muted-900 absolute inset-x-0 -top-4 mx-auto flex h-9 w-14 items-center justify-center bg-white"
    >
      <img
        class="h-7 w-7"
        src="/img/logos/cssninja-logo-icon.svg"
        alt="Css Ninja logo"
        height="28"
        width="28"
        loading="lazy"
        decoding="async"
      />
    </NuxtLink>
    <div
      class="ltablet:flex-row mx-auto flex max-w-7xl flex-col items-center justify-between px-6 py-8 lg:flex-row"
    >
      <NuxtLink
        to="/"
        aria-label="Go to Tairo homepage"
        class="ltablet:w-1/5 block w-full lg:w-1/5"
      >
        <TairoLogoText
          class="text-muted-300 ltablet:mx-0 mx-auto h-6 transition-all duration-200 lg:mx-0"
        />
      </NuxtLink>
      <div
        class="ltablet:mt-0 ltablet:gap-6 mt-6 flex flex-wrap items-center justify-center gap-4 lg:mt-0 lg:gap-6"
      >
        <NuxtLink
          to="/contact"
          class="text-muted-600 hover:text-primary-500 dark:text-muted-200 dark:hover:text-primary-400 text-sm transition-colors duration-300"
        >
          Politique de confidentialité
        </NuxtLink>

        <NuxtLink
          to="/contact"
          class="text-muted-600 hover:text-primary-500 dark:text-muted-200 dark:hover:text-primary-400 text-sm transition-colors duration-300"
        >
          Contact
        </NuxtLink>
        <NuxtLink
          to="/contact"
          target="_blank"
          rel="noopener"
          class="text-muted-600 hover:text-primary-500 dark:text-muted-200 dark:hover:text-primary-400 text-sm transition-colors duration-300"
        >
          Support
        </NuxtLink>
      </div>
      <div
        class="text-muted-500 dark:text-muted-400 ltablet:w-1/5 ltablet:justify-end ltablet:mt-0 mt-6 flex w-full items-center justify-center text-sm lg:mt-0 lg:w-1/5 lg:justify-end"
      >
        <span>
          ©
          <NuxtLink
            to="/"
            target="_blank"
            rel="noopener"
            class="text-muted-600 hover:text-primary-500 dark:text-muted-200 dark:hover:text-primary-400 text-sm transition-colors duration-300"
          >
            Digital Innova
          </NuxtLink>
          2021-{{ year }}.
        </span>
      </div>
    </div>
  </footer>
</template>
