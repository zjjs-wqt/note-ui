<template>
    <div v-loading="loading" element-loading-background="rgba(255, 255, 255, 0.8)" element-loading-text="数据加载中...">
        <div class="md-body">
            <!-- 显示/隐藏大纲 -->
            <el-button style="margin:16px 5px 0 5px;height:32px;font-size:15px" @click="changeOutline" link
                v-if="editState == false && noteInfo.isDelete == 0 && outlineFlag" :icon="View" title="隐藏大纲"></el-button>
            <el-button style="margin:16px 5px 0 5px;height:32px;font-size:15px" @click="changeOutline" link
                v-else-if="editState == false && noteInfo.isDelete == 0 && !outlineFlag" :icon="Hide"
                title="显示大纲"></el-button>
            <!-- 显示备注 还是 名称 -->
            <h2 v-if="editState == false && noteInfo.remark == '' && remarkStatus == false" class="hide"
                :title="noteInfo.title">{{ noteInfo.title }}</h2>
            <h2 v-else-if="editState == false && noteInfo.remark !== '' && remarkStatus == false" class="hide"
                :title="noteInfo.remark"> {{ noteInfo.remark }}
            </h2>
            <!-- 修改备注 或名称 -->
            <el-input v-model="noteInfo.title" class="md-input"
                v-else-if="editState == true && noteInfo.role == 0"></el-input>
            <div v-else-if="(editState == true && noteInfo.role !== 0) || remarkStatus == true" style="display: flex;">
                <el-input v-model="noteInfo.remark" class="md-input"></el-input>
                <div class="md-update-time" style="color:#909399;">{{ noteInfo.title }}</div>
            </div>
            <!-- 笔记拥有者名称 -->
            <h4 v-if="editState == false" style="padding-left: 15px;color:#909399;">{{ noteInfo.userName }}</h4>
            <!-- 笔记更新时间 -->
            <div class="md-update-time" v-if="id !== 0">
                更新时间：{{ noteInfo.updatedAt }}
            </div>
            <!-- 导出笔记 -->
            <el-button type="success" style="margin-top: 16px;margin-left: 5px;" @click="exportDoc" :disabled="exportStatus"
                v-if="(noteInfo.role == 0 || noteInfo.role == 2) && editState == false && noteInfo.isDelete == 0">导出</el-button>
            <!-- 分享笔记 -->
            <el-button type="primary" style="margin-top: 16px;margin-left: 5px;" @click="dialogVisible = true"
                v-if="noteInfo.role == 0 && editState == false && noteInfo.isDelete == 0">分享</el-button>
            <!-- 已分享 -->
            <el-button type="warning" style="margin-top: 16px;margin-left: 5px;"
                @click="sharedVisible = true; getShareList()"
                v-if="noteInfo.role == 0 && editState == false && noteInfo.isDelete == 0">已分享</el-button>
            <!-- 文件夹 -->
            <el-button type="info" style="margin-top: 16px;margin-left: 5px;" @click="groupVisible = true"
                v-if="editState == false && noteInfo.isDelete == 0">保存至</el-button>
            <!-- 编辑状态 - 未编辑 -->
            <div class="md-btn-group" v-if="editState == false">
                <div class="md-btn">
                    <el-button type="primary" style="margin-top:5px;" @click="changeToEdit()"
                        v-if="(noteInfo.role == 0 || noteInfo.role == 2) && noteInfo.isDelete == 0">编辑</el-button>
                    <el-button type="danger" style="margin-top:5px;" @click="toDelete"
                        v-if="noteInfo.role == 0 && noteInfo.isDelete == 0">刪除</el-button>
                    <el-button type="warning" style="margin-top:5px;" @click="toRestore"
                        v-if="noteInfo.role == 0 && noteInfo.isDelete == 1">恢复</el-button>

                </div>
                <div class="md-btn">
                    <el-button type="primary" style="margin-top:5px;"
                        @click="remarkStatus = true; remarkBackup = noteInfo.remark"
                        v-if="noteInfo.role == 1 && remarkStatus == false && noteInfo.isDelete == 0">修改备注</el-button>
                    <el-button v-if="remarkStatus == true" style="margin-top:5px;" :disabled="btnStatus"
                        @click="cancel">取消</el-button>
                    <el-button @click="save" type="warning" style="margin-top:5px;" :disabled="btnStatus"
                        v-if="remarkStatus == true">保存</el-button>
                </div>
            </div>
            <!-- 编辑状态 - 已编辑 -->
            <div class="md-btn-group" v-else>
                <div class="md-btn">
                    <el-button :disabled="btnStatus" @click="cancel">取消</el-button>
                    <el-button @click="save" type="warning" :disabled="btnStatus">保存</el-button>
                </div>
            </div>
        </div>

        <Vditor :content="content" ref="vditorRef" @init="initVditor" @loading="loading = false" :id="id"
            :codeType="codeType" @update:ctrlSave="timeSave" @update:content="saveContent" :height="'calc(100vh - 160px)'">
        </Vditor>


        <el-dialog v-model="dialogVisible" :close-on-click-modal="false" :show-close="false" title="分享" width="30%">
            <el-form :model="form" label-width="120px">
                <el-form-item label="类型" prop="type" style="width: 80%;">
                    <el-select v-model="form.type" placeholder="请选择类型" @change="form.userId = '', form.groupId = ''">
                        <el-option v-for="item in typeOptions" :key="item.name" :label="item.name" :value="item.value" />
                    </el-select>
                </el-form-item>
                <el-form-item label="权限" prop="role" style="width: 80%;" v-if="form.type == 'user'">
                    <el-select v-model="form.role" placeholder="">
                        <el-option v-for="item in roleOptions" :key="item.type" :label="item.type" :value="item.id" />
                    </el-select>
                </el-form-item>
                <el-form-item label="用户" prop="userId" style="width: 80%;" v-if="form.type == 'user'">
                    <el-select v-model="form.userId" :loading="selectLoading" filterable remote :reserve-keyword="false"
                        default-first-option remote-show-suffix :remote-method="memRemoteMethod" placeholder=" "
                        value-key="name">
                        <div v-loading="loading" element-loading-background="rgba(255, 255, 255, 0.8)"
                            element-loading-text="数据加载中...">
                            <el-option style="height:45px;" v-for="item in persion" :key="item.id" :value="item.id"
                                :label="item.name">
                                <div style="height:45px;display:flex;">
                                    <div style="margin-top:5px;">{{ item.name }}</div>
                                </div>
                            </el-option>
                        </div>
                    </el-select>
                </el-form-item>

                <el-form-item label="用户组" prop="groupId" style="width: 80%;" v-if="form.type == 'group'">
                    <el-select v-model="form.groupId" :loading="selectLoading" filterable remote :reserve-keyword="false"
                        default-first-option remote-show-suffix :remote-method="memRemoteMethodForGroup" placeholder=" "
                        value-key="name">
                        <div v-loading="loading" element-loading-background="rgba(255, 255, 255, 0.8)"
                            element-loading-text="数据加载中...">
                            <el-option style="height:45px;" v-for="item in group" :key="item.belong" :value="item.belong"
                                :label="item.name">
                                <div style="height:45px;display:flex;">
                                    <div style="margin-top:5px;">{{ item.name }}</div>
                                </div>
                            </el-option>
                        </div>
                    </el-select>
                </el-form-item>
            </el-form>
            <template #footer>
                <span class="dialog-footer">
                    <el-button
                        @click="dialogVisible = false, form.type = 'user', form.userId = '', form.groupId = '', form.role = 1">
                        取消
                    </el-button>
                    <el-button type="primary" @click="share">提交</el-button>
                </span>
            </template>
        </el-dialog>

        <el-dialog v-model="groupVisible" v-if="groupVisible" :close-on-click-modal="false" :show-close="false" title="保存至"
            width="30%">

            <el-form label-width="120px">
                <el-form-item label="当前文件夹" style="width: 80%;">
                    <div>
                        根文件夹
                    </div>/
                    <div>
                        {{ noteInfo.folderName }}
                    </div>
                </el-form-item>
                <el-form-item label="文件夹" prop="folder" style="width: 80%;">
                    <el-cascader v-model="changeGroupId" :props="folderProps" clearable filterable style="width:320px">
                        <template #default="{ data: { label } }">
                            <div class="hide" style="width:150px" :title="label">
                                {{ label }}
                            </div>
                        </template>
                    </el-cascader>
                </el-form-item>
            </el-form>
            <template #footer>
                <span class="dialog-footer">
                    <el-button @click="groupVisible = false; changeGroupId = null">
                        取消
                    </el-button>
                    <el-button type="primary" @click="changeGroup">提交</el-button>
                </span>
            </template>
        </el-dialog>

        <el-dialog v-model="sharedVisible" :close-on-click-modal="false" :show-close="false" title="已分享" width="30%">
            <el-tabs v-model="activeName" class="demo-tabs">
                <el-tab-pane label="用户" name="user">
                    <el-table :data="userList" style="width: 100%">
                        <el-table-column prop="name" label="名称"></el-table-column>
                        <el-table-column prop="role" label="权限">
                            <template #default="scope">
                                <div>{{ roleList[scope.row.role] }}</div>
                            </template>
                        </el-table-column>
                        <el-table-column prop="id" label="操作">
                            <template #default="scope">
                                <el-button type="danger" @click="unshare(scope, 'user')">取消分享</el-button>
                            </template>
                        </el-table-column>
                    </el-table>
                </el-tab-pane>
                <el-tab-pane label="用户组" name="group">
                    <el-table :data="groupList" style="width: 100%">
                        <el-table-column prop="name" label="名称"></el-table-column>
                        <el-table-column prop="id" label="操作">
                            <template #default="scope">
                                <el-button type="danger" @click="unshare(scope, 'group')">取消分享</el-button>
                            </template>
                        </el-table-column>
                    </el-table>
                </el-tab-pane>

            </el-tabs>
            <template #footer>
                <span class="dialog-footer">
                    <el-button @click="sharedVisible = false; activeName = 'user'">
                        确定
                    </el-button>

                </span>
            </template>
        </el-dialog>
    </div>
