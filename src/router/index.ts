
import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'
import HomeView from '@/views/HomeView.vue'
import ChatMain from '@/views/chat/chat.vue';
import ContactMain from '@/views/chat/contact.vue'
import Login from '@/views/login/login.vue'
import Layout from "@/layout/layout.vue"

export const routes: Array<RouteRecordRaw> = [
  {
    path: '/login',
    name: 'login',
    component: Login,
    meta:{
      hidden:true,
    }
  },
  {
    path:"/",
    component:Layout,
    redirect:"chat",
    children:[
      {
        path: '/chat',
        name: 'chat',
        meta:{
          title:"聊天",
          icon:new URL("../assets/icon/shequ.png",import.meta.url).href,
        },
        component: ChatMain
      },
      {
        path: '/contact',
        name: 'contact',
        meta:{
          title:"联系人",
          icon:new URL("../assets/icon/tongxunlu.png",import.meta.url).href,
        },
        component: ContactMain
      },
      // {
      //   path: '/home',
      //   name: 'home',
      //   meta:{
      //     title:"应用",
      //     icon:new URL("../assets/icon/gengduofuwu.png",import.meta.url).href,
      //   },
      //   component: HomeView
      // },
      
    ]
  }
  
]

const router = createRouter({
  history: createWebHistory(),
  routes
})


export default router
