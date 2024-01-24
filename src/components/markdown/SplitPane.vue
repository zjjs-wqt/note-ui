<template>
    <div class="split-pane" :class="{
        dragging: state.dragging,
        vertical: isVertical
    }" @mousemove="dragMove" @mouseup="dragEnd" @mouseleave="dragEnd">
        <div class="left" :style="{ [isVertical ? 'height' : 'width']: boundSplit + 'px' }" v-if="leftFlag">
            <slot name="left" />
            <div class="dragger" @mousedown.prevent="dragStart" />
        </div>
        <div class="right" :style="{ [isVertical ? 'height' : 'width']: ( 1000- boundSplit) + 'px' }" v-if="rightFlag" >
            <slot name="right" />
        </div>
    </div>
</template>

<script setup>
import { reactive, computed, ref, watch } from 'vue'

const props = defineProps({
    layout: {
        type: String,
        default: '',
    },
    min: {
        type: Number,
        default: 150,
    },
    max: {
        type: Number,
        default: 0,
    },
    leftFlag:{
        type:Boolean,
        default:true,
    },
    rightFlag:{
        type:Boolean,
        default:true
    }
});

// 左侧栏是否展示
const leftFlag = ref(props.leftFlag)
// 右侧栏是否展示
const rightFlag = ref(props.rightFlag)

// 监听展示是否变化
watch(props,(newVal,oldVal)=>{
    leftFlag.value = newVal.leftFlag
    rightFlag.value = newVal.rightFlag
})

const isVertical = computed(() => props.layout === 'vertical')

const state = reactive({ dragging: false, split: props.min })

const boundSplit = computed(() => {
    const { split } = state;
    if (split < props.min) {
        return props.min;
    }

    if (props.max > 0 && split > props.max) {
        return props.max;
    }
    return split;
})

let startPosition = 0
let startSplit = 0

function dragStart(e) {
    state.dragging = true
    startPosition = isVertical.value ? e.pageY : e.pageX
    startSplit = boundSplit.value
}

function dragMove(e) {
    if (state.dragging) {
        const position = isVertical.value ? e.pageY : e.pageX
        const dp = position - startPosition
        state.split = startSplit + dp;
    }
}

function dragEnd() {
    state.dragging = false
}



</script>
<style scoped>
.split-pane {
    display: flex;
    height: 100%;
    position: relative;
}

.split-pane.dragging {
    cursor: ew-resize;
}

.dragging .left,
.dragging .right {
    pointer-events: none;
}

.left {
    position: relative;
    height: 100%;
    border-right: 1px solid #D4D7DE;
}

.right {
    position: relative;
    height: 100%;
    /* max-width: calc(50%); */
    flex: 1;
}


.left {
    border-right: 1px solid #D4D7DE;
}

.dragger {
    position: absolute;
    z-index: 3;
    top: 0;
    bottom: 0;
    right: -5px;
    width: 10px;
    cursor: ew-resize;
}

/* vertical */
@media (min-width: 721px) {
    .split-pane.vertical {
        display: block;
    }

    .split-pane.vertical.dragging {
        cursor: ns-resize;
    }

    .vertical .dragger {
        top: auto;
        height: 10px;
        width: 100%;
        left: 0;
        right: 0;
        bottom: -5px;
        cursor: ns-resize;
    }

    .vertical .left,
    .vertical .right {
        width: 100%;
    }

    .vertical .left {
        border-right: none;
        border-bottom: 1px solid var(--border);
    }
}

/* mobile */
@media (max-width: 720px) {

    .left,
    .right {
        width: 100% !important;
        height: 100% !important;
    }

    .dragger {
        display: none;
    }

    .split-pane .toggler {
        display: block;
    }

    .split-pane .right {
        display: none;
    }

    .split-pane.show-output .right {
        display: block;
    }

    .split-pane.show-output .left {
        display: none;
    }
}
</style>
