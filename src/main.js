import { createApp } from 'vue'
import { createPinia } from 'pinia'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import zhCn from 'element-plus/es/locale/lang/zh-cn'

import App from './App.vue'
import router from './router'

const app = createApp(App)
const pinia = createPinia()

// 检测本地存储中的主题设置
const savedTheme = localStorage.getItem('theme')
const isDark = savedTheme === 'dark'

app.use(pinia)
app.use(router)
app.use(ElementPlus, {
  locale: zhCn,
  // 配置Element Plus的深色模式
  dark: isDark
})

for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}

app.mount('#app')
