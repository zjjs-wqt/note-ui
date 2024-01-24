import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import router from './router/index'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import store from './store/index';
import contextmenu from 'v-contextmenu';
import "v-contextmenu/dist/themes/default.css";
import zhCn from 'element-plus/es/locale/lang/zh-cn'
import useInterceptor from './useInterceptor.js'

const app = createApp(App)

app.config.globalProperties.$http = useInterceptor()

// 屏蔽黄色警告
app.config.warnHandler = () => null;

app.use(store)
app.use(router)
app.use(ElementPlus, {
  locale: zhCn,
})
app.use(contextmenu)
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}
app.mount('#app')
