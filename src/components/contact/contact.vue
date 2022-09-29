<template>
    
        <div v-for="items in list" :key="items.sort">
            <div class="index">{{items.sort}}</div>
            <div class="box" v-for="item in items.items" :key="item.friendInfo.userID" @click="click(item.friendInfo)" :class="OpenIMStore().contactActive.uid==item.friendInfo.userID?'active':''">
                <n-avatar :src="item.friendInfo.faceURL" :fallback-src="noFace"></n-avatar>
                <div class="contact">
                    <div class="title">{{item.friendInfo.nickname}}</div>
                </div>
            </div>
        </div>
</template>
<script lang="ts" setup>
import { TotalUserStruct, MessageItem, FriendItem } from "open-im-sdk";
import { OpenIMStore } from "@/store/openim";
import { MsgText } from "@/utils/openim/func";
import { diaplayTime } from "@/utils/utils";
import { NAvatar } from "naive-ui";
import { getCurrentInstance, onMounted, ref, watch, watchEffect } from "vue"
import { nextTick } from "vue"
import pinyin from "js-pinyin"
import { noFace } from "@/config/config";
const ctx = getCurrentInstance()
const _list = ref<TotalUserStruct[]>([])
const list = ref<{ sort: string, items: TotalUserStruct[] }[]>([])


onMounted(() => {
    _list.value = OpenIMStore().contact;
    nextTick(() => {
        OpenIMStore().$subscribe((mutations, state) => {
            _list.value = state.contact;
        })
    })

})

watch([_list], () => {
    formatList()
})
function formatList() {
    var res: { sort: string, items: TotalUserStruct[] }[] = []
    _list.value.map(e => {
        var py = (pinyin.getCamelChars(e.friendInfo.nickname) as string).trim().substring(0, 1).toLocaleUpperCase()
        var index = res.findIndex(v => v.sort == py)
        if (index == -1) {
            res.push({
                sort: py,
                items: [e]
            })
        } else {
            res[index].items.push(e)
            res[index].items = res[index].items.sort((a, b) => a.friendInfo.nickname.localeCompare(b.friendInfo.nickname))
        }
    })
    res = res.sort((a, b) => a.sort.localeCompare(b.sort))
    console.log(res)
    list.value = res
}

//解构消息
function decodeMsg(str: string): string {
    const msg: MessageItem = JSON.parse(str)
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
    console.log(e)
    OpenIMStore().setActiveContact(e.userID)
}
</script>
<style scoped>
.box {
    height: 48px;
    display: flex;
    padding: 8px;
    border-bottom: 1px solid #f6f6f6;
    align-items: center;
    overflow: hidden;
}


.contact {
    flex: 1;
    margin-left: 20px;
    overflow: hidden;
    text-overflow: ellipsis;
}


.title {
    width: 100%;
    font-size: 16px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    text-align: left;
}

.index {
    background-color: #f6f6f6;
    text-align: left;
    padding: 4px 0 2px 8px
}
.active{
    background-color: #f0f0f0;
}
</style>