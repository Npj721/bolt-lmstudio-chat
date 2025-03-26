import { defineStore } from 'pinia';
import axios from 'axios';
import type { Model } from '@/types';

export const useModelsStore = defineStore('models', {
  state: () => ({
    models: [] as Model[],
    loading: false,
    error: null as string | null,
  }),

  actions: {
    async fetchModels() {
      this.loading = true;
      this.error = null;
      try {
        const response = await axios.get('http://localhost:1234/v1/models');
        this.models = response.data.data.map((model: any) => ({
          id: model.id,
          name: model.id,
        }));
      } catch (err) {
        this.error = 'Erreur lors du chargement des modèles';
        console.error(err);
      } finally {
        this.loading = false;
      }
    },
  },
});