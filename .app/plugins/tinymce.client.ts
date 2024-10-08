// plugins/tinymce.client.ts
import { defineNuxtPlugin } from '#app'
import Editor from '@tinymce/tinymce-vue'

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.component('Editor', Editor)
})
