import Vue from 'vue'
import App from './App.vue'
import router from './router'

// 导入全局样式
import './assets/css/common.css'
// 导入axios
import axios from 'axios'
// 配置请求的根路径
axios.defaults.baseURL='https://www.liulongbin.top:8888/api/private/v1/'
// 请求拦截器，为有权限的api挂载token令牌
axios.interceptors.request.use(config=>{
  config.headers.Authorization=window.sessionStorage.getItem('token')
  return config//必须return config
})
// 将axios挂载到vue原型链上
Vue.prototype.$http=axios

// 导入element-ui及样式
import ElementUI from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';
// 注册element-ui
Vue.use(ElementUI)
//导入 vue-table-with-tree-grid
import TreeTable from 'vue-table-with-tree-grid'
Vue.component('tree-table',TreeTable)


Vue.config.productionTip = false

// 格式化时间
Vue.filter('dateFormat',function(originVal){
  const dt=new Date(originVal)

  const y=dt.getFullYear()
  const m=(dt.getMonth()+1+'').padStart(2,'0')
  const d=(dt.getDate()+'').padStart(2,'0')
  const hh=(dt.getHours()+'').padStart(2,'0')
  const mm=(dt.getMinutes()+'').padStart(2,'0')
  const ss=(dt.getSeconds()+'').padStart(2,'0')

    return `${y}-${m}-${d} ${hh}:${mm}:${ss}`
})

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
