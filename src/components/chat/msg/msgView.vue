<template>
    <div class="msg_detail_content_width_ref"
        :class="[showType==MsgShowType.inputmsg?'ref_box':'',showType==MsgShowType.refmsg?'ref_box':'']">
        <div v-if="showType!=MsgShowType.msg" style="font-size: 14px;">{{msg.senderNickname}}:</div>
        <div v-contextmenu:contextmenu class="msg_detail_content"
            :class="[msgType.PICTUREMESSAGE,msgType.VIDEOMESSAGE].indexOf(msg.contentType)==-1&&!is_mine?'msg_padding':''">
            <mFile v-if="msg.contentType==msgType.FILEMESSAGE" :msg="msg" :show-type="showType"></mFile>
            <mImg v-else-if="msg.contentType==msgType.PICTUREMESSAGE" :msg="msg" :show-type="showType"></mImg>
            <mVideo v-else-if="msg.contentType==msgType.VIDEOMESSAGE" :msg="msg" :show-type="showType"></mVideo>
            <mVoice v-else-if="msg.contentType==msgType.VOICEMESSAGE" :msg="msg" :show-type="showType"></mVoice>
            <mRefmsg v-else-if="msg.contentType==msgType.QUOTEMESSAGE" :msg="msg"></mRefmsg>
            <mAt v-else-if="msg.contentType==msgType.ATTEXTMESSAGE" :msg="msg"></mAt>
            <mText v-else :msg="msg" :show-type="showType"></mText>
            <!-- {{msg.contentType}} -->
        </div>

        <img v-if="showType==MsgShowType.inputmsg" src="@/assets/icon/close.png" width="30" height="30"
            @click="clearRef()" />

    </div>

    <v-contextmenu ref="contextmenu">
        <v-contextmenu-item v-if="is_mine&& msg.sendTime+120000>(new Date()).getTime()" @click="revock()">
            <div class="contextmenu_item">撤回</div>
        </v-contextmenu-item>
        <v-contextmenu-item @click="msgref()">
            <div class="contextmenu_item">引用</div>
        </v-contextmenu-item>
        <v-contextmenu-item @click="forward()">
            <div class="contextmenu_item">转发</div>
        </v-contextmenu-item>
    </v-contextmenu>
</template>
<script lang="ts" setup>

import { MessageItem, MessageType } from 'open-im-sdk';
import { PropType } from 'vue';

import mText from './text.vue';
import mFile from './file.vue';
import mImg from './img.vue';
import mVideo from './video.vue';
import mVoice from './voice.vue';
import mRefmsg from './refmsg.vue';
import { MsgShowType } from '@/api/model/openim/ext';
import mAt from './at.vue';
import { OpenIMStore } from '@/store/openim';
const msgType = MessageType
const props = defineProps({
    msg: {
        type: Object as PropType<MessageItem>,
    },
    is_mine: {
        type: Boolean,
        default: false,
    },
    showType: {
        type: Number as PropType<MsgShowType>,
        default: MsgShowType.msg
    }
})
// 撤回消息
function revock() {
    OpenIMStore().setMsgEvent("revock", props.msg)
}
// 引用消息
function msgref() {
    OpenIMStore().setMsgEvent("ref", props.msg)
}
// 转发消息
function forward() {
    OpenIMStore().setMsgEvent("forward", props.msg)
}
// 清理引用消息
function clearRef() {
    OpenIMStore().setMsgEvent("clearEvent", null)
}
</script>
<style>
.mine_box .msg_text {
    background: #95ec69;
    color: #333;
}

.other_box .msg_text {
    background: #fff;
}

.msg_text {
    width: fit-content;
    max-width: 100%;
    margin-top: 4px;
    margin-bottom: 4px;
    border-radius: 6px;
    overflow-wrap: break-word;
    min-height: 16px;
}
.ref_box .file_box{
    padding: 0px;
}
.ref_box .msg_ref_content{
    margin-top: 0px;
}
.msg_detail_content {
    border-radius: 6px;
    min-height: 20px;
    width: fit-content;
    word-wrap: break-word;
    max-width: 100%;
    text-align: left;
}

.msg_detail_content_width_ref {
    border-radius: 4px;
    display: flex;
    align-items: center;
    justify-content: flex-start;
    overflow: hidden;
    max-width: 100%;
    align-content: center;
}

.mine_box .msg_detail_content_width_ref {
    justify-content: flex-end;
}

.ref_box {
    background-color: #e7e7e7;
    padding: 4px;
    max-height: 40px;
    height: auto;
    width: fit-content;
    align-items: flex-start;
}

.msg_ref_content {
    width: 100%;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    font-size: 14px;
    background-color: #e7e7e7;
    color: #666666;
}

.ref_box .msg_text {
    background: #e7e7e7;
    color: #333;
}
.contextmenu_item{
    width: 100px;
    padding: 4px;
    color:#fff
}
.v-contextmenu{
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