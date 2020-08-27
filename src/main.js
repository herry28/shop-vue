import Vue from 'vue'
import App from './App.vue'
import router from './router'

// 导入全局样式
import './assets/css/common.css'
// 导入axios
import axios from 'axios'
// 配置请求的根路径
axios.defaults.baseURL='https://www.liulongbin.top:8888/api/private/v1/'
// 将axios挂载到vue原型链上
Vue.prototype.$http=axios

// 导入element-ui及样式
import ElementUI from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';
// 注册element-ui
Vue.use(ElementUI)


Vue.config.productionTip = false

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
