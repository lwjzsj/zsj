<template>
    <div class="msg_text">
        <div class="voice_box" @click="play()">
            <img src="@/assets/icon/voice.png" width="20" height="20" />
            <img v-if="playing" src="@/assets/icon/voice_play.gif" width="70" height="20" />
            <div v-else>{{(msg.soundElem.duration/1000).toFixed(2)}}秒</div>
            
        </div>
    </div>
</template>
<script lang="ts" setup>
import { MsgShowType } from '@/api/model/openim/ext';
import { MessageItem } from 'open-im-sdk';
import { PropType, defineProps, ref } from 'vue';
import { NImage } from "naive-ui"
import { OpenIMStore } from '@/store/openim';
const playing = ref(false)
const props = defineProps({
    msg: {
        type: Object as PropType<MessageItem>
    },
    showType: {
        type: Number as PropType<MsgShowType>,
        default: MsgShowType.msg
    }
})
OpenIMStore().$subscribe((mutations, state) => {
    if (state.voiceId == props.msg.clientMsgID) {
        playing.value = true
    } else {
        playing.value = false
    }
})
function play() {
    OpenIMStore().playVoice(playing.value ? null : props.msg)
}
</script>
<style scoped>
.voice_box {
    height: 25px;
    width: 150px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 6px;
}
.ref_box .file_box{
    padding: 0px;
}
.ref_box .msg_ref_content{
    margin-top: 0px;
}
</style>