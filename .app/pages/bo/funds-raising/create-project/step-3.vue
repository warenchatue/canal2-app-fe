<script setup lang="ts">
import { DatePicker } from 'v-calendar'

import 'v-calendar/dist/style.css'
import '~/assets/css/vcalendar.css'

import type {
  Project,
  ProjectStepData,
} from '../../../../types/project'

definePageMeta({
  title: 'Wizard — Step 3',
  layout: 'collapse',
  preview: {
    title: 'Wizard — Step 3',
    description: "Création d'une campagne",
    categories: ['bo', 'fund-raising', 'forms'],
    src: '/img/screens/wizard-3.png',
    srcDark: '/img/screens/wizard-3-dark.png',
    order: 32,
  },
})

const { data: project } = useMultiStepForm<Project, ProjectStepData>()

useHead({
  title: 'Project details',
})

const search = ref('')
const itemSelected = ref(false)

const masks = ref({
  input: 'YYYY-MM-DD',
})

// const budget = ref('500000')
</script>

<template>
  <div>
    <DemoWizardStepTitle />
    <div class="mx-auto flex w-full max-w-xl flex-col gap-3 px-4">
      <!-- Time frame -->
      <BaseCard shape="curved" class="p-6">
        <div class="mb-4 text-center">
          <h3
            class="text-muted-400 font-sans text-[0.65rem] font-semibold uppercase"
          >
            Période de temps
          </h3>
        </div>
        <div
          class="divide-muted-200 dark:divide-muted-700 flex w-full justify-between divide-x"
        >
          <div class="relative pe-4">
            <DatePicker
              v-model="project.startDate"
              :masks="masks"
              :minute-increment="15"
              :min-date="new Date()"
              trim-weeks
            >
              <template #default="{ inputValue, inputEvents }">
                <div class="relative">
                  <input
                    class="text-muted-600 dark:text-muted-100 placeholder:text-muted-300 dark:placeholder:text-muted-600 focus-visible:outline-muted-300/70 peer inline-flex h-10 w-full items-center rounded-lg bg-transparent ps-10 font-sans text-sm leading-tight focus-visible:outline-dashed focus-visible:outline-offset-4"
                    :value="inputValue"
                    placeholder="Date de début"
                    v-on="inputEvents"
                  />
                  <div
                    class="text-muted-400 peer-focus-visible:text-primary-500 absolute start-0 top-0 flex h-10 w-10 items-center justify-center transition-colors duration-300"
                  >
                    <Icon name="lucide:map-pin" class="h-5 w-5" />
                  </div>
                </div>
              </template>
            </DatePicker>
          </div>
          <div class="relative ps-4">
            <DatePicker
              id="endDate"
              v-model="project.endDate"
              :masks="masks"
              :minute-increment="15"
              :min-date="project.startDate"
              trim-weeks
            >
              <template #default="{ inputValue, inputEvents }">
                <div class="relative">
                  <input
                    class="text-muted-600 dark:text-muted-100 placeholder:text-muted-300 dark:placeholder:text-muted-600 focus-visible:outline-muted-300/70 peer inline-flex h-10 w-full items-center rounded-lg bg-transparent ps-10 font-sans text-sm leading-tight focus-visible:outline-dashed focus-visible:outline-offset-4"
                    :value="inputValue"
                    placeholder="Date de fin"
                    v-on="inputEvents"
                  />
                  <div
                    class="text-muted-400 peer-focus-visible:text-primary-500 absolute start-0 top-0 flex h-10 w-10 items-center justify-center transition-colors duration-300"
                  >
                    <Icon name="lucide:flag" class="h-5 w-5" />
                  </div>
                </div>
              </template>
            </DatePicker>
          </div>
        </div>
      </BaseCard>
      <!-- Budget -->
      <BaseCard shape="curved" class="p-6">
        <div class="mb-4 text-center">
          <h3
            class="text-muted-400 font-sans text-[0.65rem] font-semibold uppercase"
          >
            Budget ( XAF )
          </h3>
        </div>
        <div class="flex w-full justify-center gap-3">
          <BaseRadioHeadless v-model="project.budget" name="budget" value="500000">
            <BaseButtonAction
              shape="curved"
              class="peer-checked:!bg-primary-500 !p-2 peer-checked:!border-primary-500 peer-checked:shadow-primary-500/20 peer-checked:!text-white peer-checked:shadow-xl"
            >
              <span class="p-2 w-full">&lt; 500K</span>
            </BaseButtonAction>
          </BaseRadioHeadless>
          <BaseRadioHeadless v-model="project.budget" name="budget" value="1000000">
            <BaseButtonAction
              shape="curved"
              class="peer-checked:!bg-primary-500 peer-checked:!border-primary-500 peer-checked:shadow-primary-500/20 peer-checked:!text-white peer-checked:shadow-xl"
            >
              <span>&lt; 1M</span>
            </BaseButtonAction>
          </BaseRadioHeadless>
          <BaseRadioHeadless v-model="project.budget" name="budget" value="5000000">
            <BaseButtonAction
              shape="curved"
              class="peer-checked:!bg-primary-500 peer-checked:!border-primary-500 peer-checked:shadow-primary-500/20 peer-checked:!text-white peer-checked:shadow-xl"
            >
              <span>&lt; 5M</span>
            </BaseButtonAction>
          </BaseRadioHeadless>
          <BaseRadioHeadless v-model="project.budget" name="budget" value="10000000">
            <BaseButtonAction
              shape="curved"
              class="peer-checked:!bg-primary-500 peer-checked:!border-primary-500 peer-checked:shadow-primary-500/20 peer-checked:!text-white peer-checked:shadow-xl"
            >
              <span>&lt; 10M</span>
            </BaseButtonAction>
          </BaseRadioHeadless>
          <BaseRadioHeadless v-model="budget" name="budget" value="10000001">
            <BaseButtonAction
              shape="curved"
              class="peer-checked:!bg-primary-500 peer-checked:!border-primary-500 peer-checked:shadow-primary-500/20 peer-checked:!text-white peer-checked:shadow-xl"
            >
              <span>10M+</span>
            </BaseButtonAction>
          </BaseRadioHeadless>
        </div>
      </BaseCard>
    </div>
  </div>
</template>
