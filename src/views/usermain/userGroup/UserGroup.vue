<template>
  <div class="doc-body" v-loading="loading" element-loading-background="rgba(255, 255, 255, 0.8)"
    element-loading-text="数据加载中...">
    <el-container>
      <el-aside width="200px">
        <el-scrollbar height="calc(93.5vh)">
          <el-menu class="doc-menu" router :default-active="activeIndex">
            <el-button type="primary" class="doc-btn" @click="dialogVisible = true">
              <el-icon>
                <Plus />
              </el-icon>
              创建用户组
            </el-button>
            <el-input placeholder="搜索" v-model="searchKeyWord" :prefix-icon="Search" @keydown.enter="getGroup()"
              @clear="getGroup()" clearable>
            </el-input>
            <el-menu-item v-for="(item, index) in list" :key="index" :index="'/index/userGroup/' + item.belong">
              <div style="overflow: hidden;white-space: nowrap;text-overflow: ellipsis;" :title="item.name">
                {{ item.name }}
              </div>
            </el-menu-item>
          </el-menu>
        </el-scrollbar>
      </el-aside>
      <el-main>
        <RouterView @update:change="getGroup"> </RouterView>
      </el-main>
    </el-container>

    <el-dialog v-model="dialogVisible" :close-on-click-modal="false" :show-close="false" title="用户组" width="30%">
      <el-form ref="ruleForm" :model="form" :rules="rules" label-width="120px">
        <el-form-item label="名称" prop="name" style="width: 80%;">
          <el-input v-model="form.name"></el-input>
        </el-form-item>
        <el-form-item label="描述" prop="description" style="width: 80%;">
          <el-input v-model="form.description" :rows="2" type="textarea" placeholder="请输入描述" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false; form.name = null; form.description = ''; ruleForm.resetFields()">
            取消
          </el-button>
          <el-button type="primary" @click="create">提交</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>


<script setup>
import axios from "axios";
import { Search } from '@element-plus/icons-vue';
import { ElMessage } from "element-plus";
import { nextTick, onMounted, ref } from "vue";
import { onBeforeRouteUpdate, useRoute, useRouter } from "vue-router";

const loading = ref(false)
const dialogVisible = ref(false)
const list = ref({});
const searchKeyWord = ref('')
const ruleForm = ref()
const form = ref({
  name: "",
  description: "",
})
const r = useRoute()
const router = useRouter()

// 当前激活目录
const activeIndex = ref("")

const rules = ref({
  name: [
    {
      required: true,
      message: '请填写用户组名称',
      trigger: 'change'
    },
    {
      max: 30,
      message: '最大长度不可超过30字',
      trigger: 'change'
    },
  ],

})

const getGroup = () => {
  let url = "/api/userGroup/list?role=255"
  if (searchKeyWord.value !== "") {
    url += "&keyword=" + searchKeyWord.value
  }
  axios.get(url).then((resp) => {
    list.value = resp.data;
    if (r.params.id == '' && list.value.length != 0) {
      router.push({
        path: "/index/userGroup/" + list.value[0].belong
      })
      activeIndex.value = "/index/userGroup/" + list.value[0].belong
    }
  }).catch((err) => {
    ElMessage.error({ message: err.response.data, duration: 1000, showClose: true, });
  });
};


const create = () => {
  ruleForm.value.validate((valid) => {
    if (valid) {
      loading.value = true
      axios.post("/api/userGroup/create", form.value).then((resp) => {
        // 跳转至最新创建的
        router.push({
          path: "/index/userGroup/" + resp.data
        })
        activeIndex.value = "/index/userGroup/" + resp.data

        getGroup();
        ruleForm.value.resetFields()
        loading.value = false
        dialogVisible.value = false
        ElMessage.success({ message: "新建成功", duration: 1000, showClose: true })
      }).catch((err) => {
        loading.value = false
        ElMessage.error({ message: err.response.data, duration: 1000, showClose: true })
      })
    }
  })
}

onMounted(() => {
  activeIndex.value = r.fullPath
  getGroup();
});

onBeforeRouteUpdate((to, form) => {
  if (to.fullPath == '/index/userGroup') {
    return false
  }else {
    getGroup();
  }


});



</script>

<style scoped>
.doc-body {
  display: flex;
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
</style>