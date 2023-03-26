<template>
     <div class="um-body" v-loading="loading" element-loading-text="数据加载中...">
        <el-table :data="tableData" style="width: 100%;padding-top:20px ;" >
        <el-table-column prop="title" label="文档名称"></el-table-column>
        <el-table-column prop="updatedAt" label="删除时间"></el-table-column>
        <el-table-column prop="username" label="用户名称"></el-table-column>
        <el-table-column prop="id" label="操作">
            <template #default="scope">
                <el-button size="small" type="warning" @click="toRestore(scope)">恢复</el-button>
            </template>
        </el-table-column>
    </el-table>
    </div>
    
</template>

<script setup>
import axios from "axios";
import { ElMessage, ElMessageBox } from "element-plus";
import { h, onMounted, ref } from "vue";
const loading = ref(false)
const tableData = ref([])

const toRestore = ( info ) => {
    ElMessageBox.confirm(
        h('p', null, [
            h('span', null, '确认恢复'),
            h('i', { style: 'color: red' },info.row.title),
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
            axios.get("/api/note/restore?id=" + info.row.id).then((resp) => {
                ElMessage.success({ message: "恢复成功", duration: 2000, showClose: true })
                init()
                loading.value = false
            }).catch((err) => {
                ElMessage.error({ message: err.response.data, duration: 2000, showClose: true })
                loading.value = false
            })
        }).catch(() => { })

}

const init = () => {
    axios.get("/api/note/noteList").then((resp) => {
        tableData.value = resp.data.records
        console.log(resp.data.records);
    })
}


onMounted(() => {
    init()
})

</script>

<style scoped>


</style>