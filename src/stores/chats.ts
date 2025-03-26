import { defineStore } from 'pinia';
import { openDB } from 'idb';
import type { Chat, Message, ModelSettings } from '@/types';

const DB_NAME = 'lm-studio-chats';
const STORE_NAME = 'chats';

const DEFAULT_SETTINGS: ModelSettings = {
  temperature: 0.7,
  maxTokens: 2000,
  topP: 1,
  frequencyPenalty: 0,
  presencePenalty: 0,
  stop: [],
};

const db = await openDB(DB_NAME, 1, {
  upgrade(db) {
    db.createObjectStore(STORE_NAME, { keyPath: 'id' });
  },
});

export const useChatsStore = defineStore('chats', {
  state: () => ({
    chats: [] as Chat[],
    currentChat: null as Chat | null,
    loading: false,
    error: null as string | null,
  }),

  actions: {
    async loadChats() {
      this.loading = true;
      try {
        const allChats = await db.getAll(STORE_NAME);
        this.chats = allChats;
      } catch (err) {
        this.error = 'Erreur lors du chargement des chats';
        console.error(err);
      } finally {
        this.loading = false;
      }
    },

    async createChat(modelId: string) {
      const newChat: Chat = {
        id: crypto.randomUUID(),
        modelId,
        title: 'Nouvelle conversation',
        messages: [],
        settings: { ...DEFAULT_SETTINGS },
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      try {
        const chatForStorage = JSON.parse(JSON.stringify(newChat));
        await db.add(STORE_NAME, chatForStorage);
        this.chats.push(newChat);
        this.currentChat = newChat;
        return newChat;
      } catch (err) {
        console.error('Erreur lors de la création du chat:', err);
        throw err;
      }
    },

    async updateSettings(chatId: string, settings: Partial<ModelSettings>) {
      try {
        const chat = this.chats.find(c => c.id === chatId);
        if (!chat) return;

        const updatedChat = JSON.parse(JSON.stringify(chat));
        updatedChat.settings = { ...updatedChat.settings, ...settings };
        updatedChat.updatedAt = Date.now();

        await db.put(STORE_NAME, updatedChat);
        
        chat.settings = { ...chat.settings, ...settings };
        chat.updatedAt = updatedChat.updatedAt;

        if (this.currentChat?.id === chatId) {
          this.currentChat = chat;
        }
      } catch (err) {
        console.error('Erreur lors de la mise à jour des paramètres:', err);
        throw err;
      }
    },

    async deleteChat(chatId: string) {
      try {
        await db.delete(STORE_NAME, chatId);
        this.chats = this.chats.filter(chat => chat.id !== chatId);
        if (this.currentChat?.id === chatId) {
          this.currentChat = null;
        }
      } catch (err) {
        console.error('Erreur lors de la suppression du chat:', err);
        throw err;
      }
    },

    async addMessage(chatId: string, message: Message) {
      try {
        const chat = this.chats.find(c => c.id === chatId);
        if (!chat) return;

        const cleanMessage = JSON.parse(JSON.stringify(message));
        const updatedChat = JSON.parse(JSON.stringify(chat));
        
        updatedChat.messages.push(cleanMessage);
        updatedChat.updatedAt = Date.now();

        await db.put(STORE_NAME, updatedChat);
        
        chat.messages.push(message);
        chat.updatedAt = updatedChat.updatedAt;
        
        if (this.currentChat?.id === chatId) {
          this.currentChat = chat;
        }
      } catch (err) {
        console.error('Erreur lors de l\'ajout du message:', err);
        throw err;
      }
    },
  },
});