</template>

<script setup>
import { View, Hide } from '@element-plus/icons-vue'
import axios from 'axios';
import { ElMessage, ElMessageBox } from 'element-plus';
import { onUnmounted, ref, h, watch, onMounted } from 'vue';
import { useRouter, useRoute, onBeforeRouteUpdate } from 'vue-router'
import { useStore } from 'vuex';

import Vditor from '../../../components/vditor/Vditor.vue';
// 显示/隐藏 大纲
const outlineFlag = ref(true)
// 编辑器
const vditorRef = ref()
// 笔记信息
const noteInfo = ref({})
// 存储信息
const store = useStore()
// 笔记内容
const content = ref('')
// 加载
const loading = ref(false)
// 弹窗加载
const selectLoading = ref(false)
// 导出笔记按钮
const exportStatus = ref(false)
// 备注按钮
const remarkStatus = ref(false)
// 分享弹框
const dialogVisible = ref(false)
// 已分享弹框
const sharedVisible = ref(false)
// 保存至文件夹弹窗
const groupVisible = ref(false)
// 已分享 划窗
const activeName = ref('user')
// 文件夹列表
const folderList = ref()
// 用户信息
const user = ref({})
user.value = store.getters.getUserInfo
// 文件id
const props = defineProps({
    id: Number
})
// 文件ID
const id = ref(0)
// 备注-备份
const remarkBackup = ref('')
// 定时保存内容
const contentTime = ref()
// 预览模式/编辑模式
const perviewFlag = ref(false)
// 定时保存
const saveContent = (val) => {
    contentTime.value = val
}
// 保存文件夹id
const folderId = ref(null)
// 权限描述
const roleList = ["笔记拥有者", "可查看", "可编辑"]
// 分享
const form = ref({
    type: "user",
    userId: "",
    groupId: "",
    role: 1,
})
const roleOptions = [
    {
        id: 1,
        type: "可查看"
    },
    {
        id: 2,
        type: "可编辑"
    }
]
const typeOptions = [
    {
        name: "用户",
        value: "user"
    }
    , {
        name: "用户组",
        value: "group"
    }
]

