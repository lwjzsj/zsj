<template>
    <div class="notify_text">{{content()}}</div>
</template>
<script lang="ts" setup>
import { MessageItem, MessageStatus, MessageType } from 'open-im-sdk';
import { PropType, defineProps } from 'vue';
import MsgContentVue from '@/MsgContent.vue';

const props = defineProps({
    msg: {
        type: Object as PropType<MessageItem>
    }
})
function content() {
    switch (props.msg.contentType) {
        case MessageType.REVOKEMESSAGE:
        case MessageType.ADVANCEREVOKEMESSAGE:
            //撤回
            return `${props.msg.senderNickname}撤回了一条消息`;
        case MessageType.GROUPCREATED:
            return "成功创建群聊";
        case MessageType.GROUPINFOUPDATED:
            return "修改群信息";

        case MessageType.MEMBERQUIT:
            const tip = JSON.parse(props.msg.content ?? "");
            return `${tip['defaultTips']}退出群聊`;
        case MessageType.FRIENDADDED:
            return "你们已经是好友了，快打个招呼吧";
        case MessageType.GROUPOWNERTRANSFERRED:
            return "群主已转让";
        case MessageType.MEMBERKICKED:
            const invite = JSON.parse(
                props.msg.notificationElem?.detail ?? "");
            return `${(invite.kickedUserList ?? []).map((e) => e.nickname).join
                ('’,‘')}‘ 被 '${invite.opUser?.nickname ?? ''}'移出群聊"`;

        case MessageType.MEMBERINVITED:
            //---print("msg.msg.notificationElem");
            //---print(msg.msg.notificationElem?.detail);
            const invite1 = JSON.parse(
                props.msg.notificationElem?.detail ?? "");
            return `${invite1.opUser?.nickname ?? ''} 邀请 ‘${invite1.invitedUserList?.map((e) => e.nickname).join('’,‘')}‘ 加入群聊`;

        case MessageType.MEMBERENTER:
            return "新成员加入群聊";
        case MessageType.GROUPMUTED:
            return "群禁言";
        case MessageType.GROUPCANCELMUTED:
            return "解除群禁言";
        case MessageType.GROUPDISMISSED:
            return "群已解散";
    }

}
</script>
<style scoped> 
.notify_text{
    font-size: 12px;
    padding: 2px 10px;
    color: #959595;
    background-color: rgb(236, 236, 236);
    width: fit-content;
    text-align: center;
    margin: 8px auto;
    border-radius: 4px;
}
</style>