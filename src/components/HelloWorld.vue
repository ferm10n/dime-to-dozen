<script setup lang="ts">
import { ref } from 'vue'

defineProps<{ msg: string }>()

const count = ref(0)

const expenseData = ref({
  amount: 420.69,
  name: 'Test expense',
  group: 'Test group',
  created_by: ''
})

function testExpense() {
  fetch('/api/expenses', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(expenseData.value),
  })
    .then((response) => response.json())
    .then((data) => {
      console.log('Expense posted:', data)
      // Clear out all fields except created_by
      expenseData.value = {
        amount: 0,
        name: '',
        group: '',
        created_by: expenseData.value.created_by
      }
      alert('Expense posted successfully!')
    })
    .catch((error) => {
      console.error('Error posting expense:', error)
      alert('Failed to post expense. Check console for details.')
    })
}

function viewExpenses() {
  window.location.href = '/api/expenses';
}
</script>

<template>
  <h1>{{ msg }}</h1>

  <div class="card">
    <button type="button" @click="count++">count is {{ count }}</button>
    
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
        <input id="created_by" v-model="expenseData.created_by" type="text" />
      </div>
      
      <button type="button" @click="testExpense()">Post Expense</button>
      <button type="button" @click="viewExpenses()">View All Expenses</button>
    </div>
    
    <p>
      Edit
      <code>components/HelloWorld.vue</code> to test HMR
    </p>
  </div>

  <p>
    Check out
    <a href="https://vuejs.org/guide/quick-start.html#local" target="_blank"
      >create-vue</a
    >, the official Vue + Vite starter
  </p>
  <p>
    Install
    <a href="https://github.com/johnsoncodehk/volar" target="_blank">Volar</a>
    in your IDE for a better DX
  </p>
  <p class="read-the-docs">Click on the Vite and Vue logos to learn more</p>
</template>

<style scoped>
.read-the-docs {
  color: #888;
}

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