const persion = ref([])// 成员名称下拉框
let last = "";
let current = "";

// 获取用户列表以及该用户的用户组信息
const getList = () => {
    selectLoading.value = true
    // 发起请求
    axios.get("/api/user/nameList").then((resp) => {
        // 绑定数据
        persion.value = resp.data
    }).then(() => {
        axios.get("/api/userGroup/list").then((resp) => {
            //  绑定数据
            group.value = resp.data
        })
    }).finally(() => {
        selectLoading.value = false;
    })
}

// 查询用户
const memRemoteMethod = (keyword) => {
    current = keyword;
    // 判断是否已经再有程序运行
    if (last !== "") {
        return
    }
    last = keyword;
    selectLoading.value = true
    // 发起请求
    axios.get("/api/user/nameList?keyword=" + keyword).then((resp) => {
        // 绑定数据
        persion.value = resp.data
    }).then(() => {
        // 请求结束后判断最初的查询参数与现在的查询参数是否一致。
        if (last === current) {
            return
        }
        let ky = current;
        last = "";
        current = "";
        memRemoteMethod(ky);
    }).finally(() => {
        selectLoading.value = false;
        last = "";
        current = "";
    })
}

// 查询用户组
const group = ref([])
const memRemoteMethodForGroup = (keyword) => {

    current = keyword;
    // 判断是否已经再有程序运行
    if (last !== "") {
        return
    }
    last = keyword;
    selectLoading.value = true
    // 发起请求 /api/userGroup/list?role=0&keyword=
    axios.get("/api/userGroup/list?keyword=" + keyword).then((resp) => {
        //  绑定数据
        group.value = resp.data
    }).then(() => {
        //  请求结束后判断最初的查询参数与现在的查询参数是否一致。
        if (last === current) {
            return
        }
        let ky = current;
        last = "";
        current = "";
        memRemoteMethod(ky);
    }).finally(() => {
        selectLoading.value = false;
        last = "";
        current = "";
    })
}



