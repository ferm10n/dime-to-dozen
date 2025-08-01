<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useStore } from '../store';
import BudgetMeter from './BudgetMeter.vue';
import BudgetGroup from './BudgetGroup.vue';
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
const editingGroup = ref<string | null>(null);
const editingAmount = ref<number | undefined>(undefined);
const isEditing = ref(false);

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

function startEditGroup(group: string, amount: number) {
  editingGroup.value = group;
  editingAmount.value = amount;
}
function cancelEditGroup() {
  editingGroup.value = null;
  editingAmount.value = undefined;
}
async function saveEditGroup(month: string, group: string) {
  if (editingAmount.value == null || isNaN(editingAmount.value)) return;
  isEditing.value = true;
  try {
    await apiRequest('/api/edit-budget-group', {
      passkey: store.passkey,
      month,
      group,
      amount: editingAmount.value,
    });
    // Update local data
    const idx = monthGroups.value.findIndex(g => g.group === group);
    if (idx !== -1) monthGroups.value[idx].budgeted = editingAmount.value;
    cancelEditGroup();
  } catch (e) {
    alert('Failed to update budget: ' + ((e as Error).message || e));
  } finally {
    isEditing.value = false;
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
        <div class="budget-summary">
          <div class="total-budget">
            <BudgetMeter 
              :budgeted="totalBudgeted" 
              :spent="totalSpent" 
              :showAmount="true" 
            />
          </div>
        </div>
        
        <div v-if="copyMode" class="copy-mode-section">
          <div class="copy-controls">
            <div class="copy-controls-row">
              <label for="copyToMonth">Copy to Month:</label>
              <input 
                type="month" 
                id="copyToMonth" 
                v-model="copyToMonth" 
                class="form-input"
              />
            </div>
            <div class="copy-controls-row">
              <p>Selected Groups: {{ selectedGroups.length }}</p>
            </div>
            <div class="copy-controls-row buttons">
              <button 
                class="copy-action-btn" 
                @click="onCopyBtnPress" 
                :disabled="copyToMonth === '' || selectedGroups.length === 0 || isCopying"
              >
                <span class="material-icons">content_copy</span> Copy
              </button>
              <button class="copy-cancel-btn" @click="disableCopyMode">
                <span class="material-icons">cancel</span> Cancel
              </button>
            </div>
          </div>
        </div>
        
        <div class="group-list">
          <div class="group-list-header">
            <h3>Budget Groups</h3>
            <div class="group-actions">
              <button v-if="!copyMode" class="copy-enable-btn" @click="enableCopyMode">
                <span class="material-icons">content_copy</span> Copy Groups
              </button>
              <button v-if="copyMode" class="secondary-btn" @click="selectAllOrNone">
                {{ selectAllOrNoneLabel }}
              </button>
            </div>
          </div>
          
          <div 
            v-for="group in monthGroups" 
            :key="group.group"
            class="budget-group"
            :class="{ 
              'budget-group-selected': selectedGroups.includes(group.group),
              'can-select': copyMode 
            }"
            @click="copyMode ? toggleGroupSelection(group.group) : null"
          >
            <div class="group-header">
              <div class="group-name">{{ group.group }}</div>
              <button 
                v-if="!copyMode" 
                class="edit-btn" 
                @click="startEditGroup(group.group, group.budgeted)"
              >
                <span class="material-icons">edit</span>
              </button>
            </div>
            <BudgetGroup 
              :group="group.group" 
              :spent="group.spent" 
              :budgeted="group.budgeted" 
            />
          </div>
        </div>
      </div>
    </div>
    
    <!-- Edit Group Modal -->
    <div class="edit-group-modal" v-if="editingGroup">
      <div class="edit-group-content card elevation-4">
        <div class="edit-group-header">
          <h3 class="edit-group-title">Edit Budget: {{ editingGroup }}</h3>
          <button class="edit-group-close" @click="cancelEditGroup">
            <span class="material-icons">close</span>
          </button>
        </div>
        <div class="edit-group-body">
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
        <div class="edit-group-footer">
          <button 
            class="edit-group-save"
            @click="saveEditGroup(selectedMonth, editingGroup)"
            :disabled="editingAmount === undefined || isNaN(editingAmount) || isEditing"
          >
            <span class="material-icons">save</span> Save
          </button>
          <button 
            class="edit-group-cancel"
            @click="cancelEditGroup"
            :disabled="isEditing"
          >
            <span class="material-icons">cancel</span> Cancel
          </button>
        </div>
      </div>
    </div>
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
  margin-bottom: 32px;
  transition: background-color 0.2s;
}

.budget-group-selected {
  background-color: rgba(255, 235, 59, 0.1);
  border: 1px solid var(--accent-color);
  border-radius: 4px;
  padding: 8px;
}

.can-select {
  cursor: pointer;
  border: 1px solid rgba(0, 0, 0, 0.12);
  border-radius: 4px;
  padding: 8px;
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

.copy-mode-section {
  margin: 16px 0;
  padding: 16px;
}

.copy-controls {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.copy-controls-row {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 8px;
}

.copy-controls-row label {
  font-weight: 500;
}

.copy-controls-row.buttons {
  flex-direction: row;
  justify-content: flex-end;
  margin-top: 8px;
}

.copy-enable-btn,
.secondary-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  background-color: transparent;
  color: var(--accent-color);
  box-shadow: none;
  border: 1px solid var(--accent-color);
}

.copy-enable-btn:hover,
.secondary-btn:hover {
  background-color: rgba(255, 235, 59, 0.1);
}

.copy-action-btn {
  display: flex;
  align-items: center;
  gap: 8px;
}

.copy-cancel-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  background-color: transparent;
  color: var(--text-primary);
  box-shadow: none;
}

.copy-cancel-btn:hover {
  background-color: rgba(0, 0, 0, 0.05);
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

.edit-group-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 16px;
}

.edit-group-content {
  width: 100%;
  max-width: 500px;
  background-color: var(--surface);
  border-radius: 8px;
  overflow: hidden;
}

.edit-group-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  background-color: var(--accent-color);
  color: var(--text-on-primary);
}

.edit-group-title {
  margin: 0;
  font-size: 1.2rem;
}

.edit-group-close {
  background: transparent;
  border: none;
  color: var(--text-on-primary);
  cursor: pointer;
  padding: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  box-shadow: none;
}

.edit-group-close:hover {
  background-color: rgba(0, 0, 0, 0.1);
}

.edit-group-body {
  padding: 16px;
}

.edit-group-footer {
  padding: 16px;
  display: flex;
  justify-content: flex-end;
  gap: 8px;
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
  background-color: rgba(0, 0, 0, 0.05);
}

@media (prefers-color-scheme: dark) {
  .form-input {
    border-color: rgba(255, 255, 255, 0.12);
    color: var(--text-primary);
  }
  
  .can-select {
    border-color: rgba(255, 255, 255, 0.12);
  }
  
  .budget-group-selected {
    background-color: rgba(255, 235, 59, 0.2);
  }
  
  .copy-cancel-btn:hover,
  .edit-group-cancel:hover {
    background-color: rgba(255, 255, 255, 0.05);
  }
}
</style>
