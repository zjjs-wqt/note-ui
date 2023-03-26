<template>
    <div style="padding-top: 10px;">
        <el-table :data="tableData" style="width: 100% ">
            <el-table-column prop="name" label="文件名称" />
            <el-table-column label="更新时间">
                <template #default="scope">
                    <div style="display: flex; align-items: center">
                        <span>{{ scope.row.updatedAt }}</span>
                    </div>
                </template>
            </el-table-column>
            <el-table-column prop="size" label="大小">
                <template #default="scope">
                    <div>
                        {{ formatByte(scope.row.size) }}
                    </div>
                </template>
            </el-table-column>
            <el-table-column label="下载">
                <template #default="scope">
                    <el-button @click="download(scope.row.name)" >
                        下载
                    </el-button>
                </template>
            </el-table-column>
        </el-table>
    </div>

</template>

<script setup>
import axios from 'axios';
import { ElMessage } from 'element-plus';
import { ref } from 'vue';


const tableData = ref()

const init = () => {
    axios.get("/api/log/list").then((resp) => {
        // console.log(resp.data);
        tableData.value = resp.data
    }).catch((err) => {
        ElMessage.error({ message: err.response.data, duration: 2000, showClose: true });
    })
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

init()

const download = (val) =>{
    window.location.href = "/api/log/download?path=" + encodeURIComponent(val)
}
</script>

<style scoped>

</style>
