<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import { apiRequest } from '../api-request';
import { useStore } from '../store';
import ExpenseItem from './ExpenseItem.vue';

interface Expense {
  id: number;
  note: string;
  amount: number;
  group: string;
  created_at: string;
  created_by: string;
  month: string;
}

const props = defineProps<{
  group: string | null;
  month: string;
  isOpen: boolean;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
}>();

const store = useStore();
const expenses = ref<Expense[]>([]);
const isLoading = ref(false);
const error = ref<string | null>(null);

// Fetch expenses when modal opens
watch(() => props.isOpen, (isOpen) => {
  if (isOpen) {
    fetchExpenses();
  }
});

// Also fetch on mount if already open
onMounted(() => {
  if (props.isOpen) {
    fetchExpenses();
  }
});

async function fetchExpenses() {
  isLoading.value = true;
  error.value = null;
  
  try {
    // Use the server-side filtering instead of client-side
    expenses.value = await apiRequest('/api/get-expenses', {
      passkey: store.passkey,
      month: props.month,
      ...(props.group ? { group: props.group } : {})  // Only include group param if not null
    });
    
    // Sort by date (newest first)
    expenses.value.sort((a: Expense, b: Expense) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  } catch (e) {
    error.value = `Failed to load expenses: ${(e as Error).message || e}`;
    console.error(error.value);
  } finally {
    isLoading.value = false;
  }
}

function onExpenseUpdated() {
  // Refresh the expense list when an expense is updated
  fetchExpenses();
}

function onExpenseDeleted() {
  // Refresh the expense list when an expense is deleted
  fetchExpenses();
}

function closeModal() {
  emit('close');
}

const totalSpent = ref(0);
watch(expenses, (newExpenses) => {
  totalSpent.value = newExpenses.reduce((sum, expense) => sum + expense.amount, 0);
}, { immediate: true });
</script>

<template>
  <div class="view-expenses-modal modal" v-if="isOpen">
    <div class="view-expenses-content modal-content card elevation-4">
      <div class="view-expenses-header modal-header">
        <h3 class="view-expenses-title modal-title">Expenses: {{ group || 'All Groups' }}</h3>
        <button class="view-expenses-close modal-close" @click="closeModal">
          <span class="material-icons">close</span>
        </button>
      </div>
      
      <div class="view-expenses-body modal-body">
        <div class="expense-summary">
          <span class="expense-total">Total: ${{ totalSpent.toFixed(2) }}</span>
          <span class="expense-count">{{ expenses.length }} expense{{ expenses.length !== 1 ? 's' : '' }}</span>
        </div>
        
        <div v-if="isLoading" class="expense-loading">
          <div class="spinner"></div>
          <span>Loading expenses...</span>
        </div>
        
        <div v-else-if="error" class="expense-error">
          <span class="material-icons">error</span>
          <span>{{ error }}</span>
          <button class="retry-button" @click="fetchExpenses">
            <span class="material-icons">refresh</span> Retry
          </button>
        </div>
        
        <div v-else-if="expenses.length === 0" class="no-expenses">
          <span class="material-icons">receipt_long</span>
          <p>No expenses found for this budget group</p>
        </div>
        
        <div v-else class="expense-list">
          <ExpenseItem 
            v-for="expense in expenses" 
            :key="expense.id" 
            :expense="expense"
            :showGroup="!props.group"
            @expense-updated="onExpenseUpdated"
            @expense-deleted="onExpenseDeleted"
          />
        </div>
      </div>
      
      <div class="view-expenses-footer modal-footer">
        <button class="view-expenses-btn" @click="closeModal">
          <span class="material-icons">close</span> Close
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.expense-summary {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.expense-total {
  font-size: 1.1rem;
  font-weight: 500;
  color: #FFC107; /* Yellow accent color */
}

.expense-count {
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.9rem;
}

.expense-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 32px 0;
  color: rgba(255, 255, 255, 0.7);
}

.spinner {
  width: 32px;
  height: 32px;
  border: 4px solid rgba(255, 255, 255, 0.1);
  border-radius: 50%;
  border-top-color: #FFC107;
  animation: spin 1s linear infinite;
  margin-bottom: 16px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.expense-error {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 32px 0;
  color: #f44336;
  text-align: center;
}

.expense-error .material-icons {
  font-size: 48px;
  margin-bottom: 16px;
}

.retry-button {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 16px;
  padding: 8px 16px;
  background-color: rgba(255, 255, 255, 0.1);
  border: none;
  border-radius: 4px;
  color: #fff;
  cursor: pointer;
}

.retry-button:hover {
  background-color: rgba(255, 255, 255, 0.15);
}

.no-expenses {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 32px 0;
  color: rgba(255, 255, 255, 0.7);
  text-align: center;
}

.no-expenses .material-icons {
  font-size: 48px;
  margin-bottom: 16px;
  opacity: 0.5;
}

.expense-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.view-expenses-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  background-color: rgba(255, 193, 7, 0.1);
  border: 1px solid rgba(255, 193, 7, 0.3);
  border-radius: 4px;
  color: #FFC107;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
}

.view-expenses-btn:hover {
  background-color: rgba(255, 193, 7, 0.2);
}
</style>
