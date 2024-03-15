<template>
    <div class="doc-body" v-loading="loading" element-loading-background="rgba(255, 255, 255, 0.8)"
        element-loading-text="数据加载中...">
        <split-pane :min="150" class="doc-aside" :left-flag="menuFlag">
            <template v-slot:left>
                <el-menu class="doc-menu" :default-active="docMenuIndex">
                    <!-- 按钮 -->
                    <div style="height:130px">
                        <el-button type="primary" class="doc-btn" @click="dialogVisible = true; contextmenuType = ''"
                            :disabled="newBtnStatus">
                            <el-icon>
                                <Plus />
                            </el-icon>
                            &nbsp;新建
                        </el-button>

                        <div></div>
                        <el-button type="success" style="margin-bottom: 10px;width: 100%;"
                            @click="folderVisible = true; contextmenuType = ''" :disabled="newBtnStatus">
                            <el-icon>
                                <Plus />
                            </el-icon>
                            &nbsp;新建文件夹
                        </el-button>
                    </div>

                    <!-- 搜索文件条件 -->
                    <el-scrollbar>
                        <el-menu-item index="all" @click="searchForNotes(null, 'all')">全部</el-menu-item>
                        <el-menu-item index="myNotes" @click="searchForNotes(null, 'my')">我的笔记</el-menu-item>

                        <el-sub-menu index="userGroup">
                            <template #title><span> 用户组</span></template>
                            <el-menu-item v-for="item, index in userGroup" :index="'user-' + item.name" :key="index"
                                @click="searchForNotes(item, 'group')" class="hide" :title="item.name">
                                {{ item.name }}</el-menu-item>
                        </el-sub-menu>

                        <el-sub-menu index="folders">
                            <template #title><span>文件夹</span></template>
                            <div v-if="folderList" v-contextmenu:contextmenu>
                                <el-menu-item v-for="item, index in folderList" :title=item.name :index="'note-' + item.id"
                                    :key="index.id" @click="searchForNotes(item, 'folder')"
                                    @mousedown.right.stop="getMenuItem(item, 'folder')">
                                    <div class="hide">{{ item.name }}</div>
                                </el-menu-item>
                            </div>

                        </el-sub-menu>

                        <el-menu-item index="share" @click="searchForNotes(null, 'share')">与我分享</el-menu-item>
                        <el-menu-item index="recycleBin" @click="searchForNotes(null, 'recycleBin')">回收站</el-menu-item>
                    </el-scrollbar>

                </el-menu>
            </template>
            <template v-slot:right>
                <split-pane :min="230" class="doc-aside" :left-flag="menuFlag">
                    <template v-slot:left>


                        <el-menu class="doc-menu" :default-active="String(docId)" v-loading="noteMenuLoading"
                            element-loading-background="rgba(255, 255, 255, 0.8)" element-loading-text="加载中..."
                            v-contextmenu:contextmenu @mousedown.right.stop="contextmenuType = 'doc'">


                            <el-input placeholder="搜索" v-model="searchKeyWord" :prefix-icon="Search"
                                @keydown.enter="searchNotes()" @clear="searchNotes()" clearable>
                            </el-input>

                            <el-scrollbar height="calc(100vh - 60px)">
                                <div v-if="folderInfo !== null" style="margin:10px;display: flex" :title="folderInfo.name">

                                    <el-button link :icon="Back" v-if="folderMenu.length > 1"
                                        @click="searchForNotes(null, 'back')" style="width: 20px;">
                                    </el-button>

                                    <div style="color:#909399;max-width: 75%;margin: auto;" class="hide">
                                        {{ folderInfo.name }}
                                    </div>
                                </div>

                                <!-- 文件夹展示 -->
                                <div v-if="pagination.currentPage == 1">
                                    <div v-for="item, index in subfolderList" :key="index"
                                        @mousedown.right.stop="getMenuItem(item, 'subfolder')">
                                        <li class="el-menu-item" @click="searchForNotes(item, 'subfolder')">
                                            <el-icon>
                                                <Folder />
                                            </el-icon>
                                            <div class="hide">
                                                {{ item.name }}
                                            </div>
                                        </li>
                                    </div>
                                </div>


                                <!-- 文件展示 -->
                                <div v-for="item, index in docList" :key="index">
                                    <el-menu-item :index="String(item.id)" @click="turnTo(item.id)" v-if="item.remark == ''"
                                        :title="item.title" @mousedown.right.stop="setMenuInfo(item)">
                                        <el-icon>
                                            <Document />
                                        </el-icon>
                                        <div class="hide">
                                            {{ item.title }}
                                        </div>
                                    </el-menu-item>
                                    <el-menu-item :index="String(item.id)" @click="turnTo(item.id)"
                                        v-else-if="item.remark !== ''" :title="item.remark"
                                        @mousedown.right.stop="setMenuInfo(item)">
                                        <el-icon>
                                            <Document />
                                        </el-icon>
                                        <div class="hide">
                                            {{ item.remark }}
                                        </div>
                                    </el-menu-item>
                                </div>
                            </el-scrollbar>


                            <el-pagination class="pagiantion" :current-page="pagination.currentPage"
                                :page-size="pagination.pageSize" :page-sizes="[10]" layout="prev, pager, next"
                                :pager-count="5" :total="pagination.total" @current-change="handleCurrentChange" small
                                @size-change="handleSizeChange">
                            </el-pagination>
                        </el-menu>
                    </template>

                    <template v-slot:right>
                        <div style="display:flex;width:100%">
                            <!-- 隐藏或打开 目录 -->
                            <div class="split" @click="menuFlag = !menuFlag">
                                <el-icon>
                                    <DArrowLeft v-if="menuFlag" />
                                    <DArrowRight v-else />
                                </el-icon>
                            </div>

                            <MarkdownFile ref="markdownFile" :id="docId" @update:change="searchNotes"
                                @update:editing="toedit" @delete="deleteGet" @errId="toActive"
                                style="width: calc(100% - 20px);">
                            </MarkdownFile>
                        </div>
                    </template>
                </split-pane>

            </template>
        </split-pane>


    </div>


    <el-dialog v-model="dialogVisible" v-if="dialogVisible" :close-on-click-modal="false" :show-close="false" title="新建笔记"
        width="30%">
        <el-form ref="ruleForm" :model="form" :rules="rules" label-width="120px" v-loading="dialogLoading">

            <el-form-item label="当前文件夹"
                v-if="contextmenuType == 'doc' || contextmenuType == 'subfolder' || contextmenuType == 'folder'"
                style="width: 80%;">
                根文件夹/
                <div v-if="contextmenuType !== 'folder'">
                    <span v-for="item, index in folderMenu" :key="index">
                        {{ item.name }}/
                    </span>
                </div>
                <span v-if="contextmenuType == 'subfolder' || contextmenuType == 'folder'">
                    {{ folderName }}/
                </span>
            </el-form-item>
            <el-form-item label="名称" prop="title" style="width: 80%;">
                <el-input v-model="form.title" @keydown.enter="createNote"></el-input>
            </el-form-item>
            <el-form-item label="文件夹" prop="tags" style="width: 80%;"
                v-if="contextmenuType !== 'doc' && contextmenuType !== 'subfolder' && contextmenuType !== 'folder'">
                <el-cascader v-model="form.folderId" :props="props" clearable filterable style="width:320px">
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
                <el-button @click="dialogVisible = false; form.title = null; form.folderId = null; ruleForm.resetFields()">
                    取消
                </el-button>
                <el-button type="primary" @click="createNote">提交</el-button>
            </span>
        </template>
    </el-dialog>

    <el-dialog v-model="folderVisible" :close-on-click-modal="false" :show-close="false" title="新建文件夹" width="30%">
        <el-form ref="folderRuleForm" :model="folderForm" :rules="folderRules" label-width="120px"
            v-loading="dialogLoading">
            <el-form-item label="当前文件夹" v-if="contextmenuType == 'doc'" style="width: 80%;">
                根文件夹/
                <span v-for="item, index in folderMenu" :key="index">
                    {{ item.name }}/
                </span>
            </el-form-item>
            <el-form-item label="名称" prop="title" style="width: 80%;">
                <el-input v-model="folderForm.name" @keydown.enter="createFolder"></el-input>
            </el-form-item>
        </el-form>
        <template #footer>
            <span class="dialog-footer">
                <el-button
                    @click="folderVisible = false; folderForm.name = null; folderForm.id = 0; folderRuleForm.resetFields()">
                    取消
                </el-button>
                <el-button type="primary" @click="createFolder">提交</el-button>
            </span>
        </template>
    </el-dialog>

    <el-dialog v-model="shareVisible" :close-on-click-modal="false" :show-close="false" title="分享" width="30%">
        <el-form :model="shareForm" label-width="120px" v-loading="dialogLoading">
            <el-form-item label="类型" prop="type" style="width: 80%;">
                <el-select v-model="shareForm.type" placeholder="请选择类型"
                    @change="shareForm.userId = '', shareForm.groupId = ''">
                    <el-option v-for="item in typeOptions" :key="item.name" :label="item.name" :value="item.value" />
                </el-select>
            </el-form-item>
            <el-form-item label="权限" prop="role" style="width: 80%;" v-if="shareForm.type == 'user'">
                <el-select v-model="shareForm.role" placeholder="">
                    <el-option v-for="item in roleOptions" :key="item.type" :label="item.type" :value="item.id" />
                </el-select>
            </el-form-item>
            <el-form-item label="用户" prop="userId" style="width: 80%;" v-if="shareForm.type == 'user'">
                <el-select v-model="shareForm.userId" :loading="selectLoading" filterable remote :reserve-keyword="false"
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

            <el-form-item label="用户组" prop="groupId" style="width: 80%;" v-if="shareForm.type == 'group'">
                <el-select v-model="shareForm.groupId" :loading="selectLoading" filterable remote :reserve-keyword="false"
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
                    @click="shareVisible = false, shareForm.type = 'user', shareForm.userId = '', shareForm.groupId = '', shareForm.role = 1">
                    取消
                </el-button>
                <el-button type="primary" @click="share">提交</el-button>
            </span>
        </template>
    </el-dialog>


    <el-dialog v-model="groupVisible" v-if="groupVisible" :close-on-click-modal="false" :show-close="false" title="保存至"
        width="30%">
        <el-form label-width="120px" v-loading="dialogLoading">

            <el-form-item label="当前文件夹" style="width: 80%;">
                <div>
                    根文件夹/{{ noteInfo.folderName }}
                </div>
            </el-form-item>

            <el-form-item label="文件夹" prop="folder" style="width: 80%;" v-if="contextmenuType !== 'doc'">
                <el-cascader v-model="changeGroupId" :props="props" clearable filterable style="width:320px">
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

    <el-dialog v-model="noteinfoVisible" :close-on-click-modal="false" :show-close="false" title="信息" width="30%">
        <el-descriptions :column="1" border>
            <el-descriptions-item label="笔记名">
                {{ noteInfo.title }}
            </el-descriptions-item>
            <el-descriptions-item label="笔记备注" v-if="noteInfo.remark">
                {{ noteInfo.remark }}
            </el-descriptions-item>
            <el-descriptions-item label="笔记权限">
                <div v-if="noteInfo.role == 0">
                    笔记拥有者
                </div>
                <div v-else-if="noteInfo.role == 1">
                    可查看
                </div>
                <div v-else-if="noteInfo.role == 2">
                    可编辑
                </div>
            </el-descriptions-item>
            <el-descriptions-item label="笔记拥有者">
                {{ noteInfo.userName }}
            </el-descriptions-item>
            <el-descriptions-item label="所处文件夹">
                <div>
                    根文件夹/{{ noteInfo.folderName }}
                </div>
            </el-descriptions-item>
        </el-descriptions>
        <template #footer>
            <span class="dialog-footer">
                <el-button @click="noteinfoVisible = false;">
                    确定
                </el-button>
            </span>
        </template>
    </el-dialog>

    <el-dialog v-model="removeVisible" v-if="removeVisible" :close-on-click-modal="false" :show-close="false" title="移动"
        width="30%">
        <el-form label-width="120px" v-loading="dialogLoading">
            <el-form-item label="当前文件夹" style="width: 80%;">
                <div v-if="contextmenuType == 'subfolder'">
                    根文件夹/
                    <span v-for="item, index in folderMenu" :key="index">
                        {{ item.name }}/
                    </span>
                    <span>
                        {{ folderName }}/
                    </span>
                </div>
                <div v-if="contextmenuType == 'folder'">
                    根文件夹/
                    <span>
                        {{ folderName }}/
                    </span>
                </div>
            </el-form-item>

            <el-form-item label="文件夹" prop="folder" style="width: 80%;">
                <el-cascader v-model="removeForm.parentId" :props="props" clearable filterable style="width:320px">
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
                <el-button @click="removeVisible = false; removeForm.parentId = null; removeForm.id = 0">
                    取消
                </el-button>
                <el-button type="primary" @click="remove">提交</el-button>
            </span>
        </template>
    </el-dialog>

    <v-contextmenu ref="contextmenu" :disabled="newBtnStatus">

        <!-- 左侧栏 或 中间栏 的文件夹 -->
        <div v-if="contextmenuType == 'folder' || contextmenuType == 'subfolder'">
            <div class="hide menu-title" :title="folderName">
                {{ folderName }}
            </div>
            <v-contextmenu-item @click="form.folderId = folderId; dialogVisible = true;">创建文件</v-contextmenu-item>
            <v-contextmenu-item @click="rename()">重命名</v-contextmenu-item>
            <v-contextmenu-item @click="removeVisible = true">移动到</v-contextmenu-item>
            <v-contextmenu-item @click="deleteFolder()" style="color:red">删除文件夹</v-contextmenu-item>
        </div>

        <!-- 中间栏 空白处 -->
        <div v-else-if="contextmenuType == 'doc'">
            <div v-if="folderInfo !== null" class="hide menu-title" :title="folderInfo.name">
                {{ folderInfo.name }}
            </div>

            <v-contextmenu-item @click="createNoteMenu"
                v-if="menuType !== 'recycleBin' && menuType !== 'share' && menuType !== 'group'">创建文件</v-contextmenu-item>

            <v-contextmenu-item @click="folderVisible = true"
                v-if="menuType == 'folder' || menuType == 'subfolder'">创建文件夹</v-contextmenu-item>
        </div>

        <!-- 中间栏 文档处 -->
        <div v-else-if="contextmenuType == 'note'">
            <div v-if="menuNoteInfo.remark == ''" class="hide menu-title" :title="menuNoteInfo.title">
                {{ menuNoteInfo.title }}
            </div>
            <div v-else class="hide menu-title" :title="menuNoteInfo.remark">
                {{ menuNoteInfo.remark }}
            </div>

            <div v-if="menuType !== 'recycleBin'">
                <v-contextmenu-item v-if="menuNoteInfo.role == 0 || menuNoteInfo.role == 2"
                    @click="exportNote()">导出</v-contextmenu-item>
                <v-contextmenu-item v-if="menuNoteInfo.role == 0" @click="shareVisible = true">分享</v-contextmenu-item>
                <v-contextmenu-item @click="getNotePath();">保存至</v-contextmenu-item>
                <v-contextmenu-item @click="renameNote()">重命名</v-contextmenu-item>
                <v-contextmenu-item @click="getNoteInfo()">属性</v-contextmenu-item>
                <v-contextmenu-item v-if="menuNoteInfo.role == 0" @click="deleteNote()"
                    style="color:red">删除</v-contextmenu-item>
            </div>
            <div v-else-if="menuType == 'recycleBin'">
                <v-contextmenu-item @click="toRestore()">恢复</v-contextmenu-item>
            </div>
        </div>


    </v-contextmenu>
