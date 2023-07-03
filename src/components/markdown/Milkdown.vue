<template>
  <VueEditor v-loading="loading" element-loading-background="rgba(255, 255, 255, 0.8)" element-loading-text="数据加载中..."
    :editor="editor" />
</template>

<script setup>
import 'katex/dist/katex.min.css';
import 'prism-themes/themes/prism-nord.css'
import { Editor, rootCtx, defaultValueCtx, editorViewOptionsCtx } from "@milkdown/core";
import { nordLight } from "@milkdown/theme-nord";
import { VueEditor, useEditor } from "@milkdown/vue";
import { emoji } from "@milkdown/plugin-emoji";
import { history } from '@milkdown/plugin-history';
import { tooltip } from '@milkdown/plugin-tooltip';
import { menu, menuPlugin, defaultConfig } from "@milkdown/plugin-menu";
import { commonmark, link } from '@milkdown/preset-commonmark';
import { listener, listenerCtx } from '@milkdown/plugin-listener';
import { gfm } from '@milkdown/preset-gfm';
import { toRef, defineProps, watch, ref, onUnmounted } from 'vue';
import { forceUpdate, insert, outline, replaceAll } from '@milkdown/utils';
import { math } from '@milkdown/plugin-math';
import { prism } from '@milkdown/plugin-prism';
import { cursor } from '@milkdown/plugin-cursor';
import { clipboard } from '@milkdown/plugin-clipboard';
import { diagram } from '@milkdown/plugin-diagram';
import { indent } from '@milkdown/plugin-indent';
import { slash } from '@milkdown/plugin-slash';
import { upload, uploadPlugin } from '@milkdown/plugin-upload';
import { trailing } from '@milkdown/plugin-trailing';
import { block } from '@milkdown/plugin-block';
import { Node, Mark } from 'prosemirror-model';
import axios from 'axios';
import { ElMessage } from 'element-plus';
import { useStore } from "vuex";


const store = useStore()
// 项目ID
const projectId = store.getters.getProjectId


//父子组件传参
const props = defineProps({
  md: String,
  preview: Boolean,
  codeType: String,
  id: Number,
  pattern: Number
})


// 文档内容
const content = ref('')
content.value = props.md

// 是否仅可读
const readonly = ref(true)
readonly.value = props.preview

// 文档类型
const codeType = ref("")
codeType.value = props.codeType

// 文档ID
const id = ref(0)
id.value = props.id

const loading = ref(false)

// 编辑模式
const pattern = ref(0)
pattern.value = props.pattern

const uri = ref("")
// 监听父组件值是否发生变化
watch(props, (newVal, oldVal) => {

  if (readonly.value == true) {
    content.value = newVal.md
    // console.log("cc", content.value, "length", content.value.length)
    getInstance().action(replaceAll(content.value))
    // getOutline()
  }
  if (readonly.value != newVal.preview) {
    readonly.value = newVal.preview
    getInstance().action(forceUpdate())
    // getOutline()
  }
  if (newVal.codeType != codeType.value) {
    codeType.value = newVal.codeType
  }
  if (newVal.id != id.value) {
    id.value = newVal.id
  }
  if (newVal.pattern != pattern.value) {
    pattern.value = newVal.pattern
    getOutline()
  }
})



const getTitleList = () => {
  let nodeList = document
    .querySelector(".milkdown .editor")
    ?.querySelectorAll("h1,h2,h3,h4,h5,h6");
  return Array.from(nodeList || []).map((node, index) => {
    return {
      level: parseInt(node.tagName.replace("H", "")),
      text: node.textContent || "",
      node,
      id: index,
    };
  });
};


const getOutline = () => {
  emit("update:outline", getTitleList())
}


// 定时任务 -- 目前存在问题，启用定时任务，日后修改
const timer = setInterval(() => {
  getOutline()
}, 1000);

// 离开页面，自动保存
onUnmounted(() => {
  if (timer) { //如果定时器还在运行 或者直接关闭，不用判断
    clearInterval(timer); //关闭
  }
})

const editable = () => !readonly.value;

// 上传markdown 文本修改至父组件
const emit = defineEmits(["update:md", "update:outline"])

const save = (markdown) => {
  emit("update:md", markdown)
  content.value = markdown
  // console.log("update:content", markdown)
}


