import Vue from 'vue'
import VueRouter from 'vue-router'
// import Login from '../components/Login'
const Login = () => import(/* webpackChunkName:"login_home_welcome" */ '../components/Login.vue')
// import Home from '../components/Home'
const Home = () => import(/* webpackChunkName:"login_home_welcome" */ '../components/Home.vue')
// import Welcome from '../components/Welcome'
const Welcome = () => import(/* webpackChunkName:"login_home_welcome" */ '../components/Welcome.vue')
// import Users from '../components/user/Users'
const Users = () => import(/* webpackChunkName:"user" */ '../components/user/Users.vue')
// import List from '../components/goods/List'
const List = () => import(/* webpackChunkName:"list_add" */ '../components/goods/List')
// import Add from '../components/goods/Add'
const Add = () => import(/* webpackChunkName:"list_add" */ '../components/goods/Add')
// import Report from '../components/report/Report'
const Report = () => import(/* webpackChunkName:"report" */ '../components/report/Report')
// import Messages from '../components/message/Messages'
const Messages = () => import(/* webpackChunkName:"messages" */ '../components/message/Messages')

Vue.use(VueRouter)

const routes = [
  { path: '/', redirect: '/login' },
  { path: '/login', component: Login },
  {
    path: '/home',
    component: Home,
    redirect: '/welcome',
    children: [
      { path: '/welcome', component: Welcome },
      { path: '/users', component: Users },
      { path: '/goods', component: List },
      { path: '/goods/add', component: Add },
      { path: '/reports', component: Report },
      { path: '/message', component: Messages }
    ]
  }
]

const router = new VueRouter({
  routes
})

router.beforeEach((to, from, next) => {
  if (to.path === '/login') {
    return next()
  }
  // 获取token
  const tokenStr = window.sessionStorage.getItem('token')
  if (!tokenStr) {
    return next('/login')
  }
  next()
})

export default router
