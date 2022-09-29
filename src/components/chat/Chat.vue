<template>
  <div class="chat_continar" id="chat_box">
    <div class="title">{{ convasation ? convasation.showName : "聊天" }}</div>
    <div class="msg_box chat_ref" style="max-height: 100%">
      <n-scrollbar>
        <div v-for="item in list" :key="item.clientMsgID">
          <MsgContent :msg="item" :is_mine="item.sendID == loginUid"></MsgContent>
        </div>
      </n-scrollbar>
    </div>
    <div class="input_box">
      <InputView @send="sendMsgCall"></InputView>
    </div>
  </div>
  <n-modal
    v-model:show="videoModel"
    :mask-closable="false"
    content-style="padding: 0;"
    header-style="padding:5px 15px;background-color:#000"
    transform-origin="center"
    preset="card"
    :bordered="false"
    @close="onclose"
    @positive-click="onclose"
  >
    <div style="max-width: 600px; height: 300px">
      <!-- <video style="width:100%;height:100%" id="chat_video">
                <source :src="videoUrl" />
            </video> -->
      <vue3videoPlay v-bind="videoOptions" :poster="videoCover" />
    </div>
  </n-modal>
  <n-modal
    v-model:show="selectContactModel"
    :mask-closable="false"
    content-style="padding: 0;"
    header-style="height:0"
    transform-origin="center"
    preset="card"
    :closable="false"
    :bordered="false"
  >
    <ContactSelect
      v-if="OpenIMStore().msgHandleEvent.msg"
      @send="sendMsgCall"
      :msg="OpenIMStore().msgHandleEvent.msg"
    ></ContactSelect>
  </n-modal>
</template>
<script lang="ts" setup>
import {
  GetHistoryMsgParams,
  GetOneCveParams,
  MessageItem,
  ConversationItem,
  MessageType,
  CbEvents,
  MarkC2CParams,
  GroupMsgReadParams,
  FileMsgParams,
  OfflinePush,
  SendMsgParams,
  VideoMsgParams,
  ImageMsgParams,
  PicBaseInfo,
  MessageStatus,
} from "open-im-sdk";
import {
  defineProps,
  ref,
  watch,
  getCurrentInstance,
  nextTick,
  onUpdated,
  onMounted,
  onUnmounted,
  computed,
} from "vue";
import { NScrollbar, NModal, NCard } from "naive-ui";
import MsgContent from "./MsgContent.vue";
import InputView from "./inputView.vue";
import { OpenIMStore } from "@/store/openim";

