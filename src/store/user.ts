import { FullUserItem } from "open-im-sdk";
import { defineStore } from "pinia";
import { OpenIMStore } from "./openim";
export const userStore = defineStore("user", {
  state: () => {
    return {
      token: localStorage.getItem("token"),
      uid: localStorage.getItem("uid"),
      isLogin: false,
      userInfo:<FullUserItem>null
    };
  },
  getters: {},
  actions: {
    userLogin(token: string, uid: string) {
      if (this.isLogin) {
        return;
      }
      localStorage.setItem("token", token)
      localStorage.setItem("uid", uid)
      this.isLogin = true;
      this.token = token;
      this.uid = uid;
    },
    userLoginOut() {
      localStorage.removeItem("token")
      localStorage.removeItem("uid")
      this.isLogin = false;
      this.token = "";
      this.uid = "";
      const { openimLoginOut } = OpenIMStore();
      openimLoginOut()
    },
    openUserInfo(u:FullUserItem){
      this.userInfo = u
    }
  },
});
