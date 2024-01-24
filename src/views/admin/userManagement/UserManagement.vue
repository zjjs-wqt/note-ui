<template>
    <div class="um-body" v-loading="loading" element-loading-text="数据加载中...">
        <div class="um-operation">
            <el-button class="um-btn" type="primary" @click="dialogVisible = true">
                <el-icon>
                    <Plus />
                </el-icon>
                &nbsp;创建用户
            </el-button>
            <!-- <el-button class="um-btn">批量导入</el-button> -->
            <el-input placeholder="姓名关键字" :prefix-icon="Search" @keydown.enter="userList" class="um-operation-input"
                v-model="pagination.name" clearable />
            <el-button type="primary" @click="userSearch()">
                <el-icon>
                    <Search />
                </el-icon>
                &nbsp;查询
            </el-button>
        </div>

        <el-table :data="tableData" empty-text="暂无用户" style="width: 100%" border>
            <el-table-column label="工号" prop="openid" width="180"></el-table-column>
            <el-table-column label="姓名" prop="name" width="180"></el-table-column>
            <el-table-column label="操作栏">
                <template #default="scope">
                    <el-button size="small" class="um-btn" @click="info(scope.row.id); dialogInfo = true;">详情
                    </el-button>
                    <el-button type="primary" size="small" class="um-btn"
                        @click="info(scope.row.id); dialogEdit = true;">编辑</el-button>
                    <el-button type="primary" size="small" class="um-btn"
                        @click="dialogModify = true; pwdInfo.username = scope.row.username;">重置口令
                    </el-button>
                    <el-button size="small" type="danger" class="um-btn" :icon="Delete"
                        @click="userDelect(scope.row.id, scope.row.name)">删除</el-button>
                </template>
            </el-table-column>
        </el-table>
        <el-pagination style="margin-top: 15px;" class="pagiantion" :current-page="pagination.currentPage"
            :page-size="pagination.pageSize" :page-sizes="[20, 30, 40, 50]" layout="total, sizes, prev, pager, next, jumper"
            :total="pagination.total" @current-change="handleCurrentChange" @size-change="handleSizeChange">
        </el-pagination>

        <el-dialog v-model="dialogVisible" :close-on-click-modal="false" :show-close="false" title="创建用户">
            <el-form ref="ruleForm" :model="form" :rules="rules" label-width="120px">
                <el-form-item label="工号" prop="openid" style="width: 80%;">
                    <el-input v-model="form.openid"></el-input>
                </el-form-item>
                <!-- <el-form-item label="用户名" prop="username" style="width: 80%;">
                    <el-input v-model="form.username"></el-input>
                </el-form-item> -->
                <el-form-item label="姓名" prop="name" style="width: 80%;">
                    <el-input v-model="form.name"></el-input>
                </el-form-item>
                <el-form-item label="手机号" prop="phone" style="width: 80%;">
                    <el-input v-model="form.phone"></el-input>
                </el-form-item>
                <el-form-item label="邮箱" prop="email" style="width: 80%;">
                    <el-input v-model="form.email"></el-input>
                </el-form-item>
                <el-form-item label="口令" prop="password" style="width: 80%;">
                    <el-input v-model="form.password" type="password" show-password></el-input>
                </el-form-item>
                <el-form-item label="确认口令" prop="passwordAgain" style="width: 80%;">
                    <el-input v-model="form.passwordAgain" type="password" show-password></el-input>
                </el-form-item>
            </el-form>
            <template #footer>
                <span class="dialog-footer">
                    <el-button @click="cannal()">取消</el-button>
                    <el-button type="primary" @click="userCreate()">提交</el-button>
                </span>
            </template>
        </el-dialog>

        <el-dialog v-model="dialogInfo" :close-on-click-modal="false" :show-close="false" title="用户详情">
            <el-descriptions direction="horizontal" :column="1" border>
                <el-descriptions-item label="工号" label-align="center" align="center">
                    {{ userInfo.openid }}
                </el-descriptions-item>

                <el-descriptions-item label="姓名" label-align="center" align="center">
                    {{ userInfo.name }}
                </el-descriptions-item>
                <el-descriptions-item label="手机号" label-align="center" align="center">{{ userInfo.phone }}
                </el-descriptions-item>
                <el-descriptions-item label="邮箱" label-align="center" align="center">{{ userInfo.email }}
                </el-descriptions-item>
            </el-descriptions>
            <template #footer>
                <span class="dialog-footer">
                    <el-button type="primary" @click="dialogInfo = false">确认</el-button>
                </span>
            </template>
        </el-dialog>
        <el-dialog v-model="dialogEdit" :close-on-click-modal="false" :show-close="false" title="用户">
            <el-form ref="ruleForm" :model="userInfo" :rules="rules" label-width="120px">
                <el-form-item label="工号" prop="openid" style="width: 80%;">
                    <el-input v-model="userInfo.openid"></el-input>
                </el-form-item>
                <!-- <el-form-item label="用户名" prop="username" style="width: 80%;">
                    <el-input v-model="userInfo.username"></el-input>
                </el-form-item> -->
                <el-form-item label="姓名" prop="name" style="width: 80%;">
                    <el-input v-model="userInfo.name"></el-input>
                </el-form-item>
                <el-form-item label="手机号" prop="phone" style="width: 80%;">
                    <el-input v-model="userInfo.phone"></el-input>
                </el-form-item>
                <el-form-item label="邮箱" prop="email" style="width: 80%;">
                    <el-input v-model="userInfo.email"></el-input>
                </el-form-item>
                <!-- <el-form-item label="口令" prop="password" style="width: 80%;">
                    <el-input v-model="userInfo.password" type="password" show-password></el-input>
                </el-form-item>
                <el-form-item label="确认口令" prop="passwordAgain" style="width: 80%;">
                    <el-input v-model="userInfo.passwordAgain" type="password" show-password></el-input>
                </el-form-item> -->
            </el-form>
            <template #footer>
                <span class="dialog-footer">
                    <el-button @click="cannal()">取消</el-button>
                    <el-button type="primary" @click="edit()">提交</el-button>
                </span>
            </template>
        </el-dialog>

        <el-dialog v-model="dialogModify" :close-on-click-modal="false" :show-close="false" title="重置口令">
            <el-form ref="ruleForm" :model="pwdForm" :rules="rules" label-width="120px">
                <el-form-item label="口令" prop="password" style="width: 80%;">
                    <el-input v-model="pwdForm.password" type="password" show-password></el-input>
                </el-form-item>
                <el-form-item label="确认口令" prop="passwordAgain" style="width: 80%;">
                    <el-input v-model="pwdForm.passwordAgain" type="password" show-password></el-input>
                </el-form-item>
            </el-form>
            <template #footer>
                <span class="dialog-footer">
                    <el-button @click="cannal()">取消</el-button>
                    <el-button type="primary" @click="modifyPwd()">提交</el-button>
                </span>
            </template>
        </el-dialog>
    </div>