</template>

<script setup>
import { Search, Back } from '@element-plus/icons-vue';
import axios from 'axios';
import { ElMessage, ElMessageBox } from 'element-plus';
import { ref, reactive, watch, onMounted, h } from 'vue'
import { onBeforeRouteUpdate, useRoute } from 'vue-router';
import { useStore } from 'vuex';
import splitPane from "../../../components/markdown/SplitPane.vue"
import MarkdownFile from './MarkdownFile.vue';

// 弹框Loading
const dialogLoading = ref(false)
// 编辑器
const markdownFile = ref()
// 目录栏是否展开
const menuFlag = ref(true)
// 当前激活目录
const docMenuIndex = ref("all")
// 加载
const loading = ref(false)
// 文档列表
const docList = ref()
const store = useStore()
// 搜索：权限
const searchRole = ref(255)
// 搜索：是否删除
const searchIsDelete = ref(0)
// 搜索： 关键词
const searchKeyWord = ref('')
// 搜索：文件夹
const searchFolder = ref(0)
// 搜索：用户组
const searchGroup = ref(0)
// 文件夹列表
const folderList = ref([])
// 文件夹创建
const folderVisible = ref(false)
// 目录类型
const menuType = ref('all')
// 保存至文件夹弹窗
const groupVisible = ref(false)