// 分享
const share = () => {
    let shareForm = {}
    if (form.value.type == "user") {
        shareForm.id = form.value.userId
    } else if (form.value.type == "group") {
        shareForm.id = form.value.groupId
    }
    shareForm.noteId = id.value
    shareForm.shareType = form.value.type
    shareForm.role = form.value.role
    axios.post("/api/noteMember/share", shareForm).then(() => {
        dialogVisible.value = false
        form.value.type = 'user'
        form.value.userId = ''
        form.value.groupId = ''
        form.value.role = 1
        ElMessage.success({ message: "分享成功", duration: 1000, showClose: true })
    }).catch((err) => {
        ElMessage.error({ message: err.response.data, duration: 1000, showClose: true })
    })
}

// 取消分享
const unshare = (info, t) => {
    ElMessageBox.confirm(
        h('p', null, [
            h('span', null, '确认取消对'),
            h('i', { style: 'color: red' }, info.row.name),
            h('span', null, '的分享'),
        ]),
        '取消分享',
        {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            confirmButtonClass: 'el-button--danger',
            type: 'warning',
        })
        .then(() => {
            let usrCancelForm = {
                id: info.row.id,
                noteId: id.value,
                shareType: t
            }
            axios.post("/api/noteMember/cancel", usrCancelForm).then((resp) => {
                ElMessage.success({ message: "取消分享成功", duration: 2000, showClose: true })
                getShareList()
            }).catch((err) => {
                ElMessage.error({ message: err.response.data, duration: 2000, showClose: true })
            })
        }).catch(() => { })

}

