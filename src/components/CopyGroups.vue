<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useStore } from '../store';
import BudgetMeter from './BudgetMeter.vue';
import { apiRequest } from '../api-request';

const router = useRouter();
const store = useStore();

const monthGroups = ref<{group: string, spent: number, budgeted: number}[]>([]);
const isLoading = ref(false);
const fromMonth = ref('');
const toMonth = ref('');
const selectedGroups = ref<string[]>([]);
const isCopying = ref(false);

// Generate the current month in YYYY-MM format
const currentMonth = computed(() => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
});

onMounted(() => {
  fromMonth.value = currentMonth.value;
  fetchMonthGroups(fromMonth.value);
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

function toggleGroupSelection(groupName: string) {
  const index = selectedGroups.value.indexOf(groupName);
  if (index === -1) {
    // If not already selected, add to selections
    selectedGroups.value.push(groupName);
  } else {
    // If already selected, remove from selections
    selectedGroups.value.splice(index, 1);
  }
}

async function onCopyBtnPress() {
  if (!toMonth.value || selectedGroups.value.length === 0) return;
  isCopying.value = true;
  try {
    const res = await apiRequest('/api/copy-month-budget', {
      passkey: store.passkey,
      fromMonth: fromMonth.value,
      toMonth: toMonth.value,
      groups: selectedGroups.value,
    });
    alert(`Copied ${res.copied} group budget${res.copied === 1 ? '' : 's'} to ${toMonth.value}`);
    // Navigate back to monthly overview
    router.push('/monthly-overview');
  } catch (e) {
    alert('Copy failed: ' + ((e as Error).message || e));
  } finally {
    isCopying.value = false;
  }
}

function goBack() {
  router.push('/monthly-overview');
}

const allGroupsSelected = computed(() =>
  monthGroups.value.length > 0 && selectedGroups.value.length === monthGroups.value.length
);

const selectAllOrNoneLabel = computed(() =>
  allGroupsSelected.value ? 'Select None' : 'Select All'
);

function selectAllOrNone() {
  if (allGroupsSelected.value) {
    selectedGroups.value = [];
  } else {
    selectedGroups.value = monthGroups.value.map(g => g.group);
  }
}
</script>

<template>
  <div class="copy-groups">
    <h2 class="page-title">Copy Budget Groups</h2>
    
    <div class="card">
      <div class="month-selector">
        <label for="fromMonth">From Month:</label>
        <input 
          type="month" 
          id="fromMonth" 
          v-model="fromMonth" 
          class="form-input"
          @change="fetchMonthGroups(fromMonth)"
        />
      </div>
      
      <div class="month-selector">
        <label for="toMonth">To Month:</label>
        <input 
          type="month" 
          id="toMonth" 
          v-model="toMonth" 
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
        <div class="selection-summary">
          <div class="selection-info">
            <p>Selected Groups: {{ selectedGroups.length }} of {{ monthGroups.length }}</p>
            <button class="secondary-btn" @click="selectAllOrNone">
              {{ selectAllOrNoneLabel }}
            </button>
          </div>
        </div>
        
        <div class="group-list">
          <h3>Budget Groups</h3>
          
          <div 
            v-for="group in monthGroups" 
            :key="group.group"
            class="budget-group"
            :class="{ 'budget-group-selected': selectedGroups.includes(group.group) }"
            @click="toggleGroupSelection(group.group)"
          >
            <div class="group-header">
              <div class="group-name">{{ group.group }}</div>
              <div class="group-amount">${{ group.budgeted.toFixed(2) }}</div>
            </div>
          </div>
        </div>
        
        <div class="action-buttons">
          <button 
            class="primary-btn copy-btn"
            @click="onCopyBtnPress" 
            :disabled="toMonth === '' || selectedGroups.length === 0 || isCopying"
          >
            <span class="material-icons">content_copy</span> Copy Selected Groups
          </button>
          <button class="secondary-btn" @click="goBack">
            <span class="material-icons">arrow_back</span> Cancel
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.copy-groups {
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

select.form-input option {
  background-color: #333;
  color: rgba(255, 255, 255, 0.87);
}

.form-input:focus {
  border-color: var(--accent-color);
  outline: none;
}

.selection-summary {
  margin-bottom: 16px;
  padding: 16px;
  border-radius: 4px;
  background-color: rgba(255, 235, 59, 0.05);
  border: 1px solid rgba(255, 235, 59, 0.1);
}

.selection-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
}

.selection-info p {
  margin: 0;
}

.group-list {
  margin-top: 16px;
}

.group-list h3 {
  text-align: left;
  margin-bottom: 16px;
}

.budget-group {
  margin-bottom: 12px;
  transition: background-color 0.2s;
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 4px;
  padding: 12px;
  cursor: pointer;
}

.budget-group:hover {
  background-color: rgba(255, 255, 255, 0.05);
}

.budget-group-selected {
  background-color: rgba(255, 235, 59, 0.1);
  border-color: var(--accent-color);
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

.group-amount {
  font-weight: 500;
  color: var(--accent-color);
}

.loading, .no-data {
  padding: 32px;
  text-align: center;
}

.action-buttons {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 24px;
}

.copy-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.primary-btn {
  background-color: var(--accent-color);
  color: var(--text-on-primary);
}

.secondary-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  background-color: transparent;
  color: var(--accent-color);
  border: 1px solid var(--accent-color);
}

.secondary-btn:hover {
  background-color: rgba(255, 235, 59, 0.1);
}

.primary-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>
