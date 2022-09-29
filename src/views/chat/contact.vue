<template>
    <div class="contact_box">

        <div class="friend_box">
            <n-scrollbar>
                <n-collapse :default-expanded-names="['4']">
                    <n-collapse-item title="新的朋友" name="1">
                        <FriendApply></FriendApply>
                        <template #header-extra>
                            <div style="padding-right: 10px;">
                                <n-badge :value="OpenIMStore().appendFriendCount"></n-badge>
                            </div>
                        </template>
                    </n-collapse-item>
                    <n-collapse-item title="新的群聊" name="2">
                        <GroupApply></GroupApply>
                        <template #header-extra>
                            <div style="padding-right: 10px;">
                                <n-badge :value="OpenIMStore().appendGroupCount"></n-badge>
                            </div>
                        </template>
                    </n-collapse-item>
                    <n-collapse-item title="群聊" name="3">
                        <Group></Group>
                        <template #header-extra>
                            <div style="padding-right: 10px;">{{OpenIMStore().group.length}}</div>
                        </template>
                    </n-collapse-item>
                    <n-collapse-item title="联系人" name="4">
                        <Contact></Contact>
                        <template #header-extra>
                            <div style="padding-right: 10px;">{{OpenIMStore().contact.length}}</div>
                        </template>
                    </n-collapse-item>
                </n-collapse>
            </n-scrollbar>
        </div>
        <div class="info_box">
            <Detail></Detail>
        </div>
    </div>
</template>
<script lang="ts" setup>
import Contact from '@/components/contact/contact.vue';
import { OpenIMStore } from '@/store/openim';
import { NCollapse, NCollapseItem, NScrollbar, NBadge } from "naive-ui"
import FriendApply from '@/components/contact/friendApply.vue';
import GroupApply from '@/components/contact/groupApply.vue';
import Group from '@/components/contact/group.vue';
import Detail from '@/components/contact/detail.vue';
</script>
<style scoped>
.contact_box {
    width: 100%;
    height: 100%;
    display: flex;

}

.friend_box {
    width: 250px;
    height: 100%;
    border-right: 1px solid #f0f0f0;
    overflow: hidden;
}

.info_box {
    flex: 1;
    height: 100%;
    overflow: hidden;
}
</style>
