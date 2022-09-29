<template>

    <v-contextmenu ref="contextmenu">
        <v-contextmenu-item @click="setTop()">
            <div class="contextmenu_item">{{item.isPinned?'取消置顶':'置顶会话'}}</div>
        </v-contextmenu-item>
        <v-contextmenu-item v-if="item.unreadCount>0" @click="markRead()">
            <div class="contextmenu_item">标记为已读</div>
        </v-contextmenu-item>
        <v-contextmenu-item @click="del()">
            <div class="contextmenu_item">删除会话</div>
        </v-contextmenu-item>
    </v-contextmenu>
    <div class="box" v-contextmenu:contextmenu :class="[item.isPinned?'pinned':'',item.userID==OpenIMStore().chating.userId&&item.groupID==OpenIMStore().chating.groupId?'active':'']">
        <n-badge :value="item.unreadCount">
            <n-avatar :src="item.faceURL" :fallback-src="noFace"></n-avatar>
        </n-badge>
        <div class="msg">
            <div class="title_box">
                <div class="title">{{item.showName}}</div>
                <div class="time">{{decodeTime(item.latestMsgSendTime)}}</div>
            </div>
            <div class="desc">{{decodeMsg(item.latestMsg)}}</div>
        </div>
    </div>

</template>
<script lang="ts" setup>
import { MsgText } from '@/utils/openim/func';
import { diaplayTime } from '@/utils/utils';
import { ConversationItem, GroupMsgReadParams, MarkC2CParams, MessageItem, PinCveParams } from 'open-im-sdk';
import { getCurrentInstance, PropType } from 'vue';
import { noFace } from "@/config/config";
import { NAvatar,NBadge } from "naive-ui"
import { OpenIMStore } from '@/store/openim';

const ctx = getCurrentInstance()
const props = defineProps({
    item: {
        type: Object as PropType<ConversationItem>
    }
})
//解构消息
function decodeMsg(str: string): string {
    const msg: MessageItem = JSON.parse(str)
    if (!msg) {
        return "";
    }
    return MsgText(msg);
}
//格式化时间
function decodeTime(str: number): string {
    return diaplayTime(str);
}
function setTop() {
    const options: PinCveParams = {
        conversationID: props.item.conversationID,
        isPinned: !props.item.isPinned
    }
    ctx.proxy.$OpenIM.pinConversation(options)
}
function markRead() {
    if (props.item.userID != "") {
        const options: MarkC2CParams = {
            userID: props.item.userID,
            msgIDList: []
        }
        ctx.proxy.$OpenIM.markC2CMessageAsRead(options)
    }
    if (props.item.groupID != "") {
        const options: GroupMsgReadParams = {
            groupID: props.item.groupID,
            msgIDList: []
        }
        ctx.proxy.$OpenIM.markGroupMessageAsRead(options)
    }
}
function del() {
    ctx.proxy.$OpenIM.deleteConversation(props.item.conversationID)
}
</script>
<style scoped>
.box {
    height: 48px;
    display: flex;
    padding: 8px;
    border-bottom: 1px solid #fafafa;
    align-items: center;
    overflow: hidden;
}
.pinned{
    background-color: #fafafa;
}
.active{
    background-color: #f0f0f0;
}
.msg {
    flex: 1;
    margin-left: 20px;
    overflow: hidden;
}

.title_box {
    width: 100%;
    display: flex;
    justify-content: space-between;
}

.title {
    width: 100%;
    font-size: 16px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    text-align: left;
}

.time {
    min-width: 50px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    color: #888888;
}

.desc {
    width: 100%;
    font-size: 16px;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
    text-align: left;
    color: #888888;
    font-size: 12px;
}

.contextmenu_item {
    width: 100px;
    padding: 4px;
    color: #fff
}

.v-contextmenu {
    background-color: #565656d4 !important;
    border: 1px solid #00000000 !important;
}

.v-contextmenu-item {
    padding: 5px 14px !important;
    line-height: 1 !important;
    color: rgb(255, 255, 255) !important;
    margin: 2px 6px;
}

.v-contextmenu-item--hover {
    border-radius: 3px;

}
</style>