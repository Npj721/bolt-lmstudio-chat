<script setup lang="ts">
import { computed } from 'vue';
import { useChatsStore } from '@/stores/chats';
import type { ModelSettings } from '@/types';

const props = defineProps<{
  chatId: string;
}>();

const chatsStore = useChatsStore();

const settings = computed(() => {
  const chat = chatsStore.chats.find(c => c.id === props.chatId);
  return chat?.settings;
});

const updateSetting = async <K extends keyof ModelSettings>(
  key: K,
  value: ModelSettings[K]
) => {
  await chatsStore.updateSettings(props.chatId, { [key]: value });
};
</script>

<template>
  <div class="bg-white p-6 rounded-lg shadow-md">
    <h3 class="text-lg font-semibold mb-4">Paramètres du modèle</h3>
    
    <div class="space-y-4">
      <!-- Temperature -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">
          Température: {{ settings?.temperature }}
        </label>
        <input
          type="range"
          min="0"
          max="2"
          step="0.1"
          :value="settings?.temperature"
          @change="e => updateSetting('temperature', parseFloat(e.target.value))"
          class="w-full"
        />
        <p class="text-sm text-gray-500">
          Contrôle la créativité des réponses (0 = plus précis, 2 = plus créatif)
        </p>
      </div>

      <!-- Max Tokens -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">
          Longueur maximale: {{ settings?.maxTokens }}
        </label>
        <input
          type="range"
          min="100"
          max="4000"
          step="100"
          :value="settings?.maxTokens"
          @change="e => updateSetting('maxTokens', parseInt(e.target.value, 10))"
          class="w-full"
        />
        <p class="text-sm text-gray-500">
          Nombre maximum de tokens dans la réponse
        </p>
      </div>

      <!-- Top P -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">
          Top P: {{ settings?.topP }}
        </label>
        <input
          type="range"
          min="0"
          max="1"
          step="0.05"
          :value="settings?.topP"
          @change="e => updateSetting('topP', parseFloat(e.target.value))"
          class="w-full"
        />
        <p class="text-sm text-gray-500">
          Alternative à la température pour le contrôle de la diversité
        </p>
      </div>

      <!-- Frequency Penalty -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">
          Pénalité de fréquence: {{ settings?.frequencyPenalty }}
        </label>
        <input
          type="range"
          min="-2"
          max="2"
          step="0.1"
          :value="settings?.frequencyPenalty"
          @change="e => updateSetting('frequencyPenalty', parseFloat(e.target.value))"
          class="w-full"
        />
        <p class="text-sm text-gray-500">
          Réduit la répétition des mêmes informations
        </p>
      </div>

      <!-- Presence Penalty -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">
          Pénalité de présence: {{ settings?.presencePenalty }}
        </label>
        <input
          type="range"
          min="-2"
          max="2"
          step="0.1"
          :value="settings?.presencePenalty"
          @change="e => updateSetting('presencePenalty', parseFloat(e.target.value))"
          class="w-full"
        />
        <p class="text-sm text-gray-500">
          Encourage l'introduction de nouveaux sujets
        </p>
      </div>

      <!-- Stop Sequences -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">
          Séquences d'arrêt
        </label>
        <div class="flex gap-2">
          <input
            type="text"
            placeholder="Ajouter une séquence"
            class="flex-1 px-3 py-2 border rounded-lg"
            @keyup.enter="e => {
              const value = e.target.value.trim();
              if (value && settings) {
                updateSetting('stop', [...settings.stop, value]);
                e.target.value = '';
              }
            }"
          />
        </div>
        <div class="mt-2 flex flex-wrap gap-2">
          <span
            v-for="(stop, index) in settings?.stop"
            :key="index"
            class="bg-gray-100 px-2 py-1 rounded-full text-sm flex items-center gap-1"
          >
            {{ stop }}
            <button
              @click="() => {
                if (settings) {
                  const newStop = [...settings.stop];
                  newStop.splice(index, 1);
                  updateSetting('stop', newStop);
                }
              }"
              class="text-red-500 hover:text-red-600"
            >
              ×
            </button>
          </span>
        </div>
      </div>
    </div>
  </div>
</template>