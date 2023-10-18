<template>
    <div class="doc-body" v-loading="loading" element-loading-background="rgba(255, 255, 255, 0.8)"
        element-loading-text="数据加载中...">
        <split-pane :min="150" class="doc-aside">
            <template v-slot:left>
                <el-scrollbar height="calc(93.5vh)">
                    <el-menu class="doc-menu" default-active="all">
                        <el-button type="primary" class="doc-btn" @click="dialogVisible = true" :disabled="newBtnStatus">
                            <el-icon>
                                <Plus />
                            </el-icon>
                            &nbsp;新建
                        </el-button>

                        <div></div>
                        <el-button type="warning" style="margin-bottom: 10px;width: 100%;" @click="folderVisible = true"
                            :disabled="newBtnStatus">
                            <el-icon>
                                <Plus />
                            </el-icon>
                            &nbsp;新建文件夹
                        </el-button>

                        <el-menu-item index="all"
                            @click="searchGroup = '', searchRole = 255, searchIsDelete = 0, searchKeyWord = '', searchTags = '', init()">全部</el-menu-item>
                        <el-menu-item index="myNotes"
                            @click="searchGroup = '', searchRole = 0, searchIsDelete = 0, searchKeyWord = '', searchTags = '', init()">我的笔记</el-menu-item>

                        <el-sub-menu index="userGroup">
                            <template #title><span> 用户组</span></template>
                            <el-menu-item v-for="item, index in userGroup" :index="'user-' + item.name" :key="index"
                                @click="searchGroup = item.belong, searchTags = '', searchRole = 255, searchIsDelete = 0, searchKeyWord = '', init()">
                                {{ item.name }}</el-menu-item>
                        </el-sub-menu>

                        <el-sub-menu index="tags">
                            <template #title><span>文件夹</span></template>
                            <div v-if="user.noteTags != ''" v-contextmenu:contextmenu>
                                <el-menu-item v-for="item, index in user.noteTags" :title=item :index="'note-' + item"
                                    :key="index"
                                    @click="searchGroup = '', searchTags = item, searchRole = 255, searchIsDelete = 0, searchKeyWord = '', init()"
                                    @mousedown.right.stop="getMenuItem(item)">
                                    <div class="hide">{{ item }}</div>
                                </el-menu-item>
                            </div>

                        </el-sub-menu>

                        <el-menu-item index="share"
                            @click="searchGroup = '', searchRole = 254, searchIsDelete = 0, searchTags = '', searchKeyWord = '', init()">与我分享</el-menu-item>
                        <el-menu-item index="recycleBin"
                            @click="searchGroup = '', searchIsDelete = 1, searchRole = 255, searchKeyWord = '', searchTags = '', init()">回收站</el-menu-item>
                    </el-menu>
                </el-scrollbar>
            </template>
            <template v-slot:right>
                <split-pane :min="230" class="doc-aside">
                    <template v-slot:left>

                        <el-scrollbar height="calc(93.5vh)">

                            <el-menu class="doc-menu" :default-active="String(docId)">
                                <el-input placeholder="搜索" v-model="searchKeyWord" :prefix-icon="Search"
                                    @keydown.enter="init()" @clear="init()" clearable>
                                </el-input>


                                <div v-for="item, index in docList" :key="index">
                                    <el-menu-item :index="String(item.id)" @click="turnTo(item.id)"
                                        v-if="item.remark == ''">
                                        {{ item.title }}
                                    </el-menu-item>
                                    <el-menu-item :index="String(item.id)" @click="turnTo(item.id)"
                                        v-else-if="item.remark !== ''">
                                        {{ item.remark }}
                                    </el-menu-item>
                                </div>

                                <el-pagination class="pagiantion" :current-page="pagination.currentPage"
                                    :page-size="pagination.pageSize" :page-sizes="[10]" layout="total,  prev, pager, next"
                                    :pager-count="5" :total="pagination.total" @current-change="handleCurrentChange" small
                                    @size-change="handleSizeChange">
                                </el-pagination>
                            </el-menu>
                        </el-scrollbar>
                    </template>

                    <template v-slot:right>

                        <MarkdownFile :id="docId" @update:change="init" @update:editing="toedit" @delete="deleteGet" @errId="toActive">
                        </MarkdownFile>

                        <el-dialog v-model="dialogVisible" :close-on-click-modal="false" :show-close="false" title="文档"
                            width="30%">
                            <el-form ref="ruleForm" :model="form" :rules="rules" label-width="120px">
                                <el-form-item label="名称" prop="title" style="width: 80%;">
                                    <el-input v-model="form.title"></el-input>
                                </el-form-item>
                                <el-form-item label="文件夹" prop="tags" style="width: 80%;">
                                    <el-select v-model="form.tags" placeholder="保存至" filterable default-first-option
                                        allow-create style="width:320px">

                                        <el-option v-for="item in tagOptions" :key="item" :label="item" :value="item" />
                                    </el-select>
                                </el-form-item>
                            </el-form>
                            <template #footer>
                                <span class="dialog-footer">
                                    <el-button
                                        @click="dialogVisible = false; form.title = null; form.tags = ''; ruleForm.resetFields()">
                                        取消
                                    </el-button>
                                    <el-button type="primary" @click="create">提交</el-button>
                                </span>
                            </template>
                        </el-dialog>

                        <el-dialog v-model="folderVisible" :close-on-click-modal="false" :show-close="false" title="新建文件夹"
                            width="30%">
                            <el-form ref="folderRuleForm" :model="folderForm" :rules="folderRules" label-width="120px">
                                <el-form-item label="名称" prop="title" style="width: 80%;">
                                    <el-input v-model="folderForm.name"></el-input>
                                </el-form-item>
                            </el-form>
                            <template #footer>
                                <span class="dialog-footer">
                                    <el-button
                                        @click="folderVisible = false; folderForm.name = null; folderRuleForm.resetFields()">
                                        取消
                                    </el-button>
                                    <el-button type="primary" @click="createFolder">提交</el-button>
                                </span>
                            </template>
                        </el-dialog>
                    </template>
                </split-pane>
            </template>
        </split-pane>


    </div>

    <v-contextmenu ref="contextmenu" :disabled="contentMeneFlag">
        <v-contextmenu-item @click="form.tags = folderName; dialogVisible = true;">创建文件</v-contextmenu-item>
    </v-contextmenu>