// 显示、隐藏大纲
const changeOutline = () => {
    if (outlineFlag.value) {
        vditorRef.value.hideToc()
    } else {
        vditorRef.value.showToc()
    }
    outlineFlag.value = !outlineFlag.value
}


const userList = ref([])
const groupList = ref([])

// 获取分享信息
const getShareList = () => {
    if (id.value === 0) {
        return
    }
    axios.get("/api/noteMember/allUser?id=" + id.value).then(({ data }) => {
        userList.value = data
    }).catch((err) => {
        ElMessage.error({ message: err.response.data, duration: 1000, showClose: true })
    })
    axios.get("/api/noteMember/allGroup?id=" + id.value).then(({ data }) => {
        groupList.value = data
    }).catch((err) => {
        ElMessage.error({ message: err.response.data, duration: 1000, showClose: true })
    })
}


// 编辑模式
const editState = ref(false)
// markdown状态  1 - 编辑模式 2 - 预览模式 3 - 混合模式 4 - 代码模式
const pattern = ref(0)
// 文档类型
const codeType = ref("note")
// 保存、删除按钮是否可用
const btnStatus = ref(false)

const emit = defineEmits(["update:change", "update:editing", "delete", "errId"])

// 初始化
const init = () => {
    if (id.value === 0) {
        noteInfo.value = {}
        return
    }
    getList()
    // 获取文档相关信息
    axios.get("/api/note/info?id=" + id.value).then((resp) => {
        noteInfo.value = resp.data
        folderId.value = null
        if (noteInfo.value.folderId !== 0) {
            folderId.value = noteInfo.value.folderId
        }
        getContent()
    }).catch((err) => {
        ElMessage.error({ message: err.response.data, duration: 1000, showClose: true })
    })

}


// 获取笔记信息
const getNoteInfo = () => {
    if (id.value == 0){
        noteInfo.value = {}
        return 
    }

    axios.get("/api/note/info?id=" + id.value).then((resp) => {
        noteInfo.value = resp.data
        if (noteInfo.value.folderId !== 0) {
            folderId.value = noteInfo.value.folderId
        }
    }).catch((err) => {
        ElMessage.error({ message: err.response.data, duration: 1000, showClose: true })
    })
}





// 获取文档内容
const getContent = () => {

    loading.value = true
    axios.get("/api/note/content?id=" + noteInfo.value.id).then((resp) => {
        content.value = resp.data
        contentTime.value = resp.data
        if (perviewFlag.value === true) {
            perviewFlag.value = false
            vditorRef.value.setValue(content.value)
            vditorRef.value.modePreview()
        } else {
            // 先解除预览模式，将值注入后再换为预览模式
            vditorRef.value.toPreview()
            vditorRef.value.setValue(content.value)
            vditorRef.value.modePreview()
        }
    }).catch((err) => {
        ElMessage.error({ message: err.response.data, duration: 1000, showClose: true })
    })
}

// 初始化编辑器
const initVditor = () => {
    vditorRef.value.setValue(content.value)
    vditorRef.value.modePreview()
}

onMounted(() => {
    id.value = props.id
    init()
    window.addEventListener('beforeunload', beforeunloadFn)
})


// 离开页面提示
const beforeunloadFn = (e) => {
    e = e || window.event;
    if (editState.value === true) {
        save()
        e.preventDefault()
        if (e) {
            e.returnValue = '离开当前页面，会关闭你已打开的终端窗口和文件窗口，请问你是否重新加载';
        }

        return '离开当前页面，会关闭你已打开的终端窗口和文件窗口，请问你是否重新加载';
    }
}

