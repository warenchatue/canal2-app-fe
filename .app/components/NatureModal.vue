<template>
  <TairoModal :open="open" @close="$emit('close')" size="xl" class="mx-auto flex w-full flex-col">
    <template #header>
      <div class="flex w-full items-center justify-between p-4 md:p-6">
        <h3 class="font-heading text-muted-900 text-lg font-medium leading-6 dark:text-white">
          Ajouter une Nature
        </h3>
      </div>
    </template>

    <BaseCard class="w-full">
      <div v-if="feedback.show" :class="`p-4 ${feedback.type === 'success' ? 'bg-green-100' : 'bg-red-100'}`">
        <p :class="`text-sm ${feedback.type === 'success' ? 'text-green-700' : 'text-red-700'}`">
          {{ feedback.message }}
        </p>
      </div>

      <form @submit.prevent="onSubmit" class="divide-muted-200 dark:divide-muted-700">
        <div class="bg-muted-50 dark:bg-muted-800/60 space-y-8 p-5 md:px-5">
          <Field v-slot="{ field, errorMessage, handleChange, handleBlur }" name="name">
            <BaseInput
              label="Nom"
              placeholder="Entrez le nom"
              v-model="field.value"
              :error="errorMessage"
              @update:model-value="handleChange"
              @blur="handleBlur"
            />
          </Field>

          <Field v-slot="{ field, errorMessage, handleChange, handleBlur }" name="type">
            <BaseListbox
              label="Type"
              :items="natureTypes"
              :properties="{ value: 'name', label: 'name' }"
              v-model="field.value"
              :error="errorMessage"
              placeholder="Sélectionnez un type"
              @update:model-value="handleChange"
              @blur="handleBlur"
            />
          </Field>

          <Field v-slot="{ field, errorMessage, handleChange, handleBlur }" name="program_id">
            <BaseListbox
              label="Programme"
              :items="programs?.data"
              :properties="{ value: '_id', label: 'name' }"
              v-model="field.value"
              :disabled="isSubmitting"
              :error="errorMessage"
              placeholder="Sélectionnez un programme"
              @update:model-value="handleChange"
              @blur="handleBlur"
            />
          </Field>
        </div>

        <div class="flex justify-end p-4">
          <BaseButton @click="$emit('close')" color="muted" class="mr-2"> Annuler </BaseButton>
          <BaseButton type="submit" color="primary" :loading="isSubmitting">
            Enregistrer
          </BaseButton>
        </div>
      </form>
    </BaseCard>
  </TairoModal>
</template>

<script setup lang="ts">
import { toTypedSchema } from '@vee-validate/zod';
import { Field, useForm } from 'vee-validate';
import { z } from 'zod';
import { ref, computed } from 'vue';

const feedback = ref({
  show: false,
  type: 'success',
  message: ''
});

const natureTypes = ref([
  { name: 'Publi' },
  { name: 'PAD' },
  { name: 'ProgramIntervantion' },
]);

const natureSchema = z.object({
  name: z.string().min(1, "Name is required"),
  type: z.object({
    name: z.string().min(1, "Type is required")
  }),
  program_id: z.object({
    _id: z.string().min(1, "Program is required")
  }),
});

const { handleSubmit, isSubmitting, resetForm } = useForm({
  validationSchema: toTypedSchema(natureSchema),
  initialValues: {
    name: '',
    type: { name: '' },
    program_id: { _id: '' },
  },
});

const token = useCookie('token');
const queryNF = computed(() => ({
  perPage: 1000,
  page: 1,
  action: 'findAll',
  token: token.value,
}));

const { data: programs } = await useFetch('/api/tv-programs/programs', {
  query: queryNF,
});

const onSubmit = handleSubmit(async (values) => {
  try {
    console.log('Selected Program ID:', values.program_id); // Debugging log
    console.log('Selected Type:', values.type); // Debugging log

    const formData = {
      name: values.name.trim(), // name is a string
      type: values.type.name.trim(), // type is an object with a `name` property
      program_id: values.program_id._id // program_id is an object with an `_id` property
    };

    console.log('Form Data:', formData); // Debugging log

    const response = await fetch('/api/broadcast-auth/broadcast-na', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });

    if (response.status === 201 || response.status === 200 || response.status === 204) {
      showFeedback('success', 'Nature ajoutée avec succès');
      resetForm();
      emit('success');
      setTimeout(() => emit('close'), 1000);
    } else if (response.status === 409) {
      showFeedback('error', 'Cette nature existe déjà dans la base de données');
    } else {
      let errorMessage = 'Échec de l\'enregistrement';
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } catch (e) {
          console.error('Error parsing error response:', e);
        }
      }
      showFeedback('error', errorMessage);
    }
  } catch (error) {
    console.error('Form submission error:', error);
    showFeedback('error', 'Erreur lors de l\'enregistrement. Veuillez réessayer.');
  }
});

const showFeedback = (type: 'success' | 'error', message: string) => {
  feedback.value = {
    show: true,
    type,
    message
  };
  setTimeout(() => {
    feedback.value.show = false;
  }, 3000);
};

defineProps({
  open: {
    type: Boolean,
    required: true,
  },
});
</script>