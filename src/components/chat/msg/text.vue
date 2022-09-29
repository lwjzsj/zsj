<template>
    <div class="msg_text" :class="showType!=MsgShowType.msg?'msg_ref_content':''" v-html="msg.content.replace(/\n/g,'<br/>')"></div>
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
        min-width: 80px;
    }
    .ref_box .msg_text{
    padding: 0px;
}
.ref_box .msg_ref_content{
    margin-top: 0px;
}
</style>
