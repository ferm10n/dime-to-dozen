<script setup lang="ts">
import { computed, ref, watch, onMounted } from 'vue'

interface Props {
  budgeted: number
  spent: number
  showAmount?: boolean
}

const props = defineProps<Props>()

const animatedSpent = ref(0)
const animatedBudgeted = ref(0)
const ANIMATION_DURATION = 400 // Animation duration in ms

const animateValue = (start: number, end: number, setter: (val: number) => void) => {
  const startTime = performance.now()
  
  const updateValue = (timestamp: number) => {
    const elapsed = timestamp - startTime
    if (elapsed >= ANIMATION_DURATION) {
      setter(end)
      return
    }
    
    const progress = elapsed / ANIMATION_DURATION
    setter(start + (end - start) * progress)
    requestAnimationFrame(updateValue)
  }
  
  requestAnimationFrame(updateValue)
}

// Initialize animations
onMounted(() => {
  animatedSpent.value = props.spent
  animatedBudgeted.value = props.budgeted
})

// Watch for changes in props
watch(() => props.spent, (newVal) => {
  animateValue(animatedSpent.value, newVal, (val) => animatedSpent.value = val)
})

watch(() => props.budgeted, (newVal) => {
  animateValue(animatedBudgeted.value, newVal, (val) => animatedBudgeted.value = val)
})

const fillRatio = computed(() => {
  if (props.budgeted <= 0) return 1
  return Math.min(props.spent, props.budgeted) / props.budgeted
})

const overBudget = computed(() => props.spent > props.budgeted)

const barColor = computed(() => {
  if (overBudget.value) return '#e74c3c'; // Red
  return '#4caf50'; // Green - good
})

const percentUsed = computed(() => {
  if (props.budgeted <= 0) return 0;
  return Math.round((props.spent / props.budgeted) * 100);
})

const amountRemaining = computed(() => {
  return Math.max(0, props.budgeted - props.spent);
})
</script>

<template>
  <div class="budget-meter">
    <div class="meter-info" v-if="props.showAmount">
      <div class="meter-value">{{ percentUsed }}% used</div>
      <div class="meter-remaining" :class="{ 'over-budget': overBudget }">
        {{ overBudget ? 'Over budget by' : 'Remaining' }}: ${{ overBudget ? (props.spent - props.budgeted).toFixed(2) : amountRemaining.toFixed(2) }}
      </div>
    </div>
    
    <div class="bar-outer">
      <div
        class="bar-inner"
        :style="{
          width: (fillRatio * 100) + '%',
          background: barColor
        }"
      />

      <div
        v-if="fillRatio < 1"
        class="bar-inner-empty"
        :style="{ width: ((1 - fillRatio) * 100) + '%' }"
      />

      <span class="bar-text">
        ${{ animatedSpent.toFixed(2) }} / ${{ animatedBudgeted.toFixed(2) }}
      </span>
    </div>
  </div>
</template>

<style scoped>
.budget-meter {
  width: 100%;
  /* margin: 10px 0; */
}

.meter-info {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
  font-size: 0.9rem;
}

.meter-value {
  font-weight: 500;
}

.meter-remaining {
  color: #4CAF50;
}

.meter-remaining.over-budget {
  color: #F44336;
}

.bar-outer {
  display: flex;
  width: 100%;
  height: 24px;
  background: rgba(0, 0, 0, 0.06);
  border-radius: 4px;
  overflow: hidden;
  position: relative;
  box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.1);
}

.bar-inner {
  display: flex;
  align-items: center;
  height: 100%;
  transition: width 0.3s ease-out, background-color 0.3s;
  z-index: 1;
}

.bar-inner-empty {
  height: 100%;
  background: transparent;
}

.bar-text {
  font-weight: 500;
  position: absolute;
  left: 0;
  right: 0;
  text-align: center;
  color: rgba(0, 0, 0, 0.87);
  pointer-events: none;
  z-index: 2;
  line-height: 24px;
  top: 0;
  font-size: 0.9rem;
}

@media (prefers-color-scheme: dark) {
  .bar-outer {
    background: rgba(255, 255, 255, 0.1);
  }
  
  .bar-text {
    color: rgba(0, 0, 0, 0.87);
  }
}
</style>