</template>

<script setup>
import axios from 'axios'
import { ElMessage, ElMessageBox } from 'element-plus'
import { ref, onMounted } from 'vue'
import { Search, Delete } from '@element-plus/icons-vue';

const dialogVisible = ref(false)//创建用户dialog
const dialogModify = ref(false) // 重置密码
const dialogInfo = ref(false) // 详情页面
const dialogEdit = ref(false)

const tableData = ref([])
const loading = ref(false)
// 创建用户表单
const form = ref({
    openid: "", // 工号
    // username: "",
    name: "",
    phone: "",
    email: "",
    password: "",
    passwordAgain: ""
})

// 重置密码表单
const pwdForm = ref({
    password: "",
    passwordAgain: ""
})

const ruleForm = ref()
// 表单校验规则
const rules = ref({
    openid: [
        {
            required: true,
            message: '请填写工号',
            trigger: 'change'
        },
    ],
    name: [
        {
            required: true,
            message: '请填写用户姓名',
            trigger: 'change'
        },
    ],
    password: [
        {
            required: true,
            message: '请填写口令',
            trigger: 'change'
        },
        {
            min: 8,
            message: '口令长度至少8位',
            trigger: 'blur'
        },
    ],
    passwordAgain: [
        {
            required: true,
            message: '请确认填写口令',
            trigger: 'change'
        },
    ]
})

const pagination = ref({
    currentPage: 1,//当前页码
    pageSize: 20,//每页显示的记录数
    total: 0, //总记录数
    userName: "",
    name: "",
    description: ""
})
const handleCurrentChange = (currentPage) => {
    //修改页码值为选中页码值
    pagination.value.currentPage = currentPage;
    //执行查询
    userList();
}

const handleSizeChange = (val) => {
    pagination.value.pageSize = val
    pagination.value.currentPage = 1
    userList();
}

// 取消按钮
const cannal = () => {
    dialogVisible.value = false
    dialogModify.value = false
    dialogEdit.value = false
    form.value = {}
    ruleForm.value.resetFields()
}

