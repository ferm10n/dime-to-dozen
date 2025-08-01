<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useStore } from '../store';
import BudgetMeter from './BudgetMeter.vue';
import EditBudgetModal from './EditBudgetModal.vue';
import ViewExpensesModal from './ViewExpensesModal.vue';
import { apiRequest } from '../api-request';

const router = useRouter();
const route = useRoute();
const store = useStore();

const monthGroups = ref<{group: string, spent: number, budgeted: number}[]>([]);
const isLoading = ref(false);
const selectedMonth = ref('');
const editingGroup = ref<string | null>(null);
const editingAmount = ref<number | undefined>(undefined);
const viewingGroup = ref<string | null>(null);

// Generate the current month in YYYY-MM format
const currentMonth = computed(() => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
});

// Total budget and spending for the month
const totalBudgeted = computed(() => {
  return monthGroups.value.reduce((total, group) => total + group.budgeted, 0);
});

const totalSpent = computed(() => {
  return monthGroups.value.reduce((total, group) => total + group.spent, 0);
});

onMounted(() => {
  // Check for month parameter in URL
  const monthParam = route.query.month as string;
  
  if (monthParam && /^\d{4}-\d{2}$/.test(monthParam)) {
    selectedMonth.value = monthParam;
  } else {
    selectedMonth.value = currentMonth.value;
  }
  
  fetchMonthGroups(selectedMonth.value);
});

// Function to fetch all groups data for a specific month
function fetchMonthGroups(month: string) {
  if (!month) return;
  
  isLoading.value = true;

  apiRequest('/api/get-month-groups', {
    passkey: store.passkey,
    month,
  }).then((data) => {
    monthGroups.value = Array.isArray(data) ? data : [];
  }).catch((error) => {
    console.error('Error fetching month groups:', error);
    monthGroups.value = [];
  }).finally(() => {
    isLoading.value = false;
  });
}

function goBack() {
  router.push('/');
}

function navigateToCopyGroups() {
  router.push('/copy-groups');
}

// Watch for changes in the selected month
watch(() => selectedMonth.value, (newMonth) => {
  if (newMonth) {
    fetchMonthGroups(newMonth);
    updateUrlParams();
  }
});

// Function to update URL parameters without navigation
function updateUrlParams() {
  const query = { ...route.query };
  
  if (selectedMonth.value) {
    query.month = selectedMonth.value;
  }
  
  router.replace({ query });
}

function startEditGroup(group: string, amount: number) {
  editingGroup.value = group;
  editingAmount.value = amount;
}

function cancelEditGroup() {
  editingGroup.value = null;
  editingAmount.value = undefined;
}

function startViewExpenses(group: string) {
  viewingGroup.value = group;
}

function cancelViewExpenses() {
  viewingGroup.value = null;
}

function handleUpdateGroup(group: string, newAmount: number) {
  // Update local data
  const idx = monthGroups.value.findIndex(g => g.group === group);
  if (idx !== -1) monthGroups.value[idx].budgeted = newAmount;
}

function addExpenseForGroup(group: string) {
  router.push({
    path: '/',
    query: {
      ...route.query,
      month: selectedMonth.value,
      group: group
    }
  });
}
</script>

