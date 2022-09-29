<template>
    <div v-if="user" style="padding:40px 60px">
        <div v-if="user.publicInfo" class="header">
            <div class="title">
                <div>{{user.publicInfo.nickname}}</div>
            </div>
            <div>
                <n-avatar :src="user.publicInfo.faceURL" :size="80"></n-avatar>
            </div>
        </div>
        <div class="info">
            <div>
                <div class="rows">
                    <span class="lable">用户ID</span>
                    <span>{{user.publicInfo.userID}}</span>
                </div>
            </div>
            <div v-if="user.friendInfo">
                <div class="rows">
                    <span class="lable">生日</span>
                    <span>{{user.friendInfo.birth}}</span>
                </div>
                <div class="rows">
                    <span class="lable">邮箱</span>
                    <span>{{user.friendInfo.email}}</span>
                </div>
                <div class="rows">
                    <span class="lable">性别</span>
                    <span>{{user.friendInfo.gender==1?'男':'女'}}</span>
                </div>
                <div class="rows">
                    <span class="lable">联系方式</span>
                    <span>{{user.friendInfo.phoneNumber}}</span>
                </div>
                <div class="rows">
                    <span class="lable">签名</span>
                    <span>{{user.friendInfo.remark}}</span>
                </div>
            </div>
        </div>
        <div v-if="active.friendApply">
            <div class="rows">
                <span class="lable">打招呼</span>
                <span>{{active.friendApply.reqMsg}}</span>
            </div>
        </div>

        <div v-if="user.blackInfo">
        </div>
        <div>

        </div>
    </div>
    <div v-else-if="group" style="padding:40px 60px">
        <div class="header">
            <div class="title">
                <div>{{group.groupName}}</div>
            </div>
            <div>
                <n-avatar :src="group.faceURL" :size="80"></n-avatar>
            </div>
        </div>
        <div class="info" v-if="active.groupApply">
            <div class="rows">
                <span class="lable">用户头像</span>
                <n-avatar :src="active.groupApply.userFaceURL" :size="40"></n-avatar>
            </div>

            <div class="rows">
                <span class="lable">用户ID</span>
                <span>{{active.groupApply.userID}}</span>
            </div>
            <div class="rows">
                <span class="lable">用户名</span>
                <span>{{active.groupApply.nickname}}</span>
            </div>
        </div>
        <div v-if="active.groupApply">
            <div class="rows">
                <span class="lable">打招呼</span>
                <span>{{active.groupApply.reqMsg}}</span>
            </div>
        </div>
    </div>
    <div v-if="active&&(active.uid||active.groupId)">
        <div v-if="status=='apply'">
            <n-button type="success" @click="accept()">
                通过申请
            </n-button>
            <div style="height: 10px;"></div>
            <n-button secondary type="error" @click="refuse()">
                拒绝申请
            </n-button>
        </div>
        <div v-else-if="status=='ingroup'">
            <n-button type="success" @click="navChat()">
                进入群聊
            </n-button>
        </div>
        <div v-else-if="status=='isfriend'">
            <n-button type="success" @click="navChat()">
                发送消息
            </n-button>
        </div>
    </div>