// 查询用户列表
const userList = () => {
    loading.value = true
    var url = "/api/user/search?"
    if (pagination.value.name !== "") {
        url += "keyword=" + pagination.value.name
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

        tableData.value = resp.data.records
    }).catch((err) => {
        ElMessage.error({ message: err.response.data, duration: 2000, showClose: true });
    }).finally(() => {
        loading.value = false
    })
}

// 创建用户
const userCreate = () => {
    ruleForm.value.validate((valid) => {
        //表单校验成功
        if (valid) {
            if (form.value.password !== form.value.passwordAgain) {
                ElMessage.error({ message: "两次输入的新口令不一致，请重新输入", duration: 2000, showClose: true });
                return
            }
            if (!form.value) return
            axios.post("/api/user/create", form.value).then((resp) => {
                ElMessage.success({ message: "创建成功", duration: 2000, showClose: true })
                form.value = {}
                userList()
                ruleForm.value.resetFields()
                dialogVisible.value = false
            }).then(userList).catch((err) => {
                ElMessage.error({ message: err.response.data, duration: 2000, showClose: true });
            })
        }
    })

}

// 获取用户详情
const userInfo = ref({})
const info = (userId) => {
    axios.get("/api/user/info?userId=" + userId).then((resp) => {
        userInfo.value = resp.data
    }).catch((err) => {
        ElMessage.error({ message: err.response.data, duration: 2000, showClose: true });
    })
}

// 编辑用户信息
const edit = () => {
    ruleForm.value.validate((valid) => {
        if (valid) {
            axios.post("/api/user/edit", userInfo.value).then((resp) => {
                ElMessage.success({ message: "编辑成功", duration: 2000, showClose: true })
                userInfo.value = {}
                ruleForm.value.resetFields()
                dialogEdit.value = false
            }).then(userList).catch((err) => {
                ElMessage.error({ message: err.response.data, duration: 2000, showClose: true });
            })

        }
    })
}

// 检查两次密码是否一致
const check = () => {
    if (pwdForm.value.password !== pwdForm.value.passwordAgain) {
        ElMessage.error({ message: "两次输入的新口令不一致，请重新输入", duration: 2000, showClose: true });
        return
    }
}

const pwdInfo = ref({
    username: "",
    newPwd: ""
})

// 重置密码
const modifyPwd = () => {
    ruleForm.value.validate((valid) => {
        if (valid) {
            check()
            pwdInfo.value.newPwd = pwdForm.value.passwordAgain
            axios.post('/api/user/modifyPwd', pwdInfo.value).then((resp) => {
                ElMessage.success({ message: "修改成功", duration: 2000, showClose: true })
                dialogModify.value = false
                pwdForm.value.password = ""
                pwdForm.value.passwordAgain= ""
            }).catch((err) => {
                ElMessage.error({ message: err.response.data, duration: 2000, showClose: true });
            })
        }
    })
}

// 删除用户
const userDelect = (id, name) => {

    ElMessageBox.confirm(
        '确认是否删除' + name + '用户？',
        '确认信息',
        {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning',
        }
    )
        .then(() => {
            axios.delete("/api/user/delete?ids=" + id).then((resp) => {
                ElMessage.success({ message: "删除成功", duration: 2000, showClose: true })
                userList()
            })
        })
        .catch(() => {
            // ElMessage({
            //     type: 'info',
            //     message: '取消',
            // })
        })
}

// 用户查询
const userSearch = () => {
    var url = "/api/user/search?"
    if (pagination.value.name !== "") {
        url += "keyword=" + pagination.value.name
    }
    if (pagination.value.currentPage) {
        url += "&page=" + pagination.value.currentPage
    }
    if (pagination.value.pageSize) {
        url += "&limit=" + pagination.value.pageSize
    }
    axios.get(url).then((resp) => {
        handleCurrentChange()
        tableData.value = resp.data.records
    }).catch((err) => {
        ElMessage.error({ message: err.response.data, duration: 2000, showClose: true });
    })
}

onMounted(() => {
    userList();
})

</script>

<style scoped>
.um-operation {
    margin: 30px 20px;
    display: flex;
}

.um-btn {
    margin: 0 15px 0 0;
}

.um-operation-input {
    width: 200px;
    margin-left: auto;
    margin-right: 15px;
}

.um-body {
    width: 70%;
    margin-left: 15%;
}

.pagiantion {
    display: flex;
    justify-content: center;
}
</style>
