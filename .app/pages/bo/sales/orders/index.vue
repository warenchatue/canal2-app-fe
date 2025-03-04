<script setup lang="ts">
import { UserRole } from '~/types/user'

definePageMeta({
  title: 'Devis',
  preview: {
    title: 'Sales Orders',
    description: 'Sales orders management',
    categories: ['bo', 'spots', 'orders'],
    src: '/img/screens/layouts-table-list-1.png',
    srcDark: '/img/screens/layouts-table-list-1-dark.png',
    order: 44,
  },
})

const fakeItems = ref([])

const authStore = useAuthStore()
const route = useRoute()
const router = useRouter()
const page = computed(() => parseInt((route.query.page as string) ?? '1'))
const filter = ref('')
const perPage = ref(10)
const isModalNewPackageOpen = ref(false)
const isModalDeletePackageOpen = ref(false)
const isModalConfirmOrderOpen = ref(false)
const isModalCopyOrderOpen = ref(false)
const isEdit = ref(false)
const toaster = useToaster()
const isLoading = ref(false)
// Check if can have access
if (
  authStore.user.appRole?.name != UserRole.sale &&
  authStore.user.appRole?.name != UserRole.adminSale &&
  authStore.user.appRole?.name != UserRole.mediaPlanner &&
  authStore.user.appRole?.name != UserRole.billing &&
  authStore.user.appRole?.name != UserRole.admin &&
  authStore.user.appRole?.name != UserRole.accountancy &&
  authStore.user.appRole?.name != UserRole.superAdmin
) {
  toaster.clearAll()
  toaster.show({
    title: 'Désolé',
    message: `Vous n'avez pas access à cette page!`,
    color: 'danger',
    icon: 'ph:check',
    closable: true,
  })
  router.back()
}

watch([filter, perPage], () => {
  router.push({
    query: {
      page: undefined,
    },
  })
})

const token = useCookie('token')

const queryPaginate = computed(() => {
  return {
    filter: filter.value,
    perPage: perPage.value,
    page: page.value,
    action: 'findAllPaginate',
    token: token.value,
  }
})

const { data, pending, refresh } = await useFetch('/api/sales/orders', {
  query: queryPaginate,
  lazy: true,
})

function confirmDeletePackage(spotPackage: any) {
  isModalDeletePackageOpen.value = true
  isEdit.value = false
  currentOrder.value = spotPackage
}

async function copyOrder(ids: any) {
  const query2 = computed(() => {
    return {
      action: 'copyOrder',
      token: token.value,
      id: ids[0],
    }
  })

  const response = await useFetch('/api/sales/orders', {
    method: 'put',
    headers: { 'Content-Type': 'application/json' },
    query: query2,
  })

  if (response.data?.value?.success) {
    success.value = true
    toaster.clearAll()
    toaster.show({
      title: 'Success',
      message: `Devis Dupliqué !`,
      color: 'success',
      icon: 'ph:check',
      closable: true,
    })
    isModalCopyOrderOpen.value = false
    filter.value = 'order'
    filter.value = ''
  } else {
    toaster.clearAll()
    toaster.show({
      title: 'Désolé',
      message: `Une erreur est survenue !`,
      color: 'danger',
      icon: 'ph:check',
      closable: true,
    })
  }
}

async function deleteOrder(order: any) {
  const query2 = computed(() => {
    return {
      action: 'delete',
      token: token.value,
      id: order._id,
    }
  })

  const response = await useFetch('/api/sales/orders', {
    method: 'delete',
    headers: { 'Content-Type': 'application/json' },
    query: query2,
  })

  if (response.data?.value?.success) {
    success.value = true
    toaster.clearAll()
    toaster.show({
      title: 'Success',
      message: `Devi supprimé !`,
      color: 'success',
      icon: 'ph:check',
      closable: true,
    })
    isModalDeletePackageOpen.value = false
    filter.value = 'order'
    filter.value = ''
  } else {
    toaster.clearAll()
    toaster.show({
      title: 'Désolé',
      message: `Une erreur est survenue !`,
      color: 'danger',
      icon: 'ph:check',
      closable: true,
    })
  }
}