</template>

<script setup>
import { Search } from '@element-plus/icons-vue';
import axios from 'axios';
import { ElMessage } from 'element-plus';
import { ref, reactive, watch, onMounted } from 'vue'
import { onBeforeRouteUpdate, useRoute } from 'vue-router';
import { useStore } from 'vuex';
import splitPane from "../../../components/markdown/SplitPane.vue"
import MarkdownFile from './MarkdownFile.vue';

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
// 搜索：组
const searchTags = ref('')
// 搜索：用户组
const searchGroup = ref('')
// 是否可新建 按钮 禁用
const folderVisible = ref(false)
// 文件夹名称
const folderName = ref()
// 用户信息
const user = ref({})
user.value = store.getters.getUserInfo
// 用户权限
const role = ref('')
role.value = store.getters.getRole
// 右击菜单
const contentMeneFlag = ref(false)
// 文件夹
const tagOptions = ref()
tagOptions.value = user.value.noteTags
// 用户组
const userGroup = ref({})
// 分页
const pagination = ref({
    currentPage: 1,//当前页码
    pageSize: 14,//每页显示的记录数
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
    init();
}
// 分页： 大小
const handleSizeChange = (val) => {
    pagination.value.pageSize = val
    pagination.value.currentPage = 1
    init();
}
// 文件ID
const docId = ref(0)
docId.value = store.getters.getDocId
// 文件跳转
const turnTo = (id) => {
    docId.value = id
    store.commit("saveDocId", id)
}
// 创建文档规则
const ruleForm = ref()
const form = ref({
    title: "",
    tags: "",
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


// 初始化
const init = () => {
    user.value = store.getters.getUserInfo
    let url = ""
    url += "/api/note/noteList?role=" + searchRole.value
    if (searchIsDelete.value !== 0) {
        url += "&isDelete=" + searchIsDelete.value
    }
    if (searchKeyWord.value !== "") {
        url += "&keyword=" + searchKeyWord.value
    }
    if (searchTags.value !== "") {
        url += "&tag=" + searchTags.value
    }
    if (searchGroup.value !== "") {
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
            turnTo(docList.value[0].id)
        }
    }).catch((err) => {
        ElMessage.error({ message: err.response.data, duration: 1000, showClose: true })
    })
}

// 删除后跳转
const deleteGet = () => {

    user.value = store.getters.getUserInfo
    let url = ""
    url += "/api/note/noteList?role=" + searchRole.value
    if (searchIsDelete.value !== 0) {
        url += "&isDelete=" + searchIsDelete.value
    }
    if (searchKeyWord.value !== "") {
        url += "&keyword=" + searchKeyWord.value
    }
    if (searchTags.value !== "") {
        url += "&tag=" + searchTags.value
    }
    if (searchGroup.value !== "") {
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

        turnTo(docList.value[0].id)
    }).catch((err) => {
        ElMessage.error({ message: err.response.data, duration: 1000, showClose: true })
    })


}


