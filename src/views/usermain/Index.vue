<template>
    <div class="pj-top">
        <el-menu class="pj-menu" mode="horizontal" router :default-active="activeIndex">
            <div class="pj-title">
                <img src="../../../public/note.svg" style="width: 25px; height : 25px ;padding-right:10px">
                <div style="padding-right: 10px;">笔记系统</div>
                <el-tag type="info" style="font-size:18px;">{{ version.systemVersion }}</el-tag>
            </div>
            <el-menu-item index="/index/noteList">笔记列表</el-menu-item>
            <el-menu-item index="/index/userGroup">用户组管理</el-menu-item>
            <div class="i-avatar" @click="skipUser">
                <div style="width:40px;height: 40px; border-radius: 25px; overflow: hidden;">
                    <el-image :src="userInfo.imgSrc" style="width:40px;height: 40px;">
                        <template #error>
                            <el-avatar :src="icon" />
                        </template>
                    </el-image>
                </div>
                <el-button link class="i-name">{{ userInfo.name }}</el-button>
            </div>
            <el-link type="info" style=" margin-top: 8px;margin-right: 10px;" @click="logout">退出登录</el-link>
        </el-menu>

    </div>
    <router-view />
</template>

<script setup>
import icon from "../../assets/icon.png"
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useStore } from "vuex";
import axios from 'axios';
import { ElMessage } from 'element-plus';
const router = useRouter()
const store = useStore()
const r = useRoute()

// 版本信息
const version = ref('')
// 用户头像等信息
const userInfo = ref({})
// 从 store 中获取用户信息
userInfo.value = store.getters.getUserInfo

// 获取程序版本信息
const init = () => {
    axios.get("/api/system/version").then((resp) => {
        version.value = resp.data
    }).catch((err) => {
        ElMessage.error({ message: err.response.data, duration: 2000, showClose: true });
    })
}



// 退出登录
const logout = () => {
    axios.delete("/api/logout").then((resp) => {
        // 清空 打开文档记录
        store.commit("saveDocId", 0)
        // 退出至登录页
        router.push({
            path: "/"
        })
    }).catch((err) => {
        ElMessage.error({ message: err.response.data, duration: 2000, showClose: true });
    })

}

// 跳转至用户信息页面
const skipUser = () => {
    router.push({
        name: 'User'
    })
}


// 取消页面本身拖拽事件
document.addEventListener('drop', function (e) {
    e.preventDefault()
}, false)
document.addEventListener('dragover', function (e) {
    e.preventDefault()
}, false)


// 当前激活目录
const activeIndex = ref("")

onMounted(() => {
    // 检测用户信息
    axios.get("/api/check").then((resp) => {
        resp.data.imgSrc = "/api/user/avatar?id=" + resp.data.id
        store.commit("saveUserInfo", resp.data)
        userInfo.value = resp.data
    }).catch(() => {})
    // 初始化
    init()


    // 设置当前激活目录
    if (r.fullPath.startsWith("/index/userGroup")){
        activeIndex.value = "/index/userGroup"
    }else {
        activeIndex.value = r.fullPath
    }
})

</script>

<style scoped>
.pj-top {
    display: flex;
}



.pj-menu {
    width: 100%;
    height: 60px;
}

.i-avatar {
    margin: 10px 15px 0 auto;
    display: flex;

}

.i-name {
    padding: 12px 0 15px 5px;
    font-size: 18px;
}

.badge:deep(.el-badge__content.is-fixed) {
    top: 14px;
}
</style>
