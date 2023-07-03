<template>
    <el-dialog :close-on-click-modal="false" :show-close="false" title="SKF驱动程序下载" width="500px"
        v-bind:modelValue="modelValue">
        <el-form label-width="120px">
            <el-form-item label="Windows：" style="width: 80%;">
                <a href="/ui/skfdriver-386-1.1.0.msi">skfdriver-386-1.1.0.msi</a>
                <a href="/ui/skfdriver-amd64-1.1.0.msi">skfdriver-amd64-1.1.0.msi</a>
            </el-form-item>
        </el-form>
        <template #footer>
            <span class="dialog-footer">
                <el-button type="primary" @click="cancel">取消</el-button>
            </span>
        </template>
    </el-dialog>
</template>

<script setup>
const props = defineProps({
    modelValue: Boolean,
})
const emit = defineEmits(["update:modelValue"])

const cancel = () => {
    emit("update:modelValue", false);
}

</script>