// 文件夹菜单- 文件夹ID
const folderId = ref()
// 文件夹菜单 - 文件夹名称
const folderName = ref('')
// 文件夹菜单 - 父文件夹id 
const parentId = ref(0)

// 用户信息
const user = ref({})
user.value = store.getters.getUserInfo
// 用户权限
const role = ref('')
role.value = store.getters.getRole
// 右击菜单
const contentMeneFlag = ref(false)
// 笔记目录加载动画
const noteMenuLoading = ref(false)
// 用户组
const userGroup = ref([])
// 分页
const pagination = ref({
    currentPage: 1,//当前页码
    pageSize: 20,//每页显示的记录数
    total: 0, //总记录数
    userName: "",
    name: "",
    description: ""
})

// 分页：页码
const handleCurrentChange = (currentPage) => {
    //修改页码值为选中页码值
    pagination.value.currentPage = currentPage;
    //执行查询
    searchNotes();
}

// 分页： 大小
const handleSizeChange = (val) => {
    pagination.value.pageSize = val
    pagination.value.currentPage = 1
    searchNotes();
}

// 文件ID
const docId = ref(0)
docId.value = store.getters.getDocId

// 文件跳转
const turnTo = (id) => {
    docId.value = id
    store.commit("saveDocId", id)
}

