<script setup lang="ts">
import { computed, ref, watch, onMounted } from 'vue'

interface Props {
  budgeted: number
  spent: number
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
</script>

<template>
  <div class="budget-meter">
    <div class="bar-outer">
      <div
        class="bar-inner"
        :style="{
          width: (fillRatio * 100) + '%',
          background: overBudget ? '#e74c3c' : '#4caf50'
        }"
      />

      <div
        v-if="fillRatio < 1"
        class="bar-inner-empty"
        :style="{ width: ((1 - fillRatio) * 100) + '%' }"
      />

      <span class="bar-text">
        $ {{ animatedSpent.toFixed(2) }} / {{ animatedBudgeted.toFixed(2) }}
      </span>
    </div>
  </div>
</template>

<style scoped>
.budget-meter {
  width: 100%;
  margin: 10px 0;
}
.bar-outer {
  display: flex;
  width: 100%;
  height: 32px;
  background: #eee;
  border-radius: 6px;
  overflow: hidden;
  position: relative;
}
.bar-inner {
  display: flex;
  align-items: center;
  height: 100%;
  transition: width 0.3s;
  color: #fff;
  font-size: 1em;
  white-space: nowrap;
  z-index: 1;
}
.bar-inner-empty {
  height: 100%;
  background: transparent;
}
.bar-text {
  font-weight: bold;
  position: absolute;
  left: 0;
  right: 0;
  text-align: center;
  color: #000;
  pointer-events: none;
  z-index: 2;
  line-height: 32px; /* Match height of .bar-outer */
  top: 0;
}
</style>