const selected = ref<number[]>([])
const isAllVisibleSelected = computed(() => {
  return selected.value.length === data.value?.data.length
})

function toggleAllVisibleSelection() {
  if (isAllVisibleSelected.value) {
    selected.value = []
  } else {
    selected.value = data.value?.data.map((item) => item._id) ?? []
  }
}

const currentOrder = ref({})

const success = ref(false)
</script>

<template>
  <div>
    <TairoContentWrapper>
      <template #left>
        <BaseInput
          v-model="filter"
          icon="lucide:search"
          placeholder="Filtrer devis..."
          :classes="{
            wrapper: 'w-full sm:w-auto',
          }"
        />
      </template>
      <template #right>
        <BaseSelect
          v-model="perPage"
          label=""
          :classes="{
            wrapper: 'w-full sm:w-40',
          }"
        >
          <option :value="10">10 per page</option>
          <option :value="25">25 per page</option>
          <option :value="50">50 per page</option>
          <option :value="100">100 per page</option>
        </BaseSelect>
        <BaseButton
          color="primary"
          class="w-full sm:w-52"
          to="/bo/sales/orders/new-order-0"
          @click="isLoading = true"
          :loading="isLoading"
          :disabled="isLoading"
        >
          <Icon name="ph:plus" class="h-4 w-4" />
          <span>Nouveau devis</span>
        </BaseButton>
        <BaseButton
          data-tooltip="Raffraichir la page"
          color="primary"
          class="w-full sm:w-16"
          @click="refresh"
        >
          <Icon name="ph:arrows-clockwise" class="h-6 w-6" />
          <span></span>
        </BaseButton>
      </template>
      <div class="grid grid-cols-12 gap-4 pb-5">
        <!-- Stat tile -->
        <div class="col-span-12 md:col-span-3">
          <BaseCard class="p-4">
            <div class="mb-1 flex items-center justify-between">
              <BaseHeading
                as="h5"
                size="sm"
                weight="medium"
                lead="tight"
                class="text-muted-500 dark:text-muted-400"
              >
                <span>Total</span>
              </BaseHeading>
              <BaseIconBox
                size="xs"
                class="bg-success-100 text-success-500 dark:bg-success-500/20 dark:text-success-400 dark:border-success-500 dark:border-2"
                shape="full"
              >
                <Icon name="ph:basket" class="h-5 w-5" />
              </BaseIconBox>
            </div>
            <div class="mb-2">
              <BaseHeading
                as="h4"
                size="2xl"
                weight="bold"
                lead="tight"
                class="text-muted-800 dark:text-white"
              >
                <span v-if="!pending">{{ data?.stats?.totalItems }}</span>
                <span v-else
                  ><BasePlaceload class="h-3 w-10 rounded-lg"
                /></span>
              </BaseHeading>
            </div>
            <div
              class="text-success-500 flex items-center gap-1 font-sans text-sm"
            >
              <span>+0.0%</span>
              <Icon name="lucide:trending-up" class="h-5 w-5" />
              <span class="text-muted-400 text-xs">en hause</span>
            </div>
          </BaseCard>
        </div>
        <!-- Stat tile -->
        <div class="col-span-12 md:col-span-3">
          <BaseCard class="p-4">
            <div class="mb-1 flex items-center justify-between">
              <BaseHeading
                as="h5"
                size="sm"
                weight="medium"
                lead="tight"
                class="text-muted-500 dark:text-muted-400"
              >
                <span>Facturés</span>
              </BaseHeading>
              <BaseIconBox
                size="xs"
                class="bg-yellow-100 text-yellow-500 dark:border-2 dark:border-yellow-500 dark:bg-yellow-500/20 dark:text-yellow-400"
                shape="full"
              >
                <Icon name="ph:money" class="h-5 w-5" />
              </BaseIconBox>
            </div>
            <div class="mb-2">
              <BaseHeading
                as="h4"
                size="2xl"
                weight="bold"
                lead="tight"
                class="text-muted-800 dark:text-white"
              >
                <span v-if="!pending">-</span>
                <span v-else
                  ><BasePlaceload class="h-3 w-10 rounded-lg"
                /></span>
              </BaseHeading>
            </div>
            <div
              class="text-danger-500 flex items-center gap-1 font-sans text-sm"
            >
              <span>-0.0%</span>
              <Icon name="lucide:trending-down" class="h-5 w-5" />
              <span class="text-muted-400 text-xs">en baisse</span>
            </div>
          </BaseCard>
        </div>
        <!-- Stat tile -->
        <div class="col-span-12 md:col-span-3">
          <BaseCard class="p-4">
            <div class="mb-1 flex items-center justify-between">
              <BaseHeading
                as="h5"
                size="sm"
                weight="medium"
                lead="tight"
                class="text-muted-500 dark:text-muted-400"
              >
                <span>Non Facturés</span>
              </BaseHeading>
              <BaseIconBox
                size="xs"
                class="bg-primary-100 text-primary-500 dark:bg-primary-500/20 dark:text-primary-400 dark:border-primary-500 dark:border-2"
                shape="full"
              >
                <Icon name="ph:money" class="h-5 w-5" />
              </BaseIconBox>
            </div>
            <div class="mb-2">
              <BaseHeading
                as="h4"
                size="2xl"
                weight="bold"
                lead="tight"
                class="text-muted-800 dark:text-white"
              >
                <span v-if="!pending">-</span>
                <span v-else
                  ><BasePlaceload class="h-3 w-10 rounded-lg"
                /></span>
              </BaseHeading>
            </div>
            <div
              class="text-success-500 flex items-center gap-1 font-sans text-sm"
            >
              <span>+0.0%</span>
              <Icon name="lucide:trending-up" class="h-5 w-5" />
              <span class="text-muted-400 text-xs">en hausse</span>
            </div>
          </BaseCard>
        </div>
        <!-- Stat tile -->
        <div class="col-span-12 md:col-span-3">
          <BaseCard class="p-4">
            <div class="mb-1 flex items-center justify-between">
              <BaseHeading
                as="h5"
                size="sm"
                weight="medium"
                lead="tight"
                class="text-muted-500 dark:text-muted-400"
              >
                <span>Annonceurs</span>
              </BaseHeading>
              <BaseIconBox
                size="xs"
                class="bg-primary-100 text-primary-500 dark:bg-primary-500/20 dark:text-primary-400 dark:border-primary-500 dark:border-2"
                shape="full"
              >
                <Icon name="ph:user" class="h-5 w-5" />
              </BaseIconBox>
            </div>
            <div class="mb-2">
              <BaseHeading
                as="h4"
                size="2xl"
                weight="bold"
                lead="tight"
                class="text-muted-800 dark:text-white"
              >
                <span v-if="!pending">-</span>
                <span v-else
                  ><BasePlaceload class="h-3 w-10 rounded-lg"
                /></span>
              </BaseHeading>
            </div>
            <div
              class="text-success-500 flex items-center gap-1 font-sans text-sm"
            >
              <span>+0.0%</span>
              <Icon name="lucide:trending-up" class="h-5 w-5" />
              <span class="text-muted-400 text-xs">en hausse</span>
            </div>
          </BaseCard>
        </div>
      </div>
      <div>
        <div v-if="!pending && data?.data.length === 0">
          <BasePlaceholderPage
            title="No matching results"
            subtitle="Looks like we couldn't find any matching results for your search terms. Try other search terms."
          >
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
        </div>
        <div v-else-if="pending">
          <TairoTableRow v-for="index in 5" :key="index">
            <TairoTableCell class="!w-full" spaced>
              <div class="flex items-center">
                <BaseCheckbox
                  v-model="fakeItems"
                  :value="`placeload-item-checkbox-${index}`"
                  rounded="full"
                  color="primary"
                />
              </div>
            </TairoTableCell>
            <TairoTableCell spaced>
              <BasePlaceload class="h-3 w-24 rounded-lg" />
            </TairoTableCell>
            <TairoTableCell spaced>
              <div class="flex items-center gap-2">
                <BasePlaceload class="size-8 shrink-0 rounded-full" />
                <div class="space-y-1">
                  <BasePlaceload class="h-2 w-[70px] rounded-lg" />
                  <BasePlaceload class="h-2 w-[50px] rounded-lg" />
                </div>
              </div>
            </TairoTableCell>
            <TairoTableCell light spaced>
              <BasePlaceload class="h-3 w-12 rounded-lg" />
            </TairoTableCell>
            <TairoTableCell light spaced>
              <BasePlaceload class="h-3 w-12 rounded-lg" />
            </TairoTableCell>
            <TairoTableCell light spaced>
              <BasePlaceload class="h-3 w-12 rounded-lg" />
            </TairoTableCell>
            <TairoTableCell light spaced>
              <BasePlaceload class="h-3 w-12 rounded-lg" />
            </TairoTableCell>
            <TairoTableCell light spaced>
              <BasePlaceload class="h-3 w-12 rounded-lg" />
            </TairoTableCell>
            <TairoTableCell light spaced>
              <BasePlaceload class="h-3 w-12 rounded-lg" />
            </TairoTableCell>
            <TairoTableCell light spaced>
              <BasePlaceload class="h-3 w-12 rounded-lg" />
            </TairoTableCell>
            <TairoTableCell spaced>
              <BasePlaceload class="h-8 w-16 rounded-lg" />
            </TairoTableCell>
            <TairoTableCell spaced>
              <BasePlaceload class="h-8 w-16 rounded-lg" />
            </TairoTableCell>
            <TairoTableCell spaced>
              <BasePlaceload class="h-8 w-16 rounded-lg" />
            </TairoTableCell>
          </TairoTableRow>
        </div>
        <div v-else>
          <div class="w-full">
            <TairoTable shape="rounded">
              <template #header>
                <TairoTableHeading uppercase spaced class="p-4">
                  <div class="flex items-center">
                    <BaseCheckbox
                      :model-value="isAllVisibleSelected"
                      :indeterminate="
                        selected.length > 0 && !isAllVisibleSelected
                      "
                      name="table-1-main"
                      shape="rounded"
                      class="text-primary-500"
                      @click="toggleAllVisibleSelection"
                    />
                  </div>
                </TairoTableHeading>
                <TairoTableHeading uppercase spaced>Code</TairoTableHeading>
                <TairoTableHeading uppercase spaced>
                  Annonceur
                </TairoTableHeading>
                <TairoTableHeading uppercase spaced> Date </TairoTableHeading>
                <TairoTableHeading uppercase spaced>
                  Societé
                </TairoTableHeading>
                <TairoTableHeading uppercase spaced>
                  Vendeur
                </TairoTableHeading>
                <TairoTableHeading uppercase spaced> Total </TairoTableHeading>
                <TairoTableHeading uppercase spaced> Dû </TairoTableHeading>
                <TairoTableHeading uppercase spaced>Docs</TairoTableHeading>
                <TairoTableHeading uppercase spaced>Statut</TairoTableHeading>
                <TairoTableHeading uppercase spaced>Action</TairoTableHeading>
              </template>

              <TairoTableRow v-if="selected.length > 0" :hoverable="false">
                <TairoTableCell colspan="3" class="p-4">
                  <BaseButtonAction
                    v-if="selected.length == 1"
                    @click="isModalCopyOrderOpen = true"
                    class="mx-2"
                  >
                    <Icon
                      name="lucide:copy"
                      class="h-4 w-4 mr-2 text-orange-500"
                    />
                    Dupliquer</BaseButtonAction
                  >
                </TairoTableCell>
                <TairoTableCell
                  colspan="4"
                  class="bg-success-100 text-success-700 dark:bg-success-700 dark:text-success-100 p-4"
                >
                  You have selected {{ selected.length }} items of the total
                  {{ data?.metaData.total }} items.
                  <a
                    href="#"
                    class="outline-none hover:underline focus:underline"
                    >Click here to everything</a
                  >
                </TairoTableCell>
              </TairoTableRow>

              <TairoTableRow v-for="item in data?.data" :key="item._id">
                <TairoTableCell spaced>
                  <div class="flex items-center">
                    <BaseCheckbox
                      v-model="selected"
                      :value="item._id"
                      :name="`item-checkbox-${item._id}`"
                      shape="rounded"
                      class="text-primary-500"
                    />
                  </div>
                </TairoTableCell>
                <TairoTableCell light spaced>
                  <NuxtLink
                    class="text-primary-500 underline-offset-4 hover:underline"
                    :to="'/bo/sales/orders/view-order-' + item._id"
                  >
                    {{ item.code }}
                  </NuxtLink>
                </TairoTableCell>
                <TairoTableCell spaced>
                  <div
                    style="white-space: pre-wrap; word-wrap: break-word"
                    class="flex items-center"
                  >
                    <BaseAvatar
                      :src="item.announcer?.logo ?? '/img/avatars/company.svg'"
                      :text="item.initials"
                      :class="getRandomColor()"
                    />
                    <div class="!w-40 ms-3 leading-none">
                      <h4 class="font-sans text-sm font-medium">
                        {{ item.announcer?.name }}
                      </h4>
                      <p class="text-muted-400 font-sans text-xs">
                        {{ item.announcer?.code }}
                      </p>
                    </div>
                  </div>
                </TairoTableCell>
                <TairoTableCell light spaced>
                  {{ new Date(item.createdAt).toLocaleDateString('fr-FR') }}
                </TairoTableCell>
                <TairoTableCell light spaced>
                  {{ item.org.name }}
                </TairoTableCell>
                <TairoTableCell light spaced>
                  {{ item.manager?.lastName }}
                  {{ item.manager?.firstName }}
                </TairoTableCell>
                <TairoTableCell light spaced>
                  {{
                    new Intl.NumberFormat().format(Math.ceil(item.amount ?? 0))
                  }}
                  XAF
                </TairoTableCell>
                <TairoTableCell light spaced> 0 XAF </TairoTableCell>
                <TairoTableCell light spaced>
                  <a
                    v-if="item.contractUrl"
                    class="mx-1 text-white bg-muted-600 p-2 rounded"
                    :href="'/' + item.contractUrl"
                    target="_blank"
                    >C</a
                  >
                  <a
                    v-if="item.invoice?.url"
                    class="mx-1 text-white bg-muted-600 p-2 rounded"
                    :href="'/' + item.invoice?.url"
                    target="_blank"
                    >F</a
                  >
                </TairoTableCell>
                <TairoTableCell spaced class="capitalize">
                  <BaseTag
                    v-if="item.validator"
                    color="success"
                    flavor="pastel"
                    shape="full"
                    condensed
                    class="font-medium"
                  >
                    Confirmé
                  </BaseTag>
                  <BaseTag
                    v-else
                    color="warning"
                    flavor="pastel"
                    shape="full"
                    condensed
                    class="font-medium"
                  >
                    Brouillon
                  </BaseTag>
                </TairoTableCell>
                <TairoTableCell spaced>
                  <div class="flex">
                    <BaseButtonAction
                      class="mx-2"
                      :to="'/bo/sales/orders/view-order-' + item._id"
                      muted
                    >
                      <Icon name="lucide:eye" class="h-4 w-4"
                    /></BaseButtonAction>
                    <BaseButtonAction
                      :to="'/bo/sales/orders/edit-order-' + item._id"
                    >
                      <Icon name="lucide:edit" class="h-4 w-4" s
                    /></BaseButtonAction>
                    <BaseButtonAction
                      @click="confirmDeletePackage(item)"
                      class="mx-2"
                      :disabled="
                        authStore.user.appRole?.name != UserRole.superAdmin
                      "
                    >
                      <Icon name="lucide:trash" class="h-4 w-4 text-red-500"
                    /></BaseButtonAction>
                  </div>
                </TairoTableCell>
              </TairoTableRow>
            </TairoTable>
          </div>
          <div class="mt-6">
            <BasePagination
              :total-items="data?.metaData.total ?? 0"
              :item-per-page="perPage"
              :current-page="page"
              shape="curved"
            />
          </div>
        </div>
      </div>
    </TairoContentWrapper>

    <!-- Modal Copy Order -->
    <TairoModal
      :open="isModalCopyOrderOpen"
      size="sm"
      @close="isModalCopyOrderOpen = false"
    >
      <template #header>
        <!-- Header -->
        <div class="flex w-full items-center justify-between p-4 md:p-6">
          <h3
            class="font-heading text-muted-900 text-lg font-medium leading-6 dark:text-white"
          >
            Copie d'un Devis
          </h3>

          <BaseButtonClose @click="isModalCopyOrderOpen = false" />
        </div>
      </template>

      <!-- Body -->
      <div class="p-4 md:p-6">
        <div class="mx-auto w-full max-w-xs text-center">
          <h3
            class="font-heading text-muted-800 text-lg font-medium leading-6 dark:text-white"
          >
            Dupliquer le devis sélèctionné
            <span class="text-red-500"></span> ?
          </h3>

          <p
            class="font-alt text-muted-700 dark:text-muted-400 text-sm leading-5"
          >
            Cette action est irreversible
          </p>
        </div>
      </div>

      <template #footer>
        <!-- Footer -->
        <div class="p-4 md:p-6">
          <div class="flex gap-x-2">
            <BaseButton @click="isModalCopyOrderOpen = false"
              >Annuler</BaseButton
            >

            <BaseButton
              color="primary"
              flavor="solid"
              @click="copyOrder(selected)"
              >Proceder</BaseButton
            >
          </div>
        </div>
      </template>
    </TairoModal>

    <!-- Modal delete -->
    <TairoModal
      :open="isModalDeletePackageOpen"
      size="sm"
      @close="isModalDeletePackageOpen = false"
    >
      <template #header>
        <!-- Header -->
        <div class="flex w-full items-center justify-between p-4 md:p-6">
          <h3
            class="font-heading text-muted-900 text-lg font-medium leading-6 dark:text-white"
          >
            Suppression d'un devis
          </h3>

          <BaseButtonClose @click="isModalDeletePackageOpen = false" />
        </div>
      </template>

      <!-- Body -->
      <div class="p-4 md:p-6">
        <div class="mx-auto w-full max-w-xs text-center">
          <h3
            class="font-heading text-muted-800 text-lg font-medium leading-6 dark:text-white"
          >
            Supprimer
            <span class="text-red-500">{{ currentOrder?.label }}</span> ?
          </h3>

          <p
            class="font-alt text-muted-500 dark:text-muted-400 text-sm leading-5"
          >
            Cette action est irreversible
          </p>
        </div>
      </div>

      <template #footer>
        <!-- Footer -->
        <div class="p-4 md:p-6">
          <div class="flex gap-x-2">
            <BaseButton @click="isModalDeletePackageOpen = false"
              >Annuler</BaseButton
            >

            <BaseButton
              color="primary"
              flavor="solid"
              @click="deleteOrder(currentOrder)"
              >Suppimer</BaseButton
            >
          </div>
        </div>
      </template>
    </TairoModal>
  </div>
</template>
