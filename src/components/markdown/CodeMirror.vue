<template>
  <codemirror v-model="content" :autofocus="true" :indent-with-tab="true" :tab-size="4"
    :style="{ overflow: 'auto', minHeight: '600px', height: 'calc(86vh)' }" :extensions="extensions" @ready="handleReady"
    @update="getCursor" @drop="drop" @paste="paste" v-loading="loading"
    element-loading-background="rgba(255, 255, 255, 0.8)" element-loading-text="数据加载中..." />
</template>

<script setup>
import { Codemirror } from 'vue-codemirror'
import {
  crosshairCursor,
  drawSelection,
  dropCursor,
  highlightActiveLine,
  highlightActiveLineGutter,
  highlightSpecialChars,
  keymap,
  rectangularSelection,
} from '@codemirror/view';
import { autocompletion, closeBrackets, closeBracketsKeymap, completionKeymap } from '@codemirror/autocomplete';
import { defaultKeymap, history, historyKeymap } from '@codemirror/commands';
import { markdown } from '@codemirror/lang-markdown';
import {
  bracketMatching,
  defaultHighlightStyle,
  foldGutter,
  foldKeymap,
  indentOnInput,
  syntaxHighlighting,
} from '@codemirror/language';
import { lintKeymap } from '@codemirror/lint';
import { highlightSelectionMatches, searchKeymap } from '@codemirror/search';
import { EditorState } from '@codemirror/state';
import { useStore } from 'vuex'
import { computed, onMounted, readonly, ref, watch } from 'vue';
import axios from 'axios';
import { ElMessage } from 'element-plus';
import { Editor } from '@milkdown/core';


const loading = ref(false)
const content = ref('')
const store = useStore()
const edit = ref()
const cursor = ref()
const pasteFlag = ref(false)

//父子组件传参
const props = defineProps({
  id: Number,
  cmtype: String,
})

const id = ref()
id.value = props.id

const cmtype = ref()
cmtype.value = props.cmtype

// 项目ID
const projectId = store.getters.getProjectId

const handleReady = (obj) => {
  edit.value = obj.view
  obj.view.contentDOM.addEventListener("drop", function (e) {
    e.preventDefault()
  }, true)
  obj.view.contentDOM.addEventListener("dragover", function (e) {
    e.preventDefault()
  }, true)

}

// 粘贴
const paste = (val) => {
  val.preventDefault()
  // console.log(val.clipboardData.files)

  if (val.clipboardData.files.length == 0) {
    return
  }

  for (let index = 0; index < val.clipboardData.files.length; index++) {
    const file = val.clipboardData.files[index];
    if (cmtype.value == "note") {
      let formData = new FormData()
      formData.append("id", id.value)
      formData.append("file", file)
      loading.value = true
      axios.post("/api/note/assert", formData).then((resp) => {
        if (resp.data.docType == "file") {
          const insertContent = "[" + file.name + "]" + "(" + resp.data.uri + ")\n";
          edit.value.dispatch({
            changes: {
              from: cursor.value.from,
              to: cursor.value.to,
              insert: insertContent
            },
            selection: { anchor: cursor.value.from + insertContent.length },
            scrollIntoView: true
          })
        }
        else if (resp.data.docType == "image") {
          const insertContent = "![" + file.name + "]" + "(" + resp.data.uri + ")\n";
          edit.value.dispatch({
            changes: {
              from: cursor.value.from,
              to: cursor.value.to,
              insert: insertContent
            },
            selection: { anchor: cursor.value.from + insertContent.length },
            scrollIntoView: true
          })
        }
        loading.value = false
      }).catch((err) => {
        loading.value = false
        ElMessage.error({ message: err.response.data, duration: 2000, showClose: true })
      })
    }
   }
}

// 拖拽
const drop = (val) => {
  val.preventDefault()
  //console.log(val)
  if (val.dataTransfer.files.length == 0) {
    return
  }

  for (let index = 0; index < val.dataTransfer.files.length; index++) {
    const file = val.dataTransfer.files[index];

   if (cmtype.value == "note") {
      let formData = new FormData()
      formData.append("id", id.value)
      formData.append("file", file)
      loading.value = true
      axios.post("/api/note/assert", formData).then((resp) => {
        if (resp.data.docType == "file") {
          const insertContent = "[" + file.name + "]" + "(" + resp.data.uri + ")\n";
          edit.value.dispatch({
            changes: {
              from: cursor.value.from,
              to: cursor.value.to,
              insert: insertContent
            },
            selection: { anchor: cursor.value.from + insertContent.length },
            scrollIntoView: true
          })
        }
        else if (resp.data.docType == "image") {
          const insertContent = "![" + file.name + "]" + "(" + resp.data.uri + ")\n";
          edit.value.dispatch({
            changes: {
              from: cursor.value.from,
              to: cursor.value.to,
              insert: insertContent
            },
            selection: { anchor: cursor.value.from + insertContent.length },
            scrollIntoView: true
          })
        }
        loading.value = false
      }).catch((err) => {
        loading.value = false
        ElMessage.error({ message: err.response.data, duration: 2000, showClose: true })
      })
    }
  
  }
}


const getCursor = (val) => {
  edit.value = val.view
  cursor.value = val.state.selection.ranges[0]
}

const extensions = [
  markdown(),
  // lineNumbers(),
  highlightActiveLineGutter(),
  highlightSpecialChars(),
  history(),
  foldGutter(),
  drawSelection(),
  dropCursor(),
  EditorState.allowMultipleSelections.of(true),
  indentOnInput(),
  syntaxHighlighting(defaultHighlightStyle, { fallback: true }),
  bracketMatching(),
  closeBrackets(),
  autocompletion(),
  rectangularSelection(),
  crosshairCursor(),
  highlightActiveLine(),
  highlightSelectionMatches(),
  keymap.of([
    ...closeBracketsKeymap,
    ...defaultKeymap,
    ...searchKeymap,
    ...historyKeymap,
    ...foldKeymap,
    ...completionKeymap,
    ...lintKeymap,
  ]),
];

</script>
<style scope>

</style>
