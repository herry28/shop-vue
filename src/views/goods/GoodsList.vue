<template>
  <div>
        <!-- 面包屑导航区域 -->
     <el-breadcrumb separator-class="el-icon-arrow-right">
        <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
        <el-breadcrumb-item>商品管理</el-breadcrumb-item>
        <el-breadcrumb-item>商品列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图区域 -->
    <el-card>
        <!-- 添加商品区域 -->
        <el-row :gutter="20">
            <el-col :span="8">
                <el-input v-model="queryInfo.query" clearable @clear='getGoodsList'>
                    <el-button slot="append" icon="el-icon-search" @click="getGoodsList"></el-button>
                </el-input>
            </el-col>
            <el-col :span="4">
                <el-button type="primary" @click="goAddPage">添加商品</el-button>
            </el-col>
        </el-row>
           <!-- 商品列表区域 -->
        <el-table :data="goodsList" border stripe>
            <el-table-column type="index"></el-table-column>
            <el-table-column label="商品名称" prop="goods_name"></el-table-column>
            <el-table-column label="商品价格（元）" prop="goods_price" width="95px"></el-table-column>
            <el-table-column label="商品重量" prop="goods_weight" width="70px"></el-table-column>
            <el-table-column label='创建时间' width="140px">
                <template slot-scope="scope">
                    {{scope.row.add_time | dateFormat}}
                </template>
            </el-table-column>
            <el-table-column label="操作" width="130px">
                 <template slot-scope="scope">
                   <el-button type="primary" icon="el-icon-edit" size="mini"></el-button>
                    <el-button type="danger" icon="el-icon-delete" size="mini" @click='removeGoodsById(scope.row.goods_id)'></el-button>
                </template>
            </el-table-column>
          </el-table>
            <!-- 页码区域 -->
            <el-pagination
                @size-change="handleSizeChange"
                @current-change='handleCurrentChange'
                :current-page="queryInfo.pagenum"
                :page-sizes="[5, 10, 15, 20]"
                :page-size="queryInfo.pagesize"
                layout="total, sizes, prev, pager, next, jumper"
                :total="total"
                background="">
            </el-pagination>     
    </el-card> 
  </div> 
</template>

<script>
export default {
    data(){
        return {
            // 查询参数对象
            queryInfo:{
                query:'',
                pagenum:1,
                pagesize:10
            },
            // 商品列表
            goodsList:[],
            // 总数据条数
            total:0
        }
    },
    created(){
        this.getGoodsList()
    },
    methods:{
        // 根据分页获取对应的商品列表
      async  getGoodsList(){
           const {data:res}=await this.$http.get('goods',{params:this.queryInfo})
           if(res.meta.status!==200){
               return this.$message.error('获取商品列表失败')
           }
           this.$message.success('获取商品列表成功')
        //    console.log(res)
        this.goodsList=res.data.goods
        this.total=res.data.total
        },
        // 监听 页码大小
        handleSizeChange(newSize){
            this.queryInfo.pagesize=newSize
            this.getGoodsList()
        },
        // 监听 页码改变事件
        handleCurrentChange(newPage){
            this.queryInfo.pagenum=newPage
            this.getGoodsList()
        },

        // 根据id删除商品
      async  removeGoodsById(id){
              // 弹框询问是否删除用户
        const confirmResult=await this.$confirm('是否删除该用户？','提示',{
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
        const {data:res}=await this.$http.delete('goods/'+id)
        if(res.meta.status!==200){
            return this.$message.error('商品删除失败')
        }
        this.$message.success('商品删除成功')
        this.getGoodsList()
        },

        // 添加商品按钮路由跳转
        goAddPage(){
            this.$router.push('/goods/add')
        }

    }
}
</script>

<style>

</style>