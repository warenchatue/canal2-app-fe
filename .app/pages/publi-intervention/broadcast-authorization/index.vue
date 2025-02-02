<template>
  <div class="max-w-screen-lg mx-auto py-10">
    <h1 class="text-4xl font-bold text-center mb-5">Broadcast Authorization</h1>
    <UForm @submit="onSubmit" class="bg-[#f1f1f1] p-10 rounded-md space-y-3 shadow-md">
      <UFormGroup size="lg" name="announcer" label="Announcer">
        <Field name="announcer" as="USelect" :options="announcerOptions" placeholder="Select Announcer" />
      </UFormGroup>

      <UFormGroup size="lg" name="invoice" label="Invoice">
        <Field name="invoice" as="USelect" :options="invoiceOptions" placeholder="Select Invoice" />
      </UFormGroup>

      <UFormGroup size="lg" name="campaign" label="Campaign">
        <Field name="campaign" as="USelect" :options="campaignOptions" placeholder="Select Campaign" />
      </UFormGroup>

      <UFormGroup size="lg" name="nature" label="Nature">
        <Field name="nature" as="USelect" :options="natureOptions" placeholder="Select Nature" />
      </UFormGroup>

      <UFormGroup size="lg" name="natureDescription" label="Nature Description">
        <Field name="natureDescription" as="UInput" placeholder="Nature Description" />
      </UFormGroup>

      <UFormGroup size="lg" name="date" label="Date">
        <Field name="date" as="UInput" type="date" placeholder="Select Date" />
      </UFormGroup>

      <UFormGroup size="lg" name="startDate" label="Start Date">
        <Field name="startDate" as="UInput" type="date" placeholder="Select Start Date" />
      </UFormGroup>

      <UFormGroup size="lg" name="endDate" label="End Date">
        <Field name="endDate" as="UInput" type="date" placeholder="Select End Date" />
      </UFormGroup>

      <UFormGroup size="lg" name="paymentMethod" label="Payment Method">
        <Field name="paymentMethod" as="USelect" :options="paymentMethodOptions" placeholder="Select Payment Method" />
      </UFormGroup>

      <UFormGroup size="lg" name="duration" label="Duration (minutes)">
        <Field name="duration" as="UInput" type="number" placeholder="Duration in minutes" />
      </UFormGroup>

      <UFormGroup size="lg" name="hour" label="Hour">
        <Field name="hour" as="UInput" placeholder="Hour" />
      </UFormGroup>

      <UFormGroup size="lg" name="hours" label="Hours">
        <Field name="hours" as="UInput" placeholder="Hours" />
      </UFormGroup>

      <UFormGroup size="lg" name="realHours" label="Real Hours">
        <Field name="realHours" as="UInput" placeholder="Real Hours" />
      </UFormGroup>

      <UFormGroup size="lg" name="realHour" label="Real Hour">
        <Field name="realHour" as="UInput" placeholder="Real Hour" />
      </UFormGroup>

      <UFormGroup size="lg" name="description" label="Description">
        <Field name="description" as="UInput" placeholder="Description" />
      </UFormGroup>

      <UFormGroup size="lg" name="participants" label="Participants">
        <Field name="participants" as="UInput" placeholder="Participants" />
      </UFormGroup>

      <UFormGroup size="lg" name="questions" label="Questions">
        <Field name="questions" as="UInput" placeholder="Questions" />
      </UFormGroup>

      <UFormGroup size="lg" name="note" label="Note">
        <Field name="note" as="UInput" placeholder="Note" />
      </UFormGroup>

      <UFormGroup size="lg" name="serviceInCharge" label="Service In Charge">
        <Field name="serviceInCharge" as="UInput" placeholder="Service In Charge" />
      </UFormGroup>

      <UFormGroup size="lg" name="validator" label="Validator">
        <Field name="validator" as="USelect" :options="userOptions" placeholder="Select Validator" />
      </UFormGroup>

      <UFormGroup size="lg" name="admiValidator" label="Admin Validator">
        <Field name="admiValidator" as="USelect" :options="userOptions" placeholder="Select Admin Validator" />
      </UFormGroup>

      <UFormGroup size="lg" name="location" label="Location">
        <Field name="location" as="UInput" placeholder="Location" />
      </UFormGroup>

      <UFormGroup size="lg" name="commercials" label="Commercials">
        <Field name="commercials" as="USelect" :options="userOptions" placeholder="Select Commercials" multiple />
      </UFormGroup>

      <UFormGroup size="lg" name="contactDetails" label="Contact Details">
        <Field name="contactDetails" as="UInput" placeholder="Contact Details" />
      </UFormGroup>

      <UFormGroup size="lg" name="productionPartner" label="Production Partner">
        <Field name="productionPartner" as="USelect" :options="productionPartnerOptions" placeholder="Select Production Partner" />
      </UFormGroup>

      <UFormGroup size="lg" name="otherProductionPartner" label="Other Production Partner">
        <Field name="otherProductionPartner" as="UInput" placeholder="Other Production Partner" />
      </UFormGroup>

      <UFormGroup size="lg" name="keyContact" label="Key Contact">
        <Field name="keyContact" as="USelect" :options="userOptions" placeholder="Select Key Contact" />
      </UFormGroup>

      <UFormGroup size="lg" name="otherKeyContact" label="Other Key Contact">
        <Field name="otherKeyContact" as="UInput" placeholder="Other Key Contact" />
      </UFormGroup>

      <UFormGroup size="lg" name="contactDetailsToShow" label="Contact Details To Show">
        <Field name="contactDetailsToShow" as="UInput" placeholder="Contact Details To Show" />
      </UFormGroup>

      <UButton type="submit" class="w-full">Submit</UButton>
    </UForm>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { toTypedSchema } from '@vee-validate/zod';
