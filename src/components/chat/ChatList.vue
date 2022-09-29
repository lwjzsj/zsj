<template>
    <n-scrollbar>
        <div  v-for="item in list" :key="item.conversationID" @click="click(item)">
            <item :item="item"></item>
        </div>
    </n-scrollbar>
    
</template>
<script lang="ts" setup>
import { ConversationItem, MessageItem } from "open-im-sdk";
import { OpenIMStore } from "@/store/openim";
import { NScrollbar } from "naive-ui";
import { getCurrentInstance, onMounted, ref, watch, watchEffect } from "vue"
import { computed } from "vue"
import Item from "./chatlist/item.vue";

const ctx = getCurrentInstance()
const openim = ctx.proxy.$OpenIM
const _list = ref<ConversationItem[]>([])


onMounted(() => {
    console.log(OpenIMStore().isLogin)
    list.value = OpenIMStore().chatList
})
OpenIMStore().$subscribe((mutations,state)=>{
    _list.value = state.chatList;
})
const list = computed(()=>_list).value


function click(e: ConversationItem) {
    OpenIMStore().setChating(e.userID,e.groupID)
}
</script>
<style scoped>


</style>