import { storeToRefs } from "pinia";
import { userStore } from "@/store/user";
import axios from "@/utils/axios";
import md5 from "js-md5";
import { MsgText } from "@/utils/openim/func";
import { send } from "process";
import { message } from "@/utils/alert";
import { imageCompress, loadVideo } from "@/utils/utils";
import vue3videoPlay from "vue3-video-play"; // 引入组件
import "vue3-video-play/dist/style.css"; // 引入css
import { uuid } from "vue-uuid";
import { MsgSendState } from "@/api/model/openim/ext";
import { UrlApi } from "@/config/url";
import ContactSelect from "../contact/contactSelect.vue";
const openimStore = OpenIMStore();
const chat_ref = ref<Element>(null);
const ctx = getCurrentInstance();
let loading = false;
const loginUid = userStore().uid;
const groupId = ref("");
const userId = ref("");
// 拉取聊天记录分页标识
let startClientMsgID: string = "";
const selectContactModel = ref<boolean>(false); //显示选择联系人界面
// 聊天记录
const list = ref<MessageItem[]>([]);
// 回话信息
const convasation = ref<ConversationItem>(null);
async function getMsgList(first?: boolean) {
  if (loading) {
    console.log("+++loading");
    return;
  }
  if (groupId.value == "" && userId.value == "") {
    console.log("+++noid");
    return;
  }
  loading = true;
  if (first) {
    list.value = [];
  }
  const options: GetHistoryMsgParams = {
    groupID: groupId.value,
    startClientMsgID: startClientMsgID,
    count: 20,
    userID: userId.value,
  };
  try {
    return ctx.proxy.$OpenIM.getHistoryMessageList(options).then((value) => {
      var { data } = value;
      let _list: MessageItem[] = JSON.parse(data);
      console.log("_list", _list);
      // _list = _list.reverse();

      list.value.unshift(..._list);
      loading = false;
      if (_list.length > 0) {
        startClientMsgID = _list[0].clientMsgID;
      }
    });
  } catch (err) {
    console.log(err);
    loading = false;
  }
}
function scrollto(height: number) {
  nextTick(() => {
    chat_ref.value.scrollTop = height;
    console.log(chat_ref.value.scrollTop, chat_ref.value.scrollHeight);
  });
}
function getConvasation() {
  const options: GetOneCveParams = {
    sourceID: userId.value != "" ? userId.value : groupId.value,
    sessionType: OpenIMStore().chating.userId != "" ? 1 : 2,
  };
  ctx.proxy.$OpenIM
    .getOneConversation(options)
    .then(({ data }) => {
      convasation.value = JSON.parse(data);
      console.log(convasation.value);
    })
    .catch((err) => {
      console.log("获取会话错误", err);
    });
}
// 视频播放
const videoModel = ref(false);
const videoOptions = ref({
  width: "600px", //播放器高度
  height: "300px", //播放器高度
  color: "#409eff", //主题色
  title: "", //视频名称
  src: "", //视频源
  muted: false, //静音
  webFullScreen: false,
  speedRate: ["0.75", "1.0", "1.25", "1.5", "2.0"], //播放倍速
  autoPlay: true, //自动播放
  loop: false, //循环播放
  mirror: false, //镜像画面
  ligthOff: false, //关灯模式
  volume: 0.3, //默认音量大小
  control: true, //是否显示控制
  controlBtns: ["audioTrack", "quality", "speedRate", "volume", "setting"], //显示所有按钮,
});
const { videoCover } = storeToRefs(openimStore);

function onclose() {
  OpenIMStore().videoPlay("", "");
}
// ----视频播放结束---

