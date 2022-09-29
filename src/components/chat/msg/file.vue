<template>
    <div class="msg_text" :class="showType!=MsgShowType.msg?'msg_ref_content':''">
        <div class="file_box">
            
            <div class="file_info">
                <div class="file_name">{{msg.fileElem.fileName}}</div>
                <div class="file_size">{{getFileSize(msg.fileElem.fileSize)}}</div>
            </div>
            <div class="file_icon">
                <FileIcon :file-name="msg.fileElem.fileName" :size="showType==MsgShowType.msg?48:30"></FileIcon>
            </div>
        </div>
    </div>
</template>
<script lang="ts" setup>
import { MsgShowType } from '@/api/model/openim/ext';
import { MessageItem } from 'open-im-sdk';
import { PropType, defineProps } from 'vue';
import { getFileSize } from "@/utils/utils"
import FileIcon from '@/components/FileIcon.vue';

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
.file_box {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 9px;
}
.ref_box .file_box{
    padding: 0px;
}
.ref_box .msg_ref_content{
    margin-top: 0px;
}
.file_name {
    max-width: 200px;
    min-width: 80px;
    font-size: 14px;
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
}
.file_size{
    font-size: 12px;
}
</style>