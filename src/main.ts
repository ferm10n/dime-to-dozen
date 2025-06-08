import './style.css'
import { createApp } from 'vue'
import App from './App.vue'
import { createPinia } from 'pinia'
import { createRouter, createWebHistory } from 'vue-router'
import CreateExpense from './components/CreateExpense.vue'
import MonthlyOverview from './components/MonthlyOverview.vue'

const routes = [
  { path: '/', component: CreateExpense },
  { path: '/monthly-overview', component: MonthlyOverview }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

const app = createApp(App)
const pinia = createPinia()
app.use(pinia)
app.use(router)
app.mount('#app')