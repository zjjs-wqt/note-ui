<template>
    <div id="vditor" class="vd" @keydown.ctrl="save" />
</template>
  
<script setup>
import Vditor from './vditor/src/index.ts'
import { onMounted, onUnmounted, ref, watch, } from 'vue';
import axios from 'axios';
import { ElLoading, ElMessage } from "element-plus";
import { useStore } from 'vuex';
const vditor = ref(null)
const flag = ref(false)

const store =useStore()
const props = defineProps({
    // 内容
    content: {
        type: String,

    },
    // 文档ID
    id: {
        type: Number,
        default: 0
    },
    // 文档类型
    codeType: {
        type: String,
        default: ""
    },
    height: {
        type: String,
        default: "83.5vh"
    },
    width: {
        type: String,
        default: "auto"
    },
})

// 编辑器模式
const mode = store.getters.getMode
// 内容
const content = ref(props.content)
const height = ref(props.height)
const width = ref(props.width)
const id = ref(props.id)
// 文档类型
const codeType = ref(props.codeType)

const emit = defineEmits(["init", "update:ctrlSave", "loading", "update:content"])
watch(props, (newVal, oldVal) => {
    if (newVal.id !== id.value) {
        id.value = newVal.id
    }
    if (newVal.content !== content.value) {
        content.value = newVal.content
    }
    if (newVal.codeType !== codeType.value) {
        codeType.value = newVal.codeType
    }
})
const save = (val) => {
    if (val.key == 's') {
        val.preventDefault()
        emit("update:ctrlSave", true)
    }
}
onMounted(() => {
    init()
})
const init = () => {
    vditor.value = new Vditor('vditor', {
        height: height.value,
        width: width.value,
        tab: "    ",
        outline: {
            enable: true
        },
        toolbar: [
            "headings",
            "bold",
            "italic",
            "strike",
            "link",
            "|",
            "list",
            "ordered-list",
            "check",
            "outdent",
            "indent",
            "|",
            "quote",
            "line",
            "code",
            "inline-code",
            "insert-before",
            "insert-after",
            "|",
            { //自定义上传
                hotkey: "",
                name: "upload",
                tipPosition: "s",
                tip: "上传资源",
                className: "right",
            },
            "table",
            "|",
            "undo",
            "redo",
            "|",
            "edit-mode",
            // "export",
            "outline",
            "both",
            {
                hotkey: "",
                name: "preview",
                className: "preview_css",
            }
        ],
       
        input: (val) => {
            emit("update:content", val)
        },
        after: () => {
            flag.value = true
            vditor.value.setValue(content.value);
            // 完成初始化后，获取内容
            emit("init")
        },
        typewriterMode: true,
        mode: mode,
        preview: {
            mode: "both",
            actions: [],
            hljs: {
                enable: true,
            },
            parse: (val) => {
                // 完成渲染
                emit("loading")
            },
        },
        icon: "material",
        upload: {
            multiple: false,
            handler(files) {
                for (let index = 0; index < files.length; index++) {
                    let Eloading = ElLoading.service({ text: '文件上传中请稍后...' })
                    const file = files[index];
                    let formData = new FormData()
                    formData.append("id", id.value)
                    formData.append("file", file)
                    let url = ""
                    if (codeType.value === "note") {
                        url = "/api/note/assert"
                    } 
                    axios.post(url, formData, {
                        onUploadProgress: (progressEvent) => {
                            if (Math.floor(progressEvent.progress * 100) < 100) {
                                Eloading.setText("文件上传中请稍后" + Math.floor(progressEvent.progress * 100) + "%...")
                            } else {
                                Eloading.setText("文件上传中请稍后" + 99 + "%...")
                            }
                        }
                    }).then((resp) => {
                        // 防止文件名称存在特殊字符 影响展示
                        let regex = /\[|\]/;
                        let name = file.name
                        if (regex.test(name)) {
                            name = generateRandomString(10)
                        }

                        // 根据文件类型展示
                        if (resp.data.docType == "image") {
                            vditor.value.insertValue(`\n![${name}](${resp.data.uri})\n`);
                        } else if (resp.data.docType == "file") {
                            vditor.value.insertValue(`\n[${name}](${resp.data.uri})\n`);
                        }
                    }).catch((err) => {
                        ElMessage.error({ message: err.response.data, duration: 2000, showClose: true })
                    }).finally(() => {
                        Eloading.close()
                    })
                }
            },
        }

    });
}
// 生成随机字符串
const generateRandomString = (length) => {
    let result = '';
    let characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }

    return result;
}
// 获取数据
const getValue = () => {
    return vditor.value.getValue();
}
const firstFlag = ref(true)
const setValue = (content) => {
    // 加载动画
    if ((content == '' || content == '\r\n' || content == '\n' || content == '\r') && firstFlag.value !== true) {
        emit("loading")
    }
    if (firstFlag.value === true) {
        firstFlag.value = false
    }
    // 特殊处理，防止vditor未完成初始化就调用该接口
    if (flag.value === true) {
        vditor.value.setValue(content)
    }
}


// 模拟点击预览模式
const toPreview = () => {
    if (flag.value === true) {
        // 上传编辑模式
        store.commit("saveMode", vditor.value.getCurrentMode())

        // 模拟点击
        var evt = document.createEvent('Event');
        evt.initEvent('click', true, true);
        vditor.value.vditor.toolbar.elements.preview.firstElementChild.dispatchEvent(evt);
    }
}

// 隐藏工具栏
const hideTools = () => {
    if (flag.value === true) {
        const toolbarElement = document.querySelector('.vditor-toolbar');
        toolbarElement.style.display = 'none';
    }
}

// 显示工具栏
const showTools = () => {
    if (flag.value === true) {
        const toolbarElement = document.querySelector('.vditor-toolbar');
        toolbarElement.style.display = 'block';
    }
}

// 编辑模式
const modeEdit = () => {
    if (flag.value === true) {
        toPreview()
        showTools()
    }
}

// 预览模式
const modePreview = () => {
    if (flag.value === true) {
        toPreview()
        hideTools()
    }
}





defineExpose({
    getValue,
    setValue,
    toPreview,
    hideTools,
    showTools,
    modeEdit,
    modePreview
})

</script>
  
  
<style scoped>
.vd :deep(pre code) {
    color: black;
}


.vd :deep(.preview_css) {
    display: none;
}

</style>
  