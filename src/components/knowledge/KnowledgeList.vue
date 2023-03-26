<template>
    <div v-contextmenu:contextmenu @drop="drop" @mousedown.right="menuItem = { type: '' }" class="divForMenu"
        v-loading="loading" :element-loading-text="loadingText">
        <div class="know-top" style="height:60px;margin-bottom: 5px;">
            <div style="float:bottom; font-size: 12px;width: 70px;">
                <span>共{{ list.length }}个文件</span>
            </div>
            <div style="display:flex;height:60px;margin-top: 10px;margin-left: 10px;">
                <div style="margin-right:2px ; cursor: pointer;" @click="back()">
                    <img src="../../assets/back.png" style="height:24px;" />
                </div>
                <div style="margin-top:5px;margin-left: 2px; display: flex;">
                    <el-breadcrumb separator="/">
                        <el-breadcrumb-item v-for="item in pathList" :key="item.id">
                            <a @click.prevent="skipBread(item)"> {{ item.name }}</a>
                        </el-breadcrumb-item>
                    </el-breadcrumb>
                </div>
                <el-input v-model="searchItem" class="search-input" placeholder="搜索文件/文件夹" :prefix-icon="Search"
                    style="width:15%;height: 30px;margin-left: auto;margin-right: 10px;" clearable
                    @keydown.enter="searchForFile" v-if="funcType === 'pubArea'" />
            </div>
        </div>

        <el-table :data="list" style="width: 100%" @row-click="skip" @row-contextmenu="getMenuItem"
            :row-class-name="isHover">
            <el-table-column prop="item" label="名称" width="800">
                <template #default="scope">
                    <div class="icon" draggable="true" @dragstart="drag(scope.row)" :id="scope.$index"
                        @dragover="over(scope.row)" @dragleave="leave(scope.row)" @drop="leave(scope.row)">
                        <img v-if="scope.row.type === 'file'" :id="scope.$index" :src="getCaption(scope.row.name)"
                            style="height:24px;" draggable="false" />
                        <img v-else-if="scope.row.type === 'dir'" src="../../assets/fileType/folder.svg"
                            :id="scope.$index" style="height:24px;" draggable="false" />
                        <div class="name" :title="scope.row.name" style="cursor: default;" :id="scope.$index">
                            <el-input @click.stop="" v-if="renameFlag === scope.row.name" v-model="folderName"
                                @keydown.enter="fileRename(folderName, eventType.enter, $event)"
                                @blur="fileRename(folderName, eventType.blur, $event)" :autofocus="true"
                                :ref="(el) => { tofocus(el) }">
                                {{ scope.row.name }}
                            </el-input>
                            <span v-else :id="scope.$index">{{ scope.row.name }}</span>
                        </div>
                    </div>
                </template>
            </el-table-column>
            <el-table-column prop="updatedAt" label="更新时间" width="500" />

            <el-table-column prop="type" label="类型" width="500">
                <template #default="scope">
                    <div v-if="scope.row.type === 'dir'">
                        文件夹
                    </div>
                    <div v-else-if="scope.row.type === 'file'">
                        文件
                    </div>
                </template>
            </el-table-column>
            <el-table-column prop="size" label="大小">
                <template #default="scope">
                    <div v-if="scope.row.type === 'dir'">
                    </div>
                    <div v-else-if="scope.row.type === 'file'">
                        {{ formatByte(scope.row.size) }}
                    </div>
                </template>
            </el-table-column>
        </el-table>

    </div>

    <v-contextmenu ref="contextmenu" :disabled="menuFlag">
        <v-contextmenu-item @click="download" v-if="menuItem.type !== ''">下载</v-contextmenu-item>
        <v-contextmenu-item @click="moveOrCopy" v-if="menuItem.type !== '' && userType === 'admin'">复制/移动
        </v-contextmenu-item>
        <v-contextmenu-item @click="rename" v-if="menuItem.type !== '' && userType === 'admin'">重命名
        </v-contextmenu-item>
        <v-contextmenu-item @click="getAttribute" v-if="menuItem.type !== ''">属性</v-contextmenu-item>
        <v-contextmenu-item style="color:red;" @click="remove" v-if="menuItem.type !== '' && userType === 'admin'">删除
        </v-contextmenu-item>
        <v-contextmenu-item v-if="menuItem.type === ''" class="upload">
            <el-upload :auto-upload="false" :on-change="upload" :show-file-list=false >
                <div class="upload-item">
                    上传
                </div>
            </el-upload>
        </v-contextmenu-item>
        <v-contextmenu-item @click="newFileFolder" v-if="menuItem.type === ''">新建</v-contextmenu-item>
    </v-contextmenu>

    <el-dialog v-model="attributeFlag" :close-on-click-modal="false" :show-close="false" title="文件属性" width="30%">
        <el-descriptions direction="horizontal" :column="1" border>
            <el-descriptions-item label="名称" label-align="center" align="center">
                {{ attributeFrom.name }}
            </el-descriptions-item>
            <!-- <el-descriptions-item label="用户名" label-align="center" align="center">{{ userInfo.username }}
                </el-descriptions-item> -->
            <el-descriptions-item label="类型" label-align="center" align="center">
                <div v-if="attributeFrom.type === 'dir'">
                    文件夹
                </div>
                <div v-else-if="attributeFrom.type === 'file'">
                    文件
                </div>
            </el-descriptions-item>
            <el-descriptions-item label="位置" label-align="center" align="center">{{ attributeFrom.path }}
            </el-descriptions-item>
            <el-descriptions-item label="大小" label-align="center" align="center" v-if="attributeFrom.type === 'file'">
                <div v-if="attributeFrom.type === 'file'">
                    {{ formatByte(attributeFrom.size) }}&nbsp;&nbsp;({{ attributeFrom.size }}&nbsp;字节)
                </div>
            </el-descriptions-item>
            <el-descriptions-item label="更新时间" label-align="center" align="center">{{ attributeFrom.updatedAt }}
            </el-descriptions-item>
        </el-descriptions>
        <template #footer>
            <span class="dialog-footer">
                <el-button type="primary" @click="attributeFlag = false">确认</el-button>
            </span>
        </template>
    </el-dialog>

    <el-dialog v-model="moveFlag" :close-on-click-modal="false" :show-close="false" title="复制/移动" width="30%">
        <el-tree ref="tree" :data="treeData" :props="defaultProps" :load="loadNode" lazy @node-click="getToPath"
            highlight-current>
            <template #default="{ data }">
                <div style="display: flex;">
                    <img src="../../assets/fileType/folder.svg" style="height:20px;" />
                    <div style="margin-top: -2px;">
                        {{ data.name }}
                    </div>
                </div>
            </template>
        </el-tree>
        <template #footer>
            <span class="dialog-footer">
                <el-button type="primary" @click="fileCopy()">复制</el-button>
                <el-button type="primary" @click="fileMove()">移动</el-button>
                <el-button @click="moveFlag = false">取消</el-button>
            </span>
        </template>
    </el-dialog>


