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
                <el-input placeholder="请输入内容" v-model="queryInfo.query" clearable @clear='getUserList'> 
                    <el-button slot="append" icon="el-icon-search" @click="getUserList"></el-button>
                </el-input>
            </el-col>
            <el-col :span="4">
                <el-button type="primary" @click="addDialogVisible=true">添加用户</el-button>
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
                    <el-switch v-model="scope.row.mg_state" @change="userStateChanged(scope.row)"></el-switch>
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
    <!-- 添加用户的对话框 -->
        <el-dialog
            @close='addDialogClosed'
            title="添加用户"
            :visible.sync="addDialogVisible"
            width="50%">
            <!-- 对话框内容主题区域 -->
            <el-form ref="addUserFormRef" :model="addUserForm" :rules="addUserFormRules" label-width="70px">
                <el-form-item label='用户名' prop="username">
                    <el-input v-model="addUserForm.username"></el-input>
                </el-form-item>
                <el-form-item label='密码' prop="password">
                    <el-input v-model="addUserForm.password"></el-input>
                </el-form-item>
                <el-form-item label='邮箱' prop="email">
                    <el-input v-model="addUserForm.email"></el-input>
                </el-form-item>
                <el-form-item label='电话' prop="mobile">
                    <el-input v-model="addUserForm.mobile"></el-input>
                </el-form-item>
            </el-form>
            <!-- 对话框底部区域 -->
            <span slot="footer" class="dialog-footer">
                <el-button @click="addDialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="addUser">确 定</el-button>
            </span>
        </el-dialog>
  </div>
</template>

<script>
export default {
    data(){
        // 自定义验证邮箱的规则
        var checkEmail=(rule,value,callback)=>{
            // 验证邮箱的正则表达式
            const regEmail=/^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+(\.[a-zA-Z0-9_-])+/
            if(regEmail.test(value)){
                // 合法的邮箱
                return callback()
            }
            callback(new Error('请输入合法的邮箱'))
        }
        // 自定义验证手机的规则
        var checkMoblie=(rule,value,callback)=>{
            // 验证邮箱的正则表达式
            const regMobile=/^(0|86|17951)?(13[0-9]|15[0-9]|17[678]|18[0-9]|14[57])[0-9]{8}$/
            if(regMobile.test(value)){
                // 合法的手机
                return callback()
            }
            callback(new Error('请输入合法的手机'))
        }

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
            total:0,
            // 控制添加用户对话框的显示与隐藏
            addDialogVisible:false,
            // 添加用户的表单对象
            addUserForm:{
                username:'',
                password:'',
                email:'',
                mobile:''
            },
            // 添加用户的表单验证规则对象
            addUserFormRules:{
                username:[
                    {required:true,message:'请输入用户名',trigger:'blur'},
                    {min:3,max:10,message:'用户名长度为3-10个字符',trigger:'blur'}
                ],
                password:[
                    {required:true,message:'请输入密码',trigger:'blur'},
                    {min:6,max:15,message:'用户名长度为6-15个字符',trigger:'blur'}
                ],
                email:[
                    {required:true,message:'请输入邮箱',trigger:'blur'},
                    {validator:checkEmail,trigger:'blur'}
                ],
                mobile:[
                    {required:true,message:'请输入电话',trigger:'blur'},
                    {validator:checkMoblie,trigger:'blur'}
                ],

            }
        }
    },
    created(){
        this.getUserList()
    },
    methods:{
        // 获取用户列表数据
       async getUserList(){
           const {data:res}= await this.$http.get('users',{params:this.queryInfo})
        //    console.log(res)
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
    },
    // 监听switch开关状态的改变
    async userStateChanged(userInfo){
        // console.log(userInfo)
        const {data:res}=await this.$http.put(`users/${userInfo.id}/state/${userInfo.mg_state}`)
        if(res.meta.status!==200){
            userInfo.mg_state=!userInfo.mg_state
            return this.$message.error('更新用户状态失败');      
        }
        this.$message.success('更新用户状态成功')
    },
    // 监听 dialog对话框关闭事件
    addDialogClosed(){
        this.$refs.addUserFormRef.resetFields()
    },
    // 点击按钮，添加新用户
    addUser(){
        // 表单的预验证
        this.$refs.addUserFormRef.validate(async valid=>{
            // console.log(valid) 当valid为true时表校验通过
            if(!valid) return
            // 可以发起添加用户的网络请求
           const res1= await this.$http.post('users',this.addUserForm)
           console.log(res1)
           const {data:res}=await this.$http.post('users',this.addUserForm)
           if(res.meta.status!==200){
               this.$message.error('添加用户失败')
           }
           this.$message.success('添加用户成功')
            //藏添加用户的对话框
            this.addDialogVisible=false
            // 重新获取用户列表数据
            this.getUserList()
        })
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