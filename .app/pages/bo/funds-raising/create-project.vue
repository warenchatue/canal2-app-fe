<script setup lang="ts">
import type { Project, ProjectStepData } from '../../../types'

definePageMeta({
  layout: 'empty',
})

const initialState = ref<Project>({
  type: undefined,
  name: '',
  description: '',
  startDate: undefined,
  endDate: undefined,
  files: null,
  avatar: null,
  budget: '500000',
})

const wizardSteps = [
  {
    to: '/bo/funds-raising/create-project/',
    meta: {
      name: 'Type de collecte',
      title: 'Choix du type de collecte',
      subtitle: 'Selectionnez le type de collecte que vous souhaitez créer',
    } satisfies ProjectStepData,
  },
  {
    to: '/bo/funds-raising/create-project/step-2',
    meta: {
      name: 'Informations',
      title: "Quel est l'objectif de ce projet ?",
      subtitle: 'Ajoutez toutes les informations pertinentes sur le projet',
    } satisfies ProjectStepData,
  },
  {
    to: '/bo/funds-raising/create-project/step-3',
    meta: {
      name: 'Details du projet',
      title: 'Ajoutez plus de détails',
      subtitle:
        'Ajoutez des détails utiles au projet. Vous pourrez les modifier ultérieurement',
    } satisfies ProjectStepData,
  },
  {
    to: '/bo/funds-raising/create-project/step-4',
    meta: {
      name: 'Fichiers du projet',
      title: 'Ajouter des fichiers à ce projet',
      subtitle:
        "Vous pouvez également sauter cette étape. Vous pourrez toujours ajouter d'autres fichiers ultérieurement",
    } satisfies ProjectStepData,
  },
  // {
  //   to: '/bo/funds-raising/create-project/step-5',
  //   meta: {
  //     name: 'Team members',
  //     title: 'Who will be working on this project?',
  //     subtitle: 'Start by adding members to your team',
  //   } satisfies ProjectStepData,
  // },
  // {
  //   to: '/bo/funds-raising/create-project/step-6',
  //   meta: {
  //     name: 'Project tools',
  //     title: 'What tools will you be using?',
  //     subtitle: "Choose a set of tools that you'll be using in this project",
  //   } satisfies ProjectStepData,
  // },
  {
    to: '/bo/funds-raising/create-project/step-7',
    meta: {
      preview: true,
      name: 'Fin',
      title: 'Verifiez les informations',
      subtitle:
        'Vous pouvez revenir aux étapes précédentes si vous avez besoin de modifier quoi que ce soit.',
    } satisfies ProjectStepData,
  },
]

const toaster = useToaster()

const { handleSubmit, currentStep } = createMultiStepForm<
  Project,
  ProjectStepData
>({
  initialState: initialState,
  steps: wizardSteps,
  onSubmit: async (state, ctx) => {
    console.log('multi-step-submit', state)

    if (!state.type) {
      ctx.goToStep(ctx.getStep(0))
      throw new Error('Please select a project type')
    }
    if (!state.name) {
      ctx.goToStep(ctx.getStep(1))
      throw new Error('Enter a project name')
    }

    // Simulate async request
    await new Promise((resolve) => setTimeout(resolve, 4000))

    toaster.clearAll()
    toaster.show({
      title: 'Success',
      message: `Project ${state.name} created!`,
      color: 'success',
      icon: 'ph:check',
      closable: true,
    })
  },
  onError: (error) => {
    console.log('multi-step-error', error)

    toaster.clearAll()
    toaster.show({
      title: 'Oops!',
      message: error.message,
      color: 'danger',
      icon: 'lucide:alert-triangle',
      closable: true,
    })
  },
})

useHead({
  titleTemplate: (title) =>
    `${title} | Campaign - Step ${currentStep.value + 1}`,
})
</script>

<template>
  <TairoSidebarLayout
    :toolbar="false"
    :sidebar="false"
    class="bg-muted-100 dark:bg-muted-900 min-h-screen w-full"
  >
    <template #logo>
      <NuxtLink
        to="/"
        class="text-muted-400 hover:text-primary-500 hover:bg-primary-500/20 flex h-12 w-12 items-center justify-center rounded-2xl transition-colors duration-300"
        @click.prevent="$router.back()"
      >
        <Icon name="lucide:arrow-left" class="h-5 w-5" />
      </NuxtLink>
    </template>

    <DemoWizardNavigation />

    <form action="" method="POST" @submit.prevent="handleSubmit" novalidate>
      <div class="pb-32 pt-24">
        <RouterView />
      </div>
      <DemoWizardButtons />
    </form>
  </TairoSidebarLayout>
</template>
