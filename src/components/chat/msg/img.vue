<template>
    <div class="msg_text" :class="showType!=MsgShowType.msg?'msg_ref_content':''">
        <n-image style="max-height: 200px;overflow: hidden;" object-fit="fill" :width="100"
            :src="msg.pictureElem.snapshotPicture.url" :preview-src="msg.pictureElem.bigPicture.url"></n-image>
    </div>
</template>
<script lang="ts" setup>
import { MessageItem } from 'open-im-sdk';
import { PropType, defineProps } from 'vue';
import { NImage } from 'naive-ui';
import { MsgShowType } from '@/api/model/openim/ext';
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
.msg_text {
    margin: 0 8px;
    overflow: hidden;
    background: rgba(255, 255, 255, 0) !important;
}
.ref_box .msg_text{
    padding: 0px;
}
.ref_box .msg_ref_content{
    margin-top: 0px;
}
</style>