<template>
    <div>
        <div v-if="!isNotify()" class="item_box" :class="is_mine?'mine_box':'other_box'">
            <div class="thumb" v-if="!is_mine">
                <n-avatar :src="msg.senderFaceUrl" :fallback-src="noFace"></n-avatar>
                <div class="name_tag">{{msg.senderNickname}}</div>
            </div>
            <div class="msg_detail_box">
                <div class="msg_detail_content_box">
                    <div v-if="!is_mine && showTriangle()" class="left_triangle"></div>
                    <div>
                        <MsgView :msg="msg" :is_mine="is_mine"></MsgView>
                        <MsgView v-if="msg.contentType==MessageType.QUOTEMESSAGE" :msg="msg.quoteElem.quoteMessage"
                            :show-type="MsgShowType.refmsg"></MsgView>
                    </div>

                    <div v-if="is_mine && showTriangle()" class="right_triangle"></div>
                </div>
                <div>
                    <span class="time_tag">{{formatTime(msg.sendTime)}}</span>
                </div>
            </div>
            <div class="thumb" v-if="is_mine">
                <n-avatar :src="msg.senderFaceUrl" :fallback-src="noFace"></n-avatar>
            </div>

        </div>
        <div v-else>
            <mNotify :msg="msg"></mNotify>
        </div>
    </div>


</template>
<script lang="ts" setup>
import { NAvatar } from 'naive-ui';
import { MessageItem, MessageType } from 'open-im-sdk';
import { PropType, defineProps } from 'vue';
import { diaplayTime } from '@/utils/utils';
import { IsNotify, MsgShowType } from '@/api/model/openim/ext';
import mNotify from './msg/notify.vue';
import MsgView from './msg/msgView.vue';
import { noFace } from '@/config/config';

const props = defineProps({
    msg: {
        type: Object as PropType<MessageItem>,
    },
    is_mine: {
        type: Boolean,
        default: false,
    },
})

function isNotify() {
    return IsNotify(props.msg);
}
function showTriangle() {
    return [MessageType.PICTUREMESSAGE, MessageType.VIDEOMESSAGE].indexOf(props.msg.contentType) == -1;
}
function formatTime(t: number): string {
    return diaplayTime(t);
}
</script>
<style scoped>
.item_box {
    width: 100%;
    display: flex;
    align-items: flex-start;
    flex-direction: row;
    margin-bottom: 12px;
}

.mine_box {
    justify-content: flex-end;
    flex-direction: row;
}



.mine_box .msg_detail_box {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
}


.other_box {
    justify-content: flex-start;
}



.other_box .msg_detail_box {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
}

.msg_detail_content_box {
    display: flex;
    width: 100%;
    padding: 0 4px 0 4px;
}

.msg_detail_box {
    max-width: 60%;
}




.left_triangle {
    width: 0;
    height: 0;
    border-top: 4px solid transparent;
    border-bottom: 4px solid transparent;
    border-right: 6px solid #fff;
    margin-top: 18px;
}

.right_triangle {
    width: 0;
    height: 0;
    border-top: 4px solid transparent;
    border-bottom: 4px solid transparent;
    border-left: 6px solid #95ec69;
    margin-top: 18px;

}

.time_tag {
    padding: 2px 4px;
    margin: 4px 12px;
    border-radius: 4px;
    background-color: #eaeaea;
    color: #666666;
    font-size: 10px;
    width: fit-content;
}

.name_tag {
    color: #666666;
    font-size: 10px;
    width: fit-content;
    max-width: 40px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}
</style>    