<template>
  <div class="monthly-overview">
    <h2 class="page-title">Monthly Overview</h2>
    
    <div class="card">
      <div class="month-selector">
        <label for="monthSelector">Select Month:</label>
        <input 
          type="month" 
          id="monthSelector" 
          v-model="selectedMonth" 
          class="form-input"
        />
      </div>
      
      <div v-if="isLoading" class="loading">
        <p>Loading data...</p>
      </div>
      
      <div v-else-if="monthGroups.length === 0" class="no-data">
        <p>No budget data for this month</p>
      </div>
      
      <div v-else>
        <div class="budget-summary budget-group">
          <div class="total-budget">
            <BudgetMeter 
              :budgeted="totalBudgeted" 
              :spent="totalSpent" 
              :showAmount="true" 
            />
          </div>
        </div>
        
        <div class="group-list">
          <div class="group-list-header">
            <h3>Budget Groups</h3>
            <div class="group-actions">
              <button 
                class="secondary-btn" 
                @click="addExpenseForGroup('')"
              >
                <span class="material-icons">add</span>
                <span>Add Expense</span>
              </button>
            </div>
          </div>
          
          <div 
            v-for="group in monthGroups" 
            :key="group.group"
            class="budget-group"
          >
            <div class="group-header">
              <div class="group-name">{{ group.group }}</div>
              <div class="group-actions">
                <button 
                  class="action-btn view-btn" 
                  @click="startViewExpenses(group.group)"
                  title="View Expenses"
                >
                  <span class="material-icons">receipt_long</span>
                </button>
                <button 
                  class="action-btn add-expense-btn" 
                  @click="addExpenseForGroup(group.group)"
                  title="Add Expense"
                >
                  <span class="material-icons">add_circle</span>
                </button>
                <button 
                  class="edit-btn" 
                  @click="startEditGroup(group.group, group.budgeted)"
                >
                  <span class="material-icons">edit</span>
                </button>
              </div>
            </div>
            <BudgetMeter :budgeted="group.budgeted" :spent="group.spent" showAmount />
          </div>
        </div>
      </div>
    </div>
    
    <!-- Edit Group Modal -->
    <EditBudgetModal 
      :group="editingGroup"
      :amount="editingAmount"
      :month="selectedMonth"
      :isOpen="editingGroup !== null"
      @close="cancelEditGroup"
      @update="handleUpdateGroup"
    />
    
    <!-- View Expenses Modal -->
    <ViewExpensesModal
      :group="viewingGroup"
      :month="selectedMonth"
      :isOpen="viewingGroup !== null"
      @close="cancelViewExpenses"
    />
  </div>
</template>

<style scoped>
.monthly-overview {
  width: 100%;
}

.page-title {
  text-align: left;
  margin-bottom: 16px;
  color: var(--text-primary);
}

.month-selector {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  margin-bottom: 16px;
}

.month-selector label {
  margin-bottom: 8px;
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

select.form-input {
  color: var(--text-primary);
}

select.form-input option {
  background-color: #333;
  color: rgba(255, 255, 255, 0.87);
}

.budget-summary {
  margin-bottom: 16px;
}

.total-budget {
  margin: 8px 0;
}

.group-list {
  margin-top: 16px;
}

.group-list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  flex-wrap: wrap;
  gap: 8px;
}

.group-list-header h3 {
  margin: 0;
}

.group-actions {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.budget-group {
  margin-bottom: 12px;
  transition: background-color 0.2s;
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 4px;
  padding: 12px;
}

.budget-group:hover {
  background-color: rgba(255, 255, 255, 0.05);
}

.group-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.group-name {
  font-weight: 500;
  font-size: 1.1rem;
  text-align: left;
}

.loading, .no-data {
  padding: 32px;
  text-align: center;
}

.copy-navigate-btn, 
.secondary-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  background-color: transparent;
  color: var(--accent-color);
  box-shadow: none;
  border: 1px solid var(--accent-color);
}

.copy-navigate-btn:hover,
.secondary-btn:hover {
  background-color: rgba(255, 235, 59, 0.1);
}

.action-btn {
  padding: 4px;
  margin: 0;
  background: transparent;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  transition: background-color 0.2s, color 0.2s;
}

.edit-btn {
  padding: 4px;
  margin: 0;
  background: transparent;
  color: var(--accent-color);
  box-shadow: none;
}

.edit-btn:hover {
  background-color: rgba(255, 235, 59, 0.1);
}

.view-btn {
  padding: 4px;
  margin: 0;
  background: transparent;
  color: rgba(255, 255, 255, 0.7);
  box-shadow: none;
}

.view-btn:hover {
  background-color: rgba(255, 255, 255, 0.1);
  color: var(--accent-color);
}

.add-expense-btn {
  padding: 4px;
  margin: 0;
  background: transparent;
  color: var(--accent-color);
  box-shadow: none;
}

.add-expense-btn:hover {
  background-color: rgba(255, 235, 59, 0.1);
  color: var(--accent-color);
}

@media (prefers-color-scheme: dark) {
  .budget-group {
    border-color: rgba(255, 255, 255, 0.12);
  }
}
</style>
