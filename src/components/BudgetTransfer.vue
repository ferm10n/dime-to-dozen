<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useStore } from '../store';
import BudgetMeter from './BudgetMeter.vue';
import { apiRequest } from '../api-request';

const router = useRouter();
const route = useRoute();
const store = useStore();

const monthGroups = ref<{group: string, spent: number, budgeted: number}[]>([]);
const isLoading = ref(false);
const selectedMonth = ref('');
const selectedFromGroup = ref('');
const transfers = ref<{groupId: string, amount: number}[]>([]);
const isSubmitting = ref(false);

// Generate the current month in YYYY-MM format
const currentMonth = computed(() => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
});

// Filter groups for from selection (over budget)
const overBudgetGroups = computed(() => {
  return monthGroups.value.filter(group => group.spent > group.budgeted);
});

// Filter groups for to selection (under budget or no budget, excluding selected from group)
const underBudgetGroups = computed(() => {
  return monthGroups.value.filter(group => 
    group.spent < group.budgeted && 
    group.group !== selectedFromGroup.value &&
    !transfers.value.some(t => t.groupId === group.group)
  );
});

// Calculate available amount to transfer from selected group
const availableToTransfer = computed(() => {
  const fromGroup = monthGroups.value.find(g => g.group === selectedFromGroup.value);
  return fromGroup ? Math.max(0, fromGroup.spent - fromGroup.budgeted) : 0;
});

// Calculate total transfer amount
const totalTransferAmount = computed(() => {
  return transfers.value.reduce((sum, transfer) => sum + transfer.amount, 0);
});

// Calculate remaining amount to transfer
const remainingToTransfer = computed(() => {
  return availableToTransfer.value - totalTransferAmount.value;
});

