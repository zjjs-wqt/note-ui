<template>
    <div class="doc-body" v-loading="loading" element-loading-background="rgba(255, 255, 255, 0.8)"
        element-loading-text="数据加载中...">
        <el-scrollbar height="calc(93.5vh)">
            <el-menu class="doc-menu" default-active="all">
                <el-button type="primary" class="doc-btn" @click="dialogVisible = true" :disabled="newBtnStatus">
                    <el-icon>
                        <Plus />
                    </el-icon>
                    &nbsp;新建
                </el-button>
                <el-menu-item index="all"
                    @click="searchGroup = '', searchRole = 255, searchIsDelete = 0, searchKeyWord = '', searchTags = '', init()">全部</el-menu-item>
                <el-menu-item index="myNotes"
                    @click="searchGroup = '', searchRole = 0, searchIsDelete = 0, searchKeyWord = '', searchTags = '', init()">我的笔记</el-menu-item>

                <el-sub-menu index="userGroup">
                    <template #title><span> 用户组</span></template>
                    <el-menu-item v-for="item, index in userGroup" :index="item.name" :key="index"
                        @click="searchGroup = item.belong, searchTags = '', searchRole = 255, searchIsDelete = 0, searchKeyWord = '', init()">
                        {{ item.name }}</el-menu-item>
                </el-sub-menu>

                <el-sub-menu index="tags">
                    <template #title><span>标签</span></template>
                    <div v-if="user.noteTags != ''">
                        <el-menu-item v-for="item, index in user.noteTags" :index="item" :key="index" 
                        @click="searchGroup = '', searchTags = item, searchRole = 255, searchIsDelete = 0, searchKeyWord = '', init()">
                        {{ item }}</el-menu-item>
                    </div>
                    
                </el-sub-menu>

                <el-menu-item index="share"
                    @click="searchGroup = '', searchRole = 254, searchIsDelete = 0, searchTags = '', searchKeyWord = '', init()">与我分享</el-menu-item>
                <el-menu-item index="recycleBin"
                    @click="searchGroup = '', searchIsDelete = 1, searchRole = 255, searchKeyWord = '', searchTags = '', init()">回收站</el-menu-item>
            </el-menu>
        </el-scrollbar>
        <split-pane :min="230" class="doc-aside">

            <template v-slot:left>

                <el-scrollbar height="calc(93.5vh)">
                    <el-menu class="doc-menu" router>
                        <el-input placeholder="搜索" v-model="searchKeyWord" :prefix-icon="Search" @keydown.enter="init()"
                            @clear="init()" clearable>
                        </el-input>
                        <div>
                            <el-menu mode="horizontal" :ellipsis="false">
                                <el-menu-item @click="menuFlag = 0" index="目录">文件目录</el-menu-item>
                                <el-menu-item @click="menuFlag = 1" index="大纲"
                                    :disabled="disabledOutline">&nbsp;&nbsp;大纲&nbsp;&nbsp;
                                </el-menu-item>
                            </el-menu>
                        </div>

                        <div v-for="item, index in docList" :key="index" v-if="menuFlag == 0">
                            <el-menu-item :index="'/index/noteList/' + item.id" v-if="item.remark == ''">
                                {{ item.title }}
                            </el-menu-item>
                            <el-menu-item :index="'/index/noteList/' + item.id" v-else-if="item.remark !== ''">
                                {{ item.remark }}
                            </el-menu-item>
                        </div>

                        <el-pagination v-if="menuFlag == 0" style="margin-top: 15px ;margin-left: 15px;" class="pagiantion"
                            :current-page="pagination.currentPage" :page-size="pagination.pageSize" :page-sizes="[10]"
                            layout="total,  prev, pager, next" :pager-count="5" :total="pagination.total"
                            @current-change="handleCurrentChange" small @size-change="handleSizeChange">
                        </el-pagination>

                        <el-menu>
                            <div v-for="item, index in outlineMenu" :key="index" v-if="menuFlag == 1">
                                <el-menu-item :index="item.text" @click="item.node.scrollIntoView()">
                                    {{ getOutlineTitle(item) }}
                                </el-menu-item>
                            </div>
                        </el-menu>
                    </el-menu>
                </el-scrollbar>
            </template>

            <template v-slot:right>
                <RouterView @update:change="init" @update:editing="toedit" @update:outline="getOutline" />
                <el-dialog v-model="dialogVisible" :close-on-click-modal="false" :show-close="false" title="文档" width="30%">
                    <el-form ref="ruleForm" :model="form" :rules="rules" label-width="120px">
                        <el-form-item label="名称" prop="title" style="width: 80%;">
                            <el-input v-model="form.title"></el-input>
                        </el-form-item>
                        <el-form-item label="标签" prop="tags" style="width: 80%;">
                            <el-select v-model="form.tags" placeholder="请添加标签" multiple filterable default-first-option
                                allow-create>

                                <el-option v-for="item in tagOptions" :key="item" :label="item" :value="item"  />
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
            </template>
        </split-pane>
    </div>
