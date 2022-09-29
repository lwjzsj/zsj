<template>
    <n-icon :size="size">
        <n-avatar :src="src" :size="size" :fallback-src="unkownSrc"
            :style="{backgroundColor: 'rgba(255,255,255,0)'}" />
    </n-icon>
</template>
<script lang="ts" setup>
import { NIcon, NAvatar } from "naive-ui"
import { onMounted, ref } from "vue";
const props = defineProps({
    fileName: {
        type: String,
        required: true
    },
    size: {
        type: Number,
        default: 40
    }
})
const src = ref<string>("")
const unkownSrc = new URL(`../assets/file/unkown.png`, import.meta.url).href
onMounted(() => {
    var f = props.fileName.split('.')
    src.value = new URL(`../assets/file/${f[f.length - 1]}.png`, import.meta.url).href
})
</script>