const getUserGroup = () => {
    let url = "/api/userGroup/list?role=255"

    axios.get(url).then((resp) => {
        userGroup.value = resp.data;
        // console.log(resp.data)
    }).catch((err) => {
        ElMessage.error({ message: err.response.data, duration: 1000, showClose: true, });
    });
}

const toActive = (val) =>{
    docId.value = val
}

onMounted(() => {
    init()
    getUserGroup()
})


// 进入编辑状态
const toedit = (val) => {

    newBtnStatus.value = val
}


const getMenuItem = (val) => {
    folderName.value = val
}


// 创建文档
const create = () => {
    ruleForm.value.validate((valid) => {
        if (valid) {
            loading.value = true
            form.value.tags = form.value.tags.toString()
            axios.post("/api/note/create", form.value).then((resp) => {
                init()
                dialogVisible.value = false
                if (resp.data.tags != "") {
                    user.value.noteTags = resp.data.tags
                    tagOptions.value = resp.data.tags
                    store.commit("saveNoteTags", user.value.noteTags)
                }

                turnTo(resp.data.id)
                ruleForm.value.resetFields()

                ElMessage.success({ message: "新建成功", duration: 1000, showClose: true })
            }).catch((err) => {
                ElMessage.error({ message: err.response.data, duration: 1000, showClose: true })
            }).finally(() => {
                loading.value = false

            })
        }
    })
}


// 创建文件夹
const createFolder = () => {
    folderRuleForm.value.validate((valid) => {
        if (valid) {
            loading.value = true
            folderForm.value.id = user.value.id
            console.log(form.value);
            axios.post("/api/folder/create", folderForm.value).then((resp) => {
                init()
                folderRuleForm.value.resetFields()
                loading.value = false
                folderVisible.value = false
                if (resp.data.tags != "") {
                    user.value.noteTags = resp.data.tags
                    tagOptions.value = resp.data.tags
                    store.commit("saveNoteTags", user.value.noteTags)
                }
                folderForm.value.name = ""
                ElMessage.success({ message: "新建成功", duration: 1000, showClose: true })
            }).catch((err) => {
                loading.value = false
                ElMessage.error({ message: err.response.data, duration: 1000, showClose: true })
            })
        }
    })
}

const r = useRoute()
const activeIndex = ref()
activeIndex.value = r.fullPath

onBeforeRouteUpdate((to, from) => { // 监听路由变化
    activeIndex.value = to.fullPath
    init()
})

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
    min-height: calc(93.5vh);
    height: 100%;
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

.hide {
    display: block;
    width: 150px;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
}

.pagiantion {
    margin-top: auto;
    display: flex;
    justify-content: center;
}

/* .doc-outline-btn{
    width: 100%;
    height: 56px;
    justify-content: left;
} */
</style>
