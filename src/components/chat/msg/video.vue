<template>
    <div class="msg_text" :class="showType!=MsgShowType.msg?'msg_ref_content':''" @click="play">
        <n-image style="max-height: 200px;overflow: hidden;" object-fit="cover" :width="100"
            :src="msg.videoElem.snapshotUrl??msg.videoElem.snapshotPath" :preview-disabled="true"></n-image>
        <div class="play_btn">
            <img object-fit="cover" :width="30" :height="30" src="@/assets/icon/play.png" />
        </div>
    </div>

</template>
<script lang="ts" setup>
import { MessageItem } from 'open-im-sdk';
import { PropType, defineProps, ref } from 'vue';
import { NImage } from 'naive-ui';
import { OpenIMStore } from '@/store/openim';
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
function play() {
    console.log("play---")
    OpenIMStore().videoPlay(props.msg.videoElem.videoUrl ?? props.msg.videoElem.videoPath, props.msg.videoElem.snapshotUrl)
}
</script>
<style scoped>
.msg_text {
    margin: 0 8px;
    display: block;
    position: relative;
    overflow: hidden;
    background: rgba(255, 255, 255, 0) !important;
}
.ref_box .msg_text{
    padding: 0px;
}
.ref_box .msg_ref_content{
    margin-top: 0px;
}
.play_btn{
    position: absolute;
    top:calc(50% - 15px);
    left: 35px;
}
</style>