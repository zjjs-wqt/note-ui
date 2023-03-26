<template>
    <div class="wrapper">
        <div class="container" v-loading="loadding" element-loading-background="rgba(255, 255, 255, 0.8)"
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

const loadding = ref(false)
const username = ref('');
const password = ref('');
const router = useRouter();
const store = useStore();

const pErr = reactive({
    username: false,
    password: false,
});


const handleLogin = () => {
    if (username.value == '') {
        ElMessage.error("账户信息为空");
        return
    }
    if (password.value == '') {
        ElMessage.error("登录口令为空");
        return
    }

    loadding.value = true
    axios.post("/api/login", {
        username: username.value,
        password: password.value
    }).then((resp) => {
        if (resp.data.type == "user") {
            router.push({
                name: "NoteList"
            })
            resp.data.imgSrc = "/api/user/avatar?id=" + resp.data.id
        }
        else if (resp.data.type == "admin"){
            router.push({
                name: "UserManagement"
            })
        }
        else if (resp.data.type == "audit"){
            router.push({
                name: "OperationLog"
            })
        }
        store.commit("saveUserInfo", resp.data)
    }).catch((err) => {
        if (err.response.status == 500) {
            ElMessage.error({ message: "网络无法连接", duration: 2000, showClose: true });
        } else {
            ElMessage.error({ message: err.response.data, duration: 2000, showClose: true });
        }
    }).finally(() => {
        loadding.value = false
    })

}

const handleSsoLogin = () => {
    const client_id = '596f07bb-7fce-448b-a2a6-84e508929a90';
    const authorize_uri = 'http://127.0.0.1:8008/oauth/authorize';
    const redirect_uri = 'http://127.0.0.1:80/api/redirect';
    const date = Date.parse(new Date());

    window.location.href = `${authorize_uri}?client_id=${client_id}&redirect_uri=${redirect_uri}&state=${date}`;
}


const handleUsernameBlur = (v) => {
    if (v != "") {
        pErr.username = false;
    } else {
        pErr.username = true;
    }
}

const handlePasswordBlur = (v) => {
    if (v != '') {
        pErr.password = false;
    } else {
        pErr.password = true;
    }
}

onMounted(() => {
    axios.get("/api/check").then((resp) => {
        if (resp.data.type == "user") {
            router.push({
                name: "NoteList"
            })
            resp.data.imgSrc = "/api/user/avatar?id=" + resp.data.id
        }
        else if (resp.data.type == "admin"){
            router.push({
                name: "UserManagement"
            })
        }
        else if (resp.data.type == "audit"){
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

