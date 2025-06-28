<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useStore } from '../store';
import BudgetMeter from './BudgetMeter.vue';
import { apiRequest } from '../api-request';

const router = useRouter();
const store = useStore();

const monthGroups = ref<{group: string, spent: number, budgeted: number}[]>([]);
const isLoading = ref(false);
const selectedMonth = ref('');
const selectedGroups = ref<string[]>([]);
const copyMode = ref(false);
const copyToMonth = ref('');
const isCopying = ref(false);

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
  selectedMonth.value = currentMonth.value;
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

// Watch for changes in the selected month
watch(() => selectedMonth.value, (newMonth) => {
  if (newMonth) {
    fetchMonthGroups(newMonth);
  }
});

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

function enableCopyMode() {
  copyMode.value = true;
  copyToMonth.value = '';
}

function disableCopyMode() {
  copyMode.value = false;
}

async function onCopyBtnPress() {
  if (!copyToMonth.value || selectedGroups.value.length === 0) return;
  isCopying.value = true;
  try {
    const res = await apiRequest('/api/copy-month-budget', {
      passkey: store.passkey,
      fromMonth: selectedMonth.value,
      toMonth: copyToMonth.value,
      groups: selectedGroups.value,
    });
    alert(`Copied ${res.copied} group budget${res.copied === 1 ? '' : 's'} to ${copyToMonth.value}`);
    disableCopyMode();
  } catch (e) {
    alert('Copy failed: ' + ((e as Error).message || e));
  } finally {
    isCopying.value = false;
  }
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
  <div class="monthly-overview">
    <button @click="goBack" style="margin-bottom: 15px;">← Back to Expenses</button>
    
    <div v-if="isLoading" class="loading">
      Loading budget data...
    </div>
    
    <div v-else class="budget-summary">
      <div class="summary-header">
        <h3>Monthly Summary for</h3>
        <div class="month-selector">
          <input id="month" v-model="selectedMonth" type="month" />
        </div>
      </div>
      
      <div class="total-budget">
        <h4>Overall Budget</h4>
        <BudgetMeter :budgeted="totalBudgeted" :spent="totalSpent" />
      </div>
      
      
      
      <div v-if="monthGroups.length === 0" class="no-data">
        No budget data available for this month.
      </div>
      
      <div v-else class="group-list">
        <div v-if="copyMode" class="group-list-header" style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px;">
          <h4>Budget by Category</h4>
          <button class="select-all-btn" @click="selectAllOrNone">{{ selectAllOrNoneLabel }}</button>
        </div>
        <div v-else class="group-list-header">
          <h4>Budget by Category</h4>
        </div>
        <div 
          v-for="group in monthGroups" 
          :key="group.group" 
          class="budget-group"
          :class="{
            'budget-group-selected': selectedGroups.includes(group.group) && copyMode,
            'can-select': copyMode
          }"
          @click="toggleGroupSelection(group.group)"
        >
          <div class="group-name">{{ group.group }}</div>
          <BudgetMeter :budgeted="group.budgeted" :spent="group.spent" />
        </div>
      </div>
    </div>
    
    <div class="copy-mode-section">
      <template v-if="!copyMode">
        <button class="copy-enable-btn" @click="enableCopyMode">Enable Copy Mode</button>
      </template>
      <template v-else>
        <div class="copy-controls">
          <div class="copy-controls-row">
            <label for="copy-to-month">Copy selected groups to month:</label>
            <input id="copy-to-month" v-model="copyToMonth" type="month" :min="selectedMonth" />
          </div>
          <div class="copy-controls-row buttons">
            <button style="flex: 1" class="copy-action-btn" :disabled="!copyToMonth || selectedGroups.length === 0 || isCopying" @click="onCopyBtnPress">
              {{ isCopying ? 'Copying...' : 'Copy Budgets' }}
            </button>
            <button style="flex: 1" class="copy-cancel-btn" @click="disableCopyMode">Cancel</button>
          </div>
          <div class="copy-controls-row buttons">
            <button class="select-all-none-btn" @click="selectAllOrNone">
              {{ selectAllOrNoneLabel }}
            </button>
          </div>    
        </div>
      </template>
    </div>
  </div>
</template>

<style scoped>
.monthly-overview {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.back-btn {
  margin-bottom: 15px;
  padding: 5px 10px;
  background: #f0f0f0;
  border: 1px solid #ccc;
  border-radius: 4px;
  cursor: pointer;
  color: #333;
}

.back-btn:hover {
  background: #e0e0e0;
}

@media (prefers-color-scheme: dark) {
  .back-btn {
    background: #2c2c2c;
    border-color: #444;
    color: #e0e0e0;
  }
  
  .back-btn:hover {
    background: #3a3a3a;
  }
}

.month-selector {
  display: flex;
  align-items: center;
  gap: 10px;
  justify-content: center;
}

.month-selector input {
  padding: 5px;
  border: 1px solid #ccc;
  border-radius: 4px;
}

.budget-summary {
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 15px;
  background-color: #fff;
}

@media (prefers-color-scheme: dark) {
  .month-selector input {
    background-color: #2c2c2c;
    border-color: #444;
    color: #e0e0e0;
  }

  .budget-summary {
    border-color: #444;
    background-color: #1e1e1e;
  }
}

.summary-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 15px;
}

