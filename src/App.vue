<script setup lang="ts">
import { ref, watch } from 'vue'
import { useStore } from './store'
import NavDrawer from './components/NavDrawer.vue'

const store = useStore()
const isDrawerOpen = ref(false)

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

function toggleDrawer() {
  isDrawerOpen.value = !isDrawerOpen.value
}
</script>

<template>
  <div class="app-container">
    <header class="app-header">
      <button class="menu-button" @click="toggleDrawer" aria-label="Menu">
        <span class="material-icons">menu</span>
      </button>
      <div class="header-title">
        <img src="./assets/logo.png" class="logo" alt="logo" />
        <h1>Dime to Dozen</h1>
      </div>
    </header>
    
    <main class="main-content">
      <router-view />
    </main>
    
    <NavDrawer 
      :isOpen="isDrawerOpen" 
      @close="isDrawerOpen = false"
      @passkey="setNewPasskey"
    />
  </div>
</template>

<style scoped>
.app-container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  width: 100%;
}

.app-header {
  position: sticky;
  top: 0;
  display: flex;
  align-items: center;
  padding: 8px 16px;
  background-color: #1a1a1a;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  z-index: 10;
}

.menu-button {
  background: none;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 8px;
  margin-right: 8px;
  border-radius: 50%;
  transition: background-color 0.2s;
}

.menu-button:hover {
  background-color: rgba(0, 0, 0, 0.05);
}

.menu-button .material-icons {
  color: rgba(255, 255, 255, 0.87);
}

.header-title {
  display: flex;
  align-items: center;
  gap: 12px;
}

.logo {
  height: 40px;
  will-change: filter;
}

h1 {
  font-size: 1.5rem;
  margin: 0;
  color: rgba(255, 255, 255, 0.87);
}

.main-content {
  flex: 1;
  padding: 16px;
  max-width: 100%;
  width: 100%;
  box-sizing: border-box;
}

@media (min-width: 768px) {
  .main-content {
    max-width: 768px;
    margin: 0 auto;
  }
  
  h1 {
    font-size: 2rem;
  }
}
</style>
