import { defineStore } from "pinia";
import { ComponentInternalInstance, getCurrentInstance } from "vue";
import { CbEvents, ConversationItem, TotalUserStruct, MessageItem, MessageType, OpenIMSDK, SendMsgParams, FriendApplicationItem, GroupApplicationItem, GroupItem, FullUserItem } from "open-im-sdk";
import { userStore } from "./user"
import { UrlApi } from "@/config/url";
import { notification } from "@tauri-apps/api";
import { MsgText } from "@/utils/openim/func";
export const OpenIMStore = defineStore("openim", {
  state: () => ({
    isLogin: localStorage.getItem("openim_login") ? true : false,
    // 聊天相关
    chatList: <ConversationItem[]>[],//会话列表
    unReadCount: 0,//未读消息
    chating: <{ userId: string, groupId: string }>{ userId: "", groupId: "" },//当前正在进行的聊天
    newMsg:<MessageItem>null,
    // 全局播放
    voiceId: "",//语音播放消息id
    audio: new Audio(),//播放实例
    videoUrl: "",//全局视频播放地址
    videoCover: "",//全局视频封面
    // 联系人，群相关
    contact: <TotalUserStruct[]>[],
    group: <GroupItem[]>[],
    appendCount: 0,//收到的申请好友加群数量
    appendFriendCount: 0,//收到的申请好友数量
    appendGroupCount: 0,//收到的申请加群数量
    msgHandleEvent: <{ event: "ref" | "revock" | "forward" | "clearEvent", msg?: MessageItem }>{},//消息右键事件
    friendApply: <FriendApplicationItem[]>[],
    groupApply: <GroupApplicationItem[]>[],
    contactActive: <{ uid?: string, groupId?: string, friendApply?: FriendApplicationItem, groupApply?: GroupApplicationItem }>{},//当前点击的联系人
  }),
  getters: {},
  actions: {
    openimLogin(openim: OpenIMSDK, token: string, uid: string) {
      var getChatListLoading = false;
      openim.on(CbEvents.ONCONNECTFAILED, (data) => {
        console.log("连接失败...", data);
        // 连接失败...
      });
      openim.on(CbEvents.ONCONNECTSUCCESS, (data) => {
        console.log("连接成功...", data);
        // 连接成功...
      });
      openim.on(CbEvents.ONCONNECTING, (data) => {
        console.log("连接中...", data);
        // 连接中...
      });
      openim.on(CbEvents.ONKICKEDOFFLINE, (data) => {
        console.log("被踢下线...", data);
        // 被踢下线...
      });
      openim.on(CbEvents.ONUSERTOKENEXPIRED, (data) => {
        // token过期...
        console.log("token过期...", data);
      });
      openim.on(CbEvents.ONCONVERSATIONCHANGED, ({ data }) => {
        console.log("回话发生变化", data)
        if (getChatListLoading) {
          return
        }
        getChatListLoading = true
        var conversation: ConversationItem[] = JSON.parse(data)
        this.getChatList(openim).then(e => {
          conversation.map(item => {
            var index: number = this.chatList.findIndex((v: ConversationItem) => v.conversationID == item.conversationID);
            console.log("index", index)
            this.chatList[index] = item;
          })
        }).finally(() => {
          getChatListLoading = false
        })
      });
      openim.on(CbEvents.ONNEWCONVERSATION, ({ data }) => {
        console.log("新增回话", data)
        var conversation: ConversationItem = JSON.parse(data)
        this.getChatList(openim).then(e => {
          var index: number = this.chatList.findIndex((v: ConversationItem) => v.conversationID == conversation.conversationID);
          this.chatList[index] = conversation;
        }).finally(() => {
          getChatListLoading = false
        })
      });
      openim.on(CbEvents.ONRECVNEWMESSAGE, ({ data }) => {
        var msg: MessageItem = JSON.parse(data);
        if(this.newMsg&&msg.clientMsgID == this.newMsg.clientMsgID){
          return ;
        }
        this.newMsg = msg
        if (msg.sendID != this.chating.userId && msg.groupID != this.chating.groupId) {
          notification.sendNotification({
            title: "收到新消息",
            body: MsgText(msg),
          });
        }

      })
      openim.on(CbEvents.ONFRIENDAPPLICATIONADDED, (data) => {
        console.log("好友申请", data)
        this.getFriendApply(openim)
      })
      openim.on(CbEvents.ONFRIENDAPPLICATIONACCEPTED, (data) => {
        console.log("好友申请被通过", data)
        this.getFriendApply(openim)
        this.getChatList(openim)
      })
      openim.on(CbEvents.ONFRIENDAPPLICATIONREJECTED, (data) => {
        console.log("好友申请被拒绝", data)
        this.getFriendApply(openim)
      })
      openim.on(CbEvents.ONGROUPAPPLICATIONADDED, (data) => {
        console.log("群申请", data)
        this.getGroupApply(openim)
      })
      openim.on(CbEvents.ONGROUPAPPLICATIONACCEPTED, (data) => {
        console.log("群被通过申请", data)
        this.getGroupApply(openim)
        this.getChatList(openim)
      })
      openim.on(CbEvents.ONGROUPAPPLICATIONREJECTED, (data) => {
        console.log("群被拒绝申请", data)
        this.getGroupApply(openim)
      })

      const config = {
        userID: uid,// 用户ID
        token: token,
        url: `ws://${UrlApi.ws}:10003`,// jssdk server ws地址
        platformID: 5,                                    // 平台号
      };

      openim.login(config).then(res => {
        this.isLogin = true;
        localStorage.setItem("openim_login", "ok")
        this.getChatList(openim);
        this.getContact(openim);
        this.getGroup(openim);
        this.getFriendApply(openim);
        this.getGroupApply(openim);
        openim.getSelfUserInfo().then(({data})=>{
          var u:FullUserItem = JSON.parse(data)
          userStore().openUserInfo(u)
        })
      }).catch(e => {
        // userStore().userLoginOut()
        console.log(e)
      })
    },
    // openim登出
    openimLoginOut() {
      getCurrentInstance()?.proxy?.$OpenIM.logout()
      localStorage.removeItem("openim_login")
    },
    // 播放视频
    videoPlay(url: string, videoCover: string) {
      console.log(url, videoCover)
      this.videoUrl = url;
      this.videoCover = videoCover;
    },
    // 获取openim会话
    async getChatList(openim: OpenIMSDK) {
      const res = await openim.getAllConversationList();
      // console.log(res.data);
      this.chatList = JSON.parse(res.data);
      this.unReadCount = eval(this.chatList.map((v: ConversationItem) => v.unreadCount).join("+"));
      // console.log(this.unReadCount,this.chatList);
    },
    // 获取联系人
    async getContact(openim: OpenIMSDK) {
      const res = await openim.getFriendList();
      this.contact = JSON.parse(res.data);
    },
    async getGroup(openim: OpenIMSDK) {
      const res = await openim.getJoinedGroupList();
      this.group = JSON.parse(res.data)
    },
    // 获取好友申请
    async getFriendApply(openim: OpenIMSDK) {
      const res = await openim.getRecvFriendApplicationList();
      this.friendApply = JSON.parse(res.data);
      this.appendFriendCount = this.friendApply.filter((v: FriendApplicationItem) => v.handleResult == 0).length
      this.appendCount = this.appendGroupCount + this.appendFriendCount
    },
    // 获取群申请
    async getGroupApply(openim: OpenIMSDK) {
      const res = await openim.getRecvGroupApplicationList();
      this.groupApply = JSON.parse(res.data);
      this.appendGroupCount = this.groupApply.filter((v: GroupApplicationItem) => v.handleResult == 0).length
      this.appendCount = this.appendGroupCount + this.appendFriendCount
    },

    // 播放音频
    async playVoice(msg?: MessageItem) {
      if (msg == null) {
        this.audio.pause();
        this.voiceId = "";
      } else {
        if (msg.contentType != MessageType.VOICEMESSAGE) {
          return;
        }
        await this.audio.pause();
        this.voiceId = msg.clientMsgID;
        this.audio.src = msg.soundElem.sourceUrl;
        this.audio.play().finally(() => {
          console.log("sasda")
        });
      }
    },
    // 设置当前正在进行的聊天
    setChating(userId: string, groupId: string) {
      console.log("-------", userId, groupId)
      this.chating = { userId, groupId };
    },
    // 发送消息
    sendMsg(openim: OpenIMSDK, options: SendMsgParams) {
      return openim.sendMessageNotOss(options)
    },
    // 设置全局消息右键事件
    setMsgEvent(event: "ref" | "revock" | "forward" | "clearEvent", msg: MessageItem) {
      console.log(event,)
      this.msgHandleEvent = { event, msg }
    },
    setActiveContact(uid?: string, groupId?: string, friendApply?: FriendApplicationItem, groupApply?: GroupApplicationItem) {
      this.contactActive = { uid, groupId, friendApply, groupApply }
    }
  },
});


