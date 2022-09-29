import { MessageItem, MessageType } from "open-im-sdk";

export function MsgText(msg: MessageItem): string {
  switch (msg.contentType) {
    case MessageType.TEXTMESSAGE: // 文字消息
        return msg.content;
    case MessageType.PICTUREMESSAGE: // 图片消息
        return "[图片]"
    case MessageType.VOICEMESSAGE: // 语音消息
    return "[语音]"
    case MessageType.VIDEOMESSAGE: // 视频消息
    return "[视频]"
    case MessageType.FILEMESSAGE: // 视频消息
    return "[文件]"
    case MessageType.ATTEXTMESSAGE: // @消息
    return msg.atElem.text
    
    case MessageType.LOCATIONMESSAGE: // 位置消息
    return "[位置]"
    case MessageType.REVOKEMESSAGE: // 撤回消息提示
    case MessageType.ADVANCEREVOKEMESSAGE: // 撤回消息提示
    return "[撤回消息]"
    case MessageType.QUOTEMESSAGE: // 引用消息
    return "[回复]"
    
    case MessageType.GROUPCREATED: // 群聊创建通知
    return "[群聊创建]"
    case MessageType.FRIENDADDED: // 好友添加通知
    return "[添加好友]"
    case MessageType.GROUPINFOUPDATED: // 群信息改变通知
    return "[群信息改变]"
    case MessageType.MEMBERQUIT: // 成员退群通知
    return "[成员退出群聊]"
    case MessageType.GROUPOWNERTRANSFERRED: //群主转让通知
    return "[群主转让]"
    case MessageType.MEMBERKICKED: // 成员被踢出通知
    return "[成员被踢出群聊]"
    case MessageType.MEMBERINVITED: // 邀请成员入群通知
    return "[成员加入群聊]"
    case MessageType.MEMBERENTER: // 成员进群通知
    return "[成员加入群聊]"
    case MessageType.GROUPDISMISSED: // 群解散通知
    return "[群解散]"
    case MessageType.GROUPMEMBERMUTED: // 群成员被禁言通知
    return "[群成员被禁言]"
    case MessageType.GROUPMEMBERCANCELMUTED: //群成员被解除禁言通知;
    return "[群成员被解除禁言]"
    case MessageType.GROUPMUTED: // 群禁言通知
    return "[群禁言]"
    case MessageType.GROUPCANCELMUTED: // 群取消禁言通知
    return "[群取消禁言]"
  }
  return `消息：--${msg.contentType}`;
}