</template>
<script lang="ts" setup>
import router from '@/router';
import { OpenIMStore } from '@/store/openim';
import { NAvatar, NButton } from 'naive-ui';
import { AccessFriendParams, AccessGroupParams, FriendApplicationItem, GroupApplicationItem, GroupItem, TotalUserStruct } from 'open-im-sdk';
import { getCurrentInstance, onMounted, PropType, ref, watch } from 'vue';
const ctx = getCurrentInstance()
const active = ref<{ uid?: string, groupId?: string, friendApply?: FriendApplicationItem, groupApply?: GroupApplicationItem }>(null)
let loading = false;
const user = ref<TotalUserStruct>(null)
const group = ref<GroupItem>(null)
const status = ref<"apply" | "ingroup" | "isfriend" | "">("")//用户状态
onMounted(() => {
    active.value = OpenIMStore().contactActive
    getUserDetail()
    OpenIMStore().$subscribe((mutations, state) => {
        active.value = state.contactActive

    })
})
watch(active, () => {
    getUserDetail()
    console.log(active.value)
    status.value = null
    if (active.value.friendApply && active.value.friendApply.handleResult == 0) {
        status.value = "apply"
    } else if (active.value.groupApply) {
        if (active.value.groupApply.handleResult == 0) {
            status.value = "apply"
        } else if (active.value.groupApply.handleResult == 1) {
            status.value = "ingroup"
        }
    } else if (active.value.uid) {
        ctx.proxy.$OpenIM.checkFriend([active.value.uid]).then(({ data }) => {

            var res: { userID: string, result: number }[] = JSON.parse(data)
            console.log(res[0], res[0].result == 1)
            if (res[0].result == 1) {
                status.value = "isfriend"
            }
        })
    } else if (active.value.groupId) {
        status.value = "ingroup"
    }
})
function getUserDetail() {
    if (!active.value.uid && !active.value.groupId) {
        return;
    }
    if (loading) {
        return;
    }
    user.value = null;
    group.value = null
    loading = true
    if (active.value.uid) {
        ctx.proxy.$OpenIM.getUsersInfo([active.value.uid]).then(({ data }) => {
            user.value = JSON.parse(data)[0]
            console.log(user.value)
        }).finally(() => {
            loading = false;
        })
    } else {
        ctx.proxy.$OpenIM.getGroupsInfo([active.value.groupId]).then(({ data }) => {
            group.value = JSON.parse(data)[0]
        }).finally(() => {
            loading = false;
        })
    }
}
// 跳转到聊天
function navChat() {
    if (active.value.groupId || active.value.uid) {
        OpenIMStore().setChating(active.value.uid, active.value.groupId)
        router.push({ name: "chat" })
    }
}
function accept() {
    if (status.value == "apply") {
        if (loading) {
            return
        }
        loading = true
        if (active.value.friendApply) {
            const options: AccessFriendParams = {
                toUserID: active.value.friendApply.fromUserID,
                handleMsg: ""
            }
            ctx.proxy.$OpenIM.acceptFriendApplication(options).then(res => {
                status.value = "isfriend"
            }).finally(() => {
                loading = false
            })
        } else if (active.value.groupApply) {
            const options: AccessGroupParams = {
                groupID: active.value.groupApply.groupID,
                fromUserID: active.value.groupApply.userID,
                handleMsg: ""
            }
            ctx.proxy.$OpenIM.acceptGroupApplication(options).then(res => {
                status.value = "ingroup"
            }).finally(() => {
                loading = false
            })
        }

    }
}
function refuse() {
    if (status.value == "apply") {
        if (loading) {
            return
        }
        loading = true
        if (active.value.friendApply) {
            const options: AccessFriendParams = {
                toUserID: active.value.friendApply.fromUserID,
                handleMsg: ""
            }
            ctx.proxy.$OpenIM.refuseFriendApplication(options).then(res => {
                status.value = "isfriend"
            }).finally(() => {
                loading = false
            })
        } else if (active.value.groupApply) {
            const options: AccessGroupParams = {
                groupID: active.value.groupApply.groupID,
                fromUserID: active.value.groupApply.userID,
                handleMsg: ""
            }
            ctx.proxy.$OpenIM.refuseGroupApplication(options).then(res => {
                status.value = "ingroup"
            }).finally(() => {
                loading = false
            })
        }

    }
}
</script>
<style scoped>
.header {
    display: flex;
    padding: 10px;
    border-bottom: 1px solid #f6f6f6;
}

.header .title {
    font-size: 30px;
    flex: 1;
    text-align: left;
}

.rows {
    text-align: left;
    display: flex;
    padding: 6px 0;
}

.rows .lable {
    width: 100px;
    display: block;
    color: #999;
}

.info {
    border-bottom: 1px solid #f6f6f6;
    padding: 20px 0;
}
</style>