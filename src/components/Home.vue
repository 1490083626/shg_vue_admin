<template>
  <el-container class="home-container">
    <!-- 头部区域 -->
    <el-header>
      <div>
        <img src="../assets/logo-s.png" alt="logo" style="margin-left:5px;" />
        <span class="text-white">韶院二手商品后台管理系统</span>
      </div>
      <el-button type="info" @click="logout">退出</el-button>
    </el-header>
    <!-- 页面主体区域 -->
    <el-container>
      <!-- 侧边栏 -->
      <el-aside :width="isCollapse ? '64px' : '200px'">
        <!-- 伸缩侧边栏按钮 -->
        <div class="toggle-button" @click="toggleCollapse">|||</div>
        <!-- 侧边栏菜单 -->
        <el-menu
          background-color="#333744"
          text-color="#fff"
          active-text-color="#409EFF"
          unique-opened
          :collapse="isCollapse"
          :collapse-transition="false"
          router
          :default-active="activePath"
        >
          <!-- 一级菜单 -->
          <el-submenu :index="item.id + ''" v-for="item in menuList" :key="item.id">
            <!-- 一级菜单模板 -->
            <template slot="title">
              <i :class="iconsObj[item.id]"></i>
              <span>{{item.authName}}</span>
            </template>
            <el-menu-item
              :index="'/'+subItem.path"
              v-for="subItem in item.children"
              :key="subItem.id"
              @click="saveNavState('/'+subItem.path)"
            >
              <i class="el-icon-menu"></i>
              <span>{{subItem.authName}}</span>
            </el-menu-item>
          </el-submenu>
        </el-menu>
      </el-aside>
      <el-main>
        <router-view></router-view>
      </el-main>
    </el-container>
  </el-container>
</template>
<script>
export default {
  data() {
    return {
      // 左侧菜单数据
      menuList: [
        {
          id: 125,
          authName: '用户管理',
          path: 'users',
          children: [
            {
              id: 110,
              authName: '用户列表',
              path: 'users',
              children: [],
              order: null
            }
          ],
          order: 1
        },

        {
          id: 101,
          authName: '商品管理',
          path: 'goods',
          children: [
            {
              id: 104,
              authName: '商品列表',
              path: 'goods',
              children: [],
              order: 1
            }
            // {
            //   id: 115,
            //   authName: '分类参数',
            //   path: 'params',
            //   children: [],
            //   order: 2
            // },
            // {
            //   id: 121,
            //   authName: '商品分类',
            //   path: 'categories',
            //   children: [],
            //   order: 3
            // }
          ],
          order: 2
        },
        {
          id: 103,
          authName: '留言管理',
          path: 'message',
          children: [
            {
              id: 112,
              authName: '留言列表',
              path: 'message',
              children: [],
              order: null
            }
          ],
          order: 3
        },
        {
          id: 145,
          authName: '数据统计',
          path: 'reports',
          children: [
            {
              id: 146,
              authName: '分类统计',
              path: 'reports',
              children: [],
              order: null
            }
          ],
          order: 5
        }
      ],
      iconsObj: {
        125: 'iconfont icon-user',
        103: 'iconfont icon-danju',
        101: 'iconfont icon-shangpin',
        145: 'iconfont icon-baobiao'
      },
      isCollapse: false,
      activePath: ''
    }
  },
  created() {
    // console.log('Home component created...')
    // this.getMenuList()
    this.activePath = sessionStorage.getItem('activePath')
  },
  methods: {
    logout() {
      window.sessionStorage.clear()
      this.$router.push('/login')
    },
    // async getMenuList() {
    //   const { data: res } = await this.$http.get('menus')
    //   if (res.meta.status !== 200) return this.$message.error(res.meta.msg)

    //   this.menuList = res.data
    //   console.log(res)
    // },
    toggleCollapse() {
      this.isCollapse = !this.isCollapse
    },
    saveNavState(path) {
      // 点击二级菜单的时候保存被点击的二级菜单信息
      window.sessionStorage.setItem('activePath', path)
      this.activePath = path
    }
  }
}
</script>
<style  lang="less" scoped>
.text-white {
  color: #ffffff;
}
.home-container {
  height: 100%;
}
.el-header {
  display: flex;
  justify-content: space-between;
  background-color: #373d41;
  padding-left: 0;
  align-items: center;
  font-size: 20px;
  > div {
    display: flex;
    align-items: center;
    span {
      margin-left: 15px;
    }
  }
}
.el-aside {
  background-color: #333744;
  .el-menu {
    border-right: none;
  }
  .toggle-button {
    background-color: #4a5064;
    font-size: 10px;
    line-height: 24px;
    color: #fff;
    text-align: center;
    letter-spacing: 0.2em;
    cursor: pointer;
  }
}
.el-main {
  background-color: #eaedf1;
}
.iconfont {
  margin-right: 10px;
}
</style>