</template>

<script setup>
import { Search } from '@element-plus/icons-vue';
import axios from 'axios';
import { ElMessage } from 'element-plus';
import { ref, reactive, watch, onMounted } from 'vue'
import { onBeforeRouteUpdate, useRoute } from 'vue-router';
import { useStore } from 'vuex';
import splitPane from "../../../components/markdown/SplitPane.vue"
const loading = ref(false)
const items = ref()
const docList = ref()
const store = useStore()

const searchRole = ref(255)
const searchIsDelete = ref(0)
const searchKeyWord = ref('')
const searchTags = ref('')
const searchGroup = ref('')

const user = ref({})
user.value = store.getters.getUserInfo
// console.log(user.value.noteTags)
const role = ref('')
role.value = store.getters.getRole
const search = ref("")
const file = ref(null)
const menuFlag = ref(0)
const tagOptions = ref()
tagOptions.value = user.value.noteTags
const userGroup = ref({})

const pagination = ref({
    currentPage: 1,//当前页码
    pageSize: 13,//每页显示的记录数
    total: 0, //总记录数

    userName: "",
    name: "",
    description: ""
})

const handleCurrentChange = (currentPage) => {
    //修改页码值为选中页码值
    pagination.value.currentPage = currentPage;
    //执行查询
    init();
}

const handleSizeChange = (val) => {
    pagination.value.pageSize = val
    pagination.value.currentPage = 1
    init();
}

const options = reactive([
    {
        value: 'markdown',
        label: 'markdown',
    },
    {
        value: 'word',
        label: 'word',
    },
    {
        value: 'txt',
        label: 'txt',
    },
    {
        value: 'excel',
        label: 'excel',
    },
    {
        value: 'file',
        label: '其他',
    },
])
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

const dialogVisible = ref(false)

const disabledOutline = ref(true)

const newBtnStatus = ref(false)

const outlineMenu = ref([])

// 获取大纲
const getOutline = (val) => {
    outlineMenu.value = val
    // if(outlineMenu.value == ""){
    disabledOutline.value = false
    // }
    // else {
    //     disabledOutline.value=false
    // }
    //   emit("update:outline", val)
}

// 初始化
const init = () => {
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
        // dialogVisible.value = false
        // items.value = resp.data
        docList.value = resp.data.records

        // form.value.name = null;
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


onMounted(() => {
    init()
    getUserGroup()
})


// 进入编辑状态
const toedit = (val) => {
    // console.log(val)
    newBtnStatus.value = val
}

// 创建文档
const create = () => {
    ruleForm.value.validate((valid) => {
        if (valid) {
            loading.value = true
            form.value.tags = form.value.tags.toString()
            axios.post("/api/note/create", form.value).then((resp) => {
                init()
                ruleForm.value.resetFields()
                loading.value = false
                dialogVisible.value = false
                if (resp.data.tags != "") {
                    user.value.noteTags = resp.data.tags
                    tagOptions.value = resp.data.tags
                    store.commit("saveNoteTags", user.value.noteTags)
                }
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


const docFlag = ref()
docFlag.value = store.getters.getDocChange

watch(docFlag, (newVal, oldVal) => {
    // console.log(newVal)
})

// 大纲缩进
const getOutlineTitle = (item) => {
    var text = ""
    for (var i = 1; i < item.level; i++) {
        text += "\xa0\xa0\xa0\xa0"
    }
    return text + item.text
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
    min-height: calc(93.5vh);
    height: 100%;
}

.doc-btn {
    margin-top: 10px;
    margin-bottom: 10px;
    width: 100%;
}

.el-main {
    --el-main-padding: 0px;
}

/* .doc-outline-btn{
    width: 100%;
    height: 56px;
    justify-content: left;
} */
</style>