// Check if we can submit
const canSubmit = computed(() => {
  return selectedFromGroup.value && 
         transfers.value.length > 0 && 
         totalTransferAmount.value > 0 &&
         totalTransferAmount.value <= availableToTransfer.value;
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
  // Reset selections when month changes
  selectedFromGroup.value = '';
  transfers.value = [];

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

// Watch for changes in selected from group
watch(() => selectedFromGroup.value, () => {
  // Reset transfers when from group changes
  transfers.value = [];
});

function addTransfer() {
  if (underBudgetGroups.value.length > 0) {
    const defaultAmount = Math.min(remainingToTransfer.value, 100); // Default to $100 or remaining amount
    transfers.value.push({
      groupId: underBudgetGroups.value[0].group,
      amount: defaultAmount
    });
  }
}

function removeTransfer(index: number) {
  transfers.value.splice(index, 1);
}

function updateTransferAmount(index: number, amount: number) {
  if (amount >= 0) {
    transfers.value[index].amount = amount;
  }
}

function setMaxTransferAmount() {
  if (transfers.value.length === 1) {
    transfers.value[0].amount = remainingToTransfer.value + transfers.value[0].amount;
  }
}

async function submitTransfer() {
  if (!canSubmit.value) return;
  
  isSubmitting.value = true;
  
  try {
    await apiRequest('/api/transfer-budget', {
      passkey: store.passkey,
      month: selectedMonth.value,
      fromGroup: selectedFromGroup.value,
      transfers: transfers.value
    });
    
    // Refresh data
    await fetchMonthGroups(selectedMonth.value);
    
    // Reset form
    selectedFromGroup.value = '';
    transfers.value = [];
    
    alert('Budget transfer completed successfully!');
  } catch (error) {
    console.error('Error transferring budget:', error);
    alert('Error transferring budget. Please try again.');
  } finally {
    isSubmitting.value = false;
  }
}

function goBack() {
  router.push('/monthly-overview');
}
</script>

<template>
  <div class="budget-transfer">
    <h2 class="page-title">Budget Transfer</h2>
    
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
        <!-- From Group Selection -->
        <div class="section">
          <h3>From Group (Over Budget)</h3>
          <div v-if="overBudgetGroups.length === 0" class="no-data">
            <p>No over-budget groups found for this month</p>
          </div>
          <div v-else>
            <select v-model="selectedFromGroup" class="form-input">
              <option value="">Select group to transfer from...</option>
              <option 
                v-for="group in overBudgetGroups" 
                :key="group.group" 
                :value="group.group"
              >
                {{ group.group }} (Over by ${{ (group.spent - group.budgeted).toFixed(2) }})
              </option>
            </select>
            
            <div v-if="selectedFromGroup" class="group-info">
              <div class="budget-group">
                <div class="group-name">{{ selectedFromGroup }}</div>
                <BudgetMeter 
                  :budgeted="monthGroups.find(g => g.group === selectedFromGroup)?.budgeted || 0" 
                  :spent="monthGroups.find(g => g.group === selectedFromGroup)?.spent || 0" 
                  showAmount 
                />
              </div>
              <p class="available-amount">
                Available to transfer: <strong>${{ availableToTransfer.toFixed(2) }}</strong>
              </p>
            </div>
          </div>
        </div>

        <!-- To Groups Selection -->
        <div v-if="selectedFromGroup" class="section">
          <h3>To Groups (Transfer Destinations)</h3>
          
          <div v-if="transfers.length === 0" class="no-transfers">
            <p>Add destination groups to transfer budget to:</p>
          </div>
          
          <div v-for="(transfer, index) in transfers" :key="index" class="transfer-item">
            <div class="transfer-controls">
              <select v-model="transfer.groupId" class="form-input transfer-group-select">
                <option 
                  v-for="group in underBudgetGroups.concat(monthGroups.filter(g => g.group === transfer.groupId))" 
                  :key="group.group" 
                  :value="group.group"
                >
                  {{ group.group }} (Under by ${{ (group.budgeted - group.spent).toFixed(2) }})
                </option>
              </select>
              
              <div class="amount-input-group">
                <span class="currency-symbol">$</span>
                <input 
                  type="number" 
                  step="0.01" 
                  min="0" 
                  :max="remainingToTransfer + transfer.amount"
                  v-model.number="transfer.amount"
                  @input="updateTransferAmount(index, transfer.amount)"
                  class="form-input amount-input"
                  placeholder="Amount"
                />
              </div>
              
              <button 
                type="button" 
                @click="removeTransfer(index)"
                class="remove-btn"
                title="Remove transfer"
              >
                <span class="material-icons">remove_circle</span>
              </button>
            </div>
          </div>
          
          <div class="transfer-actions">
            <button 
              v-if="underBudgetGroups.length > 0" 
              type="button" 
              @click="addTransfer"
              class="secondary-btn"
            >
              <span class="material-icons">add</span>
              <span>Add Destination</span>
            </button>
            
            <button 
              v-if="transfers.length === 1 && remainingToTransfer > 0" 
              type="button" 
              @click="setMaxTransferAmount"
              class="secondary-btn"
            >
              <span class="material-icons">vertical_align_top</span>
              <span>Transfer All (${{ remainingToTransfer.toFixed(2) }})</span>
            </button>
          </div>
          
          <div class="transfer-summary">
            <p>Transfer Total: <strong>${{ totalTransferAmount.toFixed(2) }}</strong></p>
            <p v-if="remainingToTransfer > 0" class="remaining">
              Remaining: <strong>${{ remainingToTransfer.toFixed(2) }}</strong>
            </p>
            <p v-else-if="remainingToTransfer < 0" class="error">
              Over allocation by: <strong>${{ Math.abs(remainingToTransfer).toFixed(2) }}</strong>
            </p>
          </div>
        </div>

        <!-- Submit Button -->
        <div v-if="selectedFromGroup && transfers.length > 0" class="section">
          <button 
            type="button" 
            @click="submitTransfer"
            :disabled="!canSubmit || isSubmitting"
            class="primary-btn"
          >
            <span v-if="isSubmitting">Applying Transfer...</span>
            <span v-else>Apply Transfer</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.budget-transfer {
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
  margin-bottom: 24px;
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

.section {
  margin-bottom: 32px;
  padding-bottom: 24px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.12);
}

.section:last-child {
  border-bottom: none;
  margin-bottom: 0;
}

.section h3 {
  margin: 0 0 16px 0;
  color: var(--text-primary);
  font-size: 1.2rem;
}

.loading, .no-data {
  padding: 32px;
  text-align: center;
  color: var(--text-secondary);
}

.group-info {
  margin-top: 16px;
}

.budget-group {
  margin-bottom: 12px;
  transition: background-color 0.2s;
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 4px;
  padding: 12px;
}

.group-name {
  font-weight: 500;
  font-size: 1.1rem;
  text-align: left;
  margin-bottom: 8px;
}

.available-amount {
  margin: 8px 0;
  color: var(--accent-color);
  font-size: 1.1rem;
}

.no-transfers {
  color: var(--text-secondary);
  font-style: italic;
}

.transfer-item {
  margin-bottom: 16px;
}

.transfer-controls {
  display: flex;
  gap: 8px;
  align-items: center;
  flex-wrap: wrap;
}

.transfer-group-select {
  flex: 2;
  min-width: 200px;
}

.amount-input-group {
  position: relative;
  flex: 1;
  min-width: 120px;
}

.currency-symbol {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--text-secondary);
  pointer-events: none;
  z-index: 1;
}

.amount-input {
  padding-left: 28px !important;
}

.remove-btn {
  padding: 8px;
  background: transparent;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  transition: background-color 0.2s;
  color: #f44336;
}

.remove-btn:hover {
  background-color: rgba(244, 67, 54, 0.1);
}

.transfer-actions {
  display: flex;
  gap: 12px;
  margin: 16px 0;
  flex-wrap: wrap;
}

.secondary-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  background-color: transparent;
  color: var(--accent-color);
  box-shadow: none;
  border: 1px solid var(--accent-color);
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.secondary-btn:hover {
  background-color: rgba(255, 235, 59, 0.1);
}

.primary-btn {
  background-color: var(--accent-color);
  color: rgba(0, 0, 0, 0.87);
  border: none;
  padding: 12px 24px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 500;
  transition: background-color 0.2s;
  width: 100%;
}

.primary-btn:hover:not(:disabled) {
  background-color: #ffc107;
}

.primary-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.transfer-summary {
  margin-top: 16px;
  padding: 16px;
  background-color: rgba(255, 255, 255, 0.05);
  border-radius: 4px;
}

.transfer-summary p {
  margin: 4px 0;
  font-size: 1.1rem;
}

.transfer-summary .remaining {
  color: var(--accent-color);
}

.transfer-summary .error {
  color: #f44336;
}

@media (max-width: 768px) {
  .transfer-controls {
    flex-direction: column;
    align-items: stretch;
  }
  
  .transfer-group-select,
  .amount-input-group {
    flex: none;
    width: 100%;
  }
  
  .transfer-actions {
    flex-direction: column;
  }
}
</style>