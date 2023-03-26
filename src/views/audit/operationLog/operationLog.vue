<template>
    <div class="top">
        <el-date-picker v-model="allDate" type="datetimerange" range-separator="至" start-placeholder="开始日期"
            end-placeholder="结束日期" align="right" style="margin-right: 20px;max-width: 400px;">
        </el-date-picker>

        <el-select v-model="role" placeholder="角色类型" class="top-options" @change="user = ''">
            <el-option v-for="item in roleType" :key="item.value" :label="item.label" :value="item.value" />
        </el-select>

        <el-select v-model="user" placeholder="用户名" :loading="loading" filterable remote :reserve-keyword="false"
            default-first-option remote-show-suffix :remote-method="remoteMethod" value-key="name" clearable
            class="top-options" :disabled="(role != 2)">
            <div v-loading="loading" element-loading-background="rgba(255, 255, 255, 0.8)"
                element-loading-text="数据加载中...">
                <el-option style="height:45px;" v-for="item in persion" :key="item.id" :value="item.id"
                    :label="item.name">
                    <div style="height:45px;display:flex;">
                        <img v-if="item.avatar" :src="item.avatar" style="width:40px;">
                        <el-avatar v-else :src="icon" style="width:40px;" />
                        <div style="margin-top:5px;">{{ item.name }}</div>
                    </div>
                    {{ item.name }}
                </el-option>
            </div>
        </el-select>
        <el-input v-model="opname" placeholder="操作名称" clearable class="top-options" style="width: 300px;"
            @keydown.enter="search">
        </el-input>

        <el-button type="primary" style="margin-left:auto;" @click="search">
            <el-icon>
                <Search />
            </el-icon>
            &nbsp;查询
        </el-button>

        <el-button type="primary" style="margin-left:20px;" @click="exportLog">
            <el-icon>
                <Download />
            </el-icon>
            &nbsp;导出日志
        </el-button>
    </div>

    <el-table :data="tableData" style="width: 100%">
        <el-table-column prop="createAt" label="操作时间">
            <template #default="scope">
                <div style="display: flex; align-items: center">
                    <span>{{ scope.row.createdAt }}</span>
                </div>
            </template>
        </el-table-column>
        <el-table-column prop="opName" label="操作名称" />
        <el-table-column prop="name" label="用户名">
            <template #default="scope">
                <div style="display: flex; align-items: center">
                    <span>{{ scope.row.name }}</span>
                    <el-tag v-if="(scope.row.opType == 1)">管理员</el-tag>
                </div>
            </template>
        </el-table-column>
        <el-table-column label="查看操作参数">
            <template #default="scope">
                <el-button @click="check(scope.row.opParam)">
                    操作参数
                </el-button>
            </template>
        </el-table-column>
    </el-table>

    <el-dialog v-model="dialog" :close-on-click-modal="false" :show-close="false" title="操作参数" width="30%">
        <el-descriptions direction="horizontal" :column="1" border>
            <el-descriptions-item v-for="(item, key) in paramForm" :label="key" label-align="center" align="center">
                {{ item }}
            </el-descriptions-item>
        </el-descriptions>
        <template #footer>
            <span class="dialog-footer">
                <el-button type="primary" @click="dialog = false">确认</el-button>
            </span>
        </template>
    </el-dialog>
    <el-pagination class="pagiantion" :current-page="pagination.currentPage" :page-size="pagination.pageSize"
        :page-sizes="[20, 30, 40, 50]" layout="total, sizes, prev, pager, next, jumper" :total="pagination.total"
        @current-change="handleCurrentChange" @size-change="handleSizeChange">
    </el-pagination>
</template>

<script setup>
import icon from "../../../assets/icon.png";
import axios from 'axios';
import { ElMessage } from 'element-plus';
import { onMounted, ref } from 'vue';

const pagination = ref({
    currentPage: 1,//当前页码
    pageSize: 20,//每页显示的记录数
    total: 0, //总记录数
    userName: "",
    name: "",
    description: ""
})
const allDate = ref('')
const role = ref('255')
const user = ref()
const roleType = [
    {
        label: "匿名",
        value: "0"
    },
    {
        label: "管理员",
        value: "1"
    },
    {
        label: "用户",
        value: "2"
    },
    {
        label: "所有",
        value: "255"
    }
]
const loading = ref(false)
const persion = ref()
const opname = ref()

