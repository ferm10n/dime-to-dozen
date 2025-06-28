<template>
  <div
    class="budget-group"
    :class="{
      'budget-group-selected': selected && copyMode,
      'can-select': copyMode
    }"
    @click="onGroupClick"
  >
    <div class="group-name">{{ group.group }}</div>
    <BudgetMeter :budgeted="group.budgeted" :spent="group.spent" />
    <template v-if="editing">
      <input
        type="number"
        v-model.number="amount"
        min="0"
        step="0.01"
        style="width: 90px; margin-left: 10px;"
        :disabled="isEditing"
        @click.stop
      />
      <button @click.stop="saveEdit" :disabled="isEditing" class="edit-save-btn">Save</button>
      <button @click.stop="cancelEdit" :disabled="isEditing" class="edit-cancel-btn">Cancel</button>
    </template>
    <template v-else>
      <button @click.stop="startEdit" class="edit-btn">Edit</button>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue';
import BudgetMeter from './BudgetMeter.vue';

const props = defineProps({
  group: { type: Object, required: true },
  selected: { type: Boolean, required: true },
  copyMode: { type: Boolean, required: true },
  editing: { type: Boolean, required: true },
  editingAmount: { type: Number, default: undefined },
  isEditing: { type: Boolean, required: true },
});

const emits = defineEmits([
  'toggle-select',
  'start-edit',
  'cancel-edit',
  'save-edit',
  'update:editingAmount',
]);

const amount = ref<number | undefined>(props.editingAmount);

watch(() => props.editingAmount, (val) => {
  amount.value = val;
});
watch(amount, (val) => {
  emits('update:editingAmount', val);
});

function onGroupClick() {
  emits('toggle-select', props.group.group);
}
function startEdit() {
  emits('start-edit', props.group.group, props.group.budgeted);
}
function cancelEdit() {
  emits('cancel-edit');
}
function saveEdit() {
  emits('save-edit', props.group.group);
}
</script>

<style scoped>
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
  background-color: rgba(255, 214, 0, 0.18);
  box-shadow: 0 1px 3px rgba(255, 214, 0, 0.12), 0 1px 2px rgba(255, 214, 0, 0.18);
  transform: translateY(-2px);
}
.can-select {
  outline: 2px dashed #ffd600;
  outline-offset: 2px;
  box-shadow: 0 0 0 2px rgba(255, 214, 0, 0.12);
}
.group-name {
  font-weight: bold;
  width: 120px;
  flex-shrink: 0;
}
.edit-btn, .edit-save-btn, .edit-cancel-btn {
  margin-left: 10px;
  padding: 0.3em 0.9em;
  font-size: 0.95em;
  border-radius: 4px;
  border: 1px solid #ffd600;
  background: #fffde7;
  color: #b28900;
  cursor: pointer;
  transition: background 0.2s, color 0.2s;
}
.edit-btn:hover, .edit-save-btn:hover {
  background: #ffe066;
  color: #333;
}
.edit-cancel-btn {
  border: 1px solid #ccc;
  background: #fafafa;
  color: #888;
}
.edit-cancel-btn:hover {
  background: #eee;
  color: #333;
}
.edit-save-btn:disabled, .edit-cancel-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
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
  .edit-btn, .edit-save-btn {
    background: #3a3200;
    color: #ffd600;
    border-color: #ffd600;
  }
  .edit-btn:hover, .edit-save-btn:hover {
    background: #5c4b00;
    color: #fffde7;
  }
  .edit-cancel-btn {
    background: #222;
    color: #bbb;
    border-color: #555;
  }
  .edit-cancel-btn:hover {
    background: #333;
    color: #ffd600;
  }
}
</style>