// 移动
const removeVisible = ref(false)
// 移动form
const removeForm = ref({
    id: 0,
    parentId: null
})

// 移动文件夹
const remove = () => {
    dialogLoading.value = true
    removeForm.value.id = folderId.value
    axios.post("/api/folder/remove", removeForm.value).then((resp) => {
        removeVisible.value = false
        // 查询笔记以及子文件夹列表
        searchNotes();
        // 获取文件夹列表
        getFolders()
        // 参数置空
        removeForm.value.id = 0
        removeForm.value.parentId = null
    }).catch((err) => {
        ElMessage.error({ message: err.response.data, duration: 1000, showClose: true })
    }).finally(() => {
        dialogLoading.value = false
    })

}


// 创建文档规则
const ruleForm = ref()
const form = ref({
    title: "",
    folderId: null
})

// 表单校验规则
const rules = ref({
    title: [
        {
            required: true,
            message: '请填写文档名称',
            trigger: 'change'
        },
        {
            max: 50,
            message: '最大长度不可超过50字',
            trigger: 'change'
        },
    ],

})

// 创建文件夹规则
const folderRuleForm = ref()
const folderForm = ref({
    name: "",
    parentId: 0
})
const folderRules = ref({
    name: [
        {
            required: true,
            message: '请填写文件夹名称',
            trigger: 'change'
        },
        {
            max: 15,
            message: '最大长度不可超过15字',
            trigger: 'change'
        },
    ],
})


