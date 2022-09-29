import { OpenIMSDK } from 'open-im-sdk'
import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import {createPinia} from 'pinia'
import contextmenu from "v-contextmenu";
import "v-contextmenu/dist/themes/default.css";

const app  = createApp(App)
app.config.globalProperties.$OpenIM= new OpenIMSDK()
app.use(createPinia()).use(contextmenu).use(router).mount('#app')
