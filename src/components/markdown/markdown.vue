<template>
  <div id="split" @keydown.ctrl="save">
    <div class="markdown" v-if="cmFlag == false">
      <Milkdown
        :class="[codeType === 'stage' ? 'markdown-md-max' : '', codeType === 'doc' ? 'markdown-md-max-doc' : '', preview === true ? 'md-preview' : 'md-unpreview']"
        :md="content" @update:md="update" :preview="preview" :codeType="codeType" :id="id" :pattern="pattern" @update:outline="getOutline" />
    </div>
    <div :class="[codeType === 'stage' ? 'markdown-cm' : '', codeType === 'doc' ? 'markdown-cm-doc' : '']"
      v-else-if="codeFlag">
      <CodeMirror v-model="content" :id="id" :cmtype="codeType" />
    </div>
    <split-pane :min="middleContent" :max="middleContent * 2 - 300" style="height: 100%;" v-else>
      <template v-slot:left>
        <CodeMirror v-model="content" :id="id" :cmtype="codeType" style="min-height: 805px ;" />
      </template>
      <template v-slot:right>
        <div :class="[codeType === 'stage' ? 'markdown-cm' : '', codeType === 'doc' ? 'markdown-cm-doc-sp' : '']"
          v-if="cmFlag">
          <Milkdown :class="[codeType === 'stage' ? 'markdown-md' : '', codeType === 'doc' ? 'markdown-md-doc-sp' : '']" class = "md"
          :md="content" :pattern="pattern" @update:md="update" :preview="preview" :codeType="codeType" :id="id" />  
        </div>
      </template>
    </split-pane>
  </div>



</template>
<script setup>
import Milkdown from "./Milkdown.vue"
import CodeMirror from './CodeMirror.vue';
import { watch, ref } from "vue";
import SplitPane from './SplitPane.vue'

//父子组件传参
const props = defineProps({
  content: String,
  pattern: Number,
  codeType: String,
  id: Number,
})

const content = ref('')
content.value = props.content

// 编辑模式
const pattern = ref(0)
pattern.value = props.pattern

const codeType = ref("")
codeType.value = props.codeType

const id = ref(0)
id.value = props.id

const ctState = ref(false)
// 仅 markdown
const cmFlag = ref(false)
// 是否仅可读
const preview = ref(true)
// 仅 codeMirror
const codeFlag = ref(true)
const middleContent = ref(0)
const div = ref(0)
// const ctState = ref(false)

const emit = defineEmits(["update:content", "update:ctState", "update:ctrlSave","update:outline"])

const save = (val) => {
  if (val.key == 's') {
    val.preventDefault()
    emit("update:ctrlSave", true)
  }
}

const getOutline = (val) =>{
  // console.log(val);
  emit("update:outline", val)
}

watch(content, (newVal, oldVal) => {
  if (ctState.value == false) {
    ctState.value = true
  }
  else {
    emit("update:ctState", true)
  }

  emit("update:content", newVal)
})

// 监听父组件值是否发生变化
watch(props, (newVal, oldVal) => {
  if (newVal.content != content.value) {
    content.value = newVal.content
    ctState.value = false
    emit("update:ctState", false)
  }
  if (newVal.pattern != pattern.value) {
    pattern.value = newVal.pattern
    if (pattern.value == 1) toEdit()
    else if (pattern.value == 2) toPreview()
    else if (pattern.value == 3) toMixed()
    else if (pattern.value == 4) toCode()
  }
  if (newVal.codeType != codeType.value) {
    codeType.value = newVal.codeType
  }
  if (newVal.id != id.value) {
    id.value = newVal.id
  }
})

watch(div, (newVal, oldVal) => {
  if (cmFlag.value == true && preview.value == true && codeFlag.value == false && newVal < 800) {
    toCode()
  }
})

const update = (val) => {
  content.value = val
}

const toPreview = () => {
  preview.value = true
  cmFlag.value = false
  codeFlag.value = false
}

const toEdit = () => {
  preview.value = false
  cmFlag.value = false
  codeFlag.value = false
}

const toMixed = () => {
  cmFlag.value = true
  preview.value = true
  codeFlag.value = false
  div.value = document.getElementById("split").clientWidth
  if (cmFlag.value == true && preview.value == true && codeFlag.value == false && div.value < 800) {
    toCode()
  }
  middleContent.value = div.value / 2
}

const toCode = () => {
  codeFlag.value = true
  cmFlag.value = true
}

</script>

<style scoped>
.mk-btn {
  display: flex;
  align-content: center;
  justify-content: flex-start;
  margin: 20px 50px 20px 20px;
}

.mk-group {}

.markdown {
  width: 100%;
  /* display: flex; */
}

.markdown:deep(.milkdown-18q6pwp::-webkit-scrollbar-thumb){
  /* border-radius: 5px; */
  background: rgba(0, 0, 0, 0.1);
  box-shadow: inset006pxrgba(0, 0, 0, 0.5);
  border-radius: 10px;
}

.markdown-md {
  width: 95%;
  margin: 10px;
  text-align: start;
}

.markdown-cm {
  width: 95%;
  margin: 10px;
  text-align: start;
}

.markdown-md-max {
  width: 95%;
  margin: 20px;
  text-align: start;
}

.markdown-md-doc {
  width: 100%;
  margin-top: 10px;
  /* margin: 10px;  */
  text-align: start;
}

.markdown-cm-doc {
  width: 100%;
  margin-top: 20px;
  /* margin: 10px;  */
  text-align: start;
}

.markdown-md-max-doc {
  width: 100%;
  /* margin-top: 10px; */
  /* margin: 20px;  */
  text-align: start;
}

.markdown-md-doc-sp {
  width: 100%;
  margin-top: 10px;
  /* margin-right: 20px;  */
  text-align: start;
}

.markdown-cm-doc-sp {
  width: 100%;
  margin-top: 10px;
  /* margin-left: 40px;  */
  text-align: start;
}

.md-preview :deep(.milkdown .editor) {
  height: calc(74vh);
  /* margin-top: 10px; */
}

.md-unpreview :deep(.milkdown .editor) {
  height: calc(69vh);
}

.md :deep(.milkdown .editor) {
  height: calc(74vh);
}
</style>
