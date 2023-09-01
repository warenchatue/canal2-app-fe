<script setup lang="ts">
import { useOrgStore } from '~/stores/org'
import { Org } from '~/types/org'

definePageMeta({
  title: 'Select Org',
  layout: 'empty',
  preview: {
    title: 'Select Org',
    description: 'For onboarding new users',
    categories: ['layouts', 'onboarding'],
    src: '/img/screens/layouts-onboarding-1.png',
    srcDark: '/img/screens/layouts-onboarding-1-dark.png',
    order: 93,
  },
})

const auth = useAuthStore()
const toaster = useToaster()
const loading = ref(false)
const selectedOrg = ref({
  id: '',
  name: '',
  slug: '',
  type: '',
  description: '',
  medias: {
    cover: '',
    logo: '',
  },
})
const router = useRouter()
const query = computed(() => {
  return {
    action: 'getUserOrgs',
  }
})

const { data, pending, error, refresh } = await useFetch('/api/orgs', {
  method: 'post',
  headers: { 'Content-Type': 'application/json' },
  query: query,
  body: {
    uid: auth.user.id,
  },
})

if (data.value) {
  console.log(data)
}
async function goToOrgNew() {
  router.push('/bo/org/org-new')
}
async function goToDashboards() {
  loading.value = true
  const timer = setTimeout(async () => {
    loading.value = false

    if (selectedOrg.value.id == '') {
      toaster.clearAll()
      toaster.show({
        title: 'Warning',
        message: `Veuillez selctionner une organisation !`,
        color: 'danger',
        icon: 'ph:user-circle-fill',
        closable: true,
      })
    } else {
      const app = useAppStore()
      const orgStore = useOrgStore()
      const baseOrg = <Org>{
        id: selectedOrg.value.id,
        name: selectedOrg.value.name,
        slug: selectedOrg.value.slug,
        type: selectedOrg.value.type,
        description: selectedOrg.value.description,
        medias: selectedOrg.value.medias,
      }
      await app.setActiveOrg(baseOrg)
      await orgStore.setActiveOrg(baseOrg)
      router.push('/dashboards')
    }

    clearTimeout(timer)
  }, 500)
}
</script>

<template>
  <div class="bg-muted-100 dark:bg-muted-900 min-h-screen">
    <div
      class="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-4"
    >
      <NuxtLink
        to="/"
        class="text-muted-400 hover:text-primary-500 dark:text-muted-700 dark:hover:text-primary-500 transition-colors duration-300"
      >
        <TairoLogo class="h-10 w-10" />
      </NuxtLink>
      <div class="flex items-center gap-4">
        <BaseThemeToggle />
        <BaseText
          size="xs"
          class="text-muted-400 hover:cursor-pointer"
          @click="auth.logUserOut()"
          >{{ auth.user.firstName }} {{ auth.user.lastName }}</BaseText
        >
      </div>
    </div>
    <form
      action=""
      method="POST"
      @submit.prevent
      class="mx-auto max-w-7xl px-4"
    >
      <div v-if="!pending && data?.data.length === 0">
        <BasePlaceholderPage title="Aucune organisation trouvé" subtitle="">
          <template #image>
            <img
              class="block dark:hidden"
              src="/img/illustrations/placeholders/flat/placeholder-search-4.svg"
              alt="Placeholder image"
            />
            <img
              class="hidden dark:block"
              src="/img/illustrations/placeholders/flat/placeholder-search-4-dark.svg"
              alt="Placeholder image"
            />
          </template>
        </BasePlaceholderPage>
        <div class="mx-auto flex flex-col pb-5 items-center">
          <BaseButton
            type="button"
            shape="curved"
            class="!h-12 w-48"
            color="primary"
            :loading="loading"
            @click="goToOrgNew()"
            >Créer une organisation</BaseButton
          >
          <NuxtLink
            to="/"
            class="text-muted-400 hover:text-primary-500 mt-4 text-xs font-medium underline-offset-4 transition-colors duration-300 hover:underline"
            >Retourner à la page d'accueil</NuxtLink
          >
        </div>
      </div>
      <div v-else>
        <div class="pt-8 text-center">
          <BaseHeading tag="h2" size="3xl" weight="medium" class="mb-2">
            Veuillez sélectionner une organisation
            <span class="text-primary-500">{{ auth.user.firstName }}</span>
          </BaseHeading>
          <BaseParagraph class="text-muted-500 dark:text-muted-400 mb-8">
            Choisir une organisation parmis la liste ci-dessous ou
            <NuxtLink
              to="/bo/org/org-new"
              class="text-primary-400 hover:text-primary-500 mt-4 text-xs font-medium underline-offset-4 transition-colors duration-300 hover:underline"
              >créer</NuxtLink
            >
          </BaseParagraph>
        </div>

        <div>
          <div class="w-full">
            <div class="mx-auto w-full">
              <div class="w-full">
                <div
                  v-if="!pending"
                  class="mx-auto mb-8 grid max-w-4xl gap-6 sm:grid-cols-3"
                >
                  <BaseRadioHeadless
                    v-for="(item, index) in data?.data"
                    :key="index"
                    v-model="selectedOrg"
                    name="radio_custom"
                    :value="item"
                  >
                    <BaseCard
                      shape="curved"
                      class="peer-checked:!border-primary-500 relative border-2 my-4 p-8 opacity-60 grayscale peer-checked:opacity-100 peer-checked:grayscale-0 peer-checked:[&_.child]:!opacity-100"
                    >
                      <div class="flex flex-col text-center">
                        <img
                          src="/img/illustrations/onboarding/2fa-sms.svg"
                          alt="2 factor authentication with email"
                          class="mx-auto max-w-[160px]"
                        />
                        <BaseHeading size="md" weight="medium">{{
                          item.name
                        }}</BaseHeading>
                        <BaseParagraph
                          size="xs"
                          lead="snug"
                          class="text-muted-500 dark:text-muted-400"
                        >
                          Soutient à la communauté
                        </BaseParagraph>
                      </div>
                      <div class="child absolute end-2 top-3 opacity-0">
                        <Icon
                          name="ph:check-circle-duotone"
                          class="text-primary-500 h-7 w-7"
                        />
                      </div>
                    </BaseCard>
                  </BaseRadioHeadless>
                </div>
                <div class="mx-auto flex flex-col items-center">
                  <BaseButton
                    type="button"
                    shape="curved"
                    class="!h-12 w-48"
                    color="primary"
                    :loading="loading"
                    @click="goToDashboards()"
                    >Continue</BaseButton
                  >
                  <NuxtLink
                    to="/"
                    class="text-muted-400 hover:text-primary-500 mt-4 text-xs font-medium underline-offset-4 transition-colors duration-300 hover:underline"
                    >Retourner à la page d'accueil</NuxtLink
                  >
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </form>
  </div>
</template>
