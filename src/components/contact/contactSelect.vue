<template>
  <div class="box">
    <div class="contact_box">
      <n-scrollbar style="max-height: 100%">
        <div
          class="contact_item"
          v-for="item in list"
          :key="item.uid + item.groupId"
          @click="setSelect(item)"
        >
          <n-checkbox :checked="checkSelect(item)"> </n-checkbox>
          <div style="width: 10px"></div>
          <n-avatar :src="item.face" :fallback-src="noFace"></n-avatar>
          <div class="contact">
            <div class="title">{{ item.name }}</div>
          </div>
        </div>
      </n-scrollbar>
    </div>

    <div class="select_box">
      <n-scrollbar>
        <div class="select_list">
          <div
            class="contact_item"
            v-for="item in select"
            :key="'select_' + item.uid + item.groupId"
          >
            <n-avatar :src="item.face" :fallback-src="noFace"></n-avatar>
            <div class="contact">
              <div class="title">{{ item.name }}</div>
            </div>
            <img
              src="@/assets/icon/close.png"
              width="20"
              height="20"
              @click="setSelect(item)"
            />
          </div>
        </div>
      </n-scrollbar>
      <div class="msg_box" v-show="select.length > 0">
        <msg-view :msg="msg" :show-type="MsgShowType.refmsg"></msg-view>
      </div>
      <div class="btn_group">
        <n-button type="success" size="small" secondary @click="close()"
          ><div style="width: 60px">取消</div></n-button
        >
        <n-button
          type="success"
          size="small"
          :disabled="select.length == 0"
          @click="send()"
          ><div style="width: 60px">发送</div></n-button
        >
      </div>
    </div>
  </div>
</template>
<script lang="ts" setup>
import {
  TotalUserStruct,
  MessageItem,
  FriendItem,
  OfflinePush,
  SendMsgParams,
} from "open-im-sdk";
import { OpenIMStore } from "@/store/openim";
import { MsgText } from "@/utils/openim/func";
import { diaplayTime } from "@/utils/utils";
import { NAvatar, NCheckbox, NScrollbar, NButton } from "naive-ui";
import { getCurrentInstance, onMounted, PropType, ref, watch, watchEffect } from "vue";
import { nextTick } from "vue";
import { noFace } from "@/config/config";
import MsgView from "../chat/msg/msgView.vue";
import { MsgShowType } from "@/api/model/openim/ext";
import { id } from "date-fns/locale";

interface listItem {
  groupId: string;
  uid: string;
  face: string;
  name: string;
}
const props = defineProps({
  msg: {
    type: Object as PropType<MessageItem>,
  },
});
const emits = defineEmits<{
  (event: "send", msg: MessageItem): void;
}>();
const ctx = getCurrentInstance();
const list = ref<listItem[]>([]);
const select = ref<listItem[]>([]);
onMounted(() => {
  OpenIMStore().contact.map((v) => {
    list.value.push({
      groupId: "",
      uid: v.friendInfo.userID,
      face: v.friendInfo.faceURL,
      name: v.friendInfo.nickname,
    });
  });
  OpenIMStore().group.map((v) => {
    list.value.push({ groupId: v.groupID, uid: "", face: v.faceURL, name: v.groupName });
  });
  nextTick(() => {
    OpenIMStore().$subscribe((mutations, state) => {
      list.value = [];
      OpenIMStore().contact.map((v) => {
        list.value.push({
          groupId: "",
          uid: v.friendInfo.userID,
          face: v.friendInfo.faceURL,
          name: v.friendInfo.nickname,
        });
      });
      OpenIMStore().group.map((v) => {
        list.value.push({
          groupId: v.groupID,
          uid: "",
          face: v.faceURL,
          name: v.groupName,
        });
      });
    });
  });
});

//解构消息
function decodeMsg(str: string): string {
  const msg: MessageItem = JSON.parse(str);
  if (!msg) {
    return "";
  }
  return MsgText(msg);
}
//格式化时间
function decodeTime(str: number): string {
  return diaplayTime(str);
}
function click(e: FriendItem) {
  console.log(e);
  OpenIMStore().setActiveContact(e.userID);
}
function checkSelect(item: listItem) {
  var index = select.value.findIndex(
    (v) => (item.uid && v.uid == item.uid) || (item.groupId && v.groupId == item.groupId)
  );
  return index != -1;
}
function setSelect(item: listItem) {
  var index = select.value.findIndex(
    (v) => (item.uid && v.uid == item.uid) || (item.groupId && v.groupId == item.groupId)
  );
  if (index > -1) {
    select.value.splice(index, 1);
  } else {
    select.value.push(item);
  }
}
function close() {
  OpenIMStore().setMsgEvent("clearEvent", null);
}
async function send() {
  const openim = ctx.proxy.$OpenIM;
  if (select.value.length > 0) {
    for (var i = 0; i < select.value.length; i++) {
      await openim
        .createForwardMessage(JSON.stringify(props.msg))
        .then(async ({ data }) => {
          var msg: MessageItem = JSON.parse(data);
          const offlinePushInfo: OfflinePush = {
            title: MsgText(msg),
            desc: "",
            ex: "",
            iOSPushSound: "",
            iOSBadgeCount: true,
          };

          const options: SendMsgParams = {
            recvID: select.value[i].uid,
            groupID: select.value[i].groupId,
            offlinePushInfo: offlinePushInfo,
            message: data,
          };
          await OpenIMStore()
            .sendMsg(ctx.proxy.$OpenIM, options)
            .then((e) => {
              console.log("发送结果", e);
              emits("send", msg);
            });

          OpenIMStore().setMsgEvent("clearEvent", null);
        })
        .catch((err) => {});
    }
  }
}
</script>
<style scoped>
.box {
  width: 500px;
  height: 400px;
  display: flex;
  padding: 8px;
}
.contact_box {
  width: 200px;
  padding: 8px;
  height: 384px;
  border-right: 1px solid #f6f6f6;
}
.contact_item {
  height: 48px;
  display: flex;
  align-items: center;
}
.select_box {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 10px;
  height: 100%;
}
.select_list {
  flex: 1;
}
.msg_box {
  padding: 6px 10px;
}
.msg_box .ref_box {
  width: 100%;
}
.btn_group {
  width: 100%;
  padding: 4px 10px 20px 10px;
  display: flex;
  justify-content: space-around;
}
.contact {
  flex: 1;
  margin-left: 10px;
  overflow: hidden;
  text-overflow: ellipsis;
}

.title {
  width: 100%;
  font-size: 14px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  text-align: left;
}

.index {
  background-color: #f6f6f6;
  text-align: left;
  padding: 4px 0 2px 8px;
}

.active {
  background-color: #f0f0f0;
}
</style>
