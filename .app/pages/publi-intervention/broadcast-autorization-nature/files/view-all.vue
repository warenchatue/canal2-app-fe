<template>
  <div class="max-w-screen-lg mx-auto py-10">
    <h1 class="text-4xl font-bold text-center mb-5">All Broadcast Authorizations Nature</h1>
    <div class="bg-[#f1f1f1] p-10 rounded-md space-y-3 shadow-md">
      <table class="min-w-full bg-white">
        <thead>
          <tr>
            <th class="py-2 px-4 border-b">Anouncer</th>
            <th class="py-2 px-4 border-b">Type</th>
            <th class="py-2 px-4 border-b">Program</th>
            <th class="py-2 px-4 border-b">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="authorization in broadcastAuthorizations" :key="authorization.id">
            <td class="py-2 px-4 border-b">{{ authorization.anouncer }}</td>
            <td class="py-2 px-4 border-b">{{ authorization.type }}</td>
            <td class="py-2 px-4 border-b">{{ authorization.program }}</td>
            <td class="py-2 px-4 border-b">
              <UButton @click="viewBroadcastAuthorization(authorization.id)" class="mt-3">View</UButton>
              <UButton @click="editBroadcastAuthorization(authorization.id)" class="mt-3">Edit</UButton>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- View Modal -->
    <Modal :visible="isViewModalVisible" @close="isViewModalVisible = false">
      <div class="max-w-screen-sm mx-auto py-10">
        <h1 class="text-4xl font-bold text-center mb-5">Broadcast Authorization Nature</h1>
        <div class="bg-[#f1f1f1] p-10 rounded-md space-y-3 shadow-md">
          <p><strong>Anouncer:</strong> {{ selectedAuthorization.anouncer }}</p>
          <p><strong>Type:</strong> {{ selectedAuthorization.type }}</p>
          <p><strong>Program:</strong> {{ selectedAuthorization.program }}</p>
        </div>
      </div>
    </Modal>

    <!-- Edit Modal -->
    <Modal :visible="isEditModalVisible" @close="isEditModalVisible = false">
      <div class="max-w-screen-sm mx-auto py-10">
        <UForm @submit="onSubmit" class="bg-[#f1f1f1] p-10 rounded-md space-y-3 shadow-md">
          <h1 class="text-4xl font-bold text-center mb-5">Edit Broadcast Authorization Nature</h1>
    
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
        </UForm>
      </div>
    </Modal>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { toTypedSchema } from '@vee-validate/zod';
import { Field, useForm } from 'vee-validate';
import { z } from 'zod';
import Modal from '@/components/Modal.vue';

const broadcastAuthorizations = ref([]);
const selectedAuthorization = ref({
  anouncer: '',
  type: '',
  program: '',
});

const isViewModalVisible = ref(false);
const isEditModalVisible = ref(false);

const programOptions = ref([]);
const typeOptions = ref([
  { value: 'PUIB', label: 'PUIB' },
  { value: 'PAD', label: 'PAD' },
  { value: 'ProgramIntervention', label: 'ProgramIntervention' },
]);

const router = useRouter();

onMounted(async () => {
  try {
    const response = await fetch('https://api.example.com/broadcast-authorization-nature');
    const data = await response.json();
    broadcastAuthorizations.value = data;
  } catch (error) {
    console.error('Error fetching data:', error);
  }
});

const viewBroadcastAuthorization = async (id) => {
  try {
    const response = await fetch(`https://api.example.com/broadcast-authorization-nature/${id}`);
    const data = await response.json();
    selectedAuthorization.value = data;
    isViewModalVisible.value = true;
  } catch (error) {
    console.error('Error fetching data:', error);
  }
};

const editBroadcastAuthorization = async (id) => {
  try {
    const response = await fetch(`https://api.example.com/broadcast-authorization-nature/${id}`);
    const data = await response.json();
    selectedAuthorization.value = data;
    Object.assign(initialValues, data);
    isEditModalVisible.value = true;
  } catch (error) {
    console.error('Error fetching data:', error);
  }
};

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
const initialValues: FormInput = {
  anouncer: '',
  type: '',
  program: '',
};

const { handleSubmit, setErrors } = useForm({
  validationSchema,
  initialValues,
});

const onSubmit = handleSubmit(async (values) => {
  // Handle form submission logic here
  console.log(values);
  router.push('/publi-intervention/broadcast-authorization-nature');
});
</script>

<style lang="scss" scoped>
/* Add any additional styles for the table here */
</style>