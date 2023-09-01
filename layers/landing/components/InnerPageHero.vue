<script lang="ts" setup>
defineProps({
  title: {
    type: String,
    default: '',
  },
  imageUrl: {
    type: String,
    required: true,
  },
})
</script>

<template>
  <div class="relative z-0 h-40 sm:h-72">
    <img
      :src="imageUrl"
      alt="about"
      class="h-full w-full object-cover blur-xl"
    />

    <div class="absolute inset-0 bg-black opacity-50"></div>
    <div
      class="from-primary-800 absolute inset-0 bg-gradient-to-t opacity-60"
    ></div>

    <div class="absolute inset-0">
      <div
        class="container mx-auto flex h-full w-full flex-col items-center justify-center px-4 text-2xl text-white sm:justify-end sm:px-0 sm:text-4xl"
      >
        <div class="pt-5 text-center sm:mb-8">
          <p
            class="my-10 rounded bg-blue-700/30 p-4 text-base uppercase md:text-3xl"
          >
            {{ title }}
          </p>
          <nav
            class="mt-5 flex rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-green-700 sm:mt-0 sm:px-5 sm:py-3"
            aria-label="Breadcrumb"
          >
            <ol class="inline-flex items-center space-x-1 md:space-x-3">
              <li class="inline-flex items-center">
                <a
                  href="#"
                  class="inline-flex items-center text-sm text-blue-700 hover:text-blue-900 sm:text-lg"
                >
                  <svg
                    class="mr-2.5 h-4 w-4 sm:h-5 sm:w-5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"
                    ></path>
                  </svg>
                  Accueil
                </a>
              </li>
              <li aria-current="page">
                <div class="flex items-center">
                  <svg
                    class="h-6 w-6 text-blue-600"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      fill-rule="evenodd"
                      d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                      clip-rule="evenodd"
                    ></path>
                  </svg>
                  <span
                    class="ml-1 text-xs font-medium text-blue-600 sm:text-sm md:ml-2"
                  >
                    {{ title }}</span
                  >
                </div>
              </li>
            </ol>
          </nav>
        </div>
      </div>
    </div>
  </div>
</template>
