<template>
  <div>
        <!-- 面包屑导航区域 -->
     <el-breadcrumb separator-class="el-icon-arrow-right">
        <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
        <el-breadcrumb-item>权限管理</el-breadcrumb-item>
        <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图区域 -->
    <el-card>
        <!-- 添加角色按钮区域 -->
        <el-row>
            <el-col>
                <el-button type="primary">添加角色</el-button>
            </el-col>
        </el-row>
        <!-- 角色列表展示区域 -->
        <el-table :data="rolesList" border stripe>
            <!-- 展开列 -->
             <el-table-column type="expand">
                 <template slot-scope="scope">
                     <el-row 
                        :class="['bdbottom',i1===0?'bdtop':'','vcenter']"
                        v-for="(item1,i1) in scope.row.children" :key="item1.id">
                         <!-- 渲染一级权限 -->
                         <el-col :span="5">
                             <el-tag 
                                    closable
                                    @close='removeRightById(scope.row,item1.id)'>{{item1.authName}}</el-tag>
                             <i class="el-icon-caret-right"></i>
                         </el-col>
                         <!-- 渲染二级，三级权限 -->
                         <el-col :span="19">
                              <!-- 通过for循环嵌套渲染二级权限 -->
                             <el-row :class="[i2==0?'':'bdtop','vcenter']" v-for='(item2,i2) in item1.children' :key="item2.id">
                                 <!-- 二级权限 -->
                                 <el-col :span="6">
                                     <el-tag type="success"  
                                        closable
                                        @close='removeRightById(scope.row,item2.id)'>{{item2.authName}}</el-tag>
                                     <i class="el-icon-caret-right"></i>
                                 </el-col>
                                  <!-- 三级权限 -->
                                 <el-col :span="18">
                                     <el-tag 
                                        type="warning" 
                                        closable
                                        @close='removeRightById(scope.row,item3.id)'
                                        v-for="(item3,i3) in item2.children" 
                                        :key='item3.id'>
                                        {{item3.authName}}
                                     </el-tag>
                                 </el-col>
                             </el-row>
                         </el-col>
                     </el-row>
                     <!-- <pre>
                          {{scope.row}}
                     </pre> -->
                    
                 </template>
             </el-table-column>
            <!-- 索引列 -->  
            <el-table-column type="index"></el-table-column>
            <el-table-column label="角色名称" prop="roleName"></el-table-column>
            <el-table-column label="角色描述" prop="roleDesc"></el-table-column>
            <el-table-column label="操作"  >
                <template slot-scope="scope">
                    <el-button size="mini" type="primary" icon="el-icon-edit">编辑</el-button>
                    <el-button size="mini" type="danger" icon="el-icon-delete">删除</el-button>
                    <el-button size="mini" type="warning" icon="el-icon-setting" @click="showSetRightDialog(scope.row)">分配权限</el-button>
                </template>
            </el-table-column>
        </el-table>
    </el-card>

    <!-- 分配权限的对话框 -->
    <el-dialog title="分配权限" 
    @close='setRightDialogClosed'
    :visible.sync="setRightDialogVisible" width="50%">
         <!-- 对话框主体区域 -->
         <el-tree 
         ref="treeRef"
         :data="rightsList" 
         :props="treeProps" 
         :default-checked-keys="leafKeys"
         node-key="id"
         default-expand-all
         show-checkbox></el-tree>
         <!-- 对话框底部区域 -->
            <span slot="footer" class="dialog-footer">
                <el-button @click="setRightDialogVisible= false">取 消</el-button>
                <el-button type="primary"  @click="allotRights" >确 定</el-button>
            </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
    data(){
        return {
            // 角色列表数据
            rolesList:[],
            // 控制分配权限对话框的显示与隐藏
            setRightDialogVisible:false,
            // 所有权限的数据
            rightsList:[],
            // 树形控件的属性绑定对象
            treeProps:{
                label:'authName',
                children:'children'
            },
            // 默认选中的节点id数组
           leafKeys:[],
            //即将分配权限的角色id
            roleId:''    
        }
    },
    created(){
        // 调用获取角色列表的函数
        this.getRolesList()
    },
    methods:{
         // 获取角色列表
       async getRolesList(){
          const {data:res} = await this.$http.get('roles')
        //   console.log(res)
        if(res.meta.status!==200){
            this.$message.error('获取角色列表失败')
        }
        // 否则，获取角色列表成功，将其放进data响应式系统中
        this.rolesList=res.data
        // console.log('获取角色成功')
        },
        // 根据id删除对应的权限
       async removeRightById(role,rightId){
            // 弹框提示用户是否删除
          const confirmResult= await this.$confirm('是否删除该用户权限？','提示',{
                confirmButtonText:'确认',
                cancelButtonText:'取消',
                type:'warning'
            }).catch(err=>err)
            if(confirmResult!=='confirm'){
                return this.$message.info('取消了删除')
            }
          const {data:res} = await this.$http.delete(`roles/${role.id}/rights/${rightId}`)
        //   console.log(res)
            if(res.meta.status!==200){
                return this.$message.error('删除权限失败')
            }
            // this.getRolesList() 会重新渲染整个表格
            role.children=res.data //将改变的权限重新赋值
        },
        // 展示分配权限的对话框
       async showSetRightDialog(role){
        //    得到即将分配权限的角色id，并将其放在data中
           this.roleId=role.id
            // 获取所有权限数据
         const {data:res} = await this.$http.get('rights/tree')
         if(res.meta.status!==200){
             return this.$message.error('获取权限数据失败')
         }
        //  获取权限列表数据成功，并将其放进data中
         this.rightsList=res.data
        //  console.log(this.rightsList)
        // 递归获取3级节点的id
        // console.log(this.leafKeys)
            this.getLeafKeys(role,this.leafKeys) 
            // 显示分配权限对话框
            this.setRightDialogVisible=true
        },
        // 通过递归的方式，获取角色下所有3级权限的id，并将其保存到LeafKeys数组中
        getLeafKeys(node,arr){
            // 如果当前node不包含children属性，则是3级节点
            if(!node.children){
                return arr.push(node.id)
            }
            // 如果当前node不是3级节点，则递归调用自己
            node.children.forEach(item =>this.getLeafKeys(item,arr))
        },
        // 监听 分配权限对话框关闭事件
        setRightDialogClosed(){
            this.leafKeys=[]
        },
        // 为角色 分配权限
       async allotRights(){
            // 全选及半选按钮的id
            const keys=[...this.$refs.treeRef.getCheckedKeys(),...this.$refs.treeRef.getHalfCheckedKeys()]
            // console.log(keys)
            const idStr=keys.join(',')  //将其拼接为以，分隔的字符串
            // console.log(idStr)
            const {data:res}=await this.$http.post(`roles/${this.roleId}/rights`,{rids:idStr})
            if(res.meta.status!==200){
                this.$message.error('分配权限失败')
            }
            this.$message.success('分配权限成功')
            // 重新获取
            this.getRolesList()
            // 隐藏分配权限的对话框
            this. setRightDialogVisible=false
        }

    }
}
</script>

<style>
.el-tag{
    margin: 7px;
}
.bdtop{
    border-top: 1px solid #eee;
}
.bdbottom{
    border-bottom: 1px solid #eee;
}
.vcenter{
    display: flex;
    align-items: center;
}
</style>