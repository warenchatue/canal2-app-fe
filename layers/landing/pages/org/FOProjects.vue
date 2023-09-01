<script setup lang="ts">
const selectedStyle = ref('classic')
const toggled = ref(false)
const progress = ref(25)

watch(selectedStyle, (value) => {
  if (value) {
    toggled.value = true
    const timeout = setTimeout(() => {
      toggled.value = false
      clearTimeout(timeout)
    }, 1750)
  }
})
</script>

<template>
  <div class="dark:bg-muted-900 overflow-hidden bg-white py-12">
    <div class="mx-auto w-full max-w-7xl px-4">
      <div class="mb-10 max-w-2xl">
        <BaseText
          class="text-primary-500 mb-2 text-[0.65rem] uppercase tracking-wider"
          >Collecte de fonds</BaseText
        >
        <BaseHeading
          as="h2"
          size="4xl"
          weight="light"
          lead="tight"
          class="text-muted-800 mx-auto mb-4 dark:text-white"
        >
          Projets
        </BaseHeading>
        <BaseParagraph
          size="lg"
          class="text-muted-500 dark:text-muted-100 mx-auto mb-4"
        >
          Vous pouvez contribuer à nos pojets pour soutenir la communauté.
        </BaseParagraph>
      </div>
      <div
        class="flex w-full flex-col-reverse items-center justify-between gap-6 sm:flex-row"
        aria-hidden="true"
      >
        <!-- Left -->
        <div class="relative w-full sm:w-1/2">
          <div class="absolute inset-x-0 z-0 -mt-2 py-24">
            <div
              class="mt-12 grid grid-cols-2 -space-x-52 opacity-60 dark:opacity-50 2xl:mx-auto 2xl:max-w-3xl"
            >
              <div
                class="from-primary-200 to-primary-400 h-40 bg-gradient-to-br blur-3xl dark:from-blue-700"
              ></div>
              <div
                class="dark:to-primary-600 h-24 bg-gradient-to-r from-indigo-400 to-indigo-700 blur-3xl"
              ></div>
            </div>
          </div>
          <div
            class="gridlines relative z-10 flex min-h-[550px] w-full items-center justify-center"
          >
            <div
              v-if="toggled"
              class="absolute left-0 top-1/4 z-10 h-full w-full overflow-hidden motion-reduce:hidden"
            >
              <div class="shuriken-1 absolute block">
                <img
                  class="animate-spin-fast h-10 w-10"
                  src="/img/logos/cssninja-logo-icon.svg"
                  alt=""
                />
              </div>
              <div class="shuriken-2 absolute block">
                <img
                  class="animate-spin-fast h-12 w-12"
                  src="/img/logos/cssninja-logo-icon.svg"
                  alt=""
                />
              </div>
              <div class="shuriken-3 absolute block">
                <img
                  class="animate-spin-fast h-11 w-11"
                  src="/img/logos/cssninja-logo-icon.svg"
                  alt=""
                />
              </div>
            </div>
            <div
              v-if="selectedStyle === 'smart'"
              shape="curved"
              class="!border-primary-600 dark:border-muted-700 dark:bg-muted-800 hover:shadow-muted-300/30 dark:hover:shadow-muted-800/30 hover:!border-primary-500 relative z-20 mx-auto w-full max-w-[340px] overflow-hidden rounded-xl border bg-white transition-all duration-300 hover:shadow-xl"
            >
              <a
                href="/orgs/projects/details/delivery-app-project"
                to="/orgs/projects/details/delivery-app-project"
                class="group"
                ><div class="p-5">
                  <div class="relative mb-4">
                    <img
                      src="/img/apps/1.jpg"
                      alt="Delivery App Project"
                      class="w-full rounded-lg"
                    />
                  </div>
                  <div class="mb-6 flex gap-2">
                    <div
                      class="bg-muted-100 dark:bg-muted-700 relative inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full outline-none"
                      data-tooltip="Delivery App Project"
                    >
                      <div
                        class="flex h-full w-full items-center justify-center overflow-hidden rounded-full text-center transition-all duration-300"
                      >
                        <img
                          src="/img/icons/logos/flashlite.svg"
                          class="h-10 max-h-full w-10 max-w-full object-cover shadow-sm dark:border-transparent"
                        /><!----><!---->
                      </div>
                      <!----><!---->
                    </div>
                    <div>
                      <p
                        class="font-heading line-clamp-1 text-sm font-medium leading-normal"
                        tag="h5"
                      >
                        Construction d'une école à hiala
                      </p>
                      <p
                        class="font-alt text-muted-400 text-xs font-normal leading-normal"
                      >
                        Collecte de fonds | Projet
                      </p>
                    </div>
                  </div>
                  <div class="flex items-center justify-between">
                    <div class="flex items-center gap-2">
                      <div class="max-w-xs space-y-4">
                        <BaseProgress
                          title="Default progress bar"
                          size="xs"
                          :value="progress"
                          color="primary"
                        />

                        <div class="flex justify-between gap-2">
                          <BaseButtonAction
                            :class="
                              progress === 25 &&
                              '!border-primary-500 !text-primary-500'
                            "
                            @click="progress = 25"
                          >
                            25%
                          </BaseButtonAction>

                          <BaseButtonAction
                            :class="
                              progress === 50 &&
                              '!border-primary-500 !text-primary-500'
                            "
                            @click="progress = 50"
                          >
                            50%
                          </BaseButtonAction>

                          <BaseButtonAction
                            :class="
                              progress === 75 &&
                              '!border-primary-500 !text-primary-500'
                            "
                            @click="progress = 75"
                          >
                            75%
                          </BaseButtonAction>

                          <BaseButtonAction
                            :class="
                              progress === 100 &&
                              '!border-primary-500 !text-primary-500'
                            "
                            @click="progress = 100"
                          >
                            100%
                          </BaseButtonAction>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div class="flex items-center justify-between px-5 pb-4">
                  <p class="text-muted-400 font-sans text-xs">
                    500 000 XAF sur 630 000 XAF
                  </p>
                </div>
                <div
                  class="border-muted-200 dark:border-muted-700 bg-muted-50 dark:bg-muted-700/50 flex items-center justify-between rounded-b-xl border-t px-5 py-3"
                >
                  <div>
                    <p class="text-muted-400 font-sans text-sm">
                      13 contributors
                    </p>
                  </div>
                  <div>
                    <div class="flex">
                      <div
                        class="dark:bg-muted-800 relative flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white transition-all duration-100 ease-in hover:-ms-2 hover:me-2 focus:-ms-2 focus:me-2"
                      >
                        <div
                          class="bg-primary-500/20 text-primary-500 relative inline-flex h-8 w-8 shrink-0 !scale-90 items-center justify-center rounded-full outline-none"
                          id="27"
                          badge="/img/stacks/illustrator.svg"
                          role="UI/UX Designer"
                          bio="Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod."
                          tooltip="Carmen E."
                          data-tooltip="Carmen E."
                          tabindex="0"
                        >
                          <div
                            class="flex h-full w-full items-center justify-center overflow-hidden rounded-full text-center transition-all duration-300"
                          >
                            <img
                              src="/img/avatars/24.svg"
                              class="h-8 max-h-full w-8 max-w-full object-cover shadow-sm dark:border-transparent"
                            /><!----><!---->
                          </div>
                          <!----><!---->
                        </div>
                      </div>
                      <div
                        class="dark:bg-muted-800 relative -ms-2 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white transition-all duration-100 ease-in hover:-ms-2 hover:-ms-4 hover:me-2 focus:-ms-2 focus:-ms-4 focus:me-2"
                      >
                        <div
                          class="bg-primary-500/20 text-primary-500 relative inline-flex h-8 w-8 shrink-0 !scale-90 items-center justify-center rounded-full outline-none"
                          id="15"
                          badge="/img/stacks/js.svg"
                          role="Fullstack Developer"
                          bio="Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod."
                          tooltip="Josh C."
                          data-tooltip="Josh C."
                          tabindex="0"
                        >
                          <div
                            class="flex h-full w-full items-center justify-center overflow-hidden rounded-full text-center transition-all duration-300"
                          >
                            <img
                              src="/img/avatars/15.svg"
                              class="h-8 max-h-full w-8 max-w-full object-cover shadow-sm dark:border-transparent"
                            /><!----><!---->
                          </div>
                          <!----><!---->
                        </div>
                      </div>
                      <div
                        class="dark:bg-muted-800 relative -ms-2 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white transition-all duration-100 ease-in hover:-ms-2 hover:-ms-4 hover:me-2 focus:-ms-2 focus:-ms-4 focus:me-2"
                      >
                        <div
                          class="bg-primary-500/20 text-primary-500 relative inline-flex h-8 w-8 shrink-0 !scale-90 items-center justify-center rounded-full outline-none"
                          id="12"
                          badge="/img/stacks/csharp.svg"
                          role="Backend Developer"
                          bio="Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod."
                          tooltip="Marjory L."
                          data-tooltip="Marjory L."
                          tabindex="0"
                        >
                          <div
                            class="flex h-full w-full items-center justify-center overflow-hidden rounded-full text-center transition-all duration-300"
                          >
                            <img
                              src="/img/avatars/12.svg"
                              class="h-8 max-h-full w-8 max-w-full object-cover shadow-sm dark:border-transparent"
                            /><!----><!---->
                          </div>
                          <!----><!---->
                        </div>
                      </div>
                      <!---->
                    </div>
                  </div>
                </div></a
              >
            </div>
          </div>
        </div>
        <!-- Right -->
        <div class="relative w-full sm:w-1/2">
          <!-- buttons -->
          <div class="mx-auto">
            <div
              class="relative mx-auto mt-48 flex w-full max-w-xs flex-wrap sm:mt-0"
            >
              <img
                class="absolute -top-48 right-8 w-64"
                src="/img/illustrations/text-hand.svg"
                alt=""
                loading="lazy"
                decoding="async"
              />
              <button
                type="button"
                class="mx-auto flex h-32 w-40 flex-col items-center justify-center transition-colors duration-200"
                :class="
                  selectedStyle === 'classic'
                    ? 'text-primary-500'
                    : 'text-muted-400 dark:text-muted-500 hover:text-muted-600 dark:hover:text-muted-200'
                "
                @click="selectedStyle = 'classic'"
              >
                <Icon
                  name="system-uicons:lightbulb-on"
                  class="mb-2 h-10 w-10"
                />
                <span class="font-sans text-sm"
                  >Construction d'une école a hiala</span
                >
              </button>
              <button
                type="button"
                class="mx-auto flex h-32 w-40 flex-col items-center justify-center transition-colors duration-200"
                :class="
                  selectedStyle === 'corporate'
                    ? 'text-primary-500'
                    : 'text-muted-400 dark:text-muted-500 hover:text-muted-600 dark:hover:text-muted-200'
                "
                @click="selectedStyle = 'corporate'"
              >
                <Icon
                  name="system-uicons:lightbulb-on"
                  class="mb-2 h-10 w-10"
                />
                <span class="font-sans text-sm"
                  >Construction d'une école a hiala</span
                >
              </button>
              <button
                type="button"
                class="mx-auto flex h-32 w-40 flex-col items-center justify-center transition-colors duration-200"
                :class="
                  selectedStyle === 'smart'
                    ? 'text-primary-500'
                    : 'text-muted-400 dark:text-muted-500 hover:text-muted-600 dark:hover:text-muted-200'
                "
                @click="selectedStyle = 'smart'"
              >
                <Icon
                  name="system-uicons:lightbulb-on"
                  class="mb-2 h-10 w-10"
                />
                <span class="font-sans text-sm"
                  >Construction d'une école a hiala</span
                >
              </button>
              <button
                type="button"
                class="mx-auto flex h-32 w-40 flex-col items-center justify-center transition-colors duration-200"
                :class="
                  selectedStyle === 'creative'
                    ? 'text-primary-500'
                    : 'text-muted-400 dark:text-muted-500 hover:text-muted-600 dark:hover:text-muted-200'
                "
                @click="selectedStyle = 'creative'"
              >
                <Icon
                  name="system-uicons:lightbulb-on"
                  class="mb-2 h-10 w-10"
                />
                <span class="font-sans text-sm"
                  >Construction d'une école a hiala</span
                >
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.gridlines {
  background-image: url(/img/illustrations/gridlines.svg);
}

.dark .gridlines {
  background-image: url(/img/illustrations/gridlines-predark.svg);
}

.shuriken-1 {
  animation: shurikenFirst 0.75s 0s forwards;
}

.shuriken-2 {
  top: 190px;
  transform: translateX(-20px);
  animation: shurikenSecond 0.5s 0s forwards;
}
.shuriken-3 {
  top: 110px;
  transform: translateX(-20px) rotate(20deg);
  animation: shurikenThird 1.75s 0s forwards;
}
@keyframes shurikenFirst {
  0% {
    transform: translateX(0);
    opacity: 0;
  }
  10% {
    opacity: 1;
  }
  100% {
    transform: translateX(600px);
    opacity: 0;
  }
}

@keyframes shurikenSecond {
  0% {
    transform: translateX(0);
    opacity: 0;
  }
  10% {
    opacity: 1;
  }
  100% {
    transform: translateX(500px);
    opacity: 0;
  }
}

@keyframes shurikenThird {
  0% {
    transform: translateX(0);
    opacity: 0;
  }
  10% {
    opacity: 1;
  }
  100% {
    transform: translateX(400px);
    opacity: 0;
  }
}
</style>
