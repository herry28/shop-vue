<template>
  <div>
      <!-- 面包屑导航区域 -->
     <el-breadcrumb separator-class="el-icon-arrow-right">
        <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
        <el-breadcrumb-item>用户管理</el-breadcrumb-item>
        <el-breadcrumb-item>用户列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图区域 -->
    <el-card>
        <!-- 搜索与添加区域 -->
        <el-row :gutter="20">
            <el-col :span="9">
                <el-input placeholder="请输入内容">
                    <el-button slot="append" icon="el-icon-search"></el-button>
                </el-input>
            </el-col>
            <el-col :span="4">
                <el-button type="primary">添加用户</el-button>
            </el-col>
        </el-row>
        <!-- 用户列表区域 -->
        <el-table :data="userList" border stripe>
            <el-table-column type="index"></el-table-column>
            <el-table-column label="姓名" prop="username"></el-table-column>
            <el-table-column label="邮箱" prop="email"></el-table-column>
            <el-table-column label="电话" prop="mobile"></el-table-column>
            <el-table-column label="角色" prop="role_name"></el-table-column>
            <el-table-column label="状态">
                <template slot-scope="scope">
                    <el-switch v-model="scope.row.mg_state"></el-switch>
                </template>
            </el-table-column>
            <el-table-column label="操作">
                 <template slot-scope="scope">
                   <el-button type="primary" icon="el-icon-edit" size="mini"></el-button>
                    <el-button type="danger" icon="el-icon-delete" size="mini"></el-button>
                    <el-tooltip effect="dark" content="分配角色" placement="top" :enterable="false">
                        <el-button type="warning" icon="el-icon-setting" size="mini"></el-button>
                    </el-tooltip>     
                </template>
            </el-table-column>
          </el-table>
            <!-- 页码区域 -->
            <el-pagination
                @size-change="handleSizeChange"
                @current-change="handleCurrentChange"
                :current-page="queryInfo.pagenum"
                :page-sizes="[1, 2, 5, 10]"
                :page-size="queryInfo.pagesize"
                layout="total, sizes, prev, pager, next, jumper"
                :total="total">
            </el-pagination>
           
      
    </el-card>
  </div>
</template>

<script>
export default {
    data(){
        return{
            // 请求参数
            queryInfo:{
                query:'',
                // 当前的页数
                pagenum:1,
                // 当前每页显示多少条数据
                pagesize:2
            },
            // 用户列表数据
            userList:[],
            // 总的用户数
            total:0
        }
    },
    created(){
        this.getUserList()
    },
    methods:{
        // 获取用户列表数据
       async getUserList(){
           const {data:res}= await this.$http.get('users',{params:this.queryInfo})
           console.log(res)
           if(res.meta.status!==200){
               return this.$message.error('获取用户列表失败！')
           }
           this.userList=res.data.users
           this.total=res.data.total
        //    console.log(this.total)
        },
         // 监听pagesize改变
    handleSizeChange(newSize){
        // console.log(newSize)
        this.queryInfo.pagesize=newSize
        this.getUserList()
    },
     // 监听页码值 改变
    handleCurrentChange(newPage){
        //  console.log(newPage)
         this.queryInfo.pagenum=newPage
         this.getUserList()
    }
    },
   
}
</script>

<style>
.el-breadcrumb{
    margin-bottom: 15px;
    font-size: 12px;
}
.el-card{
    box-shadow: 0 1px 1px rgba(0,0,0,.15)!important;
}
.el-table{
    margin-top: 15px;
    font-size: 12px;
}
.el-pagination{
    margin-top: 15px;
}
</style>