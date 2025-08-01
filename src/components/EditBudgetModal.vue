<script setup lang="ts">
import { ref, watch } from 'vue';
import { apiRequest } from '../api-request';
import { useStore } from '../store';

const props = defineProps<{
  group: string | null;
  amount: number | undefined;
  month: string;
  isOpen: boolean;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'update', group: string, newAmount: number): void;
}>();

const store = useStore();
const editingAmount = ref<number | undefined>(props.amount);

// Update local amount ref when props change
watch(() => props.amount, (newAmount: number | undefined) => {
  editingAmount.value = newAmount;
});
const isEditing = ref(false);

function cancelEdit() {
  emit('close');
}

async function saveEdit() {
  if (editingAmount.value == null || isNaN(editingAmount.value) || !props.group) return;
  
  isEditing.value = true;
  try {
    await apiRequest('/api/edit-budget-group', {
      passkey: store.passkey,
      month: props.month,
      group: props.group,
      amount: editingAmount.value,
    });
    
    emit('update', props.group, editingAmount.value);
    emit('close');
  } catch (e) {
    alert('Failed to update budget: ' + ((e as Error).message || e));
  } finally {
    isEditing.value = false;
  }
}
</script>

<template>
  <div class="edit-group-modal modal" v-if="isOpen">
    <div class="edit-group-content modal-content card elevation-4">
      <div class="edit-group-header modal-header">
        <h3 class="edit-group-title modal-title">Edit Budget: {{ group }}</h3>
        <button class="edit-group-close modal-close" @click="cancelEdit">
          <span class="material-icons">close</span>
        </button>
      </div>
      <div class="edit-group-body modal-body">
        <div class="form-group">
          <label for="editBudgetAmount">Budget Amount:</label>
          <input 
            type="number" 
            id="editBudgetAmount" 
            v-model="editingAmount" 
            class="form-input" 
            min="0" 
            step="0.01"
          />
        </div>
      </div>
      <div class="edit-group-footer modal-footer">
        <button 
          class="edit-group-save edit-group-btn"
          @click="saveEdit"
          :disabled="editingAmount === undefined || isNaN(editingAmount) || isEditing"
        >
          <span class="material-icons">save</span> Save
        </button>
        <button 
          class="edit-group-cancel edit-group-btn"
          @click="cancelEdit"
          :disabled="isEditing"
        >
          <span class="material-icons">cancel</span> Cancel
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.edit-group-btn {
  flex: 1;
}

.edit-group-save {
  display: flex;
  align-items: center;
  gap: 8px;
}

.edit-group-cancel {
  display: flex;
  align-items: center;
  gap: 8px;
  background-color: transparent;
  color: var(--text-primary);
  box-shadow: none;
}

.edit-group-cancel:hover {
  background-color: rgba(255, 255, 255, 0.05);
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-group label {
  font-weight: 500;
}

.form-input {
  width: 100%;
  padding: 12px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 4px;
  box-sizing: border-box;
  font-size: 16px;
  background-color: transparent;
  transition: border-color 0.2s;
  color: var(--text-primary);
}

.form-input:focus {
  border-color: var(--accent-color);
  outline: none;
}
</style>
