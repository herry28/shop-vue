import Vue from 'vue'
import VueRouter from 'vue-router'

// 导入路由组件
import Login from '../components/Login.vue'
import Home from '../components/Home.vue'
import Welcome from '../components/Welcome.vue'
import User from '../views/users/User.vue'
import Right from '../views/powers/Right.vue'
import Role from '../views/powers/Role.vue'
import Cate from '../views/goods/Cate.vue'

Vue.use(VueRouter)

  const routes = [
    {path:'/',redirect:'/login'},
    {path:'/login',component:Login},
    {
      path:'/home',
      component:Home,
      redirect:'/welcome',
      children:[
        {
          path:'/welcome',
          component:Welcome
        },
        {
          path:'/users',
          component:User
        },
        {
          path:'/rights',
          component:Right
        },
        {
          path:'/roles',
          component:Role
        },
        {
          path:'/categories',
          component:Cate
        },

    ]}
]

const router = new VueRouter({
  routes
})

// 挂载路由导航守卫
router.beforeEach((to,from,next)=>{
  // 登录页面直接next()
  if(to.path=='/login') return next()
  // 其他页面，需获取token
  const token=window.sessionStorage.getItem('token')
  // 无token时强制跳转到登录页面
  if(!token) return next('/login')
  next()
})

export default router