// 获取编辑状态
const changeToEdit = (createId) => {

    if (createId != null) {
        id.value = createId
        init()
        window.addEventListener('beforeunload', beforeunloadFn)
    }

    // 先获取最新文档
    loading.value = true
    axios.get("/api/note/content?id=" + id.value).then((resp) => {
        content.value = resp.data
        contentTime.value = resp.data
        if (perviewFlag.value === true) {
            perviewFlag.value = false
            vditorRef.value.setValue(content.value)
            vditorRef.value.modePreview()
        } else {
            // 先解除预览模式，将值注入后再换为预览模式
            vditorRef.value.toPreview()
            vditorRef.value.setValue(content.value)
            vditorRef.value.modePreview()
        }
        // 锁表单
        var lockDto = {}
        lockDto.userId = Number(store.getters.getUserInfo.id)
        lockDto.id = String(id.value)

        // 获取锁信息
        axios.post("/api/note/lock", lockDto).then((resp) => {
            editState.value = true
            // 进入编辑模式
            vditorRef.value.modeEdit()
            emit("update:editing", true)
        }).catch((err) => {
            ElMessageBox.alert(err.response.data, '提示', {
                confirmButtonText: '确定',
                type: 'error',
            })
        })
    }).catch((err) => {
        ElMessage.error({ message: err.response.data, duration: 1000, showClose: true })
    })

}

// 检查文档是否跳转
watch(props, (newVal, oldVal) => {
    if (newVal.id !== id.value) {
        if (editState.value == true) {
            // // 若处于编辑状态下，先切换回预览模式
            // vditorRef.value.toPreview()

            perviewFlag.value = true
            let formData = new FormData()
            formData.append("id", id.value)
            formData.append("content", vditorRef.value.getValue())
            formData.append("autoSave", "false")
            formData.append("title", noteInfo.value.title)
            formData.append("remark", noteInfo.value.remark)
            axios.post("/api/note/content", formData).then((resp) => {
                ElMessage.success({ message: "修改成功", duration: 1000, showClose: true })
                id.value = newVal.id
                editState.value = false
                remarkStatus.value = false
                init()
                emit("update:change", true)
                emit("update:editing", false)
            }).catch((err) => {
                remarkStatus.value = false
                emit("errId", id.value)
                ElMessage.error({ message: err.response.data, duration: 1000, showClose: true })
            })
        }
        else {
            id.value = newVal.id
            editState.value = false
            remarkStatus.value = false
            init()
            emit("update:editing", false)

        }
    }

})


// 删除笔记
const toDelete = () => {
    ElMessageBox.confirm(
        h('p', null, [
            h('span', null, '确认删除'),
            h('i', { style: 'color: red' }, noteInfo.value.title),
            h('span', null, '笔记吗？删除后的文件在一定时间内可在回收站内找到。'),
        ]),
        '删除',
        {
            confirmButtonText: '删除',
            cancelButtonText: '取消',
            confirmButtonClass: 'el-button--danger',
            type: 'warning',
        })
        .then(() => {
            loading.value = true
            axios.delete("/api/note/delete?id=" + noteInfo.value.id).then((resp) => {
                ElMessage.success({ message: "删除成功", duration: 2000, showClose: true })
                // emit("update:change", true)
                store.commit("saveDocId", 0)
                emit("delete")
                init()
                loading.value = false
            }).catch((err) => {
                ElMessage.error({ message: err.response.data, duration: 2000, showClose: true })
                loading.value = false
            })
        }).catch(() => { })

}

// 恢复笔记
const toRestore = () => {
    ElMessageBox.confirm(
        h('p', null, [
            h('span', null, '确认恢复'),
            h('i', { style: 'color: red' }, noteInfo.value.title),
            h('span', null, '笔记吗？'),
        ]),
        '恢复',
        {
            confirmButtonText: '恢复',
            cancelButtonText: '取消',

            type: 'warning',
        })
        .then(() => {
            loading.value = true
            axios.get("/api/note/restore?id=" + noteInfo.value.id).then((resp) => {
                ElMessage.success({ message: "恢复成功", duration: 2000, showClose: true })
                emit("update:change", true)
                init()
                loading.value = false
            }).catch((err) => {
                ElMessage.error({ message: err.response.data, duration: 2000, showClose: true })
                loading.value = false
            })
        }).catch(() => { })

}

