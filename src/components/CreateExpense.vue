<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue'
import BudgetMeter from './BudgetMeter.vue'
import { useRouter, useRoute } from 'vue-router';
import { useStore } from '../store'
import { apiRequest } from '../api-request';

const router = useRouter();
const route = useRoute();

const expenseData = ref({
  amount: 0,
  note: '',
  group: '',
  month: '',
})

const groups = ref<string[]>([]);
const isAddingNewGroup = ref(false);
const newGroupName = ref('');
const isLoading = ref(false);

const monthGroups = ref<{group: string, spent: number, budgeted: number}[]>([]);

const store = useStore()

// Generate the current month in YYYY-MM format
const currentMonth = computed(() => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
});

const budgeted = computed(() => {
  if (!expenseData.value.group) return 0;
  const groupData = monthGroups.value.find(g => g.group === expenseData.value.group);
  return groupData ? groupData.budgeted : 0;
});

const spent = computed(() => {
  if (!expenseData.value.group) return 0;
  const groupData = monthGroups.value.find(g => g.group === expenseData.value.group);
  return groupData ? groupData.spent : 0;
});

onMounted(() => {
  fetchGroups();
  
  // Set month and group from URL parameters if they exist
  const monthParam = route.query.month as string;
  const groupParam = route.query.group as string;
  
  if (monthParam && /^\d{4}-\d{2}$/.test(monthParam)) {
    expenseData.value.month = monthParam;
  } else {
    expenseData.value.month = currentMonth.value;
  }
  
  if (groupParam) {
    expenseData.value.group = groupParam;
  }
});

function fetchGroups() {
  isLoading.value = true;
  apiRequest('/api/get-groups', {
    passkey: store.passkey,
  })
    .then((data) => {
      groups.value = data;
      
      // After fetching groups, also fetch the monthly data for the current month
      fetchMonthGroups(expenseData.value.month);
    })
    .catch((error) => {
      console.error('Error fetching groups:', error);
    })
    .finally(() => {
      isLoading.value = false;
    });
}

// New function to fetch all groups data for a specific month
function fetchMonthGroups(month: string) {
  if (!month) return;
  
  isLoading.value = true;
  apiRequest('/api/get-month-groups', {
    passkey: store.passkey,
    month,
  })
    .then(data => {
      monthGroups.value = Array.isArray(data) ? data : [];
    })
    .catch((error) => {
      console.error('Error fetching month groups:', error);
      monthGroups.value = [];
    })
    .finally(() => {
      isLoading.value = false;
    });
}

function testExpense() {
  apiRequest('/api/post-expense', {
    ...expenseData.value,
    created_by: store.createdBy,
    passkey: store.passkey,
  })
    .then((data) => {
      console.log('Expense posted:', data);
      expenseData.value = {
        amount: 0,
        note: '',
        group: expenseData.value.group, // Keep the last used group
        month: expenseData.value.month, // Keep the last used month
      };
      
      // Refresh month data after posting an expense
      fetchMonthGroups(expenseData.value.month);
      
      alert('Expense posted successfully!');
    })
    .catch((error) => {
      console.error('Error posting expense:', error);
      alert('Failed to post expense. Check console for details.');
    });
}

function showAddGroupForm() {
  isAddingNewGroup.value = true;
}

function cancelAddGroup() {
  isAddingNewGroup.value = false;
  newGroupName.value = '';
}

function addNewGroup() {
  if (newGroupName.value.trim().length < 3) {
    alert('Group name must be at least 3 characters long');
    return;
  }
  
  // Add the new group to the existing list
  if (!groups.value.includes(newGroupName.value)) {
    groups.value.push(newGroupName.value);
    groups.value.sort(); // Keep the list alphabetical
  }
  
  // Set the current group to the new group
  expenseData.value.group = newGroupName.value;
  
  // Reset the form
  isAddingNewGroup.value = false;
  newGroupName.value = '';
}

function viewExpenses() {
  apiRequest('/api/get-expenses', {
    passkey: store.passkey,
  })
    .then((data) => {
      console.log('Fetched expenses:', data);
      // Display expenses in a more readable format
      const formattedData = JSON.stringify(data, null, 2);
      const newWindow = window.open();
      if (newWindow) {
        newWindow.document.write(`<pre>${formattedData}</pre>`);
      } else {
        alert('Failed to open new window. Please check your popup blocker settings.');
      }
    })
    .catch((error) => {
      console.error('Error fetching expenses:', error);
      alert('Failed to fetch expenses. Check console for details.');
    });
}

function goToMonthlyOverview() {
  router.push('/monthly-overview');
}

// Watch for changes in the month to fetch all group data for that month
watch(() => expenseData.value.month, (newMonth) => {
  if (newMonth) {
    fetchMonthGroups(newMonth);
    updateUrlParams();
  }
});

