<!-- eslint-disable vue/multi-word-component-names -->
<template>
    <div class="box">
        <n-card title="登录">
            <n-form ref="formRef" :model="model" :rules="rules" label-placement="left" label-width="auto"
                require-mark-placement="right-hanging" size="medium" :style="{
                  maxWidth: '640px'
                }">
                <n-form-item label="登录账号" path="username">
                    <n-input v-model:value="model.username" placeholder="请输入登录账号" />
                </n-form-item>
                <n-form-item label="登录密码" path="password">
                    <n-input v-model:value="model.password" placeholder="请输入登录密码" />
                </n-form-item>
                <n-button type="primary" :block="true" @click="handellogin" :disabled="logining">
                    登录
                </n-button>
            </n-form>
        </n-card>
    </div>
</template>
<script lang="ts" setup>
import { getCurrentInstance, ref } from "vue";
import { NForm, NFormItem, NInput, NButton, NCard } from 'naive-ui';
import { message } from '@tauri-apps/api/dialog';
import { userStore } from "@/store/user"
import { login } from "@/api/user";
import router from "@/router";
import { OpenIMStore } from "@/store/openim";
import { relaunch } from '@tauri-apps/api/process';

const formRef = ref(null)
const logining = ref(false)
const { proxy } = getCurrentInstance();
const model = ref(
    {
        username: "",
        password: "",
    }
)
const rules = ref({
    username: {
        required: true,
        trigger: ['blur', 'input'],
        message: '请输入用户名',

    },
    password: {
        required: true,
        trigger: ['blur', 'input'],
        message: '请输入登录密码',

    },
})
function handellogin() {
    logining.value = true
    formRef.value?.validate((errors) => {
        if (!errors) {

            login(model.value.username, model.value.password).then(async res => {
                let { userLogin } = userStore();
                console.log(res)
                userLogin(res.data.token, res.data.userID);
                await message("登录成功",{ title: '汇安', type: 'info' })
                console.log("登录成功")
                // await OpenIMStore().openimLogin(proxy.$OpenIM, res.data.token, res.data.userID);
                window.location.href = window.location.href.replace("login","chat")
            }).finally(() => {
                logining.value = false
            })
        } else {
            logining.value = false
        }

    })
}
</script>
<style scoped>
.box {
    width: 100%;
    display: flex;
    justify-content: flex-end;
    align-items: flex-start;
}

.n-card {
    max-width: 300px;
    margin: 30px;
}
</style>