import { Field, useForm } from 'vee-validate';
import { z } from 'zod';

const announcerOptions = ref([]);
const invoiceOptions = ref([]);
const campaignOptions = ref([]);
const natureOptions = ref([]);
const paymentMethodOptions = ref([]);
const userOptions = ref([]);
const productionPartnerOptions = ref([]);

const route = useRoute();
const router = useRouter();
const { id } = route.params;

const VALIDATION_TEXT = {
  NATURE_REQUIRED: 'Nature is required',
  LOCATION_REQUIRED: 'Location is required',
};

const zodSchema = z.object({
  announcer: z.string().nonempty('Announcer is required'),
  invoice: z.string().nonempty('Invoice is required'),
  campaign: z.string().nonempty('Campaign is required'),
  nature: z.string().nonempty(VALIDATION_TEXT.NATURE_REQUIRED),
  natureDescription: z.string().optional(),
  date: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  paymentMethod: z.string().optional(),
  duration: z.number().optional(),
  hour: z.string().optional(),
  hours: z.array(z.string()).optional(),
  realHours: z.array(z.string()).optional(),
  realHour: z.string().optional(),
  description: z.string().optional(),
  participants: z.string().optional(),
  questions: z.string().optional(),
  note: z.string().optional(),
  serviceInCharge: z.string().optional(),
  validator: z.string().optional(),
  admiValidator: z.string().optional(),
  location: z.string().nonempty(VALIDATION_TEXT.LOCATION_REQUIRED),
  commercials: z.array(z.string()).optional(),
  contactDetails: z.string().optional(),
  productionPartner: z.string().optional(),
  otherProductionPartner: z.string().optional(),
  keyContact: z.string().optional(),
  otherKeyContact: z.string().optional(),
  contactDetailsToShow: z.string().optional(),
});

type FormInput = z.infer<typeof zodSchema>;

const validationSchema = toTypedSchema(zodSchema);
const initialValues = computed<FormInput>(() => ({
  announcer: '',
  invoice: '',
  campaign: '',
  nature: '',
  natureDescription: '',
  date: '',
  startDate: '',
  endDate: '',
  paymentMethod: '',
  duration: 0,
  hour: '',
  hours: [],
  realHours: [],
  realHour: '',
  description: '',
  participants: '',
  questions: '',
  note: '',
  serviceInCharge: '',
  validator: '',
  admiValidator: '',
  location: '',
  commercials: [],
  contactDetails: '',
  productionPartner: '',
  otherProductionPartner: '',
  keyContact: '',
  otherKeyContact: '',
  contactDetailsToShow: '',
}));

const { handleSubmit, setErrors } = useForm({
  validationSchema,
  initialValues: initialValues.value,
});

onMounted(async () => {
  try {
    // Fetch options for select fields
    const [announcerRes, invoiceRes, campaignRes, natureRes, paymentMethodRes, userRes, productionPartnerRes] = await Promise.all([
      fetch('https://api.example.com/announcers'),
      fetch('https://api.example.com/invoices'),
      fetch('https://api.example.com/campaigns'),
      fetch('https://api.example.com/natures'),
      fetch('https://api.example.com/payment-methods'),
      fetch('https://api.example.com/users'),
      fetch('https://api.example.com/production-partners'),
    ]);

    announcerOptions.value = await announcerRes.json();
    invoiceOptions.value = await invoiceRes.json();
    campaignOptions.value = await campaignRes.json();
    natureOptions.value = await natureRes.json();
    paymentMethodOptions.value = await paymentMethodRes.json();
    userOptions.value = await userRes.json();
    productionPartnerOptions.value = await productionPartnerRes.json();

    if (id) {
      const response = await fetch(`https://api.example.com/broadcast-authorization/${id}`);
      const data = await response.json();
      Object.assign(initialValues.value, data);
    }
  } catch (error) {
    console.error('Error fetching data:', error);
  }
});

const onSubmit = handleSubmit(async (values) => {
  try {
    const response = await fetch(`https://api.example.com/broadcast-authorization${id ? `/${id}` : ''}`, {
      method: id ? 'PUT' : 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(values),
    });

    if (!response.ok) {
      const errorData = await response.json();
      setErrors(errorData.errors);
      return;
    }

    router.push('/publi-intervention/broadcast-authorization');
  } catch (error) {
    console.error('Error submitting form:', error);
  }
});
</script>

<style lang="scss" scoped>
/* Add any additional styles here */
</style>