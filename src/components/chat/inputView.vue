<template>
  <div class="input_content">
    <div style="height: 30px"></div>
    <textarea
      class="minput"
      id="minput"
      type="textarea"
      :disabled="sneding || noRevId"
      v-model="value"
      @keydown="handleKeyUp"
      placeholder="回车发送消息"
    ></textarea>
    <div class="input_ref" v-if="refmsg">
      <msg-view :show-type="MsgShowType.inputmsg" :msg="refmsg"></msg-view>
    </div>
    <n-popover :show="showPopover" :x="0" :y="0" trigger="manual"> 厉害！ </n-popover>
  </div>
</template>
<script lang="ts" setup>
import { OpenIMStore } from "@/store/openim";
import { MsgText } from "@/utils/openim/func";
import { MessageItem, OfflinePush, QuoteMsgParams, SendMsgParams } from "open-im-sdk";
import { getCurrentInstance, onMounted, ref } from "vue";
import MsgView from "./msg/msgView.vue";
import { NPopover } from "naive-ui";
import { MsgSendState, MsgShowType } from "@/api/model/openim/ext";
const emits = defineEmits<{
  (event: "send", msg: MessageItem): void;
}>();
const value = ref("");
const ctx = getCurrentInstance();
// 防止重复发送
const sneding = ref(false);
// 引用的消息
const refmsg = ref<MessageItem>(null);
// 当前页面没有激活
const noRevId = ref<boolean>(true);
// 光标位置
const x = ref<number>(0);
const y = ref<number>(0);
const showPopover = ref<boolean>(false);
function send() {
  console.log("send", OpenIMStore().chating.userId, OpenIMStore().chating.groupId);
  if (!OpenIMStore().chating.userId && !OpenIMStore().chating.groupId) {
    console.log("no rev");
    return;
  }
  if (value.value.trim().length == 0) {
    console.log("no content", value.value);
    return;
  }
  if (sneding.value) {
    console.log("sended");
    return;
  }
  sneding.value = true;
  if (refmsg.value) {
    sendRefText();
  } else {
    sendText();
  }
}
function handleKeyUp(e: KeyboardEvent) {
  console.log(e);
  if (e.code == "Enter") {
    e.preventDefault()
    send();
  } else if (e.code == "MetaRight") {
    value.value = value.value + "\n";
  } else if (OpenIMStore().chating.groupId && e.key == "@") {
    showPopover.value = true;
  }
}
// 发送文本信息
async function sendText() {
  return ctx.proxy.$OpenIM
    .createTextMessage(value.value)
    .then((res) => {
      var { data } = res;
      var msg: MessageItem = JSON.parse(data);
      const offlinePushInfo: OfflinePush = {
        title: MsgText(msg),
        desc: "",
        ex: "",
        iOSPushSound: "",
        iOSBadgeCount: true,
      };
      const options: SendMsgParams = {
        recvID: OpenIMStore().chating.userId || "",
        groupID: OpenIMStore().chating.groupId || "",
        offlinePushInfo: offlinePushInfo,
        message: data,
      };
      console.log("options", options);
      emits("send", msg);
      value.value = "";
      OpenIMStore()
        .sendMsg(ctx.proxy.$OpenIM, options)
        .then(({ data, errCode }) => {
          console.log("发送结果", data);
          var m: MessageItem = JSON.parse(data);
          emits("send", m);
        })
        .catch((err) => {
          console.log(err);
        })
        .finally(() => {
          sneding.value = false;
        });
    })
    .finally(() => {
      sneding.value = false;
    });
}
// 发送引用信息
async function sendRefText() {
  const options: QuoteMsgParams = {
    text: value.value,
    message: JSON.stringify(refmsg.value),
  };
  return ctx.proxy.$OpenIM
    .createQuoteMessage(options)
    .then((res) => {
      var { data } = res;
      var msg: MessageItem = JSON.parse(data);
      const offlinePushInfo: OfflinePush = {
        title: MsgText(msg),
        desc: "",
        ex: "",
        iOSPushSound: "",
        iOSBadgeCount: true,
      };
      const options: SendMsgParams = {
        recvID: OpenIMStore().chating.userId,
        groupID: OpenIMStore().chating.groupId,
        offlinePushInfo: offlinePushInfo,
        message: data,
      };
      emits("send", msg);
      value.value = "";
      OpenIMStore().setMsgEvent("clearEvent", null);
      OpenIMStore()
        .sendMsg(ctx.proxy.$OpenIM, options)
        .then(({ data, errCode }) => {
          console.log(data);
          var m: MessageItem = JSON.parse(data);
          emits("send", m);
        })
        .catch((err) => {
          console.log(err);
        })
        .finally(() => {
          sneding.value = false;
        });
    })
    .finally(() => {
      sneding.value = false;
    });
}
// 监听消息引用
onMounted(() => {
  OpenIMStore().$subscribe((mutations, state) => {
    if (state.msgHandleEvent.event == "ref" && state.msgHandleEvent.msg) {
      console.log("ref----");
      refmsg.value = state.msgHandleEvent.msg;
    }
    if (state.msgHandleEvent.event == "clearEvent") {
      console.log("ref----");
      refmsg.value = null;
    }
    if (!state.chating.groupId && !state.chating.userId) {
      noRevId.value = true;
    } else {
      noRevId.value = false;
    }
  });
});
function test(e:any){
  console.log(e)
}
</script>
<style scoped>
.input_content {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.minput {
  flex: 1;
  resize: none;
  outline: none;
  border: 0px solid #fff;
}

.input_ref {
  padding-left: 10px;
  text-align: left;
  height: 68px;
}
</style>
