<template>
    <div class="wrapper">
        <div class="container" v-loading="loading" element-loading-background="rgba(255, 255, 255, 0.8)"
            element-loading-text="数据加载中...">
            <div style="margin: 50px 15px">
                <h1 style="font-size: 40px; text-align: center;">笔记管理系统</h1>
            </div>
            <g-input :err="pErr.username" @blur="handleUsernameBlur" v-model="username" placeholder="工号 手机号 邮箱" />
            <div class="hit" style="color: #d93025;" v-show="pErr.username">
                <el-icon>
                    <Warning />
                </el-icon>账户信息为空
            </div>
            <g-input :err="pErr.password" @blur="handlePasswordBlur" style="margin-top: 15px;" v-model="password"
                type="password" placeholder="登录口令" @enter="handleLogin" />
            <div class="hit" style="color: #d93025;" v-show="pErr.password">
                <el-icon>
                    <Warning />
                </el-icon>口令不能为空
            </div>
            <div class="ensure-container">
                <el-button @click="handleLogin" size="large" style="font-size: 16px; width: 100%;" type="primary">
                    登 录
                </el-button>

                <el-button @click="handleSsoLogin" size="large"
                    style="font-size: 16px; width: 100%;margin-top: 30px;margin-left: 0px;" type="primary">
                    单 点 登 录
                </el-button>

            </div>
        </div>
    </div>
</template>
<script setup>
import axios from "axios";
import { ref, reactive, onMounted } from "vue";
import { ElButton, ElMessage } from 'element-plus';
import { Warning } from '@element-plus/icons-vue';
import { useRouter } from 'vue-router';
import GInput from "../../components/GInput.vue";
import { useStore } from "vuex";

// 加载
const loading = ref(false)
// 登录用户名
const username = ref('');
// 登录pin码
const password = ref('');
// 路由
const router = useRouter();
// 存储
const store = useStore();
// 错误提示：判断
const pErr = reactive({
    username: false,
    password: false,
});

// 登录
const handleLogin = () => {
    if (username.value == '') {
        ElMessage.error("账户信息为空");
        return
    }
    if (password.value == '') {
        ElMessage.error("登录口令为空");
        return
    }

    loading.value = true

    axios.post("/api/login", {
        username: username.value,
        password: password.value
    }).then((resp) => {
        router.push({
            name: "NoteList"
        })
        // 设置用户头像
        resp.data.imgSrc = "/api/user/avatar?id=" + resp.data.id
        // 存储用户信息
        store.commit("saveUserInfo", resp.data)
    }).catch((err) => {
        if (err.response.status == 500) {
            ElMessage.error({ message: "网络无法连接", duration: 2000, showClose: true });
        } else {
            ElMessage.error({ message: err.response.data, duration: 2000, showClose: true });
        }
    }).finally(() => {
        loading.value = false
    })

}

// 单点登录
const handleSsoLogin = () => {
    const client_id = 'c05e7e41-18ae-4361-81c4-9010d9dd4623';
    const authorize_uri = 'http://nantemen.hzauth.com/oauth/authorize';
    const redirect_uri = 'http://note.hzmx.com/api/redirect';
    const date = Date.parse(new Date());
    window.location.href = `${authorize_uri}?client_id=${client_id}&redirect_uri=${redirect_uri}&state=${date}`;
}

// 登录用户错误提示
const handleUsernameBlur = (v) => {
    if (v != "") {
        pErr.username = false;
    } else {
        pErr.username = true;
    }
}

// 登录PIN错误提示
const handlePasswordBlur = (v) => {
    if (v != '') {
        pErr.password = false;
    } else {
        pErr.password = true;
    }
}

// 自动登录
onMounted(() => {
    axios.get("/api/check").then((resp) => {
        // 判断用户类型
        if (resp.data.type == "user") {
            router.push({
                name: "NoteList"
            })
            resp.data.imgSrc = "/api/user/avatar?id=" + resp.data.id
        }
        else if (resp.data.type == "admin") {
            router.push({
                name: "UserManagement"
            })
        }
        else if (resp.data.type == "audit") {
            router.push({
                name: "OperationLog"
            })
        }
        store.commit("saveUserInfo", resp.data)
    }).catch(() => {

    })
})

</script>


<style scoped>
.wrapper {
    min-width: 1040px;
    min-height: 99.9vh;
    position: relative;
}

.container {
    transform: translate(-50%, -50%);
    top: 50%;
    left: 50%;
    padding: 0;
    margin: 0;
    position: absolute;
    min-width: 400px;
    min-height: 500px;
    border-radius: 4px;
    box-shadow: 0px 0px 6px rgba(0, 0, 0, .12);
    padding: 30px 45px;
    border: 1px solid #CDD0D6;
}

.ensure-container {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    margin-top: 50px;
    align-items: center;
    width: 100%;
}

.hit {
    margin-left: 15px;
    margin-top: 5px;
}
</style>

