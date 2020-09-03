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
                    <el-table-column type="expand"></el-table-column>
                    <!-- 索引列 -->
                    <el-table-column type="index"></el-table-column>
                    <el-table-column label="参数名称" prop="attr_name"></el-table-column>
                    <el-table-column label="操作">
                        <template slot-scope="scope">
                            <el-button type="primary" icon="el-icon-edit" size="mini">编辑</el-button>
                        <el-button type="danger" icon="el-icon-delete" size="mini">删除</el-button>
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
                                <el-button type="primary" icon="el-icon-edit" size="mini">编辑</el-button>
                            <el-button type="danger" icon="el-icon-delete" size="mini">删除</el-button>
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
            label-width="50%">
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
</style>