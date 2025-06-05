<script setup lang="ts">
import { ref, onMounted } from 'vue'

const expenseData = ref({
  amount: 0,
  note: '',
  group: '',
})

const groups = ref<string[]>([]);
const isAddingNewGroup = ref(false);
const newGroupName = ref('');
const isLoading = ref(false);

import { useStore } from '../store'
const store = useStore()

onMounted(() => {
  fetchGroups();
});

function fetchGroups() {
  isLoading.value = true;
  fetch('/api/get-groups', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      passkey: store.passkey,
    }),
  })
    .then((response) => response.json())
    .then((data) => {
      groups.value = data;
      isLoading.value = false;
    })
    .catch((error) => {
      console.error('Error fetching groups:', error);
      isLoading.value = false;
    });
}

function testExpense() {
  fetch('/api/post-expense', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      ...expenseData.value,
      created_by: store.createdBy,
      passkey: store.passkey,
    }),
  })
    .then((response) => response.json())
    .then((data) => {
      console.log('Expense posted:', data);
      expenseData.value = {
        amount: 0,
        note: '',
        group: expenseData.value.group, // Keep the last used group
      };
      alert('Expense posted successfully!');
    })
    .catch((error) => {
      console.error('Error posting expense:', error);
      alert('Failed to post expense. Check console for details.');
    });
}

function showAddGroupForm() {
  isAddingNewGroup.value = true;
}

function cancelAddGroup() {
  isAddingNewGroup.value = false;
  newGroupName.value = '';
}

function addNewGroup() {
  if (newGroupName.value.trim().length < 3) {
    alert('Group name must be at least 3 characters long');
    return;
  }
  
  // Add the new group to the existing list
  if (!groups.value.includes(newGroupName.value)) {
    groups.value.push(newGroupName.value);
    groups.value.sort(); // Keep the list alphabetical
  }
  
  // Set the current group to the new group
  expenseData.value.group = newGroupName.value;
  
  // Reset the form
  isAddingNewGroup.value = false;
  newGroupName.value = '';
}

function viewExpenses() {
  fetch('/api/get-expenses', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      passkey: store.passkey,
    }),
  })
    .then((response) => response.json())
    .then((data) => {
      console.log('Fetched expenses:', data);
      // Display expenses in a more readable format
      const formattedData = JSON.stringify(data, null, 2);
      const newWindow = window.open();
      if (newWindow) {
        newWindow.document.write(`<pre>${formattedData}</pre>`);
      } else {
        alert('Failed to open new window. Please check your popup blocker settings.');
      }
    })
    .catch((error) => {
      console.error('Error fetching expenses:', error);
      alert('Failed to fetch expenses. Check console for details.');
    });
}
</script>

<template>
  <div class="card">
    <div class="expense-form">
      <h3>Create New Expense</h3>
      
      <div class="form-group">
        <label for="group">Group:</label>
        <div class="group-selector">
          <select v-if="!isAddingNewGroup" id="group" v-model="expenseData.group" :disabled="isLoading">
            <option value="" disabled>Select a group</option>
            <option v-for="group in groups" :key="group" :value="group">{{ group }}</option>
          </select>
          <button v-if="!isAddingNewGroup" type="button" class="emoji-btn" @click="showAddGroupForm" title="Add New Group">➕</button>
          
          <div v-if="isAddingNewGroup" class="new-group-form">
            <div class="group-selector">
              <input id="newGroup" v-model="newGroupName" type="text" placeholder="Enter new group name" />
              <button type="button" class="emoji-btn" @click="addNewGroup" title="Save">✅</button>
              <button type="button" class="emoji-btn" @click="cancelAddGroup" title="Cancel">❌</button>
            </div>
          </div>
        </div>
      </div>
      
      <div class="form-group">
        <label for="amount">Amount:</label>
        <input id="amount" v-model="expenseData.amount" type="number" step="0.01" />
      </div>
      
      <div class="form-group">
        <label for="note">Note:</label>
        <input id="note" v-model="expenseData.note" type="text" />
      </div>
      
      <div class="form-group">
        <label for="created_by">Created By:</label>
        <input id="created_by" v-model="store.createdBy" type="text" />
      </div>
      
      <div class="form-actions">
        <button type="button" @click="testExpense()" :disabled="!expenseData.group || expenseData.amount <= 0" class="action-btn">
          📝 Post Expense
        </button>
        <button type="button" @click="viewExpenses()" class="action-btn">
          👁️ View All
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.expense-form {
  margin: 20px 0;
  padding: 15px;
  border: 1px solid #ddd;
  border-radius: 8px;
}

.form-group {
  margin-bottom: 10px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.form-group label {
  margin-bottom: 5px;
}

.form-group input, .form-group select {
  width: 100%;
  padding: 5px;
  border: 1px solid #ccc;
  border-radius: 4px;
}

.group-selector {
  width: 100%;
  display: flex;
  flex-direction: row;
  gap: 8px;
  align-items: center;
}

.group-selector select {
  flex: 1;
}

.new-group-form {
  width: 100%;
}

.form-actions {
  display: flex;
  gap: 10px;
  margin-top: 10px;
}

.emoji-btn {
  white-space: nowrap;
  padding: 5px 10px;
  font-size: 1em;
  height: fit-content;
  background: #f0f0f0;
  border: 1px solid #ccc;
  border-radius: 4px;
  cursor: pointer;
  margin: 0;
}

.emoji-btn:hover {
  background: #e0e0e0;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 5px 10px;
}

button {
  margin-right: 10px;
}

button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>
