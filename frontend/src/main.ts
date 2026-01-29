import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
import { useAuth } from "@/composables/useAuth";

const app = createApp(App)

app.use(createPinia())

const auth = useAuth()
auth.init().then(() => {
    console.log('[AUTH] Auth initialized')
    app.use(router)
    app.mount('#app')
}).catch(err => {
    console.error('[AUTH] Auth initialization failed:', err)
    // Even if auth fails, mount the app
    app.use(router)
    app.mount('#app')
})