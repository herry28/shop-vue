<template>
  <div>
       <!-- 面包屑导航区域 -->
     <el-breadcrumb separator-class="el-icon-arrow-right">
        <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
        <el-breadcrumb-item>商品管理</el-breadcrumb-item>
        <el-breadcrumb-item>商品分类</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图区域 -->
    <el-card>
        <!-- 添加分类区域 -->
        <el-row>
            <el-col>
                <el-button type="primary" @click="showAddCateDialog">添加分类</el-button>
            </el-col>
        </el-row>
        <!-- 商品分类表格区域 -->
        <tree-table 
           class="treeTable"
            :selection-type='false'
            :expand-type='false'
            show-index
            index-text='#'
            :show-row-hover='false'
            border
            :columns='columns'
            :data='cateList'>
            <!-- 是否有效 -->
            <template slot="isok" slot-scope="scope">
                <i v-if="scope.row.cat_deleted===false" class="el-icon-success" style="color:lightgreen;"></i>
                <i v-else class="el-icon-error" style="color:red;"></i>
            </template>
            <!-- 排序 -->
            <template slot="order" slot-scope="scope">
              <el-tag v-if="scope.row.cat_level===0" size='mini'>一级</el-tag>
              <el-tag v-else-if="scope.row.cat_level===0"  size='mini' type="success">二级</el-tag>
              <el-tag v-else size='mini' type="warning">三级</el-tag>
            </template>
            <!-- 操作 -->
            <template slot="opt" slot-scope="scope">
             <el-button type="primary" size="mini" icon="el-icon-edit">编辑</el-button>
             <el-button type="danger" size="mini" icon="el-icon-delete">删除</el-button>
            </template>
        </tree-table>
        <!-- 页码区域 -->
        <el-pagination
        :current-page="queryInfo.pagenum"
        :page-sizes='[2,5]'
        :page-size='queryInfo.pagesize'
        :total="total"
        layout="total,sizes,prev,pager,next,jumper"
        @current-change='handleCurrentChange'
        @size-change='handleSizeChange'>
        </el-pagination>
    </el-card>
    <!-- 添加分类的对话框区域 -->
    <el-dialog title="添加分类" label-width='100px'
        @close='addCateDialogClosed'
        :visible.sync="addCateDialogVisible">
        <!-- 添加分类的表单区域 -->
        <el-form :model='addCateForm' :rules="addCateFormRules" ref="addCateFormRef">
            <el-form-item label="分类名称" prop="cat_name">
                <el-input v-model="addCateForm.cat_name"></el-input>
            </el-form-item>
            <el-form-item label="父级分类" >
                <el-cascader expand-trigger="hover"
                clearable
                change-on-select
                v-model="selectedKeys"
                @change="parentCateChanged"
                :options="parentCateList" 
                :props="cascaderProps">
                </el-cascader>
            </el-form-item>
        </el-form>
        <!-- 底部区域 -->
        <span slot="footer" class="dialog-footer">
            <el-button @click="addCateDialogVisible=false">取消</el-button>
            <el-button @click="addCate" type="primary">确认</el-button>
        </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
    data(){
        return {
            // 获取商品分类数据的参数对象
            queryInfo:{
                type:3,
                pagenum:1,
                pagesize:5
            },
            // 保存商品分类数据的列表
            cateList:[],
            // 商品分类总条数
            total:0,
            // 为tree-table指定列的定义
            columns:[
                {
                    label:'分类名称',
                    prop:'cat_name'
                },
                {
                    label:'是否有效',
                    type:'template',
                    template:'isok'
                },
                {
                    label:'排序',
                    type:'template',
                    template:'order'
                },
                {
                    label:'操作',
                    type:'template',
                    template:'opt'
                },
            ],
            // 控制添加分类对话框的显示与隐藏
            addCateDialogVisible:false,
            // 添加分类的表单数据对象
            addCateForm:{
                // 将要添加分类的名称
                cat_name:'',
                // 父级分类的id
                cat_pid:0,
                // 分类的等级。默认添加的是1级分类
                cat_level:0
            },
             // 添加分类的表单验证规则对象
            addCateFormRules:{
                cat_name:[
                    {required:true,message:'请输入分类名称',triger:'blur'}
                ]
            },
            // 父级分类的数据
            parentCateList:[],
            // 指定级联选择器的配置对象
            cascaderProps:{
                value:'cat_id',
                label:'cat_name',
                children:'children'
            },
            // 选中的父级分类的id数组
            selectedKeys:[]

        }
    },
    created(){
        // 调用获取商品分类数据的函数
        this.getCateList()
    },
    methods:{
        // 获取商品分类数据的函数
        async getCateList(){
            const {data:res} = await this.$http.get('categories',{params:this.queryInfo})
            // console.log(res)
            // console.log(res.data)
            if(res.meta.status!==200){
                return this.$message.error('获取商品分类失败')
            }
            // 获取商品分类成功，并将其放在data中
            this.cateList=res.data.result
            this.total=res.data.total

        },
        // 监听pagesize的改变
        handleSizeChange(newSize){
            this.queryInfo.pagesize=newSize
            this.getCateList()
        },
         // 监听pagenum的改变
        handleCurrentChange(newNum){
            this.queryInfo.pagenum=newNum
            this.getCateList()
        },

        // 点击按钮，展示添加分类的对话框
        showAddCateDialog(){
            // 先获取父级分类数据
            this.getParentCateList()
            // 再显示添加分类的对话框
            this.addCateDialogVisible=true
        },
        // 获取父级分类的数据列表
       async getParentCateList(){
         const {data:res} = await this.$http.get('categories',{params:{type:2}})
        //  console.log(res.data)
        if(res.meta.status!==200){
            return this.$message.error('获取父级分类数据失败')
        }
        this.$message.success('获取父级分类数据成功')
        this.parentCateList=res.data
        },
        // 选择项发生变化时触发此函数
        parentCateChanged(){
            // 如果selectedKeys数组的长度大于0，则证明选中了父级分类
            if(this.selectedKeys.length>0){
                // 父级分类的id
                this.addCateForm.cat_pid=this.selectedKeys[this.selectedKeys.length-1]
                // 为当前分类的等级赋值
                this.addCateForm.cat_level=this.selectedKeys.length
                return
            }else{
                this.addCateForm.cat_pid=0
                this.addCateForm.cat_level=0
            }
        },
        // 点击按钮，添加新的分类
        addCate(){
            // console.log(this.addCateForm)
            // 1.预验证
            this.$refs.addCateFormRef.validate(async valid=>{
                if(!valid) return //验证没通过
                // 验证通过，发起请求
               const {data:res}=await this.$http.post('categories',this.addCateForm)
               if(res.meta.status!==201){
                   return this.$message.error('添加分类失败')
               }
               this.$message.success('添加分类成功')
               this.getCateList()
               this.addCateDialogVisible=false
            })
        },
        // 监听分类对话框的关闭事件
        addCateDialogClosed(){
            //重置表单
            this.$refs.addCateFormRef.resetFields()
            this.selectedKeys=[],
            this.addCateForm.cat_level=0
            this.addCateForm.cat_pid=0

        }
    }
}
</script>

<style>
.treeTable{
    margin-top: 15px;
}
.el-cascader{
    width: 100%;
}
</style>