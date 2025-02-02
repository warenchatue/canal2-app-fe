<template>
  <div class="max-w-screen-sm mx-auto py-10">
    <h1 class="text-4xl font-bold text-center mb-5">Broadcast Authorization Nature</h1>
    <div class="bg-[#f1f1f1] p-10 rounded-md space-y-3 shadow-md">
      <p><strong>Anouncer:</strong> {{ broadcastAuthorization.anouncer }}</p>
      <p><strong>Type:</strong> {{ broadcastAuthorization.type }}</p>
      <p><strong>Program:</strong> {{ broadcastAuthorization.program }}</p>
    </div>
    <UButton @click="editBroadcastAuthorization" class="w-full mt-3">Edit</UButton>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';

const broadcastAuthorization = ref({
  anouncer: '',
  type: '',
  program: '',
});

const route = useRoute();
const router = useRouter();
const { id } = route.params;

onMounted(async () => {
  try {
    const response = await fetch(`https://api.example.com/broadcast-authorization-nature/${id}`);
    const data = await response.json();
    broadcastAuthorization.value = data;
  } catch (error) {
    console.error('Error fetching data:', error);
  }
});

const editBroadcastAuthorization = () => {
  router.push(`/publi-intervention/broadcast-authorization-nature/edit/${id}`);
};
</script>

<style lang="scss" scoped>
</style>