// 导出文档
const exportDoc = () => {
    exportStatus.value = true
    window.location.href = "/api/note/export?id=" + noteInfo.value.id
    setTimeout(() => {
        exportStatus.value = false
    }, 3 * 1000);
}

// 保存笔记
const save = () => {
    let formData = new FormData()
    formData.append("id", id.value)
    formData.append("content", vditorRef.value.getValue())
    formData.append("autoSave", "false")
    formData.append("title", noteInfo.value.title)
    formData.append("remark", noteInfo.value.remark)
    btnStatus.value = true
    axios.post("/api/note/content", formData).then((resp) => {
        ElMessage.success({ message: "修改成功", duration: 2000, showClose: true })
        unlock()
        btnStatus.value = false
        // 进入预览模式
        vditorRef.value.modePreview()
        remarkStatus.value = false
        emit("update:change", true)

        axios.get("/api/note/info?id=" + id.value).then((resp) => {
            noteInfo.value = resp.data
            emit("update:editing", false)
        }).catch((err) => {
            ElMessage.error({ message: err.response.data, duration: 1000, showClose: true })
        })
    }).catch((err) => {
        btnStatus.value = false
        ElMessage.error({ message: err.response.data, duration: 1000, showClose: true })
    })
}

// 解锁
const unlock = () => {
    editState.value = false
}

// 定时任务 -- 5分钟一次自动保存
const timer = setInterval(() => {
    check()
}, 5 * 60 * 1000);


// 检查登录剩余时间
const check = () => {
    axios.get("/api/check").then((resp) => {

        // 获取当前时间戳
        var currentTimestamp = Date.now();
        // 计算时间戳差值
        var timeDifference = resp.data.exp - currentTimestamp;

        // 若token有效期 剩余时间不超过10分钟
        if (timeDifference <= 10 * 60 * 1000) {
            ElMessageBox.alert("用户TOKEN即将过期，请重新登录！", '提示', {
                confirmButtonText: '确定',
                type: 'error',
            })

            // 若处于编辑状态 
            if (editState.value == true) {
                save();
            }
        } else {
            var date = new Date(timeDifference);
            console.log(date.toISOString().substr(11, 8));
            // 若处于编辑状态 
            if (editState.value == true) {
                timeSave()
            }
        }


    }).catch((err) => {
        ElMessage.error({ message: err.response.data, duration: 1000, showClose: true })
    })
}

// 自动保存
const timeSave = () => {
    // 内容发生修改，自动修改
    if (editState.value == true) {
        setTimeout(() => {
            btnStatus.value = true
            let formData = new FormData()
            formData.append("id", id.value)
            formData.append("content", contentTime.value)
            formData.append("autoSave", "true")
            formData.append("title", noteInfo.value.title)
            formData.append("remark", noteInfo.value.remark)
            axios.post("/api/note/content", formData).then((resp) => {
                ElMessage.info({ message: "修改成功", duration: 1000, showClose: true })
                btnStatus.value = false
            }).catch((err) => {
                ElMessage.error({ message: err.response.data, duration: 1000, showClose: true })
                btnStatus.value = false
                cancel()
            })
            // editState.value = false
        }, 300)
    }
}

// 取消编辑
const cancel = () => {
    if (noteInfo.value.role == 1) {
        remarkStatus.value = false
        noteInfo.value.remark = remarkBackup.value
        return
    }

    // 锁表单
    var lockDto = {}
    lockDto.userId = Number(store.getters.getUserInfo.id)
    lockDto.id = String(id.value)

    loading.value = true
    pattern.value = 2
    editState.value = false
    // 获取锁信息
    axios.post("/api/note/cancel", lockDto).then((resp) => {
        content.value = resp.data
        vditorRef.value.setValue(content.value)
        axios.get("/api/note/info?id=" + id.value).then((resp) => {
            noteInfo.value = resp.data
            loading.value = false
            // 进入预览模式
            vditorRef.value.modePreview()
        }).catch((err) => {
            loading.value = false
            ElMessage.error({ message: err.response.data, duration: 1000, showClose: true })
        })
    }).catch((err) => {
        loading.value = false
        ElMessage.error({ message: err.response.data, duration: 1000, showClose: true })
    })
    emit("update:editing", false)


}


