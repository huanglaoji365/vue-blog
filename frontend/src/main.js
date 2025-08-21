import { createApp } from 'vue'
import { createPinia } from 'pinia'
import ElementPlus from 'element-plus'
import GlobalUEditor from '@/components/GlobalUEditor.vue';
import 'element-plus/dist/index.css'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import lazyPlugin from "vue3-lazy";
import App from './App.vue'
import router from './router'
import './style.css'
import './styles/ruoyi.scss'
import loadingpic from "./assets/other/load.gif";
import errorpic from "./assets/other/404.png";

const app = createApp(App)
const pinia = createPinia() // 确保唯一

// 注册所有图标
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}

app.component('GlobalUEditor', GlobalUEditor); // 注册为全局组件

// 图片懒加载
app.use(lazyPlugin, {
  loading: loadingpic, // 加载时默认图片
  error: errorpic, // 图片失败时默认图片
});
app.use(pinia)
app.use(router)
app.use(ElementPlus)

app.mount('#app')
