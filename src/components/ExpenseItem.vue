<script setup lang="ts">
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

const formattedDate = new Date(props.expense.created_at).toLocaleDateString(undefined, {
  year: 'numeric',
  month: 'short',
  day: 'numeric'
});
</script>

<template>
  <div class="expense-item elevation-1">
    <div class="expense-content">
      <div class="expense-header">
        <div class="expense-amount">${{ expense.amount.toFixed(2) }}</div>
        <div class="expense-date">{{ formattedDate }}</div>
      </div>
      <div class="expense-note" v-if="expense.note">{{ expense.note }}</div>
      <div class="expense-group" v-if="showGroup">Group: {{ expense.group }}</div>
      <div class="expense-creator">Added by: {{ expense.created_by }}</div>
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
</style>
