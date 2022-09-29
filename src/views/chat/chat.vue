<template>
    <div class="chat_box">
        <div class="conversation_box">
            <ChatList></ChatList>
        </div>
        <div class="msg_box">
            <Chat></Chat>
        </div>
    </div>
</template>
<script lang="ts" setup>
import ChatList from "@/components/chat/ChatList.vue";
import Chat from "@/components/chat/Chat.vue";

</script>
<style scoped>
.chat_box {
    width: 100%;
    height: 100%;
    display: flex;

}

.conversation_box {
    width: 250px;
    height: 100%;
    border-right: 1px solid #f0f0f0;
    overflow: hidden;
}

.msg_box {
    flex: 1;
    height: 100%;
    overflow: hidden;
}
</style>