.summary-header h3 {
  margin: 0;
}

.total-budget {
  margin-bottom: 20px;
  padding-bottom: 20px;
  border-bottom: 1px solid #eee;
}

.selected-groups-summary {
  margin-bottom: 20px;
  padding: 15px;
  border-radius: 8px;
  background-color: #fffde7;
  border: 1px solid #ffd600;
}

@media (prefers-color-scheme: dark) {
  .total-budget {
    border-bottom-color: #333;
  }
  
  .selected-groups-summary {
    background-color: #fff9c4;
    border-color: #ffd600;
  }
}

.group-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.category-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.selection-info {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 0.9em;
  color: #666;
}

.clear-btn {
  padding: 3px 8px;
  font-size: 0.8em;
  border-radius: 4px;
  background-color: transparent;
  border: 1px solid #ccc;
  cursor: pointer;
  transition: all 0.2s ease;
}

.clear-btn:hover {
  background-color: rgba(0, 0, 0, 0.05);
  border-color: #999;
}

@media (prefers-color-scheme: dark) {
  .selection-info {
    color: #aaa;
  }
  
  .clear-btn {
    border-color: #555;
    color: #e0e0e0;
  }
  
  .clear-btn:hover {
    background-color: rgba(255, 255, 255, 0.1);
    border-color: #777;
  }
}

.budget-group {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 10px;
  border-radius: 4px;
  transition: all 0.3s ease;
  cursor: pointer;
}

.budget-group:hover {
  background-color: rgba(0, 0, 0, 0.04);
}

.budget-group-selected {
  background-color: rgba(255, 214, 0, 0.18); /* yellow accent */
  box-shadow: 0 1px 3px rgba(255, 214, 0, 0.12), 0 1px 2px rgba(255, 214, 0, 0.18);
  transform: translateY(-2px);
}

.can-select {
  outline: 2px dashed #ffd600;
  outline-offset: 2px;
  box-shadow: 0 0 0 2px rgba(255, 214, 0, 0.12);
}

@media (prefers-color-scheme: dark) {
  .can-select {
    outline-color: #fff59d;
    box-shadow: 0 0 0 2px rgba(255, 214, 0, 0.18);
  }
}

@media (prefers-color-scheme: dark) {
  .budget-group:hover {
    background-color: rgba(255, 255, 255, 0.3);
  }
  
  .budget-group-selected {
    background-color: rgba(255, 214, 0, 0.2);
    box-shadow: 0 1px 3px rgba(255, 214, 0, 0.22), 0 1px 2px rgba(255, 214, 0, 0.28);
  }
  
  .can-select {
    outline-color: #fff59d;
    box-shadow: 0 0 0 2px rgba(255, 214, 0, 0.35);
  }
}

.group-name {
  font-weight: bold;
  width: 120px;
  flex-shrink: 0;
}

.loading, .no-data {
  text-align: center;
  padding: 20px;
  color: #666;
}

h3, h4 {
  margin-top: 0;
  margin-bottom: 15px;
}

.copy-mode-section {
  margin-top: 40px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.copy-enable-btn {
  background: #43a047;
  color: #fff;
  border: none;
  border-radius: 6px;
  padding: 0.7em 1.5em;
  font-size: 1.1em;
  font-weight: 600;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(67, 160, 71, 0.08);
  transition: background 0.2s;
}

.copy-enable-btn:hover {
  background: #388e3c;
}

.copy-controls {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 8px;
  margin-top: 10px;
}
.copy-controls-row {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 10px;
  width: 100%;
}
.copy-controls-row label {
  min-width: 200px;
  text-align: right;
  margin-right: 8px;
}
.copy-controls-row input[type="month"] {
  flex: 1;
  min-width: 160px;
  max-width: 220px;
}
.copy-controls-row.buttons {
  justify-content: flex-start;
  gap: 12px;
}
.copy-controls-row.buttons button {
  flex: 1;
}
.group-list-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
  gap: 16px;
}
.copy-controls .copy-action-btn,
.copy-controls .copy-cancel-btn {
  width: auto;
  margin: 0;
}

.copy-action-btn {
  background: #ffd600;
  color: #333;
  border: none;
  border-radius: 6px;
  padding: 0.7em 1.5em;
  font-size: 1.1em;
  font-weight: 600;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(255, 214, 0, 0.12);
  transition: background 0.2s;
}

.copy-action-btn:disabled {
  background: #fff9c4;
  color: #aaa;
  cursor: not-allowed;
}

.copy-action-btn:hover:enabled {
  background: #ffe066;
}

.copy-cancel-btn {
  background: transparent;
  color: #888;
  border: 1px solid #ccc;
  border-radius: 6px;
  padding: 0.7em 1.2em;
  font-size: 1em;
  cursor: pointer;
  transition: background 0.2s, color 0.2s;
}

.copy-cancel-btn:hover {
  background: #eee;
  color: #333;
}
</style>
