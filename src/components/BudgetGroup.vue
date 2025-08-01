<script setup lang="ts">
import { ref, computed } from 'vue';
import BudgetMeter from './BudgetMeter.vue';

const props = defineProps({
  group: { 
    type: String, 
    required: true 
  },
  budgeted: { 
    type: Number, 
    required: true 
  },
  spent: { 
    type: Number, 
    required: true 
  }
});
</script>

<template>
  <div class="budget-group">
    <BudgetMeter :budgeted="budgeted" :spent="spent" />
  </div>
</template>

<style scoped>
.budget-group {
  display: flex;
  flex-direction: column;
  width: 100%;
}
</style>
