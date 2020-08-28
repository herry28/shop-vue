<template>
    <!-- 布局容器 -->
    <el-container class="home-container">
            <!-- 头部区域 -->
        <el-header>
            <div>
                <img src="../assets/logo.png" alt="">
                <span>电商后台管理系统</span>
            </div>
            <el-button type='info' @click="logout">退出</el-button>
        </el-header>
        <!-- 页面主体区域 -->
        <el-container>
            <!-- 侧边栏 -->
            <el-aside :width="isCollapse?'64px':'200px'">
                <!-- 折叠菜单区域 -->
                <div class="toggle-button" @click="toggleCollapse">|||</div>
                <!-- 侧边栏菜单区域 -->
                <el-menu 
                router
                :default-active="activePath"
                unique-opened 
                :collapse="isCollapse"
                :collapse-transition="false"
                background-color="#333744" 
                text-color="#fff" 
                active-text-color="#409eff">
                    <!-- 一级菜单 -->
                    <el-submenu :index='item.id+""' v-for='item in menuList' :key='item.id'>
                        <!-- 一级菜单模板区域 -->
                        <template slot="title">
                            <!-- 图标 -->
                            <i :class="iconObj[item.id]"></i>
                            <!-- 文本 -->
                            <span>{{item.authName}}</span>
                        </template>
                        <!-- 二级菜单 -->
                        <el-menu-item 
                        :index='"/"+subItem.path' 
                        @click='saveNavState("/"+subItem.path)'
                        v-for="subItem in item.children" 
                        :key='subItem.id'>
                              <!-- 二级菜单模板区域 -->
                           <template slot="title">
                            <!-- 图标 -->
                            <i class="el-icon-menu"></i>
                            <!-- 文本 -->
                            <span>{{subItem.authName}}</span>
                        </template>
                        </el-menu-item>
                    </el-submenu>
                </el-menu>
            </el-aside>
            <!-- 右侧内容主体 -->
            <el-main>
                <router-view></router-view>
            </el-main>
        </el-container>
    </el-container>
</template>

<script>
export default {
    data(){
        return{
            // 左侧菜单数据
            menuList:[],
            // 一级菜单图标对象
            iconObj:{
                "125":"el-icon-s-custom",
                "103":"el-icon-lock",
                "101":"el-icon-goods",
                "102":"el-icon-s-order",
                "145":"el-icon-s-data",
            },
            // 菜单是否折叠
            isCollapse:'false',
            // 被激活的菜单
            activePath:''
        }
    },
    methods:{
        // 退出登录
        logout(){
            // 清空token
            window.sessionStorage.clear()
            // 跳转到登录页面
            this.$router.push('/login')
        },
        // 获取菜单数据
       async getMenuList(){
            const {data:res}= await this.$http.get('menus')
            // console.log(res)      
            // 请求不成功
            if(res.meta.status!==200) return this.$message.error(res.meta.msg);
            // 请求成功     
             this.menuList=res.data
        },
        // 点击按钮，切换菜单的折叠与展开
        toggleCollapse(){
            this.isCollapse=!this.isCollapse
        },
        // 保存链接的激活状态
        saveNavState(activeState){
            window.sessionStorage.setItem('activePath',activeState)
             this.activePath=activeState
        }
    },
    created(){
        // 获取菜单数据
        this.getMenuList()
        // 获取链接的激活状态
        this.activePath=window.sessionStorage.getItem('activePath')
       
    }
}
</script>

<style>
    .home-container{
        height: 100%;
    }
    .el-header{
        display: flex;
        justify-content: space-between;
        align-items: center;
        background-color: #373d41;
        font-size: 20px;
        color: #fff;
    }
    .el-header div{
        display: flex;
        align-items: center;
    }
    .el-header img{
        width: 60px;
        height: 60px;
    }
    .el-aside{
        background-color: #333744;
    }
    .el-aside .el-menu{
       border-right:none;
    }
    .toggle-button{
        background-color: #4a5064;
        font-size: 10px;
        line-height: 24px;
        color: #fff;
        text-align: center;
        letter-spacing: .2em;
        cursor: pointer;

    }
    .el-main{
        background-color: #eaedf1;
    }
    
</style>