<script setup lang="ts">
import { toTypedSchema } from '@vee-validate/zod'
import { Field, useForm } from 'vee-validate'
import { z } from 'zod'
import { UserRole } from '~/types/user'


definePageMeta({
  title: 'Broadcast Authorizations',
  preview: {
    title: 'Broadcast Authorizations',
    description: 'Gestion des autorisations de diffusion',
    categories: ['bo', 'broadcast'],
    src: '/img/screens/layouts-table-list-1.png',
    srcDark: '/img/screens/layouts-table-list-1-dark.png',
    order: 45,
  },
})

const authStore = useAuthStore()
const route = useRoute()
const router = useRouter()
const page = computed(() => parseInt((route.query.page as string) ?? '1'))
const filter = ref('')
const perPage = ref(10)
const showForm = ref(false)
const toaster = useToaster()
const currentBroadcastAuth = ref({})
const isEditMode = ref(false)
const loading = ref(false)

// Check if user has access
if (
  authStore.user.appRole && 
  (authStore.user.appRole.name != UserRole.admin &&
  authStore.user.appRole.name != UserRole.superAdmin)
) {
  toaster.clearAll()
  toaster.show({
    title: 'Désolé',
    message: `Vous n'avez pas accès à cette page!`,
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
const query = computed(() => ({
  filter: filter.value,
  perPage: perPage.value,
  page: page.value,
  action: 'findAll',
  token: token.value,
}))

const { data, pending, error, refresh } = await useFetch('/api/broadcast-auth/broadcast-aut', {
  query,
})

const selected = ref<number[]>([])
const isAllVisibleSelected = computed(() => selected.value.length === (data.value?.data?.length || 0))

function toggleAllVisibleSelection() {
  if (isAllVisibleSelected.value) {
    selected.value = []
  } else {
    selected.value = data.value?.data.map((item) => item.id) ?? []
  }
}

// Fetch data for select options
const { data: announcers } = await useFetch('/api/sales/announcers', {
  query: { action: 'findAll', token: token.value },
})
const { data: invoices } = await useFetch('/api/sales/invoices', {
  query: { action: 'findAll', token: token.value },
})
const { data: campaigns } = await useFetch('/api/pub/packages', {
  query: { action: 'findAll', token: token.value },
})
const { data: natures } = await useFetch('/api/broadcast-auth/broadcast-na', {
  query: { action: 'findAll', token: token.value },
})
const { data: paymentMethods } = await useFetch('/api/accountancy/payment-methods', {
  query: { action: 'findAll', token: token.value },
})
const { data: validators } = await useFetch('/api/admin/orgs', {
  query: { action: 'findAll', token: token.value },
})





//Hours
const hours = ref([])
const inputValue2 = ref('')
const updateInputValue2 = (value) => {
  inputValue2.value = value
}
const addHour1 = (hour, handleChange) => {
  if (!hour?.trim()) return
  const newHours = [...hours.value, hour.trim()]
  hours.value = newHours
  handleChange(newHours)
  inputValue2.value = ''
}
const removeHour1 = (index, handleChange) => {
  const newHours = hours.value.filter((_, i) => i !== index)
  hours.value = newHours
  handleChange(newHours)
}

//RealHours
const realHours = ref([])
const inputValue3 = ref('')
const updateInputValue3 = (value) => {
  inputValue3.value = value
}
const addrealHour1 = (realHour, handleChange) => {
  if (!realHour?.trim()) return
  const newrealHours = [...realHours.value, realHour.trim()]
  realHours.value = newrealHours
  handleChange(newrealHours)
  inputValue3.value = ''
}
const removerealHour1 = (index, handleChange) => {
  const newrealHours = realHours.value.filter((_, i) => i !== index)
  realHours.value = newrealHours
  handleChange(newrealHours)
}




//partisipant
const participants = ref([])
const inputValue = ref('')
const updateInputValue = (value: string) => {
  inputValue.value = value
}
const addParticipant1 = (participant, handleChange) => {
  if (!participant?.trim()) return
  const newParticipants = [...participants.value, participant.trim()]
  participants.value = newParticipants
  handleChange(newParticipants)
  inputValue.value = ''
}
const removeParticipant1 = (index, handleChange) => {
  const newParticipants = participants.value.filter((_, i) => i !== index)
  participants.value = newParticipants
  
  handleChange(newParticipants)
}


//Questions
const questions = ref([])
const inputValue1 = ref('')
const updateInputValue1 = (value) => {
  inputValue1.value = value
}
const addQuestion1 = (question, handleChange) => {
  if (!question?.trim()) return
  const newQuestions = [...questions.value, question.trim()]
  questions.value = newQuestions
  handleChange(newQuestions)
  inputValue1.value = ''
}
const removeQuestion1 = (index, handleChange) => {
  const newQuestions = questions.value.filter((_, i) => i !== index)
  questions.value = newQuestions
  handleChange(newQuestions)
}




//commercials
const { data: commercials } = await useFetch('/api/users/', {
  query: { action: 'findAll', token: token.value },
});
//console.log('Commercials API Response:', commercials.value);
const commercialsList = computed(() => {
  if (!commercials.value || !Array.isArray(commercials.value.data)) {
    return [];
  }
  return commercials.value.data.map(item => ({
    _id: item._id,
    name: item.lastName
  }));
});
const selectedCommercials = ref<string[]>([]);
function handleCommercialChange(event, handleChange) {
  const selectedOptions = Array.from(event.target.selectedOptions).map(
    option => option.value
  );
  selectedCommercials.value = [...new Set([...selectedCommercials.value, ...selectedOptions])];
  handleChange(selectedCommercials.value);
}
function removeCommercial(commercialId, handleChange) {
  selectedCommercials.value = selectedCommercials.value.filter(id => id !== commercialId);
  handleChange(selectedCommercials.value);
}

//print 
// Update the print function
function printAuthorizations() {
  // Create a new window for printing
  const printWindow = window.open('', '_blank');
  
  // Get the content to print
  const tableContent = document.getElementById('print-authorizations')?.innerHTML;
  
  if (printWindow && tableContent) {
    printWindow.document.write(`
      <html>
        <head>
          <title>Broadcast Authorizations</title>
          <style>
            table { border-collapse: collapse; width: 100%; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; }
          </style>
        </head>
        <body>
          ${tableContent}
        </body>
      </html>
    `);
    
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    printWindow.close();
  }
}
// Validation schema
const zodSchema = z.object({
  broadcastAuthorization: z.object({
    announcer: z.object({
      _id: z.string().min(1, "Annonceur est requis")
    }),
    invoice: z.object({
      _id: z.string().min(1, "Facture est requise")
    }),
    campaign: z.object({
      _id: z.string().min(1, "Campagne est requise")
    }),
    nature: z.object({
      _id: z.string().min(1, "Nature est requise")
    }),
    natureDescription: z.string().optional(),
    date: z.string().transform((str) => str ? new Date(str).toISOString() : null),
    startDate: z.string().transform((str) => str ? new Date(str).toISOString() : null),
    endDate: z.string().transform((str) => str ? new Date(str).toISOString() : null),
    paymentMethod: z.object({
      _id: z.string().min(1, "Méthode de paiement est requise")
    }),
    duration: z.number().optional(),
    hour: z.string().optional(),
    hours: z.array(z.string()).default([]),
    realHours: z.array(z.string()).default([]),
    realHour: z.string().optional(),
    description: z.string().optional(),
    participants: z.array(z.string()).default([]),
    questions: z.array(z.string()).default([]),
    note: z.string().optional(),
    serviceInCharge: z.string().optional(),
    validator: z.object({
      _id: z.string().min(1, "Validateur est requis")
    }),
    adminValidator: z.object({
      _id: z.string().min(1, "Validateur Admin est requis")
    }),
    location: z.string().min(1, "Location est requise"),
    commercials: z.array(z.string()).default([]),
    contactDetails: z.string().optional(),
    productionPartner: z.string().optional(),
    otherProductionPartner: z.string().optional(),
    keyContact: z.string().optional(),
    otherKeyContact: z.string().optional(),
    contactDetailsToShow: z.string().optional(),
  }),
})

const validationSchema = toTypedSchema(zodSchema)

const { handleSubmit, isSubmitting, resetForm, setFieldValue, setErrors } = useForm({
  validationSchema,
})

const success = ref(false)

// Handle form submission (create or update)
const onSubmit = handleSubmit(async (values) => {
  console.log('values', values)

  try {
    const token = useCookie('token').value;

    // Format the data to match backend expectations
    const formattedData = {
      announcer: values.broadcastAuthorization.announcer?._id,
      invoice: values.broadcastAuthorization.invoice?._id,
      campaign: values.broadcastAuthorization.campaign?._id,
      nature: values.broadcastAuthorization.nature?._id,
      natureDescription: values.broadcastAuthorization.natureDescription || '',
      date: values.broadcastAuthorization.date ? new Date(values.broadcastAuthorization.date).toISOString() : null,
      startDate: values.broadcastAuthorization.startDate ? new Date(values.broadcastAuthorization.startDate).toISOString() : null,
      endDate: values.broadcastAuthorization.endDate ? new Date(values.broadcastAuthorization.endDate).toISOString() : null,
      paymentMethod: values.broadcastAuthorization.paymentMethod?._id,
      duration: Number(values.broadcastAuthorization.duration) || 0,
      hour: values.broadcastAuthorization.hour || '',
      hours: Array.isArray(values.broadcastAuthorization.hours) ? values.broadcastAuthorization.hours : [],
      realHours: Array.isArray(values.broadcastAuthorization.realHours) ? values.broadcastAuthorization.realHours : [],
      realHour: values.broadcastAuthorization.realHour || '',
      description: values.broadcastAuthorization.description || '',
      participants: Array.isArray(values.broadcastAuthorization.participants) ? values.broadcastAuthorization.participants : [],
      questions: Array.isArray(values.broadcastAuthorization.questions) ? values.broadcastAuthorization.questions : [],
      note: values.broadcastAuthorization.note || '',
      serviceInCharge: values.broadcastAuthorization.serviceInCharge || '',
      validator: values.broadcastAuthorization.validator?._id,
      adminValidator: values.broadcastAuthorization.adminValidator?._id,
      location: values.broadcastAuthorization.location || '',
      commercials: Array.isArray(values.broadcastAuthorization.commercials) ? values.broadcastAuthorization.commercials : [],
      contactDetails: values.broadcastAuthorization.contactDetails || '',
      productionPartner: values.broadcastAuthorization.productionPartner || '',
      otherProductionPartner: values.broadcastAuthorization.otherProductionPartner || '',
      keyContact: values.broadcastAuthorization.keyContact || '',
      otherKeyContact: values.broadcastAuthorization.otherKeyContact || '',
      contactDetailsToShow: values.broadcastAuthorization.contactDetailsToShow || '',
    };

    // Determine the API endpoint and method based on whether we're in edit mode
    const action = isEditMode.value ? 'updateAuthorization' : 'createAuthorization';
    const url = isEditMode.value
      ? `/api/broadcast-auth/broadcast-aut/${currentBroadcastAuth.value._id}?action=${action}`
      : `/api/broadcast-auth/broadcast-aut?action=${action}`;

    const method = isEditMode.value ? 'PUT' : 'POST';

    // Make the API request
    const response = await $fetch(url, {
      method,
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: formattedData,
    });

    if ((response as any).success) {
      toaster.show({
        title: 'Success',
        message: `Broadcast authorization ${isEditMode.value ? 'updated' : 'created'} successfully`,
        color: 'success',
        icon: 'ph:check',
        closable: true,
      });
      resetForm();
      showForm.value = false;
      refresh();
    } else {
      toaster.show({
        title: 'Error',
        message: (response as any).message || `Failed to ${isEditMode.value ? 'update' : 'create'} broadcast authorization`,
        color: 'danger',
        icon: 'ph:warning',
        closable: true,
      });
    }
  } catch (error) {
    console.error('Submission error:', error);
    toaster.show({
      title: 'Error',
      message: (error as any).message || 'Failed to submit form',
      color: 'danger',
      icon: 'ph:warning',
      closable: true,
    });
  }
});


// Edit functionality
function editBroadcastAuth(item: { announcer?: any; invoice?: any; campaign?: any; nature?: any; natureDescription?: any; date?: any; startDate?: any; endDate?: any; paymentMethod?: any; duration?: any; hour?: any; hours?: any; realHours?: any; realHour?: any; description?: any; participants?: any; questions?: any; note?: any; serviceInCharge?: any; validator?: any; adminValidator?: any; location?: any; commercials?: any; contactDetails?: any; productionPartner?: any; otherProductionPartner?: any; keyContact?: any; otherKeyContact?: any; contactDetailsToShow?: any }) {
  currentBroadcastAuth.value = item;
  isEditMode.value = true;
  showForm.value = true;

  // Set all form fields
  setFieldValue('broadcastAuthorization.announcer', item.announcer);
  setFieldValue('broadcastAuthorization.invoice', item.invoice);
  setFieldValue('broadcastAuthorization.campaign', item.campaign);
  setFieldValue('broadcastAuthorization.nature', item.nature);
  setFieldValue('broadcastAuthorization.natureDescription', item.natureDescription);
  setFieldValue('broadcastAuthorization.date', item.date ? new Date(item.date).toISOString().split('T')[0] : '');
  setFieldValue('broadcastAuthorization.startDate', item.startDate ? new Date(item.startDate).toISOString().split('T')[0] : '');
  setFieldValue('broadcastAuthorization.endDate', item.endDate ? new Date(item.endDate).toISOString().split('T')[0] : '');
  setFieldValue('broadcastAuthorization.paymentMethod', item.paymentMethod);
  setFieldValue('broadcastAuthorization.duration', item.duration);
  setFieldValue('broadcastAuthorization.hour', item.hour);
  setFieldValue('broadcastAuthorization.hours', item.hours || []);
  setFieldValue('broadcastAuthorization.realHours', item.realHours || []);
  setFieldValue('broadcastAuthorization.realHour', item.realHour);
  setFieldValue('broadcastAuthorization.description', item.description);
  setFieldValue('broadcastAuthorization.participants', item.participants || []);
  setFieldValue('broadcastAuthorization.questions', item.questions || []);
  setFieldValue('broadcastAuthorization.note', item.note);
  setFieldValue('broadcastAuthorization.serviceInCharge', item.serviceInCharge);
  setFieldValue('broadcastAuthorization.validator', item.validator);
  setFieldValue('broadcastAuthorization.adminValidator', item.adminValidator);
  setFieldValue('broadcastAuthorization.location', item.location);
  setFieldValue('broadcastAuthorization.commercials', item.commercials || []);
  setFieldValue('broadcastAuthorization.contactDetails', item.contactDetails);
  setFieldValue('broadcastAuthorization.productionPartner', item.productionPartner);
  setFieldValue('broadcastAuthorization.otherProductionPartner', item.otherProductionPartner);
  setFieldValue('broadcastAuthorization.keyContact', item.keyContact);
  setFieldValue('broadcastAuthorization.otherKeyContact', item.otherKeyContact);
  setFieldValue('broadcastAuthorization.contactDetailsToShow', item.contactDetailsToShow);
}


function handleNewAuthorization() {
  showForm.value = true;
  isEditMode.value = false;
  resetForm();
  currentBroadcastAuth.value = {};
  
  // Reset all form fields to empty values
  setFieldValue('broadcastAuthorization.announcer', {});
  setFieldValue('broadcastAuthorization.invoice', {});
  setFieldValue('broadcastAuthorization.campaign', {});
  setFieldValue('broadcastAuthorization.nature', {});
  setFieldValue('broadcastAuthorization.natureDescription', '');
  setFieldValue('broadcastAuthorization.date', '');
  setFieldValue('broadcastAuthorization.startDate', '');
  setFieldValue('broadcastAuthorization.endDate', '');
  setFieldValue('broadcastAuthorization.paymentMethod', {});
  setFieldValue('broadcastAuthorization.duration', '');
  setFieldValue('broadcastAuthorization.hour', '');
  setFieldValue('broadcastAuthorization.hours', []);
  setFieldValue('broadcastAuthorization.realHours', []);
  setFieldValue('broadcastAuthorization.realHour', '');
  setFieldValue('broadcastAuthorization.description', '');
  setFieldValue('broadcastAuthorization.participants', []);
  setFieldValue('broadcastAuthorization.questions', []);
  setFieldValue('broadcastAuthorization.note', '');
  setFieldValue('broadcastAuthorization.serviceInCharge', '');
  setFieldValue('broadcastAuthorization.validator', {});
  setFieldValue('broadcastAuthorization.adminValidator', {});
  setFieldValue('broadcastAuthorization.location', '');
  setFieldValue('broadcastAuthorization.commercials', []);
  setFieldValue('broadcastAuthorization.contactDetails', '');
  setFieldValue('broadcastAuthorization.productionPartner', '');
  setFieldValue('broadcastAuthorization.otherProductionPartner', '');
  setFieldValue('broadcastAuthorization.keyContact', '');
  setFieldValue('broadcastAuthorization.otherKeyContact', '');
  setFieldValue('broadcastAuthorization.contactDetailsToShow', '');
}
// Delete functionality
// Update the delete function
async function deleteBroadcastAuth(item) {
  try {
    const token = useCookie('token').value;
    const response = await $fetch(`/api/broadcast-auth/broadcast-aut`, {
      method: 'DELETE',
      query: {
        action: 'delete',
        id: item._id
      },
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.success) {
      toaster.show({
        title: 'Success',
        message: 'Broadcast authorization deleted successfully',
        color: 'success',
        icon: 'ph:check',
        closable: true,
      });
      refresh();
    } else {
      throw new Error(response.message || 'Failed to delete broadcast authorization');
    }
  } catch (error) {
    console.error('Deletion error:', error);
    toaster.show({
      title: 'Error',
      message: (error as any).message || 'Failed to delete broadcast authorization',
      color: 'danger',
      icon: 'ph:warning',
      closable: true,
    });
  }
}
</script>

<template>
  <div>
    <TairoContentWrapper>
      <template #left>
        <BaseInput
          v-model="filter"
          icon="lucide:search"
          placeholder="Filtrer les autorisations..."
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
          class="w-full sm:w-48"
          @click="printAuthorizations"
        >
          <Icon name="ph:file" class="h-4 w-4" />
          <span>Print Authorizations</span>
        </BaseButton>

        <BaseButton
          v-if="!showForm"
          @click="handleNewAuthorization"
          color="primary"
          class="w-full sm:w-48"
          :disabled="
            authStore.user.appRole.name != UserRole.admin &&
            authStore.user.appRole.name != UserRole.superAdmin
          "
        >
          <Icon name="lucide:plus" class="h-4 w-4" />
          <span>Nouvelle Autorisation</span>
        </BaseButton>
        <BaseButton
          v-else
          @click="showForm = false"
          color="muted"
          class="w-full sm:w-48"
        >
          <Icon name="lucide:arrow-left" class="h-4 w-4" />
          <span>Retour à la liste</span>
        </BaseButton>
      </template>

      <div v-if="!showForm">
        <!-- Table View -->
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
        <div v-else>
          <div class="w-full" id="print-authorizations">
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
                <TairoTableHeading uppercase spaced>
                  Announcer
                </TairoTableHeading>
                <TairoTableHeading uppercase spaced> Nature </TairoTableHeading>
                <TairoTableHeading uppercase spaced>
                  Start Date
                </TairoTableHeading>
                <TairoTableHeading uppercase spaced>
                  End Date
                </TairoTableHeading>
                <TairoTableHeading uppercase spaced>
                  Location
                </TairoTableHeading>
                <TairoTableHeading uppercase spaced>
                  Payment Method
                </TairoTableHeading>

                <TairoTableHeading uppercase spaced> Action </TairoTableHeading>
              </template>

              <TairoTableRow v-if="selected.length > 0" :hoverable="false">
                <TairoTableCell
                  colspan="6"
                  class="bg-success-100 text-success-700 dark:bg-success-700 dark:text-success-100 p-4"
                >
                  You have selected {{ selected.length }} items of the total
                  {{ data?.data.length }} items.
                  <a
                    href="#"
                    class="outline-none hover:underline focus:underline"
                    >Click here to everything</a
                  >
                </TairoTableCell>
              </TairoTableRow>

              <TairoTableRow v-for="item in data?.data" :key="item.id">
                <TairoTableCell spaced>
                  <div class="flex items-center">
                    <BaseCheckbox
                      v-model="selected"
                      :value="item.id"
                      :name="`item-checkbox-${item.id}`"
                      shape="rounded"
                      class="text-primary-500"
                    />
                  </div>
                </TairoTableCell>

                <TairoTableCell spaced>
                  <div class="flex items-center">
                    <span class="text-muted-400 font-sans text-xs">
                      {{ item.announcer?.name }}
                    </span>
                  </div>
                </TairoTableCell>
                <TairoTableCell spaced>
                  <div class="flex items-center">
                    <span class="text-muted-400 font-sans text-xs">
                      {{ item.nature?.name }}
                    </span>
                  </div>
                </TairoTableCell>
                <TairoTableCell spaced>
                  <div class="flex items-center">
                    <span class="text-muted-400 font-sans text-xs">
                      {{ new Date(item.startDate).toLocaleDateString() }}
                    </span>
                  </div>
                </TairoTableCell>
                <TairoTableCell spaced>
                  <div class="flex items-center">
                    <span class="text-muted-400 font-sans text-xs">
                      {{ new Date(item.endDate).toLocaleDateString() }}
                    </span>
                  </div>
                </TairoTableCell>
                <TairoTableCell spaced>
                  <div class="flex items-center">
                    <span class="text-muted-400 font-sans text-xs">
                      {{ item.location }}
                    </span>
                  </div>
                </TairoTableCell>
                <TairoTableCell spaced>
                  <div class="flex items-center">
                    <span class="text-muted-400 font-sans text-xs">
                      {{ item.paymentMethod?.label }}
                    </span>
                  </div>
                </TairoTableCell>

                <TairoTableCell spaced>
                  <div class="flex">
                    <BaseButtonAction
                      class="mx-2"
                      @click.prevent="editBroadcastAuth(item)"
                      muted
                    >
                      <Icon name="lucide:eye" class="h-4 w-4"
                    /></BaseButtonAction>
                    <BaseButtonAction
                      :disabled="
                        authStore.user.appRole.name != UserRole.admin &&
                        authStore.user.appRole.name != UserRole.superAdmin
                      "
                      @click="editBroadcastAuth(item)"
                    >
                      <Icon name="lucide:edit" class="h-4 w-4"
                    /></BaseButtonAction>
                    <BaseButtonAction
                      @click="deleteBroadcastAuth(item)"
                      :disabled="
                        authStore.user.appRole.name != UserRole.superAdmin
                      "
                      class="mx-2"
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
              :total-items="data?.total ?? 0"
              :item-per-page="perPage"
              :current-page="page"
              shape="curved"
            />
          </div>
        </div>
      </div>

      <div v-else>
        <!-- Form View -->
        <BaseCard class="w-full">
          <form
            method="POST"
            action=""
            class="divide-muted-200 dark:divide-muted-700"
            @submit.prevent="onSubmit"
            @submit="(e) => console.log('Form submit event triggered', e)"
          >
            <div
              shape="curved"
              class="bg-muted-50 dark:bg-muted-800/60 space-y-8 p-5 md:px-5"
            >
              <div class="mx-auto flex w-full flex-col">
                <div>
                  <div class="grid grid-cols-12 gap-4">
                    <!-- Announcer -->
                    <div class="col-span-12 md:col-span-6">
                      <Field
                        v-slot="{
                          field,
                          errorMessage,
                          handleChange,
                          handleBlur,
                        }"
                        name="broadcastAuthorization.announcer"
                      >
                        <BaseListbox
                          label="Annonceur"
                          :items="announcers.data"
                          :properties="{ value: '_id', label: 'name' }"
                          :model-value="field.value"
                          :error="errorMessage"
                          :disabled="isSubmitting"
                          placeholder="Sélectionnez un annonceur"
                          @update:model-value="handleChange"
                          @blur="handleBlur"
                        />
                      </Field>
                    </div>

                    <!-- Invoice -->
                    <div class="col-span-12 md:col-span-6">
                      <Field
                        v-slot="{
                          field,
                          errorMessage,
                          handleChange,
                          handleBlur,
                        }"
                        name="broadcastAuthorization.invoice"
                      >
                        <BaseListbox
                          label="Facture"
                          :items="invoices.data"
                          :properties="{ value: '_id', label: 'code' }"
                          :model-value="field.value"
                          :error="errorMessage"
                          :disabled="isSubmitting"
                          @update:model-value="handleChange"
                          @blur="handleBlur"
                        />
                      </Field>
                    </div>

                    <!-- Campaign -->
                    <div class="col-span-12 md:col-span-6">
                      <Field
                        v-slot="{
                          field,
                          errorMessage,
                          handleChange,
                          handleBlur,
                        }"
                        name="broadcastAuthorization.campaign"
                      >
                        <BaseListbox
                          label="Campagne"
                          :items="campaigns.data"
                          :properties="{ value: '_id', label: 'code' }"
                          :model-value="field.value"
                          :error="errorMessage"
                          :disabled="isSubmitting"
                          @update:model-value="handleChange"
                          @blur="handleBlur"
                        />
                      </Field>
                    </div>

                    <!-- Nature -->
                    <div class="col-span-12 md:col-span-6">
                      <Field
                        v-slot="{
                          field,
                          errorMessage,
                          handleChange,
                          handleBlur,
                        }"
                        name="broadcastAuthorization.nature"
                      >
                        <BaseListbox
                          label="Nature"
                          :items="natures.data"
                          :properties="{ value: '_id', label: 'name' }"
                          :model-value="field.value"
                          :error="errorMessage"
                          :disabled="isSubmitting"
                          @update:model-value="handleChange"
                          @blur="handleBlur"
                        />
                      </Field>
                    </div>

                    <!-- Nature Description -->
                    <div class="col-span-12 md:col-span-6">
                      <Field
                        v-slot="{
                          field,
                          errorMessage,
                          handleChange,
                          handleBlur,
                        }"
                        name="broadcastAuthorization.natureDescription"
                      >
                        <BaseInput
                          label="Description de la nature"
                          icon="ph:note-duotone"
                          placeholder=""
                          :model-value="field.value"
                          :error="errorMessage"
                          :disabled="isSubmitting"
                          @update:model-value="handleChange"
                          @blur="handleBlur"
                        />
                      </Field>
                    </div>

                    <!-- Date -->
                    <div class="col-span-12 md:col-span-6">
                      <Field
                        v-slot="{
                          field,
                          errorMessage,
                          handleChange,
                          handleBlur,
                        }"
                        name="broadcastAuthorization.date"
                      >
                        <BaseInput
                          label="Date"
                          type="date"
                          icon="ph:calendar-duotone"
                          placeholder=""
                          :model-value="field.value"
                          :error="errorMessage"
                          :disabled="isSubmitting"
                          @update:model-value="handleChange"
                          @blur="handleBlur"
                        />
                      </Field>
                    </div>

                    <!-- Start Date -->
                    <div class="col-span-12 md:col-span-6">
                      <Field
                        v-slot="{
                          field,
                          errorMessage,
                          handleChange,
                          handleBlur,
                        }"
                        name="broadcastAuthorization.startDate"
                      >
                        <BaseInput
                          label="Date de début"
                          type="date"
                          icon="ph:calendar-duotone"
                          placeholder=""
                          :model-value="field.value"
                          :error="errorMessage"
                          :disabled="isSubmitting"
                          @update:model-valuthe submit fuction is not called beccuase it should at list print that consol in it onsubmit, when i click on the submit button nothing happens we can try to verify that the submit function is called:the submit fuction is not called beccuase it should at list print that consol in it onsubmit, when i click on the submit button nothing happens we can try to verify that the submit function is called:e="handleChange"
                          @blur="handleBlur"
                        />
                      </Field>
                    </div>

                    <!-- End Date -->
                    <div class="col-span-12 md:col-span-6">
                      <Field
                        v-slot="{
                          field,
                          errorMessage,
                          handleChange,
                          handleBlur,
                        }"
                        name="broadcastAuthorization.endDate"
                      >
                        <BaseInput
                          label="Date de fin"
                          type="date"
                          icon="ph:calendar-duotone"
                          placeholder=""
                          :model-value="field.value"
                          :error="errorMessage"
                          :disabled="isSubmitting"
                          @update:model-value="handleChange"
                          @blur="handleBlur"
                        />
                      </Field>
                    </div>

                    <!-- Payment Method -->
                    <div class="col-span-12 md:col-span-6">
                      <Field
                        v-slot="{
                          field,
                          errorMessage,
                          handleChange,
                          handleBlur,
                        }"
                        name="broadcastAuthorization.paymentMethod"
                      >
                        <BaseListbox
                          label="Méthode de paiement"
                          :items="paymentMethods.data"
                          :properties="{ value: '_id', label: 'label' }"
                          :model-value="field.value"
                          :error="errorMessage"
                          :disabled="isSubmitting"
                          @update:model-value="handleChange"
                          @blur="handleBlur"
                        />
                      </Field>
                    </div>

                    <!-- Duration -->
                    <div class="col-span-12 md:col-span-6">
                      <Field
                        v-slot="{
                          field,
                          errorMessage,
                          handleChange,
                          handleBlur,
                        }"
                        name="broadcastAuthorization.duration"
                      >
                        <BaseInput
                          label="Durée (en minutes)"
                          type="number"
                          icon="ph:clock-duotone"
                          placeholder=""
                          :model-value="field.value"
                          :error="errorMessage"
                          :disabled="isSubmitting"
                          @update:model-value="handleChange"
                          @blur="handleBlur"
                        />
                      </Field>
                    </div>

                    <!-- Hour -->
                    <div class="col-span-12 md:col-span-6">
                      <Field
                        v-slot="{
                          field,
                          errorMessage,
                          handleChange,
                          handleBlur,
                        }"
                        name="broadcastAuthorization.hour"
                      >
                        <BaseInput
                          label="Heure"
                          type="time"
                          icon="ph:clock-duotone"
                          placeholder=""
                          :model-value="field.value"
                          :error="errorMessage"
                          :disabled="isSubmitting"
                          @update:model-value="handleChange"
                          @blur="handleBlur"
                        />
                      </Field>
                    </div>

                    <!-- Hours -->
                    <div class="col-span-12 md:col-span-6">
                      <Field
                        v-slot="{ field, errorMessage, handleChange, handleBlur }"
                        name="broadcastAuthorization.hours"
                      >
                        <div>
                          <BaseInput
                            label="Hours"
                            icon="ph:clock-duotone"
                            placeholder="Type a Hours  and press Enter"
                            :model-value="inputValue2"
                            :error="errorMessage"
                            :disabled="isSubmitting"
                            @update:model-value="updateInputValue2"
                            @keydown.enter.prevent="(e) => {
                              if (inputValue2) {
                                addHour1(inputValue2, handleChange)
                                inputValue2 = ''
                              }
                              
                            }"
                            @blur="(e) => handleBlur(e)"
                          />
                          
                          <!-- Display Hours -->
                          <div class="mt-4">
                            <TransitionGroup name="list" tag="ul">
                              <li
                                v-for="(hour, index) in hours"
                                :key="hour"
                                class="inline-flex items-center px-2 py-1 mr-2 mb-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-full"
                              >
                                <span>{{ hour }}</span>
                                <button 
                                  @click="() => removeHour1(index, handleChange)"
                                  class="text-red-500 hover:text-red-700 ml-2"
                                  type="button"
                                >
                                  ×
                                </button>
                              </li>
                            </TransitionGroup>
                          </div>
                        </div>
                      </Field>
                    </div>

                    <!-- Real Hour -->
                    <div class="col-span-12 md:col-span-6">
                      <Field
                        v-slot="{ field, errorMessage, handleChange, handleBlur }"
                        name="broadcastAuthorization.realHours"
                      >
                        <div>
                          <BaseInput
                            label="Real Hours"
                            icon="ph:clock-duotone"
                            placeholder="Type a Real Hours  and press Enter"
                            :model-value="inputValue3"
                            :error="errorMessage"
                            :disabled="isSubmitting"
                            @update:model-value="updateInputValue3"
                            @keydown.enter.prevent="(e) => {
                              if (inputValue3) {
                                addrealHour1(inputValue3, handleChange)
                                inputValue3 = ''
                              }
                              
                            }"
                            @blur="(e) => handleBlur(e)"
                          />
                          
                          <!-- Display Real  Hours -->
                          <div class="mt-4">
                            <TransitionGroup name="list" tag="ul">
                              <li
                                v-for="(realHour, index) in realHours"
                                :key="realHour"
                                class="inline-flex items-center px-2 py-1 mr-2 mb-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-full"
                              >
                                <span>{{ realHour }}</span>
                                <button 
                                  @click="() => removerealHour1(index, handleChange)"
                                  class="text-red-500 hover:text-red-700 ml-2"
                                  type="button"
                                >
                                  ×
                                </button>
                              </li>
                            </TransitionGroup>
                          </div>
                        </div>
                      </Field>
                    </div>

                    <!-- Description -->
                    <div class="col-span-12 md:col-span-6">
                      <Field
                        v-slot="{
                          field,
                          errorMessage,
                          handleChange,
                          handleBlur,
                        }"
                        name="broadcastAuthorization.description"
                      >
                        <BaseTextarea
                          label="Description"
                          icon="ph:note-duotone"
                          placeholder=""
                          :model-value="field.value"
                          :error="errorMessage"
                          :disabled="isSubmitting"
                          @update:model-value="handleChange"
                          @blur="handleBlur"
                        />
                      </Field>
                    </div>

                    
                    <!-- Participants -->

                    <div class="col-span-12 md:col-span-6">
                      <Field
                        v-slot="{ field, errorMessage, handleChange, handleBlur }"
                        name="broadcastAuthorization.participants"
                      >
                        <div>
                          <BaseInput
                            label="Participants"
                            icon="ph:user"
                            placeholder="Type a Participants Names and press Enter"
                            :model-value="inputValue"
                            :error="errorMessage"
                            :disabled="isSubmitting"
                            @update:model-value="updateInputValue"
                            @keydown.enter.prevent="(e) => {
                              if (inputValue) {
                                addParticipant1(inputValue, handleChange)
                                inputValue = ''
                              }
                              
                            }"
                            @blur="(e) => handleBlur(e)"
                          />
                          
                          <!-- Display Participants -->
                          <div class="mt-4">
                            <TransitionGroup name="list" tag="ul">
                              <li
                                v-for="(participant, index) in participants"
                                :key="participant"
                                class="inline-flex items-center px-2 py-1 mr-2 mb-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-full"
                              >
                                <span>{{ participant }}</span>
                                <button 
                                  @click="() => removeParticipant1(index, handleChange)"
                                  class="text-red-500 hover:text-red-700 ml-2"
                                  type="button"
                                >
                                  ×
                                </button>
                              </li>
                            </TransitionGroup>
                          </div>
                        </div>
                      </Field>
                    </div>
                        
                                        
                     <!-- Questions Input -->
                     <div class="col-span-12 md:col-span-6">
                      <Field
                        v-slot="{ field, errorMessage, handleChange, handleBlur }"
                        name="broadcastAuthorization.questions"
                      >
                        <div>
                          <BaseInput
                            label="Questions"
                            icon="ph:question-duotone"
                            placeholder="Type a Questions  and press Enter"
                            :model-value="inputValue1"
                            :error="errorMessage"
                            :disabled="isSubmitting"
                            @update:model-value="updateInputValue1"
                            @keydown.enter.prevent="(e) => {
                              if (inputValue1) {
                                addQuestion1(inputValue1, handleChange)
                                inputValue1 = ''
                              }
                              
                            }"
                            @blur="(e) => handleBlur(e)"
                          />
                          
                          <!-- Display Questions -->
                          <div class="mt-4">
                            <TransitionGroup name="list" tag="ul">
                              <li
                                v-for="(question, index) in questions"
                                :key="question"
                                class="inline-flex items-center px-2 py-1 mr-2 mb-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-full"
                              >
                                <span>{{ question }}</span>
                                <button 
                                  @click="() => removeQuestion1(index, handleChange)"
                                  class="text-red-500 hover:text-red-700 ml-2"
                                  type="button"
                                >
                                  ×
                                </button>
                              </li>
                            </TransitionGroup>
                          </div>
                        </div>
                      </Field>
                    </div>


                    <!-- Note -->
                    <div class="col-span-12 md:col-span-6">
                      <Field
                        v-slot="{
                          field,
                          errorMessage,
                          handleChange,
                          handleBlur,
                        }"
                        name="broadcastAuthorization.note"
                      >
                        <BaseTextarea
                          label="Note"
                          icon="ph:note-duotone"
                          placeholder=""
                          :model-value="field.value"
                          :error="errorMessage"
                          :disabled="isSubmitting"
                          @update:model-value="handleChange"
                          @blur="handleBlur"
                        />
                      </Field>
                    </div>

                    <!-- Service in Charge -->
                    <div class="col-span-12 md:col-span-6">
                      <Field
                        v-slot="{
                          field,
                          errorMessage,
                          handleChange,
                          handleBlur,
                        }"
                        name="broadcastAuthorization.serviceInCharge"
                      >
                        <BaseInput
                          label="Service en charge"
                          icon="ph:buildings-duotone"
                          placeholder=""
                          :model-value="field.value"
                          :error="errorMessage"
                          :disabled="isSubmitting"
                          @update:model-value="handleChange"
                          @blur="handleBlur"
                        />
                      </Field>
                    </div>

                    <!-- Validator -->
                    <div class="col-span-12 md:col-span-6">
                      <Field
                        v-slot="{
                          field,
                          errorMessage,
                          handleChange,
                          handleBlur,
                        }"
                        name="broadcastAuthorization.validator"
                      >
                        <BaseListbox
                          label="Validateur"
                          :items="validators.data"
                          :properties="{ value: '_id', label: 'name' }"
                          :model-value="field.value"
                          :error="errorMessage"
                          :disabled="isSubmitting"
                          @update:model-value="handleChange"
                          @blur="handleBlur"
                        />
                      </Field>
                    </div>

                    <!-- Admin Validator -->
                    <div class="col-span-12 md:col-span-6">
                      <Field
                        v-slot="{
                          field,
                          errorMessage,
                          handleChange,
                          handleBlur,
                        }"
                        name="broadcastAuthorization.admiValidator"
                      >
                        <BaseListbox
                          label="Validateur Admin"
                          :items="validators.data"
                          :properties="{ value: '_id', label: 'name' }"
                          :model-value="field.value"
                          :error="errorMessage"
                          :disabled="isSubmitting"
                          @update:model-value="handleChange"
                          @blur="handleBlur"
                        />
                      </Field>
                    </div>

                    <!-- Location -->
                    <div class="col-span-12 md:col-span-6">
                      <Field
                        v-slot="{
                          field,
                          errorMessage,
                          handleChange,
                          handleBlur,
                        }"
                        name="broadcastAuthorization.location"
                      >
                        <BaseInput
                          label="Location"
                          icon="ph:map-pin-duotone"
                          placeholder=""
                          :model-value="field.value"
                          :error="errorMessage"
                          :disabled="isSubmitting"
                          @update:model-value="handleChange"
                          @blur="handleBlur"
                        />
                      </Field>
                    </div>

                    <!-- Commercials -->
                    
                    <div class="col-span-12 md:col-span-6">
                      <Field
                        v-slot="{ field, errorMessage, handleChange, handleBlur }"
                        name="broadcastAuthorization.commercials"
                        :value="selectedCommercials"
                      >
                        <div>
                          <label class="block text-sm font-medium text-gray-700">Commercials</label>
                          <div class="mt-1">
                            <select
                              :value="selectedCommercials"
                              multiple
                              class="mt-1 block w-full rounded-md bg-[#0f172a] border border--color-[#64748b] focus:ring-indigo-500 sm:text-sm burder-muted-30"
                              @change="(e) => handleCommercialChange(e, handleChange)"
                              @blur="handleBlur"
                            >
                              <option
                                v-for="commercial in commercialsList"
                                :key="commercial._id"
                                :value="commercial._id"
                              >
                                {{ commercial.name }}
                              </option>
                            </select>
                          </div>
                          <!-- Display selected Commercials -->
                          <div class="mt-2">
                            <div
                              v-for="commercialId in selectedCommercials"
                              :key="commercialId"
                              class="inline-flex items-center px-2 py-1 mr-2 mb-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-full"
                            >
                              {{ commercialsList.find(commercial => commercial._id === commercialId)?.name }}
                              <button
                                type="button"
                                class="ml-2 text-gray-500 hover:text-gray-700"
                                @click="() => removeCommercial(commercialId, handleChange)"
                              >
                                ×
                              </button>
                            </div>
                          </div>
                          <!-- Error message -->
                          <p v-if="errorMessage" class="mt-2 text-sm text-red-600">
                            {{ errorMessage }}
                          </p>
                        </div>
                      </Field>
                    </div>

                    <!-- Contact Details -->
                    <div class="col-span-12 md:col-span-6">
                      <Field
                        v-slot="{
                          field,
                          errorMessage,
                          handleChange,
                          handleBlur,
                        }"
                        name="broadcastAuthorization.contactDetails"
                      >
                        <BaseInput
                          label="Coordonnées"
                          icon="ph:phone-duotone"
                          placeholder=""
                          :model-value="field.value"
                          :error="errorMessage"
                          :disabled="isSubmitting"
                          @update:model-value="handleChange"
                          @blur="handleBlur"
                        />
                      </Field>
                    </div>

                    <!-- Production Partner -->
                    <div class="col-span-12 md:col-span-6">
                      <Field
                        v-slot="{
                          field,
                          errorMessage,
                          handleChange,
                          handleBlur,
                        }"
                        name="broadcastAuthorization.productionPartner"
                      >
                        <BaseInput
                          label="Partenaire de production"
                          icon="ph:handshake-duotone"
                          :model-value="field.value"
                          :error="errorMessage"
                          :disabled="isSubmitting"
                          @update:model-value="handleChange"
                          @blur="handleBlur"
                        />
                      </Field>
                    </div>

                    <!-- Other Production Partner -->
                    <div class="col-span-12 md:col-span-6">
                      <Field
                        v-slot="{
                          field,
                          errorMessage,
                          handleChange,
                          handleBlur,
                        }"
                        name="broadcastAuthorization.otherProductionPartner"
                      >
                        <BaseInput
                          label="Autre partenaire de production"
                          icon="ph:handshake-duotone"
                          placeholder=""
                          :model-value="field.value"
                          :error="errorMessage"
                          :disabled="isSubmitting"
                          @update:model-value="handleChange"
                          @blur="handleBlur"
                        />
                      </Field>
                    </div>

                    <!-- Key Contact -->
                    <div class="col-span-12 md:col-span-6">
                      <Field
                        v-slot="{
                          field,
                          errorMessage,
                          handleChange,
                          handleBlur,
                        }"
                        name="broadcastAuthorization.keyContact"
                      >
                        <BaseInput
                          label="Contact clé"
                          icon="ph:phone-duotone"
                          :model-value="field.value"
                          :error="errorMessage"
                          :disabled="isSubmitting"
                          @update:model-value="handleChange"
                          @blur="handleBlur"
                        />
                      </Field>
                    </div>

                    <!-- Other Key Contact -->
                    <div class="col-span-12 md:col-span-6">
                      <Field
                        v-slot="{
                          field,
                          errorMessage,
                          handleChange,
                          handleBlur,
                        }"
                        name="broadcastAuthorization.otherKeyContact"
                      >
                        <BaseInput
                          label="Autre contact clé"
                          icon="ph:user-duotone"
                          placeholder=""
                          :model-value="field.value"
                          :error="errorMessage"
                          :disabled="isSubmitting"
                          @update:model-value="handleChange"
                          @blur="handleBlur"
                        />
                      </Field>
                    </div>

                    <!-- Contact Details to Show -->
                    <div class="col-span-12 md:col-span-6">
                      <Field
                        v-slot="{
                          field,
                          errorMessage,
                          handleChange,
                          handleBlur,
                        }"
                        name="broadcastAuthorization.contactDetailsToShow"
                      >
                        <BaseInput
                          label="Coordonnées à afficher"
                          icon="ph:phone-duotone"
                          placeholder=""
                          :model-value="field.value"
                          :error="errorMessage"
                          :disabled="isSubmitting"
                          @update:model-value="handleChange"
                          @blur="handleBlur"
                        />
                      </Field>
                    </div>

                  </div>
                </div>
              </div>

                <!-- Submit Button -->
                <div class="mt-6 bp-6">
                  <BaseButton
                    type="submit"
                    color="primary"
                    class="w-full sm:w-48"
                    :disabled="isSubmitting"
                    @click="() => console.log('Button clicked')"
                  >
                    <span v-if="!isSubmitting">Submit</span>
                    <span v-else>Submitting...</span>
                  </BaseButton>
                  </div>

          </div>
          </form>
        </BaseCard>
      </div>
    </TairoContentWrapper>
  </div>
</template>