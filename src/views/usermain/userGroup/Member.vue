<template>
  <div v-if="id != 0" v-loading="bodyLoading" element-loading-background="rgba(255, 255, 255, 0.8)"
    element-loading-text="数据加载中...">
    <div v-if="role == 0">
      <div>
        <div v-if="editFlag" style="font-size: 25px;margin: 10px 5px;">
          <el-input v-model="groupInfo.name" maxlength="30" show-word-limit style="width: 300px;"
            @keydown.enter="handleEditTitle" :ref="(el) => { tofocus(el) }"></el-input>
          <el-button style="margin-left: 20px;" type="primary" @click="handleEditTitle">保存</el-button>
          <el-button style="margin-left: 20px;" @click="handleCancel">取消</el-button>
        </div>
        <div v-else style="font-size: 25px;margin: 10px 5px;display: flex;">
          <div class="hide" :title="groupInfo.name">{{ groupInfo.name }}</div>
          <el-button style="margin-left: 20px;" :icon="EditPen" link @click="editFlag = true;" size="large"></el-button>
        </div>
        <div style="font-size: 12px;width: 160px;padding-top: 5px;">
          <span>您可以邀请成员加入用户组。</span>
        </div>
        <div style="margin: 20px" />
        <el-form :label-position="labelPosition" label-width="100px" :model="member" style="max-width: 460px">
          <el-form-item label="成员名称">
            <el-select v-model="member.userId" :loading="loading" filterable remote :reserve-keyword="false"
              default-first-option remote-show-suffix :remote-method="memRemoteMethod" placeholder=" "
              style="width:100%; " value-key="name">
              <div v-loading="loading" element-loading-background="rgba(255, 255, 255, 0.8)"
                element-loading-text="数据加载中...">
                <el-option style="height:45px;" v-for="item in persion" :key="item.id" :value="item.id"
                  :label="item.name">
                  <div style="height:45px;display:flex;">
                    <div style="margin-top:5px;">{{ item.name }}</div>
                  </div>
                </el-option>
              </div>
            </el-select>
          </el-form-item>
          <el-form-item label="角色权限">
            <el-select v-model="member.role" style="width:100%;">
              <el-option v-for="item in rolePermission" :key="item.value" :label="item.label" :value="item.value"
                :disabled="item.disabled" />
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button :disabled="btnStatus" style="float:left;" @click="addMember()">添加到用户组
            </el-button>
          </el-form-item>
        </el-form>
      </div>
    </div>
    <div v-else style="font-size: 25px;margin: 10px 5px;display: flex;">
      <div class="hide" :title="groupInfo.name">{{ groupInfo.name }}</div>
    </div>


    <div class="mem-list-title" style="display:flex;">
      <span style="float:left;margin-left: 10px;"><strong>用户组已有人员</strong></span>
      <el-input v-model="keyword" placeholder="搜索人员" :prefix-icon="Search"
        style="width:20%;margin-left: auto;margin-right: 20px;" @keydown.enter="memberList" />
      <el-button type="primary" style="margin-right:10px;" @click="memberList()">
        <el-icon>
          <Search />
        </el-icon>
        &nbsp;查询
      </el-button>
    </div>
    <div class="mem-project" style="min-height:80px;">
      <el-card shadow="hover" v-for="item, index in tableData" :key="index">
        <div class="mem-title-body" style="display:flex;">
          <div class="mem-name" style="display: flex;">
            <el-image :src="'/api/user/avatar?id=' + item.userId"  style="width:40px;height: 40px; border-radius: 25px; overflow: hidden;">
              <template #error>
                <el-avatar :src="icon" />
              </template>
            </el-image>
            <div style="margin-left:5px;margin-top:10px;">{{ item.name }}</div>
          </div>
          <div v-if="role == 0" style="margin-left:auto;display:flex;">
            <div class=" mem-search" v-if="item.role !== 0" style="margin-right: 10px;">
              <el-select v-model="item.role" size="small" style="width:100%;"
                @change="(val) => changeEvent(val, item.userId)">
                <el-option v-for=" item in rolePermission" :key="item.value" :label="item.label" :value="item.value"
                  :disabled="item.disabled" />
              </el-select>
            </div>
            <div v-else link class="mem-permission" style=" padding-right: 10px;">
              {{ roleTable[item.role] }}</div>
            <div v-if="item.role !== 0">
              <el-button type="danger" :icon="Delete" size="small" @click="deleteMember(item.userId, item.name)" />
            </div>
          </div>
          <div v-else style="margin-left:auto;display:flex;">
            <div link class="mem-permission" style=" padding-right: 10px;">
              {{ roleTable[item.role] }}</div>
          </div>
        </div>

      </el-card>
    </div>
  </div>
</template>

<script setup>
import {
  Search,
  ArrowLeft,
  ArrowRight,
  Delete,
  Edit,
  Share,
  EditPen,
} from '@element-plus/icons-vue'
import axios from "axios";
import { ElMessage, ElMessageBox } from "element-plus";
import { onMounted, ref } from "vue";
import { useRoute } from "vue-router";
import { onBeforeRouteUpdate } from "vue-router";
import icon from "../../../assets/icon.png"

const emit = defineEmits(["update:change"])
const editFlag = ref(false)

const labelPosition = ref('top')
const router = useRoute();
const id = ref(0);
const loading = ref(false)
const bodyLoading = ref(false)
// 防误触
const btnStatus = ref(false)
const keyword = ref('')
id.value = Number(router.params.id);
const tableData = ref({})
const member = ref({
  userId: "",
  role: 1,
  groupId: id.value
})

