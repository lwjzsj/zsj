<template>
    <div class="box" v-for="item in list" :key="item.fromUserID+item.createTime" @click="click(item)" :class="OpenIMStore().contactActive.uid==item.fromUserID?'active':''">
        <n-avatar :src="item.fromFaceURL" :fallback-src="noFace"></n-avatar>
        <div class="contact">
            <div class="title">{{item.fromNickname}}</div>
            <div class="sub_title">用户id：{{item.fromUserID}}</div>
        </div>
        <n-tag size="small" :bordered="false" :type="getResultStyle(item)">
            {{getResult(item)}}
        </n-tag>
    </div>
</template>
<script lang="ts" setup>
import { noFace } from '@/config/config';
import { OpenIMStore } from '@/store/openim';
import { FriendApplicationItem, FriendItem } from 'open-im-sdk';
import { getCurrentInstance, onMounted, ref } from 'vue';
import { NAvatar,NTag } from 'naive-ui';
const ctx = getCurrentInstance()
const list = ref<FriendApplicationItem[]>([])
onMounted(() => {
    list.value = OpenIMStore().friendApply;
    OpenIMStore().$subscribe((mutations, state) => {
        list.value = state.friendApply
    })
})
function getResult(item:FriendApplicationItem){
    if(item.handleResult==0){
        return "待处理"
    }else if(item.handleResult==1){
        return "已同意"
    }else if(item.handleResult==-1){
        return "已拒绝"
    }
}
function getResultStyle(item:FriendApplicationItem){
    if(item.handleResult==0){
        return "error"
    }else if(item.handleResult==1){
        return "info"
    }else if(item.handleResult==-1){
        return "default"
    }
}
function click(e:FriendApplicationItem){
    OpenIMStore().setActiveContact(e.fromUserID,"",e)
}
</script>
<style scoped>
.box {
    height: 48px;
    display: flex;
    padding: 8px;
    border-bottom: 1px solid #f0f0f0;
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

.sub_title {
    width: 100%;
    font-size: 12px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    text-align: left;
    color: #999999;
}
.active{
    background-color: #f0f0f0;
}
</style>