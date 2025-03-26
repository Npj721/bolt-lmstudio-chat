<script setup lang="ts">
import { onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useModelsStore } from '@/stores/models';
import { useChatsStore } from '@/stores/chats';

const router = useRouter();
const modelsStore = useModelsStore();
const chatsStore = useChatsStore();

onMounted(async () => {
  await modelsStore.fetchModels();
  await chatsStore.loadChats();
});

const startNewChat = async (modelId: string) => {
  const chat = await chatsStore.createChat(modelId);
  router.push(`/chat/${chat.id}`);
};
</script>

<template>
  <div class="container mx-auto px-4 py-8">
    <h1 class="text-3xl font-bold mb-8">LM Studio Chat</h1>

    <div v-if="modelsStore.loading" class="text-center">
      Chargement des modèles...
    </div>

    <div v-else-if="modelsStore.error" class="text-red-500">
      {{ modelsStore.error }}
    </div>

    <div v-else class="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
      <div
        v-for="model in modelsStore.models"
        :key="model.id"
        class="bg-white p-6 rounded-lg shadow-md"
      >
        <h2 class="text-xl font-semibold mb-4">{{ model.name }}</h2>
        <button
          @click="startNewChat(model.id)"
          class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Nouvelle conversation
        </button>
      </div>
    </div>

    <div class="mt-12">
      <h2 class="text-2xl font-bold mb-4">Conversations récentes</h2>
      <div v-if="chatsStore.chats.length === 0" class="text-gray-500">
        Aucune conversation
      </div>
      <div v-else class="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div
          v-for="chat in chatsStore.chats"
          :key="chat.id"
          class="bg-white p-6 rounded-lg shadow-md"
        >
          <div class="flex justify-between items-start mb-4">
            <h3 class="text-lg font-medium">{{ chat.title }}</h3>
            <button
              @click="chatsStore.deleteChat(chat.id)"
              class="text-red-500 hover:text-red-600"
            >
              Supprimer
            </button>
          </div>
          <p class="text-sm text-gray-500 mb-4">
            {{ new Date(chat.updatedAt).toLocaleDateString() }}
          </p>
          <router-link
            :to="`/chat/${chat.id}`"
            class="text-blue-500 hover:text-blue-600"
          >
            Ouvrir
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>