<template>
    <div class="msg_text" :class="showType!=MsgShowType.msg?'msg_ref_content':''">{{msg.atElem.text}}</div>
</template>
<script lang="ts" setup>
import { IsNotify,MsgShowType } from '@/api/model/openim/ext';
import { MessageItem } from 'open-im-sdk';
import { PropType, defineProps } from 'vue';

const props = defineProps({
    msg: {
        type: Object as PropType<MessageItem>
    },
    showType: {
        type: Number as PropType<MsgShowType>,
        default: MsgShowType.msg
    }
})
</script>
<style scoped>
    .msg_text{
        padding:8px;
    }
    .ref_box .msg_text{
    padding: 0px;
}
.ref_box .msg_ref_content{
    margin-top: 0px;
}
</style>
