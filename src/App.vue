<template>
  <router-view />
</template>
<script setup>
import { getCurrentInstance, watch, computed, onMounted } from "vue";
import { CbEvents } from "open-im-sdk";
import router from "./router";
import { OpenIMStore } from "./store/openim";
import { userStore } from "./store/user";
import { register } from "@tauri-apps/api/globalShortcut";

//判定是否需要登录
console.log(userStore());
const { proxy } = getCurrentInstance();

onMounted(async () => {
  var token = localStorage.getItem("token");
  var uid = localStorage.getItem("uid");
  if (!token || !uid) {
    router.push({ name: "login" });
  } else {
    userStore().userLogin(token, uid);
    OpenIMStore().openimLogin(proxy.$OpenIM, token, uid);
  }

  // 禁用右键
  // document.oncontextmenu=new Function("event.returnValue=false")

  await register("CommandOrControl+Shift+C", (e) => {
    console.log("Shortcut triggered", e);
  })
    .then((e) => {
      console.log("e", e);
    })
    .catch((e) => {
      console.log("err", e);
    });
});
userStore().$subscribe((mutations, state) => {
  if (!state.token) {
    console.log("需要登录");
    router.push({ name: "login" });
  } else {
    const uid = userStore.uid;
    userStore().userLogin(state.token, state.uid);
    OpenIMStore().openimLogin(proxy.$OpenIM, state.token, state.uid);
  }
});
</script>
<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}
.n-menu.n-menu--collapsed .n-menu-item-content.n-menu-item-content--selected::before {
  background-color: #fff !important;
}
nav {
  padding: 30px;
}

nav a {
  font-weight: bold;
  color: #2c3e50;
}

nav a.router-link-exact-active {
  color: #42b983;
}
</style>