// 按钮禁用
const dialogVisible = ref(false)

// 新建类型按钮禁用
const newBtnStatus = ref(false)

// 子文件夹信息
const subfolderList = ref([])

// 搜索笔记信息
const searchNotes = () => {
    subfolderList.value = []
    docList.value = []
    noteMenuLoading.value = true
    let url = ""
    url += "/api/note/noteList?role=" + searchRole.value
    if (searchIsDelete.value !== 0) {
        url += "&isDelete=" + searchIsDelete.value
    }
    if (searchKeyWord.value !== "") {
        url += "&keyword=" + searchKeyWord.value
    }
    if (searchFolder.value !== 0) {
        url += "&folder=" + searchFolder.value
    }
    if (searchGroup.value !== 0) {
        url += "&group=" + searchGroup.value
    }
    if (pagination.value.currentPage) {
        url += "&page=" + pagination.value.currentPage
    }
    if (pagination.value.pageSize) {
        url += "&limit=" + pagination.value.pageSize
    }


    axios.get(url).then((resp) => {
        pagination.value.currentPage = resp.data.current
        pagination.value.pageSize = resp.data.size
        pagination.value.total = resp.data.total

        dialogVisible.value = false
        docList.value = resp.data.records
        form.value.title = null;
        if (docId.value === 0) {
            if (docList.value.length <= 0) {
                console.log("未查询到笔记");
                markdownFile.value.getNoteInfo()
            } else {
                turnTo(docList.value[0].id)
            }
        }

        // 查询文件夹信息
        if (searchFolder.value !== 0 && pagination.value.currentPage == 1) {
            axios.get("/api/folder/list?id=" + searchFolder.value).then((resp) => {
                subfolderList.value = resp.data
            }).catch((err) => {
                ElMessage.error({ message: err.response.data, duration: 1000, showClose: true })
            }).finally(() => {
                noteMenuLoading.value = false
            })
        }
    }).catch((err) => {
        ElMessage.error({ message: err.response.data, duration: 1000, showClose: true })
    }).finally(() => {
        if (searchFolder.value == 0 || pagination.value.currentPage !== 1) {
            noteMenuLoading.value = false
        }
    })
}

