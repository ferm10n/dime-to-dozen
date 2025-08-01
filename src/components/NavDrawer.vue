<script setup lang="ts">
import { computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';

defineProps<{
  isOpen: boolean;
}>();

const emit = defineEmits(['close', 'passkey']);

const router = useRouter();
const route = useRoute();

const navigateTo = (path: string) => {
  router.push(path);
  emit('close');
};

const isActive = (path: string) => {
  return route.path === path;
};
</script>

<template>
  <div class="nav-drawer-backdrop" v-if="isOpen" @click="emit('close')"></div>
  <div class="nav-drawer" :class="{ 'open': isOpen }">
    <div class="nav-items">
      <div class="nav-item" 
           @click="navigateTo('/')" 
           :class="{ 'active': isActive('/') }">
        <span class="material-icons">add_circle</span>
        <span>Create Expense</span>
      </div>
      <div class="nav-item" 
           @click="navigateTo('/monthly-overview')" 
           :class="{ 'active': isActive('/monthly-overview') }">
        <span class="material-icons">bar_chart</span>
        <span>Monthly Overview</span>
      </div>
      <div class="nav-item" 
           @click="navigateTo('/copy-groups')" 
           :class="{ 'active': isActive('/copy-groups') }">
        <span class="material-icons">content_copy</span>
        <span>Copy Groups</span>
      </div>
      <div class="nav-item" @click="emit('passkey')">
        <span class="material-icons">vpn_key</span>
        <span>Set Passkey</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.nav-drawer-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 999;
}

.nav-drawer {
  position: fixed;
  top: 0;
  left: -280px;
  width: 280px;
  height: 100%;
  background-color: #fff;
  box-shadow: 2px 0 8px rgba(0, 0, 0, 0.1);
  transition: left 0.3s ease;
  z-index: 1000;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
}

.nav-drawer.open {
  left: 0;
}

.nav-items {
  padding: 16px 0;
}

.nav-item {
  display: flex;
  align-items: center;
  padding: 16px;
  cursor: pointer;
  transition: background-color 0.2s;
  gap: 16px;
  color: rgba(0, 0, 0, 0.87);
}

.nav-item:hover {
  background-color: rgba(0, 0, 0, 0.05);
}

.nav-item.active {
  background-color: rgba(255, 193, 7, 0.15);
  border-left: 4px solid #FFC107;
  padding-left: 12px;
}

.nav-item .material-icons {
  color: #FFC107;
}

@media (prefers-color-scheme: dark) {
  .nav-drawer {
    background-color: #333;
  }
  
  .nav-item {
    color: rgba(255, 255, 255, 0.87);
  }
  
  .nav-item:hover {
    background-color: rgba(255, 255, 255, 0.05);
  }
  
  .nav-item.active {
    background-color: rgba(255, 193, 7, 0.2);
  }
  
  .nav-item .material-icons {
    color: #FFD600;
  }
}
</style>
