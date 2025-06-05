<script setup lang="ts">
import { ref } from 'vue'

const expenseData = ref({
  amount: 0,
  name: '',
  group: '',
})

import { useStore } from '../store'
const store = useStore()

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
      console.log('Expense posted:', data)
      expenseData.value = {
        amount: 0,
        name: '',
        group: '',
      }
      alert('Expense posted successfully!')
    })
    .catch((error) => {
      console.error('Error posting expense:', error)
      alert('Failed to post expense. Check console for details.')
    })
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
      console.log('Fetched expenses:', data)
      // Display expenses in a more readable format
      const formattedData = JSON.stringify(data, null, 2)
      const newWindow = window.open()
      if (newWindow) {
        newWindow.document.write(`<pre>${formattedData}</pre>`)
      } else {
        alert('Failed to open new window. Please check your popup blocker settings.')
      }
    })
    .catch((error) => {
      console.error('Error fetching expenses:', error)
      alert('Failed to fetch expenses. Check console for details.')
    })
}
</script>

<template>
  <div class="card">
    <div class="expense-form">
      <h3>Create New Expense</h3>
      <div class="form-group">
        <label for="name">Name:</label>
        <input id="name" v-model="expenseData.name" type="text" />
      </div>
      
      <div class="form-group">
        <label for="amount">Amount:</label>
        <input id="amount" v-model="expenseData.amount" type="number" step="0.01" />
      </div>
      
      <div class="form-group">
        <label for="group">Group:</label>
        <input id="group" v-model="expenseData.group" type="text" />
      </div>
      
      <div class="form-group">
        <label for="created_by">Created By:</label>
        <input id="created_by" v-model="store.createdBy" type="text" />
      </div>
      
      <button type="button" @click="testExpense()">Post Expense</button>
      <button type="button" @click="viewExpenses()">View All Expenses</button>
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

.form-group input {
  width: 100%;
  padding: 5px;
  border: 1px solid #ccc;
  border-radius: 4px;
}

button {
  margin-top: 10px;
  margin-right: 10px;
}
</style>
