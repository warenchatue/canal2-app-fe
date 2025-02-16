exchange file


<script>
//Payment methods
const { data: paymentMethod } = await useFetch('/api/accountancy/payment-methods', {
  query: queryNF,
});
console.log('Invoices API Response:', paymentMethod.value);
const paymentMethodList = computed(() => {
  if (!paymentMethod.value || !Array.isArray(paymentMethod.value.data)) {
    return [];
  }
  return paymentMethod.value.data.map(item => ({
    _id: item._id, // Ensure this field exists in the API response
    label: item.label
  }));
});


//""""""""""""""""""""""""""""""""""""""""""""""js""""""""""""""""""""""""""""""""""""""""""""""""""""

const { data: users } = await useFetch('/api/accountancy/payment-methods', {
  query: queryNF,
});
console.log('Users API Response:', users.value);

const usersList = computed(() => {
  if (!users.value || !Array.isArray(users.value.data)) {
    return [];
  }
  return users.value.data.map(item => ({
    _id: item._id, // Ensure this field exists in the API response
    name: item.label
  }));
});

// Store selected participant IDs
const selectedParticipants = ref([]);
const emit = defineEmits(['update:participants']);
function handleParticipantChange(event) {
  const selectedOptions = Array.from(event.target.selectedOptions).map(
    option => option.value
  );
  selectedParticipants.value = [...new Set([...selectedParticipants.value, ...selectedOptions])];
  emit('update:participants', selectedParticipants.value);
}
function removeParticipant(participantId) {
  selectedParticipants.value = selectedParticipants.value.filter(
    id => id !== participantId
  );
  emit('update:participants', selectedParticipants.value);
}

//""""""""""""""""""""""""""""""""""""""""""""""js""""""""""""""""""""""""""""""""""""""""""""""""""""
</script>
<template>
                        <div class="col-span-12 md:col-span-12">
                          <Field
                            v-slot="{ field, errorMessage, handleChange, handleBlur }"
                            name="broadcastAuthorization.participants"
                          >
                            <div>
                              <label class="block text-sm font-medium text-gray-700">Participants</label>
                              <div class="mt-1">
                                <!-- Multi-select dropdown -->
                                <select
                                  :value="selectedParticipants"
                                  multiple
                                  class="mt-1 block w-full rounded-md bg-[#0f172a] border border--color-[#64748b] focus:ring-indigo-500 sm:text-sm burder-muted-30"
                                  @change="handleParticipantChange"
                                  @blur="handleBlur"
                                >
                                  <option
                                    v-for="user in usersList"
                                    :key="user._id"
                                    :value="user._id"
                                  >
                                    {{ user.name }}
                                  </option>
                                </select>
                              </div>
                              <!-- Display selected participants -->
                              <div class="mt-2">
                                <div
                                  v-for="participantId in selectedParticipants"
                                  :key="participantId"
                                  class="inline-flex items-center px-2 py-1 mr-2 mb-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-full"
                                >
                                  {{ usersList.find(user => user._id === participantId)?.name }}
                                  <button
                                    type="button"
                                    class="ml-2 text-gray-500 hover:text-gray-700"
                                    @click="removeParticipant(participantId)"
                                  >
                                    &times;
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

                      </template>