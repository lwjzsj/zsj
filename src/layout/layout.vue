<template>
  <n-space vertical size="large">
    <n-layout has-sider>
      <n-layout-sider
        bordered
        collapse-mode="width"
        :collapsed-width="64"
        :width="64"
        :collapsed="collapsed"
      >
      <div style="display: ;flex;flex-direction: column;height:100%">
        <n-avatar v-if="userStore().userInfo" :src="userStore().userInfo.faceURL"></n-avatar>
        <n-menu  :options="menuOptions" :icon-size="0" />
        <div @click="userStore().userLoginOut()">
        退出
        </div>
      </div>
        
      </n-layout-sider>
      <n-layout style="height: 100vh">
        <router-view v-slot="{ Component }">
          <keep-alive>
            <component :is="Component" />
          </keep-alive>
        </router-view>
      </n-layout>
    </n-layout>
  </n-space>
</template>
<script lang="ts" setup>
import router, { routes } from "@/router";
import { OpenIMStore } from "@/store/openim";
import { userStore } from "@/store/user";
import {
  MenuOption,
  NSpace,
  NLayout,
  NLayoutSider,
  NMenu,
  NImage,
  NBadge,
  NAvatar
} from "naive-ui";
import { h, ref } from "vue";
import { RouterLink } from "vue-router";
//顶级菜单不允许展开
const collapsed = true;
//菜单
const menuOptions = ref([]);
console.log(routes.filter((r) => r.path == "/")[0]);
routes
  .filter((r) => r.path == "/")[0]
  .children.map((v) => {
    menuOptions.value.push({
      label: () =>
        h(
          RouterLink,
          {
            to: {
              name: v.name,
            },
          },
          { default: () => v.meta.title }
        ),
      key: `${v.path}_${String(v.name)}`,
      icon: renderIcon(v.meta.icon as string, v.path),
    });
  });
function renderIcon(icon: string, path: string) {
  if (path == "/chat") {
    return () =>
      h(
        NBadge,
        { value: OpenIMStore().unReadCount,max:99 },
        h(NImage, {
          src: icon,
          style: { backgroundColor: "#ffffff", objectFit: "cover" },
          width: 35,
          height: 35,
          previewDisabled: true,
        })
      );
  } else if (path == "/contact") {
    return () =>
      h(
        NBadge,
        { value: OpenIMStore().appendCount },
        h(NImage, {
          src: icon,
          style: { backgroundColor: "#ffffff", objectFit: "cover" },
          width: 40,
          height: 40,
          previewDisabled: true,
        })
      );
  }
  return () =>
    h(
      NBadge,
      { value: 0 },
      h(NImage, {
        src: icon,
        style: { backgroundColor: "#ffffff", objectFit: "cover" },
        width: 40,
        height: 40,
        previewDisabled: true,
      })
    );
}
</script>
<style scoped>
.layout_box {
  width: 100%;
  height: 100%;
  display: flex;
}

.parent_menu {
  width: 48px;
  height: 100%;
  background-color: #252525;
  color: #ffffff;
}
</style>
<style>
  .n-menu{
    flex:1;
    /* height: -webkit-fill-available; */
  }
</style>
