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
                <el-tab-pane label="商品属性" name="2">
                    <el-form-item :label="item.attr_name" 
                        v-for="item in onlyTableData" :key="item.attr_id">
                        <el-input v-model="item.attr_vals"></el-input>
                    </el-form-item>
                </el-tab-pane>
                <el-tab-pane label="商品图片" name="3">
                    <!-- 图片上传区域 -->
                    <el-upload :action="uploadUrl"
                        :headers="headerObj" 
                        :on-success="handleSuccess"
                        :on-preview="handlePreview" 
                        :on-remove="handleRemove" 
                        list-type="picture">
                        <el-button size="mini" type="primary">点我上传</el-button>
                    </el-upload>
                </el-tab-pane>
                <el-tab-pane label="商品内容" name="4">
                    <!-- 富文本编辑器组件区域 -->
                    <quill-editor v-model="addForm.goods_introduce">
                    </quill-editor>
                    <!-- 添加商品的按钮 -->
                    <el-button type="primary" class="addBtn" @click="add">添加商品</el-button>
                </el-tab-pane>
            </el-tabs>
        </el-form>   
    </el-card>


    <!-- 图片预览的对话框 -->
    <el-dialog title="图片预览" :visible.sync="previewVisible" width="50%">
        <img :src="previewUrl" class="previewImg">
    </el-dialog>
    </div>
</template>

<script>
// 导入lodash（深拷贝）
import _ from 'lodash'

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
                goods_cat:[],
                // 图片数组
                pics:[],
                // 商品简介
                goods_introduce:'',
                //属性数组
                attrs:[]
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
            manyTableData:[],
              // 静态属性面板数据
            onlyTableData:[],

            // 图片上传的地址
            uploadUrl:'https://www.liulongbin.top:8888/api/private/v1/upload',
            // 图片上传组件的请求头对象
            headerObj:{
                Authorization:window.sessionStorage.getItem('token')
            },
            // 图片预览的地址
            previewUrl:'',
            // 控制图片预览对话框的显示与隐藏
            previewVisible:false

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
            }else if(this.activeIndex==='2'){
                 const {data:res}=await this.$http.get(`categories/${this.cateId}/attributes`,{params:{sel:'only'}})
                if(res.meta.status!==200){
                    return this.$message.error('获取静态属性数据失败')
                }
                this.onlyTableData=res.data
            }
        },

        // 处理图片预览
        handlePreview(file){
            this.previewUrl=file.response.data.url
            this.previewVisible=true
        },
          // 处理移除图片的操作
        handleRemove(file){
            // console.log(file)
            // 1.获取将要删除的图片的临时路径
            const filePath=file.response.dta.tmp_path
            // 2.从pics数组中，找到这个图片对应的索引值
            const i=this.addForm.pics.findIndex(v=>v.pic===filePath)
            // 3.调用数组的splice()
            this.addForm.pics.splice(i,1)
        },
         // 处理图片上传成功的的操作
        handleSuccess(response){
            // 1.拼接得到一个图片信息对象
            const picInfo={pic:response.data.tmp_path}
            // 2.将图片信息对象push到pics数组中
            this.addForm.pics.push(picInfo)
            console.log(this.addForm)
        },
        // 添加商品
        add(){
            // 表单预校验
            this.$refs.addFormRef.validate(async valid=>{
                if(!valid){
                    return this.$message.error('请填写必要的表单项')
                }
                // 执行添加的业务逻辑
                // 1.加工请求参数lodash cloneDeep()
                const form = _.cloneDeep(this.addForm)
                form.goods_cat=form.goods_cat.join(',')
                // 2.处理动态参数
                this.manyTableData.forEach(item=>{
                    const newInfo={
                        attr_id:item.attr_id,
                        attr_value:item.attr_vals.join(' ')
                    }
                    this.addForm.attrs.push(newInfo)
                })
                // 3.处理静态属性
                 this.onlyTableData.forEach(item=>{
                    const newInfo={
                        attr_id:item.attr_id,
                        attr_value:item.attr_vals
                    }
                    this.addForm.attrs.push(newInfo)
                })
                form.attrs=this.addForm.attrs
                // console.log(form)
                //4.发起请求，添加商品
                const {data:res} = await this.$http.post('goods',form)
                if(res.meta.status!==201){
                    return this.$message.error('添加商品失败')
                }
                this.$message.success('添加商品成功')
                // 跳转到商品列表页面
                this.$router.push('/goods')
            })
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
    .previewImg{
        width: 100%;
    }
    .ql-editor{
        min-height: 300px!important;
    }
    .addBtn{
        margin-top: 15px!important;
    }
</style>