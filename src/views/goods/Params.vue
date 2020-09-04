<template>
  <div>
       <!-- 面包屑导航区域 -->
     <el-breadcrumb separator-class="el-icon-arrow-right">
        <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
        <el-breadcrumb-item>商品管理</el-breadcrumb-item>
        <el-breadcrumb-item>分类参数</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图区域 -->
    <el-card>
        <!-- 警告区域 -->
        <el-alert 
        :closable="false"
        show-icon
        type='warning' 
        title='注意：只允许为第三级分类设置相关参数！'>
        </el-alert>
        <!-- 选择商品分类区域 -->
        <el-row class="cat-opt">
            <el-col>
                <span>选择商品分类:</span>
                <!-- 选择商品分类的级联选择框 -->
                <el-cascader
                expand-trigger="hover"
                v-model="selectedCateKeys"
                @change="handleCateChange"
                :props="cateProps"
                :options="cateList">
                </el-cascader>
            </el-col>
        </el-row>
        <!-- tabs标签页区域 -->
        <el-tabs v-model="activeName" @tab-click='handleTabClick'>
            <!-- 添加动态参数面板 -->
            <el-tab-pane label="动态参数" name="many">
                <!-- 添加参数按钮 -->
                <el-button  @click="addDialogVisible=true" :disabled="isBtnDisabled" type="primary" size="mini">添加动态参数</el-button>
                <!-- 动态参数表格 -->
                <el-table :data="manyTableData" border stripe>
                    <!-- 展开行 -->
                    <el-table-column type="expand">
                        <template slot-scope="scope">
                            <!-- 循环渲染tag标签 -->
                            <el-tag @close='handleTagClosed(i,scope.row)' v-for="(item,i) in scope.row.attr_vals" :key="i" closable>{{item}}</el-tag>
                            <!-- 新增tag标签的文本输入框 -->
                            <el-input class="input-new-tag" size="mini"
                                ref="saveTagInputRef"
                                @keyup.enter.native="handleInputConfirm(scope.row)"
                                @blur="handleInputConfirm(scope.row)"
                                v-model="scope.row.inputValue"
                                v-if="scope.row.inputVisible">
                            </el-input>
                            <!-- 添加按钮 -->
                            <el-button v-else class="button-new-tag" size="mini" @click="showInput(scope.row)">
                                new tag
                            </el-button>
                        </template>
                    </el-table-column>
                    <!-- 索引列 -->
                    <el-table-column type="index"></el-table-column>
                    <el-table-column label="参数名称" prop="attr_name"></el-table-column>
                    <el-table-column label="操作">
                        <template slot-scope="scope">
                            <el-button @click='showEditDialog(scope.row.attr_id)' type="primary" icon="el-icon-edit" size="mini">编辑</el-button>
                        <el-button @click='removeParams(scope.row.attr_id)' type="danger" icon="el-icon-delete" size="mini">删除</el-button>
                        </template>                 
                    </el-table-column>
                </el-table>
            </el-tab-pane>
            <!-- 添加静态属性面板 -->
            <el-tab-pane label="静态属性" name="only">
                <!-- 添加属性按钮 -->
                  <el-button @click="addDialogVisible=true" :disabled="isBtnDisabled" type="primary" size="mini">添加静态属性</el-button>
                      <!-- 静态参数表格 -->
                    <el-table :data="onlyTableData" border stripe>
                        <!-- 展开行 -->
                        <el-table-column type="expand"></el-table-column>
                        <!-- 索引列 -->
                        <el-table-column type="index"></el-table-column>
                        <el-table-column label="参数名称" prop="attr_name"></el-table-column>
                        <el-table-column label="操作">
                            <template slot-scope="scope">
                                <el-button  @click='showEditDialog(scope.row.attr_id)' type="primary" icon="el-icon-edit" size="mini">编辑</el-button>
                            <el-button @click='removeParams(scope.row.attr_id)' type="danger" icon="el-icon-delete" size="mini">删除</el-button>
                            </template>                 
                        </el-table-column>
                    </el-table>
            </el-tab-pane>
        </el-tabs>
    </el-card>

    <!-- 添加参数的对话框 -->
    <el-dialog :title="'添加'+titleText"
        @close='addDialogClosed'
        :visible.sync="addDialogVisible"
        width="50%">
        <!-- 添加参数的表单区域 -->
        <el-form 
            ref="addFormRef"
            :model="addForm" 
            :rules="addFormRules"
            label-width="100px">
            <el-form-item :label="titleText" prop="attr_name">
                <el-input v-model="addForm.attr_name"></el-input>
            </el-form-item>
        </el-form>
        <!-- 添加参数的底部区域 -->
        <span slot="footer" class="dialog-footer">
            <el-button @click="addDialogVisible=false">取消</el-button>
            <el-button type="primary" @click="addParams">确认</el-button>
        </span>
    </el-dialog>

    <!-- 编辑参数的对话框 -->
    <el-dialog :title="'编辑'+titleText"
        @close='editDialogClosed'
        :visible.sync="editDialogVisible"
        width="50%">
        <!-- 添加参数的表单区域 -->
        <el-form 
            ref="editFormRef"
            :model="editForm" 
            :rules="editFormRules"
            label-width="100px">
            <el-form-item :label="titleText" prop="attr_name">
                <el-input v-model="editForm.attr_name"></el-input>
            </el-form-item>
        </el-form>
        <!-- 添加参数的底部区域 -->
        <span slot="footer" class="dialog-footer">
            <el-button @click="editDialogVisible=false">取消</el-button>
            <el-button type="primary" @click="editParams">确认</el-button>
        </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
    data(){
        return {
            // 商品分类列表
            cateList:[],
            // 级联选择框的配置对象
            cateProps:{
                value:'cat_id',
                label:'cat_name',
                children:'children'
            },
            // 级联选择框双向绑定到的数据
            selectedCateKeys:[],
            // 被激活的标签页名字
            activeName:'many',
            // 动态参数数据
            manyTableData:[],
            // 静态属性数据
            onlyTableData:[],

            // 控制添加对话框的显示与隐藏
            addDialogVisible:false,
            // 添加参数的表单对象
            addForm:{
               attr_name:''
            },
            // 添加参数的表单验证规则对象
            addFormRules:{
                attr_name:[
                    {required:true,message:'请输入参数名称',blur:'trigger'}
                ]
            },

            // 控制编辑对话框的显示与隐藏
            editDialogVisible:false,
              // 编辑参数对话框的表单对象
            editForm:{

            },
              // 添加编辑参数对话框的表单验证规则对象
             editFormRules:{
                attr_name:[
                    {required:true,message:'请输入参数名称',blur:'trigger'}
                ]
            },

            // // 控制新增tag标签的文本输入框与button的切换
            // inputVisible:false,
            // // 新增tag标签的文本输入框双向绑定的值
            // inputValue:''
        }
    },
    created(){
        this.getCateList()
    },
    methods:{
        // 获取所有商品分类列表
       async getCateList(){
         const {data:res} =await this.$http.get('categories')
         if(res.meta.status!==200){
             this.$message.error('获取商品分类数据失败')
         }
         this.cateList=res.data
        //  console.log(this.cateList)
        },

        // 当级联选择框选中项发生变化时会触发此函数
       async handleCateChange(){
            this.getParamsListData()
        },

        // 监听tabs标签页改变事件
        handleTabClick(){
            this.getParamsListData()
            // console.log(this.activeName)
        },
        // 获取面板参数列表数据
        async getParamsListData(){
            // 证明选择的不是3级分类
            if(this.selectedCateKeys.length!==3){
                this.selectedCateKeys=[]
                this.manyTableData=[]
                this.onlyTableData=[]
                return
            }
            // 证明选择的是3级分类
            // console.log(this.selectedCateKeys)
            // 根据所选分类的id和所处的面板获取对应的数据
            const {data:res} = await this.$http.get(`categories/${this.cateId}/attributes`,{params:{sel:this.activeName}})
        //   console.log(res)
            if(res.meta.status!==200){
                return this.$message.error('获取面板参数数据失败')
            }
            // this.$message.success('获取面板参数数据成功')
            // console.log(res.data)
            res.data.forEach(item=>{
                item.attr_vals=item.attr_vals?item.attr_vals.split(' '):[]
                // 控制文本框的显示与隐藏（提供每行自己的数据）
                item.inputVisible=false
                // 文本框绑定的值
                item.inputValue=''
                })
            // console.log(res.data)
            if(this.activeName==='many'){
                this.manyTableData=res.data
            }else{
                this.onlyTableData=res.data
            }
        },

        // 监听 添加参数对话框的关闭事件
        addDialogClosed(){
            this.$refs.addFormRef.resetFields()
        },
        // 点击按钮，添加参数
        addParams(){
            this.$refs.addFormRef.validate(async valid=>{
                if(!valid) return
                const {data:res} =await this.$http.post(`categories/${this.cateId}/attributes`,{
                    attr_name:this.addForm.attr_name,
                    attr_sel:this.activeName
                })
                if(res.meta.status!==201){
                    return this.$message.error('添加参数失败')
                }
                this.$message.success('添加参数成功')
                this.addDialogVisible=false
                this.getParamsListData()
            })
        },
        
        //点击编辑按钮，弹出编辑参数的对话框 
       async showEditDialog(attr_id){
            // 查询当前参数的名称
            const {data:res} = await  this.$http.get(`categories/${this.cateId}/attributes/${attr_id}`,{params:{attr_sel:this.activeName}})
            if(res.meta.status!==200){
                return this.$message.error('获取参数信息失败')
            }
            this.editForm=res.data
           this.editDialogVisible=true
        },
        // 监听 编辑参数对话框的关闭事件
        editDialogClosed(){
            this.$refs.editFormRef.resetFields()
        },
        // 点击按钮，提交编辑的参数
      editParams(){
            this.$refs.editFormRef.validate(async valid=>{
                if(!valid) return 
              const {data:res}= await this.$http.put(`categories/${this.cateId}/attributes/${this.editForm.attr_id}`,{attr_name:this.editForm.attr_name,attr_sel:this.activeName})
            //   console.log(res)
              if(res.meta.status!==200){
                  return this.$message.error('修改参数失败')
              }
              this.$message.success('修改参数成功')
              this.getParamsListData()
              this.editDialogVisible=false
            })
        },

        // 根据id删除参数
      async removeParams(attr_id){
             // 弹框询问是否删除参数
        const confirmResult=await this.$confirm('是否删除该参数？','提示',{
            confirmButtonText:'确定',
            cancelButtonText:'取消',
            type:'warning'
        }).catch(err=>err)
        // console.log(confirmResult) 
        // 如果用户确认删除，则confirmResult为confirm
        // 如果用户取消删除，则confirmResult为cancel
        if(confirmResult!=='confirm'){
            return this.$message.info('用户已取消删除')
        }
        // 删除的业务逻辑
        const {data:res}=await this.$http.delete(`categories/${this.cateId}/attributes/${attr_id}`)
        console.log(res)
        if(res.meta.status!==200){
            return this.$message.error('删除参数列表失败')
        }
        this.$message.success('删除参数列表成功')
        this.getParamsListData()
        },

        // 文本框失去焦点或按下按钮都会触发
        async handleInputConfirm(row){
            if(row.inputValue.trim().length===0){
                row.inputValue=''
                row.inputVisible=false 
                return
            }
            // 如果没有return，则证明用户有输入内容，继续做后续处理
            row.attr_vals.push(row.inputValue.trim()) //将添加的值保存到attr_vals中
            row.inputValue=''
            row.inputVisible=false
            // 将操作保存到数据库中
            this.saveAttrVals(row)
          
        },
        // 点击按钮，显示文本输入框
        showInput(row){
            row.inputVisible=true
            // 文本框自动获得焦点
            this.$nextTick(()=>{
                this.$refs.saveTagInputRef.$refs.input.focus()
            })
        },
        // 将对attr_vals的操作保存到数据库
        async saveAttrVals(row){
              // 发起请求，保存这次操作
            const {data:res}=await this.$http.put(`categories/${this.cateId}/attributes/${row.attr_id}`,{
                attr_name:row.attr_name,
                attr_sel:row.attr_sel,
                attr_vals:row.attr_vals.join(' ')
            })
            if(res.meta.status!==200){
                return this.$message.error('修改参数tag失败')
            }
            this.$message.success('修改参数tag成功')
        },
        // 删除对应的tag标签项
        handleTagClosed(i,row){
            row.attr_vals.splice(i,1)
            // 将操作保存到数据库中
            this.saveAttrVals(row)
        }

    },
    computed:{
        // 如果按钮需要被禁用，则返回true，否则返回false
        isBtnDisabled(){
            if(this.selectedCateKeys.length!==3){
                return true
            }
            return false
        },
        // 当前选中的3级分类id
        cateId(){
            if(this.selectedCateKeys.length===3){
                return this.selectedCateKeys[2]
            }
            return null
        },
        // 添加参数对话框的标题
        titleText(){
            if(this.activeName==='many'){
                return '动态参数'
            }else{
                return '静态属性'
            }
        }
    }
}
</script>

<style>
    .cat-opt{
        margin: 15px 0;
        }
    .input-new-tag{
        width: 120px!important;
    }
</style>