const { editor, getInstance, getDom } = useEditor((root) =>
  Editor.make()
    .config((ctx) => {
      ctx.set(rootCtx, root);
      ctx.set(defaultValueCtx, content.value);
      ctx.get(listenerCtx)
        //监听 markdown 文档内容变化
        .markdownUpdated((_, markdown) => {
          // console.log(content.value)
          // console.log("test")
          // console.log(markdown)
          // markdown 普通情况下占两行
          // if (content.value.replace(/[\r \n \\ \s $ ` < > \| \- :]/ig, "") == markdown.replace(/[\r \n \\ \s $ ` < > \| \- :]/ig, "")) {
          //   // console.log("没变")
          // }
          // else {
          if (readonly.value == false) {
            save(markdown)
          }

          // }
        });
      ctx.set(editorViewOptionsCtx, { editable });
    })
    .use(gfm)
    .use(nordLight)
    .use(emoji)
    .use(history)
    .use(commonmark)
    .use(myMenu)
    .use(tooltip)
    .use(listener)
    .use(math)
    // .use(prism)
    .use(cursor)
    .use(clipboard)
    .use(diagram)
    .use(indent)
    .use(
      upload.configure(uploadPlugin, {
        uploader,
      }),
    )
    .use(trailing)
    .use(block)
);

// 自定义目录
const myMenu = menu.configure(menuPlugin, {
  config: defaultConfig.map((section) => {
    return section.map((item) => {
      // console.log(item);
      if (item.type == 'select') {
        item.text = '标题';
        item.options = [
          { id: '0', text: '正文' },
          { id: '1', text: '标题 1' },
          { id: '2', text: '标题 2' },
          { id: '3', text: '标题 3' },
          { id: '4', text: '标题 4' },
        ];
      }
      if (item.key == 'Undo') {
        item.options = { tlabel: '1' }
      }
      switch (item.type) {
        case 'select':
          break;
        case 'undo':
          item.key = "撤销";
          break;
      }
      return item;
    });
  }),
});

// 设置上传参数
const uploader = async (files, schema) => {
  const images = [];

  for (let i = 0; i < files.length; i++) {
    const file = files.item(i);
    if (!file) {
      continue;
    }
    if (!file.type.includes('image')) {
      uploadAPI(file)
      continue;
    }
    // images.push(file);
    uploadAPI(file)
  }
  // const nodes = await Promise.all(
  //   images.map(async (image) => {
  //     const alt = image.name;
  //     uploadAPI(image)
  //     src = uri.value;
  //     return schema.nodes.image.createAndFill({
  //       alt,
  //       src
  //     })
  //     // uploadAPI(image)
  //     // const src = uri.value;
  //     // return schema.nodes.image.createAndFill({
  //     //   src,
  //     //   alt,
  //     // })
  //   }),
  // );

  // return nodes
}

// 上传图片
const uploadAPI = (file) => {
  // console.log(file)
  let formData = new FormData()
  if (codeType.value == "note") {
    formData.append("id", id.value)
    formData.append("file", file)
    loading.value = true
    axios.post("/api/note/assert", formData).then((resp) => {
      if (resp.data.docType == "file") {
        const insertContent = "[" + file.name + "]" + "(" + resp.data.uri + ")";
        getInstance().action(insert(insertContent))
        getInstance().action(insert(""))
      }
      else if (resp.data.docType == "image") {
        const insertContent = "![" + file.name + "]" + "(" + resp.data.uri + ")";
        getInstance().action(insert(insertContent))
        getInstance().action(insert(""))
      }
      loading.value = false
    }).catch((err) => {
      ElMessage.error({ message: err.response.data, duration: 2000, showClose: true })
      loading.value = false
    })
  }

}



</script>
<style>
@font-face {
  font-family: 'Material Icons Outlined';
  font-style: normal;
  font-weight: 400;
  src: url(../../../public/gok-H7zzDkdnRel8-DQ6KAXJ69wP1tGnf4ZGhUce.woff2) format('woff2');
}

.material-icons-outlined {
  font-family: 'Material Icons Outlined';
  font-weight: normal;
  font-style: normal;
  font-size: 24px;
  line-height: 1;
  letter-spacing: normal;
  text-transform: none;
  display: inline-block;
  white-space: nowrap;
  word-wrap: normal;
  direction: ltr;
  -webkit-font-feature-settings: 'liga';
  -webkit-font-smoothing: antialiased;
}


.milkdown-2bdq44 {
  /* overflow: auto; */
  height: calc(83vh);
  /* width: 100%;
  padding: 50px 0 50px 20px; */
}

.milkdown .editor {
  overflow: auto;
  height: calc(72.5vh);
  color: rgba(46, 52, 64, 0.87);
  background: rgb(255, 255, 255);
}

/* .milkdown-6zs4vr{
  background-color: rgb(236, 239, 244);
    color: rgb(46, 52, 64);
} */
</style>