// Watch for group changes to update URL params
watch(() => expenseData.value.group, (newGroup) => {
  if (newGroup) {
    updateUrlParams();
  }
});

// Function to update URL parameters without navigation
function updateUrlParams() {
  const query = { ...route.query };
  
  if (expenseData.value.month) {
    query.month = expenseData.value.month;
  }
  
  if (expenseData.value.group) {
    query.group = expenseData.value.group;
  }
  
  router.replace({ query });
}
</script>

<template>
  <div class="expense-container">
    <h2 class="page-title">Create Expense</h2>
    
    <div class="card expense-form">
      <div class="form-group">
        <label for="amount">Amount</label>
        <input 
          type="number" 
          id="amount" 
          v-model="expenseData.amount" 
          placeholder="0.00"
          min="0"
          step="0.01"
          class="form-input"
        >
      </div>
      
      <div class="form-group">
        <label for="note">Note</label>
        <input 
          type="text" 
          id="note" 
          v-model="expenseData.note" 
          placeholder="What was this expense for?"
          class="form-input"
        >
      </div>
      
      <div class="form-group">
        <label for="month">Month</label>
        <input 
          type="month" 
          id="month" 
          v-model="expenseData.month"
          class="form-input"
        >
      </div>
      
      <div class="form-group">
        <label for="group">Budget Group</label>
        <div class="group-selector">
          <select 
            id="group" 
            v-model="expenseData.group"
            class="form-input"
            v-if="!isAddingNewGroup"
          >
            <option value="">Select a budget group</option>
            <option v-for="group in groups" :key="group" :value="group">{{ group }}</option>
          </select>
          <button 
            class="add-group-btn" 
            v-if="!isAddingNewGroup" 
            @click="showAddGroupForm"
          >
            <span class="material-icons">add</span>
          </button>
          
          <div class="new-group-form" v-if="isAddingNewGroup">
            <input 
              type="text" 
              v-model="newGroupName" 
              placeholder="New group name"
              class="form-input"
            >
            <div class="form-actions">
              <button @click="addNewGroup" :disabled="newGroupName.trim().length < 3" class="action-btn">
                <span class="material-icons">check</span>
                <span>Save</span>
              </button>
              <button class="cancel-btn action-btn" @click="cancelAddGroup">
                <span class="material-icons">close</span>
                <span>Cancel</span>
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <div class="budget-info" v-if="expenseData.group">
        <BudgetMeter :budgeted="budgeted" :spent="spent" />
      </div>
      
      <div class="form-actions">
        <button 
          @click="testExpense" 
          :disabled="!expenseData.group || !expenseData.amount || isLoading"
          class="primary-btn full-width-btn"
        >
          <span class="material-icons">save</span> Save Expense
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.expense-container {
  width: 100%;
}

.page-title {
  text-align: left;
  margin-bottom: 16px;
  color: var(--text-primary);
}

.expense-form {
  margin: 0;
  padding: 16px;
}

.form-group {
  margin-bottom: 16px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  width: 100%;
}

.form-group label {
  margin-bottom: 8px;
  font-weight: 500;
  color: var(--text-primary);
}

.form-input {
  width: 100%;
  padding: 12px;
  border: 1px solid rgba(0, 0, 0, 0.12);
  border-radius: 4px;
  box-sizing: border-box;
  font-size: 16px;
  background-color: transparent;
  transition: border-color 0.2s;
}

.form-input:focus {
  border-color: var(--accent-color);
  outline: none;
}

.group-selector {
  width: 100%;
  display: flex;
  flex-direction: row;
  gap: 8px;
  align-items: center;
}

.group-selector select {
  flex: 1;
}

/* Dropdown styling for dark theme */
select.form-input {
  color: var(--text-primary);
}

select.form-input option {
  background-color: #333;
  color: rgba(255, 255, 255, 0.87);
}

.add-group-btn {
  padding: 12px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.new-group-form {
  width: 100%;
}

.form-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 16px;
  width: 100%;
}

.cancel-btn {
  background-color: transparent;
  color: var(--text-primary);
  box-shadow: none;
}

.cancel-btn:hover {
  background-color: rgba(0, 0, 0, 0.05);
}

.primary-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.full-width-btn {
  width: 100%;
}

.budget-info {
  margin-top: 16px;
  width: 100%;
}

.action-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
}

.action-btn span {
  display: flex;
  align-items: center;
}

@media (prefers-color-scheme: dark) {
  .form-input {
    border-color: rgba(255, 255, 255, 0.12);
    color: var(--text-primary);
  }
  
  .cancel-btn:hover {
    background-color: rgba(255, 255, 255, 0.05);
  }
}
</style>