// const shortcuts = [
//     {
//         text: '最近一周',
//         value: () => {
//             const end = new Date()
//             const start = new Date()
//             start.setTime(start.getTime() - 3600 * 1000 * 24 * 7)
//             return [start, end]
//         },
//     },
//     {
//         text: '最近一个月',
//         value: () => {
//             const end = new Date()
//             const start = new Date()
//             start.setTime(start.getTime() - 3600 * 1000 * 24 * 30)
//             return [start, end]
//         },
//     },
//     {
//         text: '最近三个月',
//         value: () => {
//             const end = new Date()
//             const start = new Date()
//             start.setTime(start.getTime() - 3600 * 1000 * 24 * 90)
//             return [start, end]
//         },
//     },
// ]

const tableData = ref()

let lastQueryKeyword = "";
let currentKeyword = "";

const remoteMethod = (keyword) => {

    // 1.  参数检查
    if (!keyword) {
        persion.value = []
        return
    }
    currentKeyword = keyword;
    // 2. 判断是否已经再有程序运行
    if (lastQueryKeyword !== "") {
        return
    }
    lastQueryKeyword = keyword;
    loading.value = true
    // 3. 发起请求
    axios.get("/api/user/nameList?keyword=" + keyword).then((resp) => {
        // 4. 绑定数据
        if (resp.data) {
            resp.data.forEach(e => {
                if (e.avatar) {
                    // 转blob
                    let bstr = window.atob(e.avatar)
                    e.avatar = bstr
                }
            });
        }
        persion.value = resp.data
    }).then(() => {
        // 5. 请求结束后判断最初的查询参数与现在的查询参数是否一致。
        if (lastQueryKeyword === currentKeyword) {
            return
        }
        let ky = currentKeyword;
        lastQueryKeyword = "";
        currentKeyword = "";
        remoteMethod(ky);
    }).finally(() => {
        loading.value = false;
        lastQueryKeyword = "";
        currentKeyword = "";
    })
}

onMounted(() => {
    init()
})

const init = () => {
    axios.get("/api/oplog/search").then((resp) => {
        tableData.value = resp.data.records
        pagination.value.currentPage = resp.data.current
        pagination.value.pageSize = resp.data.size
        pagination.value.total = resp.data.total
    }).catch((err) => {
        ElMessage.error({ message: err.response.data, duration: 2000, showClose: true });
    })
}

const search = () => {
    var url = "/api/oplog/search?"

    if (allDate.value != "" && allDate.value != null) {
        // console.log(allDate.value[0].getTime()/1000);
        url += "&start=" + allDate.value[0].getTime()
        url += "&end=" + allDate.value[1].getTime()
    }
    if (role.value) {
        url += "&opType=" + role.value
    }

    if (user.value) {
        url += "&opId=" + user.value
    }

    if (opname.value) {
        url += "&opName=" + opname.value
    }
    if (pagination.value.currentPage) {
        url += "&page=" + pagination.value.currentPage
    }
    if (pagination.value.pageSize) {
        url += "&limit=" + pagination.value.pageSize
    }
    axios.get(url).then((resp) => {
        tableData.value = resp.data.records
        pagination.value.currentPage = resp.data.current
        pagination.value.pageSize = resp.data.size
        pagination.value.total = resp.data.total
    }).catch((err) => {
        ElMessage.error({ message: err.response.data, duration: 2000, showClose: true });
    })
}

const exportLog = () => {
    var url = "/api/oplog/export?"
    if (allDate.value != "" && allDate.value != null) {
        // console.log(allDate.value);
        url += "&start=" + allDate.value[0].getTime()
        url += "&end=" + allDate.value[1].getTime()
    }

    if (role.value) {
        url += "&opType=" + role.value
    }

    if (user.value) {
        url += "&opId=" + user.value
    }

    if (opname.value) {
        url += "&opName=" + opname.value
    }
    window.location.href = url
}

const handleCurrentChange = (currentPage) => {
    //修改页码值为选中页码值
    pagination.value.currentPage = currentPage;
    //执行查询
    search();
}

const handleSizeChange = (val) => {
    pagination.value.pageSize = val
    pagination.value.currentPage = 1
    search();
}

const dialog = ref(false)

// 参数列表
const paramForm = ref()

const check = (val) => {
    dialog.value = true
    paramForm.value = JSON.parse(val)
    // console.log(paramForm.value);
}

</script>

<style scoped>
.top {
    display: flex;
    padding: 20px;
}

.pagiantion {
    display: flex;
    justify-content: center;
    margin-top: 30px;
}

.top-options {
    margin-right: 20px;
}
</style>