// 离开页面
const leaveSave = () => {
    // 内容发生修改，自动修改
    if (editState.value == true) {
        setTimeout(() => {
            btnStatus.value = true
            let formData = new FormData()
            formData.append("id", id.value)
            formData.append("content", content.value)
            formData.append("autoSave", "false")
            formData.append("title", noteInfo.value.title)
            formData.append("remark", noteInfo.value.remark)
            axios.post("/api/note/content", formData).then((resp) => {
                ElMessage.success({ message: "修改成功", duration: 1000, showClose: true })
                btnStatus.value = false
            }).catch((err) => {
                ElMessage.error({ message: err.response.data, duration: 1000, showClose: true })
                btnStatus.value = false
                cancel()
            })
            // editState.value = false
        }, 300)
    }
}

// 离开页面，自动保存
onUnmounted(() => {
    leaveSave()
    if (timer) { //如果定时器还在运行 或者直接关闭，不用判断
        clearInterval(timer); //关闭
    }
    emit("update:editing", false)
})


// 文档树展示
const folderProps = ref({
    checkStrictly: true,
    lazy: true,
    emitPath: false,
    lazyLoad(node, resolve) {
        const { level } = node
        let nodes = []
        // 若为根节点
        if (level == 0) {
            axios.get("/api/folder/list?id=0").then((resp) => {
                let item = {
                    value: 0,
                    label: "根文件夹",
                    leaf: true,
                }
                nodes.push(item)
                if (resp.data.length == 0) {
                    node.data.leaf = true
                }
                resp.data.forEach(e => {
                    let item = {
                        value: e.id,
                        label: e.name,
                        leaf: false,
                    }
                    nodes.push(item)
                })

                resolve(nodes)
            }).catch((err) => {
                ElMessage.error({ message: err.response.data, duration: 1000, showClose: true, });
            });
        } else {
            axios.get("/api/folder/list?id=" + node.data.value).then((resp) => {
                if (resp.data.length == 0) {
                    node.data.leaf = true
                }
                resp.data.forEach(e => {
                    let item = {
                        value: e.id,
                        label: e.name,
                        leaf: false,
                    }
                    nodes.push(item)
                })
                resolve(nodes)
            }).catch((err) => {
                ElMessage.error({ message: err.response.data, duration: 1000, showClose: true, });
            });
        }
    },
})

const changeGroupId = ref()

// 修改笔记分组
const changeGroup = () => {
    if (changeGroupId.value == null) {
        ElMessage.error({ message: "请选择要保存的文件夹", duration: 1000, showClose: true })
        return
    }
    axios.get("/api/note/group?id=" + id.value + "&group=" + changeGroupId.value).then((resp) => {
        changeGroupId.value = null
        getNoteInfo()
        emit("update:change", true)
        ElMessage.success({ message: "修改成功", duration: 1000, showClose: true })
    }).catch((err) => {
        ElMessage.error({ message: err.response.data, duration: 1000, showClose: true })
    }).finally(() => {
        groupVisible.value = false
    })
}


defineExpose({
    getNoteInfo,
    changeToEdit
})


</script>

<style scoped>
.md-body {
    display: flex;
    padding: 10px;
    height: 80px;
}


.md-group {
    margin-right: 50px;
}

.md-box {
    width: 700px;
    height: 700px;
    border: 1px solid var(--el-border-color);
    margin: 20px;
}

.md-btn-group {
    margin: 10px 0 10px auto;
    display: flex;
}

.md-btn {
    margin-left: auto;
    /* margin-right: 50px; */
}

.md-input {
    /* margin-top: 10px; */
    height: 50px;
    width: calc(50vh);
}

.md-update-time {
    display: flex;
    padding-left: 10px;
    padding-top: 23px;
}

.hide {
    display: block;
    max-width: 700px;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
}
</style>