const roleTable = ['管理者', '普通用户', '维护']
const rolePermission = [
  {
    value: 1,
    label: '普通用户',
    disabled: false,
  },
  {
    value: 2,
    label: '维护',
    disabled: false,
  },

]

// 自动聚焦
const tofocus = (val) => {
  if (val) {
    val.focus()
  }
}

const persion = ref([])// 成员名称下拉框
let last = "";
let current = "";

const memRemoteMethod = (keyword) => {
  // 1.  参数检查
  if (!keyword) {
    persion.value = []
    return
  }
  current = keyword;
  // 2. 判断是否已经再有程序运行
  if (last !== "") {
    return
  }
  last = keyword;
  loading.value = true
  // 3. 发起请求
  axios.get("/api/user/nameList?keyword=" + keyword).then((resp) => {
    // 4. 绑定数据
    persion.value = resp.data
  }).then(() => {
    // 5. 请求结束后判断最初的查询参数与现在的查询参数是否一致。
    if (last === current) {
      return
    }
    let ky = current;
    last = "";
    current = "";
    memRemoteMethod(ky);
  }).finally(() => {
    loading.value = false;
    last = "";
    current = "";
  })
}

const role = ref(-1)


const deleteMember = (userId, name) => {
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
      axios.delete("/api/userGroup/delete?groupId=" + id.value + "&id=" + userId).then((resp) => {
        ElMessage.success({ message: "删除成功", duration: 2000, showClose: true })
        memberList()

      }).catch((err) => {
        ElMessage.error({ message: err.response.data, duration: 2000, showClose: true })
      })

    })
    .catch(() => {

    })
}

// 添加成员
const addMember = () => {
  btnStatus.value = true
  if (member.value.userId == "") {
    btnStatus.value = false
    ElMessage.error({ message: "请选择用户组成员", duration: 2000, showClose: true });
    return
  }
  axios.post("/api/userGroup/add", member.value).then((resp) => {
    btnStatus.value = false
    ElMessage.success({ message: "添加成功", duration: 2000, showClose: true })
    init()
  }).catch((err) => {
    btnStatus.value = false
    ElMessage.error({ message: err.response.data, duration: 2000, showClose: true });
  })
  member.value.userId = ''
  member.value.role = 1
}

// 成员角色
const changeData = ref({
  userId: "",
  groupId: id.value,
  role: ""
})

// 修改成员角色
const changeEvent = (val, userId) => {
  changeData.value.groupId = Number(id.value),
    changeData.value.userId = userId
  changeData.value.role = val
  axios.post("/api/userGroup/change", changeData.value).then((resp) => {
    ElMessage.success({ message: "角色修改成功", duration: 2000, showClose: true })
  }).catch((err) => {
    ElMessage.error({ message: err.response.data, duration: 2000, showClose: true });
  })
}

const memberList = () => {
  var url = "/api/userGroup/all?groupId=" + id.value
  if (keyword.value != "") {
    url += "&keyword=" + keyword.value
  }
  axios.get(url).then((resp) => {
    tableData.value = resp.data
  }).catch((err) => {
    ElMessage.error({ message: err.response.data, duration: 1000, showClose: true, });
  });
}


const groupInfo = ref({
  name: ""
})

const init = () => {
  if (id.value == 0) {
    return
  }
  bodyLoading.value = true
  axios.get("/api/userGroup/role?groupId=" + id.value).then((resp) => {
    role.value = resp.data
    return axios.get("/api/userGroup/all?groupId=" + id.value)
  }).then((resp) => {
    tableData.value = resp.data
    return axios.get("/api/userGroup/info?groupId=" + id.value)
  }).then((resp) => {
    groupInfo.value = resp.data
  }).catch((err) => {
    ElMessage.error({ message: err.response.data, duration: 1000, showClose: true, });
  }).finally(() => {
    bodyLoading.value = false
  });
};


const handleCancel = () => {
  editFlag.value = false
  bodyLoading.value = true
  axios.get("/api/userGroup/info?groupId=" + id.value).then((resp) => {
    groupInfo.value = resp.data
  }).catch((err) => {
    ElMessage.error({ message: err.response.data, duration: 2000, showClose: true, });
  }).finally(() => {
    bodyLoading.value = false
  });
}


const handleEditTitle = () => {

  if (groupInfo.value.name.trim() == '') {
    ElMessage.error({ message: "用户组名称不可为空", duration: 2000, showClose: true })
    return
  }

  let form = {
    id: groupInfo.value.id,
    name: groupInfo.value.name
  }

  bodyLoading.value = true
  axios.post("/api/userGroup/rename", form).then((resp) => {
    ElMessage.success({ message: "用户组名称修改成功", duration: 2000, showClose: true })

    emit("update:change", true)

    return axios.get("/api/userGroup/info?groupId=" + id.value)
  }).then((resp) => {
    groupInfo.value = resp.data
  }).catch((err) => {
    ElMessage.error({ message: err.response.data, duration: 2000, showClose: true, });
  }).finally(() => {
    editFlag.value = false
    bodyLoading.value = false
  });



}

onMounted(() => {
  if (id.value != 0) {
    id.value = Number(router.params.id);
    init()
  }

});

onBeforeRouteUpdate((to, form) => {
  id.value = to.params.id;
  member.value.groupId = Number(id.value)
  editFlag.value = false
  init();
});
</script>

<style scoped>
.mem-list-title {
  width: 100%;
  height: 30px;
  padding: 10px 0;
  background-color: #fafafa;
  border-bottom: 1px solid #e5e5e5;
  margin-top: 20px;
}

.hide {
  display: block;
  max-width: 350px;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}
</style>
