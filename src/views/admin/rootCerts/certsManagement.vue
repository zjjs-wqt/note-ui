<template>
    <div class="um-body" v-loading="loading" element-loading-text="数据加载中...">
        <div class="um-operation">
            <el-button class="um-btn" type="primary" @click="dialogVisible = true">
                <el-icon>
                    <Plus />
                </el-icon>
                &nbsp;上传根证书
            </el-button>
        </div>

        <el-table :data="tableData" empty-text="暂无根证书" style="width: 100%" border>
            <el-table-column label="证书名称" prop="name"></el-table-column>
            <el-table-column label="操作栏">
                <template #default="scope">
                    <el-button type="primary" size="small" class="um-btn" @click="download(scope.row.name);">下载</el-button>
                    <el-button size="small" type="danger" class="um-btn" :icon="Delete"
                        @click="rootCertDelete(scope.row.name)">删除</el-button>
                </template>
            </el-table-column>
        </el-table>

        <el-dialog v-model="dialogVisible" :close-on-click-modal="false" :show-close="false" title="上传根证书">
            <el-form label-width="120px">
                <el-form-item label="文件" style="width: 80%;">
                    <input type="file" placeholder="上传文件" ref="file" />
                </el-form-item>
            </el-form>
            <template #footer>
                <span class="dialog-footer">
                    <el-button @click="cannal()">取消</el-button>
                    <el-button type="primary" @click="rootCertUpload()">提交</el-button>
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

const dialogVisible = ref(false) // 上传根证书dialog

const tableData = ref([]) // 证书列表
const loading = ref(false)

const file = ref(null) // 上传根证书

// 取消按钮
const cannal = () => {
    dialogVisible.value = false
    file.value.value = null
}

// 查询列表
const list = () => {
    loading.value = true
    var url = "/api/rootCerts/list"
    axios.get(url).then((resp) => {
        tableData.value = resp.data
    }).catch((err) => {
        ElMessage.error({ message: err.response.data, duration: 2000, showClose: true });
    }).finally(() => {
        loading.value = false
    })
}

// 上传根证书
const rootCertUpload = () => {
    let formData = new FormData()
    console.log(file.value.files[0])
    if (file.value.files[0] !== undefined) {
        formData.append("files", file.value.files[0])
    }
    dialogVisible.value = false
    loading.value = true
    axios.post("/api/rootCerts/upload", formData).then((resp) => {
        ElMessage.success({ message: "上传成功", duration: 1000, showClose: true })
        file.value.value = null
        list()
    }).catch((err) => {
        ElMessage.error({ message: err.response.data, duration: 1000, showClose: true })
    }).finally(() => {
        loading.value = false
    })
}

// 下载根证书
const download = (name) => {
    window.location.href = `/api/rootCerts/download?name=${encodeURIComponent(name)}`
}

// 删除根证书
const rootCertDelete = (name) => {

    ElMessageBox.confirm(
        '确认是否删除 ' + name + ' 证书？',
        '确认信息',
        {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning',
        }
    )
        .then(() => {
            axios.delete(`/api/rootCerts/remove?name=${encodeURIComponent(name)}`).then((resp) => {
                ElMessage.success({ message: "删除成功", duration: 2000, showClose: true })
                list()
            })
        })
        .catch(() => {
            // ElMessage({
            //     type: 'info',
            //     message: '取消',
            // })
        })
}

onMounted(() => {
    list();
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
