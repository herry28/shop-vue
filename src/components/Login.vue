<template>
  <div class='login-container'>
      <!-- 登录盒子区域 -->
      <div class="login-box">
          <!-- 头像区域 -->
          <div class="avatar-box">
              <img src="../assets/logo.jpg" alt="">
          </div>
          <!-- 登录表单区域 ：model：绑定表单数据 :rules:绑定校验规则对象-->
          <el-form  ref='loginFormRef' :model="loginForm" :rules="loginFormRules" class="login-form">
              <!-- 用户名  prefix-icon前置icon-->
              <el-form-item prop="username">
                  <el-input v-model="loginForm.username" prefix-icon="el-icon-user-solid"></el-input>
              </el-form-item>
              <!-- 密码 -->
              <el-form-item prop="password"> 
                  <el-input v-model="loginForm.password" prefix-icon="el-icon-lock" type="password"></el-input>
              </el-form-item>
              <!-- 按钮区域 -->
              <el-form-item class="btns">
                  <el-button type="primary" @click="login">登录</el-button>
                  <el-button type="info" @click='resetLoginForm'>重置</el-button>
              </el-form-item>
          </el-form>
      </div>
  </div>
</template>

<script>
export default {
    data(){
        return{
            // 登录表单的数据绑定对象
            loginForm:{
                username:'admin',
                password:'123456'
            },
            // 登录表单的验证规则对象
            loginFormRules:{
                // 验证用户名是否合法
                username:[
                    {required:true,message:'请输入用户名',trigger:'blur'},
                    {min:3,max:10,message:'长度在3-10个字符',trigger:'blur'}
                ],
                // 验证密码是否合法
                password:[
                    {required:true,message:'请输入密码',trigger:'blur'},
                    {min:6,max:15,message:'长度在6-15个字符',trigger:'blur'}
                ]
            }
        }
    },
    methods:{
        // 重置表单数据
        resetLoginForm(){
            this.$refs.loginFormRef.resetFields()
        },
        // 表单的预验证
        login(){
            this.$refs.loginFormRef.validate(async valid=>{
                if(!valid) return
                // 发起登录请求，将data结构赋值
                const {data:res}= await this.$http.post('login',this.loginForm)
                if(res.meta.status !== 200) return this.$message.error('登录失败')
                this.$message.success('登录成功')
                // 登录成功后需将token保存到sessionStorage
                  console.log(res)
                window.sessionStorage.setItem('token',res.data.token)
                // 通过编程式导航跳转到后台主页，路由地址/home
                this.$router.push('/home')
                
            })
        }
    }
}
</script>

<style scoped>
.login-container{
    background-color: #2b4b6b;
    height: 100%;
}
.login-box{
    width: 450px;
    height: 300px;
    background-color: #fff;
    border-radius: 3px;
    position: absolute;
    left: 50%;
    top:50%;
    transform: translate(-50%,-50%);
}
.avatar-box{
    width: 150px;
    height: 150px;
    border-radius: 50%;
    overflow: hidden;
    position: absolute;
    left: 50%;
    transform: translate(-50%,-50%);
}
.avatar-box img{
    width: 100%;
    height: 100%;
}
.login-form{
    position: absolute;
    bottom: 0;
    width: 100%;
    padding: 0 20px;
    box-sizing: border-box;
}
.btns{
    display: flex;
    justify-content: flex-end;
}
</style>>