// 文档树展示
const props = ref({
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
                    if (contextmenuType.value == 'folder' || contextmenuType.value == 'subfolder') {
                        if (folderId.value == e.id) {
                            item.leaf = true
                            item.disabled = true
                        }
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
                    if (contextmenuType.value == 'folder' || contextmenuType.value == 'subfolder') {
                        if (folderId.value == e.id) {
                            item.leaf = true
                            item.disabled = true
                        }
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

// 删除后跳转
const deleteGet = () => {
    // 将打开文件设置为空
    docId.value = 0
    searchNotes()
}

// 获取用户组信息
const getUserGroup = () => {
    let url = "/api/userGroup/list?role=255"
    axios.get(url).then((resp) => {
        userGroup.value = resp.data;
    }).catch((err) => {
        ElMessage.error({ message: err.response.data, duration: 1000, showClose: true, });
    });
}

// 设置默认文件
const toActive = (val) => {
    docId.value = val
}

// 当前打开文件夹信息
const folderInfo = ref(null)
// 打开文件夹目录
const folderMenu = ref([])
// 打开文件夹
const searchForNotes = (item, searchType) => {
    // 初始化
    searchGroup.value = 0
    searchRole.value = 255
    searchIsDelete.value = 0
    searchKeyWord.value = ''
    searchFolder.value = 0
    menuType.value = searchType
    // 赋值
    if (searchType == 'folder') {
        // 查询顶层文件夹
        folderMenu.value = []
        // 设置文件夹信息
        folderInfo.value = item
        folderMenu.value.push(item)
        searchFolder.value = item.id
        searchNotes()
        return
    } else if (searchType == 'subfolder') {
        // 查询子文件夹
        // 设置文件夹信息
        folderInfo.value = item
        folderMenu.value.push(item)
        searchFolder.value = item.id
        searchNotes()
        return
    } else if (searchType == 'back') {
        // 回退
        menuType.value = 'subfolder'
        folderMenu.value.pop()
        folderInfo.value = folderMenu.value.at(-1)
        searchFolder.value = folderMenu.value.at(-1).id
        searchNotes()
        return
    }
    else if (searchType == 'all') {
        // 查询全部笔记
    } else if (searchType == 'my') {
        // 查询我的笔记
        searchRole.value = 0
    } else if (searchType == 'group') {
        // 查询用户组笔记
        searchGroup.value = item.belong
    } else if (searchType == 'share') {
        // 查询分享笔记
        searchRole.value = 254
    } else if (searchType == 'recycleBin') {
        // 查询回收站笔记
        searchIsDelete.value = 1
    }

    folderInfo.value = null
    folderMenu.value = []

    searchNotes()
}

// 获取文件夹信息
const getFolders = () => {
    axios.get("/api/folder/list?id=0").then((resp) => {
        folderList.value = resp.data
    }).catch((err) => {
        ElMessage.error({ message: err.response.data, duration: 1000, showClose: true, });
    });
}

//  右击 - 创建文件 
const createNoteMenu = () => {
    if (folderInfo.value != null) {
        form.value.folderId = folderInfo.value.id;
    }
    dialogVisible.value = true;
}

// 文件夹重命名
const rename = () => {
    ElMessageBox.prompt('', '重命名', {
        inputPlaceholder: folderName,
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        inputValue: folderName,
    }).then(({ value }) => {
        if (folderId <= 0) {
            ElMessage.error({ message: "操作异常", duration: 1000, showClose: true, });
            return
        }
        let renameForm = {
            id: folderId.value,
            name: value,
            parentId: parentId.value
        }

        loading.value = true
        axios.post("/api/folder/rename", renameForm).then((resp) => {
            // 查询笔记以及子文件夹列表
            searchNotes();
            // 查询文件夹列表
            getFolders();
            // 若重命名文件夹为当前打开文件夹
            if (folderId.value == folderInfo.value.id) {
                folderInfo.value.name = value
            }

        }).catch((err) => {
            ElMessage.error({ message: err.response.data, duration: 1000, showClose: true, });
        }).finally(() => {
            loading.value = false
        })

    })
        .catch(() => { })
}

// 删除文件夹
const deleteFolder = () => {
    ElMessageBox.confirm(
        h('p', null, [
            h('span', null, '确认删除'),
            h('i', { style: 'color: red;padding: 0 5px ' }, folderName.value),
            h('span', null, '文件夹吗？若您要删除该文件夹，该文件夹下的您的笔记都将被删除，其他用户分享给您的笔记也将被取消分享！！！'),
        ]),
        '删除',
        {
            confirmButtonText: '删除',
            cancelButtonText: '取消',
            confirmButtonClass: 'el-button--danger',
            type: 'warning',
        })
        .then(() => {
            loading.value = true;
            axios.delete("/api/folder/delete?id=" + folderId.value).then((resp) => {

                // 若为左侧栏根文件夹删除
                if (contextmenuType.value == 'folder') {
                    // 重置搜索条件
                    searchGroup.value = 0;
                    searchRole.value = 255;
                    searchIsDelete.value = 0;
                    searchKeyWord.value = '';
                    searchFolder.value = 0
                    // 将打开文件设置为空
                    docId.value = 0;
                    docMenuIndex.value = "all";
                    searchForNotes(null, 'all')
                    getFolders();
                } else if (contextmenuType.value == 'subfolder') {
                    // 将打开文件设置为空
                    docId.value = 0;
                    searchNotes()
                }

            }).catch((err) => {
                ElMessage.error({ message: err.response.data, duration: 1000, showClose: true, });
            }).finally(() => {
                loading.value = false;
            })
        }).catch(() => { })

}

onMounted(() => {
    getList();
    searchNotes();
    getUserGroup();
    getFolders();
})

// 笔记右击信息
const menuNoteInfo = ref()

// 设置笔记右击目录
const setMenuInfo = (item) => {
    contextmenuType.value = 'note'
    menuNoteInfo.value = item
    if (menuNoteInfo.value.folderId == 0) {
        menuNoteInfo.value.folderId = null
    }
}


// 删除笔记
const deleteNote = () => {
    ElMessageBox.confirm(
        h('p', null, [
            h('span', null, '确认删除'),
            h('i', { style: 'color: red' }, menuNoteInfo.value.title),
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
            axios.delete("/api/note/delete?id=" + menuNoteInfo.value.id).then((resp) => {
                ElMessage.success({ message: "删除成功", duration: 2000, showClose: true })
                deleteGet()
            }).catch((err) => {
                ElMessage.error({ message: err.response.data, duration: 2000, showClose: true })
            }).finally(() => {
                loading.value = false
            })
        }).catch(() => { })

}

// 文件重命名
const renameNote = () => {
    let inputPlaceholderTxt = ''
    if (menuNoteInfo.value.role == 0 || menuNoteInfo.value.remark == '') {
        inputPlaceholderTxt = menuNoteInfo.value.title
    } else {
        inputPlaceholderTxt = menuNoteInfo.value.remark
    }

    ElMessageBox.prompt('', '重命名', {
        inputPlaceholder: inputPlaceholderTxt,
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        inputValue: inputPlaceholderTxt,
    }).then(({ value }) => {
        if (menuNoteInfo.value.id <= 0) {
            ElMessage.error({ message: "操作异常", duration: 1000, showClose: true, });
            return
        }

        let form = {
            id: menuNoteInfo.value.id,
            title: value
        }

        loading.value = true
        axios.post("/api/note/rename", form).then((resp) => {
            searchNotes()
            markdownFile.value.getNoteInfo()
        }).catch((err) => {
            ElMessage.error({ message: err.response.data, duration: 1000, showClose: true, });
        }).finally(() => {
            loading.value = false
        })

    }).catch(() => { })
}

// 进入编辑状态
const toedit = (val) => {
    newBtnStatus.value = val
}


const contextmenuType = ref('folder');

// 获取当前文件夹的右击菜单
const getMenuItem = (val, itemType) => {
    parentId.value = val.parentId
    folderId.value = val.id
    folderName.value = val.name
    contextmenuType.value = itemType
}

// 创建笔记
const createNote = () => {
    ruleForm.value.validate((valid) => {
        if (valid) {
            dialogLoading.value = true
            axios.post("/api/note/create", form.value).then((resp) => {
                // 刷新目录
                searchNotes()
                dialogVisible.value = false
                // 跳转至新建笔记
                turnTo(resp.data)
                form.value.title = null
                form.value.folderId = null
                ruleForm.value.resetFields()

                markdownFile.value.changeToEdit(resp.data)
                ElMessage.success({ message: "新建成功", duration: 1000, showClose: true })
            }).catch((err) => {
                console.log(err);
                ElMessage.error({ message: err.response.data, duration: 1000, showClose: true })
            }).finally(() => {
                dialogLoading.value = false
            })
        }
    })
}

// 创建文件夹
const createFolder = () => {
    folderRuleForm.value.validate((valid) => {
        if (valid) {
            dialogLoading.value = true
            if (contextmenuType.value == 'doc') {
                folderForm.value.parentId = searchFolder.value
            }
            axios.post("/api/folder/create", folderForm.value).then((resp) => {
                // 查询笔记以及子文件夹列表
                searchNotes();
                // 获取文件夹列表
                getFolders()
                // 参数置空
                folderRuleForm.value.resetFields()
                folderVisible.value = false
                folderForm.value.name = ""
                folderForm.value.parentId = 0
                ElMessage.success({ message: "新建成功", duration: 1000, showClose: true })
            }).catch((err) => {
                ElMessage.error({ message: err.response.data, duration: 1000, showClose: true })
            }).finally(() => {
                dialogLoading.value = false
            })
        }
    })
}

// 导出笔记
const exportNote = () => {
    newBtnStatus.value = true
    window.location.href = "/api/note/export?id=" + menuNoteInfo.value.id
    setTimeout(() => {
        newBtnStatus.value = false
    }, 3 * 1000);
}


const r = useRoute()
const activeIndex = ref()
activeIndex.value = r.fullPath

onBeforeRouteUpdate((to, from) => { // 监听路由变化
    activeIndex.value = to.fullPath
    searchNotes()
})

// 分享笔记
const shareVisible = ref(false)
// 分享
const shareForm = ref({
    type: "user",
    userId: "",
    groupId: "",
    role: 1,
})
// 分享类型
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
// 分享权限
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
// 弹窗加载
const selectLoading = ref(false)

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

// 分享笔记
const share = () => {
    let shareInfo = {}
    if (shareForm.value.type == "user") {
        shareInfo.id = shareForm.value.userId
    } else if (shareForm.value.type == "group") {
        shareInfo.id = shareForm.value.groupId
    }
    shareInfo.noteId = menuNoteInfo.value.id
    shareInfo.shareType = shareForm.value.type
    shareInfo.role = shareForm.value.role
    dialogLoading.value = true
    axios.post("/api/noteMember/share", shareInfo).then(() => {
        shareVisible.value = false
        shareForm.value.type = 'user'
        shareForm.value.userId = ''
        shareForm.value.groupId = ''
        shareForm.value.role = 1
        ElMessage.success({ message: "分享成功", duration: 1000, showClose: true })
    }).catch((err) => {
        ElMessage.error({ message: err.response.data, duration: 1000, showClose: true })
    }).finally(() => {
        dialogLoading.value = false
    })
}

// 恢复笔记
const toRestore = () => {
    ElMessageBox.confirm(
        h('p', null, [
            h('span', null, '确认恢复'),
            h('i', { style: 'color: red' }, menuNoteInfo.value.title),
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
            axios.get("/api/note/restore?id=" + menuNoteInfo.value.id).then((resp) => {
                ElMessage.success({ message: "恢复成功", duration: 2000, showClose: true })
                markdownFile.value.getNoteInfo()
                searchNotes()
            }).catch((err) => {
                ElMessage.error({ message: err.response.data, duration: 2000, showClose: true })
            }).finally(() => {
                loading.value = false
            })
        }).catch(() => { })
}

// 笔记属性
const noteInfo = ref()
// 笔记属性弹窗
const noteinfoVisible = ref(false)

// 获取笔记属性
const getNoteInfo = () => {
    loading.value = true
    axios.get("/api/note/info?id=" + menuNoteInfo.value.id).then((resp) => {
        noteinfoVisible.value = true
        noteInfo.value = resp.data
    }).catch((err) => {
        ElMessage.error({ message: err.response.data, duration: 1000, showClose: true })
    }).finally(() => {
        loading.value = false
    })
}

// 获取笔记属性
const getNotePath = () => {
    loading.value = true
    axios.get("/api/note/info?id=" + menuNoteInfo.value.id).then((resp) => {
        noteInfo.value = resp.data
        groupVisible.value = true;
    }).catch((err) => {
        ElMessage.error({ message: err.response.data, duration: 1000, showClose: true })
    }).finally(() => {
        loading.value = false
    })
}







const changeGroupId = ref()

// 修改笔记分组
const changeGroup = () => {
    if (changeGroupId.value == null) {
        ElMessage.error({ message: "请选择要保存的文件夹", duration: 1000, showClose: true })
        return
    }
    dialogLoading.value = true
    axios.get("/api/note/group?id=" + menuNoteInfo.value.id + "&group=" + changeGroupId.value).then((resp) => {
        changeGroupId.value = null
        markdownFile.value.getNoteInfo()
        searchNotes()
        ElMessage.success({ message: "修改成功", duration: 1000, showClose: true })
    }).catch((err) => {
        ElMessage.error({ message: err.response.data, duration: 1000, showClose: true })
    }).finally(() => {
        groupVisible.value = false
        dialogLoading.value = false
    })
}


</script>

<style scoped>
.doc-body {
    display: flex;
}

.doc-aside {
    width: 100%;
    height: 100%;
}

.doc-menu {
    height: calc(100vh - 60px);
    display: flex;
    flex-direction: column;
}

.doc-btn {
    margin-top: 10px;
    margin-bottom: 10px;
    width: 100%;
}

.el-main {
    --el-main-padding: 0px;
}

.menu-title {
    padding: 5px;
    width: 150px;
    color: #909399;
    border-bottom: solid 1px #73767a;
}

.hide {
    display: block;
    /* width: 150px; */
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
}

.pagiantion {
    margin-top: auto;
    display: flex;
    justify-content: center;
}

.split {
    width: 20px;
    height: calc(100vh - 60px);
    display: flex;
    flex-direction: column;
    justify-content: center;
    border-right: 1px solid #D4D7DE;
}

.split:hover {
    background: #ebeef5;
}
</style>
