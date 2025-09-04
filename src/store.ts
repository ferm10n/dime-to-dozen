import { defineStore } from 'pinia';
import { useLocalStorage } from '@vueuse/core';
import { computed } from 'vue';

export const useStore = defineStore('main', () => {
  const localStorageData = useLocalStorage('data', {
    passkey: '',
    created_by: '',
    showHidden: true,
  });

  const passkey = computed({
    get: () => localStorageData.value.passkey,
    set: (value) => localStorageData.value.passkey = value,
  });

  const createdBy = computed({
    get: () => localStorageData.value.created_by,
    set: (value) => localStorageData.value.created_by = value,
  });

  const showHidden = computed({
    get: () => localStorageData.value.showHidden,
    set: (value) => localStorageData.value.showHidden = value,
  });

  return {
    passkey,
    createdBy,
    showHidden,
  };
});