</template>

<script setup>
import { Folder } from '@element-plus/icons-vue';
import axios from 'axios';
import { ElLoading, ElMessage, ElMessageBox } from 'element-plus';
import { h, onMounted, onUnmounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { Search } from '@element-plus/icons-vue'

import unknown from '../../assets/fileType/unknown.svg'
import css from '../../assets/fileType/css.svg'
import excel from '../../assets/fileType/excel.svg'
import exe from '../../assets/fileType/exe.svg'
import html from '../../assets/fileType/html.svg'
import image from '../../assets/fileType/image.svg'
import js from '../../assets/fileType/js.svg'
import json from '../../assets/fileType/json.svg'
import md from '../../assets/fileType/md.svg'
import mp3 from '../../assets/fileType/mp3.svg'
import pdf from '../../assets/fileType/pdf.svg'
import PHP from '../../assets/fileType/PHP.svg'
import ppt from '../../assets/fileType/ppt.svg'
import PSD from '../../assets/fileType/PSD.svg'
import sql from '../../assets/fileType/sql.svg'
import txt from '../../assets/fileType/txt.svg'
import word from '../../assets/fileType/word.svg'
import zip from '../../assets/fileType/zip.svg'

const menuFlag = ref(false)
const menuItem = ref({
    type: "",
})
const props = defineProps({
    userType: String,
    funcType: String,
})
const activeFocus = ref(true)

// 用户类型： admin - 管理员/项目负责人 user - 用户/项目用户
const userType = ref('')
userType.value = props.userType
// 方法地址： pubArea  project/testArea
const funcType = ref('')
funcType.value = props.funcType
// 列表信息
const list = ref([])
// 当前相对路径
const path = ref("")
// 属性表单
const attributeFrom = ref()
const attributeFlag = ref(false)
const route = useRoute()
const router = useRouter()
// 搜索栏
const searchItem = ref("")
// 加载loading
const loading = ref(false)
const moveFlag = ref(false)
const pathList = ref()
const loadingText = ref('')

// 拖拽上传动态样式控制
const cssFlag = ref(false)

// 事件类型
const eventType = {
    enter: -1,
    blur: 0,
}

// 获取图标
const getCaption = (obj) => {
    var index = obj.lastIndexOf(".");
    if (index == -1) {
        return unknown
    }
    else {
        obj = obj.substring(index + 1, obj.length);
        obj = obj.toLowerCase()
        switch (obj) {
            case "css":
                return css
            case "xls":
            case "xlsx":
                return excel
            case "exe":
                return exe
            case "html":
                return html
            case "png":
            case "jpg":
            case "jpeg":
            case "gif":
            case "svg":
            case "ico":
            case "bitmap":
                return image
            case "js":
                return js
            case "json":
                return json
            case "md":
                return md
            case "mp3":
                return mp3
            case "pdf":
                return pdf
            case "php":
                return PHP
            case "ppt":
                return ppt
            case "psd":
                return PSD
            case "sql":
                return sql
            case "txt":
                return txt
            case "vue":
                return vue
            case "doc":
            case "docx":
                return word
            case "zip":
                return zip
            default:
                return unknown
        }
    }

}


// 自动聚焦
const tofocus = (val) => {
    if (val) {
        val.focus()
    }
}

// 拖拽样式
const isHover = (row, rowIndex) => {
    if (row.row.hover === true) {
        return 'warning-row'
    }
    else {
        return ''
    }
}

// 初始化
const init = () => {
    let baseList = route.fullPath.split("/")
    path.value = ""
    for (var i = 3; i < baseList.length; ++i) {
        path.value += "/" + baseList[i]
    }
    path.value = decodeURIComponent(path.value);
    if (funcType.value == 'pubArea') {
        pathList.value = [
            {
                id: 0,
                name: "公共知识区"
            },
        ]
    } else if (funcType.value == 'project/testArea') {
        pathList.value = [
            {
                id: 0,
                name: "测试管理区"
            },
        ]
    }
    breadpath(path.value)
    getList(path.value)
}

onMounted(() => {
    init()
})

// 跳转
const skip = (val) => {
    if (val.type == "dir") {
        // let baseList = route.fullPath.split("/")
        // path.value = ""
        // for (var i = 3; i < baseList.length; ++i) {
        //     path.value += "/" + baseList[i]
        // }
        // path.value += "/" + val.name
        path.value = val.path
        getList(path.value)
        breadpath(path.value)

        if (funcType.value == 'pubArea' && userType.value == "admin") {
            router.push({
                path: "/admin/knowledgePage" + path.value
            })
        }
        else if (funcType.value == 'pubArea' && userType.value == "user") {
            router.push({
                path: "/Index/knowledgePage" + path.value
            })
        }
        else if (funcType.value == "project/testArea") {
            router.push({
                path: "/project/test" + path.value
            })
        }

    }


}

// 面包屑跳转
const skipBread = (item) => {
    if (funcType.value == 'pubArea') {
        let url = ""
        pathList.value.forEach(e => {
            if (e.id <= item.id) {
                if (e.name !== "公共知识区") {
                    url += "/" + e.name
                }
            }
        })
        path.value = url
        getList(url)
        breadpath(url)
        if (userType.value == "admin") {
            router.push({
                path: "/admin/knowledgePage" + url
            })
        }
        else if (userType.value == "user") {
            router.push({
                path: "/Index/knowledgePage" + url
            })
        }
    }
    else if (funcType.value == 'project/testArea') {
        let url = ""
        pathList.value.forEach(e => {
            if (e.id <= item.id) {
                if (e.name !== "测试管理区") {
                    url += "/" + e.name
                }
            }
        })
        path.value = url
        getList(url)
        breadpath(url)
        router.push({
            path: "/project/test" + path.value
        })
    }
}

// 返回
const back = () => {
    if (funcType.value == 'pubArea') {
        let url = ""
        for (let index = 0; index < pathList.value.length - 1; index++) {
            if (pathList.value[index].name !== "公共知识区") {
                url += "/" + pathList.value[index].name
            }
        }

        path.value = url
        getList(url)
        breadpath(url)
        if (userType.value == "admin") {
            router.push({
                path: "/admin/knowledgePage" + url
            })
        }
        else if (userType.value == "user") {
            router.push({
                path: "/Index/knowledgePage" + url
            })
        }
    }
    else if (funcType.value == 'project/testArea') {
        let url = ""
        for (let index = 0; index < pathList.value.length - 1; index++) {
            if (pathList.value[index].name !== "测试管理区") {
                url += "/" + pathList.value[index].name
            }
        }
        path.value = url
        getList(url)
        breadpath(url)
        router.push({
            path: "/project/test" + path.value
        })
    }
}

// 获取面包屑
const breadpath = (item) => {
    if (funcType.value == 'pubArea') {
        pathList.value = [
            {
                id: 0,
                name: "公共知识区"
            },
        ]
    } else if (funcType.value == 'project/testArea') {
        pathList.value = [
            {
                id: 0,
                name: "测试管理区"
            },
        ]
    }
    var id = 0
    if (item !== "") {
        let arr = item.split('/')
        arr.forEach(e => {
            if (e) {
                let pathName = decodeURIComponent(e)
                e = { id: id, name: pathName }
                pathList.value.push(e)
            }
            id++
        })
        // pathList.value = arr.filter(i => i && i.trim())
    }

}

// 获取列表
const getList = (item) => {
    loading.value = true
    axios.get("/api/" + funcType.value + "/list?base=" + encodeURIComponent(item)).then((resp) => {
        list.value = resp.data
        // menuFlag.value = false
        // if (list.value.length == 0) {
        //     menuFlag.value = true
        // }
        loading.value = false
    }).catch((err) => {
        ElMessage.error({ message: err.response.data, duration: 1000, showClose: true })
        loading.value = false
    })
}

// 下载
const download = () => {
    // console.log(menuItem)
    window.location.href = "/api/" + funcType.value + "/download?path=" + encodeURIComponent(menuItem.value.path)
}

// 转化字节单位
const formatByte = (b) => {
    var val = parseInt(b)
    if (isNaN(val)) return "";
    var list = ["B", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];
    var temp = Math.floor(Math.log(val) / Math.log(2));
    if (temp < 1) temp = 0;
    var num = Math.floor(temp / 10);
    val = val / Math.pow(2, 10 * num);
    if (val.toString().length > val.toFixed(2).toString().length)
        val = val.toFixed(2);
    return val + " " + list[num];
}

// 右击事件
const getMenuItem = (val) => {
    menuItem.value = val
    // console.log(val)
    // menuFlag.value = false
}

// 删除
const remove = () => {
    let vueList = [
        h('span', null, '确认是否删除 '),
        h('i', { style: 'color: red' }, menuItem.value.name),
        h('span', null, ' ?'),
    ]
    if (menuItem.value.type == "dir") {
        vueList.push(h('div', null, '该操作将删除该目录和该目录中所有文件。'))
    }
    ElMessageBox.confirm(
        h('p', null, vueList),
        '确认信息',
        {
            confirmButtonText: '删除',
            cancelButtonText: '取消',
            confirmButtonClass: 'el-button--danger',
            type: 'warning',
        }
    ).then(() => {
        loading.value = true
        axios.delete("/api/" + funcType.value + "/remove?path=" + encodeURIComponent(menuItem.value.path)).then((resp) => {
            ElMessage.success({ message: "删除成功", duration: 2000, showClose: true })
            init()
            loading.value = false
        }).catch((err) => {
            ElMessage.error({ message: err.response.data, duration: 2000, showClose: true })
            loading.value = false
        })
    }).catch(() => { })
}

// 获取属性
const getAttribute = () => {
    loading.value = true
    axios.get('/api/' + funcType.value + '/attr?path=' + encodeURIComponent(menuItem.value.path)).then((resp) => {
        loading.value = false
        attributeFrom.value = resp.data
        attributeFlag.value = true
        // console.table(resp.data)
    }).catch((err) => {
        loading.value = false
        ElMessage.error({ message: err.response.data, duration: 2000, showClose: true })
    })
}

// 重命名
const rename = () => {
    ElMessageBox.prompt('请输入文件/文件夹名称', '重命名', {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        inputErrorMessage: '请输入名称',
        inputPattern: '',
        inputValue: menuItem.value.name,
    }).then(({ value }) => {
        let form = {
            from: menuItem.value.path,
            to: menuItem.value.path.slice(0, menuItem.value.path.length - menuItem.value.name.length) + "/" + value
        }
        loading.value = true
        axios.post("/api/" + funcType.value + "/move", form).then((resp) => {
            loading.value = false
            ElMessage.success({ message: "重命名成功", duration: 2000, showClose: true })
            init()
        }).catch((err) => {
            loading.value = false
            ElMessage.error({ message: err.response.data, duration: 2000, showClose: true })
        })
    }).catch(() => { })
}


// 取消页面本身拖拽事件
document.addEventListener('drop', function (e) {
    e.preventDefault()
}, false)
document.addEventListener('dragover', function (e) {
    e.preventDefault()
}, false)

// 拖拽
const drop = (val) => {
    if (dragItem.value != -1) {
        if (val.target.id == "" || list.value[val.target.id].type != "dir" || list.value[val.target.id].name == dragItem.value.name) {
            // console.log(dragItem.value);
            dragItem.value = -1
            console.log("非法操作")
            return
        }
        moveOrCopyUrl.value.from = dragItem.value.path
        moveOrCopyUrl.value.to = list.value[val.target.id].path + "/" + dragItem.value.name
        axios.post("/api/" + funcType.value + "/move", moveOrCopyUrl.value).then((resp) => {
            ElMessage.success({ message: "移动成功", duration: 2000, showClose: true })
            init()
        }).catch((err) => {
            ElMessage.error({ message: err.response.data, duration: 1000, showClose: true })
        })
        dragItem.value = -1
        return
        // console.log(moveOrCopyUrl.value);
        // console.log(list.value[dragItem.value])
        // console.log(list.value[val.target.id])
    }

    val.preventDefault()
    // console.log(val.dataTransfer.files)
    if (val.dataTransfer.files.length == 0) {
        return
    }
    let formData = new FormData()

    if (val.target.id != "" && list.value[val.target.id].type == "dir") {
        formData.append("base", list.value[val.target.id].path)
    }
    else {
        formData.append("base", path.value)
    }

    for (let index = 0; index < val.dataTransfer.files.length; index++) {
        formData.append("files", val.dataTransfer.files[index])
    }

    uploadFiles(formData)

}


const uploadFiles = (form) => {

    let Eloading = ElLoading.service({ text: '文件上传中请稍后...' })
    axios.post("/api/" + funcType.value + "/upload", form, {
        onUploadProgress: function (progressEvent) { // 处理上传进度事件
            // console.log(progressEvent)
            Eloading.setText("文件上传中请稍后" + Math.floor(progressEvent.progress * 100) + "%...")
        }
    }).then((resp) => {
        ElMessage.success({ message: "上传成功", duration: 2000, showClose: true })
        Eloading.close()
        init()
    }).catch((err) => {
        Eloading.close()
        init()
        if (!err.response) {
            console.log("上传失败：", err)
            ElMessage.error({ message: "文件类型错误，上传失败！", duration: 2000, showClose: true })
        } else {
            ElMessage.error({ message: err.response.data, duration: 2000, showClose: true })
        }
    })
    // }
}


const dragItem = ref(-1)
// 拖拽
const drag = (val) => {
    dragItem.value = val
}
const over = (val) => {
    if (val.type !== 'dir') {
        return
    }
    val.hover = true
    // console.log("test",val)
}

const leave = (val) => {
    val.hover = false
}

const folderName = ref()
// 新建文件夹
const newFileFolder = () => {
    // loading.value = true
    let filename = "新建文件夹"
    let temp = filename
    let i = 1
    while (true) {
        let flag = false
        list.value.forEach(e => {
            if (e.name === temp) {
                flag = true
                temp = filename + " (" + i + ")"
                i++
            }
        })
        if (!flag) {
            break
        }
    }

    list.value.push({
        name: temp,
        type: "dir"
    })

    renameFlag.value = temp
    folderName.value = temp

}

// 搜索文件/文件夹
const searchForFile = () => {
    // console.log(searchItem.value);
    if (searchItem.value == "") {
        getList(path.value)
    }
    else {
        let info = {}
        let url = "/api/" + funcType.value + "/search?"
        if (path.value !== "") {
            info.base = encodeURIComponent(path.value)
            url += "base=" + info.base
        }
        if (searchItem.value !== "") {
            info.keyword = encodeURIComponent(searchItem.value)
            url += "&keyword=" + info.keyword
        }
        axios.get(url).then((resp) => {
            // console.table(resp.data)
            list.value = resp.data
            // menuFlag.value = false
            // if (list.value.length == 0) {
            //     menuFlag.value = true
            // }
        }).catch((err) => {
            ElMessage.error({ message: err.response.data, duration: 2000, showClose: true })
        })
    }

}

// 右键上传文件
const upload = (rawFile) => {
    let formData = new FormData()
    // let base = encodeURIComponent(path.value)
    formData.append("base", path.value)
    formData.append("files", rawFile.raw)
    // loading.value = true
    // loadingText.value = "文件上传中请稍后..."
    uploadFiles(formData)

    return true
}

// 树形结构数据
const treeData = ref([])

const defaultProps = {
    children: 'children',
    label: 'name',
}


// 懒加载
const loadNode = (node, resolve) => {
    if (node.data?.constructor != Object) {
        return resolve(treeData.value)
    }
    setTimeout(() => {
        let base = encodeURIComponent(node.data.path)
        axios.get("/api/" + funcType.value + "/list?base=" + base + "&type=dir").then((resp) => {
            resolve(resp.data)
        }).catch((err) => {
            ElMessage.error({ message: err.response.data, duration: 1000, showClose: true })
        })
    }, 500)

}


// 获取树形根目录数据
const getTree = () => {
    if (funcType.value == 'pubArea') {
        treeData.value = [{
            name: "公共知识区",
            path: "",
            type: "dir",
        }]
    } else if (funcType.value == 'project/testArea') {
        treeData.value = [{
            name: "测试管理区",
            path: "",
            type: "dir",
        }]
    }

    // axios.get("/api/" + funcType.value + "/list?type=dir").then((resp) => {
    //     treeData.value = resp.data
    //     console.log(treeData.value);
    // }).catch((err) => {
    //     ElMessage.error({ message: err.response.data, duration: 1000, showClose: true })
    // })
}


const moveOrCopyUrl = ref({
    from: "",
    to: ""
})
const moveOrCopyName = ref("")

const getToPath = (data, me, children) => {
    // console.log(data, me, children);
    if (data.type === "dir") {
        moveOrCopyUrl.value.to = data.path
    }
    // console.log(moveOrCopyUrl.value);
    // console.log(moveOrCopyName.value);
}


// 移动或复制
const moveOrCopy = () => {
    moveFlag.value = true
    // console.log("menuItem", menuItem.value);
    moveOrCopyUrl.value.from = menuItem.value.path
    moveOrCopyName.value = menuItem.value.name
    getTree()
}

// 复制
const fileCopy = () => {
    moveOrCopyUrl.value.to += "/" + moveOrCopyName.value
    axios.post("/api/" + funcType.value + "/copy", moveOrCopyUrl.value).then((resp) => {
        ElMessage.success({ message: "复制成功", duration: 2000, showClose: true })
        moveFlag.value = false
        init()
    }).catch((err) => {
        ElMessage.error({ message: err.response.data, duration: 1000, showClose: true })
    })
}

// 移动
const fileMove = () => {
    moveOrCopyUrl.value.to += "/" + moveOrCopyName.value
    axios.post("/api/" + funcType.value + "/move", moveOrCopyUrl.value).then((resp) => {
        ElMessage.success({ message: "移动成功", duration: 2000, showClose: true })
        moveFlag.value = false
        init()
    }).catch((err) => {
        ElMessage.error({ message: err.response.data, duration: 1000, showClose: true })
    })
}

// 新建重命名控制
const renameFlag = ref("")
// 文件名
const fileName = ref("")

const refInput = ref([])
const fileRename = (name, type, e) => {
    if (type == eventType.blur) {
        ElMessageBox.confirm(
            '是否使用 ' + name + ' 作为新建的文件夹名称',
            '提示',
            {
                confirmButtonText: '确认',
                cancelButtonText: '取消',
                type: 'warning',
            }
        )
            .then(() => {
                let base = path.value + "/" + name
                axios.post("/api/" + funcType.value + "/mkdir", JSON.stringify(base)).then((resp) => {
                    init()
                    renameFlag.value = ""
                    ElMessage.success({ message: "创建成功", duration: 2000, showClose: true })
                    loading.value = false
                }).catch((err) => {
                    loading.value = false
                    ElMessage.error({ message: err.response.data, duration: 2000, showClose: true })
                })
                e.target.blur()
            })
            .catch(() => {
                e.target.focus();
            })
    }
    else if (type == eventType.enter) {
        e.target.blur()
    }
}

// 监听浏览器返回前进按钮
const popstate = () => {
    init()
}

window.addEventListener('popstate', popstate, false);

onUnmounted(() => {
    window.removeEventListener('popstate', popstate, false);
})

</script>

<style scoped>
.item-topic {
    display: flex;
    padding: 30px 0 10px calc(10vh);
    width: 90%;
}

.item {
    display: flex;
    padding: 5px 0 10px calc(10vh);
    width: 90%;
}

.icon {
    display: flex;
    width: 800px;
}

.name {
    text-overflow: ellipsis;
    overflow: hidden;
    white-space: nowrap;
}

.updateTime {
    padding-left: calc(3vh);
    width: 500px;
    text-align: start;
}

.size {
    /* margin-left: auto; */
    padding-left: calc(3vh);
    text-align: start;
}

.divForMenu {
    height: calc(86vh);
}


.dragCss {
    background-color: rgba(122, 122, 122, 0.2);
}

.el-table:deep(.warning-row) {
    --el-table-tr-bg-color: #a0cfff;
}

.upload {
    padding: 0px;
    line-height: 1;
    color: #333;
    cursor: pointer;
}

.upload-item {
    text-align: center;
    padding: 5px 0;
    width: 56px;
}
</style>
