<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useStore } from '../store';
import BudgetMeter from './BudgetMeter.vue';

const router = useRouter();
const store = useStore();

const monthGroups = ref<{group: string, spent: number, budgeted: number}[]>([]);
const isLoading = ref(false);
const selectedMonth = ref('');

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
  fetch('/api/get-month-groups', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      month,
      passkey: store.passkey,
    }),
  })
    .then(res => res.json())
    .then(data => {
      monthGroups.value = Array.isArray(data) ? data : [];
      isLoading.value = false;
    })
    .catch((error) => {
      console.error('Error fetching month groups:', error);
      monthGroups.value = [];
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
        <h4>Budget by Category</h4>
        <div v-for="group in monthGroups" :key="group.group" class="budget-group">
          <div class="group-name">{{ group.group }}</div>
          <BudgetMeter :budgeted="group.budgeted" :spent="group.spent" />
        </div>
      </div>
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
  color: #333; /* Added text color for the back button */
}

.back-btn:hover {
  background: #e0e0e0;
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

.group-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.budget-group {
  display: flex;
  align-items: center;
  gap: 15px;
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
</style>
