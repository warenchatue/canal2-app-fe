<template>
  <Modal :visible="isModalVisible" @close="isModalVisible = false">
    <div class="max-w-screen-sm mx-auto py-10">
      <UForm @submit="onSubmit" class="bg-[#f1f1f1] p-10 rounded-md space-y-3 shadow-md">
        <h1 class="text-4xl font-bold text-center mb-5">Broadcast Authorization Nature</h1>
  
        <UFormGroup size="lg" name="Anouncer" label="Anouncer">
          <Field name="anouncer" as="UInput" placeholder="MTN Cameroon" icon="i-heroicons-envelope" />
        </UFormGroup>
  
        <UFormGroup size="lg" name="Type" label="Type">
          <Field name="type" as="USelect" :options="typeOptions" placeholder="Select Type" />
        </UFormGroup>
  
        <UFormGroup size="lg" name="Program" label="Program">
          <Field name="program" as="USelect" :options="programOptions" placeholder="Select Program" />
        </UFormGroup>
        
        <UButton type="submit" class="w-full">Submit</UButton>
        <UButton @click="openEditModal" class="w-full mt-3">Edit</UButton>

        <Modal :visible="isEditModalVisible" @close="isEditModalVisible = false">
          <div class="max-w-screen-sm mx-auto py-10">
            <!-- Edit form content goes here -->
          </div>
        </Modal>
      </UForm>
    </div>
  </Modal>
  <button @click="isModalVisible = true">Open Modal</button>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { toTypedSchema } from '@vee-validate/zod';
import { Field, useForm } from 'vee-validate';
import { z } from 'zod';
import Modal from '@/components/Modal.vue';

definePageMeta({
  layout: 'empty',
  title: 'Broadcast Authorization Nature',
  preview: {
    order: 96,
    title: '',
    description: '',
    src: ''
  },
});

const isModalVisible = ref(false);
const isEditModalVisible = ref(false);

const programOptions = ref([]);
const selectedProgram = ref(null);

const typeOptions = ref([
  { value: 'PUIB', label: 'PUIB' },
  { value: 'PAD', label: 'PAD' },
  { value: 'ProgramIntervention', label: 'ProgramIntervention' },
]);

const route = useRoute();
const router = useRouter();
const { id } = route.params;

const VALIDATION_TEXT = {
  ANOUNCER_REQUIRED: 'An announcer is required',
  TYPE_REQUIRED: 'A type is required',
  PROGRAM_REQUIRED: 'A program is required',
};

const zodSchema = z.object({
  anouncer: z.string().nonempty(VALIDATION_TEXT.ANOUNCER_REQUIRED),
  type: z.string().nonempty(VALIDATION_TEXT.TYPE_REQUIRED),
  program: z.string().nonempty(VALIDATION_TEXT.PROGRAM_REQUIRED),
});

type FormInput = z.infer<typeof zodSchema>;

const validationSchema = toTypedSchema(zodSchema);
const initialValues = computed<FormInput>(() => ({
  anouncer: '',
  type: '',
  program: '',
}));

const { handleSubmit, setErrors } = useForm({
  validationSchema,
  initialValues: initialValues.value,
});

onMounted(async () => {
  try {
    const response = await fetch('https://api.example.com/programs');
    const data = await response.json();
    programOptions.value = data.map((program: { id: any; name: any; }) => ({
      value: program.id,
      label: program.name,
    }));
  } catch (error) {
    console.error('Error fetching programs:', error);
  }
});

const onSubmit = handleSubmit(async (values) => {
  // Handle form submission logic here
  console.log(values);
  router.push('/dashboards');
});

const openEditModal = () => {
  isEditModalVisible.value = true;
};
</script>

<style lang="scss" scoped>
</style>