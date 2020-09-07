<template>
    <div>
        <!-- 面包屑导航区域 -->
     <el-breadcrumb separator-class="el-icon-arrow-right">
        <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
        <el-breadcrumb-item>商品管理</el-breadcrumb-item>
        <el-breadcrumb-item>添加商品</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图区域 -->
    <el-card>
        <!-- 警告区域 -->
        <el-alert title="添加商品信息" type="info" center show-icon :closable="false"></el-alert>
        <!-- 步骤条区域 -->
        <el-steps :space="200" :active="activeIndex-0" finish-status="success" align-center>
            <el-step title="基本信息"></el-step>
            <el-step title="商品参数"></el-step>
            <el-step title="商品属性"></el-step>
            <el-step title="商品图片"></el-step>
            <el-step title="商品内容"></el-step>
            <el-step title="完成"></el-step>
        </el-steps>
        <!-- tab栏区域 -->
        <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="100px" label-position="top">
             <el-tabs v-model="activeIndex" 
             @tab-click='tabClicked'
             :tab-position="'left'" 
              :before-leave='beforeTabLeave'>
                <el-tab-pane label="基本信息" name="0">
                    <el-form-item label="商品名称" prop="goods_name">
                        <el-input v-model="addForm.goods_name"></el-input>
                    </el-form-item>
                    <el-form-item label="商品价格" prop="goods_price">
                        <el-input v-model="addForm.goods_price" type="number"></el-input>
                    </el-form-item>
                    <el-form-item label="商品重量" prop="goods_weight">
                        <el-input v-model="addForm.goods_weight" type="number"></el-input>
                    </el-form-item>
                    <el-form-item label="商品数量" prop="goods_number">
                        <el-input v-model="addForm.goods_number" type="number"></el-input>
                    </el-form-item>
                    <el-form-item label="商品分类" prop="goods_cat">
                       <el-cascader expand-trigger="hover"
                       @change="handleChange"
                        :options="cateList"
                        :props="cateProps"
                        v-model="addForm.goods_cat">
                       </el-cascader>
                    </el-form-item>
                </el-tab-pane>
                <el-tab-pane label="商品参数" name="1">
                    <!-- 渲染表单的item项 -->
                    <el-form-item v-for="item in manyTableData" :key="item.attr_id" :label="item.attr_name">
                        <!-- 复选框组 -->
                        <el-checkbox-group v-model="item.attr_vals">
                            <el-checkbox :label="cb" v-for='(cb,i) in item.attr_vals' :key="i" border></el-checkbox>
                        </el-checkbox-group>
                    </el-form-item>
                </el-tab-pane>
                <el-tab-pane label="商品属性" name="2">商品参数</el-tab-pane>
                <el-tab-pane label="商品图片" name="3">商品图片</el-tab-pane>
                <el-tab-pane label="商品内容" name="4">商品内容</el-tab-pane>
            </el-tabs>
        </el-form>   
    </el-card>
    </div>
</template>

<script>
export default {
    data(){
        return {
            // 被激活的步骤条索引
            activeIndex:'0',
            // 添加商品的表单数据对象
            addForm:{
                goods_name:'',
                goods_price:0,
                goods_weight:0,
                goods_number:0,
                // 商品所属的分类数组
                goods_cat:[]
            },
            // 添加商品的表单数据验证规则对象
            addFormRules:{
                 goods_name:[
                     {required:true,message:'请输入商品名称',trigger:'blur'}
                 ],
                 goods_price:[
                     {required:true,message:'请输入商品价格',trigger:'blur'}
                 ],
                 goods_weight:[
                     {required:true,message:'请输入商品重量',trigger:'blur'}
                 ],
                 goods_number:[
                     {required:true,message:'请输入商品数量',trigger:'blur'}
                 ],
                 goods_cat:[
                      {required:true,message:'请选择商品分类',trigger:'blur'}
                 ]
            },
            // 商品分类列表数据
            cateList:[],
            // 级联选择器的配置对象
            cateProps:{
                label:'cat_name',
                value:'cat_id',
                children:'children'
            },
            // 动态参数列表数据
            manyTableData:[]

        }
    },
    created(){
        this.getCateList()
    },
    methods:{
        // 获取商品分类列表
       async getCateList(){
         const {data:res} = await this.$http.get('categories')
         if(res.meta.status!==200){
             return this.$message.error('获取商品分类数据失败')
         }
         this.cateList=res.data
        //  console.log(this.cateList)
        },

        // 监听级联选择器的改变
        handleChange(){
            // console.log(this.goods_cat)
            if(this.goods_cat.length!==3){
                this.addForm.goods_cat=[]
            }
        },
        // 当tab面板为0且级联选择不是3级标签时，应当阻止面板切换
        beforeTabLeave(activeName,oldActiveName){
            if(oldActiveName==='0' && this.addForm.goods_cat.length!==3){
                this.$message.error('请先选择商品分类')
                // 阻止面板切换
                return false
            }
        },
        // 切换面板
       async tabClicked(){
        //    证明访问的是动态参数面板
            if(this.activeIndex==='1'){
                const {data:res}=await this.$http.get(`categories/${this.cateId}/attributes`,{params:{sel:'many'}})
                if(res.meta.status!==200){
                    return this.$message.error('获取动态参数数据失败')
                }
                res.data.forEach(item=>{
                    item.attr_vals=item.attr_vals.length===0?[]:item.attr_vals.split(' ')
                })
                this.manyTableData=res.data
                // console.log(this.manyTableData)
            }
        }
    },
    computed:{
        cateId(){
            if(this.addForm.goods_cat.length===3){
                return this.addForm.goods_cat[2]
            }
            return null
        }
    }
}
</script>

<style >
    .el-steps{
        margin: 15px 0;
    }
    .el-step__title{
        font-size: 12px!important;
    }
    .el-checkbox{
        margin: 0 10px 0 0!important;
    }
</style>