<script setup lang="ts">
// This starter template is using Vue 3 <script setup> SFCs
// Check out https://vuejs.org/api/sfc-script-setup.html#script-setup
import { watch } from 'vue'
import CreateExpense from './components/CreateExpense.vue'
import { useStore } from './store'

const store = useStore()

watch(() => store.passkey, passkey => {
  if (!passkey) {
    const newPasskey = prompt('Please enter a passkey to access the app:')
    if (newPasskey) {
      store.passkey = newPasskey
    } else {
      alert('You must enter a passkey to access the app.')
      window.location.reload()
    }
  }
}, { immediate: true })

function setNewPasskey() {
  const newPasskey = prompt('Please enter a new passkey:')
  if (newPasskey) {
    store.passkey = newPasskey
    alert('Passkey updated successfully!')
  } else {
    alert('You must enter a passkey.')
  }
}
</script>

<template>
  <div>
    <img src="./assets/logo.png" class="logo" alt="logo" />
  </div>
  <h1>Dime to Dozen</h1>
  <CreateExpense />
  <p>
    <button @click="setNewPasskey">Set Passkey</button>
  </p>
</template>

<style scoped>
.logo {
  height: 6em;
  padding: 1.5em;
  will-change: filter;
}
.logo:hover {
  filter: drop-shadow(0 0 2em #646cffaa);
}
</style>
