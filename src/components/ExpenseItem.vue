<script setup lang="ts">
import { ref } from 'vue';
import { apiRequest } from '../api-request';
import { useStore } from '../store';

interface ExpenseProps {
  id: number;
  note: string;
  amount: number;
  group: string;
  created_at: string;
  created_by: string;
  month: string;
}

const props = defineProps<{
  expense: ExpenseProps;
  showGroup?: boolean;
}>();

const emit = defineEmits<{
  (e: 'expense-updated'): void;
  (e: 'expense-deleted'): void;
}>();

const store = useStore();
const isEditing = ref(false);
const isDeleting = ref(false);
const editData = ref({ ...props.expense });

const formattedDate = new Date(props.expense.created_at).toLocaleDateString(undefined, {
  year: 'numeric',
  month: 'short',
  day: 'numeric'
});

function startEdit() {
  isEditing.value = true;
  editData.value = { ...props.expense };
}

function cancelEdit() {
  isEditing.value = false;
  editData.value = { ...props.expense };
}

async function saveEdit() {
  try {
    await apiRequest('/api/edit-expense', {
      passkey: store.passkey,
      id: props.expense.id,
      note: editData.value.note,
      amount: editData.value.amount,
      group: editData.value.group,
      created_by: editData.value.created_by,
      month: editData.value.month,
    });
    
    isEditing.value = false;
    emit('expense-updated');
  } catch (error) {
    console.error('Error updating expense:', error);
    alert('Failed to update expense. Please try again.');
  }
}

async function deleteExpense() {
  if (!confirm('Are you sure you want to delete this expense?')) {
    return;
  }
  
  isDeleting.value = true;
  try {
    await apiRequest('/api/delete-expense', {
      passkey: store.passkey,
      id: props.expense.id,
    });
    
    emit('expense-deleted');
  } catch (error) {
    console.error('Error deleting expense:', error);
    alert('Failed to delete expense. Please try again.');
  } finally {
    isDeleting.value = false;
  }
}
</script>

<template>
  <div class="expense-item elevation-1">
    <div class="expense-content">
      <div v-if="!isEditing" class="expense-display">
        <div class="expense-header">
          <div class="expense-amount">${{ expense.amount.toFixed(2) }}</div>
          <div class="expense-date">{{ formattedDate }}</div>
        </div>
        <div class="expense-note" v-if="expense.note">{{ expense.note }}</div>
        <div class="expense-group" v-if="showGroup">Group: {{ expense.group }}</div>
        <div class="expense-creator">Added by: {{ expense.created_by }}</div>
        
        <div class="expense-actions">
          <button class="action-btn edit-btn" @click="startEdit" :disabled="isDeleting">
            <span class="material-icons">edit</span>
          </button>
          <button class="action-btn delete-btn" @click="deleteExpense" :disabled="isDeleting">
            <span class="material-icons">delete</span>
          </button>
        </div>
      </div>

      <div v-else class="expense-edit">
        <div class="edit-form">
          <div class="edit-row">
            <label>Amount:</label>
            <input 
              type="number" 
              v-model.number="editData.amount" 
              min="0" 
              step="0.01"
              class="edit-input"
            >
          </div>
          
          <div class="edit-row">
            <label>Note:</label>
            <input 
              type="text" 
              v-model="editData.note" 
              placeholder="Expense note"
              class="edit-input"
            >
          </div>
          
          <div class="edit-row">
            <label>Group:</label>
            <input 
              type="text" 
              v-model="editData.group" 
              class="edit-input"
            >
          </div>
          
          <div class="edit-row">
            <label>Added by:</label>
            <input 
              type="text" 
              v-model="editData.created_by" 
              class="edit-input"
            >
          </div>
          
          <div class="edit-actions">
            <button class="action-btn save-btn" @click="saveEdit">
              <span class="material-icons">check</span>
            </button>
            <button class="action-btn cancel-btn" @click="cancelEdit">
              <span class="material-icons">close</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.expense-item {
  background-color: #2c2c2c;
  border-radius: 8px;
  margin-bottom: 12px;
  transition: transform 0.2s, box-shadow 0.2s;
  overflow: hidden;
  border-left: 4px solid var(--accent-color);
}

.expense-item:hover {
  transform: translateY(-2px);
}

.expense-content {
  padding: 12px 16px;
}

.expense-display {
  position: relative;
}

.expense-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.expense-amount {
  font-size: 1.2rem;
  font-weight: 500;
  color: #fff;
}

.expense-date {
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.7);
}

.expense-note {
  margin-bottom: 8px;
  color: rgba(255, 255, 255, 0.9);
  white-space: pre-line;
}

.expense-creator, .expense-group {
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.6);
  margin-top: 4px;
}

.expense-actions {
  display: flex;
  gap: 8px;
  margin-top: 12px;
  justify-content: flex-end;
}

.action-btn {
  background: rgba(255, 255, 255, 0.1);
  border: none;
  border-radius: 50%;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background-color 0.2s, transform 0.1s;
  color: #fff;
}

.action-btn:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: scale(1.05);
}

.action-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

.edit-btn:hover {
  background: rgba(33, 150, 243, 0.3);
  color: #2196F3;
}

.delete-btn:hover {
  background: rgba(244, 67, 54, 0.3);
  color: #f44336;
}

.save-btn {
  background: rgba(76, 175, 80, 0.2);
  color: #4CAF50;
}

.save-btn:hover {
  background: rgba(76, 175, 80, 0.3);
}

.cancel-btn {
  background: rgba(158, 158, 158, 0.2);
  color: #9E9E9E;
}

.cancel-btn:hover {
  background: rgba(158, 158, 158, 0.3);
}

.expense-edit {
  background: rgba(0, 0, 0, 0.2);
  border-radius: 4px;
  padding: 12px;
  margin: -4px;
}

.edit-form {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.edit-row {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.edit-row label {
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.8);
  font-weight: 500;
}

.edit-input {
  background: #1a1a1a;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 4px;
  padding: 8px 12px;
  color: #fff;
  font-size: 0.9rem;
  transition: border-color 0.2s;
}

.edit-input:focus {
  outline: none;
  border-color: var(--accent-color);
}

.edit-actions {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
  margin-top: 8px;
}

/* Mobile responsiveness */
@media (max-width: 480px) {
  .expense-actions {
    gap: 6px;
  }
  
  .action-btn {
    width: 32px;
    height: 32px;
  }
  
  .action-btn .material-icons {
    font-size: 18px;
  }
  
  .edit-row {
    gap: 2px;
  }
  
  .edit-input {
    padding: 6px 10px;
    font-size: 0.85rem;
  }
}
</style>
