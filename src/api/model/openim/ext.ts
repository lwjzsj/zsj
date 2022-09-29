import { MessageItem, MessageType} from "open-im-sdk";

// 扩展
export const NotifyType: MessageType[] = [
    MessageType.REVOKEMESSAGE, //撤回消息提示
    MessageType.ADVANCEREVOKEMESSAGE, //撤回
    MessageType.GROUPCREATED,//群聊创建通知
    MessageType.MEMBERQUIT, // 成员退群通知
    MessageType.GROUPOWNERTRANSFERRED,// 群主转让通知
    MessageType.MEMBERKICKED,                // 成员被踢出通知
    MessageType.MEMBERINVITED,                // 邀请成员入群通知
    MessageType.MEMBERENTER,                    // 成员进群通知
    MessageType.GROUPDISMISSED,            // 群解散通知
    MessageType.GROUPMEMBERMUTED,        // 群成员被禁言通知
    MessageType.GROUPMEMBERCANCELMUTED,//群成员被解除禁言通知
    MessageType.GROUPMUTED,                    // 群禁言通知
    MessageType.GROUPCANCELMUTED,        // 群取消禁言通知
    MessageType.GROUPINFOUPDATED,        // 群信息改变通知
    MessageType.FRIENDADDED, // 好友添加通知
]
export const IsNotify = (msg:MessageItem)=>{
    return NotifyType.indexOf(msg.contentType)!=-1&&([4,5].indexOf(msg.status)==-1);
}
// 消息显示类型
export const enum MsgShowType {
    msg, //正常显示
    refmsg, //引用消息
    inputmsg //在输入框处引用
} 
// 消息发送状态
export const enum MsgSendState{
    sending,
    success,
    fail
}