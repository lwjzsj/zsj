import { OpenIMSDK } from 'open-im-sdk';
import {ComponentCustomProperties} from "vue"

/* eslint-disable */
declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}

declare module "@vue/runtime-core" {
  interface ComponentCustomProperties{
    $OpenIM:OpenIMSDK
  }
}
