<template>
    <div>
        <div class="msg_text">
            {{msg.quoteElem.text}}
        </div>
        
    </div>
</template>
<script lang="ts" setup>
import { MsgShowType } from '@/api/model/openim/ext';
import { MessageItem } from 'open-im-sdk';
import { PropType, defineProps } from 'vue';
import MsgView from './msgView.vue';

const props = defineProps({
    msg: {
        type: Object as PropType<MessageItem>
    }
})
</script>
<style scoped>
.msg_text {
    padding: 8px;

}
</style>
    