onMounted(() => {
  openimStore.$subscribe(
    async (mutations, state) => {
      console.log(state);
      userId.value = state.chating.userId;
      groupId.value = state.chating.groupId;
      if (state.videoUrl) {
        videoModel.value = true;
        videoOptions.value.src = state.videoUrl;
      } else {
        videoModel.value = false;
        videoOptions.value.src = "";
      }
      if (state.msgHandleEvent.event == "revock" && state.msgHandleEvent.msg) {
        await ctx.proxy.$OpenIM.revokeMessage(JSON.stringify(state.msgHandleEvent.msg));
        var m: MessageItem = state.msgHandleEvent.msg;
        var index = list.value.findIndex((v) => v.clientMsgID == m.clientMsgID);
        list.value[index].contentType = MessageType.REVOKEMESSAGE;
        OpenIMStore().setMsgEvent("clearEvent", null);
      } else if (state.msgHandleEvent.event == "forward" && state.msgHandleEvent.msg) {
        selectContactModel.value = true;
      } else if (state.msgHandleEvent.event == "clearEvent") {
        selectContactModel.value = false;
        videoModel.value = false;
      }
      // 新消息
      var msg = state.newMsg;
      if (msg != null) {
        newMsgRev(msg);
      }
    },
    { detached: false }
  );
  nextTick(() => {
    init();
    // 监听新消息

    // 监听消息发送进度
    ctx.proxy.$OpenIM.on(CbEvents.ONPROGRESS, (value) => {
      console.log("ONPROGRESS", value);
      var prograss: {
        clientMsgID: string;
        progress: number;
      } = JSON.parse(value.data);
      var index = list.value.findIndex((e) => e.clientMsgID == prograss.clientMsgID);
      if (index != -1) {
        list.value[index].progress = prograss.progress;
      }
    });

    var box = document.getElementsByClassName("chat_ref")[0];
    chat_ref.value = box.querySelector(".n-scrollbar-container");
    // 监听滚动
    chat_ref.value.addEventListener("scroll", () => {
      if (chat_ref.value.scrollTop == 0) {
        var old_h = chat_ref.value.scrollHeight;
        console.log("old_h", old_h);
        getMsgList(false).then(() => {
          var new_h = chat_ref.value.scrollHeight;
          console.log("new_h - old_h", new_h, old_h, new_h - old_h);
          scrollto(new_h - old_h);
          nextTick(() => {
            console.log("new_h", chat_ref.value.scrollHeight);
          });
        });
      }
    });
    // 音频播放监听
    openimStore.audio.addEventListener("ended", () => {
      openimStore.playVoice(null);
    });
    // 拖动文件发送
    setDragListener();
  });
});
onUnmounted(() => {
  // 移除滚动监听
  chat_ref.value.removeEventListener("scroll", () => {
    console.log(chat_ref.value.scrollTop);
  });
  // 停止播放音频
  openimStore.playVoice(null);
  // 移除消息监听
  ctx.proxy.$OpenIM.off(CbEvents.ONRECVNEWMESSAGE, (value) => {});
  var oDiv = document.getElementById("chat_box");
  // 移除拖动文件监听
  oDiv&&oDiv.removeEventListener("dragenter", () => {});
  oDiv&&oDiv.removeEventListener("dragover", () => {});
  oDiv&&oDiv.removeEventListener("dragover", () => {});
  oDiv&&oDiv.removeEventListener("drop", () => {});
});
// 拖动文件发送
function setDragListener() {
  var oDiv = document.getElementById("chat_box");

  oDiv.addEventListener(
    "dragenter",
    function (e) {
      e.stopPropagation();
      e.preventDefault();
    },
    false
  );

  oDiv.addEventListener(
    "dragover",
    function (e) {
      e.stopPropagation();
      e.preventDefault();
    },
    false
  );

  oDiv.addEventListener(
    "drop",
    async function (e) {
      e.stopPropagation();
      e.preventDefault();
      var dt = e.dataTransfer;
      var files = dt.files;
      var loading = message.loading("发送中");
      for (var i = 0; i < files.length; i++) {
        var f = files.item(i);
        console.log(f, !f.type);
        if (!f.type) {
          message.info("忽略上传文件夹");
          continue;
        }
        ///通过FormData上传文件
        var formData: FormData = new FormData();
        formData.append("operationID", `${new Date().getTime()}`);
        formData.append("fileType", "3");
        formData.append("file", f);
        // formData.append("OperationID", md5(uuid.v4()));
        await axios.post<{ URL: string }>(UrlApi.upload, formData).then(async (res) => {
          console.log(f.type, res);
          if (f.type.indexOf("image") != -1) {
            console.log("img");
            await sendImgMsg(f, res.data.URL);
          } else if (f.type.indexOf("video") != -1) {
            await sendVideoMsg(f, res.data.URL);
          } else {
            sendFileMsg(f, res.data.URL);
          }
        }).catch(e=>{

        });
      }
      loading.destroy();
    },
    false
  );
}
function markRead() {
  // 标记已读
  if (OpenIMStore().chating.userId != "") {
    const options: MarkC2CParams = {
      userID: OpenIMStore().chating.userId,
      msgIDList: [],
    };
    ctx.proxy.$OpenIM.markC2CMessageAsRead(options);
  }
  if (OpenIMStore().chating.groupId != "") {
    const options: GroupMsgReadParams = {
      groupID: OpenIMStore().chating.groupId,
      msgIDList: [],
    };
    ctx.proxy.$OpenIM.markGroupMessageAsRead(options);
  }
}
function newMsgRev(msg: MessageItem) {
  console.log(
    OpenIMStore().chating.userId,
    msg.recvID,
    msg.groupID,
    OpenIMStore().chating.groupId,
    msg
  );
  if (
    (OpenIMStore().chating.userId && OpenIMStore().chating.userId == msg.sendID) ||
    (OpenIMStore().chating.groupId && msg.groupID == OpenIMStore().chating.groupId)
  ) {
    console.log(
      OpenIMStore().chating.userId && OpenIMStore().chating.userId == msg.sendID
    );
    console.log(
      OpenIMStore().chating.groupId && msg.groupID == OpenIMStore().chating.groupId
    );
    list.value.push(msg);
    var h = chat_ref.value.scrollHeight;
    scrollto(h * 2);
    markRead();
  }
}
watch([groupId, userId], () => {
  init();
});
function init() {
  console.log(openimStore.chating.userId, openimStore.chating.groupId);
  if (openimStore.chating.userId || openimStore.chating.groupId) {
    console.log("--------------");
    loading = false;
    // 停止播放音频
    openimStore.playVoice(null);
    startClientMsgID = "";
    getConvasation();
    getMsgList(true).then(() => {
      console.log(list.value);
      console.log("滚动到底部");
      var h = chat_ref.value.scrollHeight;
      scrollto(Math.max(h * 2, 10000));
    });
    markRead();
  } else {
    list.value = [];
    convasation.value = null;
  }
}
// 发送新消息回调
function sendMsgCall(e: MessageItem): void {
  console.log(
    OpenIMStore().chating.userId,
    OpenIMStore().chating.userId,
    e.recvID,
    userStore().uid,
    e.sendID
  );
  if (
    (OpenIMStore().chating.userId && OpenIMStore().chating.userId == e.sendID) ||
    (OpenIMStore().chating.userId &&
      OpenIMStore().chating.userId == e.recvID &&
      userStore().uid == e.sendID) ||
    (OpenIMStore().chating.groupId && e.groupID == OpenIMStore().chating.groupId)
  ) {
    // 消息状态 1:发送中 2:发送成功 3:发送失败 4:已删除 5:已撤回
    var index = list.value.findIndex((item) => item.clientMsgID == e.clientMsgID);
    if (index == -1) {
      list.value.push(e);
      var h = chat_ref.value.scrollHeight;
      scrollto(h * 2);
    } else {
      list.value[index] = e;
    }
  }
}
function sendImgMsg(f: File, url: string): Promise<string> {
  return new Promise((ok, err) => {
    var nImg = new Image();

    //      nImg.src = oImg.src;
    nImg.onload = function () {
      console.log("处理图片");
      var w = nImg.width;
      var h = nImg.height;
      imageCompress(nImg, 400, 0.8).then(async (res) => {
        const baseInfo: PicBaseInfo = {
          uuid: md5(url),
          type: f.type.split("/")[1],
          size: f.size,
          width: w,
          height: h,
          url: url,
        };
        var formData: FormData = new FormData();
        formData.append("operationID", `${new Date().getTime()}`);
        formData.append("fileType", "3");
        formData.append("file", res.file);
        console.log(formData);
        var snapshot = await axios.post<{ URL: string }>(UrlApi.upload, formData);
        console.log(snapshot);
        const snapshotInfo: PicBaseInfo = {
          uuid: md5(snapshot.data.URL),
          type: res.file.type.split("/")[1],
          size: res.file.size,
          width: res.width,
          height: res.height,
          url: snapshot.data.URL,
        };
        const options: ImageMsgParams = {
          sourcePicture: baseInfo,
          bigPicture: baseInfo,
          snapshotPicture: snapshotInfo,
        };
        ctx.proxy.$OpenIM
          .createImageMessage(options)
          .then(({ data }) => {
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
            OpenIMStore()
              .sendMsg(ctx.proxy.$OpenIM, options)
              .then((e) => {
                console.log("发送结果", e);
              });
            msg.recvID = OpenIMStore().chating.userId;
            msg.groupID = OpenIMStore().chating.groupId;
            sendMsgCall(msg);
            return ok("");
          })
          .catch((err) => {
            message.error(err);
            return err(err);
          });
      });
    };
    nImg.src = window.URL.createObjectURL(f);
    console.log(window.URL.createObjectURL(f));
  });
}
async function sendVideoMsg(f: File, url: string): Promise<string> {
  return new Promise(async (ok, err) => {
    var video = await loadVideo(f);
    // 时长
    const duration = video.duration;
    // 宽
    const width = video.videoWidth;
    // 高
    const height = video.videoHeight;
    // 获取视频封面
    const canvasElem = document.createElement("canvas");
    const { videoWidth, videoHeight } = video;
    canvasElem.width = videoWidth;
    canvasElem.height = videoHeight;
    canvasElem.getContext("2d").drawImage(video, 0, 0, videoWidth, videoHeight);
    // 导出成blob文件
    canvasElem.toBlob((blob) => {
      // 将blob文件转换成png文件
      const thumbFile = new File([blob], uuid.v4() + ".png");
      var formData: FormData = new FormData();
      formData.append("operationID", `${new Date().getTime()}`);
      formData.append("fileType", "3");
      formData.append("file", thumbFile);
      axios.post<{ URL: string }>(UrlApi.upload, formData).then((res) => {
        const options: VideoMsgParams = {
          videoPath: "",
          duration: duration,
          videoType: f.type.split("/")[1],
          snapshotPath: "",
          videoUUID: md5(url),
          videoUrl: url,
          videoSize: f.size,
          snapshotUUID: md5(res.data.URL),
          snapshotSize: thumbFile.size,
          snapshotUrl: res.data.URL,
          snapshotWidth: width,
          snapshotHeight: height,
        };
        ctx.proxy.$OpenIM
          .createVideoMessage(options)
          .then(({ data }) => {
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
            OpenIMStore()
              .sendMsg(ctx.proxy.$OpenIM, options)
              .then((e) => {
                console.log("发送结果", e);
              });
            msg.recvID = OpenIMStore().chating.userId;
            msg.groupID = OpenIMStore().chating.groupId;
            sendMsgCall(msg);
            return ok("");
          })
          .catch((err) => {
            message.error(err);
            return err(err);
          });
      });
    }, "image/png");
  });
}
async function sendFileMsg(f: File, url: string) {
  const options: FileMsgParams = {
    filePath: "",
    fileName: f.name,
    uuid: md5(url),
    sourceUrl: url,
    fileSize: f.size,
  };
  try {
    const { data: data_1 } = await ctx.proxy.$OpenIM.createFileMessage(options);
    var msg: MessageItem = JSON.parse(data_1);
    const offlinePushInfo: OfflinePush = {
      title: MsgText(msg),
      desc: "",
      ex: "",
      iOSPushSound: "",
      iOSBadgeCount: true,
    };
    const options_1: SendMsgParams = {
      recvID: OpenIMStore().chating.userId,
      groupID: OpenIMStore().chating.groupId,
      offlinePushInfo: offlinePushInfo,
      message: data_1,
    };
    msg.recvID = OpenIMStore().chating.userId;
    msg.groupID = OpenIMStore().chating.groupId;
    sendMsgCall(msg);
    return await OpenIMStore()
      .sendMsg(ctx.proxy.$OpenIM, options_1)
      .then((e) => {
        console.log("发送结果", e);
      });
  } catch (err) {
    message.error(err);
  }
}
</script>
<style scoped>
.chat_continar {
  height: 100%;
  width: 100%;
  background-color: #f3f3f3;
}

.title {
  height: 36px;
  width: 100%;
  text-align: center;
  line-height: 36px;
}

.msg_box {
  height: calc(100% - 206px);

  display: block;
  padding: 4px;
}

.input_box {
  height: 170px;
  width: 100%;
  border-top: 1px solid #f0f0f0;
  background-color: #fff;
}
</style>
<style>
.n-card.n-modal {
  width: auto;
}
</style>
