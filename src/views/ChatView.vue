<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useChatsStore } from '@/stores/chats';
import ModelSettings from '@/components/ModelSettings.vue';
import axios from 'axios';

const route = useRoute();
const router = useRouter();
const chatsStore = useChatsStore();
const newMessage = ref('');
const sending = ref(false);
const showSettings = ref(false);

onMounted(async () => {
  await chatsStore.loadChats();
  const chat = chatsStore.chats.find(c => c.id === route.params.id);
  if (!chat) {
    router.push('/');
    return;
  }
  chatsStore.currentChat = chat;
});

const sendMessage = async () => {
  if (!newMessage.value.trim() || !chatsStore.currentChat) return;

  const userMessage = {
    role: 'user' as const,
    content: newMessage.value,
  };

  await chatsStore.addMessage(chatsStore.currentChat.id, userMessage);
  newMessage.value = '';
  sending.value = true;

  try {
    const response = await axios.post('http://localhost:1234/v1/chat/completions', {
      model: chatsStore.currentChat.modelId,
      messages: chatsStore.currentChat.messages,
      ...chatsStore.currentChat.settings,
    });

    const assistantMessage = {
      role: 'assistant' as const,
      content: response.data.choices[0].message.content,
    };

    await chatsStore.addMessage(chatsStore.currentChat.id, assistantMessage);
  } catch (error) {
    console.error('Erreur lors de l\'envoi du message:', error);
  } finally {
    sending.value = false;
  }
};
</script>

<template>
  <div class="container mx-auto h-screen flex flex-col">
    <div class="flex justify-between items-center p-4 border-b">
      <div class="flex items-center gap-4">
        <h1 class="text-xl font-semibold">
          {{ chatsStore.currentChat?.title }}
        </h1>
        <button
          @click="showSettings = !showSettings"
          class="text-gray-600 hover:text-gray-800"
        >
          ⚙️ Paramètres
        </button>
      </div>
      <router-link to="/" class="text-blue-500 hover:text-blue-600">
        Retour
      </router-link>
    </div>

    <div class="flex-1 overflow-y-auto p-4">
      <div v-if="showSettings" class="mb-4">
        <ModelSettings :chat-id="route.params.id as string" />
      </div>

      <div class="space-y-4">
        <div
          v-for="(message, index) in chatsStore.currentChat?.messages"
          :key="index"
          :class="[
            'p-4 rounded-lg max-w-3xl',
            message.role === 'user'
              ? 'bg-blue-100 ml-auto'
              : 'bg-gray-100'
          ]"
        >
          <p class="whitespace-pre-wrap">{{ message.content }}</p>
        </div>
      </div>
    </div>

    <div class="p-4 border-t">
      <form @submit.prevent="sendMessage" class="flex gap-2">
        <input
          v-model="newMessage"
          type="text"
          placeholder="Votre message..."
          class="flex-1 px-4 py-2 border rounded-lg"
          :disabled="sending"
        />
        <button
          type="submit"
          class="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 disabled:opacity-50"
          :disabled="sending || !newMessage.trim()"
        >
          {{ sending ? 'Envoi...' : 'Envoyer' }}
        </button>
      </form>
    </div>
  </div>
</template>